/**
 * Animation Utilities using Design System Tokens
 * Framer Motion integration with design tokens
 */

import { Variants, Transition } from 'framer-motion';
import { motion } from '@/design-system/tokens';

/**
 * Get animation config respecting user preferences
 */
export function getAnimationConfig<T extends Transition>(config: T): T | { duration: 0 } {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return { duration: 0 };
  }
  return config;
}

/**
 * Enhanced animation variants using design tokens
 */
export const animationVariants = {
  // Fade animations
  fadeIn: motion.variants.fadeIn,
  fadeInUp: motion.variants.fadeInUp,
  fadeInDown: motion.variants.fadeInDown,

  // Scale animations
  scaleIn: motion.variants.scaleIn,

  // Slide animations
  slideInLeft: motion.variants.slideInLeft,
  slideInRight: motion.variants.slideInRight,
  slideInUp: motion.variants.slideInUp,
  slideInDown: motion.variants.slideInDown,

  // Bounce animation
  bounceIn: motion.variants.bounceIn,

  // Stagger animations
  staggerContainer: motion.variants.staggerContainer,
  staggerItem: motion.variants.staggerItem,
} as const;

/**
 * Page transition variants
 */
export const pageTransitions = motion.pageTransitions;

/**
 * Micro-interaction animations
 */
export const microInteractions = motion.microInteractions;

/**
 * Create custom stagger animation
 */
export function createStaggerAnimation(staggerDelay = 0.05, delayChildren = 0.1): Variants {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return {
      animate: {
        transition: {
          staggerChildren: 0,
          delayChildren: 0,
        },
      },
    };
  }

  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * Get stagger delay for index
 */
export function getStaggerDelay(index: number, baseDelay = 50): number {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 0;
  }
  return index * baseDelay;
}

/**
 * Modal/Dialog animations
 */
export const modalAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motion.duration.fast / 1000 },
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
    transition: {
      duration: motion.duration.normal / 1000,
      ease: motion.easing.smooth,
    },
  },
  drawer: {
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
      transition: {
        duration: motion.duration.slow / 1000,
        ease: motion.easing.smooth,
      },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
      transition: {
        duration: motion.duration.slow / 1000,
        ease: motion.easing.smooth,
      },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
      transition: {
        duration: motion.duration.slow / 1000,
        ease: motion.easing.smooth,
      },
    },
  },
} as const;

/**
 * List item animations
 */
export const listItemAnimations = {
  container: createStaggerAnimation(0.05, 0.1),
  item: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: {
      duration: motion.duration.normal / 1000,
      ease: motion.easing.smooth,
    },
  },
} as const;

/**
 * Card animations
 */
export const cardAnimations = {
  hover: {
    y: -4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: {
      duration: motion.duration.normal / 1000,
      ease: motion.easing.smooth,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: motion.duration.fast / 1000,
    },
  },
} as const;

/**
 * Button animations
 */
export const buttonAnimations = {
  tap: microInteractions.buttonTap,
  hover: microInteractions.buttonHover,
} as const;

/**
 * Input animations
 */
export const inputAnimations = {
  focus: microInteractions.inputFocus,
} as const;

/**
 * Loading animations
 */
export const loadingAnimations = {
  shimmer: microInteractions.shimmer,
  pulse: microInteractions.pulse,
  spin: microInteractions.spin,
} as const;

/**
 * Toast/Notification animations
 */
export const toastAnimations = {
  enter: {
    initial: { opacity: 0, y: 50, scale: 0.3 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
  },
  slideIn: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },
} as const;

/**
 * Number counting animation (for metrics/KPIs)
 */
export function animateNumber(
  element: HTMLElement,
  start: number,
  end: number,
  duration: number = motion.duration.slower
): void {
  const startTime = performance.now();
  const difference = end - start;

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = start + difference * easeOut;

    element.textContent = Math.round(current).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Scroll-triggered animation observer
 */
export function createScrollObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}
