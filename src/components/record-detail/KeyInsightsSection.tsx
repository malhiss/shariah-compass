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

  const insights = [
    { content: summary, icon: MessageSquare, label: 'Summary', color: 'primary' },
    { content: whatItMeans, icon: Lightbulb, label: 'For Investors', color: 'primary' },
    { content: purificationGuidance, icon: FileText, label: 'Purification', color: 'warning' },
  ].filter(i => i.content);

  return (
    <section className="space-y-2 sm:space-y-3">
      {insights.map((insight, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/10 border border-border/50"
        >
          <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg shrink-0 ${
            insight.color === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
          }`}>
            <insight.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              insight.color === 'warning' ? 'text-warning' : 'text-primary'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5 sm:mb-1">
              {insight.label}
            </p>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              {insight.content}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
