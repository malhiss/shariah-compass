import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Staff email(s) to notify - add more as needed
const STAFF_NOTIFICATION_EMAILS = ["sultan.m@invesense.com"];

interface AccessRequestNotification {
  fullName: string;
  company: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { fullName, company, email }: AccessRequestNotification = await req.json();

    // Validate required fields
    if (!fullName || !company || !email) {
      throw new Error("Missing required fields");
    }

    // Sanitize inputs
    const sanitizedName = fullName.slice(0, 100).replace(/[<>]/g, "");
    const sanitizedCompany = company.slice(0, 100).replace(/[<>]/g, "");
    const sanitizedEmail = email.slice(0, 255).toLowerCase();

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dalil Platform <noreply@dalil.me>",
        to: STAFF_NOTIFICATION_EMAILS,
        subject: `New Access Request: ${sanitizedName} from ${sanitizedCompany}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a2e;">New Access Request</h1>
            <p>A new access request has been submitted on the Dalil platform:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${sanitizedName}</p>
              <p><strong>Company:</strong> ${sanitizedCompany}</p>
              <p><strong>Email:</strong> ${sanitizedEmail}</p>
            </div>
            
            <p>Please review this request in the <a href="https://dalilplatform.lovable.app/staff-portal" style="color: #0066cc;">Staff Portal</a>.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #666; font-size: 12px;">This is an automated notification from Dalil by Invesense Asset Management.</p>
          </div>
        `,
      }),
    });

    const data = await emailResponse.json();
    console.log("Resend API response:", JSON.stringify(data));

    if (!emailResponse.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send notification email");
    }

    return new Response(JSON.stringify({ success: true, resendResponse: data }), {
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
