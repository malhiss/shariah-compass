// References Section - Non-collapsible grid display with fallback chain
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, BookOpen, Calendar } from 'lucide-react';
import { safeParseJSON, type ScreeningRecord, type ReferenceItem } from '@/types/screening-record';

interface ReferencesSectionProps {
  record: ScreeningRecord;
}

// Get references with fallback chain: client_references_json → website_references_json → haram_references_json
function getReferencesWithFallback(record: ScreeningRecord): ReferenceItem[] {
  // Try client_references_json first
  const clientRefs = safeParseJSON<ReferenceItem[]>(record.client_references_json, []);
  if (clientRefs.length > 0) return clientRefs;

  // Fallback to website_references_json
  const websiteRefs = safeParseJSON<ReferenceItem[]>(record.website_references_json, []);
  if (websiteRefs.length > 0) return websiteRefs;

  // Fallback to haram_references_json
  const haramRefs = safeParseJSON<ReferenceItem[]>(record.haram_references_json, []);
  if (haramRefs.length > 0) return haramRefs;

  return [];
}

export function ReferencesSection({ record }: ReferencesSectionProps) {
  const references = getReferencesWithFallback(record);
  const disclaimer = record.client_disclaimer_short;

  // Hide section if no references
  if (references.length === 0) {
    return (
      <Card className="premium-card">
        <CardContent className="py-12 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sources not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            References ({references.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {references.map((ref, idx) => {
              const sourceName = ref.source_name || ref.source;
              const supports = ref.what_it_supports || ref.supports;
              const asOf = ref.as_of || ref.asOf;
              const url = ref.url;

              // If no URL, just show as a non-clickable card
              if (!url) {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border bg-muted/10"
                  >
                    {sourceName && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{sourceName}</p>
                    )}
                    {supports && (
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {supports}
                      </p>
                    )}
                    {asOf && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {asOf}
                      </div>
                    )}
                  </div>
                );
              }

              // Clickable card that links to the URL
              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 rounded-lg border border-border bg-muted/10 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {sourceName && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{sourceName}</p>
                      )}
                      {supports && (
                        <p className="text-sm font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors">
                          {supports}
                        </p>
                      )}
                      {asOf && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {asOf}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer footer */}
      {disclaimer && (
        <div className="p-4 rounded-lg bg-muted/20 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium">Disclaimer:</span> {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
