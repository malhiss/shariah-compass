// Shariah API - Frontend data layer
// Uses the CSV data loader for all data operations

import { 
  loadScreeningData, 
  getAllRecords, 
  findByUpsertKey, 
  getDistinctValues as getDistinctValuesFromCSV 
} from '@/lib/csv-data-loader';
import type { ScreeningRecord } from '@/types/screening-record';
import type { ScreeningFilters, PaginatedResponse } from '@/types/mongodb';

// Main Client-facing Full records
export async function getClientFacingRecords(
  filters?: ScreeningFilters
): Promise<PaginatedResponse<ScreeningRecord>> {
  const { records, total } = await getAllRecords({
    search: filters?.search,
    finalClassification: filters?.finalVerdict,
    industry: filters?.industry,
    autoBanned: filters?.autoBanned,
    page: filters?.page || 1,
    pageSize: filters?.pageSize || 50,
  });

  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 50;

  return {
    data: records,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Get single record by upsert_key
export async function getRecordByKey(
  upsertKey: string
): Promise<ScreeningRecord | null> {
  const record = await findByUpsertKey(upsertKey);
  return record || null;
}

// Get distinct values for filters
export async function getDistinctValues(field: string): Promise<string[]> {
  return getDistinctValuesFromCSV(field as keyof ScreeningRecord);
}

// Preload data (call early in app lifecycle)
export async function preloadData(): Promise<void> {
  await loadScreeningData();
}
