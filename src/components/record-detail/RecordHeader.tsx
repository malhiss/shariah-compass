import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/types/mongodb';
import { getMemoUrl } from '@/types/screening-record';
import type { ScreeningRecord } from '@/types/screening-record';
import { ArrowLeft, ExternalLink, Calendar, Building2, Factory } from 'lucide-react';

interface RecordHeaderProps {
  record: ScreeningRecord;
  universe?: string;
  page?: number;
}

export function RecordHeader({ record, universe = 'global', page = 1 }: RecordHeaderProps) {
  const memoUrl = getMemoUrl(record);
  const dashboardUrl = `/dashboard?universe=${universe}&page=${page}`;
  
  // Use client_identity_* fields as canonical source
  const ticker = record.client_identity_ticker || record.ticker || record.Ticker || 'N/A';
  const companyName = record.client_identity_company_name || record.company_name || record.Company || 'N/A';
  const reportDate = record.client_identity_report_date || record.report_date || record.Report_Date;
  const screeningDate = record.screening_date || (record.screening_run_at ? record.screening_run_at.slice(0, 10) : null);
  const methodologyName = record.methodology_name || 'Dalil Methodology';
  const securityType = record.client_identity_security_type || record.security_type || record.Security_Type;
  const industry = record.client_identity_industry || record.industry || record.Industry;
  const sector = record.sector || record.Sector;
  const exchange = record.exchange;
  const country = record.country;

  return (
    <header className="space-y-4 sm:space-y-6">
      {/* Back navigation */}
      <Link to={dashboardUrl} className="inline-block">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </Link>

      {/* Main header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
        {/* Company identity */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {ticker}
          </h1>
          <p className="text-sm text-muted-foreground">
            {companyName !== 'N/A' ? companyName : ''}
          </p>
        </div>

        {/* Actions */}
        {memoUrl && (
          <a href={memoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 w-full sm:w-auto">
            <Button className="btn-dalil gap-2 w-full sm:w-auto text-sm">
              <ExternalLink className="w-4 h-4" />
              Open Memo Doc
            </Button>
          </a>
        )}
      </div>
    </header>
  );
}
