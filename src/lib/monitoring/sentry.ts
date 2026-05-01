/**
 * Sentry Error Tracking Configuration (Optional)
 *
 * This module provides Sentry integration for error tracking, performance monitoring,
 * and session replay in production environments.
 *
 * To enable Sentry, install the package:
 *   npm install @sentry/react
 */

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
type Span = unknown;

// Minimal Sentry event types for type safety without full dependency
interface SentryBreadcrumb {
  data?: {
    headers?: Record<string, string>;
  };
}

interface SentryEvent {
  breadcrumbs?: SentryBreadcrumb[];
  request?: {
    data?: unknown;
  };
  extra?: Record<string, unknown>;
}

// Lazy-load Sentry to avoid hard dependency - using any for runtime module shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SentryModule: any = null;

async function getSentry(): Promise<any> {
  if (SentryModule) return SentryModule;
  try {
    // @ts-expect-error - optional dependency
    SentryModule = await import('@sentry/react');
  } catch {
    console.warn('[Sentry] @sentry/react not installed. Run: npm install @sentry/react');
  }
  return SentryModule;
}

interface SentryConfig {
  dsn: string | undefined;
  environment: string;
  release?: string;
  debug?: boolean;
}

/**
 * Initialize Sentry with optimal configuration
 */
export async function initSentry(config?: Partial<SentryConfig>): Promise<void> {
  const dsn = config?.dsn || import.meta.env.VITE_SENTRY_DSN;

  // Skip initialization if no DSN or in development
  if (!dsn || import.meta.env.DEV) {
    console.log('[Sentry] Skipped initialization (no DSN or development mode)');
    return;
  }

  const Sentry = await getSentry();
  if (!Sentry) {
    console.warn('[Sentry] Module not available, skipping initialization');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: config?.environment || import.meta.env.MODE || 'production',
      release: config?.release || import.meta.env.VITE_APP_VERSION,
      debug: config?.debug || false,

      // Integrations
      integrations: [
        // Browser tracing for performance monitoring
        Sentry.browserTracingIntegration({
          traceFetch: true,
          traceXHR: true,
        }),

        // Session replay for debugging
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: getTracesSampleRate(),

      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Filter sensitive data
      beforeSend(event: SentryEvent, _hint: unknown) {
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb: SentryBreadcrumb) => {
            if (breadcrumb.data?.headers) {
              const headers = { ...breadcrumb.data.headers };
              delete headers.authorization;
              delete headers.Authorization;
              delete headers.cookie;
              delete headers.Cookie;
              breadcrumb.data.headers = headers;
            }
            return breadcrumb;
          });
        }

        if (event.request?.data) {
          const data =
            typeof event.request.data === 'string'
              ? JSON.parse(event.request.data)
              : event.request.data;

          const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
          sensitiveFields.forEach((field: string) => {
            if (data[field]) {
              data[field] = '[FILTERED]';
            }
          });

          event.request.data = JSON.stringify(data);
        }

        return event;
      },

      ignoreErrors: [
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'http://tt.telekompairing.ru',
        'Network request failed',
        'Failed to fetch',
        'NetworkError',
        'Load failed',
        'AbortError',
        'The operation was aborted',
        /^chrome:\/\//,
        /^moz-extension:\/\//,
      ],

      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
        /^safari-extension:\/\//i,
      ],
    });

    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

function getTracesSampleRate(): number {
  const env = import.meta.env.MODE;
  switch (env) {
    case 'production':
      return 0.1;
    case 'staging':
      return 0.5;
    default:
      return 1.0;
  }
}

/**
 * Capture a custom exception with additional context
 */
export async function captureException(
  error: Error | string,
  context?: Record<string, unknown>
): Promise<string | undefined> {
  if (import.meta.env.DEV) {
    console.error('[Sentry] Exception:', error, context);
    return undefined;
  }

  const Sentry = await getSentry();
  if (!Sentry) return undefined;

  return Sentry.captureException(error, { extra: context });
}

/**
 * Capture a custom message
 */
export async function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  context?: Record<string, unknown>
): Promise<string | undefined> {
  if (import.meta.env.DEV) {
    console.log(`[Sentry] ${level}:`, message, context);
    return undefined;
  }

  const Sentry = await getSentry();
  if (!Sentry) return undefined;

  return Sentry.captureMessage(message, { level, extra: context });
}

/**
 * Set user context for error tracking
 */
export async function setUser(
  user: {
    id: string;
    email?: string;
    username?: string;
    role?: string;
    organizationId?: string;
  } | null
): Promise<void> {
  const Sentry = await getSentry();
  if (!Sentry) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      organization_id: user.organizationId,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export async function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: SeverityLevel = 'info'
): Promise<void> {
  const Sentry = await getSentry();
  if (!Sentry) return;

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a performance transaction
 */
export async function startTransaction(name: string, op: string): Promise<Span | undefined> {
  const Sentry = await getSentry();
  if (!Sentry) return undefined;

  return Sentry.startInactiveSpan({ name, op });
}

export const sentryErrorBoundaryProps = {
  fallback: ({ error, resetError }: { error: Error; resetError: () => void }) => ({
    error,
    resetError,
  }),
  showDialog: true,
  dialogOptions: {
    title: 'Something went wrong',
    subtitle: 'Our team has been notified.',
    subtitle2: 'If you would like to help, tell us what happened below.',
  },
};

export { getSentry as Sentry };
