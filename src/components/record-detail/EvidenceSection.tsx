import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, FileSearch, ExternalLink } from 'lucide-react';
import { normalizeEvidence, type ScreeningRecord } from '@/types/screening-record';

interface EvidenceSectionProps {
  record: ScreeningRecord;
}

function getSeverityBadge(severity: string | undefined) {
  const sev = (severity || '').toUpperCase();
  
  switch (sev) {
    case 'FAIL':
      return (
        <Badge className="bg-non-compliant/15 text-non-compliant border-non-compliant/30 text-xs gap-1">
          <AlertTriangle className="w-3 h-3" />
          FAIL
        </Badge>
      );
    case 'CAUTION':
      return (
        <Badge className="bg-warning/15 text-warning border-warning/30 text-xs gap-1">
          <AlertCircle className="w-3 h-3" />
          CAUTION
        </Badge>
      );
    default:
      return (
        <Badge className="bg-primary/15 text-primary border-primary/30 text-xs gap-1">
          <Info className="w-3 h-3" />
          INFO
        </Badge>
      );
  }
}

export function EvidenceSection({ record }: EvidenceSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const evidenceItems = normalizeEvidence(record);

  if (evidenceItems.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center">
          <FileSearch className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No evidence items available</p>
        </CardContent>
      </Card>
    );
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

  const clampText = (text: string | undefined, maxLen = 200): { text: string; truncated: boolean } => {
    if (!text) return { text: '', truncated: false };
    if (text.length <= maxLen) return { text, truncated: false };
    return { text: text.slice(0, maxLen) + '...', truncated: true };
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <span>Business Flags & Evidence</span>
          <Badge variant="outline" className="text-xs font-normal">
            {evidenceItems.length} item{evidenceItems.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {evidenceItems.map((item, idx) => {
            const isExpanded = expandedItems.has(idx);
            const snippet = clampText(item.snippet);
            const showExpand = snippet.truncated || item.rationale;

            return (
              <div 
                key={idx} 
                className="rounded-lg border border-border bg-muted/5 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {getSeverityBadge(item.severity)}
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      {item.snippet && (
                        <p className="text-sm text-foreground leading-relaxed">
                          {isExpanded ? item.snippet : snippet.text}
                        </p>
                      )}

                      {/* Expanded rationale */}
                      {isExpanded && item.rationale && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Rationale</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {item.rationale}
                          </p>
                        </div>
                      )}

                      {/* Source */}
                      {(item.source || item.ref) && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Source: {item.source || item.ref}</span>
                          {item.ref && item.ref.startsWith('http') && (
                            <a 
                              href={item.ref} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {showExpand && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(idx)}
                        className="shrink-0 h-8 w-8 p-0"
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
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
