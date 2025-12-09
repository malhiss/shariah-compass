import { supabase } from '@/integrations/supabase/client';
import type {
  ClientFacingRecord,
  IndustryMethodologyRecord,
  NumericOnlyRecord,
  ScreeningFilters,
  PaginatedResponse,
} from '@/types/mongodb';

async function callShariahDashboard<T>(
  action: string,
  filters?: ScreeningFilters | Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke('shariah-dashboard', {
    body: { action, filters },
  });

  if (error) {
    throw new Error(`API Error: ${error.message}`);
  }

  return data as T;
}

// Main Client-facing Full records
export async function getClientFacingRecords(
  filters?: ScreeningFilters
): Promise<PaginatedResponse<ClientFacingRecord>> {
  return callShariahDashboard<PaginatedResponse<ClientFacingRecord>>(
    'getClientFacingRecords',
    filters
  );
}

// Get single record by upsert_key
export async function getRecordByKey(
  upsertKey: string
): Promise<ClientFacingRecord | null> {
  return callShariahDashboard<ClientFacingRecord | null>('getRecordByKey', {
    upsertKey,
  });
}

// Get numeric screening record
export async function getNumericRecord(
  upsertKey: string
): Promise<NumericOnlyRecord | null> {
  return callShariahDashboard<NumericOnlyRecord | null>('getNumericRecord', {
    upsertKey,
  });
}

// Get industry methodology record
export async function getIndustryMethodology(
  upsertKey: string
): Promise<IndustryMethodologyRecord | null> {
  return callShariahDashboard<IndustryMethodologyRecord | null>(
    'getIndustryMethodology',
    { upsertKey }
  );
}

// Get auto-banned records
export async function getAutoBannedRecords(
  filters?: ScreeningFilters
): Promise<PaginatedResponse<IndustryMethodologyRecord>> {
  return callShariahDashboard<PaginatedResponse<IndustryMethodologyRecord>>(
    'getAutoBannedRecords',
    filters
  );
}

// Get numeric-only records
export async function getNumericRecords(
  filters?: ScreeningFilters & { numericStatus?: string }
): Promise<PaginatedResponse<NumericOnlyRecord>> {
  return callShariahDashboard<PaginatedResponse<NumericOnlyRecord>>(
    'getNumericRecords',
    filters
  );
}

// Get distinct values for filters
export async function getDistinctValues(field: string): Promise<string[]> {
  return callShariahDashboard<string[]>('getDistinctValues', { field });
}