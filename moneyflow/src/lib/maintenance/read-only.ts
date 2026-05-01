/**
 * Read-Only Mode / Maintenance Mode
 * Controls application state during cutover
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

interface MaintenanceState {
  isReadOnly: boolean;
  message: string;
  scheduledEnd: string | null;
  allowedOperations: string[];
  setReadOnly: (value: boolean, message?: string) => void;
  setScheduledEnd: (end: string | null) => void;
  setAllowedOperations: (operations: string[]) => void;
  reset: () => void;
}

// ============================================
// Store
// ============================================

export const useMaintenanceMode = create<MaintenanceState>()(
  persist(
    (set) => ({
      isReadOnly: false,
      message: '',
      scheduledEnd: null,
      allowedOperations: ['read', 'login', 'logout'],

      setReadOnly: (value, message = 'System is in maintenance mode. Please try again later.') => {
        set({ isReadOnly: value, message: value ? message : '' });
      },

      setScheduledEnd: (end) => {
        set({ scheduledEnd: end });
      },

      setAllowedOperations: (operations) => {
        set({ allowedOperations: operations });
      },

      reset: () => {
        set({
          isReadOnly: false,
          message: '',
          scheduledEnd: null,
          allowedOperations: ['read', 'login', 'logout'],
        });
      },
    }),
    {
      name: 'maintenance-mode',
      partialize: (state) => ({
        isReadOnly: state.isReadOnly,
        message: state.message,
        scheduledEnd: state.scheduledEnd,
      }),
    }
  )
);

// ============================================
// Helpers
// ============================================

/**
 * Check if an operation is blocked in read-only mode
 */
export function isOperationBlocked(operation: string): boolean {
  const { isReadOnly, allowedOperations } = useMaintenanceMode.getState();

  if (!isReadOnly) return false;

  // Check if operation is allowed
  const normalizedOp = operation.toLowerCase();

  // Always allow read operations
  if (
    normalizedOp.startsWith('get') ||
    normalizedOp.startsWith('list') ||
    normalizedOp.startsWith('fetch')
  ) {
    return false;
  }

  return !allowedOperations.includes(normalizedOp);
}

/**
 * Block mutations if in read-only mode
 * @throws Error if operation is blocked
 */
export function blockMutationsIfReadOnly(operation: string): void {
  const { isReadOnly, message } = useMaintenanceMode.getState();

  if (!isReadOnly) return;

  const mutationPrefixes = [
    'create',
    'update',
    'delete',
    'add',
    'remove',
    'save',
    'post',
    'put',
    'patch',
  ];

  const isMutation = mutationPrefixes.some((prefix) => operation.toLowerCase().startsWith(prefix));

  if (isMutation) {
    throw new Error(message || 'System is in maintenance mode');
  }
}

/**
 * Wrap an async function to block during read-only mode
 */
export function withReadOnlyCheck<T extends (...args: any[]) => Promise<any>>(
  operation: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    blockMutationsIfReadOnly(operation);
    return fn(...args);
  }) as T;
}

// ============================================
// Server Sync
// ============================================

/**
 * Fetch maintenance status from server
 */
export async function syncMaintenanceStatus(apiUrl: string): Promise<void> {
  try {
    const response = await fetch(`${apiUrl}/api/v1/maintenance/status`);

    if (!response.ok) return;

    const data = await response.json();

    const store = useMaintenanceMode.getState();

    if (data.readOnly !== undefined) {
      store.setReadOnly(data.readOnly, data.message);
    }

    if (data.scheduledEnd) {
      store.setScheduledEnd(data.scheduledEnd);
    }
  } catch {
    // Silently fail - don't block app if status check fails
  }
}

// ============================================
// React Hook for Components
// ============================================

/**
 * Hook to check if a specific action is available
 */
export function useCanPerformAction(action: string): boolean {
  const { isReadOnly, allowedOperations } = useMaintenanceMode();

  if (!isReadOnly) return true;

  return allowedOperations.includes(action.toLowerCase());
}
