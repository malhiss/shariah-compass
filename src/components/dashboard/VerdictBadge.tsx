import { cn } from '@/lib/utils';
import { getVerdictColor, getZakatStatusColor, getRiskLevelColor } from '@/types/mongodb';

interface VerdictBadgeProps {
  verdict: string | null | undefined;
  className?: string;
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const colorClass = getVerdictColor(verdict || null);
  
  const displayText = verdict
    ? verdict.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'N/A';

  // Map color class to explicit tailwind classes to avoid purge issues
  const getColorStyles = () => {
    switch (colorClass) {
      case 'compliant':
        return 'bg-[hsl(158_65%_42%/0.15)] text-[hsl(158_65%_52%)]';
      case 'warning':
        return 'bg-[hsl(38_95%_55%/0.15)] text-[hsl(38_95%_55%)]';
      case 'non-compliant':
        return 'bg-[hsl(0_55%_50%/0.15)] text-[hsl(0_65%_60%)]';
      case 'doubtful':
        return 'bg-[hsl(215_25%_50%/0.15)] text-[hsl(215_25%_60%)]';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        getColorStyles(),
        className
      )}
    >
      {displayText}
    </span>
  );
}

interface ZakatBadgeProps {
  status: string | null | undefined;
  className?: string;
}

export function ZakatBadge({ status, className }: ZakatBadgeProps) {
  const colorClass = getZakatStatusColor(status);
  const displayText = status || 'N/A';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        colorClass === 'compliant' && 'bg-compliant/10 text-compliant',
        colorClass === 'warning' && 'bg-warning/10 text-warning',
        colorClass === 'non-compliant' && 'bg-non-compliant/10 text-non-compliant',
        colorClass === 'no-data' && 'bg-muted/20 text-muted-foreground',
        className
      )}
    >
      {displayText}
    </span>
  );
}

interface RiskBadgeProps {
  level: string | null | undefined;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const colorClass = getRiskLevelColor(level || null);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        colorClass === 'compliant' && 'bg-compliant/10 text-compliant',
        colorClass === 'warning' && 'bg-warning/10 text-warning',
        colorClass === 'non-compliant' && 'bg-non-compliant/10 text-non-compliant',
        colorClass === 'no-data' && 'bg-muted/20 text-muted-foreground',
        className
      )}
    >
      {level || 'N/A'}
    </span>
  );
}

interface BooleanBadgeProps {
  value: boolean | 'YES' | 'NO' | string | null | undefined;
  trueLabel?: string;
  falseLabel?: string;
  className?: string;
}

export function BooleanBadge({ 
  value, 
  trueLabel = 'Yes', 
  falseLabel = 'No',
  className 
}: BooleanBadgeProps) {
  const isTrue = value === true || value === 'YES' || value === 'yes';
  const isFalse = value === false || value === 'NO' || value === 'no';

  if (!isTrue && !isFalse) {
    return (
      <span className={cn('text-muted-foreground text-xs', className)}>
        N/A
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        isTrue ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted-foreground',
        className
      )}
    >
      {isTrue ? trueLabel : falseLabel}
    </span>
  );
}