import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { safeParseJSON } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { ClipboardCheck, AlertTriangle, Clock } from 'lucide-react';

interface DataQualitySectionProps {
  record: ScreeningRecord;
}

export function DataQualitySection({ record }: DataQualitySectionProps) {
  const qaSummary = record.qa_summary_display;
  const qaIssueCount = record.qa_issue_count;
  const clientNote = record.client_data_quality_note;
  const qaTimestamp = record.qa_timestamp;
  const topReasons = safeParseJSON<string[]>(record.client_data_quality_top_reasons_json, []);

  const hasContent = qaSummary || clientNote || topReasons.length > 0;
  if (!hasContent) return null;

  return (
    <Card className="premium-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardCheck className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Data Quality</CardTitle>
          </div>
          {qaIssueCount !== null && qaIssueCount !== undefined && qaIssueCount > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {qaIssueCount} issue{qaIssueCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {qaSummary && (
          <p className="text-foreground leading-relaxed">{qaSummary}</p>
        )}
        {clientNote && (
          <div className="p-3 rounded-lg bg-muted/10 border border-border">
            <p className="text-sm text-muted-foreground">{clientNote}</p>
          </div>
        )}
        {topReasons.length > 0 && (
          <ul className="space-y-1">
            {topReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-warning mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
        {qaTimestamp && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
            <Clock className="w-3 h-3" />
            <span>Last checked: {new Date(qaTimestamp).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
