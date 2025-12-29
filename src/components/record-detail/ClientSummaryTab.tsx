import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ScreeningRecord } from '@/types/screening-record';
import { MessageSquare, FileText, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ClientSummaryTabProps {
  record: ScreeningRecord;
}

export function ClientSummaryTab({ record }: ClientSummaryTabProps) {
  const clientSummary = record.client_summary;
  const clientVerdictLabel = record.client_verdict_label;
  const clientKeyPoints = record.client_key_points;
  const clientPurificationGuidance = record.client_purification_guidance;
  const clientHaramBreakdown = record.client_haram_breakdown;
  const clientDataQualityNote = record.client_data_quality_note;
  const clientDisclaimer = record.client_disclaimer_short;

  const hasContent = clientSummary || clientVerdictLabel || clientKeyPoints || 
                     clientPurificationGuidance || clientHaramBreakdown;

  if (!hasContent) {
    return (
      <Card className="premium-card">
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Client Summary Available</h3>
          <p className="text-muted-foreground">
            A detailed client summary has not been generated for this screening.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Summary */}
      {clientSummary && (
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Summary</CardTitle>
              {clientVerdictLabel && (
                <Badge variant="outline" className="ml-auto">
                  {clientVerdictLabel}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {clientSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Points */}
      {clientKeyPoints && (
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <CardTitle className="text-lg">Key Points</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {clientKeyPoints}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Purification Guidance */}
      {clientPurificationGuidance && (
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <CardTitle className="text-lg">Purification Guidance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {clientPurificationGuidance}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Haram Breakdown */}
      {clientHaramBreakdown && (
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <CardTitle className="text-lg">Non-Compliant Revenue Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {clientHaramBreakdown}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Data Quality Note & Disclaimer */}
      {(clientDataQualityNote || clientDisclaimer) && (
        <Card className="premium-card border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Info className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg text-muted-foreground">Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientDataQualityNote && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Data Quality</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {clientDataQualityNote}
                </p>
              </div>
            )}
            {clientDisclaimer && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Disclaimer</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {clientDisclaimer}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
