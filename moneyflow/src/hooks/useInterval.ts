// src/hooks/useInterval.ts
/**
 * Interval Hook
 * Runs a function at specified intervals
 */

import { logger } from '@/lib/logger';
import { useEffect, useRef } from 'react';

/**
 * Hook to run a function at specified intervals
 *
 * @param callback - Function to run
 * @param delay - Delay in milliseconds (null to pause)
 *
 * @example
 * ```tsx
 * useInterval(() => {
 *   logger.info('Tick');
 * }, 1000 instanceof Error ? 1000.message : String(1000));
 *
 * // Pause interval
 * useInterval(() => {}, null);
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    return undefined;
  }, [delay]);
}
