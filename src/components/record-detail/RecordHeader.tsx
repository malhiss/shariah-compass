import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/types/mongodb';
import { getMemoUrl } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { ArrowLeft, ExternalLink, Calendar, Building2 } from 'lucide-react';

interface RecordHeaderProps {
  record: ScreeningRecord;
}

export function RecordHeader({ record }: RecordHeaderProps) {
  const memoUrl = getMemoUrl(record);

  return (
    <div className="space-y-4">
      {/* Back navigation */}
      <Link to="/shariah-dashboard">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground p-0 h-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Main header row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Company info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-serif font-semibold">
                {record.Company || record.Ticker}
              </h1>
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-mono">
                {record.Ticker}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(record.Report_Date)}
              </span>
              <Badge variant="secondary" className="bg-muted/30 text-xs">
                Methodology v3
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Memo button */}
        {memoUrl && (
          <a href={memoUrl} target="_blank" rel="noopener noreferrer">
            <Button className="btn-invesense">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Memo Doc
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
