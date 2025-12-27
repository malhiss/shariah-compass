// NotHalalRevenue Component
// Displays non-halal revenue breakdown with segments, composition pie chart, and human-readable references

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, AlertTriangle, ExternalLink, Info, RefreshCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { safeParseJSON, type ScreeningRecord, type HaramSegment, type CompositionItem, type ReferenceItem } from '@/types/screening-record';

interface NotHalalRevenueProps {
  record: ScreeningRecord;
}

// Colors for pie chart - using warm/destructive tones
const CHART_COLORS = [
  'hsl(0, 72%, 51%)',      // Red
  'hsl(25, 95%, 53%)',     // Orange
  'hsl(45, 93%, 47%)',     // Amber
  'hsl(280, 65%, 60%)',    // Purple
  'hsl(200, 75%, 50%)',    // Blue
  'hsl(160, 60%, 45%)',    // Teal
  'hsl(330, 65%, 55%)',    // Pink
  'hsl(180, 50%, 45%)',    // Cyan
];

// Format percentage with 2 decimals
function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
}

// Get the best percentage value for sorting/display
function getSegmentPct(segment: HaramSegment): number {
  return segment.haram_pct_of_total_revenue_point_estimate ??
    segment.point ??
    segment.haram_pct_of_total_revenue_upper ??
    segment.upper ??
    segment.haram_pct_of_total_revenue_lower ??
    segment.lower ??
    0;
}

// Get composition item percentage
function getCompositionPct(item: CompositionItem): number {
  return item.haram_pct_of_total_revenue_point_estimate ?? 0;
}

// Build a map from reference ID to reference object
function buildReferenceMap(segments: HaramSegment[]): Map<string, ReferenceItem> {
  const map = new Map<string, ReferenceItem>();
  for (const segment of segments) {
    if (segment.references) {
      for (const ref of segment.references) {
        if (ref.id) {
          map.set(ref.id, ref);
        }
      }
    }
  }
  return map;
}

// Custom tooltip for pie chart
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm text-destructive font-mono">{formatPct(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

