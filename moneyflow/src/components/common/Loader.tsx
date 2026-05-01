// src/components/common/Loader.tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  /**
   * Size of the loader
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Loading message
   */
  message?: string;
  /**
   * Full screen loader
   */
  fullScreen?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Show spinner only (no message)
   */
  spinnerOnly?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

/**
 * Production-ready loading component
 * Provides consistent loading states across the application
 */
export function Loader({
  size = 'md',
  message,
  fullScreen = false,
  className,
  spinnerOnly = false,
}: LoaderProps) {
  const spinner = (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
      aria-label="Loading"
    />
  );

  if (spinnerOnly) {
    return spinner;
  }

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {spinner}
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

