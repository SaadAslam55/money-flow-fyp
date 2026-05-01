/**
 * App Providers
 * Centralized provider setup for the application
 */

import { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { queryClient } from '@/lib/api/query-client';
import { initFeatureFlags } from '@/lib/api/feature-flags';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { validateEnvironment, isDevelopment } from '@/config/environment';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

interface AppProvidersProps {
  children: ReactNode;
}

// ============================================
// Initialization Component
// ============================================

function AppInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Validate environment on mount
    validateEnvironment();

    // Initialize feature flags
    initFeatureFlags().catch((err) => {
      logger.error('Failed to initialize feature flags:', err instanceof Error ? err.message : String(err));
    });
  }, []);

  return <>{children}</>;
}

// ============================================
// Main Provider Component
// ============================================

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppInitializer>{children}</AppInitializer>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: 'group toast',
                title: 'text-sm font-semibold',
                description: 'text-sm opacity-90',
              },
            }}
          />
        </ThemeProvider>

        {/* React Query Devtools (dev only) */}
        {isDevelopment() && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
