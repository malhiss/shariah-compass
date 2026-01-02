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
  const verdictLabel = record.client_headline_final_classification || record.client_verdict_label || 'Not Available';
  const screeningStatus = record.client_headline_screening_status;
  const riskLevel = record.client_risk_level;
  const badges = safeParseJSON<BadgeItem[]>(record.client_badges_json, []);

  const getColorClass = () => {
    const lowerLabel = verdictLabel.toLowerCase().replace(/_/g, ' ');
    if (lowerLabel.includes('non') && lowerLabel.includes('compliant')) return 'non-compliant';
    if (lowerLabel.includes('compliant')) {
      if (lowerLabel.includes('purification')) return 'warning';
      return 'compliant';
    }
    if (lowerLabel.includes('doubtful') || lowerLabel.includes('review')) return 'doubtful';
    return 'no-data';
  };

  const colorClass = getColorClass();

  const getIcon = () => {
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

  const hasPurificationBadge = badges.some(b => 
    b.label?.toLowerCase().includes('purification') || b.type?.toLowerCase().includes('purification')
  );
  const hasBoardReviewBadge = record.client_board_review_needs_review || badges.some(b => 
    b.label?.toLowerCase().includes('board') || b.type?.toLowerCase().includes('review')
  );
  const hasQABadge = badges.some(b => 
    b.label?.toLowerCase().includes('qa') || b.type?.toLowerCase().includes('qa')
  );
  
  const boardReviewReason = record.client_board_review_doubt_reason;

  return (
    <div className={cn(
      'rounded-lg sm:rounded-xl border p-3 sm:p-4',
      colorClass === 'compliant' && 'bg-compliant/5 border-compliant/20',
      colorClass === 'warning' && 'bg-warning/5 border-warning/20',
      colorClass === 'non-compliant' && 'bg-non-compliant/5 border-non-compliant/20',
      colorClass === 'doubtful' && 'bg-doubtful/5 border-doubtful/20',
      colorClass === 'no-data' && 'bg-muted/10 border-border'
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Main verdict */}
        <div className={cn(
          'flex items-center gap-2 sm:gap-3 font-semibold',
          colorClass === 'compliant' && 'text-compliant',
          colorClass === 'warning' && 'text-warning',
          colorClass === 'non-compliant' && 'text-non-compliant',
          colorClass === 'doubtful' && 'text-doubtful',
          colorClass === 'no-data' && 'text-muted-foreground'
        )}>
          <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">{getIcon()}</span>
          <span className="text-sm sm:text-lg">{verdictLabel}</span>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:ml-auto">
          {screeningStatus && (
            <Badge variant="outline" className="bg-background/50 gap-1 sm:gap-1.5 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
              <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {screeningStatus}
            </Badge>
          )}

          {riskLevel && (
            <Badge 
              variant="outline" 
              className={cn(
                'bg-background/50 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2',
                riskLevel.toLowerCase() === 'low' && 'text-compliant border-compliant/30',
                riskLevel.toLowerCase() === 'medium' && 'text-warning border-warning/30',
                riskLevel.toLowerCase() === 'high' && 'text-non-compliant border-non-compliant/30'
              )}
            >
              Risk: {riskLevel}
            </Badge>
          )}

          {hasPurificationBadge && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1 sm:gap-1.5 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
              <Percent className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Purification Required</span>
              <span className="sm:hidden">Purification</span>
            </Badge>
          )}

          {hasBoardReviewBadge && (
            <Badge 
              variant="outline" 
              className="bg-doubtful/10 text-doubtful border-doubtful/30 gap-1 sm:gap-1.5 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2"
              title={boardReviewReason || 'Board review required'}
            >
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Board Review</span>
              <span className="sm:hidden">Review</span>
            </Badge>
          )}

          {hasQABadge && (
            <Badge variant="outline" className="bg-muted/20 text-muted-foreground gap-1 sm:gap-1.5 text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2">
              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              QA
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
