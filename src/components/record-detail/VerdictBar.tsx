import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { safeParseJSON } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Scale, Percent, Users, Ban, AlertCircle, Shield } from 'lucide-react';

interface VerdictBarProps {
  record: ScreeningRecord;
}

// Badge item parsed from client_badges_json
interface BadgeItem {
  label?: string;
  type?: string;
}

export function VerdictBar({ record }: VerdictBarProps) {
  // Use client_headline_* fields as canonical source
  const verdictLabel = record.client_headline_final_classification || record.client_verdict_label || 'Not Available';
  const screeningStatus = record.client_headline_screening_status;
  const riskLevel = record.client_risk_level;
  
  // Parse badges from JSON
  const badges = safeParseJSON<BadgeItem[]>(record.client_badges_json, []);

  // Determine color based on verdict label
  const getColorClass = () => {
    const lowerLabel = verdictLabel.toLowerCase();
    if (lowerLabel.includes('compliant') && !lowerLabel.includes('non')) {
      if (lowerLabel.includes('purification')) return 'warning';
      return 'compliant';
    }
    if (lowerLabel.includes('non-compliant') || lowerLabel.includes('non compliant')) return 'non-compliant';
    if (lowerLabel.includes('doubtful') || lowerLabel.includes('review')) return 'doubtful';
    return 'no-data';
  };

  const colorClass = getColorClass();

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

  // Check for specific badges
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
    <Card className="premium-card">
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
            <span className="text-lg">{verdictLabel}</span>
          </div>

          {/* Divider on desktop */}
          <div className="hidden md:block h-10 w-px bg-border" />

          {/* Action cards & badges */}
          <div className="flex flex-wrap gap-3 flex-1">
            {/* Screening Status Badge */}
            {screeningStatus && (
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
                <Shield className="w-3 h-3 mr-1" />
                {screeningStatus}
              </Badge>
            )}

            {/* Risk Level Badge */}
            {riskLevel && (
              <Badge 
                variant="outline" 
                className={cn(
                  riskLevel.toLowerCase() === 'low' && 'bg-compliant/10 border-compliant/30 text-compliant',
                  riskLevel.toLowerCase() === 'medium' && 'bg-warning/10 border-warning/30 text-warning',
                  riskLevel.toLowerCase() === 'high' && 'bg-non-compliant/10 border-non-compliant/30 text-non-compliant'
                )}
              >
                Risk: {riskLevel}
              </Badge>
            )}

            {/* Purification Badge */}
            {hasPurificationBadge && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 border border-warning/20">
                <Percent className="w-4 h-4 text-warning" />
                <p className="font-medium text-warning text-sm">Purification Required</p>
              </div>
            )}

            {/* Board Review Badge */}
            {hasBoardReviewBadge && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-doubtful/10 border border-doubtful/20" title={boardReviewReason || 'Board review required'}>
                <Users className="w-4 h-4 text-doubtful" />
                <p className="font-medium text-doubtful text-sm">Board Review Required</p>
              </div>
            )}

            {/* QA Issues Badge */}
            {hasQABadge && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/20 border border-border">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium text-muted-foreground text-sm">QA Issues</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
