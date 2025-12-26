import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { findByTicker, type ScreeningRecord } from "../_shared/sample-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: log activity to Supabase
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

  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) return null;

  return { userId: user.id, email: user.email || null };
}

// Build response from screening record
function buildResponse(ticker: string, record: ScreeningRecord | undefined) {
  if (!record) {
    return {
      security: {
        ticker,
        company: null,
        sector: null,
        industry: null,
      },
      invesense: {
        status: null,
        finalClassification: null,
        debtRatio: null,
        cashInvRatio: null,
        npinRatio: null,
        purificationRequired: false,
        purificationPctRecommended: null,
        keyDrivers: [],
        shariahSummary: null,
        notesForPortfolioManager: null,
        needsBoardReview: false,
        haramRevenuePercent: null,
        qaStatus: null,
        qaIssues: [],
        available: false,
      },
      autoBanned: {
        status: null,
        autoBanned: false,
        autoBannedReason: null,
        industry: null,
        available: false,
      },
      numeric: {
        status: null,
        debtRatio: null,
        cashInvRatio: null,
        npinRatio: null,
        failReason: null,
        available: false,
      },
      meta: {
        dataSource: "sample",
        found: false,
      },
    };
  }

  const numericPass = record.debt_status === "PASS" && 
                      record.cash_inv_status === "PASS" && 
                      record.npin_status === "PASS";

  return {
    security: {
      ticker: record.ticker,
      company: record.company_name,
      sector: null,
      industry: record.industry,
    },
    invesense: {
      status: record.final_classification,
      finalClassification: record.final_classification,
      debtRatio: record.debt_ratio_pct,
      cashInvRatio: record.cash_inv_ratio_pct,
      npinRatio: record.npin_ratio_pct,
      purificationRequired: record.purification_required,
      purificationPctRecommended: record.purification_pct_recommended,
      keyDrivers: [],
      shariahSummary: record.shariah_summary,
      notesForPortfolioManager: record.notes_for_portfolio_manager,
      needsBoardReview: record.needs_board_review,
      haramRevenuePercent: record.haram_pct_point,
      qaStatus: record.qa_status,
      qaIssues: [],
      available: true,
    },
    autoBanned: {
      status: record.auto_banned ? "FAIL" : "PASS",
      autoBanned: record.auto_banned,
      autoBannedReason: record.auto_banned_reason_clean,
      industry: record.industry,
      available: true,
    },
    numeric: {
      status: numericPass ? "PASS" : "FAIL",
      debtRatio: record.debt_ratio_pct,
      cashInvRatio: record.cash_inv_ratio_pct,
      npinRatio: record.npin_ratio_pct,
      failReason: !numericPass ? `Failed: ${[
        record.debt_status === "FAIL" ? "Debt" : null,
        record.cash_inv_status === "FAIL" ? "Cash/Inv" : null,
        record.npin_status === "FAIL" ? "NPIN" : null,
      ].filter(Boolean).join(", ")}` : null,
      available: true,
    },
    meta: {
      dataSource: "sample",
      found: true,
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const record = findByTicker(normalizedTicker);
    const response = buildResponse(normalizedTicker, record);

    // Log activity
    logActivity(
      authUser.userId,
      authUser.email,
      "ticker_screening",
      `Screened ticker ${normalizedTicker}`,
      { ticker: normalizedTicker, found: !!record },
      req,
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Ticker screening error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
