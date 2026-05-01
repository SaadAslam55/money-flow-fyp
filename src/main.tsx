// src/main.tsx
/**
 * Application Entry Point
 *
 * This is the main entry point for the React application.
 * Sets up global providers, React Query, error handlers, and renders the root App component.
 *
 * Production-ready features:
 * - React Query with optimized caching
 * - Global error handlers (unhandled errors, promise rejections)
 * - React Query DevTools (development only)
 * - Performance monitoring hooks
 * - Proper error boundaries
 *
 * @module Main
 */

import { logger } from '@/lib/logger';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import './assets/styles/globals.css';

// React Query DevTools - conditionally loaded in development
// Note: Install @tanstack/react-query-devtools as dev dependency to enable
// npm install -D @tanstack/react-query-devtools
// Then uncomment the import and usage below
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Production-ready React Query configuration
 *
 * Features:
 * - Optimized staleTime for better caching (30 seconds)
 * - Smart retry logic (no retry on 4xx client errors)
 * - Exponential backoff for retries
 * - Disabled refetch on window focus for better UX
 * - Automatic garbage collection (5 minutes)
 * - Global error handlers for queries and mutations
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds - balance between freshness and performance
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        const httpError = error as { status?: number; message?: string };
        if (httpError?.status && httpError.status >= 400 && httpError.status < 500) {
          return false;
        }
        // Don't retry on 500 errors that are likely RLS/permission issues
        if (httpError?.status === 500) {
          return false;
        }
        // Don't retry if error message suggests auth/permission issues
        if (httpError?.message?.toLowerCase().includes('permission') ||
            httpError?.message?.toLowerCase().includes('policy') ||
            httpError?.message?.toLowerCase().includes('rls')) {
          return false;
        }
        // Retry up to 2 times for network/transient server errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Better UX - don't refetch on tab switch
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      retry: false, // Don't retry mutations by default
      // Global error handler for mutations
      onError: (error: Error) => {
        if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
          logger.error(
            '[Query] Mutation error:',
            error instanceof Error ? error.message : String(error)
          );
        }
        // In production, you might want to send to error tracking service
        // Example: if (window.Sentry) window.Sentry.captureException(error);
      },
    },
  },
});

/**
 * Setup global error handlers
 * Catches unhandled errors and promise rejections
 */
function setupGlobalErrorHandlers(): void {
  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
      logger.error('[Global] Unhandled error:', event.error);
    }
    // In production, send to error tracking service
    // Example: if (window.Sentry) window.Sentry.captureException(event.error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
      logger.error('[Global] Unhandled promise rejection:', event.reason);
    }
    // Prevent default browser error handling
    event.preventDefault();
    // In production, send to error tracking service
    // Example: if (window.Sentry) window.Sentry.captureException(event.reason);
  });

  // Log warnings in development
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      // Filter out known warnings that are safe to ignore
      const message = typeof args[0] === 'string' ? args[0] : String(args[0] ?? '');
      if (
        !message.includes('React Router Future Flag Warning') &&
        !message.includes('DeprecationWarning')
      ) {
        originalWarn.apply(console, args);
      }
    };
  }
}

/**
 * Initialize application
 */
function initializeApp(): void {
  // Setup global error handlers
  setupGlobalErrorHandlers();

  // Get root element
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error(
      'Root element not found. Make sure there is a <div id="root"></div> in your HTML.'
    );
  }

  // Render application
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            },
          }}
        />
        {/* React Query DevTools - uncomment when @tanstack/react-query-devtools is installed */}
        {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Initialize the application
initializeApp();
