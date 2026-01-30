import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

serve(async (req) => {
  // Get CORS headers for this request
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsOptions(req);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { token } = body;

    if (!token || typeof token !== "string" || token.length > 128) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up the token
    const { data: loginToken, error: lookupError } = await supabaseAdmin
      .from("login_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (lookupError || !loginToken) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (new Date(loginToken.expires_at) < new Date()) {
      // Delete expired token
      await supabaseAdmin
        .from("login_tokens")
        .delete()
        .eq("id", loginToken.id);

      return new Response(
        JSON.stringify({ error: "Token has expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token was already used
    if (loginToken.used_at) {
      return new Response(
        JSON.stringify({ error: "Token has already been used" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from("login_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", loginToken.id);

    // Generate a magic link for the user (using the user_id from the token)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: loginToken.email,
    });

    if (linkError || !linkData) {
      return new Response(
        JSON.stringify({ error: "Failed to generate login link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the magic link
    const url = new URL(linkData.properties.action_link);
    const authToken = url.searchParams.get("token");
    const tokenType = url.searchParams.get("type");
    const tokenHash = url.hash;

    // Log the login activity
    try {
      await supabaseAdmin.from("activity_logs").insert({
        user_id: loginToken.user_id,
        user_email: loginToken.email,
        activity_type: "login_success",
        description: `Auto-login via one-time token`,
        metadata: { method: "one_time_token" },
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
        user_agent: req.headers.get("user-agent") || null,
      });
    } catch {
      // Non-critical
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        token: authToken,
        type: tokenType,
        hash: tokenHash,
        email: loginToken.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const corsHeaders = getCorsHeaders(req);
    console.error("Auto-login error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
