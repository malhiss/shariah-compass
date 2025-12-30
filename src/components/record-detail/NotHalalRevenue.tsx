// NotHalalRevenue Component - Displays Haram Segments and Composition Tables from client_* fields
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { safeParseJSON } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';

interface NotHalalRevenueProps {
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

// Composition item from client_top_composition_json
interface CompositionItem {
  item_name?: string;
  name?: string;
  pct_of_total_revenue?: number | string;
  percent?: number | string;
  why_non_permissible?: string;
  why?: string;
}

function formatPct(value: number | string | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  if (typeof value === 'string') {
    if (value.includes('%')) return value;
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return `${num.toFixed(2)}%`;
  }
  return `${value.toFixed(2)}%`;
}

export function NotHalalRevenue({ record }: NotHalalRevenueProps) {
  const [segmentsOpen, setSegmentsOpen] = useState(true);
  const [compositionOpen, setCompositionOpen] = useState(false);

  // Parse JSON fields
  const segments = safeParseJSON<SegmentItem[]>(record.client_top_segments_json, []).slice(0, 3);
  const composition = safeParseJSON<CompositionItem[]>(record.client_top_composition_json, []).slice(0, 5);

  const hasSegments = segments.length > 0;
  const hasComposition = composition.length > 0;

  if (!hasSegments && !hasComposition) {
    return null; // Hide section if no data
  }

  return (
    <div className="space-y-4">
      {/* Haram Segments Table */}
      {hasSegments && (
        <Card className="premium-card border-warning/20">
          <Collapsible open={segmentsOpen} onOpenChange={setSegmentsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Haram Segments
                  </CardTitle>
                  {segmentsOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Segment Name</TableHead>
                        <TableHead className="text-right text-muted-foreground">% of Revenue</TableHead>
                        <TableHead className="text-muted-foreground">Why It Matters</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {segments.map((segment, idx) => (
                        <TableRow key={idx} className="border-border">
                          <TableCell className="font-medium">
                            {segment.segment_name || segment.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-warning">
                            {formatPct(segment.pct_of_revenue ?? segment.percent)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs">
                            {segment.why_it_matters || segment.why || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Haram Composition Table */}
      {hasComposition && (
        <Card className="premium-card border-warning/20">
          <Collapsible open={compositionOpen} onOpenChange={setCompositionOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Haram Composition
                  </CardTitle>
                  {compositionOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Item / Product</TableHead>
                        <TableHead className="text-right text-muted-foreground">% of Total Revenue</TableHead>
                        <TableHead className="text-muted-foreground">Why Non-Permissible</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {composition.map((item, idx) => (
                        <TableRow key={idx} className="border-border">
                          <TableCell className="font-medium">
                            {item.item_name || item.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-warning">
                            {formatPct(item.pct_of_total_revenue ?? item.percent)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs">
                            {item.why_non_permissible || item.why || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
}
