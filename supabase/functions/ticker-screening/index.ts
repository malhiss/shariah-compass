import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper function to encode special characters in MongoDB URI password
function encodeMongoUri(uri: string): string {
  // Parse the URI to extract and encode the password
  const regex = /^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/;
  const match = uri.match(regex);
  
  if (!match) {
    // If URI doesn't match expected format, return as-is
    return uri;
  }
  
  const [, protocol, username, password, rest] = match;
  const encodedUsername = encodeURIComponent(username);
  const encodedPassword = encodeURIComponent(password);
  
  return `${protocol}${encodedUsername}:${encodedPassword}@${rest}`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to log activity
async function logActivity(
  userId: string | null,
  userEmail: string | null,
  activityType: string,
  description: string,
  metadata: Record<string, any> = {},
  req?: Request
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

// Helper function to get user from auth header
async function getUserFromAuth(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();
    
    if (!ticker || typeof ticker !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Ticker is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    console.log(`Screening ticker: ${normalizedTicker}`);

    // Get the user for logging
    const user = await getUserFromAuth(req);

    const mongoUri = Deno.env.get('MONGODB_URI');
    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    const client = new MongoClient();
    await client.connect(encodeMongoUri(mongoUri));
    
    const db = client.database('shariah_screening');

    // Query all three methodologies in parallel
    const [invesenseResult, autoBannedPass, autoBannedFail, numericPass, numericFail, masterSheet] = await Promise.all([
      db.collection('client_facing_results').findOne({ Ticker: normalizedTicker }),
      db.collection('Auto-banned-Pass').findOne({ Ticker: normalizedTicker }),
      db.collection('Auto-banned-Fail').findOne({ Ticker: normalizedTicker }),
      db.collection('numeric_pass').findOne({ Ticker: normalizedTicker }),
      db.collection('numeric_fail').findOne({ Ticker: normalizedTicker }),
      db.collection('Master-Sheet').findOne({ Ticker: normalizedTicker }),
    ]);

    // Also check for QA issues
    const qaResult = await db.collection('client_facing_qa').findOne({ Ticker: normalizedTicker });

    await client.close();

    // Build response
    const response = {
      security: {
        ticker: normalizedTicker,
        company: invesenseResult?.Company || masterSheet?.Company || autoBannedPass?.Company || autoBannedFail?.Company || null,
        sector: masterSheet?.Sector || null,
        industry: masterSheet?.Industry || autoBannedPass?.Industry || autoBannedFail?.Industry || null,
        typeOfSecurity: masterSheet?.typeOfSecurity || autoBannedPass?.Security_Type || autoBannedFail?.Security_Type || null,
        reportDate: masterSheet?.report_date || null,
      },
      invesense: {
        classification: invesenseResult?.final_classification || null,
        debtRatio: invesenseResult?.Debt_Ratio ?? null,
        cashInvRatio: invesenseResult?.CashInv_Ratio ?? null,
        npinRatio: invesenseResult?.NPIN_Ratio ?? null,
        purificationRequired: invesenseResult?.purification_required === true || invesenseResult?.purification_required === 'true',
        purificationPctRecommended: invesenseResult?.purification_pct_recommended ?? null,
        keyDrivers: invesenseResult?.key_drivers || [],
        shariahSummary: invesenseResult?.shariah_summary || null,
        notesForPortfolioManager: invesenseResult?.notes_for_portfolio_manager || null,
        needsBoardReview: invesenseResult?.needs_board_review === true,
        haramRevenuePercent: invesenseResult?.haram_revenue_percent ?? null,
        qaStatus: qaResult?.qa_status || null,
        qaIssues: qaResult?.qa_issues || [],
        available: !!invesenseResult,
      },
      autoBanned: {
        status: autoBannedPass ? 'PASS' : autoBannedFail ? 'FAIL' : null,
        autoBanned: autoBannedFail?.auto_banned === true || autoBannedFail?.auto_banned === 'true',
        autoBannedReason: autoBannedFail?.auto_banned_reason || null,
        industry: autoBannedPass?.Industry || autoBannedFail?.Industry || null,
        securityType: autoBannedPass?.Security_Type || autoBannedFail?.Security_Type || null,
        available: !!(autoBannedPass || autoBannedFail),
      },
      numeric: {
        status: numericPass ? 'PASS' : numericFail ? 'FAIL' : null,
        debtRatio: numericPass?.Debt_Ratio ?? numericFail?.Debt_Ratio ?? null,
        cashInvRatio: numericPass?.CashInv_Ratio ?? numericFail?.CashInv_Ratio ?? null,
        npinRatio: numericPass?.NPIN_Ratio ?? numericFail?.NPIN_Ratio ?? null,
        failReason: numericFail?.numeric_fail_reason || null,
        available: !!(numericPass || numericFail),
      },
    };

    console.log(`Screening complete for ${normalizedTicker}:`, {
      invesense: response.invesense.available,
      autoBanned: response.autoBanned.available,
      numeric: response.numeric.available,
    });

    // Log the screening activity
    if (user) {
      await logActivity(
        user.id,
        user.email || null,
        "ticker_screening",
        `Screened ticker: ${normalizedTicker}`,
        {
          ticker: normalizedTicker,
          company: response.security.company,
          invesense_classification: response.invesense.classification,
          invesense_available: response.invesense.available,
          autoBanned_status: response.autoBanned.status,
          numeric_status: response.numeric.status,
        },
        req
      );
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ticker screening error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
