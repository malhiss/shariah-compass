import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { normalizeQAIssues, getRecordTicker, getRecordCompanyName, getRecordReportDate, type ScreeningRecord } from '@/types/screening-record';
import { coerceToBoolean } from '@/types/mongodb';
import { ClipboardCheck, Copy, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface QATabProps {
  record: ScreeningRecord;
}

export function QATab({ record }: QATabProps) {
  const { toast } = useToast();

  const needsReview = coerceToBoolean(record.qa_needs_review ?? record.QA_Needs_Review);
  const qaIssues = normalizeQAIssues(record);
  const qaStatus = record.qa_status ?? record.QA_Status;
  const issueCount = record.qa_issue_count ?? record.QA_Issue_Count ?? qaIssues.length;

  const summaryDisplay = record.qa_summary_display;
  const categorySummary = record.qa_category_summary;
  const reasonsSummary = record.qa_reasons_summary;
  const issuesCollapsed = record.qa_issues_collapsed;

  const hasPayload = !!record.payload_json;
  const ticker = getRecordTicker(record);
  const companyName = getRecordCompanyName(record);
  const reportDate = getRecordReportDate(record);

  // Build summary text for copy
  const buildSummaryText = () => {
    const parts: string[] = [];
    parts.push(`QA Summary for ${ticker} - ${companyName}`);
    parts.push(`Report Date: ${reportDate || 'N/A'}`);
    parts.push(`QA Status: ${qaStatus || 'N/A'}`);
    parts.push(`Issue Count: ${issueCount}`);
    parts.push('');

    if (needsReview !== null) {
      parts.push(`Needs Review: ${needsReview ? 'Yes' : 'No'}`);
    }

    if (summaryDisplay) {
      parts.push(`Summary: ${summaryDisplay}`);
    }

    if (categorySummary) {
      parts.push(`Category Summary: ${categorySummary}`);
    }

    if (reasonsSummary) {
      parts.push(`Reasons: ${reasonsSummary}`);
    }

    if (qaIssues.length > 0) {
      parts.push('');
      parts.push('Issues:');
      qaIssues.forEach((issue, idx) => {
        const desc = issue.description || issue.category || 'Unknown issue';
        parts.push(`  ${idx + 1}. ${desc}`);
      });
    }

    return parts.join('\n');
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText());
      toast({
        title: 'Copied',
        description: 'QA summary copied to clipboard',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPayload = () => {
    if (!record.payload_json) return;

    try {
      const blob = new Blob([record.payload_json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ticker}_payload.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Downloaded',
        description: 'Payload JSON downloaded',
      });
    } catch {
      toast({
        title: 'Download failed',
        description: 'Unable to download payload',
        variant: 'destructive',
      });
    }
  };

  const hasSummaryContent = summaryDisplay || categorySummary || reasonsSummary || issuesCollapsed;

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            QA Review
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary text-xs">
              Staff Only
            </Badge>
          </CardTitle>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopySummary} className="border-border">
              <Copy className="w-4 h-4 mr-2" />
              Copy Summary
            </Button>
            {hasPayload && (
              <Button variant="outline" size="sm" onClick={handleDownloadPayload} className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Download Payload
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Review status */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Review Status:</span>
          {needsReview === null ? (
            <Badge variant="secondary" className="bg-muted/30">Unknown</Badge>
          ) : needsReview ? (
            <Badge className="bg-warning/15 text-warning border-warning/30">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Needs Review
            </Badge>
          ) : (
            <Badge className="bg-compliant/15 text-compliant border-compliant/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Reviewed
            </Badge>
          )}
        </div>

        {/* Summary displays */}
        {hasSummaryContent && (
          <>
            <Separator />
            <div className="space-y-4">
              {summaryDisplay && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
                    {summaryDisplay}
                  </p>
                </div>
              )}

              {categorySummary && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Category Summary</h4>
                  <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
                    {categorySummary}
                  </p>
                </div>
              )}

              {reasonsSummary && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Reasons Summary</h4>
                  <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
                    {reasonsSummary}
                  </p>
                </div>
              )}

              {issuesCollapsed && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Issues (Collapsed)</h4>
                  <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
                    {issuesCollapsed}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Individual issues */}
        {qaIssues.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3">
                QA Issues ({qaIssues.length})
              </h4>
              <div className="space-y-2">
                {qaIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-muted/10 flex items-start gap-3"
                  >
                    <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      {issue.category && (
                        <Badge variant="secondary" className="bg-muted/30 text-xs mb-1">
                          {issue.category}
                        </Badge>
                      )}
                      <p className="text-sm">
                        {issue.description || 'No description'}
                      </p>
                      {issue.severity && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Severity: {issue.severity}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!hasSummaryContent && qaIssues.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-compliant mx-auto mb-4" />
            <p className="text-muted-foreground">
              No QA issues or summary available for this record.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
