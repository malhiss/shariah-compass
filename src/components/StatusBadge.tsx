import { cn } from '@/lib/utils';
import type { StatusColor } from '@/types/screening';

interface StatusBadgeProps {
  status: StatusColor;
  label: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusStyles: Record<StatusColor, string> = {
  compliant: 'bg-compliant text-compliant-foreground',
  purification: 'bg-compliant-purification text-compliant-purification-foreground',
  fail: 'bg-non-compliant text-non-compliant-foreground',
  noData: 'bg-no-data text-no-data-foreground',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function StatusBadge({ status, label, className, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all',
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      {label}
    </span>
  );
}
