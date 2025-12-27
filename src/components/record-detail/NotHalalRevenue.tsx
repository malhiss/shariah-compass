// NotHalalRevenue Component
// Displays non-halal revenue breakdown with segments, composition, and references

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { safeParseJSON, type ScreeningRecord } from '@/types/screening-record';

// Types for segment structure
interface CompositionItem {
  item_name?: string;
  haram_pct_of_total_revenue_lower?: number;
  haram_pct_of_total_revenue_upper?: number;
  haram_pct_of_total_revenue_point_estimate?: number;
  why_haram?: string;
  reference_ids?: string[];
}

interface Reference {
  id?: string;
  source_name?: string;
  source_type?: string;
  what_it_supports?: string;
  url?: string;
  as_of?: string;
}

interface HaramSegment {
  name?: string;
  description?: string;
  haram_pct_of_total_revenue_lower?: number;
  haram_pct_of_total_revenue_upper?: number;
  haram_pct_of_total_revenue_point_estimate?: number;
  confidence?: number;
  global_reasoning?: string;
  limitations?: string;
  composition?: CompositionItem[];
  references?: Reference[];
}

interface NotHalalRevenueProps {
  record: ScreeningRecord;
}

// Format percentage with 2 decimals
function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
}

// Get the best percentage value for sorting
function getSegmentPct(segment: HaramSegment): number {
  return segment.haram_pct_of_total_revenue_point_estimate ??
    segment.haram_pct_of_total_revenue_upper ??
    segment.haram_pct_of_total_revenue_lower ??
    0;
}

// Composition Item Row
function CompositionItemRow({ item }: { item: CompositionItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const pct = item.haram_pct_of_total_revenue_point_estimate;

  return (
    <div className="border-l-2 border-destructive/20 pl-3 py-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
            {item.why_haram ? (
              isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
            ) : (
              <span className="w-3" />
            )}
            <span className="text-muted-foreground">{item.item_name || 'Unknown Item'}</span>
          </CollapsibleTrigger>
          <span className="text-sm font-medium text-destructive">
            {formatPct(pct)}
          </span>
        </div>
        {item.why_haram && (
          <CollapsibleContent className="mt-2 ml-5">
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              {item.why_haram}
            </p>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

// Reference Link
function ReferenceLink({ reference }: { reference: Reference }) {
  const hasUrl = reference.url && reference.url.trim() !== '';

  return (
    <div className="border-l-2 border-border pl-3 py-2">
      <div className="flex items-start gap-2">
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
        {reference.as_of && (
          <Badge variant="outline" className="text-xs">
            {reference.as_of}
          </Badge>
        )}
        {reference.source_type && (
          <Badge variant="secondary" className="text-xs">
            {reference.source_type}
          </Badge>
        )}
      </div>
      {reference.what_it_supports && (
        <p className="text-xs text-muted-foreground mt-1 ml-0">
          {reference.what_it_supports}
        </p>
      )}
    </div>
  );
}

// Segment Accordion Item
function SegmentRow({ segment, index }: { segment: HaramSegment; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0); // First one open by default
  const pct = getSegmentPct(segment);
  const hasComposition = segment.composition && segment.composition.length > 0;
  const hasReferences = segment.references && segment.references.length > 0;
  const hasContent = segment.description || hasComposition || hasReferences;

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

            {/* Composition */}
            {hasComposition && (
              <div className="space-y-1">
                <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Composition
                </h5>
                <div className="space-y-1">
                  {segment.composition!.map((item, idx) => (
                    <CompositionItemRow key={idx} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Global Reasoning */}
            {segment.global_reasoning && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {segment.global_reasoning}
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
  const segments = safeParseJSON<HaramSegment[]>(record.haram_segments_json, []);
  
  // Sort segments by percentage descending
  const sortedSegments = [...segments].sort((a, b) => getSegmentPct(b) - getSegmentPct(a));
  
  // Limit to top 5
  const topSegments = sortedSegments.slice(0, 5);
  
  // Get total display
  const totalDisplay = record.haram_total_pct_display && record.haram_total_pct_display.trim()
    ? record.haram_total_pct_display
    : record.haram_pct_point !== null && record.haram_pct_point !== undefined
      ? `${record.haram_pct_point.toFixed(2)}%`
      : null;

  // Get reference IDs used
  const referenceIdsUsed = record.haram_reference_ids_used;
  const truncatedRefIds = referenceIdsUsed && referenceIdsUsed.length > 120
    ? referenceIdsUsed.substring(0, 120) + '…'
    : referenceIdsUsed;

  // Check if we have any haram revenue
  const hasNoHaramRevenue = (record.haram_pct_point === 0 || record.haram_pct_point === null) && segments.length === 0;

  return (
    <Card className="border-destructive/30 max-h-[400px] flex flex-col">
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
                  <SegmentRow key={idx} segment={segment} index={idx} />
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
            {(record as any).haram_global_reasoning && segments.length === 0 && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {(record as any).haram_global_reasoning}
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

            {/* Reference IDs footer */}
            {truncatedRefIds && (
              <div className="text-xs text-muted-foreground border-t border-border pt-3">
                <span className="font-medium">Reference IDs used:</span> {truncatedRefIds}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
