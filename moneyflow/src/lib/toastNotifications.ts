// src/lib/toastNotifications.ts
/**
 * Enhanced Toast Notification System
 * Provides consistent toast notifications across the application
 */

import { toast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Success toast
 */
export function showSuccessToast(message: string, options?: ToastOptions) {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action,
  });
}

/**
 * Error toast
 */
export function showErrorToast(message: string, options?: ToastOptions) {
  return toast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    action: options?.action,
  });
}

/**
 * Warning toast
 */
export function showWarningToast(message: string, options?: ToastOptions) {
  return toast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action,
  });
}

/**
 * Info toast
 */
export function showInfoToast(message: string, options?: ToastOptions) {
  return toast.info(message, {
    description: options?.description,
    duration: options?.duration ?? 3000,
    action: options?.action,
  });
}

/**
 * Loading toast (stays until dismissed or promise resolves)
 */
export function showLoadingToast(message: string, options?: { description?: string }) {
  return toast.loading(message, {
    description: options?.description,
  });
}

/**
 * Promise toast (automatically shows loading, success, or error based on promise)
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) => {
      return typeof messages.success === 'function' ? messages.success(data) : messages.success;
    },
    error: (error) => {
      return typeof messages.error === 'function' ? messages.error(error) : messages.error;
    },
  });
}

/**
 * Confirmation toast with action
 */
export function showConfirmationToast(
  message: string,
  onConfirm: () => void,
  options?: {
    description?: string;
    confirmLabel?: string;
    duration?: number;
  }
) {
  return toast(message, {
    description: options?.description,
    duration: options?.duration ?? 6000,
    action: {
      label: options?.confirmLabel ?? 'Confirm',
      onClick: onConfirm,
    },
  });
}

/**
 * Undo toast
 */
export function showUndoToast(
  message: string,
  onUndo: () => void,
  options?: {
    description?: string;
    duration?: number;
  }
) {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    action: {
      label: 'Undo',
      onClick: onUndo,
    },
  });
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  toast.dismiss();
}

/**
 * Custom toast
 */
export function showCustomToast(message: string, options?: ToastOptions) {
  return toast(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action,
  });
}
