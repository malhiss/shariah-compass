// Evidence Section - Business Flags / Evidence from evidence_items_json
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, FileSearch, ExternalLink } from 'lucide-react';
import { safeParseJSON, normalizeEvidence, type ScreeningRecord, type EvidenceItem } from '@/types/screening-record';

interface EvidenceSectionProps {
  record: ScreeningRecord;
}

// Get severity badge styling
function getSeverityBadge(severity: string | undefined) {
  const sev = (severity || '').toUpperCase();
  
  switch (sev) {
    case 'FAIL':
      return (
        <Badge className="bg-non-compliant/20 text-non-compliant border-non-compliant/30 text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          FAIL
        </Badge>
      );
    case 'CAUTION':
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          CAUTION
        </Badge>
      );
    case 'INFO':
    default:
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
          <Info className="w-3 h-3 mr-1" />
          INFO
        </Badge>
      );
  }
}

export function EvidenceSection({ record }: EvidenceSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Get evidence items
  const evidenceItems = normalizeEvidence(record);

  // Hide section if no evidence
  if (evidenceItems.length === 0) {
    return null;
  }

  const toggleExpand = (idx: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Clamp snippet to ~200 chars
  const clampText = (text: string | undefined, maxLen = 200): { text: string; truncated: boolean } => {
    if (!text) return { text: '', truncated: false };
    if (text.length <= maxLen) return { text, truncated: false };
    return { text: text.slice(0, maxLen) + '...', truncated: true };
  };

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSearch className="w-5 h-5 text-primary" />
          Business Flags / Evidence
          <Badge variant="outline" className="ml-2 text-xs">
            {evidenceItems.length} item{evidenceItems.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {evidenceItems.map((item, idx) => {
            const isExpanded = expandedItems.has(idx);
            const snippet = clampText(item.snippet);
            const showExpand = snippet.truncated || item.rationale;

            return (
              <div 
                key={idx} 
                className="p-4 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header row: severity + category */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {getSeverityBadge(item.severity)}
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>

                    {/* Snippet */}
                    {item.snippet && (
                      <p className="text-sm text-foreground leading-relaxed">
                        {isExpanded ? item.snippet : snippet.text}
                      </p>
                    )}

                    {/* Expanded content */}
                    {isExpanded && item.rationale && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Rationale</p>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {item.rationale}
                        </p>
                      </div>
                    )}

                    {/* Source/Ref */}
                    {(item.source || item.ref) && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Source: {item.source || item.ref}
                        </span>
                        {item.ref && item.ref.startsWith('http') && (
                          <a 
                            href={item.ref} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expand button */}
                  {showExpand && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(idx)}
                      className="shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
