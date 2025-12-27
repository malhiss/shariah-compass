// Frontend CSV data loader for Shariah Screening data
// This loads and parses the CSV file from the public folder

import type { ScreeningRecord } from '@/types/screening-record';

// CSV column headers in order (73 columns)
const CSV_HEADERS = [
  'upsert_key', 'ticker', 'company_name', 'report_date', 'methodology_version',
  'security_type', 'industry', 'final_classification', 'purification_required',
  'purification_pct_recommended', 'needs_board_review', 'doubt_reason',
  'notes_for_portfolio_manager', 'shariah_summary', 'debt_ratio_pct',
  'cash_inv_ratio_pct', 'npin_ratio_pct', 'debt_status', 'cash_inv_status',
  'npin_status', 'debt_threshold_pct', 'cash_inv_threshold_pct', 'npin_threshold_pct',
  'debt_ratio_formula', 'cash_inv_ratio_formula', 'npin_ratio_formula',
  'npin_numerator_formula', 'npin_adjustments_notes', 'denominator_max_usd_mn',
  'marketcap_usd_mn', 'totalassets_usd_mn', 'debt_conventional_usd_mn',
  'cash_st_conv_usd_mn', 'lt_invest_conv_usd_mn', 'revenue_total_usd_mn',
  'business_status', 'llm_has_fail_flag', 'llm_has_caution_flag',
  'llm_primary_rationale', 'evidence_items_json', 'haram_pct_point',
  'haram_pct_lower', 'haram_pct_upper', 'haram_total_pct_display',
  'haram_top_segments_label', 'haram_top_segments_names', 'haram_composition_json',
  'halal_pct_point', 'haram_segments_json', 'haram_composition_json_2',
  'haram_reference_ids_used', 'haram_global_reasoning', 'haram_limitations',
  'haram_confidence', 'key_drivers_json', 'red_flag_industries_json',
  'shariah_references_json', 'non_compliant_revenue_pct_est_json',
  'qa_needs_review', 'qa_status', 'qa_issue_count', 'qa_summary_display',
  'qa_category_summary', 'qa_reasons_summary', 'qa_issues_json', 'qa_timestamp',
  'shariah_memo_markdown', 'memo_doc_url', 'memo_doc_id', 'auto_banned',
  'auto_banned_status', 'auto_banned_reason_clean', 'auto_banned_summary'
];

// Helper functions
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === '1' || lower === 'yes';
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function parseString(value: string | undefined): string | null {
  if (!value || value.trim() === '' || value.trim() === '[]' || value.trim() === '{}') {
    return null;
  }
  return value.trim();
}

// Parse a CSV row handling quoted fields
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

// Parse CSV data into records
function parseCSV(csvData: string): ScreeningRecord[] {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // Skip header row
  const dataRows = lines.slice(1);
  const records: ScreeningRecord[] = [];
  
  for (const row of dataRows) {
    const values = parseCSVRow(row);
    if (values.length < 10) continue; // Skip incomplete rows
    
    const record: ScreeningRecord = {
      upsert_key: values[0] || '',
      ticker: values[1] || '',
      company_name: values[2] || '',
      report_date: values[3] || '',
      methodology_version: values[4] || '',
      security_type: values[5] || '',
      industry: values[6] || '',
      final_classification: values[7] as ScreeningRecord['final_classification'],
      purification_required: parseBoolean(values[8]),
      purification_pct_recommended: parseNumber(values[9]),
      needs_board_review: parseBoolean(values[10]),
      doubt_reason: parseString(values[11]),
      notes_for_portfolio_manager: parseString(values[12]),
      shariah_summary: values[13] || '',
      debt_ratio_pct: parseNumber(values[14]),
      cash_inv_ratio_pct: parseNumber(values[15]),
      npin_ratio_pct: parseNumber(values[16]),
      debt_status: parseString(values[17]) as ScreeningRecord['debt_status'],
      cash_inv_status: parseString(values[18]) as ScreeningRecord['cash_inv_status'],
      npin_status: parseString(values[19]) as ScreeningRecord['npin_status'],
      debt_threshold_pct: parseNumber(values[20]),
      cash_inv_threshold_pct: parseNumber(values[21]),
      npin_threshold_pct: parseNumber(values[22]),
      debt_ratio_formula: parseString(values[23]),
      cash_inv_ratio_formula: parseString(values[24]),
      npin_ratio_formula: parseString(values[25]),
      npin_numerator_formula: parseString(values[26]),
      npin_adjustments_notes: parseString(values[27]),
      business_status: values[35] as ScreeningRecord['business_status'] || 'UNKNOWN',
      llm_has_fail_flag: parseBoolean(values[36]),
      llm_has_caution_flag: parseBoolean(values[37]),
      evidence_items_json: parseString(values[39]),
      haram_pct_point: parseNumber(values[40]),
      halal_pct_point: parseNumber(values[47]),
      haram_total_pct_display: parseString(values[43]),
      haram_top_segments_label: parseString(values[44]),
      haram_segments_json: parseString(values[48]),
      haram_limitations: parseString(values[52]),
      haram_confidence: parseString(values[53]),
      key_drivers_json: parseString(values[54]),
      qa_needs_review: parseBoolean(values[58]),
      qa_status: parseString(values[59]),
      qa_issue_count: parseNumber(values[60]) ? Math.floor(parseNumber(values[60])!) : null,
      qa_summary_display: parseString(values[61]),
      qa_category_summary: parseString(values[62]),
      qa_reasons_summary: parseString(values[63]),
      qa_issues_json: parseString(values[64]),
      shariah_memo_markdown: parseString(values[66]),
      memo_doc_url: parseString(values[67]),
      memo_doc_id: parseString(values[68]),
      auto_banned: parseBoolean(values[69]),
      auto_banned_status: parseString(values[70]),
      auto_banned_reason_clean: parseString(values[71]),
      auto_banned_summary: parseString(values[72]),
    };
    
    if (record.ticker && record.upsert_key) {
      records.push(record);
    }
  }
  
  return records;
}

