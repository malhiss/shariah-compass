import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { VerdictBadge, ZakatBadge, RiskBadge, BooleanBadge } from './VerdictBadge';
import { formatPercent, formatCurrency, formatDate } from '@/types/mongodb';
import type { ClientFacingRecord } from '@/types/mongodb';
import { Building2, Scale, AlertTriangle, FileText, Coins } from 'lucide-react';

interface RecordDetailDrawerProps {
  record: ClientFacingRecord | null;
  open: boolean;
  onClose: () => void;
}

function RatioBar({
  label,
  value,
  threshold,
}: {
  label: string;
  value: number | null;
  threshold: number;
}) {
  const hasValue = value !== null && value !== undefined;
  const percentage = hasValue ? Math.min((value / threshold) * 100, 150) : 0;
  const isOverThreshold = hasValue && value > threshold;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={
            hasValue
              ? isOverThreshold
                ? 'text-non-compliant font-semibold'
                : 'text-compliant font-semibold'
              : 'text-muted-foreground'
          }
        >
          {formatPercent(value)} / {threshold}%
        </span>
      </div>
      <Progress
        value={Math.min(percentage, 100)}
        className={`h-2 ${isOverThreshold ? '[&>div]:bg-non-compliant' : '[&>div]:bg-compliant'}`}
      />
    </div>
  );
}

export function RecordDetailDrawer({
  record,
  open,
  onClose,
}: RecordDetailDrawerProps) {
  if (!record) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif flex items-center gap-3">
            <span>{record.Ticker}</span>
            <span className="text-muted-foreground font-normal">—</span>
            <span className="text-muted-foreground font-normal text-lg">
              {record.Company || 'Unknown'}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 rounded bg-muted/20">{record.Sector}</span>
            <span className="px-2 py-1 rounded bg-muted/20">{record.Industry}</span>
            <span className="px-2 py-1 rounded bg-muted/20">
              {record.Security_Type}
            </span>
          </div>

          {/* Zakat Section */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                Zakat Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <ZakatBadge status={record.Zakat_Status} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zakatable Assets</p>
                  <p className="font-semibold">
                    {formatPercent(record.Zakatable_Assets_Ratio_Percent)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zakat per Share</p>
                  <p className="font-semibold">
                    {formatCurrency(record.Zakat_Per_Share_USD)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zakat per 100 Units</p>
                  <p className="font-semibold">
                    {formatCurrency(record.Zakat_Per_100_Units_USD)}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Methodology</p>
                <p className="text-sm">{record.Zakat_Methodology || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm">{record.Zakat_Notes || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shariah Verdict */}
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Shariah Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Final Verdict</p>
                  <VerdictBadge verdict={record.Final_Verdict} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shariah Compliant</p>
                  <BooleanBadge value={record.Shariah_Compliant} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <RiskBadge level={record.Compliance_Risk_Level} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verdict Strength</p>
                  <p className="font-medium">{record.Verdict_Strength || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compliance Status</p>
                  <p className="font-medium">{record.Compliance_Status || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ratios */}
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Financial Ratios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <RatioBar
                label="Debt Ratio"
                value={record.Debt_Ratio_Percent}
                threshold={33}
              />
              <RatioBar
                label="Cash & Investment Ratio"
                value={record.Cash_Investment_Ratio_Percent}
                threshold={33}
              />
              <RatioBar
                label="Non-Permissible Income"
                value={record.Non_Permissible_Income_Percent}
                threshold={5}
              />
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Haram Revenue (Point Est.)
                  </p>
                  <p className="font-semibold text-warning">
                    {formatPercent(record.Non_Compliant_Revenue_Point_Estimate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purification Required</p>
                  <BooleanBadge value={record.Purification_Required} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purification %</p>
                  <p className="font-semibold">
                    {formatPercent(record.Purification_Percentage)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Purification Amount (USD mn)
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(record.Purification_Amount_Estimated_USD_mn)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dual-use & Governance */}
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Governance & Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dual-Use Product</p>
                  <BooleanBadge value={record.Dual_Use_Product} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Board Review Needed</p>
                  <BooleanBadge value={record.Board_Review_Needed} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auto-Banned</p>
                  <BooleanBadge
                    value={record.Auto_Banned}
                    trueLabel="Banned"
                    falseLabel="No"
                    className="mt-1"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">QA Status</p>
                  <p className="font-medium">{record.QA_Status || 'N/A'}</p>
                </div>
              </div>
              {record.Dual_Use_Comment && (
                <div>
                  <p className="text-sm text-muted-foreground">Dual-Use Comment</p>
                  <p className="text-sm">{record.Dual_Use_Comment}</p>
                </div>
              )}
              {record.Doubt_Reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Doubt Reason</p>
                  <p className="text-sm">{record.Doubt_Reason}</p>
                </div>
              )}
              {record.Auto_Banned_Reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Auto-Ban Reason</p>
                  <p className="text-sm text-non-compliant">
                    {record.Auto_Banned_Reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes & References */}
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Notes & References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {record.Key_Findings && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Key Findings</p>
                  <p className="text-sm whitespace-pre-wrap">{record.Key_Findings}</p>
                </div>
              )}
              {record.Key_Risk_Factors && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Risk Factors</p>
                  <p className="text-sm">{record.Key_Risk_Factors}</p>
                </div>
              )}
              {record.Portfolio_Manager_Notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">PM Notes</p>
                  <p className="text-sm">{record.Portfolio_Manager_Notes}</p>
                </div>
              )}
              {record.Shariah_References && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Shariah References
                  </p>
                  <p className="text-sm">{record.Shariah_References}</p>
                </div>
              )}
              {record.QA_Issues_CSV && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">QA Issues</p>
                  <p className="text-sm text-warning">{record.QA_Issues_CSV}</p>
                </div>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Screening Date</p>
                  <p>{formatDate(record.Screening_Date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Report Date</p>
                  <p>{formatDate(record.Report_Date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}