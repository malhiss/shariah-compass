import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { findByTickers, type ScreeningRecord } from "../_shared/sample-data.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Holding {
  ticker: string;
  quantity: number;
  price: number;
}

// Helper function to log activity
async function logActivity(
  userId: string,
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

// Helper to verify authenticated user
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { holdings } = await req.json();
    
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Holdings array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User: ${authUser.email}, Screening portfolio with ${holdings.length} holdings`);

    // Get all unique tickers
    const tickers = holdings.map((h: Holding) => h.ticker.trim().toUpperCase());
    
    // Find all records from sample data
    const recordsMap = findByTickers(tickers);

    // Calculate total portfolio value and build results
    let totalValue = 0;
    const holdingResults = holdings.map((h: Holding) => {
      const ticker = h.ticker.trim().toUpperCase();
      const value = h.quantity * h.price;
      totalValue += value;

      const record = recordsMap.get(ticker);
      
      const numericPass = record ? (
        record.debt_status === "PASS" && 
        record.cash_inv_status === "PASS" && 
        record.npin_status === "PASS"
      ) : null;

      return {
        ticker,
        quantity: h.quantity,
        price: h.price,
        value,
        company: record?.company_name || null,
        invesense: {
          classification: record?.final_classification || null,
          debtRatio: record?.debt_ratio_pct ?? null,
          cashInvRatio: record?.cash_inv_ratio_pct ?? null,
          npinRatio: record?.npin_ratio_pct ?? null,
          purificationRequired: record?.purification_required === true,
          purificationPctRecommended: record?.purification_pct_recommended ?? null,
          keyDrivers: [],
          shariahSummary: record?.shariah_summary || null,
          notesForPortfolioManager: record?.notes_for_portfolio_manager || null,
          needsBoardReview: record?.needs_board_review === true,
          haramRevenuePercent: record?.haram_pct_point ?? null,
          qaStatus: record?.qa_status || null,
          qaIssues: [],
          available: !!record,
        },
        autoBanned: {
          status: record ? (record.auto_banned ? 'FAIL' : 'PASS') : null,
          autoBanned: record?.auto_banned === true,
          autoBannedReason: record?.auto_banned_reason_clean || null,
          industry: record?.industry || null,
          securityType: record?.security_type || null,
          available: !!record,
        },
        numeric: {
          status: record ? (numericPass ? 'PASS' : 'FAIL') : null,
          debtRatio: record?.debt_ratio_pct ?? null,
          cashInvRatio: record?.cash_inv_ratio_pct ?? null,
          npinRatio: record?.npin_ratio_pct ?? null,
          failReason: record && !numericPass ? `Failed: ${[
            record.debt_status === "FAIL" ? "Debt" : null,
            record.cash_inv_status === "FAIL" ? "Cash/Inv" : null,
            record.npin_status === "FAIL" ? "NPIN" : null,
          ].filter(Boolean).join(", ")}` : null,
          available: !!record,
        },
      };
    });

    // Calculate summaries
    const createSummary = (getClassification: (h: any) => string | null, getAvailable: (h: any) => boolean) => {
      let compliant = 0, purification = 0, nonCompliant = 0, noData = 0;
      
      holdingResults.forEach(h => {
        if (!getAvailable(h)) {
          noData += h.value;
        } else {
          const cls = getClassification(h);
          if (cls === 'COMPLIANT' || cls === 'PASS') {
            compliant += h.value;
          } else if (cls === 'COMPLIANT_WITH_PURIFICATION') {
            purification += h.value;
          } else {
            nonCompliant += h.value;
          }
        }
      });

      return {
        compliantWeight: compliant,
        compliantWithPurificationWeight: purification,
        nonCompliantWeight: nonCompliant,
        noDataWeight: noData,
        totalValue,
      };
    };

    const response = {
      summary: {
        invesense: createSummary(h => h.invesense.classification, h => h.invesense.available),
        autoBanned: createSummary(h => h.autoBanned.status, h => h.autoBanned.available),
        numeric: createSummary(h => h.numeric.status, h => h.numeric.available),
      },
      holdings: holdingResults,
      totalValue,
    };

    console.log(`Portfolio screening complete. Total value: ${totalValue}`);

    // Log the screening activity
    await logActivity(
      authUser.userId,
      authUser.email,
      "portfolio_screening",
      `Screened portfolio with ${holdings.length} holdings (Total value: $${totalValue.toLocaleString()})`,
      {
        holdings_count: holdings.length,
        tickers: tickers,
        total_value: totalValue,
      },
      req
    );

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Portfolio screening error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
