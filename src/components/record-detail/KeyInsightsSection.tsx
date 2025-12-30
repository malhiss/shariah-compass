// Key Insights Section - Summary, What it means, Purification guidance
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Lightbulb, FileText } from 'lucide-react';
import type { ScreeningRecord } from '@/types/screening-record';

interface KeyInsightsSectionProps {
  record: ScreeningRecord;
}

export function KeyInsightsSection({ record }: KeyInsightsSectionProps) {
  const summary = record.client_headline_one_line_summary || record.client_summary;
  const whatItMeans = record.client_what_it_means_for_investors;
  const purificationGuidance = record.client_purification_guidance;

  const hasContent = summary || whatItMeans || purificationGuidance;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Summary */}
      {summary && (
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* What This Means for Investors */}
      {whatItMeans && (
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">For Investors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {whatItMeans}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Purification Guidance */}
      {purificationGuidance && (
        <Card className="premium-card border-warning/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <FileText className="w-4 h-4 text-warning" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Purification</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {purificationGuidance}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
