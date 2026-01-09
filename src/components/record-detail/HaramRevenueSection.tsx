import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info, AlertTriangle } from 'lucide-react';
import { safeParseJSON, type ScreeningRecord, type HaramSegment, type CompositionItem } from '@/types/screening-record';

interface HaramRevenueSectionProps {
  record: ScreeningRecord;
}

const SEGMENT_COLORS = [
  'hsl(var(--non-compliant))',
  'hsl(var(--non-compliant) / 0.75)',
  'hsl(var(--non-compliant) / 0.55)',
  'hsl(var(--non-compliant) / 0.40)',
];

const HALAL_COLOR = 'hsl(var(--compliant))';

export function HaramRevenueSection({ record }: HaramRevenueSectionProps) {
  // Use website_haram_segments_json as primary source for charts
  const haramSegments = safeParseJSON<HaramSegment[]>(record.website_haram_segments_json, []);
  const haramComposition = safeParseJSON<CompositionItem[]>(record.website_haram_composition_json, []);
  
  // Client-facing display fields
  const clientHaramTotalDisplay = record.client_haram_total_pct_display;
  const clientTopSegmentsLabel = record.client_top_haram_segments_label;
  const clientTopCompositionLabel = record.client_top_haram_composition_label;
  const clientHaramBreakdown = record.client_haram_breakdown;
  
  // Check if we have any data to display
  const hasChartData = haramSegments.length > 0;
  const hasCompositionData = haramComposition.length > 0;
  const hasClientData = clientHaramTotalDisplay || clientTopSegmentsLabel || clientTopCompositionLabel || clientHaramBreakdown;
  
  if (!hasChartData && !hasCompositionData && !hasClientData) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Breakdown not available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total haram percentage from segments
  const totalHaramPct = haramSegments.reduce((sum, segment) => {
    const pct = segment.haram_pct_of_total_revenue_point_estimate ?? segment.point ?? segment.pct_of_revenue ?? 0;
    return sum + (typeof pct === 'number' ? pct : 0);
  }, 0);
  
  const halalPct = Math.max(0, 100 - totalHaramPct);

  const chartData: { name: string; value: number; color: string }[] = [
    { name: 'Halal', value: Number(halalPct.toFixed(2)), color: HALAL_COLOR },
  ];

  if (hasChartData) {
    haramSegments.forEach((segment, idx) => {
      const segmentName = segment.name || segment.segment_name || segment.description || `Segment ${idx + 1}`;
      const segmentPct = segment.haram_pct_of_total_revenue_point_estimate ?? segment.point ?? segment.pct_of_revenue;
      
      if (segmentPct !== null && segmentPct !== undefined && typeof segmentPct === 'number') {
        chartData.push({
          name: segmentName,
          value: Number(segmentPct.toFixed(2)),
          color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
        });
      }
    });
  } else if (totalHaramPct > 0) {
    chartData.push({ name: 'Haram', value: Number(totalHaramPct.toFixed(2)), color: SEGMENT_COLORS[0] });
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-semibold">Haram Revenue Exposure</CardTitle>
        {clientHaramTotalDisplay && (
          <p className="text-2xl font-bold text-non-compliant mt-2">{clientHaramTotalDisplay}</p>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {/* Client labels */}
        {(clientTopSegmentsLabel || clientTopCompositionLabel) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {clientTopSegmentsLabel && (
              <Badge variant="outline" className="bg-non-compliant/10 text-non-compliant border-non-compliant/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {clientTopSegmentsLabel}
              </Badge>
            )}
            {clientTopCompositionLabel && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                {clientTopCompositionLabel}
              </Badge>
            )}
          </div>
        )}

        {/* Client haram breakdown text */}
        {clientHaramBreakdown && (
          <div className="p-4 rounded-lg bg-muted/10 border border-border mb-6">
            <p className="text-sm text-foreground leading-relaxed">{clientHaramBreakdown}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart side */}
          {hasChartData && (
            <div className="flex flex-col items-center">
              <div className="h-56 w-full max-w-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(2)}%`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-compliant" />
                  <div>
                    <p className="text-lg font-bold text-compliant">{halalPct.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Halal</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-non-compliant" />
                  <div>
                    <p className="text-lg font-bold text-non-compliant">{totalHaramPct.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Haram</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Segments breakdown */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Segment Breakdown</h4>
            
            {haramSegments.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/10 border border-border text-center">
                <p className="text-sm text-muted-foreground">No detailed segment data available</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {haramSegments.map((segment, idx) => {
                  const segmentName = segment.name || segment.segment_name || segment.description || `Segment ${idx + 1}`;
                  const segmentPct = segment.haram_pct_of_total_revenue_point_estimate ?? segment.point ?? segment.pct_of_revenue;
                  const composition = segment.composition || [];
                  const whyItMatters = segment.why_it_matters;

                  return (
                    <AccordionItem 
                      key={idx} 
                      value={`segment-${idx}`}
                      className="border border-border rounded-lg overflow-hidden bg-muted/5"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/10 text-sm">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="font-medium">{segmentName}</span>
                          {segmentPct !== null && segmentPct !== undefined && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {typeof segmentPct === 'number' ? segmentPct.toFixed(2) : segmentPct}%
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {whyItMatters && (
                          <p className="text-xs text-muted-foreground mb-3 italic">{whyItMatters}</p>
                        )}
                        {composition.length > 0 ? (
                          <div className="space-y-2 pt-2">
                            {composition.map((item, itemIdx) => {
                              const itemName = item.item_name || item.name || `Item ${itemIdx + 1}`;
                              const itemPct = item.haram_pct_of_total_revenue_point_estimate ?? item.pct_of_revenue;
                              const whyHaram = item.why_haram || item.why_it_matters;

                              return (
                                <div key={itemIdx} className="p-3 rounded-lg bg-muted/10 border border-border/50">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium">{itemName}</p>
                                    {itemPct !== null && itemPct !== undefined && (
                                      <span className="font-mono text-xs text-non-compliant shrink-0">
                                        {typeof itemPct === 'number' ? itemPct.toFixed(2) : itemPct}%
                                      </span>
                                    )}
                                  </div>
                                  {whyHaram && (
                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                      {whyHaram}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground pt-2">
                            No composition breakdown available
                          </p>
                        )}
                        
                        {segment.reasoning && (
                          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                            {segment.reasoning}
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>

        {/* Composition table */}
        {hasCompositionData && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Haram Composition</h4>
            <div className="space-y-2">
              {haramComposition.map((item, idx) => {
                const itemName = item.item_name || item.name || `Item ${idx + 1}`;
                const itemPct = item.haram_pct_of_total_revenue_point_estimate ?? item.pct_of_revenue;
                const whyHaram = item.why_haram || item.why_it_matters;

                return (
                  <div key={idx} className="p-3 rounded-lg bg-muted/5 border border-border/50 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{itemName}</p>
                      {whyHaram && (
                        <p className="text-xs text-muted-foreground mt-1">{whyHaram}</p>
                      )}
                    </div>
                    {itemPct !== null && itemPct !== undefined && (
                      <Badge variant="outline" className="font-mono text-xs shrink-0">
                        {typeof itemPct === 'number' ? itemPct.toFixed(2) : itemPct}%
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
