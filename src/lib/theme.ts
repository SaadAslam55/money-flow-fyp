// src/lib/theme.ts
import { logger } from '@/lib/logger';
/**
 * Theme Utilities
 * Enhanced theme management with color scheme detection and persistence
 */

type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'moneyflow-theme';

/**
 * Get the current theme from storage
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    logger.error('Failed to get stored theme:', error);
  }

  return 'system';
}

/**
 * Set the theme in storage
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    logger.error('Failed to store theme:', error);
  }
}

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  const root = window.document.documentElement;
  const effectiveTheme = getEffectiveTheme(theme);

  root.classList.remove('light', 'dark');
  root.classList.add(effectiveTheme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const color = effectiveTheme === 'dark' ? '#0a0a0a' : '#ffffff';
    metaThemeColor.setAttribute('content', color);
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): Theme {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}

/**
 * Listen to system theme changes
 */
export function watchSystemTheme(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }
}

/**
 * Color utilities for theme-aware components
 */
export const themeColors = {
  light: {
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    primary: 'hsl(221.2, 83.2%, 53.3%)',
    secondary: 'hsl(210, 40%, 96.1%)',
    muted: 'hsl(210, 40%, 96.1%)',
    accent: 'hsl(210, 40%, 96.1%)',
    destructive: 'hsl(0, 84.2%, 60.2%)',
    border: 'hsl(214.3, 31.8%, 91.4%)',
  },
  dark: {
    background: 'hsl(222.2, 84%, 4.9%)',
    foreground: 'hsl(210, 40%, 98%)',
    primary: 'hsl(217.2, 91.2%, 59.8%)',
    secondary: 'hsl(217.2, 32.6%, 17.5%)',
    muted: 'hsl(217.2, 32.6%, 17.5%)',
    accent: 'hsl(217.2, 32.6%, 17.5%)',
    destructive: 'hsl(0, 62.8%, 30.6%)',
    border: 'hsl(217.2, 32.6%, 17.5%)',
  },
} as const;

/**
 * Get current theme color
 */
export function getThemeColor(
  color: keyof typeof themeColors.light,
  theme?: 'light' | 'dark'
): string {
  const effectiveTheme = theme || getEffectiveTheme(getStoredTheme());
  return themeColors[effectiveTheme][color];
}

/**
 * Generate CSS custom properties for theme
 */
export function generateThemeVariables(theme: 'light' | 'dark'): Record<string, string> {
  const colors = themeColors[theme];
  const variables: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    variables[`--${key}`] = value;
  });

  return variables;
}

/**
 * Check if dark mode is active
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Toggle between light and dark mode
 */
export function toggleTheme(): Theme {
  const current = getStoredTheme();
  const effectiveCurrent = getEffectiveTheme(current);
  const next: Theme = effectiveCurrent === 'dark' ? 'light' : 'dark';

  setStoredTheme(next);
  applyTheme(next);

  return next;
}
