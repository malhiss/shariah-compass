// MongoDB Collection Types for Shariah Screening Dashboard

// ==================== Client-facing Full Collection ====================
export interface ClientFacingRecord {
  // Identity
  upsert_key: string;
  Ticker: string;
  Company: string;
  Report_Date: string;
  Industry: string;
  Sector: string;
  Security_Type: string;

  // Verdict & labels
  Final_Verdict: 'COMPLIANT' | 'COMPLIANT_WITH_PURIFICATION' | 'NON_COMPLIANT' | 'DOUBTFUL_REVIEW' | null;
  Shariah_Compliant: 'YES' | 'NO' | 'DOUBTFUL' | null;
  Numeric_Screening_Result: 'PASS' | 'FAIL' | null;
  Qualitative_Screening_Result: 'PASS' | 'CAUTION' | 'FAIL' | null;
  Compliance_Status: string | null;
  Verdict_Strength: 'Strong' | 'Moderate' | 'Weak' | null;
  Compliance_Risk_Level: 'Low' | 'Medium' | 'High' | null;
  Key_Risk_Factors: string | null;

  // Core ratios (0-100)
  Debt_Ratio_Percent: number | null;
  Cash_Investment_Ratio_Percent: number | null;
  Non_Permissible_Income_Percent: number | null;

  // Purification
  Purification_Required: boolean | 'YES' | 'NO' | null;
  Purification_Percentage: number | null;
  Purification_Amount_Estimated_USD_mn: number | null;

  // Haram revenue estimate
  Non_Compliant_Revenue_Point_Estimate: number | null;

  // Dual-use
  Dual_Use_Product: 'YES' | 'NO' | null;
  Dual_Use_Comment: string | null;

  // Governance
  Board_Review_Needed: 'YES' | 'NO' | null;
  Doubt_Reason: string | null;
  Portfolio_Manager_Notes: string | null;
  Shariah_References: string | null;

  // Auto-ban
  Auto_Banned: boolean | null;
  Auto_Banned_Reason: string | null;

  // Key findings & timestamps
  Key_Findings: string | null;
  Screening_Timestamp: string | null;
  Classification: string | null;
  Board_Review_Required: boolean | null;
  Screening_Date: string | null;

  // QA
  QA_Status: string | null;
  QA_Issue_Count: number | null;
  QA_Issues: string | null;
  QA_Issues_CSV: string | null;

  // Meta
  methodology: string | null;
  inserted_at: string | null;

  // Zakat fields
  Zakat_Status?: 'ZAKATABLE' | 'NON_ZAKATABLE' | 'MIXED' | 'UNKNOWN' | null;
  Zakatable_Assets_Ratio_Percent?: number | null;
  Zakat_Per_Share_USD?: number | null;
  Zakat_Per_100_Units_USD?: number | null;
  Zakat_Methodology?: string | null;
  Zakat_Notes?: string | null;
}

// ==================== Industry Methodology Collection ====================
export interface IndustryMethodologyRecord {
  upsert_key: string;
  ticker: string;
  company_name: string;
  report_date: string;
  sector: string;
  industry: string;
  typeOfSecurity: string;
  auto_banned: boolean;
  auto_banned_reason: string;
  industry_classification: string;
  industry_methodology_status: 'AUTO_BANNED' | 'ALLOWED_BY_INDUSTRY';
  forbiddenIndustryMatched: boolean;
  forbiddenSecurityMatched: boolean;
  pref_trust_shares_flag: boolean;
  methodology: string;
  created_at: string;
  updated_at: string;
}

// ==================== Numeric Only Screening Collection ====================
export interface NumericOnlyRecord {
  // Identity
  upsert_key: string;
  Ticker: string;
  Company: string;
  Report_Date: string;
  Sector: string;
  Industry: string;
  Security_Type: string;

  // Core monetary fields (numbers)
  MarketCap_USD_mn: number | null;
  TotalAssets_USD_mn: number | null;
  Revenue_Total_USD_mn: number | null;
  Debt_Conventional_USD_mn: number | null;
  Cash_ST_Conv_USD_mn: number | null;
  LT_Invest_Conv_USD_mn: number | null;
  Interest_Income_USD_mn: number | null;
  NonOp_Unidentified_USD_mn: number | null;
  Denominator_MAX_USD_mn: number | null;

  // Ratios (0-100)
  Debt_Ratio: number | null;
  Debt_Ratio_Threshold_Pct: number | null;
  Debt_Within_Limit: boolean | null;
  CashInv_Ratio: number | null;
  CashInv_Ratio_Threshold_Pct: number | null;
  CashInv_Within_Limit: boolean | null;
  NPIN_Ratio: number | null;
  NPIN_Ratio_Threshold_Pct: number | null;
  NPIN_Within_Limit: boolean | null;

  // Status
  Numeric_Status: 'PASS' | 'FAIL' | null;
  Numeric_Pass: boolean | null;
  Numeric_Fail_Reason: string | null;
  Numeric_QA_Flag: boolean | null;

  // Meta
  Methodology: string | null;
  numeric_timestamp: string | null;
  ingestion_timestamp: string | null;
}

// ==================== Query/Filter Types ====================
export interface ScreeningFilters {
  search?: string;
  ticker?: string;
  sector?: string;
  industry?: string;
  finalVerdict?: string;
  riskLevel?: string;
  shariahCompliant?: string;
  boardReviewNeeded?: string;
  autoBanned?: string;
  zakatStatus?: string;
  zakatableAssetsMin?: number;
  zakatMethodology?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== View Mode ====================
export type ViewMode = 'shariah' | 'zakat';

// ==================== Helper Functions ====================
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(2);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

export function getVerdictColor(verdict: string | null): string {
  switch (verdict) {
    case 'COMPLIANT':
      return 'compliant';
    case 'COMPLIANT_WITH_PURIFICATION':
      return 'warning';
    case 'NON_COMPLIANT':
      return 'non-compliant';
    case 'DOUBTFUL_REVIEW':
      return 'doubtful';
    default:
      return 'no-data';
  }
}

export function getZakatStatusColor(status: string | null | undefined): string {
  switch (status) {
    case 'ZAKATABLE':
      return 'compliant';
    case 'NON_ZAKATABLE':
      return 'non-compliant';
    case 'MIXED':
      return 'warning';
    case 'UNKNOWN':
    default:
      return 'no-data';
  }
}

export function getRiskLevelColor(level: string | null): string {
  switch (level) {
    case 'Low':
      return 'compliant';
    case 'Medium':
      return 'warning';
    case 'High':
      return 'non-compliant';
    default:
      return 'no-data';
  }
}

export function coerceToNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? null : num;
}

export function coerceToBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'yes' || lower === 'true' || lower === '1') return true;
    if (lower === 'no' || lower === 'false' || lower === '0') return false;
  }
  return null;
}