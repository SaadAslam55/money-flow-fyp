// src/lib/logger.ts
/**
 * Logging Utility
 * Production-ready logging with different log levels and optional external service integration
 */

import { ENV_CONFIG } from '@/config/env.config';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
  user?: string;
  organization?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  enableConsole: boolean;
  enableExternal: boolean;
  minLevel: LogLevel;
}

const defaultConfig: LoggerConfig = {
  enableConsole: true,
  enableExternal: false,
  minLevel: ENV_CONFIG.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
};

/**
 * Format log message
 */
function formatLogMessage(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level}]`,
    entry.context ? `[${entry.context}]` : '',
    entry.message,
  ].filter(Boolean);

  return parts.join(' ');
}

/**
 * Send log to external service (e.g., Sentry, LogRocket)
 */
function sendToExternalService(entry: LogEntry): void {
  // Only send errors in production
  if (!ENV_CONFIG.isProduction || entry.level !== LogLevel.ERROR) {
    return;
  }

  // Sentry integration
  if (ENV_CONFIG.analytics.sentryDsn && typeof window !== 'undefined' && (window as any).Sentry) {
    try {
      (window as any).Sentry.captureException(new Error(entry.message), {
        level: entry.level.toLowerCase(),
        tags: {
          context: entry.context,
          user: entry.user,
          organization: entry.organization,
        },
        extra: entry.data,
      });
    } catch (error) {
      // Silently fail - don't break the app if logging fails
      console.error('Failed to send log to Sentry:', error);
    }
  }
}

/**
 * Core logging function
 *
 * This is used internally by all logger methods.
 */
function log(level: LogLevel, message: string, context?: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };

  // Check if we should log this level
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
  const currentLevelIndex = levels.indexOf(level);
  const minLevelIndex = levels.indexOf(defaultConfig.minLevel);

  if (currentLevelIndex < minLevelIndex) {
    return;
  }

  // Console logging
  if (defaultConfig.enableConsole) {
    const formattedMessage = formatLogMessage(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data ?? '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data ?? '');
        break;
    }
  }

  // External service logging (fire and forget)
  if (defaultConfig.enableExternal) {
    try {
      sendToExternalService(entry);
    } catch {
      // Silently fail - don't break the app if logging fails
    }
  }
}

/**
 * Public logger API
 *
 * Note: all methods accept a message and any number of extra values.
 * That keeps them compatible with usages like:
 *   logger.error('ErrorBoundary caught an error:', error, errorInfo);
 *   logger.info('📦 Environment:', { mode, ... });
 */
type LogFn = (message: string, ...meta: unknown[]) => void;

const createLogFn =
  (level: LogLevel): LogFn =>
  (message, ...meta) => {
    const [maybeContext, ...rest] = meta;

    // If first meta is a string, treat it as context
    if (typeof maybeContext === 'string') {
      const data = rest.length === 0 ? undefined : rest.length === 1 ? rest[0] : rest;
      log(level, message, maybeContext, data);
    } else {
      const data = meta.length === 0 ? undefined : meta.length === 1 ? meta[0] : meta;
      log(level, message, undefined, data);
    }
  };

/**
 * Logger object with different log levels
 */
export const logger: {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  api: (method: string, url: string, status?: number, duration?: number) => void;
  action: (action: string, context?: string, data?: unknown) => void;
  performance: (metric: string, duration: number, context?: string) => void;
} = {
  /**
   * Debug log (development only)
   */
  debug: createLogFn(LogLevel.DEBUG),

  /**
   * Info log
   */
  info: createLogFn(LogLevel.INFO),

  /**
   * Warning log
   */
  warn: createLogFn(LogLevel.WARN),

  /**
   * Error log
   */
  error: createLogFn(LogLevel.ERROR),

  /**
   * Log API request
   */
  api: (method: string, url: string, status?: number, duration?: number) => {
    const message = `${method} ${url}${
      status ? ` ${status}` : ''
    }${duration ? ` (${duration}ms)` : ''}`;
    log(status && status >= 400 ? LogLevel.ERROR : LogLevel.INFO, message, 'API');
  },

  /**
   * Log user action
   */
  action: (action: string, context?: string, data?: unknown) => {
    log(LogLevel.INFO, `User action: ${action}`, context, data);
  },

  /**
   * Log performance metric
   */
  performance: (metric: string, duration: number, context?: string) => {
    log(LogLevel.INFO, `Performance: ${metric} took ${duration}ms`, context);
  },
};

/**
 * Configure logger
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  Object.assign(defaultConfig, config);
}
