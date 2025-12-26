import { useQuery } from '@tanstack/react-query';
import { getClientFacingRecords, getRecordByKey } from '@/lib/shariah-api';
import type { ScreeningFilters, PaginatedResponse } from '@/types/mongodb';
import type { ScreeningRecord } from '@/types/screening-record';

// Hook to fetch paginated list of screening records
export function useScreeningRecordsList(filters: ScreeningFilters) {
  return useQuery({
    queryKey: ['screening-records', filters],
    queryFn: () => getClientFacingRecords(filters) as Promise<PaginatedResponse<ScreeningRecord>>,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook to fetch a single screening record by upsert_key
export function useScreeningRecord(upsertKey: string | undefined) {
  return useQuery({
    queryKey: ['screening-record', upsertKey],
    queryFn: () => getRecordByKey(upsertKey!) as Promise<ScreeningRecord | null>,
    enabled: !!upsertKey,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
