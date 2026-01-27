import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import type { ScreeningFilters, ViewMode } from '@/types/mongodb';

interface DashboardFiltersProps {
  filters: ScreeningFilters;
  onFiltersChange: (filters: ScreeningFilters) => void;
  viewMode: ViewMode;
}

export function DashboardFilters({
  filters,
  onFiltersChange,
  viewMode,
}: DashboardFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch, page: 1 });
  };

  const handleFilterChange = (key: keyof ScreeningFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value === 'all' ? undefined : value, page: 1 });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.finalVerdict ||
    filters.zakatStatus;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search ticker or company..."
            className="pl-10 bg-background border-border text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="btn-dalil flex-1 sm:flex-none text-sm">
            Search
          </Button>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" onClick={clearFilters} className="text-sm px-2 sm:px-3">
              <X className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </form>

      {/* Filters Row */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 items-end">
        {viewMode === 'shariah' && (
          <>
            {/* Verdict Filter */}
            <div className="space-y-1 sm:space-y-1.5">
              <Label className="text-[10px] sm:text-xs text-muted-foreground">Classification</Label>
              <Select
                value={filters.finalVerdict || 'all'}
                onValueChange={(v) => handleFilterChange('finalVerdict', v)}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-xs sm:text-sm h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">All Classifications</SelectItem>
                  <SelectItem value="COMPLIANT">Compliant</SelectItem>
                  <SelectItem value="COMPLIANT_WITH_PURIFICATION">With Purification</SelectItem>
                  <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </>
        )}

        {viewMode === 'zakat' && (
          <>
            {/* Zakat Status Filter */}
            <div className="space-y-1 sm:space-y-1.5 col-span-2">
              <Label className="text-[10px] sm:text-xs text-muted-foreground">Zakat Status</Label>
              <Select
                value={filters.zakatStatus || 'all'}
                onValueChange={(v) => handleFilterChange('zakatStatus', v)}
              >
                <SelectTrigger className="w-full sm:w-[160px] bg-background border-border text-xs sm:text-sm h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ZAKATABLE">Zakatable</SelectItem>
                  <SelectItem value="NON_ZAKATABLE">Non-Zakatable</SelectItem>
                  <SelectItem value="MIXED">Mixed</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
