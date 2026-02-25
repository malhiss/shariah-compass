import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface AccessRequestNotification {
  fullName: string;
  company: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return handleCorsOptions(req);
  }

  // Authenticate the request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { fullName, company, email }: AccessRequestNotification = await req.json();

    if (!fullName || !company || !email) {
      throw new Error("Missing required fields");
    }

    // Sanitize inputs
    const sanitizedName = fullName.slice(0, 100).replace(/[<>]/g, "");
    const sanitizedCompany = company.slice(0, 100).replace(/[<>]/g, "");
    const sanitizedEmail = email.slice(0, 255).toLowerCase();

    // Load staff notification emails from environment secret
    const staffEmailsEnv = Deno.env.get("STAFF_NOTIFICATION_EMAILS");
    const STAFF_NOTIFICATION_EMAILS = staffEmailsEnv
      ? staffEmailsEnv.split(",").map((e: string) => e.trim()).filter(Boolean)
      : [];

    if (STAFF_NOTIFICATION_EMAILS.length === 0) {
      throw new Error("No staff notification emails configured");
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">New Access Request</h1>
        <p>A new access request has been submitted on the Dalil platform:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Company:</strong> ${sanitizedCompany}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
        </div>
        
        <p>Please review this request in the <a href="https://dalil.me/staff-portal" style="color: #0066cc;">Staff Portal</a>.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">This is an automated notification from Dalil by Invesense Asset Management.</p>
      </div>
    `;

    const results = [];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < STAFF_NOTIFICATION_EMAILS.length; i++) {
      const recipientEmail = STAFF_NOTIFICATION_EMAILS[i];

      if (i > 0) {
        await delay(600);
      }

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Dalil Platform <noreply@dalil.me>",
            to: [recipientEmail],
            subject: `New Access Request: ${sanitizedName} from ${sanitizedCompany}`,
            html: emailHtml,
          }),
        });

        const data = await emailResponse.json();
        results.push({ email: recipientEmail, success: emailResponse.ok, data });
      } catch (err) {
        results.push({ email: recipientEmail, success: false, error: String(err) });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
