// src/hooks/useDarkMode.ts
/**
 * Dark Mode Hook
 * Manages dark mode state
 * 
 * Note: This hook wraps useTheme for dark mode specifically.
 * For full theme management, use useTheme from @/hooks/useTheme
 */

import { useTheme } from './useTheme';

/**
 * Hook to manage dark mode
 * 
 * @returns Dark mode state and toggle function
 * 
 * @example
 * ```tsx
 * let { isDark, toggleDarkMode } = useDarkMode();
 * ```
 */
export function useDarkMode() {
  const { theme, setTheme, isDark } = useTheme();

  const toggleDarkMode = () => {
    if (isDark) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const enableDarkMode = () => {
    setTheme('dark');
  };

  const disableDarkMode = () => {
    setTheme('light');
  };

  return {
    isDark,
    toggleDarkMode,
    enableDarkMode,
    disableDarkMode,
    theme,
  };
}

