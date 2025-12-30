// RevenueComposition Component - Uses client_* fields for Haram Revenue Overview
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import { safeParseJSON } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';

interface RevenueCompositionProps {
  record: ScreeningRecord;
}

// Segment item from client_top_segments_json
interface SegmentItem {
  segment_name?: string;
  name?: string;
  pct_of_revenue?: number | string;
  percent?: number | string;
  why_it_matters?: string;
  why?: string;
}

export function RevenueComposition({ record }: RevenueCompositionProps) {
  // Use client_* fields as canonical source
  const haramDisplay = record.client_haram_total_pct_display;
  const topSegmentsLabel = record.client_top_haram_segments_label;
  const topCompositionLabel = record.client_top_haram_composition_label;
  
  // Check if we have any content to display
  const hasContent = haramDisplay || topSegmentsLabel || topCompositionLabel;

  if (!hasContent) {
    return null; // Hide section if all are empty
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Haram Revenue Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Haram % Display */}
          {haramDisplay && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-muted-foreground mb-1">Total Haram Revenue</p>
              <p className="text-2xl font-semibold text-warning font-mono">
                {haramDisplay}
              </p>
            </div>
          )}

          {/* Top Segments Label */}
          {topSegmentsLabel && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Top Haram Segments</p>
              <p className="text-sm font-medium leading-relaxed">
                {topSegmentsLabel}
              </p>
            </div>
          )}

          {/* Top Composition Label */}
          {topCompositionLabel && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Top Haram Composition</p>
              <p className="text-sm font-medium leading-relaxed">
                {topCompositionLabel}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
