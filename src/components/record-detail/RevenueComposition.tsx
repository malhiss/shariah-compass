import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, Info, AlertCircle, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { coerceToNumber } from '@/types/mongodb';
import { getHaramPct, normalizeHaramSegments, type HaramSegment } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { cn } from '@/lib/utils';

interface RevenueCompositionProps {
  record: ScreeningRecord;
}

// Colors - Halal is green, haram segments use warm/red tones
const HALAL_COLOR = 'hsl(160, 55%, 42%)';
const HARAM_COLORS = [
  'hsl(0, 72%, 51%)',      // Red
  'hsl(25, 95%, 53%)',     // Orange  
  'hsl(45, 93%, 47%)',     // Amber
  'hsl(280, 65%, 60%)',    // Purple
  'hsl(330, 65%, 55%)',    // Pink
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
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string; isHalal?: boolean } }[] }) {
  if (active && payload && payload.length) {
    const isHalal = payload[0].payload.isHalal;
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg max-w-xs">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p 
          className="text-sm font-mono font-semibold" 
          style={{ color: isHalal ? HALAL_COLOR : 'hsl(0, 72%, 51%)' }}
        >
          {payload[0].value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
}

// Custom legend that groups haram segments
function CustomLegend({ payload }: { payload?: { value: string; color: string; payload: { isHalal?: boolean; value: number } }[] }) {
  if (!payload) return null;
  
  const halalItem = payload.find(p => p.payload.isHalal);
  const haramItems = payload.filter(p => !p.payload.isHalal);
  const totalHaram = haramItems.reduce((sum, item) => sum + (item.payload.value || 0), 0);
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm">
      {halalItem && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: halalItem.color }} />
          <span className="text-foreground">Halal ({halalItem.payload.value.toFixed(1)}%)</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-500 to-orange-500" />
        <span className="text-foreground">Not Halal ({totalHaram.toFixed(1)}%)</span>
      </div>
    </div>
  );
}

// Segment bar component for inline display with animation
function SegmentBar({ segment, color, maxPct, delay }: { segment: HaramSegment; color: string; maxPct: number; delay: number }) {
  const [animated, setAnimated] = useState(false);
  const pct = getSegmentPct(segment);
  const widthPercent = maxPct > 0 ? (pct / maxPct) * 100 : 0;
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={cn(
        "group transition-all duration-500 ease-out",
        animated ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div 
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0 transition-transform duration-300"
            style={{ 
              backgroundColor: color,
              transform: animated ? 'scale(1)' : 'scale(0)'
            }}
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
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: animated ? `${widthPercent}%` : '0%',
            backgroundColor: color,
            transitionDelay: `${delay + 200}ms`
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

  // Build chart data with segment breakdown
  const chartData = useMemo(() => {
    const data: { name: string; value: number; color: string; isHalal?: boolean }[] = [];
    
    // Add halal slice
    data.push({ 
      name: 'Halal Revenue', 
      value: halalPct, 
      color: HALAL_COLOR,
      isHalal: true
    });
    
    // Add haram segment slices if we have breakdown
    if (topSegments.length > 0) {
      let totalSegmentPct = 0;
      topSegments.forEach((segment, idx) => {
        const pct = getSegmentPct(segment);
        totalSegmentPct += pct;
        data.push({
          name: segment.name || `Segment ${idx + 1}`,
          value: pct,
          color: HARAM_COLORS[idx % HARAM_COLORS.length],
          isHalal: false
        });
      });
      
      // Add "Other non-halal" if there's a gap
      const remainingHaram = notHalalPct - totalSegmentPct;
      if (remainingHaram > 0.5) {
        data.push({
          name: 'Other non-halal',
          value: remainingHaram,
          color: 'hsl(220, 15%, 45%)',
          isHalal: false
        });
      }
    } else if (notHalalPct > 0) {
      // No segment breakdown, just show total haram
      data.push({
        name: 'Not Halal Revenue',
        value: notHalalPct,
        color: 'hsl(38, 85%, 55%)',
        isHalal: false
      });
    }
    
    return data.filter(d => d.value > 0);
  }, [halalPct, notHalalPct, topSegments]);

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
          {/* Left: Donut chart with segment breakdown */}
          <div className="h-72 lg:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                  strokeWidth={1}
                  stroke="hsl(var(--background))"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Middle: Key percentages */}
          <div className="space-y-4 lg:col-span-1">
            {/* Not Halal percentage */}
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <p className="text-xs text-muted-foreground mb-1">Not Halal Revenue</p>
              <p className="text-2xl font-semibold text-warning">
                {haramDisplay || `${notHalalPct.toFixed(2)}%`}
              </p>
            </div>

            {/* Halal percentage */}
            <div className="p-4 rounded-lg bg-compliant/10 border border-compliant/20 animate-fade-in" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
              <p className="text-xs text-muted-foreground mb-1">Halal Revenue</p>
              <p className="text-2xl font-semibold text-compliant">
                {halalPct.toFixed(2)}%
              </p>
            </div>

            {/* Confidence note */}
            {segments.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Hover over chart segments for details.
                </p>
              </div>
            )}
          </div>

          {/* Right: Top segments breakdown list */}
          <div className="lg:col-span-1">
            {topSegments.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Non-Halal Breakdown
                  </h4>
                </div>
                <div className="space-y-3">
                  {topSegments.map((segment, idx) => (
                    <SegmentBar 
                      key={idx} 
                      segment={segment} 
                      color={HARAM_COLORS[idx % HARAM_COLORS.length]}
                      maxPct={maxSegmentPct}
                      delay={100 + idx * 100}
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
