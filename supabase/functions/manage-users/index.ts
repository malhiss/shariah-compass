import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

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
  // Get CORS headers for this request (origin-restricted)
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsOptions(req);
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

        // Generate a secure password for the user
        const generateSecurePassword = (): string => {
          const upperCase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
          const lowerCase = 'abcdefghjkmnpqrstuvwxyz';
          const numbers = '23456789';
          const special = '!@#$%^&*';
          
          const allChars = upperCase + lowerCase + numbers + special;
          const randomBytes = new Uint8Array(16);
          crypto.getRandomValues(randomBytes);
          
          // Ensure at least one of each type
          let password = '';
          password += upperCase[randomBytes[0] % upperCase.length];
          password += lowerCase[randomBytes[1] % lowerCase.length];
          password += numbers[randomBytes[2] % numbers.length];
          password += special[randomBytes[3] % special.length];
          
          // Fill remaining 12 characters
          for (let i = 4; i < 16; i++) {
            password += allChars[randomBytes[i] % allChars.length];
          }
          
          // Shuffle
          const shuffleBytes = new Uint8Array(password.length);
          crypto.getRandomValues(shuffleBytes);
          const arr = password.split('');
          for (let i = arr.length - 1; i > 0; i--) {
            const j = shuffleBytes[i] % (i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr.join('');
        };

        // Try to create user with generated password (retry if HIBP rejection)
        let generatedPassword = '';
        let newUser: any = null;
        let createError: any = null;
        const maxRetries = 5;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          generatedPassword = generateSecurePassword();
          
          const result = await supabaseAdmin.auth.admin.createUser({
            email: sanitizedEmail,
            password: generatedPassword,
            email_confirm: true,
            user_metadata: { full_name: sanitizedName, company: sanitizedCompany },
          });
          
          createError = result.error;
          newUser = result.data;
          
          if (!createError) break;
          
          // If it's a weak/pwned password error, retry
          if (createError.code === 'weak_password' || createError.message?.includes('weak') || createError.message?.includes('pwned')) {
            continue;
          }
          
          // For other errors (like email exists), don't retry
          break;
        }

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
          // Non-fatal - continue with approval
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
          // Non-critical error - continue with user creation
        }

        // Generate a one-time login token
        const generateLoginToken = (): string => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
          const randomBytes = new Uint8Array(48);
          crypto.getRandomValues(randomBytes);
          return Array.from(randomBytes)
            .map(b => chars[b % chars.length])
            .join('');
        };

        const loginToken = generateLoginToken();
        const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Store the login token
        await supabaseAdmin
          .from("login_tokens")
          .insert({
            user_id: newUser.user.id,
            email: sanitizedEmail,
            token: loginToken,
            expires_at: tokenExpiresAt.toISOString(),
          });

        // Send welcome email with one-click login
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        let emailSent = false;
        
        if (RESEND_API_KEY) {
          try {
            const loginUrl = `https://dalil.me/demo/login?token=${loginToken}`;
            const manualLoginUrl = "https://dalil.me/demo/login";
            
            // Professional HTML email with proper structure for better deliverability
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Dalil</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1a1a2e;">Welcome to Dalil</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">Dear ${sanitizedName},</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">We are pleased to inform you that your access request to the Dalil Shariah Screening Platform has been approved.</p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background-color: #1a1a2e; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">Access Your Account</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 30px 0; font-size: 14px; line-height: 1.5; color: #6b7280; text-align: center;">This secure link will log you in automatically and is valid for 7 days.</p>
              
              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
              
              <!-- Manual Login Section -->
              <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.5; color: #6b7280;">If the button above does not work, you may log in manually at <a href="${manualLoginUrl}" style="color: #1a1a2e; text-decoration: underline;">dalil.me/demo/login</a> using the following credentials:</p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; margin: 15px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;"><strong>Email:</strong> ${sanitizedEmail}</p>
                    <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px;">${generatedPassword}</code></p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.5; color: #6b7280;">We recommend changing your password after your first login for security purposes.</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af;">Dalil Shariah Screening Platform</p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">Invesense Asset Management</p>
            </td>
          </tr>
        </table>
        
        <!-- Unsubscribe/Privacy Note -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">This is a transactional email regarding your account access. If you did not request access to Dalil, please disregard this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

            // Plain text version for email clients that prefer it
            const textContent = `Welcome to Dalil

Dear ${sanitizedName},

We are pleased to inform you that your access request to the Dalil Shariah Screening Platform has been approved.

ACCESS YOUR ACCOUNT
Click here to log in: ${loginUrl}
This secure link is valid for 7 days.

MANUAL LOGIN
If the link above does not work, visit: ${manualLoginUrl}

Your credentials:
Email: ${sanitizedEmail}
Password: ${generatedPassword}

We recommend changing your password after your first login.

---
Dalil Shariah Screening Platform
Invesense Asset Management

This is a transactional email regarding your account access.`;

            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "Dalil Platform <noreply@dalil.me>",
                reply_to: "support@dalil.me",
                to: [sanitizedEmail],
                subject: `Your Dalil Access Request Has Been Approved`,
                html: htmlContent,
                text: textContent,
                headers: {
                  "X-Entity-Ref-ID": newUser.user.id,
                },
              }),
            });
            
            if (emailResponse.ok) {
              emailSent = true;
            }
          } catch {
            // Email sending failed - non-critical
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
            emailSent,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_my_activity_logs": {
        // This action allows any authenticated user to get their OWN activity logs
        // No staff check required - users can only see their own data
        const { limit = 100, activityType } = payload;

        // Validate limit
        const safeLimit = Math.min(Math.max(1, Number(limit) || 100), 100);

        // Only select non-sensitive fields (exclude ip_address, user_agent)
        let query = supabaseAdmin
          .from("activity_logs")
          .select("id, user_id, user_email, activity_type, description, metadata, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(safeLimit);

        // Filter to only client-relevant activity types
        const clientActivityTypes = ['ticker_screening', 'portfolio_screening', 'screening_request', 'ai_chat'];
        
        if (activityType && typeof activityType === 'string' && clientActivityTypes.includes(activityType)) {
          query = query.eq("activity_type", activityType);
        } else {
          // Default: only show client-relevant activities
          query = query.in("activity_type", clientActivityTypes);
        }

        const { data: logs, error: logsError } = await query;

        if (logsError) {
          return new Response(
            JSON.stringify({ error: "Failed to retrieve activity logs" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get counts by type for stats
        const { data: allLogs } = await supabaseAdmin
          .from("activity_logs")
          .select("activity_type")
          .eq("user_id", currentUser.id)
          .in("activity_type", clientActivityTypes);

        const tickerScreenings = allLogs?.filter(l => l.activity_type === 'ticker_screening').length || 0;
        const portfolioScreenings = allLogs?.filter(l => l.activity_type === 'portfolio_screening').length || 0;
        const aiChats = allLogs?.filter(l => l.activity_type === 'ai_chat').length || 0;

        return new Response(
          JSON.stringify({ 
            logs, 
            stats: {
              totalScreenings: tickerScreenings + portfolioScreenings,
              tickerScreenings,
              portfolioScreenings,
              aiChats,
            }
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
