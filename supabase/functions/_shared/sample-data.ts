// Shared data module for Edge Functions
// Loads and parses the Shariah Screening CSV from the website dataset

// ============ SCREENING RECORD INTERFACE ============
export interface ScreeningRecord {
  // Identity
  upsert_key: string;
  ticker: string;
  company_name: string;
  report_date: string;
  exchange?: string | null;
  country?: string | null;
  sector?: string | null;
  industry?: string | null;
  security_type?: string | null;
  
  // Financials
  marketcap_usd_mn?: number | null;
  revenue_total_usd_mn?: number | null;
  totalassets_usd_mn?: number | null;
  cash_st_conv_usd_mn?: number | null;
  lt_invest_conv_usd_mn?: number | null;
  debt_conventional_usd_mn?: number | null;
  
  // Methodology
  methodology_name: string;
  screening_date?: string | null;
  screening_run_at?: string | null;
  
  // Classification
  final_classification?: string | null;
  final_classification_based_on_estimate?: string | null;
  business_status?: string | null;
  doubt_reason?: string | null;
  
  // Ratios
  debt_ratio_pct?: number | null;
  debt_status?: string | null;
  debt_threshold_pct?: number | null;
  cash_inv_ratio_pct?: number | null;
  cash_inv_status?: string | null;
  cash_inv_threshold_pct?: number | null;
  npin_ratio_pct?: number | null;
  npin_status?: string | null;
  npin_threshold_pct?: number | null;
  npin_numerator_usd_mn?: number | null;
  interest_income_usd?: string | null;
  nonop_unidentified_usd?: string | null;
  
  // Purification
  purification_required?: boolean;
  purification_pct_recommended?: number | null;
  purification_pct_point?: number | null;
  purification_pct_badge?: string | null;
  
  // Estimated NPIN
  est_purification_pct_recommended?: number | null;
  est_purification_pct_point?: number | null;
  est_purification_pct_lower?: number | null;
  est_purification_pct_upper?: number | null;
  estimated_npin_status?: string | null;
  estimated_npin_threshold_pct?: number | null;
  estimated_npin_purification_required?: boolean;
  
  // Donuts (arrays)
  donut_series_json?: unknown[];
  donut_segments_json?: unknown[];
  
  // Content
  website_story?: string | null;
  final_shariah_summary?: string | null;
  estimated_npin_final_shariah_summary?: string | null;
  findings_bullets?: unknown[];
  references_json?: unknown[];
  
  // Legacy fields for compatibility
  shariah_summary?: string | null;
  needs_board_review?: boolean;
  auto_banned?: boolean;
  auto_banned_reason_clean?: string | null;
  auto_banned_summary?: string | null;
  haram_pct_point?: number | null;
  qa_status?: string | null;
  notes_for_portfolio_manager?: string | null;
  llm_has_fail_flag?: boolean;
  llm_has_caution_flag?: boolean;
  llm_primary_rationale?: string | null;
}

// ============ SAFE PARSE UTILITY ============
function safeParse<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (value === '' || value === '[]' || value === '{}') return null;
  
  if (typeof value === 'object') {
    return value as T;
  }
  
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

function safeParseArray<T>(value: unknown): T[] {
  const parsed = safeParse<T[]>(value);
  return Array.isArray(parsed) ? parsed : [];
}

// ============ PARSING HELPERS ============
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === '1' || lower === 'yes';
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null;
  // Remove currency formatting like "$404,487.0m" -> 404487.0
  const cleaned = value.replace(/[$,m%]/gi, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseString(value: string | undefined): string | null {
  if (!value || value.trim() === '' || value.trim() === '[]' || value.trim() === '{}') {
    return null;
  }
  return value.trim();
}

// ============ CSV PARSER ============
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
        currentField += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++;
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim())) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else if (char === '\r' && !inQuotes) {
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
  
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim())) {
      rows.push(currentRow);
    }
  }
  
  return rows;
}

function buildHeaderMap(headers: string[]): Map<string, number> {
  const headerMap = new Map<string, number>();
  for (let i = 0; i < headers.length; i++) {
    headerMap.set(headers[i].trim(), i);
  }
  return headerMap;
}

