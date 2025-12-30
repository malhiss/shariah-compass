// References Section - Uses client_references_json only
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, BookOpen } from 'lucide-react';
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
  // Parse references from client_references_json ONLY
  const references = safeParseJSON<ReferenceItem[]>(record.client_references_json, []);

  // Hide section if no references
  if (references.length === 0) {
    return null;
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5 text-primary" />
          References
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Source</TableHead>
                <TableHead>What It Supports</TableHead>
                <TableHead className="w-[120px]">As Of</TableHead>
                <TableHead className="w-[80px] text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {references.map((ref, idx) => {
                const sourceName = ref.source_name || ref.name || 'Unknown Source';
                const supports = ref.what_it_supports || ref.supports || '-';
                const asOf = ref.as_of || ref.as_of_date || '-';
                const url = ref.url;

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">
                      {sourceName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {supports}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {asOf}
                    </TableCell>
                    <TableCell className="text-right">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
