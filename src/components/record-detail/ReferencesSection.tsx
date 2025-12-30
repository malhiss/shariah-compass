// References Section - Collapsible with clickable cards
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, BookOpen, ChevronDown, Calendar } from 'lucide-react';
import { safeParseJSON, type ScreeningRecord } from '@/types/screening-record';

interface ReferencesSectionProps {
  record: ScreeningRecord;
}

// Reference item structure
interface ReferenceItem {
  source_name?: string;
  name?: string;
  what_it_supports?: string;
  supports?: string;
  as_of?: string;
  as_of_date?: string;
  url?: string;
}

export function ReferencesSection({ record }: ReferencesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse references from client_references_json ONLY
  const references = safeParseJSON<ReferenceItem[]>(record.client_references_json, []);

  // Hide section if no references
  if (references.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="premium-card">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/10 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                References ({references.length})
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {references.map((ref, idx) => {
                const supports = ref.what_it_supports || ref.supports;
                const asOf = ref.as_of || ref.as_of_date;
                const url = ref.url;

                // If no URL, just show as a non-clickable card
                if (!url) {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border bg-muted/10"
                    >
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
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
