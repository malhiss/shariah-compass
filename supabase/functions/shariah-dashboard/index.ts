import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Sample data based on the provided CSV
const sampleClientFacingRecords = [
  {
    upsert_key: "V_2025-10-28",
    Ticker: "V",
    Company: "Visa Inc.",
    Industry: "Financial - Credit Services",
    Sector: "Financial Services",
    Security_Type: "COM CL A",
    Report_Date: "2025-10-28",
    Screening_Date: "2025-10-28",
    Debt_Ratio_Percent: 3.95,
    Cash_Investment_Ratio_Percent: 3.61,
    Non_Permissible_Income_Percent: 0,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 1,
    Non_Compliant_Revenue_Point_Estimate: 1,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.865Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "MA_2025-10-30",
    Ticker: "MA",
    Company: "Mastercard Incorporated",
    Industry: "Financial - Credit Services",
    Sector: "Financial Services",
    Security_Type: "CL A",
    Report_Date: "2025-10-30",
    Screening_Date: "2025-10-30",
    Debt_Ratio_Percent: 3.74,
    Cash_Investment_Ratio_Percent: 2.13,
    Non_Permissible_Income_Percent: 0,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 0.3,
    Non_Compliant_Revenue_Point_Estimate: 0.3,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.866Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "PLTR_2025-11-04",
    Ticker: "PLTR",
    Company: "Palantir Technologies Inc.",
    Industry: "Software - Infrastructure",
    Sector: "Technology",
    Security_Type: "CL A",
    Report_Date: "2025-11-04",
    Screening_Date: "2025-11-04",
    Debt_Ratio_Percent: 0.06,
    Cash_Investment_Ratio_Percent: 1.23,
    Non_Permissible_Income_Percent: 6.87,
    Final_Verdict: "NON_COMPLIANT",
    Shariah_Compliant: "NO",
    Numeric_Screening_Result: "FAIL",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "NON_COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: null,
    Non_Compliant_Revenue_Point_Estimate: 36.5,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.867Z",
    Classification: "NON_COMPLIANT",
    Compliance_Risk_Level: "High",
    Board_Review_Needed: "YES",
  },
  {
    upsert_key: "COST_2025-09-25",
    Ticker: "COST",
    Company: "Costco Wholesale Corporation",
    Industry: "Discount Stores",
    Sector: "Consumer Defensive",
    Security_Type: "COM",
    Report_Date: "2025-09-25",
    Screening_Date: "2025-09-25",
    Debt_Ratio_Percent: 2.09,
    Cash_Investment_Ratio_Percent: 3.9,
    Non_Permissible_Income_Percent: 0.21,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 3.46,
    Non_Compliant_Revenue_Point_Estimate: 3.46,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.868Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "ABBV_2025-10-31",
    Ticker: "ABBV",
    Company: "AbbVie Inc.",
    Industry: "Drug Manufacturers - General",
    Sector: "Healthcare",
    Security_Type: "COM",
    Report_Date: "2025-10-31",
    Screening_Date: "2025-10-31",
    Debt_Ratio_Percent: 17.35,
    Cash_Investment_Ratio_Percent: 1.49,
    Non_Permissible_Income_Percent: 3.47,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "PASS",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 3.5,
    Non_Compliant_Revenue_Point_Estimate: 3.5,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.868Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "KO_2025-10-21",
    Ticker: "KO",
    Company: "The Coca-Cola Company",
    Industry: "Beverages - Non-Alcoholic",
    Sector: "Consumer Defensive",
    Security_Type: "COM",
    Report_Date: "2025-10-21",
    Screening_Date: "2025-10-21",
    Debt_Ratio_Percent: 15.15,
    Cash_Investment_Ratio_Percent: 11.21,
    Non_Permissible_Income_Percent: 2.1,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 2.1,
    Non_Compliant_Revenue_Point_Estimate: 2.1,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.875Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "TMUS_2025-10-23",
    Ticker: "TMUS",
    Company: "T-Mobile US, Inc.",
    Industry: "Telecommunications Services",
    Sector: "Communication Services",
    Security_Type: "COM",
    Report_Date: "2025-10-23",
    Screening_Date: "2025-10-23",
    Debt_Ratio_Percent: 51.26,
    Cash_Investment_Ratio_Percent: 3.45,
    Non_Permissible_Income_Percent: 0,
    Final_Verdict: "NON_COMPLIANT",
    Shariah_Compliant: "NO",
    Numeric_Screening_Result: "FAIL",
    Qualitative_Screening_Result: "CAUTION",
    Compliance_Status: "NON_COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: null,
    Non_Compliant_Revenue_Point_Estimate: 0.55,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.881Z",
    Classification: "NON_COMPLIANT",
    Compliance_Risk_Level: "High",
    Board_Review_Needed: "YES",
  },
  {
    upsert_key: "CRM_2025-12-03",
    Ticker: "CRM",
    Company: "Salesforce, Inc.",
    Industry: "Software - Application",
    Sector: "Technology",
    Security_Type: "COM",
    Report_Date: "2025-12-03",
    Screening_Date: "2025-12-03",
    Debt_Ratio_Percent: 4.57,
    Cash_Investment_Ratio_Percent: 7.58,
    Non_Permissible_Income_Percent: 0,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "CAUTION",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 1.2,
    Non_Compliant_Revenue_Point_Estimate: 1.2,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.879Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "RTX_2025-10-21",
    Ticker: "RTX",
    Company: "RTX Corporation",
    Industry: "Aerospace & Defense",
    Sector: "Industrials",
    Security_Type: "COM",
    Report_Date: "2025-10-21",
    Screening_Date: "2025-10-21",
    Debt_Ratio_Percent: 18.57,
    Cash_Investment_Ratio_Percent: 3.39,
    Non_Permissible_Income_Percent: 0.13,
    Final_Verdict: "NON_COMPLIANT",
    Shariah_Compliant: "NO",
    Numeric_Screening_Result: "FAIL",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "NON_COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: null,
    Non_Compliant_Revenue_Point_Estimate: 57.13,
    Auto_Banned: true,
    Auto_Banned_Reason: "Defense/Weapons Industry",
    Screening_Timestamp: "2025-12-10T15:32:17.881Z",
    Classification: "NON_COMPLIANT",
    Compliance_Risk_Level: "High",
    Board_Review_Needed: "YES",
  },
  {
    upsert_key: "AAPL_2025-10-15",
    Ticker: "AAPL",
    Company: "Apple Inc.",
    Industry: "Consumer Electronics",
    Sector: "Technology",
    Security_Type: "COM",
    Report_Date: "2025-10-15",
    Screening_Date: "2025-10-15",
    Debt_Ratio_Percent: 12.5,
    Cash_Investment_Ratio_Percent: 8.2,
    Non_Permissible_Income_Percent: 0.5,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "PASS",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 0.5,
    Non_Compliant_Revenue_Point_Estimate: 0.5,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.890Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "MSFT_2025-10-20",
    Ticker: "MSFT",
    Company: "Microsoft Corporation",
    Industry: "Software - Infrastructure",
    Sector: "Technology",
    Security_Type: "COM",
    Report_Date: "2025-10-20",
    Screening_Date: "2025-10-20",
    Debt_Ratio_Percent: 8.3,
    Cash_Investment_Ratio_Percent: 15.2,
    Non_Permissible_Income_Percent: 0.8,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "PASS",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 0.8,
    Non_Compliant_Revenue_Point_Estimate: 0.8,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.895Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "GOOGL_2025-10-25",
    Ticker: "GOOGL",
    Company: "Alphabet Inc.",
    Industry: "Internet Content & Information",
    Sector: "Communication Services",
    Security_Type: "CL A",
    Report_Date: "2025-10-25",
    Screening_Date: "2025-10-25",
    Debt_Ratio_Percent: 2.1,
    Cash_Investment_Ratio_Percent: 22.5,
    Non_Permissible_Income_Percent: 1.2,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "CAUTION",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 1.2,
    Non_Compliant_Revenue_Point_Estimate: 1.2,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.900Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "AMZN_2025-10-30",
    Ticker: "AMZN",
    Company: "Amazon.com, Inc.",
    Industry: "Internet Retail",
    Sector: "Consumer Cyclical",
    Security_Type: "COM",
    Report_Date: "2025-10-30",
    Screening_Date: "2025-10-30",
    Debt_Ratio_Percent: 18.9,
    Cash_Investment_Ratio_Percent: 12.3,
    Non_Permissible_Income_Percent: 2.5,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "CAUTION",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 2.5,
    Non_Compliant_Revenue_Point_Estimate: 2.5,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.905Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Medium",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "JPM_2025-10-18",
    Ticker: "JPM",
    Company: "JPMorgan Chase & Co.",
    Industry: "Banks - Diversified",
    Sector: "Financial Services",
    Security_Type: "COM",
    Report_Date: "2025-10-18",
    Screening_Date: "2025-10-18",
    Debt_Ratio_Percent: 85.2,
    Cash_Investment_Ratio_Percent: 45.3,
    Non_Permissible_Income_Percent: 78.5,
    Final_Verdict: "NON_COMPLIANT",
    Shariah_Compliant: "NO",
    Numeric_Screening_Result: "FAIL",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "NON_COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: null,
    Non_Compliant_Revenue_Point_Estimate: 78.5,
    Auto_Banned: true,
    Auto_Banned_Reason: "Conventional Banking",
    Screening_Timestamp: "2025-12-10T15:32:17.910Z",
    Classification: "NON_COMPLIANT",
    Compliance_Risk_Level: "High",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "BUD_2025-10-22",
    Ticker: "BUD",
    Company: "Anheuser-Busch InBev SA/NV",
    Industry: "Beverages - Brewers",
    Sector: "Consumer Defensive",
    Security_Type: "ADR",
    Report_Date: "2025-10-22",
    Screening_Date: "2025-10-22",
    Debt_Ratio_Percent: 42.5,
    Cash_Investment_Ratio_Percent: 5.8,
    Non_Permissible_Income_Percent: 95.2,
    Final_Verdict: "NON_COMPLIANT",
    Shariah_Compliant: "NO",
    Numeric_Screening_Result: "FAIL",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "NON_COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: null,
    Non_Compliant_Revenue_Point_Estimate: 95.2,
    Auto_Banned: true,
    Auto_Banned_Reason: "Alcohol Production",
    Screening_Timestamp: "2025-12-10T15:32:17.915Z",
    Classification: "NON_COMPLIANT",
    Compliance_Risk_Level: "High",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "NVDA_2025-11-01",
    Ticker: "NVDA",
    Company: "NVIDIA Corporation",
    Industry: "Semiconductors",
    Sector: "Technology",
    Security_Type: "COM",
    Report_Date: "2025-11-01",
    Screening_Date: "2025-11-01",
    Debt_Ratio_Percent: 5.2,
    Cash_Investment_Ratio_Percent: 18.9,
    Non_Permissible_Income_Percent: 0.3,
    Final_Verdict: "COMPLIANT_WITH_PURIFICATION",
    Shariah_Compliant: "DOUBTFUL",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "PASS",
    Compliance_Status: "COMPLIANT_WITH_PURIFICATION",
    Purification_Required: true,
    Purification_Percentage: 0.3,
    Non_Compliant_Revenue_Point_Estimate: 0.3,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.920Z",
    Classification: "COMPLIANT_WITH_PURIFICATION",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "TSLA_2025-10-28",
    Ticker: "TSLA",
    Company: "Tesla, Inc.",
    Industry: "Auto Manufacturers",
    Sector: "Consumer Cyclical",
    Security_Type: "COM",
    Report_Date: "2025-10-28",
    Screening_Date: "2025-10-28",
    Debt_Ratio_Percent: 3.8,
    Cash_Investment_Ratio_Percent: 25.1,
    Non_Permissible_Income_Percent: 0.1,
    Final_Verdict: "COMPLIANT",
    Shariah_Compliant: "YES",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "PASS",
    Compliance_Status: "COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: 0,
    Non_Compliant_Revenue_Point_Estimate: 0.1,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.925Z",
    Classification: "COMPLIANT",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "JNJ_2025-10-19",
    Ticker: "JNJ",
    Company: "Johnson & Johnson",
    Industry: "Drug Manufacturers - General",
    Sector: "Healthcare",
    Security_Type: "COM",
    Report_Date: "2025-10-19",
    Screening_Date: "2025-10-19",
    Debt_Ratio_Percent: 8.9,
    Cash_Investment_Ratio_Percent: 9.2,
    Non_Permissible_Income_Percent: 0.4,
    Final_Verdict: "COMPLIANT",
    Shariah_Compliant: "YES",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "PASS",
    Compliance_Status: "COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: 0,
    Non_Compliant_Revenue_Point_Estimate: 0.4,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.930Z",
    Classification: "COMPLIANT",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "PG_2025-10-24",
    Ticker: "PG",
    Company: "The Procter & Gamble Company",
    Industry: "Household & Personal Products",
    Sector: "Consumer Defensive",
    Security_Type: "COM",
    Report_Date: "2025-10-24",
    Screening_Date: "2025-10-24",
    Debt_Ratio_Percent: 22.1,
    Cash_Investment_Ratio_Percent: 4.5,
    Non_Permissible_Income_Percent: 0.2,
    Final_Verdict: "COMPLIANT",
    Shariah_Compliant: "YES",
    Numeric_Screening_Result: "PASS",
    Qualitative_Screening_Result: "PASS",
    Compliance_Status: "COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: 0,
    Non_Compliant_Revenue_Point_Estimate: 0.2,
    Auto_Banned: false,
    Auto_Banned_Reason: null,
    Screening_Timestamp: "2025-12-10T15:32:17.935Z",
    Classification: "COMPLIANT",
    Compliance_Risk_Level: "Low",
    Board_Review_Needed: "NO",
  },
  {
    upsert_key: "MGM_2025-10-26",
    Ticker: "MGM",
    Company: "MGM Resorts International",
    Industry: "Resorts & Casinos",
    Sector: "Consumer Cyclical",
    Security_Type: "COM",
    Report_Date: "2025-10-26",
    Screening_Date: "2025-10-26",
    Debt_Ratio_Percent: 55.3,
    Cash_Investment_Ratio_Percent: 8.1,
    Non_Permissible_Income_Percent: 88.5,
    Final_Verdict: "NON_COMPLIANT",
    Shariah_Compliant: "NO",
    Numeric_Screening_Result: "FAIL",
    Qualitative_Screening_Result: "FAIL",
    Compliance_Status: "NON_COMPLIANT",
    Purification_Required: false,
    Purification_Percentage: null,
    Non_Compliant_Revenue_Point_Estimate: 88.5,
    Auto_Banned: true,
    Auto_Banned_Reason: "Gambling/Casino Operations",
    Screening_Timestamp: "2025-12-10T15:32:17.940Z",
    Classification: "NON_COMPLIANT",
    Compliance_Risk_Level: "High",
    Board_Review_Needed: "NO",
  },
];

