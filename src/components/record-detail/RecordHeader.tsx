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
  const securityType = record.client_identity_security_type || record.security_type || record.Security_Type;
  const industry = record.client_identity_industry || record.industry || record.Industry;

  return (
    <header className="space-y-6">
      {/* Back navigation */}
      <Link to="/shariah-dashboard" className="inline-block">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Button>
      </Link>

      {/* Main header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Company identity */}
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shrink-0">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-serif font-semibold tracking-tight">
                {companyName !== 'N/A' ? companyName : ticker}
              </h1>
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-mono text-sm px-3">
                {ticker}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {reportDate && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formatDate(reportDate)}
                </span>
              )}
              {securityType && (
                <Badge variant="secondary" className="bg-muted/40 text-muted-foreground">
                  {securityType}
                </Badge>
              )}
              {industry && (
                <Badge variant="secondary" className="bg-muted/40 text-muted-foreground gap-1">
                  <Factory className="w-3 h-3" />
                  {industry}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {memoUrl && (
          <a href={memoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Button className="btn-invesense gap-2">
              <ExternalLink className="w-4 h-4" />
              Open Memo Doc
            </Button>
          </a>
        )}
      </div>
    </header>
  );
}