function getValue(values: string[], headerMap: Map<string, number>, ...names: string[]): string | undefined {
  for (const name of names) {
    const idx = headerMap.get(name);
    if (idx !== undefined && values[idx] !== undefined) {
      return values[idx];
    }
  }
  return undefined;
}

// ============ PARSE CSV TO RECORDS ============
export function parseCSV(csvData: string): ScreeningRecord[] {
  const rows = parseCSVContent(csvData);
  if (rows.length < 2) return [];
  
  const headerMap = buildHeaderMap(rows[0]);
  const dataRows = rows.slice(1);
  const records: ScreeningRecord[] = [];
  
  for (const values of dataRows) {
    if (values.length < 5) continue;
    
    const get = (...names: string[]) => getValue(values, headerMap, ...names);
    
    const record: ScreeningRecord = {
      // Identity
      upsert_key: get('upsert_key') || '',
      ticker: get('ticker') || '',
      company_name: get('company_name') || '',
      report_date: get('report_date') || '',
      exchange: parseString(get('exchange')),
      country: parseString(get('country')),
      sector: parseString(get('sector')),
      industry: parseString(get('industry')),
      security_type: parseString(get('security_type')),
      
      // Financials
      marketcap_usd_mn: parseNumber(get('marketcap_usd_mn')),
      revenue_total_usd_mn: parseNumber(get('revenue_total_usd_mn')),
      totalassets_usd_mn: parseNumber(get('totalassets_usd_mn')),
      cash_st_conv_usd_mn: parseNumber(get('cash_st_conv_usd_mn')),
      lt_invest_conv_usd_mn: parseNumber(get('lt_invest_conv_usd_mn')),
      debt_conventional_usd_mn: parseNumber(get('debt_conventional_usd_mn')),
      
      // Methodology - always use constant
      methodology_name: 'Invesense Methodology',
      screening_date: parseString(get('screening_date')) || (get('screening_run_at')?.slice(0, 10)) || null,
      screening_run_at: parseString(get('screening_run_at')),
      
      // Classification
      final_classification: parseString(get('final_classification')),
      final_classification_based_on_estimate: parseString(get('final_classification_based_on_estimate')),
      business_status: parseString(get('business_status')),
      doubt_reason: parseString(get('doubt_reason')),
      
      // Ratios
      debt_ratio_pct: parseNumber(get('debt_ratio_pct')),
      debt_status: parseString(get('debt_status')),
      debt_threshold_pct: parseNumber(get('debt_threshold_pct')),
      cash_inv_ratio_pct: parseNumber(get('cash_inv_ratio_pct')),
      cash_inv_status: parseString(get('cash_inv_status')),
      cash_inv_threshold_pct: parseNumber(get('cash_inv_threshold_pct')),
      npin_ratio_pct: parseNumber(get('npin_ratio_pct')),
      npin_status: parseString(get('npin_status')),
      npin_threshold_pct: parseNumber(get('npin_threshold_pct')),
      npin_numerator_usd_mn: parseNumber(get('npin_numerator_usd_mn')),
      interest_income_usd: parseString(get('interest_income_usd')),
      nonop_unidentified_usd: parseString(get('nonop_unidentified_usd')),
      
      // Purification
      purification_required: parseBoolean(get('purification_required')),
      purification_pct_recommended: parseNumber(get('purification_pct_recommended')),
      purification_pct_point: parseNumber(get('purification_pct_point')),
      purification_pct_badge: parseString(get('purification_pct_badge')),
      
      // Estimated NPIN
      est_purification_pct_recommended: parseNumber(get('est_purification_pct_recommended')),
      est_purification_pct_point: parseNumber(get('est_purification_pct_point')),
      est_purification_pct_lower: parseNumber(get('est_purification_pct_lower')),
      est_purification_pct_upper: parseNumber(get('est_purification_pct_upper')),
      estimated_npin_status: parseString(get('estimated_npin_status')),
      estimated_npin_threshold_pct: parseNumber(get('estimated_npin_threshold_pct')),
      estimated_npin_purification_required: parseBoolean(get('estimated_npin_purification_required')),
      
      // Donuts (parse to arrays)
      donut_series_json: safeParseArray(get('donut_series_json')),
      donut_segments_json: safeParseArray(get('donut_segments_json')),
      
      // Content
      website_story: parseString(get('website_story')),
      final_shariah_summary: parseString(get('final_shariah_summary')),
      estimated_npin_final_shariah_summary: parseString(get('estimated_npin_final_shariah_summary')),
      findings_bullets: safeParseArray(get('findings_bullets')),
      references_json: safeParseArray(get('references_json')),
      
      // Compatibility fields
      shariah_summary: parseString(get('final_shariah_summary')),
      needs_board_review: false,
      auto_banned: false,
      auto_banned_reason_clean: null,
      auto_banned_summary: null,
      haram_pct_point: null,
      qa_status: 'OK',
      notes_for_portfolio_manager: null,
      llm_has_fail_flag: false,
      llm_has_caution_flag: false,
      llm_primary_rationale: null,
    };
    
    if (record.ticker && record.upsert_key) {
      records.push(record);
    }
  }
  
  return records;
}

