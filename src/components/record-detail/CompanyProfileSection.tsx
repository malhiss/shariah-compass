import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Calendar, FileText, Layers } from 'lucide-react';
import type { ScreeningRecord } from '@/types/screening-record';

interface CompanyProfileSectionProps {
  record: ScreeningRecord;
}

export function CompanyProfileSection({ record }: CompanyProfileSectionProps) {
  const exchange = record.exchange || null;
  const country = record.country || null;
  const reportingPeriod = record.reporting_period || null;
  const companyDescription = record.company_description || null;
  const businessSegments = record.business_segments_summary || null;

  // Check if we have any profile data to display
  const hasProfileData = exchange || country || reportingPeriod || companyDescription || (businessSegments && businessSegments.length > 0);

  if (!hasProfileData) {
    return null;
  }

  return (
    <Card className="premium-card-static">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Company Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Top row: Exchange, Country, Reporting Period */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-md bg-muted/50 mt-0.5">
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Exchange</p>
              <p className="text-sm font-medium text-foreground">{exchange ?? 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-md bg-muted/50 mt-0.5">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Country</p>
              <p className="text-sm font-medium text-foreground">{country ?? 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-md bg-muted/50 mt-0.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Reporting Period</p>
              <p className="text-sm font-medium text-foreground">{reportingPeriod ?? 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Company Description */}
        {companyDescription && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company Description</p>
            </div>
            <p className="text-sm text-foreground leading-relaxed line-clamp-4">
              {companyDescription}
            </p>
          </div>
        )}

        {/* Business Segments */}
        {businessSegments && businessSegments.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Segments</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {businessSegments.map((segment, index) => (
                <Badge 
                  key={index} 
                  variant="muted"
                  className="text-xs"
                >
                  {segment}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
