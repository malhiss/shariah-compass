import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ScreeningRecord } from '@/types/screening-record';
import { Scale, DollarSign, TrendingDown, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface ScreeningTilesProps {
  record: ScreeningRecord;
}

type TileStatus = 'pass' | 'fail' | 'na';

interface TileData {
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  status: TileStatus;
  value: string;
  threshold: string;
}

function parseClientRatio(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number') return `${value.toFixed(2)}%`;
  const strVal = String(value).trim();
  if (strVal === 'N/A' || strVal === 'n/a' || strVal === '-') return 'N/A';
  if (strVal.includes('%')) return strVal;
  const numVal = parseFloat(strVal);
  if (isNaN(numVal)) return strVal;
  return `${numVal.toFixed(2)}%`;
}

function getStatusIndicator(status: TileStatus) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="w-4 h-4 text-compliant" />;
    case 'fail':
      return <XCircle className="w-4 h-4 text-non-compliant" />;
    default:
      return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  }
}

function determineStatus(value: string, thresholdPct: number | null | undefined): TileStatus {
  if (value === 'N/A') return 'na';
  const numVal = parseFloat(value.replace('%', ''));
  if (isNaN(numVal)) return 'na';
  const threshold = thresholdPct ?? 33;
  return numVal <= threshold ? 'pass' : 'fail';
}

export function ScreeningTiles({ record }: ScreeningTilesProps) {
  // Use new data contract fields with fallbacks to legacy fields
  const debtRatioDisplay = parseClientRatio(record.debt_ratio_pct ?? record.client_numbers_debt_ratio_pct);
  const cashInvRatioDisplay = parseClientRatio(record.cash_inv_ratio_pct ?? record.client_numbers_cashinv_ratio_pct);
  const npinRatioDisplay = parseClientRatio(record.npin_ratio_pct ?? record.client_numbers_npin_ratio_pct);

  // Estimated NPIN - use est_purification_pct_recommended field
  const getEstimatedNpinDisplay = (): string => {
    // Primary: use est_purification_pct_recommended from CSV
    const estPurificationPct = record.est_purification_pct_recommended;
    
    if (estPurificationPct !== null && estPurificationPct !== undefined) {
      // Values in CSV are already percentages (e.g., 0.5 means 0.5%)
      return `${estPurificationPct.toFixed(2)}%`;
    }
    
    // Fallback to estimated_npin_purification_pct_recommended
    const purificationPct = record.estimated_npin_purification_pct_recommended;
    if (purificationPct !== null && purificationPct !== undefined) {
      return `${purificationPct.toFixed(2)}%`;
    }
    
    return 'N/A';
  };

  const estimatedNpinDisplay = getEstimatedNpinDisplay();

  // Use status fields from data contract if available
  const debtStatus = record.debt_status === 'PASS' ? 'pass' : record.debt_status === 'FAIL' ? 'fail' : determineStatus(debtRatioDisplay, record.debt_threshold_pct ?? 33);
  const cashStatus = record.cash_inv_status === 'PASS' ? 'pass' : record.cash_inv_status === 'FAIL' ? 'fail' : determineStatus(cashInvRatioDisplay, record.cash_inv_threshold_pct ?? 33);
  const npinStatus = record.npin_status === 'PASS' ? 'pass' : record.npin_status === 'FAIL' ? 'fail' : determineStatus(npinRatioDisplay, record.npin_threshold_pct ?? 5);
  const estimatedNpinStatus = record.estimated_npin_status === 'PASS' ? 'pass' : record.estimated_npin_status === 'FAIL' ? 'fail' : determineStatus(estimatedNpinDisplay, record.estimated_npin_threshold_pct ?? 5);

  // Use thresholds from data contract or defaults
  const debtThreshold = record.debt_threshold_pct ?? 33;
  const cashThreshold = record.cash_inv_threshold_pct ?? 33;
  const npinThreshold = record.npin_threshold_pct ?? 5;
  const estimatedNpinThreshold = record.estimated_npin_threshold_pct ?? 5;

  const tiles: TileData[] = [
    {
      label: 'Debt Ratio',
      shortLabel: 'Debt',
      icon: <Scale className="w-4 h-4" />,
      status: debtStatus,
      value: debtRatioDisplay,
      threshold: `≤${debtThreshold}%`,
    },
    {
      label: 'Cash & Investments',
      shortLabel: 'Cash/Inv',
      icon: <DollarSign className="w-4 h-4" />,
      status: cashStatus,
      value: cashInvRatioDisplay,
      threshold: `≤${cashThreshold}%`,
    },
    {
      label: 'Estimated NPIN',
      shortLabel: 'Est. NPIN',
      icon: <TrendingDown className="w-4 h-4" />,
      status: estimatedNpinStatus,
      value: estimatedNpinDisplay,
      threshold: `≤${estimatedNpinThreshold}%`,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {tiles.map((tile, idx) => (
        <div
          key={idx}
          className={cn(
            'rounded-lg sm:rounded-xl border bg-card/50 p-2.5 sm:p-4 transition-all',
            tile.status === 'pass' && 'border-compliant/20',
            tile.status === 'fail' && 'border-non-compliant/20',
            tile.status === 'na' && 'border-border'
          )}
        >
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
              <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4">{tile.icon}</span>
              <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">{tile.label}</span>
              <span className="text-[10px] sm:text-xs font-medium sm:hidden">{tile.shortLabel}</span>
            </div>
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4">{getStatusIndicator(tile.status)}</span>
          </div>
          
          <p className="text-base sm:text-xl font-semibold font-mono">{tile.value}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{tile.threshold}</p>
        </div>
      ))}
    </div>
  );
}
