/**
 * Motion Design Tokens
 * Animation durations, easings, and transitions for 2025
 */

export const motion = {
  // Durations (in milliseconds)
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
    slowest: 1000,
  },

  // Easing functions - Natural, physics-based
  easing: {
    // Standard easings
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Custom easings for specific use cases
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Default smooth
    snappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

    // Material Design inspired
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',

    // iOS inspired
    iosStandard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    iosDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  },

  // Delays
  delay: {
    none: 0,
    short: 50,
    medium: 100,
    long: 200,
    longer: 300,
  },

  // Transition presets
  transition: {
    // Base transitions
    base: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Property-specific transitions
    colors:
      'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Combined transitions
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    none: 'none',
  },

  // Framer Motion variants
  variants: {
    // Fade animations
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },

    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    fadeInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    // Scale animations
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },

    // Slide animations
    slideInLeft: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    slideInRight: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    slideInUp: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    slideInDown: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    // Bounce animation
    bounceIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: {
        opacity: 1,
        scale: [0.95, 1.02, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.5, 1],
          ease: [0.68, -0.55, 0.265, 1.55],
        },
      },
      exit: { opacity: 0, scale: 0.95 },
    },

    // Stagger children
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.1,
        },
      },
    },

    staggerItem: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  },

  // Micro-interactions
  microInteractions: {
    // Button interactions
    buttonTap: {
      scale: 0.95,
      transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] },
    },
    buttonHover: {
      scale: 1.02,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },

    // Card interactions
    cardHover: {
      y: -4,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },

    // Input focus
    inputFocus: {
      scale: 1.01,
      transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
    },

    // Checkbox/Switch
    checkboxCheck: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3, ease: [0.68, -0.55, 0.265, 1.55] },
    },

    // Loading shimmer
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
    },

    // Pulse
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },

    // Spin
    spin: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    },
  },

  // Page transitions
  pageTransitions: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    scale: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  },
} as const;

export type Motion = typeof motion;
