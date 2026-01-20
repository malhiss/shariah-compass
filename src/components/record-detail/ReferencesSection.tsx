// References Section - Non-collapsible grid display with fallback chain
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, BookOpen, Calendar, FileText, Quote } from 'lucide-react';
import { safeParseJSON, type ScreeningRecord, type ReferenceItem, type EvidenceItem } from '@/types/screening-record';

interface ReferencesSectionProps {
  record: ScreeningRecord;
}

// Parse pipe-delimited reference format: "[id=R1 | title=... | used_for=... | type=... | url=...]"
function parsePipeDelimitedRefs(value: string | null | undefined): ReferenceItem[] {
  if (!value || typeof value !== 'string') return [];
  
  const trimmed = value.trim();
  
  // Check if it's the pipe-delimited format
  if (trimmed.startsWith('[') && trimmed.includes('id=') && trimmed.includes(' | ')) {
    // Split by ", id=" to separate multiple references
    const refStrings = trimmed.slice(1, -1).split(', id=').map((s, i) => i === 0 ? s : 'id=' + s);
    
    return refStrings.map(refStr => {
      const parts = refStr.split(' | ');
      const ref: ReferenceItem = {};
      
      for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx > 0) {
          const key = part.slice(0, eqIdx).trim();
          const val = part.slice(eqIdx + 1).trim();
          
          if (key === 'id') ref.id = val;
          else if (key === 'title') ref.source_name = val;
          else if (key === 'used_for') ref.what_it_supports = val;
          else if (key === 'type') ref.source_type = val;
          else if (key === 'url') ref.url = val;
        }
      }
      
      return ref;
    }).filter(r => r.id || r.source_name || r.url);
  }
  
  // Fall back to standard JSON parsing
  return safeParseJSON<ReferenceItem[]>(value, []);
}

// Get references with fallback chain: references_json → client_references_json → website_references_json → haram_references_json
function getReferencesWithFallback(record: ScreeningRecord): ReferenceItem[] {
  // Try references_json first (primary) - may be pipe-delimited
  const primaryRefs = parsePipeDelimitedRefs(record.references_json);
  if (primaryRefs.length > 0) return primaryRefs;

  // Try client_references_json
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

// Get evidence items with fallback
function getEvidenceItems(record: ScreeningRecord): EvidenceItem[] {
  // Try verdict_evidence_items_json first
  const verdictEvidence = safeParseJSON<EvidenceItem[]>(record.verdict_evidence_items_json, []);
  if (verdictEvidence.length > 0) return verdictEvidence;

  // Fallback to evidence_items_json
  const evidence = safeParseJSON<EvidenceItem[]>(record.evidence_items_json, []);
  return evidence;
}

export function ReferencesSection({ record }: ReferencesSectionProps) {
  const references = getReferencesWithFallback(record);
  const evidenceItems = getEvidenceItems(record);
  const websiteStory = record.website_story;
  const disclaimer = record.client_disclaimer_short;
  const haramRefs = safeParseJSON<ReferenceItem[]>(record.haram_references_json, []);

  // Check if we have haram references that are different from main references
  const hasHaramRefs = haramRefs.length > 0 && references !== haramRefs;

  const hasContent = references.length > 0 || evidenceItems.length > 0 || websiteStory;

  if (!hasContent) {
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
      {/* Evidence / Website Story Section */}
      {(websiteStory || evidenceItems.length > 0) && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Quote className="w-5 h-5 text-primary" />
              Transcript Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Website Story */}
            {websiteStory && (
              <div className="p-4 rounded-lg bg-muted/10 border border-border">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{websiteStory}</p>
              </div>
            )}

            {/* Evidence Items */}
            {evidenceItems.length > 0 && (
              <div className="space-y-2">
                {evidenceItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border/50 bg-muted/5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {item.category || item.source || 'Evidence'}
                      </span>
                      {item.ref && (
                        <span className="text-xs text-primary font-mono">{item.ref}</span>
                      )}
                    </div>
                    {item.rationale && (
                      <p className="text-sm text-foreground leading-relaxed">{item.rationale}</p>
                    )}
                    {item.snippet && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{item.snippet}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* References Section */}
      {references.length > 0 && (
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
                const sourceName = ref.source_name || ref.source || ref.id;
                const supports = ref.what_it_supports || ref.supports;
                const asOf = ref.as_of || ref.asOf;
                const url = ref.url;
                const refType = ref.source_type;

                // If no URL, just show as a non-clickable card
                if (!url) {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border bg-muted/10"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {refType && (
                            <span className="text-[10px] text-primary uppercase tracking-wide font-medium">{refType}</span>
                          )}
                          {sourceName && (
                            <p className="text-sm font-medium text-foreground leading-relaxed mt-0.5">
                              {sourceName}
                            </p>
                          )}
                        </div>
                        {ref.id && (
                          <span className="text-xs font-mono text-muted-foreground shrink-0">{ref.id}</span>
                        )}
                      </div>
                      {supports && (
                        <p className="text-xs text-muted-foreground mt-1">{supports}</p>
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
                        {refType && (
                          <span className="text-[10px] text-primary uppercase tracking-wide font-medium">{refType}</span>
                        )}
                        {sourceName && (
                          <p className="text-sm font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors mt-0.5">
                            {sourceName}
                          </p>
                        )}
                        {supports && (
                          <p className="text-xs text-muted-foreground mt-1">{supports}</p>
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
      )}

      {/* Haram References Sub-section */}
      {hasHaramRefs && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-non-compliant" />
              Haram References ({haramRefs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {haramRefs.map((ref, idx) => {
                const sourceName = ref.source_name || ref.source || ref.id;
                const url = ref.url;

                return (
                  <a
                    key={idx}
                    href={url || '#'}
                    target={url ? '_blank' : undefined}
                    rel={url ? 'noopener noreferrer' : undefined}
                    className={`group block p-3 rounded-lg border border-non-compliant/20 bg-non-compliant/5 ${url ? 'hover:bg-non-compliant/10 cursor-pointer' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {sourceName || `Reference ${idx + 1}`}
                      </p>
                      {url && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                    </div>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
