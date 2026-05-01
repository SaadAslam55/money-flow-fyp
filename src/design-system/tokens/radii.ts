/**
 * Border Radius Design Tokens
 * Consistent rounding system for modern UI
 */

export const radii = {
  // Base radius scale
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px', // Fully rounded

  // Semantic radius
  semantic: {
    button: '0.5rem', // 8px
    input: '0.5rem', // 8px
    card: '0.75rem', // 12px
    modal: '1rem', // 16px
    badge: '9999px', // Fully rounded
    avatar: '9999px', // Fully rounded
    chip: '9999px', // Fully rounded
  },
} as const;

export type Radii = typeof radii;
