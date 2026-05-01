/**
 * Tailwind CSS Configuration - Enhanced for 2025
 *
 * Production-ready Tailwind CSS configuration for Money Flow application.
 * Integrated with modern design system tokens.
 *
 * @module TailwindConfig
 * @see {@link https://tailwindcss.com/docs/configuration | Tailwind CSS Configuration}
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Use class-based dark mode for better control
  darkMode: ['class'],

  // Content paths - Tailwind scans these files for class names
  // Production: Only scan necessary files for optimal build performance
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Exclude test files from content scanning (they don't affect production CSS)
    '!./src/**/*.test.{js,ts,jsx,tsx}',
    '!./src/**/*.spec.{js,ts,jsx,tsx}',
  ],

  // Safelist critical classes that might be dynamically generated
  // This ensures these classes are always included in the build
  safelist: [
    // Dynamic status colors
    'bg-success',
    'bg-warning',
    'bg-destructive',
    'text-success',
    'text-warning',
    'text-destructive',
    // Animation classes that might be added dynamically
    'animate-fade-in',
    'animate-fade-out',
    'animate-slide-in',
  ],

  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-out': { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(10px)', opacity: '0' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'slide-out': 'slide-out 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'bounce-in': 'bounce-in 0.5s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-left': 'slide-left 0.3s ease-out',
        'slide-right': 'slide-right 0.3s ease-out',
      },

      spacing: {
        18: '4.5rem',
        88: '22rem',
        112: '28rem',
        128: '32rem',
      },

      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },

      fontSize: {
        xxs: '0.625rem',
        xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        sm: 'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
        base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        lg: 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',
        xl: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',
        '2xl': 'clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)',
        '3xl': 'clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)',
        '4xl': 'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)',
        '5xl': 'clamp(3rem, 2.55rem + 2.25vw, 3.75rem)',
        '6xl': 'clamp(3.75rem, 3.15rem + 3vw, 4.5rem)',
      },

      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
        'glow-sm': '0 0 10px rgb(59 130 246 / 0.3)',
        'glow-md': '0 0 20px rgb(59 130 246 / 0.4)',
        'glow-lg': '0 0 30px rgb(59 130 246 / 0.5)',
        'primary-sm': '0 4px 6px -1px rgb(59 130 246 / 0.2), 0 2px 4px -2px rgb(59 130 246 / 0.1)',
        'primary-md':
          '0 10px 15px -3px rgb(59 130 246 / 0.3), 0 4px 6px -4px rgb(59 130 246 / 0.2)',
        'primary-lg':
          '0 20px 25px -5px rgb(59 130 246 / 0.4), 0 8px 10px -6px rgb(59 130 246 / 0.3)',
      },
    },
  },

  // Production plugins
  // These plugins extend Tailwind with additional utilities
  plugins: [
    // Form styling plugin - provides better default form element styles
    require('@tailwindcss/forms'),
    // Typography plugin - provides prose classes for rich text content
    require('@tailwindcss/typography'),
    // Aspect ratio plugin - provides aspect-ratio utilities
    require('@tailwindcss/aspect-ratio'),
    // Animation plugin - provides additional animation utilities
    require('tailwindcss-animate'),
  ],

  // Future flags for upcoming Tailwind features
  // Enables experimental features that will become defaults in future versions
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover styles on devices that support hover
  },

  // Core plugins configuration
  // Control which core plugins are enabled (all enabled by default)
  corePlugins: {
    // Disable preflight if you want to use your own base styles
    // preflight: false,
  },
};
