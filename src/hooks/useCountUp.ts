// src/hooks/useCountUp.ts
/**
 * Animated counter hook for dashboard statistics
 * Provides smooth count-up animation with easing
 */

import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
}

export function useCountUp(
  end: number,
  options: UseCountUpOptions = {}
): string {
  const {
    duration = 1500,
    delay = 0,
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
  } = options;

  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Handle NaN, undefined, or null
    const target = Number.isFinite(end) ? end : 0;
    if (target === 0) {
      setCount(0);
      return;
    }

    const timeout = setTimeout(() => {
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        setCount(current);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, delay]);

  // Format number with locale separators and decimals
  const formatted = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${prefix}${formatted}${suffix}`;
}

/**
 * Currency-specific count up hook
 * Formats as PKR with lakh/crore notation
 */
export function useCurrencyCountUp(
  amount: number,
  duration = 1500
): string {
  const count = useCountUp(amount, { duration, decimals: 0 });
  return `Rs. ${count}`;
}