// ============ DATA LOADING ============
let cachedData: ScreeningRecord[] | null = null;

// CSV URL - points to the public CSV file hosted on the site
const CSV_URL = 'https://id-preview--73838879-ccbf-490f-9817-cc6ef8a95fa1.lovable.app/data/shariah-screening.csv';

export async function loadData(): Promise<ScreeningRecord[]> {
  if (cachedData) return cachedData;
  
  try {
    console.log('Loading CSV from:', CSV_URL);
    const response = await fetch(CSV_URL, {
      headers: { 'Accept': 'text/csv' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    const csvData = await response.text();
    cachedData = parseCSV(csvData);
    console.log(`Loaded ${cachedData.length} screening records`);
    return cachedData;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
}

export function getSampleData(): ScreeningRecord[] {
  return cachedData || [];
}

// ============ QUERY FUNCTIONS ============
export async function findByTicker(ticker: string): Promise<ScreeningRecord | undefined> {
  const data = await loadData();
  const normalized = ticker.trim().toUpperCase();
  return data.find(r => r.ticker.toUpperCase() === normalized);
}

export async function findByUpsertKey(upsertKey: string): Promise<ScreeningRecord | undefined> {
  const data = await loadData();
  return data.find(r => r.upsert_key === upsertKey);
}

export async function findByTickers(tickers: string[]): Promise<Map<string, ScreeningRecord>> {
  const data = await loadData();
  const result = new Map<string, ScreeningRecord>();
  
  const normalizedTickers = new Set(tickers.map(t => t.trim().toUpperCase()));
  
  for (const record of data) {
    const upperTicker = record.ticker.toUpperCase();
    if (normalizedTickers.has(upperTicker)) {
      result.set(upperTicker, record);
    }
  }
  
  return result;
}

export async function getAllRecords(filters?: {
  search?: string;
  finalClassification?: string;
  autoBanned?: boolean;
  industry?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ records: ScreeningRecord[]; total: number }> {
  const data = await loadData();
  let result = [...data];
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(r => 
      r.ticker.toLowerCase().includes(searchLower) ||
      r.company_name.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters?.finalClassification && filters.finalClassification !== 'all') {
    result = result.filter(r => r.final_classification === filters.finalClassification);
  }
  
  if (filters?.autoBanned !== undefined) {
    result = result.filter(r => r.auto_banned === filters.autoBanned);
  }
  
  if (filters?.industry && filters.industry !== 'all') {
    result = result.filter(r => r.industry === filters.industry);
  }
  
  const total = result.length;
  
  if (filters?.page !== undefined && filters?.pageSize) {
    const start = (filters.page - 1) * filters.pageSize;
    result = result.slice(start, start + filters.pageSize);
  }
  
  return { records: result, total };
}

export async function getDistinctValues(field: keyof ScreeningRecord): Promise<string[]> {
  const data = await loadData();
  const values = new Set<string>();
  
  for (const record of data) {
    const value = record[field];
    if (value !== null && value !== undefined && value !== '') {
      values.add(String(value));
    }
  }
  
  return Array.from(values).sort();
}
