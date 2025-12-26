import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate, coerceToBoolean } from '@/types/mongodb';
import { getClassificationLabel, getClassificationColor } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { Scale, AlertTriangle, Calendar, Building2, CheckCircle2 } from 'lucide-react';

interface VerdictActionBoxProps {
  record: ScreeningRecord;
}

export function VerdictActionBox({ record }: VerdictActionBoxProps) {
  // Get classification - prefer final_classification, fallback to Final_Verdict
  const classification = record.final_classification || record.Final_Verdict;
  const colorClass = getClassificationColor(classification);
  const label = getClassificationLabel(classification);

  // Determine action requirements
  const purificationRequired = coerceToBoolean(record.purification_required ?? record.Purification_Required);
  const purificationPct = record.purification_pct_recommended ?? record.Purification_Percentage;
  const needsBoardReview = coerceToBoolean(record.needs_board_review ?? record.Board_Review_Needed);
  const isDoubtful = classification === 'DOUBTFUL_REVIEW';

  const showActionRequired = purificationRequired || needsBoardReview || isDoubtful;

  return (
    <Card className="premium-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Company identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-serif">{record.Ticker}</CardTitle>
              <p className="text-muted-foreground">{record.Company || 'Unknown Company'}</p>
            </div>
          </div>

          {/* Report date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Report Date: {formatDate(record.Report_Date)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {record.Sector && (
            <Badge variant="secondary" className="bg-muted/30">
              {record.Sector}
            </Badge>
          )}
          {record.Industry && (
            <Badge variant="secondary" className="bg-muted/30">
              {record.Industry}
            </Badge>
          )}
          {record.Security_Type && (
            <Badge variant="secondary" className="bg-muted/30">
              {record.Security_Type}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Main verdict display */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Large verdict badge */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Scale className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Final Classification</span>
            </div>
            <div
              className={cn(
                'inline-flex items-center gap-2 px-4 py-3 rounded-lg text-lg font-semibold',
                colorClass === 'compliant' && 'bg-compliant/15 text-compliant border border-compliant/30',
                colorClass === 'warning' && 'bg-warning/15 text-warning border border-warning/30',
                colorClass === 'non-compliant' && 'bg-non-compliant/15 text-non-compliant border border-non-compliant/30',
                colorClass === 'doubtful' && 'bg-doubtful/15 text-doubtful border border-doubtful/30',
                colorClass === 'no-data' && 'bg-muted/20 text-muted-foreground border border-border'
              )}
            >
              {colorClass === 'compliant' && <CheckCircle2 className="w-5 h-5" />}
              {colorClass === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {colorClass === 'non-compliant' && <AlertTriangle className="w-5 h-5" />}
              {colorClass === 'doubtful' && <AlertTriangle className="w-5 h-5" />}
              {label}
            </div>
          </div>

          {/* Action Required panel */}
          {showActionRequired && (
            <div className="flex-1 border-l border-border pl-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="text-sm font-medium text-warning">Action Required</span>
              </div>

              <div className="space-y-3">
                {purificationRequired && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="font-medium text-sm">Dividend Purification Required</p>
                    {purificationPct !== null && purificationPct !== undefined && (
                      <p className="text-muted-foreground text-sm mt-1">
                        Recommended purification: <span className="font-semibold text-warning">{purificationPct.toFixed(2)}%</span> of dividends
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs mt-1">
                      Donate this percentage of dividend income to charity to purify earnings from non-compliant sources.
                    </p>
                  </div>
                )}

                {(needsBoardReview || isDoubtful) && (
                  <div className="p-3 rounded-lg bg-doubtful/10 border border-doubtful/20">
                    <p className="font-medium text-sm">Board/Analyst Review Required</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      This security requires review by the Shariah board or a qualified analyst before investment decisions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Shariah summary */}
        {record.shariah_summary && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Summary</h4>
              <p className="text-sm leading-relaxed">{record.shariah_summary}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
