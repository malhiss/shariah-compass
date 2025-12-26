import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { normalizeEvidence, type ScreeningRecord, type EvidenceItem } from '@/types/screening-record';
import { FileSearch, AlertTriangle, AlertCircle, Search, Filter } from 'lucide-react';

interface EvidenceTabProps {
  record: ScreeningRecord;
}

function getSeverityColor(severity: string | undefined): string {
  const upper = severity?.toUpperCase() || '';
  if (upper.includes('FAIL') || upper === 'HIGH' || upper === 'CRITICAL') {
    return 'non-compliant';
  }
  if (upper.includes('CAUTION') || upper === 'MEDIUM' || upper === 'WARNING') {
    return 'warning';
  }
  return 'compliant';
}

export function EvidenceTab({ record }: EvidenceTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Normalize evidence from either format
  const allEvidence = useMemo(() => normalizeEvidence(record), [record]);

  // Get distinct categories and severities
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allEvidence.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats).sort();
  }, [allEvidence]);

  const severities = useMemo(() => {
    const sevs = new Set<string>();
    allEvidence.forEach((e) => {
      if (e.severity) sevs.add(e.severity);
    });
    return Array.from(sevs).sort();
  }, [allEvidence]);

  // Filter evidence
  const filteredEvidence = useMemo(() => {
    return allEvidence.filter((item) => {
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      // Severity filter
      if (severityFilter !== 'all' && item.severity !== severityFilter) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSnippet = item.snippet?.toLowerCase().includes(search);
        const matchesRationale = item.rationale?.toLowerCase().includes(search);
        const matchesCategory = item.category?.toLowerCase().includes(search);
        const matchesSource = item.source?.toLowerCase().includes(search);
        if (!matchesSnippet && !matchesRationale && !matchesCategory && !matchesSource) {
          return false;
        }
      }
      return true;
    });
  }, [allEvidence, categoryFilter, severityFilter, searchTerm]);

  const hasFailFlag = record.llm_has_fail_flag;
  const hasCautionFlag = record.llm_has_caution_flag;

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-primary" />
          Evidence & Rationale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning banners */}
        {hasFailFlag && (
          <Alert className="bg-non-compliant/10 border-non-compliant/30">
            <AlertTriangle className="h-4 w-4 text-non-compliant" />
            <AlertTitle className="text-non-compliant">Fail Flag Detected</AlertTitle>
            <AlertDescription className="text-non-compliant/80">
              The LLM analysis identified critical compliance issues that triggered a fail flag.
            </AlertDescription>
          </Alert>
        )}

        {hasCautionFlag && !hasFailFlag && (
          <Alert className="bg-warning/10 border-warning/30">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Caution Flag</AlertTitle>
            <AlertDescription className="text-warning/80">
              The LLM analysis identified potential concerns that require attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/20 border-border"
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] bg-muted/20 border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px] bg-muted/20 border-border">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {severities.map((sev) => (
                  <SelectItem key={sev} value={sev}>
                    {sev}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvidence.length} of {allEvidence.length} evidence items
        </p>

        {/* Evidence list */}
        {filteredEvidence.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {allEvidence.length === 0
                ? 'No evidence available for this record.'
                : 'No evidence matches your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvidence.map((item: EvidenceItem, index: number) => {
              const colorClass = getSeverityColor(item.severity);

              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border bg-muted/10 space-y-3"
                >
                  {/* Header badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.category && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {item.category}
                      </Badge>
                    )}
                    {item.severity && (
                      <Badge
                        className={`
                          ${colorClass === 'non-compliant' && 'bg-non-compliant/15 text-non-compliant border-non-compliant/30'}
                          ${colorClass === 'warning' && 'bg-warning/15 text-warning border-warning/30'}
                          ${colorClass === 'compliant' && 'bg-compliant/15 text-compliant border-compliant/30'}
                        `}
                      >
                        {item.severity}
                      </Badge>
                    )}
                    {item.source && (
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {item.source}
                      </Badge>
                    )}
                  </div>

                  {/* Snippet */}
                  {item.snippet && (
                    <div className="p-3 rounded bg-muted/20 border border-border">
                      <p className="text-sm italic text-muted-foreground">"{item.snippet}"</p>
                    </div>
                  )}

                  {/* Rationale */}
                  {item.rationale && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rationale</p>
                      <p className="text-sm">{item.rationale}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
