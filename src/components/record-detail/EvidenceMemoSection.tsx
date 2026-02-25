import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { normalizeEvidence, getMemoUrl, type ScreeningRecord } from '@/types/screening-record';
import { FileText, ExternalLink, AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';

interface EvidenceMemoSectionProps {
  record: ScreeningRecord;
}

function getSeverityIcon(severity: string | undefined) {
  const sev = (severity || '').toUpperCase();
  if (sev === 'FAIL') return <AlertTriangle className="w-3 h-3 text-non-compliant" />;
  if (sev === 'CAUTION') return <AlertCircle className="w-3 h-3 text-warning" />;
  return <Info className="w-3 h-3 text-primary" />;
}

function getSeverityClass(severity: string | undefined) {
  const sev = (severity || '').toUpperCase();
  if (sev === 'FAIL') return 'border-non-compliant/30 bg-non-compliant/5';
  if (sev === 'CAUTION') return 'border-warning/30 bg-warning/5';
  return 'border-primary/30 bg-primary/5';
}

export function EvidenceMemoSection({ record }: EvidenceMemoSectionProps) {
  const memoUrl = getMemoUrl(record);
  const evidenceItems = normalizeEvidence(record);
  const lastUpdated = record.final_ticker_summary_last_updated;

  const hasContent = memoUrl || evidenceItems.length > 0;
  if (!hasContent) return null;

  return (
    <Card className="premium-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Evidence & Memo</CardTitle>
          </div>
          {memoUrl && (
            <a href={memoUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="btn-dalil">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Memo
              </Button>
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Evidence items */}
        {evidenceItems.length > 0 && (
          <div className="space-y-2">
            {evidenceItems.slice(0, 5).map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${getSeverityClass(item.severity)}`}
              >
                <div className="flex items-start gap-2">
                  {getSeverityIcon(item.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                      {item.severity && (
                        <span className="text-xs text-muted-foreground uppercase">
                          {item.severity}
                        </span>
                      )}
                    </div>
                    {item.snippet && (
                      <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                        {item.snippet}
                      </p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {evidenceItems.length > 5 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                + {evidenceItems.length - 5} more evidence items
              </p>
            )}
          </div>
        )}

        {/* Last updated */}
        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
            <Clock className="w-3 h-3" />
            <span>Last updated: {new Date(lastUpdated).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
