import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { safeParseJSON, type ScreeningRecord, type ShariahBulletItem } from '@/types/screening-record';
import { MessageSquare, CheckCircle2, Lightbulb } from 'lucide-react';

interface ClientSummaryTabProps {
  record: ScreeningRecord;
}

export function ClientSummaryTab({ record }: ClientSummaryTabProps) {
  // Primary Shariah Summary - parse from final_shariah_summary first
  const shariahSummary = record.final_shariah_summary || record.shariah_summary || record.client_summary || record.llm_primary_rationale || null;
  
  // NPIN Overview - parse from estimated_npin_final_shariah_summary
  const npinOverview = record.estimated_npin_final_shariah_summary || null;
  
  // Shariah key bullets
  const bulletItems = safeParseJSON<ShariahBulletItem[] | string[]>(record.shariah_key_bullets_json, []);
  const bullets: string[] = bulletItems
    .map(item => typeof item === 'string' ? item : (item.bullet || item.text || item.point || ''))
    .filter(p => p.length > 0)
    .slice(0, 6);

  // What it means for investors
  const whatItMeans = record.client_what_it_means_for_investors;

  // Disclaimer
  const disclaimer = record.client_disclaimer_short;

  const hasSummaryContent = shariahSummary || npinOverview || bullets.length > 0 || whatItMeans;

  return (
    <div className="space-y-6">
      {/* Shariah Summary Section */}
      {hasSummaryContent && (
        <Card className="premium-card">
          <CardContent className="pt-6 space-y-4">
            {/* Shariah Summary - always shown when available */}
            {shariahSummary && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold">Shariah Summary</span>
                </div>
                <p className="text-foreground leading-relaxed">{shariahSummary}</p>
              </div>
            )}

            {/* NPIN Overview - shown below Shariah Summary */}
            {npinOverview && (
              <div className={shariahSummary ? "pt-4 border-t border-border" : ""}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold">NPIN Overview</span>
                </div>
                <p className="text-foreground leading-relaxed">{npinOverview}</p>
              </div>
            )}

            {/* Key bullets */}
            {bullets.length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-compliant" />
                  <span className="text-sm font-medium text-muted-foreground">Key Findings</span>
                </div>
                <ul className="space-y-2">
                  {bullets.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1.5">•</span>
                      <span className="text-foreground leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What it means for investors */}
            {whatItMeans && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-muted-foreground">What It Means for Investors</span>
                </div>
                <p className="text-foreground leading-relaxed">{whatItMeans}</p>
              </div>
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
