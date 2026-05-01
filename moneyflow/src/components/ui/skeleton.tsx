// src/components/ui/skeleton.tsx
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  shimmer?: boolean;
}

function Skeleton({
  className,
  variant = 'default',
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted',
        shimmer
          ? 'animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted-foreground/10 to-muted'
          : 'animate-pulse',
        {
          'rounded-full': variant === 'circular',
          'rounded-none': variant === 'rectangular',
          'h-4 w-full': variant === 'text',
        },
        className
      )}
      aria-busy="true"
      aria-label="Loading..."
      {...props}
    />
  );
}

export { Skeleton };
