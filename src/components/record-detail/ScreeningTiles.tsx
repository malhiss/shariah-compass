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

function determineStatus(value: string, thresholdPct: number): TileStatus {
  if (value === 'N/A') return 'na';
  const numVal = parseFloat(value.replace('%', ''));
  if (isNaN(numVal)) return 'na';
  return numVal <= thresholdPct ? 'pass' : 'fail';
}

export function ScreeningTiles({ record }: ScreeningTilesProps) {
  const debtRatioDisplay = parseClientRatio(record.client_numbers_debt_ratio_pct);
  const cashInvRatioDisplay = parseClientRatio(record.client_numbers_cashinv_ratio_pct);
  const npinRatioDisplay = parseClientRatio(record.client_numbers_npin_ratio_pct);

  const tiles: TileData[] = [
    {
      label: 'Debt Ratio',
      shortLabel: 'Debt',
      icon: <Scale className="w-4 h-4" />,
      status: determineStatus(debtRatioDisplay, 33),
      value: debtRatioDisplay,
      threshold: '≤33%',
    },
    {
      label: 'Cash & Investments',
      shortLabel: 'Cash/Inv',
      icon: <DollarSign className="w-4 h-4" />,
      status: determineStatus(cashInvRatioDisplay, 33),
      value: cashInvRatioDisplay,
      threshold: '≤33%',
    },
    {
      label: 'Non-Permissible Income',
      shortLabel: 'NPIN',
      icon: <TrendingDown className="w-4 h-4" />,
      status: determineStatus(npinRatioDisplay, 5),
      value: npinRatioDisplay,
      threshold: '≤5%',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((tile, idx) => (
        <div
          key={idx}
          className={cn(
            'rounded-xl border bg-card/50 p-4 transition-all',
            tile.status === 'pass' && 'border-compliant/20',
            tile.status === 'fail' && 'border-non-compliant/20',
            tile.status === 'na' && 'border-border'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              {tile.icon}
              <span className="text-xs font-medium hidden sm:inline">{tile.label}</span>
              <span className="text-xs font-medium sm:hidden">{tile.shortLabel}</span>
            </div>
            {getStatusIndicator(tile.status)}
          </div>
          
          <p className="text-xl font-semibold font-mono">{tile.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Threshold: {tile.threshold}</p>
        </div>
      ))}
    </div>
  );
}
