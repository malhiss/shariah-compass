// Frontend CSV data loader for Shariah Screening data
// This loads and parses the CSV file from the public folder using header-based mapping

import type { ScreeningRecord } from '@/types/screening-record';

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

// Build header index map, handling duplicates like .1, .2, _2 suffixes
function buildHeaderMap(headers: string[]): Map<string, number> {
  const headerMap = new Map<string, number>();
  
  for (let i = 0; i < headers.length; i++) {
    const rawHeader = headers[i].trim();
    headerMap.set(rawHeader, i);
  }
  
  return headerMap;
}

// Get value from header map with fallback options for duplicates
function getValue(
  values: string[], 
  headerMap: Map<string, number>, 
  ...headerNames: string[]
): string | undefined {
  for (const name of headerNames) {
    const idx = headerMap.get(name);
    if (idx !== undefined && values[idx] !== undefined) {
      return values[idx];
    }
  }
  return undefined;
}

// Parse CSV data into records using header-based mapping
function parseCSV(csvData: string): ScreeningRecord[] {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // Parse header row to build column index map
  const headerRow = parseCSVRow(lines[0]);
  const headerMap = buildHeaderMap(headerRow);
  
  // Debug: log available headers
  console.log('CSV Headers found:', Array.from(headerMap.keys()).slice(0, 20), '...');
  
  const dataRows = lines.slice(1);
  const records: ScreeningRecord[] = [];
  
  for (const row of dataRows) {
    const values = parseCSVRow(row);
    if (values.length < 10) continue; // Skip incomplete rows
    
    // Helper to get value by header name(s)
    const get = (...names: string[]) => getValue(values, headerMap, ...names);
    
    // For haram_composition_json, prefer _2, then .1, then base
    const haramCompositionJson = get('haram_composition_json_2', 'haram_composition_json.1', 'haram_composition_json');
    
    const record: ScreeningRecord = {
      // Identity
      upsert_key: get('upsert_key') || '',
      ticker: get('ticker') || '',
      company_name: get('company_name') || '',
      report_date: get('report_date') || '',
      methodology_version: get('methodology_version') || '',
      security_type: get('security_type') || '',
      industry: get('industry') || '',
      sector: get('sector') || '',
      
      // Verdict
      final_classification: parseString(get('final_classification')) as ScreeningRecord['final_classification'],
      purification_required: parseBoolean(get('purification_required')),
      purification_pct_recommended: parseNumber(get('purification_pct_recommended')),
      needs_board_review: parseBoolean(get('needs_board_review')),
      doubt_reason: parseString(get('doubt_reason')),
      notes_for_portfolio_manager: parseString(get('notes_for_portfolio_manager')),
      shariah_summary: get('shariah_summary') || '',
      
      // Client summaries
      client_summary: parseString(get('client_summary')),
      client_shariah_summary: parseString(get('client_shariah_summary')),
      
      // Financial Ratios
      debt_ratio_pct: parseNumber(get('debt_ratio_pct')),
      cash_inv_ratio_pct: parseNumber(get('cash_inv_ratio_pct')),
      npin_ratio_pct: parseNumber(get('npin_ratio_pct')),
      debt_status: parseString(get('debt_status')) as ScreeningRecord['debt_status'],
      cash_inv_status: parseString(get('cash_inv_status')) as ScreeningRecord['cash_inv_status'],
      npin_status: parseString(get('npin_status')) as ScreeningRecord['npin_status'],
      debt_threshold_pct: parseNumber(get('debt_threshold_pct')),
      cash_inv_threshold_pct: parseNumber(get('cash_inv_threshold_pct')),
      npin_threshold_pct: parseNumber(get('npin_threshold_pct')),
      debt_ratio_formula: parseString(get('debt_ratio_formula')),
      cash_inv_ratio_formula: parseString(get('cash_inv_ratio_formula')),
      npin_ratio_formula: parseString(get('npin_ratio_formula')),
      npin_numerator_formula: parseString(get('npin_numerator_formula')),
      npin_adjustments_notes: parseString(get('npin_adjustments_notes')),
      
      // Dollar amounts
      denominator_max_usd_mn: parseNumber(get('denominator_max_usd_mn')),
      marketcap_usd_mn: parseNumber(get('marketcap_usd_mn')),
      totalassets_usd_mn: parseNumber(get('totalassets_usd_mn')),
      debt_conventional_usd_mn: parseNumber(get('debt_conventional_usd_mn')),
      cash_st_conv_usd_mn: parseNumber(get('cash_st_conv_usd_mn')),
      lt_invest_conv_usd_mn: parseNumber(get('lt_invest_conv_usd_mn')),
      revenue_total_usd_mn: parseNumber(get('revenue_total_usd_mn')),
      
      // Business status
      business_status: get('business_status') as ScreeningRecord['business_status'] || 'UNKNOWN',
      llm_has_fail_flag: parseBoolean(get('llm_has_fail_flag')),
      llm_has_caution_flag: parseBoolean(get('llm_has_caution_flag')),
      llm_primary_rationale: parseString(get('llm_primary_rationale')),
      
      // Evidence
      evidence_items_json: parseString(get('evidence_items_json')),
      
      // Haram revenue composition
      haram_pct_point: parseNumber(get('haram_pct_point')),
      haram_pct_lower: parseNumber(get('haram_pct_lower')),
      haram_pct_upper: parseNumber(get('haram_pct_upper')),
      haram_total_pct_display: parseString(get('haram_total_pct_display')),
      haram_top_segments_label: parseString(get('haram_top_segments_label')),
      haram_top_segments_names: parseString(get('haram_top_segments_names')),
      halal_pct_point: parseNumber(get('halal_pct_point')),
      haram_segments_json: parseString(get('haram_segments_json')),
      haram_composition_json: haramCompositionJson ? parseString(haramCompositionJson) : null,
      haram_reference_ids_used: parseString(get('haram_reference_ids_used')),
      haram_global_reasoning: parseString(get('haram_global_reasoning')),
      haram_limitations: parseString(get('haram_limitations')),
      haram_confidence: parseString(get('haram_confidence')),
      
      // Key drivers
      key_drivers_json: parseString(get('key_drivers_json')),
      red_flag_industries_json: parseString(get('red_flag_industries_json')),
      shariah_references_json: parseString(get('shariah_references_json')),
      non_compliant_revenue_pct_est_json: parseString(get('non_compliant_revenue_pct_est_json')),
      
      // QA fields
      qa_needs_review: parseBoolean(get('qa_needs_review')),
      qa_status: parseString(get('qa_status')),
      qa_issue_count: parseNumber(get('qa_issue_count')) ? Math.floor(parseNumber(get('qa_issue_count'))!) : null,
      qa_summary_display: parseString(get('qa_summary_display')),
      qa_category_summary: parseString(get('qa_category_summary')),
      qa_reasons_summary: parseString(get('qa_reasons_summary')),
      qa_issues_json: parseString(get('qa_issues_json')),
      qa_timestamp: parseString(get('qa_timestamp')),
      
      // Memo
      shariah_memo_markdown: parseString(get('shariah_memo_markdown')),
      memo_doc_url: parseString(get('memo_doc_url')),
      memo_doc_id: parseString(get('memo_doc_id')),
      
      // Auto-banned
      auto_banned: parseBoolean(get('auto_banned')),
      auto_banned_status: parseString(get('auto_banned_status')),
      auto_banned_reason_clean: parseString(get('auto_banned_reason_clean')),
      auto_banned_summary: parseString(get('auto_banned_summary')),
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
