// Frontend CSV data loader for Shariah Screening data
// This loads and parses the CSV file from the public folder using header-based mapping

import type { ScreeningRecord } from '@/types/screening-record';

// ============ SAFE PARSE UTILITY (REQUIRED) ============
// Returns value if already array/object, parses JSON string, returns null on failure
export function safeParse<T>(value: T | string | null | undefined): T | null {
  if (value === null || value === undefined) return null;
  if (value === '' || value === '[]' || value === '{}') return null;
  
  // If already an array or object, return it
  if (typeof value === 'object') {
    return value as T;
  }
  
  // If string that looks like JSON, try to parse
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed) as T;
      } catch {
        return null;
      }
    }
  }
  
  return null;
}

// Safe parse for arrays with fallback to empty array
export function safeParseArray<T>(value: T[] | string | null | undefined): T[] {
  const parsed = safeParse<T[]>(value);
  return Array.isArray(parsed) ? parsed : [];
}

// Helper functions
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === '1' || lower === 'yes';
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null;
  // Remove currency formatting like "$404,487.0m" -> 404487.0
  const cleaned = value.replace(/[$,m%]/gi, '').replace(/\(.*?\)/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseString(value: string | undefined): string | null {
  if (!value || value.trim() === '' || value.trim() === '[]' || value.trim() === '{}') {
    return null;
  }
  return value.trim();
}

// Safe JSON parsing helpers - use safeParse internally
function parseJsonArraySafe(value: string | undefined): unknown[] {
  if (!value || value.trim() === '' || value.trim() === '[]') return [];
  const parsed = safeParse<unknown[]>(value);
  return Array.isArray(parsed) ? parsed : [];
}

function parseJsonObjectSafe(value: string | undefined): Record<string, unknown> {
  if (!value || value.trim() === '' || value.trim() === '{}') return {};
  const parsed = safeParse<Record<string, unknown>>(value);
  return (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) ? parsed : {};
}

// Parse business_segments_summary which can be JSON array or pipe-delimited string
function parseBusinessSegments(value: string | undefined): string[] | null {
  if (!value || value.trim() === '') return null;
  
  const trimmed = value.trim();
  
  // Try JSON array first using safeParse
  if (trimmed.startsWith('[')) {
    const parsed = safeParse<string[]>(trimmed);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(s => String(s).trim()).filter(s => s.length > 0);
    }
    return null;
  }
  
  // Try pipe-delimited
  if (trimmed.includes('|')) {
    const segments = trimmed.split('|').map(s => s.trim()).filter(s => s.length > 0);
    return segments.length > 0 ? segments : null;
  }
  
  // Single segment
  return [trimmed];
}

