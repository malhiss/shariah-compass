import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import type { StatusColor } from '@/types/screening';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface MethodologyCardProps {
  title: string;
  description: string;
  status: StatusColor;
  statusLabel: string;
  available: boolean;
  children: React.ReactNode;
  className?: string;
}

const borderStyles: Record<StatusColor, string> = {
  compliant: 'border-compliant',
  purification: 'border-compliant-purification',
  fail: 'border-non-compliant',
  noData: 'border-no-data',
};

const bgStyles: Record<StatusColor, string> = {
  compliant: 'bg-compliant/5',
  purification: 'bg-compliant-purification/5',
  fail: 'bg-non-compliant/5',
  noData: 'bg-no-data/5',
};

const iconMap: Record<StatusColor, React.ReactNode> = {
  compliant: <CheckCircle className="w-5 h-5 text-compliant" />,
  purification: <AlertCircle className="w-5 h-5 text-compliant-purification" />,
  fail: <XCircle className="w-5 h-5 text-non-compliant" />,
  noData: <HelpCircle className="w-5 h-5 text-no-data" />,
};

export function MethodologyCard({
  title,
  description,
  status,
  statusLabel,
  available,
  children,
  className,
}: MethodologyCardProps) {
  return (
    <Card
      className={cn(
        'border-2 transition-all duration-300 hover:shadow-lg',
        borderStyles[status],
        bgStyles[status],
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {iconMap[status]}
            <div>
              <CardTitle className="text-lg font-serif">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <StatusBadge status={status} label={statusLabel} />
        </div>
      </CardHeader>
      <CardContent>
        {available ? (
          children
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No screening data available</p>
            <p className="text-sm mt-1">This ticker has not been screened for this methodology yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
