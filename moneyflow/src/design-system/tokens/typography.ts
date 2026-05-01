/**
 * Typography Design Tokens
 * Modern, fluid typography system for 2025
 */

export const typography = {
  // Font Families
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
    ].join(', '),
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'].join(
      ', '
    ),
    display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(', '),
  },

  // Font Sizes - Fluid typography using clamp()
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', // 12-14px
    sm: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)', // 14-16px
    base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', // 16-18px
    lg: 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)', // 18-20px
    xl: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)', // 20-24px
    '2xl': 'clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)', // 24-30px
    '3xl': 'clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)', // 30-36px
    '4xl': 'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)', // 36-48px
    '5xl': 'clamp(3rem, 2.55rem + 2.25vw, 3.75rem)', // 48-60px
    '6xl': 'clamp(3.75rem, 3.15rem + 3vw, 4.5rem)', // 60-72px
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text Styles - Predefined combinations
  textStyles: {
    // Display styles
    displayLarge: {
      fontSize: 'clamp(3.75rem, 3.15rem + 3vw, 4.5rem)',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    displayMedium: {
      fontSize: 'clamp(3rem, 2.55rem + 2.25vw, 3.75rem)',
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
    },
    displaySmall: {
      fontSize: 'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },

    // Heading styles
    h1: {
      fontSize: 'clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: 'clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.005em',
    },
    h3: {
      fontSize: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: '0',
    },
    h4: {
      fontSize: 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0',
    },
    h5: {
      fontSize: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
      fontWeight: 600,
      lineHeight: 1.45,
      letterSpacing: '0',
    },
    h6: {
      fontSize: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
    },

    // Body styles
    bodyLarge: {
      fontSize: 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0',
    },
    body: {
      fontSize: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    bodySmall: {
      fontSize: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
    },

    // Label styles
    label: {
      fontSize: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
    labelSmall: {
      fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },

    // Caption/Helper text
    caption: {
      fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },

    // Code
    code: {
      fontSize: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0',
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
    },

    // Overline
    overline: {
      fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },
  },
} as const;

export type Typography = typeof typography;
