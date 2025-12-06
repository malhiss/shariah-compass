import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to log activity
async function logActivity(
  supabaseAdmin: any,
  userId: string | null,
  userEmail: string | null,
  activityType: string,
  description: string,
  metadata: Record<string, any> = {},
  req?: Request
) {
  try {
    await supabaseAdmin.from("activity_logs").insert({
      user_id: userId,
      user_email: userEmail,
      activity_type: activityType,
      description,
      metadata,
      ip_address: req?.headers.get("x-forwarded-for") || req?.headers.get("x-real-ip") || null,
      user_agent: req?.headers.get("user-agent") || null,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create admin client for user management
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create client with user's auth to verify staff role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !currentUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if current user is staff
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .eq("role", "staff")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Staff access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, ...payload } = await req.json();

    switch (action) {
      case "create_user": {
        const { email, password, fullName, role } = payload;

        if (!email || !password || !fullName || !role) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create user with admin client
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Assign role
        const { error: roleAssignError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: newUser.user.id, role });

        if (roleAssignError) {
          // Rollback: delete the user if role assignment fails
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
          return new Response(
            JSON.stringify({ error: "Failed to assign role: " + roleAssignError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the activity
        await logActivity(
          supabaseAdmin,
          currentUser.id,
          currentUser.email || null,
          "user_created",
          `Created new ${role} user: ${email}`,
          { 
            created_user_id: newUser.user.id, 
            created_user_email: email,
            created_user_name: fullName,
            assigned_role: role 
          },
          req
        );

        return new Response(
          JSON.stringify({ success: true, user: { id: newUser.user.id, email: newUser.user.email } }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list_users": {
        // Get all users with roles
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          return new Response(
            JSON.stringify({ error: listError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get roles for all users
        const { data: roles, error: rolesError } = await supabaseAdmin
          .from("user_roles")
          .select("user_id, role");

        if (rolesError) {
          return new Response(
            JSON.stringify({ error: rolesError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get profiles for all users
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email");

        const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const usersWithRoles = users.users.map(user => ({
          id: user.id,
          email: user.email,
          fullName: profilesMap.get(user.id)?.full_name || user.user_metadata?.full_name || '',
          role: rolesMap.get(user.id) || null,
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in_at,
        }));

        return new Response(
          JSON.stringify({ users: usersWithRoles }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_user_role": {
        const { userId, role } = payload;

        if (!userId || !role) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user info for logging
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const previousRole = (await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).maybeSingle())?.data?.role;

        // Delete existing role
        await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        // Insert new role
        const { error: insertError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: userId, role });

        if (insertError) {
          return new Response(
            JSON.stringify({ error: insertError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the activity
        await logActivity(
          supabaseAdmin,
          currentUser.id,
          currentUser.email || null,
          "role_changed",
          `Changed role for ${userData?.user?.email} from ${previousRole || 'none'} to ${role}`,
          { 
            target_user_id: userId, 
            target_user_email: userData?.user?.email,
            previous_role: previousRole,
            new_role: role 
          },
          req
        );

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete_user": {
        const { userId } = payload;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: "Missing user ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prevent self-deletion
        if (userId === currentUser.id) {
          return new Response(
            JSON.stringify({ error: "Cannot delete your own account" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user info for logging before deletion
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the activity
        await logActivity(
          supabaseAdmin,
          currentUser.id,
          currentUser.email || null,
          "user_deleted",
          `Deleted user: ${userData?.user?.email}`,
          { 
            deleted_user_id: userId, 
            deleted_user_email: userData?.user?.email 
          },
          req
        );

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reset_password": {
        const { userId, newPassword } = payload;

        if (!userId || !newPassword) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user info for logging
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: newPassword,
        });

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the activity
        await logActivity(
          supabaseAdmin,
          currentUser.id,
          currentUser.email || null,
          "password_reset",
          `Reset password for user: ${userData?.user?.email}`,
          { 
            target_user_id: userId, 
            target_user_email: userData?.user?.email 
          },
          req
        );

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_activity_logs": {
        const { limit = 100, offset = 0, activityType, userId: filterUserId } = payload;

        let query = supabaseAdmin
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (activityType) {
          query = query.eq("activity_type", activityType);
        }

        if (filterUserId) {
          query = query.eq("user_id", filterUserId);
        }

        const { data: logs, error: logsError } = await query;

        if (logsError) {
          return new Response(
            JSON.stringify({ error: logsError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get total count
        const { count } = await supabaseAdmin
          .from("activity_logs")
          .select("*", { count: "exact", head: true });

        return new Response(
          JSON.stringify({ logs, total: count }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "log_activity": {
        // This action allows logging activities from the frontend
        const { activityType, description, metadata, targetUserId, targetUserEmail } = payload;

        await logActivity(
          supabaseAdmin,
          targetUserId || currentUser.id,
          targetUserEmail || currentUser.email,
          activityType,
          description,
          metadata || {},
          req
        );

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
