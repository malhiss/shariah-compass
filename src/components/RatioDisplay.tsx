import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface RatioDisplayProps {
  label: string;
  value: number | null; // Value as decimal (e.g., 0.0369 = 3.69%)
  threshold: number; // Threshold as decimal (e.g., 0.33 = 33%)
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
  
  // Display values as percentages (multiply by 100)
  const displayValue = hasValue ? (value * 100).toFixed(2) : null;
  const displayThreshold = (threshold * 100).toFixed(0);

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
          {displayValue !== null ? `${displayValue}${unit}` : 'N/A'}
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
          title={`Threshold: ${displayThreshold}${unit}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Threshold: {displayThreshold}{unit}
      </p>
    </div>
  );
}