// Parse CSV content handling quoted fields with embedded newlines
function parseCSVContent(csvData: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvData.length; i++) {
    const char = csvData[i];
    const nextChar = csvData[i + 1];
    
    if (char === '"') {
      if (!inQuotes) {
        inQuotes = true;
      } else if (nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        // End of quoted field
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      // End of row
      if (char === '\r') i++; // Skip \n in \r\n
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim())) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else if (char === '\r' && !inQuotes) {
      // Solo \r as line ending
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim())) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim())) {
      rows.push(currentRow);
    }
  }
  
  return rows;
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
  const rows = parseCSVContent(csvData);
  if (rows.length < 2) return [];
  
  // First row is headers
  const headerRow = rows[0];
  const headerMap = buildHeaderMap(headerRow);
  
  // Headers parsed - debug logging removed for production security
  
  const dataRows = rows.slice(1);
  const records: ScreeningRecord[] = [];
  
  for (const values of dataRows) {
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
      screening_date: parseString(get('screening_date')) || (get('screening_run_at') ? get('screening_run_at')?.slice(0, 10) : null) || null,
      methodology_name: 'Dalil Methodology', // Always use this constant
      methodology_version: get('methodology_version') || '',
      security_type: get('security_type') || '',
      industry: get('industry') || '',
      sector: get('sector') || '',
      
      // Company Profile fields (optional)
      exchange: parseString(get('exchange')),
      country: parseString(get('country')),
      reporting_period: parseString(get('reporting_period')),
      // Use "company description " field (with space in CSV header) as primary source
      company_description: parseString(get('company description ', 'company description', 'company_description')),
      business_description: parseString(get('company description ', 'company description', 'business_description', 'company_description')),
      business_segments_summary: parseBusinessSegments(get('business_segments_summary')),
      
      // Verdict
      final_classification: parseString(get('final_classification')) as ScreeningRecord['final_classification'],
      final_classification_based_on_estimate: parseString(get('final_classification_based_on_estimate')) as ScreeningRecord['final_classification_based_on_estimate'],
      purification_required: parseBoolean(get('purification_required')),
      purification_pct_recommended: parseNumber(get('purification_pct_recommended')),
      needs_board_review: parseBoolean(get('needs_board_review')),
      doubt_reason: parseString(get('doubt_reason')),
      notes_for_portfolio_manager: parseString(get('notes_for_portfolio_manager')),
      shariah_summary: get('shariah_summary') || '',
      final_shariah_summary: parseString(get('final_shariah_summary', 'shariah_summary')),
      business_status: get('business_status') as ScreeningRecord['business_status'] || null,
      
      // Estimated NPIN fields (NEW)
      estimated_npin_status: parseString(get('estimated_npin_status')) as ScreeningRecord['estimated_npin_status'],
      estimated_npin_threshold_pct: parseNumber(get('estimated_npin_threshold_pct')),
      estimated_npin_value_used_point: parseNumber(get('estimated_npin_value_used_point')),
      estimated_npin_value_used_source: parseString(get('estimated_npin_value_used_source')),
      estimated_npin_purification_required: parseBoolean(get('estimated_npin_purification_required')),
      estimated_npin_purification_pct_recommended: parseNumber(get('estimated_npin_purification_pct_recommended')),
      estimated_npin_final_shariah_summary: parseString(get('estimated_npin_final_shariah_summary')),
      // est_purification_pct_recommended for estimated NPIN display (as number, e.g. 0.5 = 0.5%)
      est_purification_pct_recommended: parseNumber(get('est_purification_pct_recommended')),
      
      // Client summaries
      client_summary: parseString(get('client_summary')),
      client_shariah_summary: parseString(get('client_shariah_summary')),
      client_verdict_label: parseString(get('client_verdict_label')),
      client_purification_guidance: parseString(get('client_purification_guidance')),
      client_key_points: parseString(get('client_key_points')),
      client_haram_breakdown: parseString(get('client_haram_breakdown')),
      client_data_quality_note: parseString(get('client_data_quality_note')),
      client_disclaimer_short: parseString(get('client_disclaimer_short')),
      
      // Client Identity Fields
      client_identity_ticker: parseString(get('client_identity_ticker')),
      client_identity_company_name: parseString(get('client_identity_company_name')),
      client_identity_report_date: parseString(get('client_identity_report_date')),
      client_identity_security_type: parseString(get('client_identity_security_type')),
      client_identity_industry: parseString(get('client_identity_industry')),
      client_identity_sector: parseString(get('client_identity_sector')),
      
      // Client Headline Fields
      client_headline_final_classification: parseString(get('client_headline_final_classification')),
      client_headline_screening_status: parseString(get('client_headline_screening_status')),
      client_headline_one_line_summary: parseString(get('client_headline_one_line_summary')),
      client_risk_level: parseString(get('client_risk_level')),
      client_badges_json: parseString(get('client_badges_json')),
      client_key_points_json: parseString(get('client_key_points_json')),
      
      // Client Quantitative Fields
      client_numbers_debt_ratio_pct: parseString(get('client_numbers_debt_ratio_pct')),
      client_numbers_cashinv_ratio_pct: parseString(get('client_numbers_cashinv_ratio_pct')),
      client_numbers_npin_ratio_pct: parseString(get('client_numbers_npin_ratio_pct')),
      
      // Client Haram Revenue Fields
      client_haram_total_pct_display: parseString(get('client_haram_total_pct_display')),
      client_top_haram_segments_label: parseString(get('client_top_haram_segments_label')),
      client_top_haram_composition_label: parseString(get('client_top_haram_composition_label')),
      client_top_segments_json: parseString(get('client_top_segments_json')),
      client_top_composition_json: parseString(get('client_top_composition_json')),
      
      // Client Explanatory Fields
      client_what_it_means_for_investors: parseString(get('client_what_it_means_for_investors')),
      
      // Client Board Review Fields
      client_board_review_needs_review: parseBoolean(get('client_board_review_needs_review')),
      client_board_review_doubt_reason: parseString(get('client_board_review_doubt_reason')),
      
      // Client Data Quality Fields
      client_data_quality_summary_display: parseString(get('client_data_quality_summary_display')),
      client_data_quality_top_reasons_json: parseString(get('client_data_quality_top_reasons_json')),
      
      // Client References
      client_references_json: parseString(get('client_references_json')),
      
      // Additional client fields
      client_badges: parseString(get('client_badges')),
      client_website_summary_json: parseString(get('client_website_summary_json')),
      
      // Financial Ratios
      debt_ratio_pct: parseNumber(get('debt_ratio_pct')),
      cash_inv_ratio_pct: parseNumber(get('cash_inv_ratio_pct')),
      npin_ratio_pct: parseNumber(get('Non_Compliant_Revenue_Point_Estimate', 'npin_ratio_pct')),
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
      
      // Dollar amounts (FMP fields)
      denominator_max_usd_mn: parseNumber(get('denominator_max_usd_mn')),
      marketcap_usd_mn: parseNumber(get('marketcap_usd_mn')),
      totalassets_usd_mn: parseNumber(get('totalassets_usd_mn')),
      debt_conventional_usd_mn: parseNumber(get('debt_conventional_usd_mn')),
      cash_st_conv_usd_mn: parseNumber(get('cash_st_conv_usd_mn')),
      lt_invest_conv_usd_mn: parseNumber(get('lt_invest_conv_usd_mn')),
      revenue_total_usd_mn: parseNumber(get('revenue_total_usd_mn')),
      
      // Explainability
      llm_has_fail_flag: parseBoolean(get('llm_has_fail_flag')),
      llm_has_caution_flag: parseBoolean(get('llm_has_caution_flag')),
      llm_primary_rationale: parseString(get('llm_primary_rationale')),
      
      // Evidence (parse JSON arrays at load time)
      evidence_items_json: parseString(get('evidence_items_json')),
      verdict_evidence_items_json: parseString(get('verdict_evidence_items_json', 'evidence_items_json')),
      website_story: parseString(get('website_story')),
      
      // Donut charts (parse to arrays at load time using safeParse)
      // donut_series_json contains objects like {label, value} - parse as objects, not numbers
      donut_series_json: safeParseArray<{ label: string; value: number }>(get('donut_series_json')) as { label: string; value: number }[],
      donut_segments_json: safeParseArray<{ name: string; point?: number; value?: number; lower?: number; upper?: number; confidence?: string }>(get('donut_segments_json')) as { name: string; point?: number; value?: number; lower?: number; upper?: number; confidence?: string }[],
      
      // Haram revenue composition
      haram_pct_point: parseNumber(get('haram_pct_point')),
      haram_pct_lower: parseNumber(get('haram_pct_lower')),
      haram_pct_upper: parseNumber(get('haram_pct_upper')),
      halal_pct_point: parseNumber(get('halal_pct_point')),
      halal_pct_display_conservative: parseNumber(get('halal_pct_display_conservative')),
      haram_pct_display_conservative: parseNumber(get('haram_pct_display_conservative')),
      haram_total_pct_display: parseString(get('haram_total_pct_display')),
      haram_top_segments_label: parseString(get('haram_top_segments_label')),
      haram_top_segments_names: parseString(get('haram_top_segments_names')),
      haram_segments_json: parseString(get('haram_segments_json')),
      haram_composition_json: haramCompositionJson ? parseString(haramCompositionJson) : null,
      haram_top_composition_json: parseString(get('haram_top_composition_json')),
      haram_reference_ids_used: parseString(get('haram_reference_ids_used')),
      haram_global_reasoning: parseString(get('haram_global_reasoning')),
      haram_limitations: parseString(get('haram_limitations')),
      haram_confidence: parseString(get('haram_confidence')),
      haram_references_json: parseString(get('haram_references_json')),
      
      // Website fields for charts
      website_haram_segments_json: parseString(get('website_haram_segments_json')),
      website_haram_composition_json: parseString(get('website_haram_composition_json')),
      website_references_json: parseString(get('website_references_json')),
      
      // References (primary)
      references_json: parseString(get('references_json', 'client_references_json', 'website_references_json')),
      
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
      
      // Final ticker summary
      final_ticker_summary_json: parseString(get('final_ticker_summary_json')),
      final_ticker_summary_last_updated: parseString(get('final_ticker_summary_last_updated')),
      
      // Auto-banned
      auto_banned: parseBoolean(get('auto_banned')),
      auto_banned_status: parseString(get('auto_banned_status')),
      auto_banned_reason_clean: parseString(get('auto_banned_reason_clean')),
      auto_banned_summary: parseString(get('auto_banned_summary')),
      
      // Legacy timestamp fields
      screening_run_at: parseString(get('screening_run_at')),
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

// Universe type
export type DataUniverse = 'global' | 'gcc';

// Separate caches for each universe
const cachedDataByUniverse: Record<DataUniverse, ScreeningRecord[] | null> = {
  global: null,
  gcc: null,
};
const loadingPromiseByUniverse: Record<DataUniverse, Promise<ScreeningRecord[]> | null> = {
  global: null,
  gcc: null,
};

// CSV file paths for each universe
const CSV_PATHS: Record<DataUniverse, string> = {
  global: '/data/shariah-screening.csv',
  gcc: '/data/gcc-screening.csv',
};

// Clear cache to force reload
export function clearCache(universe?: DataUniverse): void {
  if (universe) {
    cachedDataByUniverse[universe] = null;
    loadingPromiseByUniverse[universe] = null;
  } else {
    cachedDataByUniverse.global = null;
    cachedDataByUniverse.gcc = null;
    loadingPromiseByUniverse.global = null;
    loadingPromiseByUniverse.gcc = null;
  }
  // Also clear legacy single cache
  cachedData = null;
  loadingPromise = null;
}

// Load data from CSV for a specific universe (singleton pattern)
export async function loadScreeningDataForUniverse(universe: DataUniverse): Promise<ScreeningRecord[]> {
  // Return cached data if available
  if (cachedDataByUniverse[universe]) return cachedDataByUniverse[universe]!;
  
  // Return existing promise if already loading
  if (loadingPromiseByUniverse[universe]) return loadingPromiseByUniverse[universe]!;
  
  // Start loading
  loadingPromiseByUniverse[universe] = (async () => {
    try {
      const csvPath = CSV_PATHS[universe];
      // Add cache-busting timestamp to prevent browser caching
      const response = await fetch(`${csvPath}?t=${Date.now()}`);
      if (!response.ok) {
        // Error logged for debugging - no sensitive data exposed
        return [];
      }
      
      const csvData = await response.text();
      cachedDataByUniverse[universe] = parseCSV(csvData);
      // Data loaded successfully - debug logging removed for production
      return cachedDataByUniverse[universe]!;
    } catch {
      // Error handling - logging removed for production security
      return [];
    } finally {
      loadingPromiseByUniverse[universe] = null;
    }
  })();
  
  return loadingPromiseByUniverse[universe]!;
}

// Legacy function - loads global data by default
export async function loadScreeningData(): Promise<ScreeningRecord[]> {
  return loadScreeningDataForUniverse('global');
}

// Get cached data (sync, returns empty if not loaded)
export function getCachedData(): ScreeningRecord[] {
  return cachedData || [];
}

// Find record by ticker (searches both universes)
export async function findByTicker(ticker: string): Promise<ScreeningRecord | undefined> {
  const normalizedTicker = ticker.trim().toUpperCase();
  
  // Try global first
  const globalData = await loadScreeningDataForUniverse('global');
  let record = globalData.find(r => (r.ticker || '').toUpperCase() === normalizedTicker);
  
  // If not found, try GCC
  if (!record) {
    const gccData = await loadScreeningDataForUniverse('gcc');
    record = gccData.find(r => (r.ticker || '').toUpperCase() === normalizedTicker);
  }
  
  return record;
}

// Find record by upsert_key (searches both universes)
export async function findByUpsertKey(upsertKey: string): Promise<ScreeningRecord | undefined> {
  // Try global first
  const globalData = await loadScreeningDataForUniverse('global');
  let record = globalData.find(r => r.upsert_key === upsertKey);
  
  // If not found, try GCC
  if (!record) {
    const gccData = await loadScreeningDataForUniverse('gcc');
    record = gccData.find(r => r.upsert_key === upsertKey);
  }
  
  return record;
}

// Get all records with filtering and pagination
export async function getAllRecords(filters?: {
  search?: string;
  finalClassification?: string;
  autoBanned?: boolean | string;
  industry?: string;
  universe?: 'global' | 'gcc';
  page?: number;
  pageSize?: number;
}): Promise<{ records: ScreeningRecord[]; total: number }> {
  // Load from the appropriate universe CSV
  const universe: DataUniverse = filters?.universe || 'global';
  const data = await loadScreeningDataForUniverse(universe);
  let result = [...data];
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(r => 
      (r.ticker || '').toLowerCase().includes(searchLower) ||
      (r.company_name || '').toLowerCase().includes(searchLower)
    );
  }
  
  if (filters?.finalClassification && filters.finalClassification !== 'all') {
    // Normalize comparison: uppercase, remove spaces/underscores/hyphens for flexible matching
    const normalizeClassification = (val: string | null | undefined): string => {
      if (!val) return '';
      return val.toUpperCase().replace(/[\s_-]/g, '');
    };
    const targetClassification = normalizeClassification(filters.finalClassification);
    result = result.filter(r => normalizeClassification(r.final_classification) === targetClassification);
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
