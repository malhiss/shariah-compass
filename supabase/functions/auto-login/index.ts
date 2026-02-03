import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_ATTEMPTS_PER_IP = 10; // Max 10 attempts per IP per minute

// In-memory rate limiting (resets on cold start, but provides protection during active use)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function getClientIP(req: Request): string {
  // Try various headers for the real IP
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  const xForwardedFor = req.headers.get("x-forwarded-for");
  const xRealIP = req.headers.get("x-real-ip");
  
  if (cfConnectingIP) return cfConnectingIP;
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();
  if (xRealIP) return xRealIP;
  
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window or expired window
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }
  
  if (entry.count >= MAX_ATTEMPTS_PER_IP) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  }
  
  entry.count++;
  return { allowed: true };
}

// Clean up old entries periodically (every 100 requests)
let requestCount = 0;
function cleanupRateLimitMap() {
  requestCount++;
  if (requestCount % 100 === 0) {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitMap.delete(ip);
      }
    }
  }
}

serve(async (req) => {
  // Get CORS headers for this request
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsOptions(req);
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimitResult = checkRateLimit(clientIP);
    cleanupRateLimitMap();
    
    if (!rateLimitResult.allowed) {
      // Log rate limit hit without exposing sensitive data
      console.warn(`Rate limit exceeded for IP hash: ${clientIP.slice(0, 8)}***`);
      
      const retryAfterSeconds = Math.ceil((rateLimitResult.retryAfterMs || 60000) / 1000);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSeconds),
          } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use anon client for the SECURITY DEFINER function call
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    // Use admin client only for generating magic link and logging
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

    // Use SECURITY DEFINER function to validate and consume the token
    // This avoids direct table access and is more secure
    const { data: tokenData, error: tokenError } = await supabaseAnon
      .rpc("validate_login_token", { token_value: token });

    if (tokenError) {
      return new Response(
        JSON.stringify({ error: "Token validation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token was valid (function returns empty array if invalid)
    if (!tokenData || tokenData.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedToken = tokenData[0];

    // Generate a magic link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: validatedToken.email,
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

    // Log the login activity (using admin client for RLS bypass on activity_logs)
    try {
      await supabaseAdmin.from("activity_logs").insert({
        user_id: validatedToken.user_id,
        user_email: validatedToken.email,
        activity_type: "login_success",
        description: `Auto-login via one-time token`,
        metadata: { method: "one_time_token" },
        ip_address: clientIP !== "unknown" ? clientIP : null,
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
        email: validatedToken.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
