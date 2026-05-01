// src/hooks/useToast.ts
/**
 * Toast Notification Hook
 * Re-exports toast functionality from sonner for consistency
 *
 * Note: The app uses 'sonner' library for toast notifications.
 * This hook provides a consistent interface for toast usage.
 */

import { toast as sonnerToast } from 'sonner';
import type { ExternalToast } from 'sonner';

/**
 * Toast notification hook
 * Provides convenient methods for showing toast notifications
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 * toast.success('Operation completed');
 * toast.error('Something went wrong');
 * ```
 */
export function useToast() {
  return {
    /**
     * Show success toast
     */
    success: (message: string, options?: ExternalToast) => {
      return sonnerToast.success(message, options);
    },

    /**
     * Show error toast
     */
    error: (message: string, options?: ExternalToast) => {
      return sonnerToast.error(message, options);
    },

    /**
     * Show warning toast
     */
    warning: (message: string, options?: ExternalToast) => {
      return sonnerToast.warning(message, options);
    },

    /**
     * Show info toast
     */
    info: (message: string, options?: ExternalToast) => {
      return sonnerToast.info(message, options);
    },

    /**
     * Show loading toast
     */
    loading: (message: string, options?: ExternalToast) => {
      return sonnerToast.loading(message, options);
    },

    /**
     * Show promise toast
     * Sonner's API expects (promise, messages) for current version
     */
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => {
      return sonnerToast.promise(promise, messages);
    },

    /**
     * Dismiss toast by ID
     */
    dismiss: (toastId?: string | number) => {
      return sonnerToast.dismiss(toastId);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll: () => {
      return sonnerToast.dismiss();
    },
  };
}

// Re-export toast function directly for convenience
export { toast } from 'sonner';
