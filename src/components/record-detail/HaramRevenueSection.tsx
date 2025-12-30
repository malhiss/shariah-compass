// Haram Revenue Section with Donut Chart + Segment Accordion
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { safeParseJSON, type ScreeningRecord, type HaramSegment, type CompositionItem } from '@/types/screening-record';

interface HaramRevenueSectionProps {
  record: ScreeningRecord;
}

// Colors for donut chart
const CHART_COLORS = {
  halal: 'hsl(var(--compliant))',
  haram: 'hsl(var(--non-compliant))',
};

export function HaramRevenueSection({ record }: HaramRevenueSectionProps) {
  // Check if we have valid haram data
  const haramPct = record.haram_pct_point;
  
  // STRICT: If haram_pct_point is null/undefined or not a number, hide entire section
  if (haramPct === null || haramPct === undefined || typeof haramPct !== 'number' || isNaN(haramPct)) {
    return null;
  }

  // Calculate halal percentage
  const halalPct = record.halal_pct_point !== null && record.halal_pct_point !== undefined 
    ? record.halal_pct_point 
    : (100 - haramPct);

  // Donut chart data
  const chartData = [
    { name: 'Halal', value: Number(halalPct.toFixed(2)), color: CHART_COLORS.halal },
    { name: 'Haram', value: Number(haramPct.toFixed(2)), color: CHART_COLORS.haram },
  ];

  // Parse haram segments from JSON
  const haramSegments = safeParseJSON<HaramSegment[]>(record.haram_segments_json, []);

  // Optional summary line from client_haram_breakdown
  const haramSummary = record.client_haram_breakdown;

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Revenue Composition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optional Summary Line */}
        {haramSummary && (
          <div className="p-3 rounded-lg bg-muted/20 border border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {haramSummary}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="flex flex-col items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Summary Stats */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-compliant">{halalPct.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Halal</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-non-compliant">{haramPct.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Haram</p>
              </div>
            </div>
          </div>

          {/* Segment Breakdown Accordion */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Segment Breakdown</h4>
            
            {haramSegments.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/10 border border-border text-center">
                <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No segment data available</p>
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
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/10">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="font-medium text-sm">{segmentName}</span>
                          {segmentPct !== null && segmentPct !== undefined && (
                            <Badge variant="outline" className="ml-2 font-mono text-xs">
                              {typeof segmentPct === 'number' ? segmentPct.toFixed(2) : segmentPct}%
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {composition.length > 0 ? (
                          <div className="space-y-3 pt-2">
                            {composition.map((item, itemIdx) => {
                              const itemName = item.item_name || (item as any).name || `Item ${itemIdx + 1}`;
                              const itemPct = item.haram_pct_of_total_revenue_point_estimate;
                              const lower = item.haram_pct_of_total_revenue_lower;
                              const upper = item.haram_pct_of_total_revenue_upper;
                              const whyHaram = item.why_haram;

                              return (
                                <div 
                                  key={itemIdx} 
                                  className="p-3 rounded-lg bg-muted/20 border border-border/50"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium text-sm">{itemName}</p>
                                    <div className="text-right">
                                      {itemPct !== null && itemPct !== undefined && (
                                        <p className="font-mono text-xs text-non-compliant">
                                          {itemPct.toFixed(2)}%
                                        </p>
                                      )}
                                      {(lower !== null && lower !== undefined && upper !== null && upper !== undefined) && (
                                        <p className="font-mono text-xs text-muted-foreground">
                                          ({lower.toFixed(1)}% - {upper.toFixed(1)}%)
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {whyHaram && (
                                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                      {whyHaram}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground pt-2">
                            No composition breakdown available for this segment.
                          </p>
                        )}
                        
                        {/* Segment reasoning if available */}
                        {segment.reasoning && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/10">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Reasoning:</span> {segment.reasoning}
                            </p>
                          </div>
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
