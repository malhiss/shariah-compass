import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info, AlertTriangle } from 'lucide-react';
import type { ScreeningRecord } from '@/types/screening-record';

interface HaramRevenueSectionProps {
  record: ScreeningRecord;
}

// Donut series item shape from CSV
interface DonutSeriesItem {
  label: string;
  value: number;
}

// Donut segment item shape from CSV
interface DonutSegmentItem {
  name: string;
  point: number;
  lower?: number;
  upper?: number;
  confidence?: string;
}

const SEGMENT_COLORS = [
  'hsl(var(--non-compliant))',
  'hsl(var(--non-compliant) / 0.75)',
  'hsl(var(--non-compliant) / 0.55)',
  'hsl(var(--non-compliant) / 0.40)',
];

const HALAL_COLOR = 'hsl(var(--compliant))';

export function HaramRevenueSection({ record }: HaramRevenueSectionProps) {
  // Parse donut_series_json for halal/haram split
  // The loader parses this as an array, but we need to handle both array and string
  const rawDonutSeries = record.donut_series_json;
  const donutSeries: DonutSeriesItem[] = Array.isArray(rawDonutSeries) 
    ? rawDonutSeries as unknown as DonutSeriesItem[]
    : [];
  
  // Parse donut_segments_json for haram segment breakdown
  const rawDonutSegments = record.donut_segments_json;
  const donutSegments: DonutSegmentItem[] = Array.isArray(rawDonutSegments)
    ? rawDonutSegments as unknown as DonutSegmentItem[]
    : [];
  
  // Extract halal/haram from donut_series_json
  const halalEntry = donutSeries.find(item => item.label?.toLowerCase() === 'halal');
  const haramEntry = donutSeries.find(item => item.label?.toLowerCase() === 'haram');
  
  const halalPct = halalEntry?.value ?? 0;
  const haramPct = haramEntry?.value ?? 0;
  
  // Check if we have any data to display
  const hasDonutData = donutSeries.length > 0 && (halalPct > 0 || haramPct > 0);
  const hasSegmentData = donutSegments.length > 0;
  
  if (!hasDonutData && !hasSegmentData) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Breakdown not available</p>
        </CardContent>
      </Card>
    );
  }

  // Build chart data from donut_series_json
  const chartData: { name: string; value: number; color: string }[] = [];
  
  if (halalPct > 0) {
    chartData.push({ name: 'Halal', value: Number(halalPct.toFixed(2)), color: HALAL_COLOR });
  }
  
  // Add haram segments from donut_segments_json if available, otherwise use total haram
  if (hasSegmentData) {
    donutSegments.forEach((segment, idx) => {
      const segmentName = segment.name || `Segment ${idx + 1}`;
      const segmentPct = segment.point ?? 0;
      
      if (segmentPct > 0) {
        chartData.push({
          name: segmentName,
          value: Number(segmentPct.toFixed(2)),
          color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
        });
      }
    });
  } else if (haramPct > 0) {
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
          {hasDonutData && (
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
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-[280px]">
                            <p className="text-sm font-semibold text-foreground leading-snug mb-1">
                              {data.name}
                            </p>
                            <p className="text-lg font-bold" style={{ color: data.color }}>
                              {data.value.toFixed(2)}%
                            </p>
                          </div>
                        );
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
          )}

          {/* Segments breakdown */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Haram Segment Breakdown</h4>
            {haramPct > 0 && (
              <p className="text-lg font-semibold text-non-compliant mb-4">{haramPct.toFixed(1)}% Non-Permissible Income Exposure</p>
            )}
            
            {donutSegments.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/10 border border-border text-center">
                <p className="text-sm text-muted-foreground">No detailed segment data available</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {donutSegments.map((segment, idx) => {
                  const segmentName = segment.name || `Segment ${idx + 1}`;
                  const segmentPct = segment.point ?? 0;
                  const lowerPct = segment.lower;
                  const upperPct = segment.upper;
                  const confidence = segment.confidence;

                  return (
                    <AccordionItem 
                      key={idx} 
                      value={`segment-${idx}`}
                      className="border border-border rounded-lg overflow-hidden bg-muted/5"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/10 text-sm">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="font-medium text-left">{segmentName}</span>
                          <Badge variant="outline" className="font-mono text-xs shrink-0 ml-2">
                            {segmentPct.toFixed(2)}%
                          </Badge>
                        </div>
                      </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                        <div className="space-y-2">
                          {(lowerPct !== undefined || upperPct !== undefined) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Range:</span>
                              <span className="font-mono">
                                {lowerPct?.toFixed(1) ?? '?'}% – {upperPct?.toFixed(1) ?? '?'}%
                              </span>
                            </div>
                          )}
                        </div>
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
