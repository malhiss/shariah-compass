import { Card, CardContent } from '@/components/ui/card';
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
  icon: React.ReactNode;
  status: TileStatus;
  value: string;
}

// Parse the client ratio value - could be number or string
function parseClientRatio(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number') return `${value.toFixed(2)}%`;
  // If string, check if it already includes %
  const strVal = String(value).trim();
  if (strVal === 'N/A' || strVal === 'n/a' || strVal === '-') return 'N/A';
  if (strVal.includes('%')) return strVal;
  const numVal = parseFloat(strVal);
  if (isNaN(numVal)) return strVal;
  return `${numVal.toFixed(2)}%`;
}

function getStatusBadge(status: TileStatus) {
  switch (status) {
    case 'pass':
      return (
        <Badge className="bg-compliant/15 text-compliant border-compliant/30">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Pass
        </Badge>
      );
    case 'fail':
      return (
        <Badge className="bg-non-compliant/15 text-non-compliant border-non-compliant/30">
          <XCircle className="w-3 h-3 mr-1" /> Fail
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="bg-muted/30">
          <HelpCircle className="w-3 h-3 mr-1" /> N/A
        </Badge>
      );
  }
}

// Determine status based on value and threshold
function determineStatus(value: string, thresholdPct: number): TileStatus {
  if (value === 'N/A') return 'na';
  const numVal = parseFloat(value.replace('%', ''));
  if (isNaN(numVal)) return 'na';
  return numVal <= thresholdPct ? 'pass' : 'fail';
}

export function ScreeningTiles({ record }: ScreeningTilesProps) {
  // Use client_numbers_* fields as canonical source
  const debtRatioDisplay = parseClientRatio(record.client_numbers_debt_ratio_pct);
  const cashInvRatioDisplay = parseClientRatio(record.client_numbers_cashinv_ratio_pct);
  const npinRatioDisplay = parseClientRatio(record.client_numbers_npin_ratio_pct);

  const tiles: TileData[] = [
    {
      label: 'Debt Ratio',
      icon: <Scale className="w-5 h-5" />,
      status: determineStatus(debtRatioDisplay, 33),
      value: debtRatioDisplay,
    },
    {
      label: 'Cash & Investments Ratio',
      icon: <DollarSign className="w-5 h-5" />,
      status: determineStatus(cashInvRatioDisplay, 33),
      value: cashInvRatioDisplay,
    },
    {
      label: 'Non-Permissible Income (NPIN)',
      icon: <TrendingDown className="w-5 h-5" />,
      status: determineStatus(npinRatioDisplay, 5),
      value: npinRatioDisplay,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {tiles.map((tile, idx) => (
        <Card
          key={idx}
          className={cn(
            'premium-card transition-all',
            tile.status === 'pass' && 'border-compliant/30',
            tile.status === 'fail' && 'border-non-compliant/30'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                {tile.icon}
                <span className="text-sm font-medium">{tile.label}</span>
              </div>
              {getStatusBadge(tile.status)}
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-semibold font-mono">{tile.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
