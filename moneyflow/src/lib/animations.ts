// src/lib/animations.ts
/**
 * Animation Utilities - Enhanced for 2025
 * Provides consistent animations and transitions across the application
 * Following Phase 5: UI/UX Polish & Animations from update_plan.md
 */

import { prefersReducedMotion } from './accessibility';

// Motion tokens (inline to avoid circular dependencies)
const _motionTokens = {
  duration: {
    fast: 0.1,
    normal: 0.2,
    slow: 0.3,
    verySlow: 0.5,
  },
  easing: {
    easeOut: [0.4, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

/**
 * Animation variants for common UI patterns
 */
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  scaleOut: {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
} as const;

/**
 * Transition presets
 */
export const TRANSITIONS = {
  fast: { duration: 0.15 },
  normal: { duration: 0.25 },
  slow: { duration: 0.35 },
  verySlow: { duration: 0.5 },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  smooth: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  },
} as const;

/**
 * Get animation config respecting user preferences
 */
export function getAnimationConfig<T extends object>(config: T): T | { duration: 0 } {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return config;
}

/**
 * CSS animation classes (Tailwind-compatible)
 */
export const ANIMATION_CLASSES = {
  // Fade
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',

  // Slide
  slideInFromTop: 'animate-in slide-in-from-top',
  slideInFromBottom: 'animate-in slide-in-from-bottom',
  slideInFromLeft: 'animate-in slide-in-from-left',
  slideInFromRight: 'animate-in slide-in-from-right',

  slideOutToTop: 'animate-out slide-out-to-top',
  slideOutToBottom: 'animate-out slide-out-to-bottom',
  slideOutToLeft: 'animate-out slide-out-to-left',
  slideOutToRight: 'animate-out slide-out-to-right',

  // Zoom
  zoomIn: 'animate-in zoom-in',
  zoomOut: 'animate-out zoom-out',

  // Spin
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',

  // Duration
  duration75: 'duration-75',
  duration100: 'duration-100',
  duration150: 'duration-150',
  duration200: 'duration-200',
  duration300: 'duration-300',
  duration500: 'duration-500',
  duration700: 'duration-700',
  duration1000: 'duration-1000',
} as const;

/**
 * Stagger animation helper
 */
export function getStaggerDelay(index: number, baseDelay = 50): number {
  if (prefersReducedMotion()) return 0;
  return index * baseDelay;
}

/**
 * Create stagger children animation
 */
export function createStaggerAnimation(staggerDelay = 0.05, delayChildren = 0) {
  if (prefersReducedMotion()) {
    return {
      staggerChildren: 0,
      delayChildren: 0,
    };
  }

  return {
    staggerChildren: staggerDelay,
    delayChildren,
  };
}

/**
 * Page transition variants
 */
export const PAGE_TRANSITIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: TRANSITIONS.normal,
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: TRANSITIONS.smooth,
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: TRANSITIONS.smooth,
  },
} as const;

/**
 * Modal/Dialog animation variants
 */
export const MODAL_ANIMATIONS = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: TRANSITIONS.fast,
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
    transition: TRANSITIONS.smooth,
  },
} as const;

/**
 * List item animation variants
 */
export const LIST_ITEM_ANIMATIONS = {
  container: createStaggerAnimation(0.05),
  item: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  },
} as const;

/**
 * Hover animation utilities
 */
export const HOVER_ANIMATIONS = {
  lift: 'transition-transform hover:-translate-y-1',
  scale: 'transition-transform hover:scale-105',
  glow: 'transition-shadow hover:shadow-lg',
  brightness: 'transition-all hover:brightness-110',
} as const;

/**
 * Button interaction animations (Phase 5)
 */
export const BUTTON_ANIMATIONS = {
  tap: { scale: 0.95 },
  hover: { scale: 1.02 },
  transition: { duration: 0.1 },
} as const;

/**
 * Card interaction animations (Phase 5)
 */
export const CARD_ANIMATIONS = {
  hover: {
    y: -4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: { scale: 0.98 },
} as const;

/**
 * Form input animations (Phase 5)
 */
export const INPUT_ANIMATIONS = {
  focus: {
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    transition: { duration: 0.15 },
  },
  error: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
} as const;

/**
 * Number counting animation config
 */
export const COUNT_UP_CONFIG = {
  duration: 2,
  separator: ',',
  decimal: '.',
  decimals: 0,
} as const;

/**
 * Skeleton loading animation
 */
export const SKELETON_ANIMATION = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  },
} as const;

/**
 * Toast notification animations
 */
export const TOAST_ANIMATIONS = {
  enter: {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    animate: { opacity: 0, y: 20, scale: 0.9 },
    transition: { duration: 0.2 },
  },
} as const;

/**
 * Confetti celebration animation config
 */
export const CONFETTI_CONFIG = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#3B82F6', '#6366F1', '#8B5CF6', '#10B981', '#F59E0B'],
} as const;

/**
 * Progress bar animation
 */
export const PROGRESS_ANIMATIONS = {
  bar: {
    initial: { width: 0 },
    animate: (value: number) => ({ width: `${value}%` }),
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  radial: {
    initial: { pathLength: 0 },
    animate: (value: number) => ({ pathLength: value / 100 }),
    transition: { duration: 1, ease: 'easeOut' },
  },
} as const;

/**
 * Drawer/Sheet animations
 */
export const DRAWER_ANIMATIONS = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
} as const;

/**
 * Dropdown/Menu animations
 */
export const DROPDOWN_ANIMATIONS = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
  transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
} as const;

/**
 * Accordion/Collapsible animations
 */
export const ACCORDION_ANIMATIONS = {
  content: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  icon: {
    initial: { rotate: 0 },
    animate: { rotate: 180 },
    transition: { duration: 0.2 },
  },
} as const;
