import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMemoUrl, type ScreeningRecord } from '@/types/screening-record';
import { FileText, ExternalLink, AlertCircle } from 'lucide-react';

interface MemoSectionProps {
  record: ScreeningRecord;
}

export function MemoSection({ record }: MemoSectionProps) {
  const memoUrl = getMemoUrl(record);
  const memoContent = record.shariah_memo;

  const hasMemo = memoUrl || memoContent;

  if (!hasMemo) {
    return (
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Shariah Memo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No memo document available for this record.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Shariah Memo
          </CardTitle>

          {memoUrl && (
            <a href={memoUrl} target="_blank" rel="noopener noreferrer">
              <Button className="btn-invesense">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Google Doc
              </Button>
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {memoContent ? (
          <div className="prose prose-invert prose-sm max-w-none">
            {/* Simple markdown-like rendering */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {memoContent.split('\n').map((line, idx) => {
                // Handle headers
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-lg font-semibold mt-4 mb-2">
                      {line.replace('### ', '')}
                    </h3>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-xl font-semibold mt-6 mb-3">
                      {line.replace('## ', '')}
                    </h2>
                  );
                }
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={idx} className="text-2xl font-bold mt-6 mb-4">
                      {line.replace('# ', '')}
                    </h1>
                  );
                }
                // Handle bullet points
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                  return (
                    <li key={idx} className="ml-4 mb-1">
                      {line.trim().substring(2)}
                    </li>
                  );
                }
                // Handle bold text
                const boldPattern = /\*\*(.*?)\*\*/g;
                if (boldPattern.test(line)) {
                  const parts = line.split(/(\*\*.*?\*\*)/);
                  return (
                    <p key={idx} className="mb-2">
                      {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return (
                            <strong key={pIdx}>
                              {part.slice(2, -2)}
                            </strong>
                          );
                        }
                        return part;
                      })}
                    </p>
                  );
                }
                // Empty lines
                if (line.trim() === '') {
                  return <br key={idx} />;
                }
                // Regular paragraphs
                return (
                  <p key={idx} className="mb-2">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No inline memo content available. Please use the button above to view the full document.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
