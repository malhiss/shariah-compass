import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Staff email(s) to notify
const STAFF_NOTIFICATION_EMAILS = ["sultan.m@invesense.com", "sultanmalhis01@gmail.com", "m.bilal@invesense.com"];

interface AccessRequestNotification {
  fullName: string;
  company: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Get CORS headers for this request (origin-restricted)
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsOptions(req);
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

    // Send separate emails to each recipient (same pattern as approval emails which work)
    const emailHtml = `
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
    `;

    const results = [];
    
    // Helper to delay between API calls (Resend rate limit: 2 requests/second)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Send individual emails to each staff member with delay to avoid rate limiting
    for (let i = 0; i < STAFF_NOTIFICATION_EMAILS.length; i++) {
      const recipientEmail = STAFF_NOTIFICATION_EMAILS[i];
      
      // Add 600ms delay between requests to stay under 2 req/sec limit
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
        console.log(`Email sent to ${recipientEmail}:`, JSON.stringify(data));
        results.push({ email: recipientEmail, success: emailResponse.ok, data });
      } catch (err) {
        console.error(`Failed to send email to ${recipientEmail}:`, err);
        results.push({ email: recipientEmail, success: false, error: String(err) });
      }
    }

    console.log("All email results:", JSON.stringify(results));

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
