// src/hooks/useKeyboardShortcut.ts
/**
 * Keyboard Shortcut Hook
 * Handles keyboard shortcuts with modifier key support
 */

import { useEffect } from 'react';

export interface KeyboardShortcutOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac, Windows key on Windows
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

/**
 * Hook to handle keyboard shortcuts
 * 
 * @param key - Key to listen for (e.g., 'k', 'Enter', 'Escape')
 * @param handler - Callback function when shortcut is pressed
 * @param options - Shortcut options
 * @param enabled - Whether the shortcut is enabled (default: true)
 * 
 * @example
 * ```tsx
 * useKeyboardShortcut('k', () => openSearch(), { ctrl: true });
 * useKeyboardShortcut('Escape', () => closeModal());
 * ```
 */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: KeyboardShortcutOptions = {},
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the pressed key matches
      if (event.key !== key && event.code !== key) {
        return;
      }

      // Check modifier keys
      if (options.ctrl && !event.ctrlKey) return;
      if (options.shift && !event.shiftKey) return;
      if (options.alt && !event.altKey) return;
      if (options.meta && !event.metaKey) return;

      // Ensure no unwanted modifiers are pressed
      if (!options.ctrl && event.ctrlKey) return;
      if (!options.shift && event.shiftKey) return;
      if (!options.alt && event.altKey) return;
      if (!options.meta && event.metaKey) return;

      if (options.preventDefault) {
        event.preventDefault();
      }

      if (options.stopPropagation) {
        event.stopPropagation();
      }

      handler(event);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, handler, options, enabled]);
}

/**
 * Common keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, preventDefault: true },
  SEARCH: { key: 'k', ctrl: true, preventDefault: true },
  ESCAPE: { key: 'Escape' },
  ENTER: { key: 'Enter' },
  DELETE: { key: 'Delete' },
  BACKSPACE: { key: 'Backspace' },
} as const;

