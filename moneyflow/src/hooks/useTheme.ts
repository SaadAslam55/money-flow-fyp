// src/hooks/useTheme.ts
/**
 * Theme Hook
 * Provides theme management functionality
 * 
 * Note: This hook wraps the ThemeContext for convenience.
 * For direct context access, use useThemeContext from @/contexts
 */

import { useThemeContext } from '@/contexts/ThemeContext';

/**
 * Hook to access theme functionality
 * 
 * @example
 * ```tsx
 * const { theme, setTheme, isDark } = useTheme();
 * ```
 */
export function useTheme() {
  return useThemeContext();
}

