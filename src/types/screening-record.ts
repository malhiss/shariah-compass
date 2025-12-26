// Extended Screening Record Types matching the n8n pipeline data contract
// This extends the base ClientFacingRecord with additional fields

import type { ClientFacingRecord } from './mongodb';

// Haram segment breakdown
export interface HaramSegment {
  name: string;
  description?: string;
  haram_pct_of_total_revenue_lower?: number | null;
  haram_pct_of_total_revenue_point_estimate?: number | null;
  haram_pct_of_total_revenue_upper?: number | null;
  confidence?: string | null;
  global_reasoning?: string | null;
  limitations?: string | null;
}

// Evidence item
export interface EvidenceItem {
  category?: string;
  severity?: string;
  rationale?: string;
  snippet?: string;
  source?: string;
}

// QA Issue
export interface QAIssue {
  category?: string;
  description?: string;
  severity?: string;
}

// Extended record with all fields from data contract
export interface ScreeningRecord extends ClientFacingRecord {
  // Extended verdict & actionability
  final_classification?: 'COMPLIANT' | 'COMPLIANT_WITH_PURIFICATION' | 'NON_COMPLIANT' | 'DOUBTFUL_REVIEW' | null;
  purification_required?: boolean | null;
  purification_pct_recommended?: number | null;
  needs_board_review?: boolean | null;

  // Numeric screen formulas
  Debt_Ratio?: number | null;
  CashInv_Ratio?: number | null;
  NPIN_Ratio?: number | null;
  Debt_Ratio_Formula?: string | null;
  CashInv_Ratio_Formula?: string | null;
  NPIN_Ratio_Formula?: string | null;
  NPIN_Numerator_Formula?: string | null;
  NPIN_Adjustments_Notes?: string | null;

  // Haram breakdown
  haram_revenue_pct_for_screening?: number | null;
  haram_total_pct_display?: string | null;
  haram_top_segments_label?: string | null;
  haram_segments?: HaramSegment[];

  // Evidence
  llm_has_fail_flag?: boolean | null;
  llm_has_caution_flag?: boolean | null;
  evidence_items?: EvidenceItem[];
  // Alternative: separate arrays that can be zipped
  evidence_category?: string[];
  evidence_severity?: string[];
  evidence_rationale?: string[];
  evidence_snippet?: string[];
  evidence_source?: string[];

  // QA
  QA_Needs_Review?: boolean | null;
  QA_Issues_Parsed?: QAIssue[] | string[];
  qa_summary_display?: string | null;
  qa_category_summary?: string | null;
  qa_reasons_summary?: string | null;
  qa_issues_collapsed?: string | null;

  // Narrative
  shariah_summary?: string | null;
  shariah_memo?: string | null;
  memo_doc_url?: string | null;
  memo_doc_id?: string | null;

  // Debug payload (optional)
  payload_json?: string | null;
}

// Helper to normalize evidence from either format
export function normalizeEvidence(record: ScreeningRecord): EvidenceItem[] {
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

  // Find max length
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

// Helper to normalize QA issues
export function normalizeQAIssues(record: ScreeningRecord): QAIssue[] {
  // Try parsed issues first
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
    try {
      const parsed = JSON.parse(record.QA_Issues);
      if (Array.isArray(parsed)) {
        return parsed.map((item) =>
          typeof item === 'string' ? { description: item } : item
        );
      }
    } catch {
      // Not JSON, treat as comma-separated or single string
      return record.QA_Issues.split(',').map((s) => ({
        description: s.trim(),
      }));
    }
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
