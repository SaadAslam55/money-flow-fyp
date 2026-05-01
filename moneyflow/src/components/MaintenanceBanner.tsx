/**
 * Maintenance Banner Component
 * Displays a banner when the system is in maintenance/read-only mode
 */

import React from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { useMaintenanceMode } from '@/lib/maintenance/read-only';

// ============================================
// Main Component
// ============================================

export function MaintenanceBanner() {
  const { isReadOnly, message, scheduledEnd } = useMaintenanceMode();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Don't render if not in read-only mode or dismissed
  if (!isReadOnly || isDismissed) {
    return null;
  }

  // Format scheduled end time
  const formattedEnd = scheduledEnd ? new Date(scheduledEnd).toLocaleString() : null;

  return (
    <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 text-black">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5">
        {/* Icon */}
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />

        {/* Message */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium">
          <span>{message || 'System is in maintenance mode'}</span>

          {formattedEnd && (
            <span className="flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-xs">
              <Clock className="h-3 w-3" />
              Expected: {formattedEnd}
            </span>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-2 rounded-full p-1 transition-colors hover:bg-black/10"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// Alternative Styles
// ============================================

export function MaintenanceBannerCompact() {
  const { isReadOnly, message } = useMaintenanceMode();

  if (!isReadOnly) return null;

  return (
    <div className="flex items-center gap-2 border-l-4 border-yellow-500 bg-yellow-100 p-2 text-sm text-yellow-800">
      <AlertTriangle className="h-4 w-4" />
      <span>{message || 'Read-only mode active'}</span>
    </div>
  );
}

export function MaintenanceOverlay() {
  const { isReadOnly, message, scheduledEnd } = useMaintenanceMode();

  if (!isReadOnly) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertTriangle className="h-8 w-8" />
          <h2 className="text-xl font-bold">Maintenance Mode</h2>
        </div>

        <p className="mt-4 text-gray-600">
          {message || 'The system is currently undergoing maintenance.'}
        </p>

        {scheduledEnd && (
          <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Expected completion: {new Date(scheduledEnd).toLocaleString()}
          </p>
        )}

        <div className="mt-6 rounded-md bg-gray-50 p-3 text-sm text-gray-500">
          <p>During this time:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>You can view existing data</li>
            <li>Creating and editing is disabled</li>
            <li>Your data is safe</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Toast-style Notification
// ============================================

export function MaintenanceToast() {
  const { isReadOnly, message } = useMaintenanceMode();
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (isReadOnly) {
      setIsVisible(true);
    }
  }, [isReadOnly]);

  if (!isReadOnly || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <div>
          <p className="font-medium text-amber-800">Maintenance Mode</p>
          <p className="text-sm text-amber-600">{message || 'Read-only access'}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-amber-400 hover:text-amber-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// Export Default
// ============================================

export default MaintenanceBanner;