// Cache for loaded data
let cachedData: ScreeningRecord[] | null = null;
let loadingPromise: Promise<ScreeningRecord[]> | null = null;

// Load data from CSV (singleton pattern)
export async function loadScreeningData(): Promise<ScreeningRecord[]> {
  // Return cached data if available
  if (cachedData) return cachedData;
  
  // Return existing promise if already loading
  if (loadingPromise) return loadingPromise;
  
  // Start loading
  loadingPromise = (async () => {
    try {
      const response = await fetch('/data/shariah-screening.csv');
      if (!response.ok) {
        console.error(`Failed to fetch CSV: ${response.status}`);
        return [];
      }
      
      const csvData = await response.text();
      cachedData = parseCSV(csvData);
      console.log(`Loaded ${cachedData.length} screening records from CSV`);
      return cachedData;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      return [];
    } finally {
      loadingPromise = null;
    }
  })();
  
  return loadingPromise;
}

// Get cached data (sync, returns empty if not loaded)
export function getCachedData(): ScreeningRecord[] {
  return cachedData || [];
}

// Find record by ticker
export async function findByTicker(ticker: string): Promise<ScreeningRecord | undefined> {
  const data = await loadScreeningData();
  const normalizedTicker = ticker.trim().toUpperCase();
  return data.find(r => (r.ticker || '').toUpperCase() === normalizedTicker);
}

// Find record by upsert_key
export async function findByUpsertKey(upsertKey: string): Promise<ScreeningRecord | undefined> {
  const data = await loadScreeningData();
  return data.find(r => r.upsert_key === upsertKey);
}

// Get all records with filtering and pagination
export async function getAllRecords(filters?: {
  search?: string;
  finalClassification?: string;
  autoBanned?: boolean | string;
  industry?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ records: ScreeningRecord[]; total: number }> {
  const data = await loadScreeningData();
  let result = [...data];
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(r => 
      (r.ticker || '').toLowerCase().includes(searchLower) ||
      (r.company_name || '').toLowerCase().includes(searchLower)
    );
  }
  
  if (filters?.finalClassification && filters.finalClassification !== 'all') {
    result = result.filter(r => r.final_classification === filters.finalClassification);
  }
  
  if (filters?.autoBanned !== undefined) {
    const autoBanned = filters.autoBanned === true || filters.autoBanned === 'YES';
    const notAutoBanned = filters.autoBanned === false || filters.autoBanned === 'NO';
    if (autoBanned) {
      result = result.filter(r => r.auto_banned === true);
    } else if (notAutoBanned) {
      result = result.filter(r => r.auto_banned !== true);
    }
  }
  
  if (filters?.industry && filters.industry !== 'all') {
    result = result.filter(r => r.industry === filters.industry);
  }
  
  const total = result.length;
  
  // Apply pagination
  if (filters?.page !== undefined && filters?.pageSize) {
    const start = (filters.page - 1) * filters.pageSize;
    result = result.slice(start, start + filters.pageSize);
  }
  
  return { records: result, total };
}

// Get distinct values for a field
export async function getDistinctValues(field: keyof ScreeningRecord): Promise<string[]> {
  const data = await loadScreeningData();
  const values = new Set<string>();
  
  for (const record of data) {
    const value = record[field];
    if (value !== null && value !== undefined && value !== '') {
      values.add(String(value));
    }
  }
  
  return Array.from(values).sort();
}
