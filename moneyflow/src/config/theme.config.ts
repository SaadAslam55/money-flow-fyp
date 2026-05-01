/**
 * Theme Configuration
 * Centralized theme settings, color schemes, and design tokens
 */

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Color scheme configuration
 */
export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  ring: string;
  destructive: string;
  success: string;
  warning: string;
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  fontFamily: {
    sans: string[];
    mono: string[];
    serif: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  scale: number; // Base unit (8px)
  values: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
}

/**
 * Border radius configuration
 */
export interface BorderRadiusConfig {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

/**
 * Shadow configuration
 */
export interface ShadowConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  glow: string;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: {
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
  easing: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
    bounce: string;
  };
}

/**
 * Theme configuration object
 */
export interface ThemeConfig {
  mode: ThemeMode;
  defaultMode: ThemeMode;
  colorScheme: {
    light: ColorScheme;
    dark: ColorScheme;
  };
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  animations: AnimationConfig;
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

/**
 * Light color scheme
 */
const lightColorScheme: ColorScheme = {
  name: 'light',
  primary: '238.7 83.5% 66.7%', // HSL values for CSS variables
  secondary: '210 40% 96.1%',
  accent: '210 40% 96.1%',
  background: '0 0% 100%',
  foreground: '222.2 84% 4.9%',
  muted: '210 40% 96.1%',
  border: '214.3 31.8% 91.4%',
  ring: '238.7 83.5% 66.7%',
  destructive: '0 84.2% 60.2%',
  success: '142.1 76.2% 36.3%',
  warning: '38 92% 50%',
};

/**
 * Dark color scheme
 */
const darkColorScheme: ColorScheme = {
  name: 'dark',
  primary: '238.7 83.5% 66.7%',
  secondary: '217.2 32.6% 17.5%',
  accent: '217.2 32.6% 17.5%',
  background: '222.2 84% 4.9%',
  foreground: '0 0% 100%',
  muted: '217.2 32.6% 17.5%',
  border: '217.2 32.6% 17.5%',
  ring: '238.7 83.5% 66.7%',
  destructive: '0 62.8% 30.6%',
  success: '142.1 70.6% 45.3%',
  warning: '38 92% 50%',
};

/**
 * Typography configuration
 */
const typography: TypographyConfig = {
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ],
    mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
    serif: ['Georgia', 'Times New Roman', 'serif'],
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

/**
 * Spacing configuration
 */
const spacing: SpacingConfig = {
  scale: 8, // Base unit: 8px
  values: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
  },
};

/**
 * Border radius configuration
 */
const borderRadius: BorderRadiusConfig = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

/**
 * Shadow configuration
 */
const shadows: ShadowConfig = {
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
};

/**
 * Animation configuration
 */
const animations: AnimationConfig = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

/**
 * Main theme configuration
 */
export const THEME_CONFIG: ThemeConfig = {
  mode: 'system',
  defaultMode: 'light',
  colorScheme: {
    light: lightColorScheme,
    dark: darkColorScheme,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints: {
    xs: '20rem', // 320px
    sm: '24rem', // 384px
    md: '28rem', // 448px
    lg: '32rem', // 512px
    xl: '36rem', // 576px
    '2xl': '42rem', // 672px
  },
};

/**
 * Get current theme mode
 */
export function getThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return THEME_CONFIG.defaultMode;
  }

  const stored = localStorage.getItem('moneyflow-theme') as ThemeMode | null;
  return stored || THEME_CONFIG.defaultMode;
}

/**
 * Set theme mode
 */
export function setThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('moneyflow-theme', mode);

  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  } else {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}

/**
 * Initialize theme on app load
 */
export function initTheme(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const mode = getThemeMode();
  setThemeMode(mode);

  // Listen for system theme changes
  if (mode === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
  }
}

/**
 * Get color scheme for current mode
 */
export function getColorScheme(): ColorScheme {
  const mode = getThemeMode();
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return isDark ? THEME_CONFIG.colorScheme.dark : THEME_CONFIG.colorScheme.light;
}

/**
 * Type-safe theme config
 */
export type ThemeConfigType = typeof THEME_CONFIG;

