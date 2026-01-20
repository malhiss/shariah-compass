import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/types/mongodb';
import { getMemoUrl } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { ArrowLeft, ExternalLink, Calendar, Building2, Factory } from 'lucide-react';

interface RecordHeaderProps {
  record: ScreeningRecord;
}

export function RecordHeader({ record }: RecordHeaderProps) {
  const memoUrl = getMemoUrl(record);
  
  // Use client_identity_* fields as canonical source
  const ticker = record.client_identity_ticker || record.ticker || record.Ticker || 'N/A';
  const companyName = record.client_identity_company_name || record.company_name || record.Company || 'N/A';
  const reportDate = record.client_identity_report_date || record.report_date || record.Report_Date;
  const screeningDate = record.screening_date || (record.screening_run_at ? record.screening_run_at.slice(0, 10) : null);
  const methodologyName = record.methodology_name || 'Invesense Methodology';
  const securityType = record.client_identity_security_type || record.security_type || record.Security_Type;
  const industry = record.client_identity_industry || record.industry || record.Industry;
  const sector = record.sector || record.Sector;
  const exchange = record.exchange;
  const country = record.country;

  return (
    <header className="space-y-4 sm:space-y-6">
      {/* Back navigation */}
      <Link to="/shariah-dashboard" className="inline-block">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </Link>

      {/* Main header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
        {/* Company identity */}
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shrink-0">
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-serif font-semibold tracking-tight break-words">
                {companyName !== 'N/A' ? companyName : ticker}
              </h1>
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-mono text-xs sm:text-sm px-2 sm:px-3">
                {ticker}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {screeningDate && (
                <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {screeningDate}
                </span>
              )}
              {!screeningDate && reportDate && (
                <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {formatDate(reportDate)}
                </span>
              )}
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                {methodologyName}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        {memoUrl && (
          <a href={memoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 w-full sm:w-auto">
            <Button className="btn-invesense gap-2 w-full sm:w-auto text-sm">
              <ExternalLink className="w-4 h-4" />
              Open Memo Doc
            </Button>
          </a>
        )}
      </div>
    </header>
  );
}