// Sample numeric-only records
const sampleNumericRecords = sampleClientFacingRecords.map((r) => ({
  upsert_key: r.upsert_key,
  Ticker: r.Ticker,
  Company: r.Company,
  Report_Date: r.Report_Date,
  Sector: r.Sector,
  Industry: r.Industry,
  Security_Type: r.Security_Type,
  Debt_Ratio: r.Debt_Ratio_Percent,
  Debt_Ratio_Threshold_Pct: 33,
  Debt_Within_Limit: r.Debt_Ratio_Percent <= 33,
  CashInv_Ratio: r.Cash_Investment_Ratio_Percent,
  CashInv_Ratio_Threshold_Pct: 33,
  CashInv_Within_Limit: r.Cash_Investment_Ratio_Percent <= 33,
  NPIN_Ratio: r.Non_Permissible_Income_Percent,
  NPIN_Ratio_Threshold_Pct: 5,
  NPIN_Within_Limit: r.Non_Permissible_Income_Percent <= 5,
  Numeric_Status: r.Numeric_Screening_Result,
  Numeric_Pass: r.Numeric_Screening_Result === "PASS",
  numeric_timestamp: r.Screening_Timestamp,
}));

// Sample industry methodology records (auto-banned)
const sampleIndustryRecords = sampleClientFacingRecords
  .filter((r) => r.Auto_Banned)
  .map((r) => ({
    upsert_key: r.upsert_key,
    ticker: r.Ticker,
    company_name: r.Company,
    report_date: r.Report_Date,
    sector: r.Sector,
    industry: r.Industry,
    typeOfSecurity: r.Security_Type,
    auto_banned: true,
    auto_banned_reason: r.Auto_Banned_Reason,
    industry_classification: "FORBIDDEN",
    industry_methodology_status: "AUTO_BANNED",
    forbiddenIndustryMatched: true,
    forbiddenSecurityMatched: false,
    pref_trust_shares_flag: false,
    methodology: "AAOIFI",
    created_at: r.Screening_Timestamp,
    updated_at: r.Screening_Timestamp,
  }));

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, filters } = await req.json();
    console.log("User:", user.email, "Action:", action, "Filters:", JSON.stringify(filters || {}));

    const result = await handleAction(action, (filters || {}) as Record<string, unknown>);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Shariah dashboard error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleAction(action: string, filters: Record<string, unknown>) {
  switch (action) {
    case "getClientFacingRecords": {
      let data = [...sampleClientFacingRecords];

      // Apply filters
      if (filters.search) {
        const searchLower = (filters.search as string).toLowerCase();
        data = data.filter(
          (r) =>
            r.Ticker.toLowerCase().includes(searchLower) ||
            r.Company.toLowerCase().includes(searchLower)
        );
      }

      if (filters.ticker) {
        const tickerLower = (filters.ticker as string).toLowerCase();
        data = data.filter((r) => r.Ticker.toLowerCase().includes(tickerLower));
      }

      if (filters.sector && filters.sector !== "all") {
        data = data.filter((r) => r.Sector === filters.sector);
      }

      if (filters.industry && filters.industry !== "all") {
        data = data.filter((r) => r.Industry === filters.industry);
      }

      if (filters.finalVerdict && filters.finalVerdict !== "all") {
        data = data.filter((r) => r.Final_Verdict === filters.finalVerdict);
      }

      if (filters.riskLevel && filters.riskLevel !== "all") {
        data = data.filter((r) => r.Compliance_Risk_Level === filters.riskLevel);
      }

      if (filters.shariahCompliant && filters.shariahCompliant !== "all") {
        data = data.filter((r) => r.Shariah_Compliant === filters.shariahCompliant);
      }

      if (filters.autoBanned === "YES") {
        data = data.filter((r) => r.Auto_Banned === true);
      } else if (filters.autoBanned === "NO") {
        data = data.filter((r) => r.Auto_Banned !== true);
      }

      // Pagination
      const page = (filters.page as number) || 1;
      const pageSize = (filters.pageSize as number) || 50;
      const total = data.length;
      const start = (page - 1) * pageSize;
      const paginatedData = data.slice(start, start + pageSize);

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    case "getRecordByKey": {
      const record = sampleClientFacingRecords.find(
        (r) => r.upsert_key === filters.upsertKey
      );
      return record || null;
    }

    case "getNumericRecord": {
      const record = sampleNumericRecords.find(
        (r) => r.upsert_key === filters.upsertKey
      );
      return record || null;
    }

    case "getIndustryMethodology": {
      const record = sampleIndustryRecords.find(
        (r) => r.upsert_key === filters.upsertKey
      );
      return record || null;
    }

    case "getAutoBannedRecords": {
      let data = [...sampleIndustryRecords];

      if (filters.search) {
        const searchLower = (filters.search as string).toLowerCase();
        data = data.filter(
          (r) =>
            r.ticker.toLowerCase().includes(searchLower) ||
            r.company_name.toLowerCase().includes(searchLower)
        );
      }

      const page = (filters.page as number) || 1;
      const pageSize = (filters.pageSize as number) || 50;
      const total = data.length;
      const start = (page - 1) * pageSize;
      const paginatedData = data.slice(start, start + pageSize);

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    case "getNumericRecords": {
      let data = [...sampleNumericRecords];

      if (filters.search) {
        const searchLower = (filters.search as string).toLowerCase();
        data = data.filter(
          (r) =>
            r.Ticker.toLowerCase().includes(searchLower) ||
            r.Company.toLowerCase().includes(searchLower)
        );
      }

      if (filters.numericStatus && filters.numericStatus !== "all") {
        data = data.filter((r) => r.Numeric_Status === filters.numericStatus);
      }

      const page = (filters.page as number) || 1;
      const pageSize = (filters.pageSize as number) || 50;
      const total = data.length;
      const start = (page - 1) * pageSize;
      const paginatedData = data.slice(start, start + pageSize);

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

    case "getDistinctValues": {
      const field = filters.field as string | undefined;
      if (!field) throw new Error("Field is required for getDistinctValues");

      const values = new Set<string>();
      for (const record of sampleClientFacingRecords) {
        const value = record[field as keyof typeof record];
        if (value !== null && value !== undefined && value !== "") {
          values.add(String(value));
        }
      }
      return Array.from(values).sort();
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
