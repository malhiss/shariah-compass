import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart as PieChartIcon, Info, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { coerceToNumber } from '@/types/mongodb';
import { getHaramPct, normalizeHaramSegments } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';

interface RevenueCompositionProps {
  record: ScreeningRecord;
}

export function RevenueComposition({ record }: RevenueCompositionProps) {
  const haramPct = coerceToNumber(getHaramPct(record));
  const haramDisplay = record.haram_total_pct_display;
  const topSegmentsLabel = record.haram_top_segments_label;
  const segments = normalizeHaramSegments(record);
  const hasSegments = segments.length > 0;

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Donut chart */}
          <div className="h-64">
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
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(210, 18%, 28%)',
                    border: '1px solid hsl(210, 15%, 38%)',
                    borderRadius: '8px',
                    color: 'hsl(0, 0%, 98%)',
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                />
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

          {/* Right: Key info cards */}
          <div className="space-y-4">
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

            {/* Top segments label */}
            {topSegmentsLabel && (
              <div className="p-4 rounded-lg bg-muted/20 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Top Segments</p>
                <p className="text-sm font-medium">{topSegmentsLabel}</p>
              </div>
            )}

            {/* Confidence note */}
            {hasSegments && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Estimates include limitations; expand segments below for details.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
