import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { getDistinctValues } from '@/lib/shariah-api';
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
  const [sectors, setSectors] = useState<string[]>([]);
  const [zakatMethodologies, setZakatMethodologies] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  useEffect(() => {
    // Load filter options
    getDistinctValues('Sector')
      .then(setSectors)
      .catch(console.error);
    
    getDistinctValues('Zakat_Methodology')
      .then(setZakatMethodologies)
      .catch(console.error);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch, page: 1 });
  };

  const handleFilterChange = (key: keyof ScreeningFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
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
    filters.sector ||
    filters.finalVerdict ||
    filters.riskLevel ||
    filters.shariahCompliant ||
    filters.boardReviewNeeded ||
    filters.autoBanned ||
    filters.zakatStatus ||
    filters.zakatMethodology;

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by ticker or company..."
            className="pl-10 bg-background border-border"
          />
        </div>
        <Button type="submit" variant="outline" className="border-border">
          Search
        </Button>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </form>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />

        {/* Common filters */}
        <Select
          value={filters.sector || 'all'}
          onValueChange={(v) => handleFilterChange('sector', v)}
        >
          <SelectTrigger className="w-[160px] bg-background border-border">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {viewMode === 'shariah' && (
          <>
            <Select
              value={filters.finalVerdict || 'all'}
              onValueChange={(v) => handleFilterChange('finalVerdict', v)}
            >
              <SelectTrigger className="w-[200px] bg-background border-border">
                <SelectValue placeholder="Final Verdict" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verdicts</SelectItem>
                <SelectItem value="COMPLIANT">Compliant</SelectItem>
                <SelectItem value="COMPLIANT_WITH_PURIFICATION">
                  With Purification
                </SelectItem>
                <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
                <SelectItem value="DOUBTFUL_REVIEW">Doubtful</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.riskLevel || 'all'}
              onValueChange={(v) => handleFilterChange('riskLevel', v)}
            >
              <SelectTrigger className="w-[140px] bg-background border-border">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.shariahCompliant || 'all'}
              onValueChange={(v) => handleFilterChange('shariahCompliant', v)}
            >
              <SelectTrigger className="w-[160px] bg-background border-border">
                <SelectValue placeholder="Shariah Compliant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="YES">Yes</SelectItem>
                <SelectItem value="NO">No</SelectItem>
                <SelectItem value="DOUBTFUL">Doubtful</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.boardReviewNeeded || 'all'}
              onValueChange={(v) => handleFilterChange('boardReviewNeeded', v)}
            >
              <SelectTrigger className="w-[160px] bg-background border-border">
                <SelectValue placeholder="Board Review" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="YES">Required</SelectItem>
                <SelectItem value="NO">Not Required</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.autoBanned || 'all'}
              onValueChange={(v) => handleFilterChange('autoBanned', v)}
            >
              <SelectTrigger className="w-[140px] bg-background border-border">
                <SelectValue placeholder="Auto-banned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="YES">Banned</SelectItem>
                <SelectItem value="NO">Not Banned</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}

        {viewMode === 'zakat' && (
          <>
            <Select
              value={filters.zakatStatus || 'all'}
              onValueChange={(v) => handleFilterChange('zakatStatus', v)}
            >
              <SelectTrigger className="w-[160px] bg-background border-border">
                <SelectValue placeholder="Zakat Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ZAKATABLE">Zakatable</SelectItem>
                <SelectItem value="NON_ZAKATABLE">Non-Zakatable</SelectItem>
                <SelectItem value="MIXED">Mixed</SelectItem>
                <SelectItem value="UNKNOWN">Unknown</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.zakatMethodology || 'all'}
              onValueChange={(v) => handleFilterChange('zakatMethodology', v)}
            >
              <SelectTrigger className="w-[180px] bg-background border-border">
                <SelectValue placeholder="Methodology" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methodologies</SelectItem>
                {zakatMethodologies.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}