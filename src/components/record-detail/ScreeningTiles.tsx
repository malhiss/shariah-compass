import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { coerceToNumber } from '@/types/mongodb';
import { normalizeEvidence } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { Briefcase, Scale, DollarSign, TrendingDown, Info, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface ScreeningTilesProps {
  record: ScreeningRecord;
}

type TileStatus = 'pass' | 'fail' | 'review' | 'unknown';

interface TileData {
  label: string;
  icon: React.ReactNode;
  status: TileStatus;
  value: string | null;
  formula?: string | null;
  subtext?: string;
}

const THRESHOLDS = {
  debt: 0.33,
  cashInv: 0.33,
  npin: 0.05,
};

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
    case 'review':
      return (
        <Badge className="bg-warning/15 text-warning border-warning/30">
          <AlertTriangle className="w-3 h-3 mr-1" /> Review
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="bg-muted/30">
          <HelpCircle className="w-3 h-3 mr-1" /> Unknown
        </Badge>
      );
  }
}

export function ScreeningTiles({ record }: ScreeningTilesProps) {
  // Business Activity tile logic
  const llmFailFlag = record.llm_has_fail_flag;
  const llmCautionFlag = record.llm_has_caution_flag;
  const evidence = normalizeEvidence(record);
  const evidenceCount = evidence.length;

  let businessStatus: TileStatus = 'pass';
  if (llmFailFlag) {
    businessStatus = 'fail';
  } else if (llmCautionFlag) {
    businessStatus = 'review';
  }

  // Financial ratios
  const debtRatio = coerceToNumber(record.Debt_Ratio ?? record.Debt_Ratio_Percent);
  const cashInvRatio = coerceToNumber(record.CashInv_Ratio ?? record.Cash_Investment_Ratio_Percent);
  const npinRatio = coerceToNumber(record.NPIN_Ratio ?? record.Non_Permissible_Income_Percent);

  // Normalize ratios (convert from percent to decimal if > 1)
  const normalizeRatio = (val: number | null): number | null => {
    if (val === null) return null;
    return val > 1 ? val / 100 : val;
  };

  const normalizedDebt = normalizeRatio(debtRatio);
  const normalizedCashInv = normalizeRatio(cashInvRatio);
  const normalizedNpin = normalizeRatio(npinRatio);

  // Determine statuses
  const getFinancialStatus = (value: number | null, threshold: number): TileStatus => {
    if (value === null) return 'unknown';
    return value <= threshold ? 'pass' : 'fail';
  };

  const formatPercent = (val: number | null): string | null => {
    if (val === null) return null;
    const displayVal = val > 1 ? val : val * 100;
    return `${displayVal.toFixed(2)}%`;
  };

  const tiles: TileData[] = [
    {
      label: 'Business Activity',
      icon: <Briefcase className="w-5 h-5" />,
      status: businessStatus,
      value: null,
      subtext: `Evidence flags: ${evidenceCount}`,
    },
    {
      label: 'Debt Ratio',
      icon: <Scale className="w-5 h-5" />,
      status: getFinancialStatus(normalizedDebt, THRESHOLDS.debt),
      value: formatPercent(normalizedDebt),
      formula: record.Debt_Ratio_Formula,
      subtext: '≤ 33%',
    },
    {
      label: 'Cash & Investments',
      icon: <DollarSign className="w-5 h-5" />,
      status: getFinancialStatus(normalizedCashInv, THRESHOLDS.cashInv),
      value: formatPercent(normalizedCashInv),
      formula: record.CashInv_Ratio_Formula,
      subtext: '≤ 33%',
    },
    {
      label: 'NPIN',
      icon: <TrendingDown className="w-5 h-5" />,
      status: getFinancialStatus(normalizedNpin, THRESHOLDS.npin),
      value: formatPercent(normalizedNpin),
      formula: record.NPIN_Ratio_Formula,
      subtext: '≤ 5%',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile, idx) => (
        <Card
          key={idx}
          className={cn(
            'premium-card transition-all',
            tile.status === 'pass' && 'border-compliant/30',
            tile.status === 'fail' && 'border-non-compliant/30',
            tile.status === 'review' && 'border-warning/30'
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

            <div className="space-y-2">
              {tile.value && (
                <p className="text-2xl font-semibold font-mono">{tile.value}</p>
              )}
              {tile.subtext && (
                <p className="text-xs text-muted-foreground">{tile.subtext}</p>
              )}
            </div>

            {tile.formula && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs text-primary p-0">
                    <Info className="w-3 h-3 mr-1" />
                    View formula
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Formula</h4>
                    <p className="text-xs text-muted-foreground font-mono bg-muted/20 p-2 rounded break-all">
                      {tile.formula}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
