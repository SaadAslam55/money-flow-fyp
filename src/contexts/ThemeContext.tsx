// src/contexts/ThemeContext.tsx
/**
 * Theme Context
 * Provides theme management throughout the application
 * Integrates with theme config and UI store for consistent theme handling
 */

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { getThemeMode, setThemeMode, initTheme, getColorScheme, type ThemeMode } from '@/config/theme.config';

/**
 * Theme context type
 */
export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  colorScheme: ReturnType<typeof getColorScheme>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component props
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider
 * Manages theme state and applies theme to the application
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme: setStoreTheme } = useUIStore();

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, []);

  // Apply theme changes
  useEffect(() => {
    setThemeMode(theme);
    setStoreTheme(theme);
  }, [theme, setStoreTheme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  const handleSetTheme = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    setStoreTheme(newTheme);
  };

  const colorScheme = getColorScheme();
  const isDark = 
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    colorScheme,
    isDark,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 * 
 * @throws Error if used outside ThemeProvider
 * @returns Theme context value
 * 
 * @example
 * ```tsx
 * const { theme, setTheme, isDark } = useThemeContext();
 * ```
 */
export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  
  return context;
}

