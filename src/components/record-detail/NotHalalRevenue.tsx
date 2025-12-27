// NotHalalRevenue Component
// Displays non-halal revenue breakdown with segments, composition pie chart, and human-readable references

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, AlertTriangle, ExternalLink, Info, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { safeParseJSON, type ScreeningRecord, type HaramSegment, type CompositionItem, type ReferenceItem } from '@/types/screening-record';

interface NotHalalRevenueProps {
  record: ScreeningRecord;
}

// Colors for pie chart
const CHART_COLORS = [
  'hsl(0, 72%, 51%)',      // Red
  'hsl(25, 95%, 53%)',     // Orange
  'hsl(45, 93%, 47%)',     // Amber
  'hsl(280, 65%, 60%)',    // Purple
  'hsl(200, 75%, 50%)',    // Blue
  'hsl(160, 60%, 45%)',    // Teal
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
        <p className="text-sm text-destructive">{formatPct(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

// Composition Chart Component
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
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={65}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Composition Item Row with table-style layout
function CompositionItemRow({ 
  item, 
  referenceMap 
}: { 
  item: CompositionItem;
  referenceMap: Map<string, ReferenceItem>;
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

  return (
    <div className="border-l-2 border-destructive/20 pl-3 py-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm hover:text-foreground transition-colors text-left flex-1">
            {item.why_haram || resolvedRefs.length > 0 ? (
              isOpen ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />
            ) : (
              <span className="w-3" />
            )}
            <span className="text-muted-foreground">{item.item_name || 'Unknown Item'}</span>
          </CollapsibleTrigger>
          <span className="text-sm font-medium text-destructive ml-2">
            {formatPct(pct)}
          </span>
        </div>
        {(item.why_haram || resolvedRefs.length > 0) && (
          <CollapsibleContent className="mt-2 ml-5 space-y-2">
            {item.why_haram && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
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
    </div>
  );
}

// Human-readable Reference Link
function ReferenceLink({ reference }: { reference: ReferenceItem }) {
  const hasUrl = reference.url && reference.url.trim() !== '';
  
  // Format source type for display (remove underscores, title case)
  const formatSourceType = (type?: string) => {
    if (!type) return null;
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="border-l-2 border-border pl-3 py-2">
      <div className="flex items-start gap-2 flex-wrap">
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
          <span className="text-sm text-muted-foreground">
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
            As of {reference.as_of}
          </Badge>
        )}
      </div>
      {reference.what_it_supports && (
        <p className="text-xs text-muted-foreground mt-1">
          {reference.what_it_supports}
        </p>
      )}
    </div>
  );
}

// Segment Accordion Item
function SegmentRow({ 
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
  const hasContent = segment.description || hasComposition || hasReferences || segment.global_reasoning;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            {hasContent ? (
              isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              <span className="w-4" />
            )}
            <span className="font-medium text-left">{segment.name || `Segment ${index + 1}`}</span>
          </div>
          <Badge variant="destructive" className="font-mono">
            {formatPct(pct)}
          </Badge>
        </CollapsibleTrigger>

        {hasContent && (
          <CollapsibleContent className="px-4 py-3 space-y-4 bg-background">
            {/* Description */}
            {segment.description && (
              <p className="text-sm text-muted-foreground">
                {segment.description}
              </p>
            )}

            {/* Composition with Chart */}
            {hasComposition && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Composition Breakdown
                  </h5>
                </div>
                
                {/* Pie Chart */}
                <CompositionChart items={segment.composition!} />
                
                {/* Composition Table */}
                <div className="space-y-1">
                  {segment.composition!.map((item, idx) => (
                    <CompositionItemRow 
                      key={idx} 
                      item={item} 
                      referenceMap={referenceMap}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Global Reasoning */}
            {(segment.global_reasoning || segment.reasoning) && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {segment.global_reasoning || segment.reasoning}
                  </p>
                </div>
              </div>
            )}

            {/* Limitations */}
            {segment.limitations && (
              <p className="text-xs text-muted-foreground italic">
                Limitations: {segment.limitations}
              </p>
            )}

            {/* References */}
            {hasReferences && (
              <div className="space-y-1">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  References
                </h5>
                <div className="space-y-1">
                  {segment.references!.map((ref, idx) => (
                    <ReferenceLink key={idx} reference={ref} />
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
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
      ? `${record.haram_pct_point.toFixed(2)}%`
      : null;

  // Check if we have any haram revenue
  const hasNoHaramRevenue = (record.haram_pct_point === 0 || record.haram_pct_point === null) && segments.length === 0;

  return (
    <Card className="border-destructive/30 max-h-[500px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Not Halal Revenue
          </CardTitle>
          {totalDisplay && (
            <Badge variant="destructive" className="text-base font-mono px-3 py-1">
              {totalDisplay}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 overflow-y-auto flex-1">
        {hasNoHaramRevenue ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No clearly non-permissible revenue identified.</p>
          </div>
        ) : (
          <>
            {/* Segment List */}
            {topSegments.length > 0 ? (
              <div className="space-y-2">
                {topSegments.map((segment, idx) => (
                  <SegmentRow 
                    key={idx} 
                    segment={segment} 
                    index={idx}
                    referenceMap={referenceMap}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No segment breakdown available.</p>
                {record.haram_pct_point !== null && record.haram_pct_point !== undefined && (
                  <p className="text-xs mt-1">
                    Total non-halal revenue: {formatPct(record.haram_pct_point)}
                  </p>
                )}
              </div>
            )}

            {/* Global Reasoning (if not in segments) */}
            {record.haram_global_reasoning && segments.length === 0 && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {record.haram_global_reasoning}
                  </p>
                </div>
              </div>
            )}

            {/* Limitations */}
            {record.haram_limitations && (
              <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
                {record.haram_limitations}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
