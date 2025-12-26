import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPercent } from '@/types/mongodb';
import { normalizeHaramSegments, getHaramPct } from '@/types/screening-record';
import type { ScreeningRecord, HaramSegment } from '@/types/screening-record';
import { PieChart, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface HaramBreakdownTabProps {
  record: ScreeningRecord;
}

export function HaramBreakdownTab({ record }: HaramBreakdownTabProps) {
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set());

  const segments = normalizeHaramSegments(record);
  const haramTotalDisplay = record.haram_total_pct_display;
  const haramForScreening = getHaramPct(record);
  const topSegmentsLabel = record.haram_top_segments_label;

  const toggleSegment = (index: number) => {
    setExpandedSegments((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Empty state
  if (segments.length === 0 && !haramTotalDisplay && haramForScreening === null) {
    return (
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Haram Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No haram segment estimate available for this record.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Haram Revenue Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total haram display */}
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-muted-foreground mb-1">Total Haram Revenue</p>
            <p className="text-2xl font-semibold text-warning">
              {haramTotalDisplay || formatPercent(haramForScreening)}
            </p>
          </div>

          {/* Screening value */}
          {haramForScreening !== null && haramForScreening !== undefined && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Value Used for Screening</p>
              <p className="text-2xl font-semibold">
                {formatPercent(haramForScreening)}
              </p>
            </div>
          )}

          {/* Top segments label */}
          {topSegmentsLabel && (
            <div className="p-4 rounded-lg bg-muted/20 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Top Segments</p>
              <p className="text-sm font-medium">{topSegmentsLabel}</p>
            </div>
          )}
        </div>

        {/* Segments table */}
        {segments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Segment Details</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Segment</TableHead>
                    <TableHead className="text-right text-muted-foreground">Estimate</TableHead>
                    <TableHead className="text-right text-muted-foreground">Range</TableHead>
                    <TableHead className="text-center text-muted-foreground">Confidence</TableHead>
                    <TableHead className="text-center text-muted-foreground">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map((segment: HaramSegment, index: number) => {
                    const isExpanded = expandedSegments.has(index);
                    const pointEstimate = segment.point ?? segment.haram_pct_of_total_revenue_point_estimate;
                    const lower = segment.lower ?? segment.haram_pct_of_total_revenue_lower;
                    const upper = segment.upper ?? segment.haram_pct_of_total_revenue_upper;
                    const reasoning = segment.reasoning ?? segment.global_reasoning;

                    return (
                      <>
                        <TableRow key={index} className="border-border">
                          <TableCell>
                            <div className="max-w-[200px]">
                              <p className="font-medium">{segment.name || 'Unknown'}</p>
                              {segment.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {segment.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatPercent(pointEstimate)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-muted-foreground">
                            {lower !== null && lower !== undefined && upper !== null && upper !== undefined
                              ? `${formatPercent(lower)} – ${formatPercent(upper)}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-center">
                            {segment.confidence ? (
                              <Badge variant="secondary" className="bg-muted/30 text-xs">
                                {segment.confidence}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {(reasoning || segment.limitations) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSegment(index)}
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (reasoning || segment.limitations) && (
                          <TableRow key={`${index}-expanded`} className="border-border bg-muted/10">
                            <TableCell colSpan={5} className="p-4">
                              <div className="space-y-3">
                                {reasoning && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Reasoning</h5>
                                    <p className="text-sm text-muted-foreground">
                                      {reasoning}
                                    </p>
                                  </div>
                                )}
                                {segment.limitations && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Limitations</h5>
                                    <p className="text-sm text-muted-foreground">
                                      {segment.limitations}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
