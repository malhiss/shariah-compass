// Structured Memo Section - Parses markdown into cards/sections
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { getMemoUrl, type ScreeningRecord } from '@/types/screening-record';
import { FileText, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StructuredMemoSectionProps {
  record: ScreeningRecord;
}

// Parse markdown content into structured sections
interface MemoSection {
  title: string;
  level: number; // 1, 2, or 3 for h1, h2, h3
  content: MemoBlock[];
}

interface MemoBlock {
  type: 'paragraph' | 'bullet' | 'numbered' | 'link';
  content: string;
  href?: string;
}

function parseMemoMarkdown(markdown: string): MemoSection[] {
  const lines = markdown.split('\n');
  const sections: MemoSection[] = [];
  let currentSection: MemoSection | null = null;
  let numberedListCounter = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      numberedListCounter = 0;
      continue;
    }

    // Check for headers
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    const h3Match = trimmed.match(/^###\s+(.+)$/);

    if (h1Match || h2Match || h3Match) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      
      const title = h1Match?.[1] || h2Match?.[1] || h3Match?.[1] || '';
      const level = h1Match ? 1 : h2Match ? 2 : 3;
      
      currentSection = { title, level, content: [] };
      numberedListCounter = 0;
      continue;
    }

    // If no section yet, create a default one
    if (!currentSection) {
      currentSection = { title: 'Overview', level: 1, content: [] };
    }

    // Check for bullet points
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      currentSection.content.push({ type: 'bullet', content: bulletMatch[1] });
      numberedListCounter = 0;
      continue;
    }

    // Check for numbered lists
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      numberedListCounter++;
      currentSection.content.push({ type: 'numbered', content: numberedMatch[1] });
      continue;
    }

    // Parse links in the line
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let hasLinks = false;
    let lastIndex = 0;
    let match;
    let contentWithLinks = '';

    while ((match = linkPattern.exec(trimmed)) !== null) {
      hasLinks = true;
      contentWithLinks += trimmed.slice(lastIndex, match.index);
      // Store link separately
      currentSection.content.push({
        type: 'link',
        content: match[1],
        href: match[2],
      });
      lastIndex = match.index + match[0].length;
    }

    if (!hasLinks) {
      // Regular paragraph
      currentSection.content.push({ type: 'paragraph', content: trimmed });
    } else if (lastIndex < trimmed.length) {
      // Remaining text after links
      const remaining = trimmed.slice(lastIndex).trim();
      if (remaining) {
        currentSection.content.push({ type: 'paragraph', content: remaining });
      }
    }

    numberedListCounter = 0;
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

// Render text with inline bold/italic handling
function renderFormattedText(text: string): React.ReactNode {
  // Replace **bold** with actual bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function StructuredMemoSection({ record }: StructuredMemoSectionProps) {
  const [copied, setCopied] = useState(false);
  
  const memoUrl = getMemoUrl(record);
  const memoContent = record.shariah_memo_markdown || record.shariah_memo;

  // No memo available
  if (!memoContent && !memoUrl) {
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
              No memo available for this record.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Parse memo into sections
  const sections = memoContent ? parseMemoMarkdown(memoContent) : [];

  const handleCopy = async () => {
    if (!memoContent) return;
    
    try {
      await navigator.clipboard.writeText(memoContent);
      setCopied(true);
      toast.success('Memo copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy memo');
    }
  };

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Shariah Memo
          </CardTitle>

          <div className="flex items-center gap-2">
            {memoContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-border"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}

            {memoUrl && (
              <a href={memoUrl} target="_blank" rel="noopener noreferrer">
                <Button className="btn-invesense" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Full Memo Doc
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {sections.length > 0 ? (
          <Accordion type="multiple" defaultValue={sections.map((_, i) => `section-${i}`)}>
            {sections.map((section, idx) => (
              <AccordionItem 
                key={idx} 
                value={`section-${idx}`}
                className="border border-border rounded-lg mb-2 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/10">
                  <span className={`font-medium ${section.level === 1 ? 'text-lg' : section.level === 2 ? 'text-base' : 'text-sm'}`}>
                    {section.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2 pt-2">
                    {section.content.map((block, blockIdx) => {
                      if (block.type === 'bullet') {
                        return (
                          <div key={blockIdx} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="text-sm text-foreground/90 leading-relaxed">
                              {renderFormattedText(block.content)}
                            </span>
                          </div>
                        );
                      }

                      if (block.type === 'numbered') {
                        return (
                          <div key={blockIdx} className="flex items-start gap-3 p-2 rounded-lg bg-muted/10">
                            <span className="text-primary font-medium text-sm shrink-0">
                              {blockIdx + 1}.
                            </span>
                            <span className="text-sm text-foreground/90 leading-relaxed">
                              {renderFormattedText(block.content)}
                            </span>
                          </div>
                        );
                      }

                      if (block.type === 'link' && block.href) {
                        return (
                          <a
                            key={blockIdx}
                            href={block.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {block.content}
                          </a>
                        );
                      }

                      // Paragraph
                      return (
                        <p key={blockIdx} className="text-sm text-foreground/90 leading-relaxed">
                          {renderFormattedText(block.content)}
                        </p>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : memoUrl ? (
          <p className="text-muted-foreground text-sm">
            No inline memo content available. Please use the button above to view the full document.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
