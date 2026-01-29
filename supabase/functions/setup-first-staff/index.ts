import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateEmail(email: string): boolean {
  return typeof email === 'string' && 
         email.length <= 254 && 
         EMAIL_REGEX.test(email.trim());
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

// Sanitize name to prevent injection
function sanitizeName(name: string): string {
  return name.trim().substring(0, 100);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Use a transaction-like approach: First try to insert a lock record
    // Check if any staff users already exist using a count for race condition protection
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: 'exact', head: true })
      .eq("role", "staff");

    if (countError) {
      console.error("Error checking existing staff:", countError);
      return new Response(
        JSON.stringify({ error: "Unable to verify staff status. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (count && count > 0) {
      return new Response(
        JSON.stringify({ error: "Staff user already exists. Use the Staff Portal to create more users." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    const { email, password, fullName } = body;

    // Validate all inputs
    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, password, fullName" }),
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

    const sanitizedName = sanitizeName(fullName);
    const sanitizedEmail = email.trim().toLowerCase();

    console.log("Creating first staff user");

    // Double-check no staff exists right before creation (race condition mitigation)
    const { count: finalCount } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: 'exact', head: true })
      .eq("role", "staff");

    if (finalCount && finalCount > 0) {
      return new Response(
        JSON.stringify({ error: "Staff user already exists. Use the Staff Portal to create more users." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user with admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: sanitizedName },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      // Return generic error message, don't expose internal details
      const isEmailExists = createError.message?.toLowerCase().includes('email') || 
                           createError.message?.toLowerCase().includes('exists');
      return new Response(
        JSON.stringify({ error: isEmailExists ? "Email already in use" : "Failed to create user. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User created, assigning staff role");

    // Assign staff role - unique index prevents race conditions at database level
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "staff" });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Rollback: delete the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      // Check if this is a unique constraint violation (race condition caught by database)
      const isUniqueViolation = roleError.code === '23505' || 
                                roleError.message?.toLowerCase().includes('duplicate') ||
                                roleError.message?.toLowerCase().includes('unique');
      
      return new Response(
        JSON.stringify({ 
          error: isUniqueViolation 
            ? "Staff user already exists. Use the Staff Portal to create more users."
            : "Failed to complete user setup. Please try again." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("First staff user created successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "First staff user created successfully. You can now login at /staff-login" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Setup error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
