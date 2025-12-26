import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CORS ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: encode special characters in password portion of MongoDB URI (safe)
function encodeMongoUri(uri: string): string {
  // mongodb+srv://username:password@host/db?opts
  const regex = /^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/;
  const match = uri.match(regex);

  if (!match) return uri;

  const [, protocol, username, password, rest] = match;
  const encodedPassword = encodeURIComponent(password);
  return `${protocol}${username}:${encodedPassword}@${rest}`;
}

// Helper: best-effort DB name extraction from MongoDB URI path
function dbNameFromMongoUri(uri: string): string | null {
  // Examples:
  // mongodb+srv://u:p@host/DBNAME?x=y
  // mongodb+srv://u:p@host/?x=y   (no db)
  const m = uri.match(/mongodb(?:\+srv)?:\/\/[^@]+@[^/]+\/([^?/]*)/);
  if (!m) return null;

  const raw = (m[1] || "").trim();
  if (!raw) return null;
  return decodeURIComponent(raw);
}

// Helper: log activity to Supabase (does not block)
async function logActivity(
  userId: string | null,
  userEmail: string | null,
  activityType: string,
  description: string,
  metadata: Record<string, any> = {},
  req?: Request,
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
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

// Helper: verify authenticated user via Supabase Auth
async function verifyAuth(req: Request): Promise<{ userId: string; email: string | null } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();
  if (error || !user) return null;

  return { userId: user.id, email: user.email || null };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let mongoClient: MongoClient | null = null;

  try {
    // Auth required
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse input
    const body = await req.json().catch(() => ({}));
    const ticker = body?.ticker;

    if (!ticker || typeof ticker !== "string") {
      return new Response(JSON.stringify({ error: "Ticker is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    console.log(`ticker-screening invoked. user=${authUser.email} ticker=${normalizedTicker}`);

    // Get Mongo URI
    const rawMongoUri = Deno.env.get("MONGODB_URI");
    if (!rawMongoUri) {
      console.error("MONGODB_URI missing from secrets");
      return new Response(JSON.stringify({ error: "MongoDB URI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Choose DB name:
    // 1) explicit secret MONGODB_DB
    // 2) infer from URI path
    // 3) fallback to a safe default (but your current DB is Shariah-screening-n8n)
    const envDb = Deno.env.get("MONGODB_DB")?.trim();
    const uriDb = dbNameFromMongoUri(rawMongoUri);
    const dbName = envDb || uriDb || "Shariah-screening-n8n";

    console.log(`Mongo config: hasUri=true dbName=${dbName} (env=${Boolean(envDb)} uri=${Boolean(uriDb)})`);

    // Connect Mongo
    mongoClient = new MongoClient();
    await mongoClient.connect(encodeMongoUri(rawMongoUri));

    const db = mongoClient.database(dbName);

    // Query all relevant collections in parallel
    const [invesenseResult, autoBannedPass, autoBannedFail, numericPass, numericFail, masterSheet, qaResult] =
      await Promise.all([
        db.collection("client_facing_results").findOne({ Ticker: normalizedTicker }),
        db.collection("Auto-banned-Pass").findOne({ Ticker: normalizedTicker }),
        db.collection("Auto-banned-Fail").findOne({ Ticker: normalizedTicker }),
        db.collection("numeric_pass").findOne({ Ticker: normalizedTicker }),
        db.collection("numeric_fail").findOne({ Ticker: normalizedTicker }),
        db.collection("Master-Sheet").findOne({ Ticker: normalizedTicker }),
        db.collection("client_facing_qa").findOne({ Ticker: normalizedTicker }),
      ]);

    // Build response (keep your existing shape)
    const response = {
      security: {
        ticker: normalizedTicker,
        company:
          invesenseResult?.Company ||
          masterSheet?.Company ||
          autoBannedPass?.Company ||
          autoBannedFail?.Company ||
          null,
        sector: masterSheet?.Sector || null,
        industry: masterSheet?.Industry || autoBannedPass?.Industry || autoBannedFail?.Industry || null,
      },

      invesense: {
        status: invesenseResult?.final_classification || null,
        finalClassification: invesenseResult?.final_classification || null,
        debtRatio: invesenseResult?.Debt_Ratio ?? null,
        cashInvRatio: invesenseResult?.CashInv_Ratio ?? null,
        npinRatio: invesenseResult?.NPIN_Ratio ?? null,

        purificationRequired:
          invesenseResult?.purification_required === true ||
          invesenseResult?.purification_required === "true" ||
          invesenseResult?.purification_required === 1 ||
          invesenseResult?.purification_requied === true, // backward typo support
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
        status: autoBannedPass ? "PASS" : autoBannedFail ? "FAIL" : null,
        autoBanned: autoBannedFail?.auto_banned === true || autoBannedFail?.auto_banned === "true",
        autoBannedReason: autoBannedFail?.auto_banned_reason || null,
        industry: autoBannedFail?.Industry || autoBannedPass?.Industry || null,
        available: !!(autoBannedPass || autoBannedFail),
      },

      numeric: {
        status: numericPass ? "PASS" : numericFail ? "FAIL" : null,
        debtRatio: numericPass?.Debt_Ratio ?? numericFail?.Debt_Ratio ?? null,
        cashInvRatio: numericPass?.CashInv_Ratio ?? numericFail?.CashInv_Ratio ?? null,
        npinRatio: numericPass?.NPIN_Ratio ?? numericFail?.NPIN_Ratio ?? null,
        failReason: numericFail?.numeric_fail_reason || null,
        available: !!(numericPass || numericFail),
      },

      meta: {
        dbNameUsed: dbName,
        hasMasterSheet: !!masterSheet,
      },
    };

    // Activity log (non-blocking)
    logActivity(
      authUser.userId,
      authUser.email,
      "ticker_screening",
      `Screened ticker ${normalizedTicker}`,
      { ticker: normalizedTicker, db: dbName },
      req,
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // Important: log full error server-side
    console.error("Ticker screening error:", err);

    const message = typeof err?.message === "string" ? err.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    try {
      if (mongoClient) await mongoClient.close();
    } catch (closeErr) {
      console.error("Failed closing Mongo client:", closeErr);
    }
  }
});
