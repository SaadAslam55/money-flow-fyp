import { lazy, type ComponentType } from 'react';
import { logger } from '@/lib/logger';

/**
 * Lazy load page components with proper error handling.
 * Returns a fallback component if the page fails to load.
 */
export const createLazyPage = (importFn: () => Promise<{ default: ComponentType }>) => {
  return lazy(() =>
    importFn().catch((error) => {
      logger.error('Failed to load page:', error instanceof Error ? error.message : String(error));
      return {
        default: () => (
          <div className="flex min-h-screen items-center justify-center p-8">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">Failed to load page</h2>
              <p className="mb-4 text-muted-foreground">
                The page could not be loaded. Please refresh the page or contact support.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        ),
      };
    })
  );
};
