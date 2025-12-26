import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPercent } from '@/types/mongodb';
import { normalizeHaramSegments, getHaramPct, getHalalPct } from '@/types/screening-record';
import type { ScreeningRecord, HaramSegment } from '@/types/screening-record';
import { ChevronDown, ChevronUp, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface BreakdownPanelsProps {
  record: ScreeningRecord;
}

interface SegmentRowProps {
  segment: HaramSegment;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function SegmentRow({ segment, isExpanded, onToggle }: SegmentRowProps) {
  // Support both new and legacy field names
  const pointEstimate = segment.point ?? segment.haram_pct_of_total_revenue_point_estimate;
  const lower = segment.lower ?? segment.haram_pct_of_total_revenue_lower;
  const upper = segment.upper ?? segment.haram_pct_of_total_revenue_upper;
  const reasoning = segment.reasoning ?? segment.global_reasoning;
  const hasDetails = segment.description || reasoning || segment.limitations;

  return (
    <div className="border-b border-border/50 last:border-0">
      <div
        className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/10 px-2 -mx-2 rounded"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{segment.name || 'Unknown Segment'}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="font-mono">{formatPercent(pointEstimate)}</span>
            {lower !== null && lower !== undefined && upper !== null && upper !== undefined && (
              <span>({formatPercent(lower)} – {formatPercent(upper)})</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {segment.confidence && (
            <Badge variant="secondary" className="bg-muted/30 text-xs hidden sm:inline-flex">
              {segment.confidence}
            </Badge>
          )}
          {hasDetails && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && hasDetails && (
        <div className="pb-3 pl-2 pr-2 space-y-2">
          {segment.description && (
            <p className="text-sm text-muted-foreground bg-muted/10 p-2 rounded">
              {segment.description}
            </p>
          )}
          {reasoning && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning</p>
              <p className="text-sm text-muted-foreground">{reasoning}</p>
            </div>
          )}
          {segment.limitations && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Limitations</p>
              <p className="text-sm text-muted-foreground">{segment.limitations}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BreakdownPanels({ record }: BreakdownPanelsProps) {
  const [notHalalOpen, setNotHalalOpen] = useState(true);
  const [halalOpen, setHalalOpen] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set());

  const segments = normalizeHaramSegments(record);
  const haramPct = getHaramPct(record);
  const halalPct = getHalalPct(record);

  const toggleSegment = (index: number) => {
    setExpandedSegments((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Not Halal Revenue Panel */}
      <Collapsible open={notHalalOpen} onOpenChange={setNotHalalOpen}>
        <Card className="premium-card">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/10 rounded-t-lg transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <XCircle className="w-5 h-5 text-warning" />
                  Not Halal Revenue
                  {segments.length > 0 && (
                    <Badge variant="secondary" className="bg-warning/15 text-warning ml-2">
                      {segments.length} segment{segments.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {notHalalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {segments.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No non-halal segments identified
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {segments.map((segment, index) => (
                    <SegmentRow
                      key={index}
                      segment={segment}
                      index={index}
                      isExpanded={expandedSegments.has(index)}
                      onToggle={() => toggleSegment(index)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Halal Revenue Panel */}
      <Collapsible open={halalOpen} onOpenChange={setHalalOpen}>
        <Card className="premium-card">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/10 rounded-t-lg transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-5 h-5 text-compliant" />
                  Halal Revenue
                  {halalPct !== null && (
                    <Badge variant="secondary" className="bg-compliant/15 text-compliant ml-2">
                      {halalPct.toFixed(2)}%
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {halalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="border-b border-border/50 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Residual halal revenue</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {halalPct !== null ? `${halalPct.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-3">
                <p className="text-xs text-muted-foreground bg-muted/10 p-3 rounded">
                  Calculated as 100% minus estimated non-halal revenue.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
