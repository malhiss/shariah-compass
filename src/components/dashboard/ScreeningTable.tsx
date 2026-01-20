import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { VerdictBadge, ZakatBadge, RiskBadge, BooleanBadge } from './VerdictBadge';
import { formatPercent } from '@/types/mongodb';
import type { ViewMode } from '@/types/mongodb';
import type { ScreeningRecord } from '@/types/screening-record';
import { ChevronRight } from 'lucide-react';

interface ScreeningTableProps {
  data: ScreeningRecord[];
  loading: boolean;
  viewMode: ViewMode;
}

// Format currency in millions - display as-is since values are already in $M
function formatCurrencyMn(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  // Format with commas for readability, values are in millions
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
}

// Format screening date (YYYY-MM-DD only, no time)
function formatScreeningDate(record: ScreeningRecord): string {
  const screeningDate = record.screening_date;
  if (screeningDate) {
    // Already in YYYY-MM-DD format
    return screeningDate;
  }
  // Fallback to screening_run_at or report_date
  const runAt = record.screening_run_at;
  if (runAt) {
    return runAt.slice(0, 10);
  }
  const reportDate = record.report_date || record.Report_Date;
  if (reportDate) {
    return reportDate.slice(0, 10);
  }
  return '—';
}

// Get methodology name constant
function getMethodologyName(record: ScreeningRecord): string {
  return record.methodology_name || 'Invesense Methodology';
}

// Mobile Card Component for Shariah view
function ShariahMobileCard({ record, onClick }: { record: ScreeningRecord; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-3 border-b border-border last:border-b-0 active:bg-primary/5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground text-sm">
              {record.ticker || record.Ticker}
            </span>
            <RiskBadge level={record.client_risk_level || record.Compliance_Risk_Level} />
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {record.company_name || record.Company || '—'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
      </div>
      
      <div className="flex items-center justify-between gap-2 mb-2">
        <VerdictBadge verdict={record.final_classification || record.Final_Verdict} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>NPIN: <span className="font-mono">{formatPercent(record.npin_ratio_pct)}</span></span>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{record.sector || record.Sector || '—'} • {record.industry || record.Industry || '—'}</span>
        <span>{formatScreeningDate(record)}</span>
      </div>
    </div>
  );
}

// Mobile Card Component for Zakat view
function ZakatMobileCard({ record, onClick }: { record: ScreeningRecord; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="p-3 border-b border-border last:border-b-0 active:bg-primary/5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground text-sm">
              {record.ticker || record.Ticker}
            </span>
            <BooleanBadge value={record.Shariah_Compliant} />
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {record.company_name || record.Company || '—'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
      </div>
      
      <div className="flex items-center justify-between gap-2">
        <ZakatBadge status={record.Zakat_Status} />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{formatPercent(record.Zakatable_Assets_Ratio_Percent)}</span>
          <span className="text-[10px]">{formatScreeningDate(record)}</span>
        </div>
      </div>
    </div>
  );
}

export function ScreeningTable({
  data,
  loading,
  viewMode,
}: ScreeningTableProps) {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-10 sm:h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm">
        No records found. Try adjusting your filters.
      </div>
    );
  }

  const handleRowClick = (upsertKey: string) => {
    navigate(`/record/${encodeURIComponent(upsertKey)}`);
  };

  if (viewMode === 'zakat') {
    return (
      <>
        {/* Mobile View */}
        <div className="md:hidden">
          {data.map((record) => (
            <ZakatMobileCard
              key={record.upsert_key}
              record={record}
              onClick={() => handleRowClick(record.upsert_key)}
            />
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Ticker</TableHead>
                <TableHead className="text-muted-foreground">Company</TableHead>
                <TableHead className="text-center text-muted-foreground">Shariah</TableHead>
                <TableHead className="text-center text-muted-foreground">Zakat Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Zakatable %</TableHead>
                <TableHead className="text-right text-muted-foreground">Zakat/Share</TableHead>
                <TableHead className="text-right text-muted-foreground">Zakat/100</TableHead>
                <TableHead className="text-muted-foreground">Methodology</TableHead>
                <TableHead className="text-center text-muted-foreground">Risk</TableHead>
                <TableHead className="text-muted-foreground">Screening Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => (
                <TableRow
                  key={record.upsert_key}
                  className="cursor-pointer border-border hover:bg-primary/5"
                  onClick={() => handleRowClick(record.upsert_key)}
                >
                  <TableCell className="font-medium text-foreground">
                    {record.ticker || record.Ticker}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {record.company_name || record.Company || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <BooleanBadge value={record.Shariah_Compliant} />
                  </TableCell>
                  <TableCell className="text-center">
                    <ZakatBadge status={record.Zakat_Status} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPercent(record.Zakatable_Assets_Ratio_Percent)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {record.Zakat_Per_Share_USD?.toFixed(2) || '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {record.Zakat_Per_100_Units_USD?.toFixed(2) || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {getMethodologyName(record)}
                  </TableCell>
                  <TableCell className="text-center">
                    <RiskBadge level={record.client_risk_level || record.Compliance_Risk_Level} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">
                    {formatScreeningDate(record)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  // Shariah view (default)
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        {data.map((record) => (
          <ShariahMobileCard
            key={record.upsert_key}
            record={record}
            onClick={() => handleRowClick(record.upsert_key)}
          />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Ticker</TableHead>
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Sector</TableHead>
              <TableHead className="text-muted-foreground">Industry</TableHead>
              <TableHead className="text-center text-muted-foreground">Classification</TableHead>
              <TableHead className="text-right text-muted-foreground">Mkt Cap</TableHead>
              <TableHead className="text-right text-muted-foreground">Revenue</TableHead>
              <TableHead className="text-right text-muted-foreground">Debt %</TableHead>
              <TableHead className="text-right text-muted-foreground">Cash %</TableHead>
              <TableHead className="text-right text-muted-foreground">NPIN %</TableHead>
              <TableHead className="text-center text-muted-foreground">Risk</TableHead>
              <TableHead className="text-muted-foreground">Screening Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record) => (
              <TableRow
                key={record.upsert_key}
                className="cursor-pointer border-border hover:bg-primary/5"
                onClick={() => handleRowClick(record.upsert_key)}
              >
                <TableCell className="font-medium text-foreground">
                  {record.ticker || record.Ticker}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[180px] truncate">
                  {record.company_name || record.Company || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[120px] truncate">
                  {record.sector || record.Sector || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[140px] truncate">
                  {record.industry || record.Industry || '—'}
                </TableCell>
                <TableCell className="text-center">
                  <VerdictBadge verdict={record.final_classification || record.Final_Verdict} />
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrencyMn(record.marketcap_usd_mn)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrencyMn(record.revenue_total_usd_mn)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <span className={record.debt_status === 'FAIL' ? 'text-non-compliant' : ''}>
                    {formatPercent(record.debt_ratio_pct)}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <span className={record.cash_inv_status === 'FAIL' ? 'text-non-compliant' : ''}>
                    {formatPercent(record.cash_inv_ratio_pct)}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <span className={record.npin_status === 'FAIL' ? 'text-non-compliant' : ''}>
                    {formatPercent(record.npin_ratio_pct)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <RiskBadge level={record.client_risk_level || record.Compliance_Risk_Level} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm font-mono">
                  {formatScreeningDate(record)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
