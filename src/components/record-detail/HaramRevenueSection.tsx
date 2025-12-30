import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info } from 'lucide-react';
import { safeParseJSON, type ScreeningRecord, type HaramSegment } from '@/types/screening-record';

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
  const haramPct = record.haram_pct_point;
  
  if (haramPct === null || haramPct === undefined || typeof haramPct !== 'number' || isNaN(haramPct)) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No revenue composition data available</p>
        </CardContent>
      </Card>
    );
  }

  const halalPct = record.halal_pct_point !== null && record.halal_pct_point !== undefined 
    ? record.halal_pct_point 
    : (100 - haramPct);

  const haramSegments = safeParseJSON<HaramSegment[]>(record.haram_segments_json, []);

  const chartData: { name: string; value: number; color: string }[] = [
    { name: 'Halal', value: Number(halalPct.toFixed(2)), color: HALAL_COLOR },
  ];

  if (haramSegments.length > 0) {
    haramSegments.forEach((segment, idx) => {
      const segmentName = segment.name || segment.description || `Segment ${idx + 1}`;
      const segmentPct = segment.haram_pct_of_total_revenue_point_estimate ?? segment.point;
      
      if (segmentPct !== null && segmentPct !== undefined && typeof segmentPct === 'number') {
        chartData.push({
          name: segmentName,
          value: Number(segmentPct.toFixed(2)),
          color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
        });
      }
    });
  } else {
    chartData.push({ name: 'Haram', value: Number(haramPct.toFixed(2)), color: SEGMENT_COLORS[0] });
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-semibold">Revenue Composition</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart side */}
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
                  <p className="text-lg font-bold text-non-compliant">{haramPct.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Haram</p>
                </div>
              </div>
            </div>
          </div>

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
                  const segmentName = segment.name || segment.description || `Segment ${idx + 1}`;
                  const segmentPct = segment.haram_pct_of_total_revenue_point_estimate ?? segment.point;
                  const composition = segment.composition || [];

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
                        {composition.length > 0 ? (
                          <div className="space-y-2 pt-2">
                            {composition.map((item, itemIdx) => {
                              const itemName = item.item_name || (item as any).name || `Item ${itemIdx + 1}`;
                              const itemPct = item.haram_pct_of_total_revenue_point_estimate;
                              const whyHaram = item.why_haram;

                              return (
                                <div key={itemIdx} className="p-3 rounded-lg bg-muted/10 border border-border/50">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium">{itemName}</p>
                                    {itemPct !== null && itemPct !== undefined && (
                                      <span className="font-mono text-xs text-non-compliant shrink-0">
                                        {itemPct.toFixed(2)}%
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
      </CardContent>
    </Card>
  );
}
