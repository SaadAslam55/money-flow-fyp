// src/stores/themeStore.ts
/**
 * Theme Store - Global theme state management
 * Handles light/dark/system theme preferences with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Apply theme to document
const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;

  root.classList.remove('light', 'dark');
  root.classList.add(effectiveTheme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#0f172a' : '#ffffff');
  }
};

// --- Cleanable system theme listener ---
let systemMediaQuery: MediaQueryList | null = null;
let systemMediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

function startSystemThemeListener() {
  if (typeof window === 'undefined' || systemMediaQuery) return;

  systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemMediaHandler = () => {
    // Captures useThemeStore by closure; guaranteed initialized
    // because this is only called after store creation.
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  };

  systemMediaQuery.addEventListener('change', systemMediaHandler);
}

function stopSystemThemeListener() {
  if (systemMediaQuery && systemMediaHandler) {
    systemMediaQuery.removeEventListener('change', systemMediaHandler);
  }
  systemMediaQuery = null;
  systemMediaHandler = null;
}

// --- Store ---
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
        // Only listen to system changes when theme mode is "system"
        if (theme === 'system') {
          stopSystemThemeListener();
          startSystemThemeListener();
        } else {
          stopSystemThemeListener();
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const effectiveTheme = currentTheme === 'system' ? getSystemTheme() : currentTheme;
        const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        applyTheme(newTheme);
        stopSystemThemeListener();
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          if (state.theme === 'system') {
            stopSystemThemeListener();
            startSystemThemeListener();
          } else {
            stopSystemThemeListener();
          }
        }
      },
    }
  )
);

// --- Single initialization on app load ---
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme-storage');
  let theme: Theme = 'system';
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      theme = parsed.state?.theme ?? 'system';
    } catch {
      theme = 'system';
    }
  }
  applyTheme(theme);
  if (theme === 'system') {
    startSystemThemeListener();
  }
}
