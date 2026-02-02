import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { safeParseJSON } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Percent, Users, AlertCircle, Shield } from 'lucide-react';

interface VerdictBarProps {
  record: ScreeningRecord;
}

interface BadgeItem {
  label?: string;
  type?: string;
}

export function VerdictBar({ record }: VerdictBarProps) {
  // Use final_classification_based_on_estimate as primary, fallback to final_classification
  const primaryVerdict = record.final_classification_based_on_estimate || record.final_classification || record.client_headline_final_classification || record.client_verdict_label || 'Not Available';
  const estimatedVerdict = record.final_classification_based_on_estimate;
  const riskLevel = record.client_risk_level;
  const badges = safeParseJSON<BadgeItem[]>(record.client_badges_json, []);
  const needsBoardReview = record.needs_board_review || record.client_board_review_needs_review;
  const doubtReason = record.doubt_reason || record.client_board_review_doubt_reason;

  const getColorClass = (verdict: string) => {
    const lowerLabel = verdict.toLowerCase().replace(/_/g, ' ');
    if (lowerLabel.includes('non') && lowerLabel.includes('compliant')) return 'non-compliant';
    if (lowerLabel.includes('compliant')) {
      if (lowerLabel.includes('purification')) return 'warning';
      return 'compliant';
    }
    if (lowerLabel.includes('doubtful') || lowerLabel.includes('review')) return 'doubtful';
    return 'no-data';
  };

  const getIcon = (colorClass: string) => {
    switch (colorClass) {
      case 'compliant':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'non-compliant':
        return <XCircle className="w-5 h-5" />;
      case 'doubtful':
        return <HelpCircle className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const renderVerdictBar = (label: string, verdict: string, isSecondary = false) => {
    const colorClass = getColorClass(verdict);
    return (
      <div className={cn(
        'rounded-lg border p-3',
        colorClass === 'compliant' && 'bg-compliant/5 border-compliant/20',
        colorClass === 'warning' && 'bg-warning/5 border-warning/20',
        colorClass === 'non-compliant' && 'bg-non-compliant/5 border-non-compliant/20',
        colorClass === 'doubtful' && 'bg-doubtful/5 border-doubtful/20',
        colorClass === 'no-data' && 'bg-muted/10 border-border',
        isSecondary && 'opacity-80'
      )}>
        <div className="flex items-center gap-3">
          {label && <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide w-24 shrink-0">{label}</span>}
          <div className={cn(
            'flex items-center gap-2 font-semibold',
            colorClass === 'compliant' && 'text-compliant',
            colorClass === 'warning' && 'text-warning',
            colorClass === 'non-compliant' && 'text-non-compliant',
            colorClass === 'doubtful' && 'text-doubtful',
            colorClass === 'no-data' && 'text-muted-foreground'
          )}>
            <span className="[&>svg]:w-4 [&>svg]:h-4">{getIcon(colorClass)}</span>
            <span className="text-sm">{verdict.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Verdict */}
      {renderVerdictBar('', primaryVerdict)}
      
      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
        {riskLevel && (
          <Badge 
            variant="outline" 
            className={cn(
              'bg-background/50 text-xs py-0.5 px-2',
              riskLevel.toLowerCase() === 'low' && 'text-compliant border-compliant/30',
              riskLevel.toLowerCase() === 'medium' && 'text-warning border-warning/30',
              riskLevel.toLowerCase() === 'high' && 'text-non-compliant border-non-compliant/30'
            )}
          >
            Risk: {riskLevel}
          </Badge>
        )}

        {needsBoardReview && (
          <Badge 
            variant="outline" 
            className="bg-doubtful/10 text-doubtful border-doubtful/30 gap-1 text-xs py-0.5 px-2"
            title="Board review required"
          >
            <Users className="w-3 h-3" />
            Board Review
          </Badge>
        )}
      </div>
    </div>
  );
}
