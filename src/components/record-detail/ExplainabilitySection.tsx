import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { safeParseJSON, type ScreeningRecord, type KeyDriverItem, type RedFlagItem } from '@/types/screening-record';
import { Brain, Zap, AlertTriangle, Activity } from 'lucide-react';

interface ExplainabilitySectionProps {
  record: ScreeningRecord;
}

export function ExplainabilitySection({ record }: ExplainabilitySectionProps) {
  const rationale = record.llm_primary_rationale;
  const keyDrivers = safeParseJSON<KeyDriverItem[] | string[]>(record.key_drivers_json, []);
  const redFlags = safeParseJSON<RedFlagItem[] | string[]>(record.red_flag_industries_json, []);
  const businessStatus = record.business_status;

  // Normalize key drivers to strings
  const driverStrings: string[] = keyDrivers
    .map(d => typeof d === 'string' ? d : (d.driver || d.text || d.name || ''))
    .filter(s => s.length > 0);

  // Normalize red flags to strings
  const redFlagStrings: string[] = redFlags
    .map(f => typeof f === 'string' ? f : (f.industry || f.name || f.text || f.reason || ''))
    .filter(s => s.length > 0);

  const hasContent = rationale || driverStrings.length > 0 || redFlagStrings.length > 0 || businessStatus;
  if (!hasContent) return null;

  const getBusinessStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const upper = status.toUpperCase();
    if (upper === 'PASS') {
      return <Badge className="bg-compliant/15 text-compliant border-compliant/30">PASS</Badge>;
    }
    if (upper === 'FAIL') {
      return <Badge className="bg-non-compliant/15 text-non-compliant border-non-compliant/30">FAIL</Badge>;
    }
    if (upper === 'CAUTION') {
      return <Badge className="bg-warning/15 text-warning border-warning/30">CAUTION</Badge>;
    }
    if (upper === 'REVIEW') {
      return <Badge className="bg-doubtful/15 text-doubtful border-doubtful/30">REVIEW</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <Card className="premium-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">AI Explainability</CardTitle>
          </div>
          {businessStatus && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              {getBusinessStatusBadge(businessStatus)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary rationale */}
        {rationale && (
          <div className="p-4 rounded-lg bg-muted/10 border border-border">
            <p className="text-foreground leading-relaxed">{rationale}</p>
          </div>
        )}

        {/* Key drivers */}
        {driverStrings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Key Drivers</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {driverStrings.map((driver, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20"
                >
                  {driver}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Red flag industries */}
        {redFlagStrings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-non-compliant" />
              <span className="text-sm font-medium text-muted-foreground">Red Flag Industries</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {redFlagStrings.map((flag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-non-compliant/5 text-non-compliant border-non-compliant/20"
                >
                  {flag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
