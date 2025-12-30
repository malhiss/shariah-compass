import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { safeParseJSON } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import { CompanyProfileSection } from './CompanyProfileSection';

interface ClientSummaryTabProps {
  record: ScreeningRecord;
}

// Key point item from client_key_points_json
interface KeyPointItem {
  point?: string;
  text?: string;
}

export function ClientSummaryTab({ record }: ClientSummaryTabProps) {
  // Key points - parse JSON
  const keyPointsRaw = safeParseJSON<KeyPointItem[] | string[]>(record.client_key_points_json, []);
  const keyPoints: string[] = keyPointsRaw
    .map(item => typeof item === 'string' ? item : (item.point || item.text || ''))
    .filter(p => p.length > 0)
    .slice(0, 6);

  // Disclaimer
  const disclaimer = record.client_disclaimer_short;

  // Check if we have any company profile data
  const hasProfileData = record.exchange || record.country || record.reporting_period || 
    record.company_description || (record.business_segments_summary && record.business_segments_summary.length > 0);

  const hasContent = keyPoints.length > 0 || hasProfileData;

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
      {/* Company Profile Section - displayed first */}
      <CompanyProfileSection record={record} />

      {/* Findings (Bullets) */}
      {keyPoints.length > 0 && (
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-compliant/10">
                <CheckCircle2 className="w-5 h-5 text-compliant" />
              </div>
              <CardTitle className="text-lg">Findings</CardTitle>
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