// Composition Chart Component - Donut style matching the reference
function CompositionChart({ items }: { items: CompositionItem[] }) {
  const chartData = useMemo(() => {
    return items
      .filter(item => getCompositionPct(item) > 0)
      .map(item => ({
        name: item.item_name || 'Unknown',
        value: getCompositionPct(item),
      }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  if (chartData.length === 0) return null;

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            isAnimationActive={true}
            animationBegin={100}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-xs text-muted-foreground leading-tight">{value}</span>
            )}
            wrapperStyle={{ fontSize: '11px', paddingLeft: '10px', maxWidth: '55%' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Composition Item Row with table-style layout
function CompositionItemRow({ 
  item, 
  referenceMap,
  colorIndex
}: { 
  item: CompositionItem;
  referenceMap: Map<string, ReferenceItem>;
  colorIndex: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pct = getCompositionPct(item);
  
  // Resolve reference IDs to human-readable names
  const resolvedRefs = useMemo(() => {
    if (!item.reference_ids?.length) return [];
    return item.reference_ids
      .map(id => referenceMap.get(id))
      .filter((ref): ref is ReferenceItem => !!ref);
  }, [item.reference_ids, referenceMap]);

  const hasExpandableContent = item.why_haram || resolvedRefs.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center gap-3 py-2 px-1 hover:bg-muted/30 rounded transition-colors">
          {/* Color indicator */}
          <div 
            className="w-3 h-3 rounded-sm flex-shrink-0" 
            style={{ backgroundColor: CHART_COLORS[colorIndex % CHART_COLORS.length] }}
          />
          
          {/* Expand icon */}
          {hasExpandableContent ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )
          ) : (
            <span className="w-4" />
          )}
          
          {/* Item name */}
          <span className="text-sm text-left flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
            {item.item_name || 'Unknown Item'}
          </span>
          
          {/* Percentage */}
          <span className="text-sm font-mono font-medium text-destructive">
            {formatPct(pct)}
          </span>
        </div>
      </CollapsibleTrigger>
      
      {hasExpandableContent && (
        <CollapsibleContent className="ml-10 mb-2 space-y-2">
          {item.why_haram && (
            <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">
              {item.why_haram}
            </p>
          )}
          {resolvedRefs.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Sources: </span>
              {resolvedRefs.map((ref, idx) => (
                <span key={idx}>
                  {ref.url ? (
                    <a 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {ref.source_name || 'Source'}
                    </a>
                  ) : (
                    <span>{ref.source_name || 'Source'}</span>
                  )}
                  {idx < resolvedRefs.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

// Human-readable Reference Link
function ReferenceLink({ reference }: { reference: ReferenceItem }) {
  const hasUrl = reference.url && reference.url.trim() !== '';
  
  // Format source type for display
  const formatSourceType = (type?: string) => {
    if (!type) return null;
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex items-start gap-2 flex-wrap flex-1">
        {hasUrl ? (
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {reference.source_name || 'Source'}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-sm text-foreground">
            {reference.source_name || 'Source'}
          </span>
        )}
        {reference.source_type && (
          <Badge variant="secondary" className="text-xs">
            {formatSourceType(reference.source_type)}
          </Badge>
        )}
        {reference.as_of && (
          <Badge variant="outline" className="text-xs">
            {reference.as_of}
          </Badge>
        )}
      </div>
    </div>
  );
}

// Segment Panel
function SegmentPanel({ 
  segment, 
  index,
  referenceMap
}: { 
  segment: HaramSegment; 
  index: number;
  referenceMap: Map<string, ReferenceItem>;
}) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const pct = getSegmentPct(segment);
  const hasComposition = segment.composition && segment.composition.length > 0;
  const hasReferences = segment.references && segment.references.length > 0;
  const description = segment.description || segment.global_reasoning || segment.reasoning;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Segment Header */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="px-4 py-3 flex items-center justify-between bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-left">{segment.name || `Segment ${index + 1}`}</span>
            </div>
            <Badge variant="destructive" className="font-mono">
              {formatPct(pct)}
            </Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 space-y-4 border-t border-border">
            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            {/* Composition with Chart */}
            {hasComposition && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Composition Breakdown
                  </h5>
                </div>
                
                {/* Pie Chart */}
                <CompositionChart items={segment.composition!} />
                
                {/* Composition List */}
                <div className="divide-y divide-border/50">
                  {segment.composition!
                    .sort((a, b) => getCompositionPct(b) - getCompositionPct(a))
                    .map((item, idx) => (
                      <CompositionItemRow 
                        key={idx} 
                        item={item} 
                        referenceMap={referenceMap}
                        colorIndex={idx}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Limitations */}
            {segment.limitations && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-xs">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground italic">
                  {segment.limitations}
                </p>
              </div>
            )}

            {/* References */}
            {hasReferences && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  References
                </h5>
                <div className="divide-y divide-border/50">
                  {segment.references!.map((ref, idx) => (
                    <ReferenceLink key={idx} reference={ref} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function NotHalalRevenue({ record }: NotHalalRevenueProps) {
  // Parse segments
  const segments = useMemo(() => {
    return safeParseJSON<HaramSegment[]>(record.haram_segments_json, []);
  }, [record.haram_segments_json]);
  
  // Build reference map for ID resolution
  const referenceMap = useMemo(() => buildReferenceMap(segments), [segments]);
  
  // Sort segments by percentage descending
  const sortedSegments = useMemo(() => {
    return [...segments].sort((a, b) => getSegmentPct(b) - getSegmentPct(a));
  }, [segments]);
  
  // Limit to top 5
  const topSegments = sortedSegments.slice(0, 5);
  
  // Get total display
  const totalDisplay = record.haram_total_pct_display && record.haram_total_pct_display.trim()
    ? record.haram_total_pct_display
    : record.haram_pct_point !== null && record.haram_pct_point !== undefined
      ? `≈ ${record.haram_pct_point.toFixed(1)}%`
      : null;

  // Check if we have any haram revenue
  const hasNoHaramRevenue = (record.haram_pct_point === 0 || record.haram_pct_point === null) && segments.length === 0;

  return (
    <Card className="premium-card border-destructive/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Not Halal Revenue
          </CardTitle>
          {totalDisplay && (
            <Badge 
              variant="destructive" 
              className="text-sm font-mono px-3 py-1.5"
            >
              {totalDisplay}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasNoHaramRevenue ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No clearly non-permissible revenue identified.</p>
          </div>
        ) : (
          <>
            {/* Segment List */}
            {topSegments.length > 0 ? (
              <div className="space-y-3">
                {topSegments.map((segment, idx) => (
                  <SegmentPanel 
                    key={idx} 
                    segment={segment} 
                    index={idx}
                    referenceMap={referenceMap}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No segment breakdown available.</p>
                {record.haram_pct_point !== null && record.haram_pct_point !== undefined && (
                  <p className="text-xs mt-2">
                    Total non-halal revenue: {formatPct(record.haram_pct_point)}
                  </p>
                )}
              </div>
            )}

            {/* Global Reasoning (if not in segments) */}
            {record.haram_global_reasoning && segments.length === 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/20 border border-border">
                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {record.haram_global_reasoning}
                </p>
              </div>
            )}

            {/* Limitations */}
            {record.haram_limitations && (
              <p className="text-xs text-muted-foreground italic pt-2 border-t border-border">
                {record.haram_limitations}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
