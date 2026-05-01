// src/hooks/useKeyboardShortcuts.ts
/**
 * Keyboard Shortcuts Hook
 * Provides keyboard shortcut functionality with proper cleanup
 */

import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Command on Mac, Windows key on Windows
  handler: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }

        logger.debug('Keyboard shortcut triggered:', shortcut.key);
        shortcut.handler(event);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * Common keyboard shortcuts
 */
export const COMMON_SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  CANCEL: { key: 'Escape', description: 'Cancel/Close' },
  NEW: { key: 'n', ctrl: true, description: 'New item' },
  SEARCH: { key: 'k', ctrl: true, description: 'Search' },
  DELETE: { key: 'Delete', description: 'Delete' },
  EDIT: { key: 'e', ctrl: true, description: 'Edit' },
  REFRESH: { key: 'r', ctrl: true, description: 'Refresh' },
  HELP: { key: '?', shift: true, description: 'Help' },
  NAVIGATE_BACK: { key: '[', ctrl: true, description: 'Navigate back' },
  NAVIGATE_FORWARD: { key: ']', ctrl: true, description: 'Navigate forward' },
} as const;

/**
 * Hook for a single keyboard shortcut
 */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    enabled?: boolean;
    preventDefault?: boolean;
  }
) {
  useKeyboardShortcuts({
    enabled: options?.enabled,
    shortcuts: [
      {
        key,
        ctrl: options?.ctrl,
        alt: options?.alt,
        shift: options?.shift,
        meta: options?.meta,
        handler,
        preventDefault: options?.preventDefault,
      },
    ],
  });
}
