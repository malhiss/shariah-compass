import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart as PieChartIcon, Info, AlertCircle, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { coerceToNumber } from '@/types/mongodb';
import { getHaramPct, normalizeHaramSegments, type HaramSegment } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';

interface RevenueCompositionProps {
  record: ScreeningRecord;
}

// Colors for segments
const SEGMENT_COLORS = [
  'hsl(0, 72%, 51%)',      // Red
  'hsl(25, 95%, 53%)',     // Orange  
  'hsl(45, 93%, 47%)',     // Amber
  'hsl(280, 65%, 60%)',    // Purple
  'hsl(200, 75%, 50%)',    // Blue
];

// Get segment percentage
function getSegmentPct(segment: HaramSegment): number {
  return segment.haram_pct_of_total_revenue_point_estimate ??
    segment.point ??
    segment.haram_pct_of_total_revenue_upper ??
    segment.upper ??
    segment.haram_pct_of_total_revenue_lower ??
    segment.lower ??
    0;
}

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm font-mono" style={{ color: payload[0].payload.color }}>
          {payload[0].value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
}

// Segment bar component for inline display
function SegmentBar({ segment, color, maxPct }: { segment: HaramSegment; color: string; maxPct: number }) {
  const pct = getSegmentPct(segment);
  const widthPercent = maxPct > 0 ? (pct / maxPct) * 100 : 0;
  
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div 
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
            {segment.name}
          </span>
        </div>
        <span className="text-sm font-mono font-medium text-destructive ml-2">
          {pct.toFixed(2)}%
        </span>
      </div>
      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${widthPercent}%`,
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );
}

export function RevenueComposition({ record }: RevenueCompositionProps) {
  const haramPct = coerceToNumber(getHaramPct(record));
  const haramDisplay = record.haram_total_pct_display;
  const segments = normalizeHaramSegments(record);
  
  // Sort and get top segments
  const topSegments = useMemo(() => {
    return [...segments]
      .sort((a, b) => getSegmentPct(b) - getSegmentPct(a))
      .slice(0, 5);
  }, [segments]);
  
  const maxSegmentPct = useMemo(() => {
    return Math.max(...topSegments.map(getSegmentPct), 0);
  }, [topSegments]);

  // Calculate halal percentage
  const notHalalPct = haramPct !== null ? Math.min(haramPct, 100) : 0;
  const halalPct = Math.max(0, 100 - notHalalPct);

  const chartData = [
    { name: 'Halal', value: halalPct, color: 'hsl(160, 55%, 42%)' },
    { name: 'Not Halal', value: notHalalPct, color: 'hsl(38, 85%, 55%)' },
  ];

  // Don't show chart if no data
  const hasData = haramPct !== null || haramDisplay;

  if (!hasData) {
    return (
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Revenue Composition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No revenue composition data available for this record.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChartIcon className="w-5 h-5 text-primary" />
          Revenue Composition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Donut chart */}
          <div className="h-64 lg:col-span-1">
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
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Middle: Key percentages */}
          <div className="space-y-4 lg:col-span-1">
            {/* Not Halal percentage */}
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-muted-foreground mb-1">Not Halal Revenue</p>
              <p className="text-2xl font-semibold text-warning">
                {haramDisplay || `${notHalalPct.toFixed(2)}%`}
              </p>
            </div>

            {/* Halal percentage */}
            <div className="p-4 rounded-lg bg-compliant/10 border border-compliant/20">
              <p className="text-xs text-muted-foreground mb-1">Halal Revenue</p>
              <p className="text-2xl font-semibold text-compliant">
                {halalPct.toFixed(2)}%
              </p>
            </div>

            {/* Confidence note */}
            {segments.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Estimates include limitations; see details below.
                </p>
              </div>
            )}
          </div>

          {/* Right: Top segments breakdown */}
          <div className="lg:col-span-1">
            {topSegments.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Top Non-Halal Segments
                  </h4>
                </div>
                <div className="space-y-3">
                  {topSegments.map((segment, idx) => (
                    <SegmentBar 
                      key={idx} 
                      segment={segment} 
                      color={SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}
                      maxPct={maxSegmentPct}
                    />
                  ))}
                </div>
              </div>
            ) : record.haram_top_segments_label ? (
              <div className="p-4 rounded-lg bg-muted/20 border border-border h-full">
                <p className="text-xs text-muted-foreground mb-2">Top Segments</p>
                <p className="text-sm font-medium leading-relaxed">
                  {record.haram_top_segments_label}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No segment breakdown available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
