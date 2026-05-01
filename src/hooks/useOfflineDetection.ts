// src/hooks/useOfflineDetection.ts
/**
 * Offline Detection Hook
 * Monitors network connectivity and provides offline status
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface OfflineDetectionOptions {
  showToast?: boolean;
  onOnline?: () => void;
  onOffline?: () => void;
  pollingInterval?: number;
}

/**
 * Hook to detect and handle offline/online status
 */
export function useOfflineDetection(options: OfflineDetectionOptions = {}) {
  const {
    showToast = true,
    onOnline,
    onOffline,
    pollingInterval = 30000, // 30 seconds
  } = options;

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      logger.info('Connection restored');
      setIsOnline(true);

      if (wasOffline && showToast) {
        toast.success('Connection restored', {
          description: 'You are back online',
        });
      }

      setWasOffline(false);
      onOnline?.();
    };

    const handleOffline = () => {
      logger.warn('Connection lost');
      setIsOnline(false);
      setWasOffline(true);

      if (showToast) {
        toast.error('No internet connection', {
          description: 'Some features may be unavailable',
          duration: Infinity, // Keep showing until online
        });
      }

      onOffline?.();
    };

    // Listen to browser events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Polling fallback for more reliable detection
    const pollConnection = setInterval(async () => {
      try {
        const online = navigator.onLine;
        if (online !== isOnline) {
          if (online) {
            handleOnline();
          } else {
            handleOffline();
          }
        }
      } catch (error) {
        logger.error('Error polling connection:', error);
      }
    }, pollingInterval);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pollConnection);
    };
  }, [isOnline, wasOffline, showToast, onOnline, onOffline, pollingInterval]);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

/**
 * Hook to check if a specific operation should be blocked due to offline status
 */
export function useRequireOnline(errorMessage?: string) {
  const { isOnline } = useOfflineDetection();

  const checkOnline = () => {
    if (!isOnline) {
      toast.error(errorMessage || 'This action requires an internet connection');
      return false;
    }
    return true;
  };

  return { isOnline, checkOnline };
}
