import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { safeParseJSON } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { MessageSquare, FileText, AlertCircle, CheckCircle2, Info, AlertTriangle, Users, ExternalLink, Lightbulb, Shield } from 'lucide-react';

interface ClientSummaryTabProps {
  record: ScreeningRecord;
}

// Key point item from client_key_points_json
interface KeyPointItem {
  point?: string;
  text?: string;
}

// Data quality reason from client_data_quality_top_reasons_json
interface DataQualityReason {
  reason?: string;
  text?: string;
}

export function ClientSummaryTab({ record }: ClientSummaryTabProps) {
  // Key points - parse JSON
  const keyPointsRaw = safeParseJSON<KeyPointItem[] | string[]>(record.client_key_points_json, []);
  const keyPoints: string[] = keyPointsRaw
    .map(item => typeof item === 'string' ? item : (item.point || item.text || ''))
    .filter(p => p.length > 0)
    .slice(0, 6);

  // Board review
  const needsBoardReview = record.client_board_review_needs_review;
  const boardReviewReason = record.client_board_review_doubt_reason;

  // Data quality
  const dataQualitySummary = record.client_data_quality_summary_display;
  const dataQualityReasonsRaw = safeParseJSON<DataQualityReason[] | string[]>(record.client_data_quality_top_reasons_json, []);
  const dataQualityReasons: string[] = dataQualityReasonsRaw
    .map(item => typeof item === 'string' ? item : (item.reason || item.text || ''))
    .filter(r => r.length > 0);

  // Disclaimer
  const disclaimer = record.client_disclaimer_short;

  const hasContent = keyPoints.length > 0 || needsBoardReview || dataQualitySummary;

  if (!hasContent) {
    return (
      <Card className="premium-card">
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Summary Available</h3>
          <p className="text-muted-foreground">
            A detailed summary has not been generated for this screening.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Points (Bullets) */}
      {keyPoints.length > 0 && (
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-compliant/10">
                <CheckCircle2 className="w-5 h-5 text-compliant" />
              </div>
              <CardTitle className="text-lg">Key Points</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span className="text-foreground leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Board Review Notice */}
      {needsBoardReview && (
        <Card className="premium-card border-doubtful/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-doubtful/10">
                <Users className="w-5 h-5 text-doubtful" />
              </div>
              <CardTitle className="text-lg text-doubtful">Board Review Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-doubtful/10 border border-doubtful/20">
              <p className="text-foreground leading-relaxed">
                {boardReviewReason || 'This security requires review by a Shariah board due to uncertain compliance status.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Quality & Confidence */}
      {(dataQualitySummary || dataQualityReasons.length > 0) && (
        <Card className="premium-card border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg text-muted-foreground">Data Quality & Confidence</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataQualitySummary && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {dataQualitySummary}
              </p>
            )}
            {dataQualityReasons.length > 0 && (
              <ul className="space-y-1">
                {dataQualityReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer (Footer) */}
      {disclaimer && (
        <div className="p-4 rounded-lg bg-muted/20 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium">Disclaimer:</span> {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
