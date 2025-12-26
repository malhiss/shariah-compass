import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { coerceToBoolean } from '@/types/mongodb';
import { getClassificationLabel, getClassificationColor } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Scale, Percent, Users } from 'lucide-react';

interface VerdictBarProps {
  record: ScreeningRecord;
}

export function VerdictBar({ record }: VerdictBarProps) {
  const classification = record.final_classification || record.Final_Verdict;
  const colorClass = getClassificationColor(classification);
  const label = getClassificationLabel(classification);

  const purificationRequired = coerceToBoolean(record.purification_required ?? record.Purification_Required);
  const purificationPct = record.purification_pct_recommended ?? record.Purification_Percentage;
  const needsBoardReview = coerceToBoolean(record.needs_board_review ?? record.Board_Review_Needed);
  const qaNeedsReview = coerceToBoolean(record.QA_Needs_Review);
  const isDoubtful = classification === 'DOUBTFUL_REVIEW';

  const showReviewRequired = needsBoardReview || isDoubtful || qaNeedsReview;

  const getIcon = () => {
    switch (colorClass) {
      case 'compliant':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />;
      case 'non-compliant':
        return <XCircle className="w-6 h-6" />;
      case 'doubtful':
        return <HelpCircle className="w-6 h-6" />;
      default:
        return <Scale className="w-6 h-6" />;
    }
  };

  return (
    <Card className="premium-card sticky top-4 z-10">
      <CardContent className="py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Verdict badge */}
          <div
            className={cn(
              'flex items-center gap-3 px-5 py-3 rounded-xl font-semibold',
              colorClass === 'compliant' && 'bg-compliant/15 text-compliant border border-compliant/30',
              colorClass === 'warning' && 'bg-warning/15 text-warning border border-warning/30',
              colorClass === 'non-compliant' && 'bg-non-compliant/15 text-non-compliant border border-non-compliant/30',
              colorClass === 'doubtful' && 'bg-doubtful/15 text-doubtful border border-doubtful/30',
              colorClass === 'no-data' && 'bg-muted/20 text-muted-foreground border border-border'
            )}
          >
            {getIcon()}
            <span className="text-lg">{label}</span>
          </div>

          {/* Divider on desktop */}
          <div className="hidden md:block h-10 w-px bg-border" />

          {/* Action cards */}
          <div className="flex flex-wrap gap-3 flex-1">
            {purificationRequired && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/20">
                <Percent className="w-4 h-4 text-warning" />
                <div>
                  <p className="text-xs text-muted-foreground">Purification</p>
                  <p className="font-semibold text-warning">
                    {purificationPct !== null && purificationPct !== undefined 
                      ? `${purificationPct.toFixed(2)}%`
                      : 'Required'}
                  </p>
                </div>
              </div>
            )}

            {showReviewRequired && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-doubtful/10 border border-doubtful/20">
                <Users className="w-4 h-4 text-doubtful" />
                <div>
                  <p className="text-xs text-muted-foreground">Action</p>
                  <p className="font-medium text-doubtful text-sm">Board Review</p>
                </div>
              </div>
            )}
          </div>

          {/* Shariah summary teaser */}
          {record.shariah_summary && (
            <div className="hidden lg:block max-w-md text-sm text-muted-foreground line-clamp-2">
              {record.shariah_summary}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
