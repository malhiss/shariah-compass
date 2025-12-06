import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface RatioDisplayProps {
  label: string;
  value: number | null;
  threshold: number;
  unit?: string;
  className?: string;
}

export function RatioDisplay({
  label,
  value,
  threshold,
  unit = '%',
  className,
}: RatioDisplayProps) {
  const hasValue = value !== null && value !== undefined;
  const isOverThreshold = hasValue && value > threshold;
  const percentage = hasValue ? Math.min((value / threshold) * 100, 150) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            'font-semibold',
            hasValue
              ? isOverThreshold
                ? 'text-non-compliant'
                : 'text-compliant'
              : 'text-muted-foreground'
          )}
        >
          {hasValue ? `${value.toFixed(2)}${unit}` : 'N/A'}
        </span>
      </div>
      <div className="relative">
        <Progress
          value={percentage}
          className={cn(
            'h-2',
            isOverThreshold ? '[&>div]:bg-non-compliant' : '[&>div]:bg-compliant'
          )}
        />
        <div
          className="absolute top-0 w-0.5 h-full bg-muted-foreground/50"
          style={{ left: `${(threshold / threshold) * 66.67}%` }}
          title={`Threshold: ${threshold}${unit}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Threshold: {threshold}{unit}
      </p>
    </div>
  );
}
