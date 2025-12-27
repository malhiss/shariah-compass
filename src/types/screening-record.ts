// Extended Screening Record Types matching the Methodology 3 Website Schema v1
// This defines the complete data contract for client and staff views

// Haram segment breakdown
export interface HaramSegment {
  name: string;
  point?: number | null;
  lower?: number | null;
  upper?: number | null;
  confidence?: string | null;
  reasoning?: string | null;
  limitations?: string | null;
  // Legacy fields
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
}

// QA Issue
export interface QAIssue {
  category?: string;
  description?: string;
  severity?: string;
}

// Complete ScreeningRecord type with all fields from Methodology 3 data contract
export interface ScreeningRecord {
  // Identity fields (snake_case - new format)
  upsert_key: string;
  ticker?: string;
  company_name?: string;
  report_date?: string;
  methodology_version?: string;
  security_type?: string;
  industry?: string;
  sector?: string;

  // Legacy identity fields (PascalCase - old format)
  Ticker?: string;
  Company?: string;
  Report_Date?: string;
  Industry?: string;
  Sector?: string;
  Security_Type?: string;

  // Verdict & Action Bar (new format)
  final_classification?: 'COMPLIANT' | 'COMPLIANT_WITH_PURIFICATION' | 'NON_COMPLIANT' | 'DOUBTFUL_REVIEW' | string | null;
  purification_required?: boolean | null;
  purification_pct_recommended?: number | null;
  needs_board_review?: boolean | null;
  shariah_summary?: string | null;

  // Verdict (legacy format)
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

  // Business Activity
  business_status?: 'PASS' | 'FAIL' | 'CAUTION' | 'REVIEW' | string | null;
  llm_has_fail_flag?: boolean | null;
  llm_has_caution_flag?: boolean | null;

  // Financial Ratios - New format (snake_case)
  debt_ratio_pct?: number | null;
  debt_status?: 'PASS' | 'FAIL' | 'UNKNOWN' | string | null;
  debt_threshold_pct?: number | null;
  debt_ratio_formula?: string | null;
  cash_inv_ratio_pct?: number | null;
  cash_inv_status?: 'PASS' | 'FAIL' | 'UNKNOWN' | string | null;
  cash_inv_threshold_pct?: number | null;
  cash_inv_ratio_formula?: string | null;
  npin_ratio_pct?: number | null;
  npin_status?: 'PASS' | 'FAIL' | 'UNKNOWN' | string | null;
  npin_threshold_pct?: number | null;
  npin_ratio_formula?: string | null;
  npin_numerator_formula?: string | null;
  npin_adjustments_notes?: string | null;

  // Financial Ratios - Legacy format (PascalCase)
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

  // Revenue Composition
  haram_pct_point?: number | null;
  haram_pct_lower?: number | null;
  haram_pct_upper?: number | null;
  halal_pct_point?: number | null;
  haram_total_pct_display?: string | null;
  haram_confidence?: string | null;
  haram_limitations?: string | null;
  haram_segments_json?: string | null;
  haram_segments?: HaramSegment[];
  haram_revenue_pct_for_screening?: number | null;
  haram_reference_ids_used?: string | null;
  haram_global_reasoning?: string | null;
  haram_top_segments_names?: string | null;
  haram_composition_json?: string | null;
  haram_top_segments_label?: string | null;

  // Evidence
  evidence_items_json?: string | null;
  evidence_items?: EvidenceItem[];
  evidence_category?: string[];
  evidence_severity?: string[];
  evidence_rationale?: string[];
  evidence_snippet?: string[];
  evidence_source?: string[];

  // QA (Staff-only) - New format
  qa_needs_review?: boolean | null;
  qa_status?: string | null;
  qa_issue_count?: number | null;
  qa_summary_display?: string | null;
  qa_category_summary?: string | null;
  qa_reasons_summary?: string | null;
  qa_issues_json?: string | null;
  qa_issues_collapsed?: string | null;

  // QA - Legacy format
  QA_Needs_Review?: boolean | null;
  QA_Status?: string | null;
  QA_Issue_Count?: number | null;
  QA_Issues?: string | null;
  QA_Issues_CSV?: string | null;
  QA_Issues_Parsed?: QAIssue[] | string[];

  // Memo & Report
  shariah_memo_markdown?: string | null;
  shariah_memo?: string | null;
  memo_doc_url?: string | null;
  memo_doc_id?: string | null;

  // Notes
  doubt_reason?: string | null;
  notes_for_portfolio_manager?: string | null;
  key_drivers_json?: string | null;
  Doubt_Reason?: string | null;
  Portfolio_Manager_Notes?: string | null;

  // Other legacy fields
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

  // Debug payload (optional)
  payload_json?: string | null;
}

// Helper to safely parse JSON with fallback
export function safeParseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value || value === '[]' || value === '{}' || value === '') {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
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
