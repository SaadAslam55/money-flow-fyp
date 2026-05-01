// src/App.tsx
/**
 * Root Application Component
 *
 * This is the main application component that wraps the entire app.
 * Handles global initialization, analytics setup, and error boundaries.
 *
 * @module App
 *
 * @example
 * ```tsx
 * // In main.tsx
 *
import App from './App';
 *
 * ReactDOM.createRoot(document.getElementById('root')!).render(
 *   <React.StrictMode>
 *     <QueryClientProvider client={queryClient}>
 *       <App />
 *       <Toaster position="top-right" richColors />
 *     </QueryClientProvider>
 *   </React.StrictMode>
 * );
 * ```
 */

import { useEffect, Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { initializeAnalytics } from '@/services/analytics';
import { isSupabaseConfigured, getSupabaseConfigError } from '@/services/supabase/client';
import { setupAuthInterceptor } from '@/lib/apiInterceptor';
import { logger } from '@/lib/logger';
import { router } from './router';

/**
 * App Component
 *
 * Root component that:
 * - Initializes analytics services
 * - Sets up error boundaries
 * - Provides router with Suspense for lazy-loaded routes
 * - Handles global app initialization
 */
export default function App() {
  // Check configuration on mount (development only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDev = import.meta.env.DEV;

      // DEBUG: Log environment variables (development only)
      if (isDev) {
        logger.debug('Environment Variables:', {
          VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
          VITE_APP_URL: import.meta.env.VITE_APP_URL,
          NODE_ENV: import.meta.env.MODE,
        });
      }

      // Check Supabase configuration
      if (!isSupabaseConfigured()) {
        const configError = getSupabaseConfigError();
        // Only log detailed error in development
        if (isDev) {
          logger.error(
            'Configuration Error:',
            configError?.message || 'Missing required environment variables'
          );
        }
      }
    }
  }, []);

  // Initialize analytics and auth interceptor on app mount
  useEffect(() => {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      try {
        // Initialize analytics
        const analyticsStatus = initializeAnalytics();

        // Analytics initialized in development mode
        const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
        if (isDev) {
          // Analytics status available for debugging
          void analyticsStatus;
        }

        // Setup auth interceptor for auto token refresh on 401
        setupAuthInterceptor();
      } catch (error) {
        logger.error('Failed to initialize services:', error instanceof Error ? error.message : String(error));
      }
    }
  }, []);

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="w-full max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. Please refresh the page or contact support if the
              problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader message="Loading application..." />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}
