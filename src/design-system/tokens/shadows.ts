/**
 * Shadow Design Tokens
 * Elevation system with 5 levels for depth hierarchy
 */

export const shadows = {
  // Elevation levels (0-5)
  none: 'none',

  // Level 1 - Subtle elevation (cards at rest)
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',

  // Level 2 - Low elevation (raised cards, dropdowns)
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

  // Level 3 - Medium elevation (popovers, tooltips)
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

  // Level 4 - High elevation (modals, dialogs)
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  // Level 5 - Highest elevation (drawers, overlays)
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Inner shadow
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // Colored shadows for emphasis
  primary: {
    sm: '0 4px 6px -1px rgb(59 130 246 / 0.2), 0 2px 4px -2px rgb(59 130 246 / 0.1)',
    md: '0 10px 15px -3px rgb(59 130 246 / 0.3), 0 4px 6px -4px rgb(59 130 246 / 0.2)',
    lg: '0 20px 25px -5px rgb(59 130 246 / 0.4), 0 8px 10px -6px rgb(59 130 246 / 0.3)',
  },

  success: {
    sm: '0 4px 6px -1px rgb(34 197 94 / 0.2), 0 2px 4px -2px rgb(34 197 94 / 0.1)',
    md: '0 10px 15px -3px rgb(34 197 94 / 0.3), 0 4px 6px -4px rgb(34 197 94 / 0.2)',
  },

  warning: {
    sm: '0 4px 6px -1px rgb(245 158 11 / 0.2), 0 2px 4px -2px rgb(245 158 11 / 0.1)',
    md: '0 10px 15px -3px rgb(245 158 11 / 0.3), 0 4px 6px -4px rgb(245 158 11 / 0.2)',
  },

  destructive: {
    sm: '0 4px 6px -1px rgb(239 68 68 / 0.2), 0 2px 4px -2px rgb(239 68 68 / 0.1)',
    md: '0 10px 15px -3px rgb(239 68 68 / 0.3), 0 4px 6px -4px rgb(239 68 68 / 0.2)',
  },

  // Glow effects
  glow: {
    sm: '0 0 10px rgb(59 130 246 / 0.3)',
    md: '0 0 20px rgb(59 130 246 / 0.4)',
    lg: '0 0 30px rgb(59 130 246 / 0.5)',
  },

  // Dark mode shadows (more pronounced)
  dark: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.7), 0 8px 10px -6px rgb(0 0 0 / 0.6)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.8)',
  },
} as const;

export type Shadows = typeof shadows;
