import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_ROLES = ['client', 'staff'];

function validateEmail(email: string): boolean {
  return typeof email === 'string' && 
         email.length <= 254 && 
         EMAIL_REGEX.test(email.trim());
}

function validateUUID(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

function validateRole(role: string): boolean {
  return typeof role === 'string' && VALID_ROLES.includes(role);
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password must be a string' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }
  return { valid: true };
}

function validateFullName(name: string): { valid: boolean; message?: string } {
  if (typeof name !== 'string') {
    return { valid: false, message: 'Full name must be a string' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: 'Full name cannot be empty' };
  }
  if (trimmed.length > 100) {
    return { valid: false, message: 'Full name must be less than 100 characters' };
  }
  return { valid: true };
}

// Sanitize string inputs
function sanitizeName(name: string): string {
  return name.trim().substring(0, 100);
}

// Helper function to log activity
async function logActivity(
  supabaseAdmin: any,
  userId: string | null,
  userEmail: string | null,
  activityType: string,
  description: string,
  metadata: Record<string, unknown> = {},
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
  } catch {
    // Activity logging failed silently - non-critical
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
        JSON.stringify({ error: "Authorization required" }),
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
        JSON.stringify({ error: "Staff access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, ...payload } = body;

    switch (action) {
      case "create_user": {
        const { email, password, fullName, role } = payload;

        // Validate required fields
        if (!email || !password || !fullName || !role) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate email format
        if (!validateEmail(email)) {
          return new Response(
            JSON.stringify({ error: "Invalid email format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          return new Response(
            JSON.stringify({ error: passwordValidation.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate full name
        const nameValidation = validateFullName(fullName);
        if (!nameValidation.valid) {
          return new Response(
            JSON.stringify({ error: nameValidation.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate role
        if (!validateRole(role)) {
          return new Response(
            JSON.stringify({ error: "Invalid role. Must be 'client' or 'staff'" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const sanitizedName = sanitizeName(fullName);
        const sanitizedEmail = email.trim().toLowerCase();

        // Create user with admin client
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: sanitizedEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: sanitizedName },
        });

        if (createError) {
          const isEmailExists = createError.message?.toLowerCase().includes('email') || 
                               createError.message?.toLowerCase().includes('exists');
          return new Response(
            JSON.stringify({ error: isEmailExists ? "Email already in use" : "Failed to create user" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Assign role (use upsert to handle case where trigger already created a role)
        const { error: roleAssignError } = await supabaseAdmin
          .from("user_roles")
          .upsert(
            { user_id: newUser.user.id, role },
            { onConflict: 'user_id,role', ignoreDuplicates: true }
          );

        if (roleAssignError) {
          // Rollback: delete the user if role assignment fails
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
          return new Response(
            JSON.stringify({ error: "Failed to complete user setup" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the activity
        await logActivity(
          supabaseAdmin,
          currentUser.id,
          currentUser.email || null,
          "user_created",
          `Created new ${role} user: ${sanitizedEmail}`,
          { 
            created_user_id: newUser.user.id, 
            created_user_email: sanitizedEmail,
            created_user_name: sanitizedName,
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
            JSON.stringify({ error: "Failed to retrieve users" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get roles for all users
        const { data: roles, error: rolesError } = await supabaseAdmin
          .from("user_roles")
          .select("user_id, role");

        if (rolesError) {
          return new Response(
            JSON.stringify({ error: "Failed to retrieve user roles" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get profiles for all users (including access_tier)
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email, access_tier");

        const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const usersWithRoles = users.users.map(user => ({
          id: user.id,
          email: user.email,
          fullName: profilesMap.get(user.id)?.full_name || user.user_metadata?.full_name || '',
          role: rolesMap.get(user.id) || null,
          accessTier: profilesMap.get(user.id)?.access_tier || 'full',
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

        // Validate inputs
        if (!userId || !role) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!validateUUID(userId)) {
          return new Response(
            JSON.stringify({ error: "Invalid user ID format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!validateRole(role)) {
          return new Response(
            JSON.stringify({ error: "Invalid role. Must be 'client' or 'staff'" }),
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
            JSON.stringify({ error: "Failed to update user role" }),
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

      case "update_access_tier": {
        const { userId, accessTier } = payload;

        // Validate inputs
        if (!userId || !accessTier) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!validateUUID(userId)) {
          return new Response(
            JSON.stringify({ error: "Invalid user ID format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const validTiers = ['demo', 'full'];
        if (!validTiers.includes(accessTier)) {
          return new Response(
            JSON.stringify({ error: "Invalid access tier. Must be 'demo' or 'full'" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user info for logging
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const { data: previousProfile } = await supabaseAdmin
          .from("profiles")
          .select("access_tier")
          .eq("id", userId)
          .maybeSingle();

        const previousTier = previousProfile?.access_tier || 'full';

        // Update access tier in profiles
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ access_tier: accessTier })
          .eq("id", userId);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update access tier" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the activity
        await logActivity(
          supabaseAdmin,
          currentUser.id,
          currentUser.email || null,
          "role_changed",
          `Changed access tier for ${userData?.user?.email} from ${previousTier} to ${accessTier}`,
          { 
            target_user_id: userId, 
            target_user_email: userData?.user?.email,
            previous_access_tier: previousTier,
            new_access_tier: accessTier 
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

        if (!validateUUID(userId)) {
          return new Response(
            JSON.stringify({ error: "Invalid user ID format" }),
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
            JSON.stringify({ error: "Failed to delete user" }),
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
        const { userId, newPassword: providedPassword } = payload;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: "Missing user ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!validateUUID(userId)) {
          return new Response(
            JSON.stringify({ error: "Invalid user ID format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate a cryptographically secure password on the server
        // This avoids the "pwned" issue by using truly random characters
        const generateSecurePassword = (): string => {
          const upperCase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
          const lowerCase = 'abcdefghjkmnpqrstuvwxyz';
          const numbers = '23456789';
          const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
          
          const allChars = upperCase + lowerCase + numbers + special;
          const randomBytes = new Uint8Array(20);
          crypto.getRandomValues(randomBytes);
          
          // Ensure at least one of each type using first 4 random bytes
          let password = '';
          password += upperCase[randomBytes[0] % upperCase.length];
          password += lowerCase[randomBytes[1] % lowerCase.length];
          password += numbers[randomBytes[2] % numbers.length];
          password += special[randomBytes[3] % special.length];
          
          // Fill remaining 16 characters
          for (let i = 4; i < 20; i++) {
            password += allChars[randomBytes[i] % allChars.length];
          }
          
          // Shuffle using Fisher-Yates algorithm with crypto randomness
          const shuffleBytes = new Uint8Array(password.length);
          crypto.getRandomValues(shuffleBytes);
          const arr = password.split('');
          for (let i = arr.length - 1; i > 0; i--) {
            const j = shuffleBytes[i] % (i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr.join('');
        };

        // Get user info for logging (before attempting password reset)
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);

        // Use provided password or generate a secure one with retry logic
        let passwordToSet: string = '';
        let updateError: any = null;
        const maxRetries = 5;
        
        if (providedPassword && typeof providedPassword === 'string') {
          const passwordValidation = validatePassword(providedPassword);
          if (!passwordValidation.valid) {
            return new Response(
              JSON.stringify({ error: passwordValidation.message }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          passwordToSet = providedPassword;
          
          // Try once with provided password
          const result = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: passwordToSet,
          });
          updateError = result.error;
          
          if (updateError) {
            const errorMessage = updateError.message?.includes('weak') || updateError.code === 'weak_password'
              ? "The provided password was rejected as weak or compromised. Please try a different password."
              : "Failed to reset password";
            return new Response(
              JSON.stringify({ error: errorMessage }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          // Generate password with retry logic for HIBP rejections
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            passwordToSet = generateSecurePassword();
            
            const result = await supabaseAdmin.auth.admin.updateUserById(userId, {
              password: passwordToSet,
            });
            updateError = result.error;
            
            if (!updateError) {
              // Success!
              break;
            }
            
            // If it's a weak/pwned password error, try again with a new password
            if (updateError.code === 'weak_password' || updateError.message?.includes('weak') || updateError.message?.includes('pwned')) {
              // Retrying with new password - production silent
              continue;
            }
            
            // For other errors, don't retry
            break;
          }
          
          if (updateError) {
            const errorMessage = updateError.code === 'weak_password' || updateError.message?.includes('weak')
              ? "Unable to generate an acceptable password after multiple attempts. Please try again."
              : "Failed to reset password";
            return new Response(
              JSON.stringify({ error: errorMessage }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
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
          JSON.stringify({ success: true, generatedPassword: passwordToSet }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_activity_logs": {
        const { limit = 100, offset = 0, activityType, userId: filterUserId } = payload;

        // Validate limit and offset
        const safeLimit = Math.min(Math.max(1, Number(limit) || 100), 500);
        const safeOffset = Math.max(0, Number(offset) || 0);

        let query = supabaseAdmin
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .range(safeOffset, safeOffset + safeLimit - 1);

        if (activityType && typeof activityType === 'string') {
          query = query.eq("activity_type", activityType);
        }

        if (filterUserId && validateUUID(filterUserId)) {
          query = query.eq("user_id", filterUserId);
        }

        const { data: logs, error: logsError } = await query;

        if (logsError) {
          return new Response(
            JSON.stringify({ error: "Failed to retrieve activity logs" }),
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

        // Validate activity type is a non-empty string
        if (!activityType || typeof activityType !== 'string' || activityType.length > 50) {
          return new Response(
            JSON.stringify({ error: "Invalid activity type" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate description
        if (!description || typeof description !== 'string' || description.length > 500) {
          return new Response(
            JSON.stringify({ error: "Invalid description" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await logActivity(
          supabaseAdmin,
          targetUserId && validateUUID(targetUserId) ? targetUserId : currentUser.id,
          typeof targetUserEmail === 'string' ? targetUserEmail.substring(0, 254) : (currentUser.email || null),
          activityType,
          description.substring(0, 500),
          metadata && typeof metadata === 'object' ? metadata : {},
          req
        );

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "approve_access_request": {
        const { email, fullName, company, requestId } = payload;

        // Validate required fields
        if (!email || !fullName || !requestId) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate email format
        if (!validateEmail(email)) {
          return new Response(
            JSON.stringify({ error: "Invalid email format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate full name
        const nameValidation = validateFullName(fullName);
        if (!nameValidation.valid) {
          return new Response(
            JSON.stringify({ error: nameValidation.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const sanitizedName = sanitizeName(fullName);
        const sanitizedEmail = email.trim().toLowerCase();
        const sanitizedCompany = company ? company.trim().substring(0, 200) : '';

        // Generate a random temporary password (user will set their own via magic link)
        const tempPassword = crypto.randomUUID() + crypto.randomUUID();

        // Create user with admin client
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: sanitizedEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: sanitizedName, company: sanitizedCompany },
        });

        if (createError) {
          const isEmailExists = createError.message?.toLowerCase().includes('email') || 
                               createError.message?.toLowerCase().includes('exists');
          return new Response(
            JSON.stringify({ error: isEmailExists ? "Email already in use" : "Failed to create user" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Assign client role (use upsert to handle case where trigger already created the role)
        const { error: roleAssignError } = await supabaseAdmin
          .from("user_roles")
          .upsert(
            { user_id: newUser.user.id, role: 'client' },
            { onConflict: 'user_id,role', ignoreDuplicates: true }
          );

        if (roleAssignError) {
          // Rollback: delete the user if role assignment fails
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
          return new Response(
            JSON.stringify({ error: "Failed to complete user setup" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Set access_tier to 'demo' for users created through access request approval
        const { error: tierError } = await supabaseAdmin
          .from("profiles")
          .update({ access_tier: 'demo' })
          .eq("id", newUser.user.id);

        if (tierError) {
          // Non-fatal - continue with approval (logging removed for production)
        }

        // Update access request status
        const { error: updateError } = await supabaseAdmin
          .from("access_requests")
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString(),
            reviewed_by: currentUser.id,
          })
          .eq("id", requestId);

        if (updateError) {
          // Non-critical error - continue with user creation (logging removed)
        }

        // Generate magic link for password setup
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: sanitizedEmail,
          options: {
            redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/client-login?setup=true`,
          },
        });

        if (linkError) {
          // User was created but link generation failed - still success
        }

        // Send approval email with magic link
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY && linkData?.properties?.action_link) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "Dalil Platform <noreply@dalil.me>",
                to: [sanitizedEmail],
                subject: "Your Dalil Access Has Been Approved!",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #1a1a2e;">Welcome to Dalil, ${sanitizedName}!</h1>
                    <p>Great news! Your access request has been approved.</p>
                    
                    <p>Click the button below to set up your password and access the platform:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${linkData.properties.action_link}" 
                         style="background-color: #1a1a2e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                        Set Up My Password
                      </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If it expires, please contact us for a new link.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="color: #666; font-size: 12px;">Dalil by Invesense Asset Management</p>
                  </div>
                `,
              }),
            });
            // Email sent successfully
          } catch {
            // Email sending failed - non-critical, user was still created
          }
        }

        // Log the activity
        await logActivity(
          supabaseAdmin,
          currentUser.id,
          currentUser.email || null,
          "user_created",
          `Approved access request and created client account: ${sanitizedEmail}`,
          { 
            created_user_id: newUser.user.id, 
            created_user_email: sanitizedEmail,
            created_user_name: sanitizedName,
            company: sanitizedCompany,
            assigned_role: 'client',
            access_request_id: requestId,
          },
          req
        );

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: { id: newUser.user.id, email: newUser.user.email },
            emailSent: !!RESEND_API_KEY && !!linkData?.properties?.action_link,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
