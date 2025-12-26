import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { VerdictBadge, ZakatBadge, RiskBadge, BooleanBadge } from './VerdictBadge';
import { formatPercent, formatDate } from '@/types/mongodb';
import type { ClientFacingRecord, ViewMode } from '@/types/mongodb';

interface ScreeningTableProps {
  data: ClientFacingRecord[];
  loading: boolean;
  viewMode: ViewMode;
}

export function ScreeningTable({
  data,
  loading,
  viewMode,
}: ScreeningTableProps) {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No records found. Try adjusting your filters.
      </div>
    );
  }

  if (viewMode === 'zakat') {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Ticker</TableHead>
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Sector</TableHead>
              <TableHead className="text-center text-muted-foreground">Shariah</TableHead>
              <TableHead className="text-center text-muted-foreground">Zakat Status</TableHead>
              <TableHead className="text-right text-muted-foreground">Zakatable %</TableHead>
              <TableHead className="text-right text-muted-foreground">Zakat/Share</TableHead>
              <TableHead className="text-right text-muted-foreground">Zakat/100</TableHead>
              <TableHead className="text-muted-foreground">Methodology</TableHead>
              <TableHead className="text-center text-muted-foreground">Risk</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record) => (
              <TableRow
                key={record.upsert_key}
                className="cursor-pointer border-border hover:bg-primary/5"
                onClick={() => navigate(`/record/${encodeURIComponent(record.upsert_key)}`)}
              >
                <TableCell className="font-medium text-foreground">
                  {record.Ticker}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {record.Company || 'N/A'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {record.Sector || 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  <BooleanBadge value={record.Shariah_Compliant} />
                </TableCell>
                <TableCell className="text-center">
                  <ZakatBadge status={record.Zakat_Status} />
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatPercent(record.Zakatable_Assets_Ratio_Percent)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {record.Zakat_Per_Share_USD?.toFixed(2) || 'N/A'}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {record.Zakat_Per_100_Units_USD?.toFixed(2) || 'N/A'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {record.Zakat_Methodology || 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  <RiskBadge level={record.Compliance_Risk_Level} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(record.Screening_Date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Shariah view (default)
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Ticker</TableHead>
            <TableHead className="text-muted-foreground">Company</TableHead>
            <TableHead className="text-muted-foreground">Sector</TableHead>
            <TableHead className="text-muted-foreground">Industry</TableHead>
            <TableHead className="text-center text-muted-foreground">Verdict</TableHead>
            <TableHead className="text-center text-muted-foreground">Shariah</TableHead>
            <TableHead className="text-right text-muted-foreground">NPIN %</TableHead>
            <TableHead className="text-right text-muted-foreground">Purification</TableHead>
            <TableHead className="text-center text-muted-foreground">Risk</TableHead>
            <TableHead className="text-center text-muted-foreground">Dual-Use</TableHead>
            <TableHead className="text-center text-muted-foreground">Board</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <TableRow
              key={record.upsert_key}
              className="cursor-pointer border-border hover:bg-primary/5"
              onClick={() => navigate(`/record/${encodeURIComponent(record.upsert_key)}`)}
            >
              <TableCell className="font-medium text-foreground">
                {record.Ticker}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate">
                {record.Company || 'N/A'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {record.Sector || 'N/A'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {record.Industry || 'N/A'}
              </TableCell>
              <TableCell className="text-center">
                <VerdictBadge verdict={record.Final_Verdict} />
              </TableCell>
              <TableCell className="text-center">
                <BooleanBadge value={record.Shariah_Compliant} />
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatPercent(record.Non_Compliant_Revenue_Point_Estimate)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatPercent(record.Purification_Percentage)}
              </TableCell>
              <TableCell className="text-center">
                <RiskBadge level={record.Compliance_Risk_Level} />
              </TableCell>
              <TableCell className="text-center">
                <BooleanBadge value={record.Dual_Use_Product} />
              </TableCell>
              <TableCell className="text-center">
                <BooleanBadge value={record.Board_Review_Needed} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(record.Screening_Date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}