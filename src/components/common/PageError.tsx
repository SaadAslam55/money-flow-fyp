// src/components/common/PageError.tsx
/**
 * Page Error Component
 * Displays error state for page-level operations
 */

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PageErrorProps {
  error?: Error | string | null;
  title?: string;
  description?: string;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  className?: string;
  fullScreen?: boolean;
}

/**
 * Page error component with retry and navigation options
 */
export function PageError({
  error,
  title = 'Something went wrong',
  description = 'An error occurred while loading this page.',
  showRetry = true,
  showHome = true,
  onRetry,
  className,
  fullScreen = true,
}: PageErrorProps) {
  const navigate = useNavigate();

  const errorMessage = error ? (typeof error === 'string' ? error : error.message) : null;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center p-4',
        fullScreen ? 'min-h-screen' : 'min-h-[400px]',
        className
      )}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {showRetry && (
              <Button onClick={handleRetry} variant="default" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {showHome && (
              <Button onClick={handleGoHome} variant="outline" className="flex-1">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Inline error component (non-fullscreen)
 */
export function InlineError({
  error,
  onRetry,
}: {
  error?: Error | string | null;
  onRetry?: () => void;
}) {
  const errorMessage = error
    ? typeof error === 'string'
      ? error
      : error.message
    : 'An error occurred';

  return (
    <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-destructive">Error</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
