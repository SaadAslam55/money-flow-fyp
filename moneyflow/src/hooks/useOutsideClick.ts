// src/hooks/useOutsideClick.ts
/**
 * Outside Click Hook
 * Detects clicks outside of a referenced element
 */

import { useEffect, type RefObject } from 'react';

/**
 * Hook to detect clicks outside of an element
 * 
 * @param ref - React ref to the element
 * @param handler - Callback function when outside click is detected
 * @param enabled - Whether the hook is enabled (default: true)
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useOutsideClick(ref, () => setIsOpen(false));
 * ```
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}

