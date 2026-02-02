import { Card, CardContent } from '@/components/ui/card';
import { type ScreeningRecord } from '@/types/screening-record';
import { ListChecks } from 'lucide-react';

interface FindingsTabProps {
  record: ScreeningRecord;
}

export function FindingsTab({ record }: FindingsTabProps) {
  // Parse findings_bullets - can be semicolon-separated string or already an array
  const findingsRaw = record.findings_bullets;
  
  let findings: string[] = [];
  
  if (typeof findingsRaw === 'string' && findingsRaw.trim()) {
    // Split by semicolons or newlines, clean up bullet prefixes
    findings = findingsRaw
      .split(/[;\n]/)
      .map(item => item.trim().replace(/^[•\-\*]\s*/, ''))
      .filter(item => item.length > 0);
  } else if (Array.isArray(findingsRaw)) {
    findings = findingsRaw.filter(item => typeof item === 'string' && item.trim().length > 0);
  }

  if (findings.length === 0) {
    return (
      <Card className="premium-card">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">No findings available for this record.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-card">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold">Key Findings</span>
        </div>
        <ul className="space-y-3">
          {findings.map((finding, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span className="text-foreground leading-relaxed text-sm">{finding}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
