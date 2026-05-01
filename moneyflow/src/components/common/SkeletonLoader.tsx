// src/components/common/SkeletonLoader.tsx
/**
 * Enhanced Skeleton Loader - Phase 5: UI/UX Polish
 * Shimmer effect skeleton for loading states
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function SkeletonLoader({
  className,
  variant = 'default',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-muted rounded';

  const variantStyles = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-lg',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(baseStyles, variantStyles[variant], className)}
            style={style}
          />
        ))}
      </div>
    );
  }

  return <div className={cn(baseStyles, variantStyles[variant], className)} style={style} />;
}

// Preset skeleton components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 rounded-lg border p-4', className)}>
      <SkeletonLoader variant="text" width="60%" />
      <SkeletonLoader variant="text" width="100%" />
      <SkeletonLoader variant="text" width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 rounded-t-lg bg-muted/50 p-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLoader key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 border-b p-3">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <SkeletonLoader key={colIndex} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <SkeletonLoader variant="circular" width={size} height={size} />;
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border p-4">
          <SkeletonLoader variant="text" width="40%" height={16} />
          <SkeletonLoader variant="text" width="60%" height={32} />
          <SkeletonLoader variant="text" width="30%" height={14} />
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
