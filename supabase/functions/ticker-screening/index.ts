import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CORS ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CSV parsing helper
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
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

// Sample data embedded directly (parsed from CSV)
const sampleData = [
  { ticker: "V", company_name: "Visa Inc.", industry: "Financial - Credit Services", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 1, debt_ratio_pct: 3.95, cash_inv_ratio_pct: 3.61, npin_ratio_pct: 0, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Visa Inc. is classified as Shariah-compliant with purification required.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "MA", company_name: "Mastercard Incorporated", industry: "Financial - Credit Services", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 0.3, debt_ratio_pct: 3.74, cash_inv_ratio_pct: 2.13, npin_ratio_pct: 0, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Mastercard is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "PLTR", company_name: "Palantir Technologies Inc.", industry: "Software - Infrastructure", final_classification: "NON_COMPLIANT", purification_required: false, purification_pct_recommended: null, debt_ratio_pct: 0.06, cash_inv_ratio_pct: 1.23, npin_ratio_pct: 6.87, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "FAIL", business_status: "FAIL", shariah_summary: "Palantir is classified as non-compliant due to high defense revenue.", needs_board_review: true, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "COST", company_name: "Costco Wholesale Corporation", industry: "Discount Stores", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 3.46, debt_ratio_pct: 2.09, cash_inv_ratio_pct: 3.9, npin_ratio_pct: 0.21, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Costco is classified as Shariah-compliant with purification required.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "ABBV", company_name: "AbbVie Inc.", industry: "Drug Manufacturers - General", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 3.5, debt_ratio_pct: 17.35, cash_inv_ratio_pct: 1.49, npin_ratio_pct: 3.47, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "PASS", shariah_summary: "AbbVie is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "KO", company_name: "The Coca-Cola Company", industry: "Beverages - Non-Alcoholic", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 2.1, debt_ratio_pct: 15.15, cash_inv_ratio_pct: 11.21, npin_ratio_pct: 2.1, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Coca-Cola is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "TMUS", company_name: "T-Mobile US, Inc.", industry: "Telecommunications Services", final_classification: "NON_COMPLIANT", purification_required: false, purification_pct_recommended: null, debt_ratio_pct: 51.26, cash_inv_ratio_pct: 3.45, npin_ratio_pct: 0, debt_status: "FAIL", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "T-Mobile is classified as non-compliant due to high debt ratio.", needs_board_review: true, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "CRM", company_name: "Salesforce, Inc.", industry: "Software - Application", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 1.2, debt_ratio_pct: 4.57, cash_inv_ratio_pct: 7.58, npin_ratio_pct: 0, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Salesforce is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "RTX", company_name: "RTX Corporation", industry: "Aerospace & Defense", final_classification: "NON_COMPLIANT", purification_required: false, purification_pct_recommended: null, debt_ratio_pct: 18.57, cash_inv_ratio_pct: 3.39, npin_ratio_pct: 0.13, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "FAIL", shariah_summary: "RTX is classified as non-compliant due to defense/weapons business.", needs_board_review: true, auto_banned: true, auto_banned_status: "FAIL", auto_banned_reason_clean: "Aerospace & Defense" },
  { ticker: "AAPL", company_name: "Apple Inc.", industry: "Consumer Electronics", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 0.5, debt_ratio_pct: 12.5, cash_inv_ratio_pct: 8.2, npin_ratio_pct: 0.5, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "PASS", shariah_summary: "Apple is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "MSFT", company_name: "Microsoft Corporation", industry: "Software - Infrastructure", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 0.8, debt_ratio_pct: 8.3, cash_inv_ratio_pct: 15.2, npin_ratio_pct: 0.8, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "PASS", shariah_summary: "Microsoft is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "GOOGL", company_name: "Alphabet Inc.", industry: "Internet Content & Information", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 1.2, debt_ratio_pct: 2.1, cash_inv_ratio_pct: 22.5, npin_ratio_pct: 1.2, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Alphabet is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "AMZN", company_name: "Amazon.com, Inc.", industry: "Internet Retail", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 2.5, debt_ratio_pct: 18.9, cash_inv_ratio_pct: 12.3, npin_ratio_pct: 2.5, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Amazon is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "JPM", company_name: "JPMorgan Chase & Co.", industry: "Banks - Diversified", final_classification: "NON_COMPLIANT", purification_required: false, purification_pct_recommended: null, debt_ratio_pct: 85.2, cash_inv_ratio_pct: 45.3, npin_ratio_pct: 78.5, debt_status: "FAIL", cash_inv_status: "FAIL", npin_status: "FAIL", business_status: "FAIL", shariah_summary: "JPMorgan is classified as non-compliant due to conventional banking.", needs_board_review: false, auto_banned: true, auto_banned_status: "FAIL", auto_banned_reason_clean: "Conventional Banking" },
  { ticker: "BUD", company_name: "Anheuser-Busch InBev SA/NV", industry: "Beverages - Brewers", final_classification: "NON_COMPLIANT", purification_required: false, purification_pct_recommended: null, debt_ratio_pct: 42.5, cash_inv_ratio_pct: 5.8, npin_ratio_pct: 95.2, debt_status: "FAIL", cash_inv_status: "PASS", npin_status: "FAIL", business_status: "FAIL", shariah_summary: "AB InBev is classified as non-compliant due to alcohol production.", needs_board_review: false, auto_banned: true, auto_banned_status: "FAIL", auto_banned_reason_clean: "Alcohol Production" },
  { ticker: "NVDA", company_name: "NVIDIA Corporation", industry: "Semiconductors", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 0.3, debt_ratio_pct: 5.2, cash_inv_ratio_pct: 18.9, npin_ratio_pct: 0.3, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "PASS", shariah_summary: "NVIDIA is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "TSLA", company_name: "Tesla, Inc.", industry: "Auto Manufacturers", final_classification: "COMPLIANT", purification_required: false, purification_pct_recommended: 0, debt_ratio_pct: 3.8, cash_inv_ratio_pct: 25.1, npin_ratio_pct: 0.1, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "PASS", shariah_summary: "Tesla is classified as fully Shariah-compliant.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "JNJ", company_name: "Johnson & Johnson", industry: "Drug Manufacturers - General", final_classification: "COMPLIANT", purification_required: false, purification_pct_recommended: 0, debt_ratio_pct: 8.9, cash_inv_ratio_pct: 9.2, npin_ratio_pct: 0.4, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "PASS", shariah_summary: "Johnson & Johnson is classified as fully Shariah-compliant.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "PG", company_name: "The Procter & Gamble Company", industry: "Household & Personal Products", final_classification: "COMPLIANT", purification_required: false, purification_pct_recommended: 0, debt_ratio_pct: 22.1, cash_inv_ratio_pct: 4.5, npin_ratio_pct: 0.2, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "PASS", shariah_summary: "Procter & Gamble is classified as fully Shariah-compliant.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "MGM", company_name: "MGM Resorts International", industry: "Resorts & Casinos", final_classification: "NON_COMPLIANT", purification_required: false, purification_pct_recommended: null, debt_ratio_pct: 55.3, cash_inv_ratio_pct: 8.1, npin_ratio_pct: 88.5, debt_status: "FAIL", cash_inv_status: "PASS", npin_status: "FAIL", business_status: "FAIL", shariah_summary: "MGM is classified as non-compliant due to gambling/casino operations.", needs_board_review: false, auto_banned: true, auto_banned_status: "FAIL", auto_banned_reason_clean: "Gambling/Casino Operations" },
  { ticker: "META", company_name: "Meta Platforms, Inc.", industry: "Internet Content & Information", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 1.5, debt_ratio_pct: 4.2, cash_inv_ratio_pct: 28.3, npin_ratio_pct: 1.5, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Meta is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "WMT", company_name: "Walmart Inc.", industry: "Discount Stores", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 2.8, debt_ratio_pct: 15.8, cash_inv_ratio_pct: 3.2, npin_ratio_pct: 2.8, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Walmart is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "DIS", company_name: "The Walt Disney Company", industry: "Entertainment", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 3.2, debt_ratio_pct: 24.5, cash_inv_ratio_pct: 6.8, npin_ratio_pct: 3.2, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Disney is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "NFLX", company_name: "Netflix, Inc.", industry: "Entertainment", final_classification: "COMPLIANT_WITH_PURIFICATION", purification_required: true, purification_pct_recommended: 1.8, debt_ratio_pct: 12.3, cash_inv_ratio_pct: 15.6, npin_ratio_pct: 1.8, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "CAUTION", shariah_summary: "Netflix is classified as Shariah-compliant with purification.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
  { ticker: "AMD", company_name: "Advanced Micro Devices, Inc.", industry: "Semiconductors", final_classification: "COMPLIANT", purification_required: false, purification_pct_recommended: 0, debt_ratio_pct: 3.5, cash_inv_ratio_pct: 22.1, npin_ratio_pct: 0.2, debt_status: "PASS", cash_inv_status: "PASS", npin_status: "PASS", business_status: "PASS", shariah_summary: "AMD is classified as fully Shariah-compliant.", needs_board_review: false, auto_banned: false, auto_banned_status: null, auto_banned_reason_clean: null },
];

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Find the record in sample data
    const record = sampleData.find(r => r.ticker === normalizedTicker);

    if (!record) {
      // Return not found response
      const response = {
        security: {
          ticker: normalizedTicker,
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

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine numeric status
    const numericPass = record.debt_status === "PASS" && 
                        record.cash_inv_status === "PASS" && 
                        record.npin_status === "PASS";

    // Build response
    const response = {
      security: {
        ticker: normalizedTicker,
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
        notesForPortfolioManager: null,
        needsBoardReview: record.needs_board_review,
        haramRevenuePercent: record.npin_ratio_pct,
        qaStatus: null,
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

    // Activity log (non-blocking)
    logActivity(
      authUser.userId,
      authUser.email,
      "ticker_screening",
      `Screened ticker ${normalizedTicker}`,
      { ticker: normalizedTicker, found: true },
      req,
    );

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Ticker screening error:", err);
    const message = typeof err?.message === "string" ? err.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
