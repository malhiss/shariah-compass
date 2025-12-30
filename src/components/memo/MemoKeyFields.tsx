import { MemoKeyField } from "@/types/memo";
import { Badge } from "@/components/ui/badge";

interface MemoKeyFieldsProps {
  fields: MemoKeyField[];
}

export function MemoKeyFields({ fields }: MemoKeyFieldsProps) {
  if (fields.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-border">
      {fields.map((field, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {field.key}
          </span>
          <Badge variant="secondary" className="font-mono text-sm">
            {field.value}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export function extractKeyFields(markdown: string): { fields: MemoKeyField[]; remainingContent: string } {
  const lines = markdown.split('\n');
  const fields: MemoKeyField[] = [];
  let contentStartIndex = 0;

  // Known key patterns to detect
  const keyPatterns = [
    'ticker', 'verdict', 'date', 'screening date', 'analyst', 
    'author', 'status', 'rating', 'period', 'reviewed by'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop if we hit a blank line, heading, or horizontal rule
    if (line === '' || line.startsWith('#') || line.startsWith('---')) {
      contentStartIndex = i;
      break;
    }

    // Check for key: value pattern
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0 && colonIndex < 30) {
      const key = line.substring(0, colonIndex).trim().toLowerCase();
      const value = line.substring(colonIndex + 1).trim();
      
      // Only extract if it matches known patterns or looks like a short key-value
      if (keyPatterns.some(p => key.includes(p)) || (key.length < 20 && value.length < 50)) {
        fields.push({
          key: line.substring(0, colonIndex).trim(),
          value: value
        });
        contentStartIndex = i + 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Find the actual content start (skip empty lines after key fields)
  while (contentStartIndex < lines.length && lines[contentStartIndex].trim() === '') {
    contentStartIndex++;
  }

  const remainingContent = lines.slice(contentStartIndex).join('\n');
  
  return { fields, remainingContent };
}
