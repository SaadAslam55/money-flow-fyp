// src/components/common/PageTemplate.tsx
import * as React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface PageTemplateProps {
  /**
   * Page title (also used for SEO)
   */
  title: string;
  /**
   * Page description (also used for SEO)
   */
  description?: string;
  /**
   * SEO keywords
   */
  keywords?: string;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Error state
   */
  error?: Error | string | null;
  /**
   * Show header section
   */
  showHeader?: boolean;
  /**
   * Custom header content
   */
  header?: React.ReactNode;
  /**
   * Actions in header (buttons, etc.)
   */
  actions?: React.ReactNode;
  /**
   * Breadcrumbs
   */
  breadcrumbs?: React.ReactNode;
  /**
   * Page content
   */
  children: React.ReactNode;
  /**
   * Additional className for container
   */
  className?: string;
  /**
   * Show loading skeleton instead of spinner
   */
  useSkeleton?: boolean;
}

/**
 * Production-ready page template component
 * Provides consistent page structure with:
 * - SEO meta tags
 * - Loading states
 * - Error handling
 * - Consistent header layout
 */
export function PageTemplate({
  title,
  description,
  keywords,
  loading = false,
  error = null,
  showHeader = true,
  header,
  actions,
  breadcrumbs,
  children,
  className = '',
  useSkeleton = false,
}: PageTemplateProps) {
  // Update page title and meta tags
  usePageTitle({ title, description, keywords });

  // Render loading state
  if (loading && useSkeleton) {
    return (
      <div className={`space-y-6 p-6 ${className}`}>
        {showHeader && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            {description && <Skeleton className="h-4 w-96" />}
          </div>
        )}
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (loading && !useSkeleton) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    const errorMessage =
      typeof error === 'string' ? error : error?.message ?? 'An error occurred';

    return (
      <div className={`space-y-6 p-6 ${className}`}>
        {showHeader && (
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render normal content
  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && <div>{breadcrumbs}</div>}

      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {header || (
              <>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && (
                  <p className="text-muted-foreground mt-1">{description}</p>
                )}
              </>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}

