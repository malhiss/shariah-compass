import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User } from "lucide-react";
import { getAllMemos } from "@/lib/memo-data";
import { format, parseISO } from "date-fns";

export default function Memos() {
  const memos = getAllMemos();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
          Shariah Memos
        </h1>
        <p className="text-muted-foreground">
          Browse compliance memos and screening documents
        </p>
      </div>

      {/* Memo List */}
      {memos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              No memos available yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {memos.map((memo) => (
            <Link key={memo.id} to={`/memos/${memo.id}`}>
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer border-border/50 hover:border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium text-foreground leading-tight">
                          {memo.title || "Untitled Memo"}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          {memo.date && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(parseISO(memo.date), "MMM d, yyyy")}
                            </span>
                          )}
                          {memo.author && (
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {memo.author}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      View
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
