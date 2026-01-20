import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, Info } from 'lucide-react';
import type { ScreeningRecord } from '@/types/screening-record';

interface HalalHaramDonutProps {
  record: ScreeningRecord;
}

// Donut series item shape from CSV
interface DonutSeriesItem {
  label: string;
  value: number;
}

const HALAL_COLOR = 'hsl(var(--compliant))';
const HARAM_COLOR = 'hsl(var(--non-compliant))';

export function HalalHaramDonut({ record }: HalalHaramDonutProps) {
  // Parse donut_series_json for halal/haram split
  const rawDonutSeries = record.donut_series_json;
  const donutSeries: DonutSeriesItem[] = Array.isArray(rawDonutSeries) 
    ? rawDonutSeries as unknown as DonutSeriesItem[]
    : [];
  
  // Extract halal/haram from donut_series_json
  const halalEntry = donutSeries.find(item => item.label?.toLowerCase() === 'halal');
  const haramEntry = donutSeries.find(item => item.label?.toLowerCase() === 'haram');
  
  const halalPct = halalEntry?.value ?? 0;
  const haramPct = haramEntry?.value ?? 0;
  
  // Check if we have data to display
  const hasData = donutSeries.length > 0 && (halalPct > 0 || haramPct > 0);
  
  if (!hasData) {
    return (
      <Card className="premium-card-static">
        <CardContent className="py-8 text-center">
          <Info className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Revenue breakdown not available</p>
        </CardContent>
      </Card>
    );
  }

  // Build chart data
  const chartData = [
    { name: 'Halal', value: Number(halalPct.toFixed(2)), color: HALAL_COLOR },
    { name: 'Haram', value: Number(haramPct.toFixed(2)), color: HARAM_COLOR },
  ].filter(item => item.value > 0);

  return (
    <Card className="premium-card-static">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <PieChartIcon className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Revenue Composition</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
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
          <div className="flex sm:flex-col gap-6 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-compliant shrink-0" />
              <div>
                <p className="text-2xl font-bold text-compliant">{halalPct.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Halal Revenue</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-non-compliant shrink-0" />
              <div>
                <p className="text-2xl font-bold text-non-compliant">{haramPct.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Haram Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
