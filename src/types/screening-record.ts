// Extended Screening Record Types matching the Methodology 3 Website Schema v1
// This defines the complete data contract for client and staff views

// ============ JSON PARSING HELPERS ============

// Safe JSON parse for any value (string, object, or undefined)
export function safeParseJSON<T>(value: string | T | null | undefined, fallback: T): T {
  if (value === null || value === undefined || value === '' || value === '[]' || value === '{}') {
    return fallback;
  }
  // If already parsed object/array, return it
  if (typeof value === 'object') {
    return value as T;
  }
  // Parse string
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

// Safe JSON parse for arrays
export function safeParseJSONArray<T>(value: string | T[] | null | undefined): T[] {
  return safeParseJSON<T[]>(value, []);
}

// Safe JSON parse for objects
export function safeParseJSONObject<T extends object>(value: string | T | null | undefined): T | null {
  const result = safeParseJSON<T | null>(value, null);
  return result;
}

// ============ DATA CONTRACT TYPES ============

// Composition item within a haram segment
export interface CompositionItem {
  item_name?: string;
  name?: string;
  haram_pct_of_total_revenue_lower?: number | null;
  haram_pct_of_total_revenue_upper?: number | null;
  haram_pct_of_total_revenue_point_estimate?: number | null;
  pct_of_revenue?: number | null;
  why_haram?: string;
  why_it_matters?: string;
  reference_ids?: string[];
}

// Reference for segment or composition
export interface ReferenceItem {
  id?: string;
  source_name?: string;
  source?: string;
  source_type?: string;
  what_it_supports?: string;
  supports?: string;
  url?: string;
  as_of?: string;
  asOf?: string;
}

// Haram segment breakdown
export interface HaramSegment {
  name: string;
  segment_name?: string;
  point?: number | null;
  lower?: number | null;
  upper?: number | null;
  pct_of_revenue?: number | null;
  confidence?: string | number | null;
  reasoning?: string | null;
  limitations?: string | null;
  why_it_matters?: string | null;
  composition?: CompositionItem[];
  references?: ReferenceItem[];
  description?: string;
  haram_pct_of_total_revenue_lower?: number | null;
  haram_pct_of_total_revenue_point_estimate?: number | null;
  haram_pct_of_total_revenue_upper?: number | null;
  global_reasoning?: string | null;
}

// Evidence item
export interface EvidenceItem {
  category?: string;
  severity?: 'FAIL' | 'CAUTION' | 'INFO' | string;
  rationale?: string;
  snippet?: string;
  source?: string;
  ref?: string;
  url?: string;
}

// QA Issue
export interface QAIssue {
  category?: string;
  description?: string;
  severity?: string;
}

// Key Driver item
export interface KeyDriverItem {
  driver?: string;
  text?: string;
  name?: string;
}

// Red Flag Industry item
export interface RedFlagItem {
  industry?: string;
  name?: string;
  text?: string;
  reason?: string;
}

// Shariah Key Bullet
export interface ShariahBulletItem {
  bullet?: string;
  text?: string;
  point?: string;
}

// ============ MAIN SCREENING RECORD TYPE ============
// Complete ScreeningRecord type with all fields from Methodology 3 data contract
export interface ScreeningRecord {
  // ===== IDENTITY / HEADER =====
  upsert_key: string;
  ticker?: string;
  company_name?: string;
  sector?: string;
  industry?: string;
  report_date?: string;
  screening_date?: string; // Format: YYYY-MM-DD
  methodology_name?: string; // Always "Invesense Methodology"
  methodology_version?: string;
  security_type?: string;
  exchange?: string | null;
  country?: string | null;

  // Company Profile (optional)
  reporting_period?: string | null;
  company_description?: string | null;
  business_description?: string | null; // NEW: Company business description
  business_segments_summary?: string[] | null;

  // Legacy identity fields (PascalCase - old format)
  Ticker?: string;
  Company?: string;
  Report_Date?: string;
  Industry?: string;
  Sector?: string;
  Security_Type?: string;

  // ===== VERDICT & RISK (PRIMARY) =====
  final_classification?: 'COMPLIANT' | 'COMPLIANT_WITH_PURIFICATION' | 'NON_COMPLIANT' | 'DOUBTFUL_REVIEW' | string | null;
  final_classification_based_on_estimate?: 'COMPLIANT' | 'COMPLIANT_WITH_PURIFICATION' | 'NON_COMPLIANT' | 'DOUBTFUL_REVIEW' | string | null; // NEW: Estimated verdict
  client_verdict_label?: string | null;
  client_risk_level?: string | null;
  needs_board_review?: boolean | null;
  doubt_reason?: string | null;
  business_status?: 'PASS' | 'FAIL' | 'CAUTION' | 'REVIEW' | string | null;

  // ===== SHARIAH SUMMARY (CLIENT) =====
  shariah_summary?: string | null;
  final_shariah_summary?: string | null; // NEW: Final shariah summary for display
  shariah_key_bullets_json?: string | null;
  client_summary?: string | null;
  client_what_it_means_for_investors?: string | null;

  // ===== ESTIMATED NPIN (NEW SECTION) =====
  estimated_npin_status?: 'PASS' | 'FAIL' | 'UNKNOWN' | string | null;
  estimated_npin_threshold_pct?: number | null;
  estimated_npin_value_used_point?: number | null;
  estimated_npin_value_used_source?: string | null;
  estimated_npin_purification_required?: boolean | null;
  estimated_npin_purification_pct_recommended?: number | null;
  estimated_npin_final_shariah_summary?: string | null; // NEW: Estimated logic summary
  est_purification_pct_recommended?: number | null; // From CSV: estimated purification percentage

  // ===== HARAM EXPOSURE (CLIENT + WEBSITE CHARTS) =====
  client_haram_total_pct_display?: string | null;
  client_top_haram_segments_label?: string | null;
  client_top_haram_composition_label?: string | null;
  client_haram_breakdown?: string | null;
  website_haram_segments_json?: string | null;
  website_haram_composition_json?: string | null;

  // Legacy haram fields
  haram_pct_point?: number | null;
  haram_pct_lower?: number | null;
  haram_pct_upper?: number | null;
  halal_pct_point?: number | null;
  halal_pct_display_conservative?: number | null;
  haram_pct_display_conservative?: number | null;
  haram_total_pct_display?: string | null;
  haram_confidence?: string | null;
  haram_limitations?: string | null;
  haram_segments_json?: string | null;
  haram_segments?: HaramSegment[];
  haram_composition_json?: string | null;
  haram_top_segments_label?: string | null;
  haram_top_composition_json?: string | null; // NEW: For composition donut fallback
  client_top_segments_json?: string | null;
  client_top_composition_json?: string | null;

  // ===== PURIFICATION =====
  purification_required?: boolean | null;
  purification_pct_recommended?: number | null;
  client_purification_guidance?: string | null;

  // ===== QUANTITATIVE SCREEN (RATIOS) =====
  rule_result?: 'PASS' | 'FAIL' | string | null;
  debt_ratio_pct?: number | null;
  cash_inv_ratio_pct?: number | null;
  npin_ratio_pct?: number | null;
  debt_status?: 'PASS' | 'FAIL' | 'UNKNOWN' | string | null;
  cash_inv_status?: 'PASS' | 'FAIL' | 'UNKNOWN' | string | null;
  npin_status?: 'PASS' | 'FAIL' | 'UNKNOWN' | string | null;
  debt_threshold_pct?: number | null;
  cash_inv_threshold_pct?: number | null;
  npin_threshold_pct?: number | null;
  debt_ratio_formula?: string | null;
  cash_inv_ratio_formula?: string | null;
  npin_ratio_formula?: string | null;
  npin_numerator_formula?: string | null;
  npin_adjustments_notes?: string | null;

  // Client quantitative fields (legacy)
  client_numbers_debt_ratio_pct?: number | string | null;
  client_numbers_cashinv_ratio_pct?: number | string | null;
  client_numbers_npin_ratio_pct?: number | string | null;

  // Dollar amounts (FMP fields)
  denominator_max_usd_mn?: number | null;
  marketcap_usd_mn?: number | null;
  totalassets_usd_mn?: number | null;
  debt_conventional_usd_mn?: number | null;
  cash_st_conv_usd_mn?: number | null;
  lt_invest_conv_usd_mn?: number | null;
  revenue_total_usd_mn?: number | null;

  // Legacy ratio fields
  Debt_Ratio?: number | null;
  Debt_Ratio_Percent?: number | null;
  CashInv_Ratio?: number | null;
  Cash_Investment_Ratio_Percent?: number | null;
  NPIN_Ratio?: number | null;
  Non_Permissible_Income_Percent?: number | null;
  Non_Compliant_Revenue_Point_Estimate?: number | null;
  Debt_Ratio_Formula?: string | null;
  CashInv_Ratio_Formula?: string | null;
  NPIN_Ratio_Formula?: string | null;
  NPIN_Numerator_Formula?: string | null;
  NPIN_Adjustments_Notes?: string | null;

  // ===== DONUT CHARTS (ARRAYS) =====
  donut_series_json?: { label: string; value: number }[] | string | null; // Parsed to array at load time
  donut_segments_json?: { name: string; point?: number; value?: number; lower?: number; upper?: number; confidence?: string }[] | string | null; // Parsed to array at load time

  // ===== DATA QUALITY / QA (CLIENT-FACING + STRUCTURED) =====
  qa_summary_display?: string | null;
  qa_status?: string | null;
  qa_issue_count?: number | null;
  qa_category_summary?: string | null;
  qa_reasons_summary?: string | null;
  qa_timestamp?: string | null;
  client_data_quality_note?: string | null;
  client_data_quality_top_reasons_json?: string | null;

  // Legacy QA fields
  qa_needs_review?: boolean | null;
  qa_issues_json?: string | null;
  qa_issues_collapsed?: string | null;
  QA_Needs_Review?: boolean | null;
  QA_Status?: string | null;
  QA_Issue_Count?: number | null;
  QA_Issues?: string | null;
  QA_Issues_CSV?: string | null;
  QA_Issues_Parsed?: QAIssue[] | string[];

  // ===== EVIDENCE / MEMO / AUDIT =====
  memo_doc_url?: string | null;
  memo_doc_id?: string | null;
  evidence_items_json?: string | null;
  verdict_evidence_items_json?: string | null; // NEW: Array of evidence items
  final_ticker_summary_json?: string | null;
  final_ticker_summary_last_updated?: string | null;
  website_story?: string | null; // NEW: Transcript story / evidence text

  // Legacy evidence fields
  evidence_items?: EvidenceItem[];
  evidence_category?: string[];
  evidence_severity?: string[];
  evidence_rationale?: string[];
  evidence_snippet?: string[];
  evidence_source?: string[];

  // Memo content
  shariah_memo_markdown?: string | null;
  shariah_memo?: string | null;

  // ===== EXPLAINABILITY (ENGINE OUTPUTS) =====
  llm_primary_rationale?: string | null;
  key_drivers_json?: string | null;
  red_flag_industries_json?: string | null;
  llm_has_fail_flag?: boolean | null;
  llm_has_caution_flag?: boolean | null;

  // ===== REFERENCES / DISCLOSURE =====
  client_references_json?: string | null;
  website_references_json?: string | null;
  haram_references_json?: string | null;
  references_json?: string | null; // NEW: Primary references array
  client_disclaimer_short?: string | null;
  shariah_references_json?: string | null;

  // ===== PORTFOLIO MANAGER NOTES =====
  notes_for_portfolio_manager?: string | null;
  Portfolio_Manager_Notes?: string | null;
  Doubt_Reason?: string | null;

  // ===== LEGACY / OTHER FIELDS =====
  Final_Verdict?: 'COMPLIANT' | 'COMPLIANT_WITH_PURIFICATION' | 'NON_COMPLIANT' | 'DOUBTFUL_REVIEW' | string | null;
  Shariah_Compliant?: 'YES' | 'NO' | 'DOUBTFUL' | null;
  Numeric_Screening_Result?: 'PASS' | 'FAIL' | null;
  Qualitative_Screening_Result?: 'PASS' | 'CAUTION' | 'FAIL' | null;
  Compliance_Status?: string | null;
  Verdict_Strength?: 'Strong' | 'Moderate' | 'Weak' | null;
  Compliance_Risk_Level?: 'Low' | 'Medium' | 'High' | null;
  Key_Risk_Factors?: string | null;
  Purification_Required?: boolean | string | null;
  Purification_Percentage?: number | null;
  Board_Review_Needed?: boolean | string | null;

  // Auto-banned
  auto_banned?: boolean | null;
  auto_banned_status?: string | null;
  auto_banned_reason_clean?: string | null;
  auto_banned_summary?: string | null;
  Auto_Banned?: boolean | null;
  Auto_Banned_Reason?: string | null;

  // Client identity fields (legacy)
  client_identity_ticker?: string | null;
  client_identity_company_name?: string | null;
  client_identity_report_date?: string | null;
  client_identity_security_type?: string | null;
  client_identity_industry?: string | null;
  client_identity_sector?: string | null;

  // Client headline fields (legacy)
  client_headline_final_classification?: string | null;
  client_headline_screening_status?: string | null;
  client_headline_one_line_summary?: string | null;
  client_badges_json?: string | null;
  client_key_points_json?: string | null;
  client_shariah_summary?: string | null;
  client_key_points?: string | null;
  client_badges?: string | null;
  client_website_summary_json?: string | null;

  // Client board review fields
  client_board_review_needs_review?: boolean | null;
  client_board_review_doubt_reason?: string | null;

  // Client data quality display
  client_data_quality_summary_display?: string | null;

  // Other legacy fields
  haram_revenue_pct_for_screening?: number | null;
  haram_reference_ids_used?: string | null;
  haram_global_reasoning?: string | null;
  haram_top_segments_names?: string | null;
  non_compliant_revenue_pct_est_json?: string | null;
  Dual_Use_Product?: 'YES' | 'NO' | null;
  Dual_Use_Comment?: string | null;
  Shariah_References?: string | null;
  Key_Findings?: string | null;
  Screening_Timestamp?: string | null;
  Screening_Date?: string | null;
  Classification?: string | null;
  Board_Review_Required?: boolean | null;
  Purification_Amount_Estimated_USD_mn?: number | null;
  methodology?: string | null;
  inserted_at?: string | null;
  payload_json?: string | null;
  screening_run_at?: string | null; // For deriving screening_date if not present

  // Zakat fields (for Zakat view mode)
  Zakat_Status?: 'ZAKATABLE' | 'NON_ZAKATABLE' | 'MIXED' | 'UNKNOWN' | null;
  Zakatable_Assets_Ratio_Percent?: number | null;
  Zakat_Per_Share_USD?: number | null;
  Zakat_Per_100_Units_USD?: number | null;
  Zakat_Methodology?: string | null;
  Zakat_Notes?: string | null;
}

// Helper to normalize haram segments from JSON string
export function normalizeHaramSegments(record: ScreeningRecord): HaramSegment[] {
  // Try JSON string first
  if (record.haram_segments_json) {
    const parsed = safeParseJSON<HaramSegment[]>(record.haram_segments_json, []);
    if (parsed.length > 0) return parsed;
  }
  // Fall back to array field
  if (record.haram_segments && Array.isArray(record.haram_segments)) {
    return record.haram_segments;
  }
  return [];
}

// Helper to normalize evidence from JSON string or array
export function normalizeEvidence(record: ScreeningRecord): EvidenceItem[] {
  // Try JSON string first
  if (record.evidence_items_json) {
    const parsed = safeParseJSON<EvidenceItem[]>(record.evidence_items_json, []);
    if (parsed.length > 0) return parsed;
  }

  // If evidence_items exists, use that
  if (record.evidence_items && Array.isArray(record.evidence_items) && record.evidence_items.length > 0) {
    return record.evidence_items;
  }

  // Otherwise try to zip separate arrays
  const categories = record.evidence_category || [];
  const severities = record.evidence_severity || [];
  const rationales = record.evidence_rationale || [];
  const snippets = record.evidence_snippet || [];
  const sources = record.evidence_source || [];

  const maxLen = Math.max(
    categories.length,
    severities.length,
    rationales.length,
    snippets.length,
    sources.length
  );

  if (maxLen === 0) return [];

  const items: EvidenceItem[] = [];
  for (let i = 0; i < maxLen; i++) {
    items.push({
      category: categories[i] || undefined,
      severity: severities[i] || undefined,
      rationale: rationales[i] || undefined,
      snippet: snippets[i] || undefined,
      source: sources[i] || undefined,
    });
  }

  return items;
}

// Helper to normalize QA issues from JSON string or array
export function normalizeQAIssues(record: ScreeningRecord): QAIssue[] {
  // Try JSON string first
  if (record.qa_issues_json) {
    const parsed = safeParseJSON<QAIssue[]>(record.qa_issues_json, []);
    if (parsed.length > 0) return parsed;
  }

  // Try parsed issues
  if (record.QA_Issues_Parsed && Array.isArray(record.QA_Issues_Parsed)) {
    return record.QA_Issues_Parsed.map((issue) => {
      if (typeof issue === 'string') {
        return { description: issue };
      }
      return issue as QAIssue;
    });
  }

  // Fall back to CSV string
  if (record.QA_Issues_CSV) {
    return record.QA_Issues_CSV.split(',').map((s) => ({
      description: s.trim(),
    }));
  }

  // Fall back to QA_Issues string
  if (record.QA_Issues) {
    const parsed = safeParseJSON<QAIssue[]>(record.QA_Issues, []);
    if (parsed.length > 0) return parsed;
    // Treat as comma-separated
    return record.QA_Issues.split(',').map((s) => ({
      description: s.trim(),
    }));
  }

  return [];
}

// Get classification display label
export function getClassificationLabel(classification: string | null | undefined): string {
  switch (classification) {
    case 'COMPLIANT':
      return 'Compliant';
    case 'COMPLIANT_WITH_PURIFICATION':
      return 'Compliant with Purification';
    case 'NON_COMPLIANT':
      return 'Non-Compliant';
    case 'DOUBTFUL_REVIEW':
      return 'Doubtful - Review Required';
    default:
      return 'Not Available';
  }
}

// Get classification color class
export function getClassificationColor(classification: string | null | undefined): string {
  switch (classification) {
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

// Memo URL builder
export function getMemoUrl(record: ScreeningRecord): string | null {
  if (record.memo_doc_url) {
    return record.memo_doc_url;
  }
  if (record.memo_doc_id) {
    return `https://docs.google.com/document/d/${record.memo_doc_id}/view`;
  }
  return null;
}

// Get record ticker (handles both formats)
export function getRecordTicker(record: ScreeningRecord): string {
  return record.ticker || record.Ticker || 'N/A';
}

// Get record company name (handles both formats)
export function getRecordCompanyName(record: ScreeningRecord): string {
  return record.company_name || record.Company || 'N/A';
}

// Get record report date (handles both formats)
export function getRecordReportDate(record: ScreeningRecord): string | undefined {
  return record.report_date || record.Report_Date;
}

// Get halal percentage (calculate from haram if not present)
export function getHalalPct(record: ScreeningRecord): number | null {
  if (record.halal_pct_point !== null && record.halal_pct_point !== undefined) {
    return record.halal_pct_point;
  }
  const haramPct = record.haram_pct_point ?? record.Non_Compliant_Revenue_Point_Estimate;
  if (haramPct !== null && haramPct !== undefined) {
    return 100 - haramPct;
  }
  return null;
}

// Get haram percentage
export function getHaramPct(record: ScreeningRecord): number | null {
  return record.haram_pct_point ?? record.Non_Compliant_Revenue_Point_Estimate ?? null;
}

// Generate client-friendly summary if not present
export function getClientSummary(record: ScreeningRecord): string {
  if (record.client_summary) {
    return record.client_summary;
  }
  
  // Derive from available fields
  const parts: string[] = [];
  const classification = getClassificationLabel(record.final_classification);
  parts.push(`This security is classified as ${classification}.`);
  
  if (record.haram_pct_point !== null && record.haram_pct_point !== undefined) {
    parts.push(`Non-compliant revenue is estimated at ${record.haram_pct_point.toFixed(1)}%.`);
  }
  
  if (record.haram_top_segments_label) {
    parts.push(`Key concerns: ${record.haram_top_segments_label}.`);
  }
  
  if (record.purification_required && record.purification_pct_recommended) {
    parts.push(`Purification of ${record.purification_pct_recommended.toFixed(2)}% is recommended.`);
  }
  
  return parts.join(' ');
}

// Generate client-friendly Shariah summary if not present
export function getClientShariahSummary(record: ScreeningRecord): string {
  if (record.client_shariah_summary) {
    return record.client_shariah_summary;
  }
  
  // Derive from QA or other fields
  if (record.qa_summary_display) {
    return record.qa_summary_display;
  }
  
  const classification = record.final_classification;
  if (classification === 'COMPLIANT') {
    return 'This security meets Shariah compliance requirements based on our methodology.';
  } else if (classification === 'COMPLIANT_WITH_PURIFICATION') {
    return 'This security is Shariah compliant with purification. A portion of income should be donated to charity.';
  } else if (classification === 'NON_COMPLIANT') {
    return 'This security does not meet Shariah compliance requirements due to impermissible business activities or financial ratios.';
  } else if (classification === 'DOUBTFUL_REVIEW') {
    return 'This security requires further review by a Shariah board due to uncertain compliance status.';
  }
  
  return 'Shariah compliance status pending review.';
}
