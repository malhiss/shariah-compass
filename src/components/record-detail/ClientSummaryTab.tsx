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

// Reference item from client_references_json
interface ReferenceItem {
  source_name?: string;
  name?: string;
  what_it_supports?: string;
  supports?: string;
  as_of_date?: string;
  as_of?: string;
  url?: string;
}

// Data quality reason from client_data_quality_top_reasons_json
interface DataQualityReason {
  reason?: string;
  text?: string;
}

export function ClientSummaryTab({ record }: ClientSummaryTabProps) {
  // Client headline/summary fields
  const oneLineSummary = record.client_headline_one_line_summary || record.client_summary;
  
  // Key points - parse JSON
  const keyPointsRaw = safeParseJSON<KeyPointItem[] | string[]>(record.client_key_points_json, []);
  const keyPoints: string[] = keyPointsRaw
    .map(item => typeof item === 'string' ? item : (item.point || item.text || ''))
    .filter(p => p.length > 0)
    .slice(0, 6);

  // What this means for investors
  const whatItMeans = record.client_what_it_means_for_investors;

  // Purification guidance
  const purificationGuidance = record.client_purification_guidance;

  // Board review
  const needsBoardReview = record.client_board_review_needs_review;
  const boardReviewReason = record.client_board_review_doubt_reason;

  // Data quality
  const dataQualitySummary = record.client_data_quality_summary_display;
  const dataQualityReasonsRaw = safeParseJSON<DataQualityReason[] | string[]>(record.client_data_quality_top_reasons_json, []);
  const dataQualityReasons: string[] = dataQualityReasonsRaw
    .map(item => typeof item === 'string' ? item : (item.reason || item.text || ''))
    .filter(r => r.length > 0);

  // References
  const references = safeParseJSON<ReferenceItem[]>(record.client_references_json, []);

  // Disclaimer
  const disclaimer = record.client_disclaimer_short;

  const hasContent = oneLineSummary || keyPoints.length > 0 || whatItMeans || 
                     purificationGuidance || needsBoardReview || 
                     dataQualitySummary || references.length > 0;

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
      {/* One-Line Summary (Hero Text) */}
      {oneLineSummary && (
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-lg">
              {oneLineSummary}
            </p>
          </CardContent>
        </Card>
      )}

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

      {/* What This Means for Investors */}
      {whatItMeans && (
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">What This Means for Investors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              {whatItMeans}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Purification Guidance */}
      {purificationGuidance && (
        <Card className="premium-card border-warning/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <CardTitle className="text-lg">Purification Guidance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              {purificationGuidance}
            </p>
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

      {/* References (Expandable) */}
      {references.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="references" className="border border-border rounded-lg premium-card">
            <AccordionTrigger className="px-6 hover:no-underline">
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                References ({references.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-3">
                {references.map((ref, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">
                          {ref.source_name || ref.name || 'Source'}
                        </p>
                        {(ref.what_it_supports || ref.supports) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {ref.what_it_supports || ref.supports}
                          </p>
                        )}
                        {(ref.as_of_date || ref.as_of) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            As of: {ref.as_of_date || ref.as_of}
                          </p>
                        )}
                      </div>
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Link
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
