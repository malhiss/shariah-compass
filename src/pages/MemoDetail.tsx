import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Printer, Calendar, User, FileText } from "lucide-react";
import { getMemoById } from "@/lib/memo-data";
import { MemoRenderer } from "@/components/memo/MemoRenderer";
import { MemoKeyFields, extractKeyFields } from "@/components/memo/MemoKeyFields";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export default function MemoDetail() {
  const { id } = useParams<{ id: string }>();
  const memo = id ? getMemoById(id) : undefined;

  if (!memo) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Memo not found.
            </p>
            <Link to="/memos">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Memos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { fields, remainingContent } = extractKeyFields(memo.memoMarkdown);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(memo.memoMarkdown);
      toast.success("Markdown copied to clipboard");
    } catch {
      toast.error("Failed to copy markdown");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Navigation - hidden in print */}
      <div className="mb-6 print:hidden">
        <Link to="/memos">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Memos
          </Button>
        </Link>
      </div>

      {/* Memo Card */}
      <Card className="border-border/50 print:border-0 print:shadow-none">
        <CardHeader className="pb-4 print:pb-6">
          {/* Title and Meta */}
          <div className="space-y-4">
            {memo.title && (
              <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground leading-tight">
                {memo.title}
              </h1>
            )}
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {memo.date && (
                <Badge variant="outline" className="font-normal">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {format(parseISO(memo.date), "MMMM d, yyyy")}
                </Badge>
              )}
              {memo.author && (
                <Badge variant="outline" className="font-normal">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  {memo.author}
                </Badge>
              )}
            </div>

            {/* Action Buttons - hidden in print */}
            <div className="flex gap-2 pt-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Markdown
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Key Fields (extracted from top of markdown) */}
          <MemoKeyFields fields={fields} />

          {/* Memo Content */}
          <MemoRenderer content={remainingContent} />
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-0 {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:pb-6 {
            padding-bottom: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
