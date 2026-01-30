import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

interface FeedbackNotificationRequest {
  userEmail: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Get CORS headers for this request (origin-restricted)
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return handleCorsOptions(req);
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);
    const { userEmail, message }: FeedbackNotificationRequest = await req.json();

    if (!userEmail || !message) {
      throw new Error("Missing required fields: userEmail and message");
    }

    const adminEmails = ["sultan.m@invesense.com", "m.bilal@invesense.com"];

    const emailResponse = await resend.emails.send({
      from: "Dalil Platform <noreply@dalil.me>",
      to: adminEmails,
      subject: "New Feedback Submitted - Dalil Platform",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Feedback Received</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">From:</p>
                <p style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 500;">${userEmail}</p>
              </div>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 500;">Feedback Message:</p>
                <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
                  View and manage all feedback in the <a href="https://dalil.me/staff-portal" style="color: #3b82f6; text-decoration: none;">Staff Portal</a>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} Dalil by Invesense Asset Management
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Feedback notification email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending feedback notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
