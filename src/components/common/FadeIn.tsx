// src/components/common/FadeIn.tsx
/**
 * FadeIn Animation Wrapper - Phase 5: UI/UX Polish
 * Simple fade-in animation for content
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ANIMATION_VARIANTS, TRANSITIONS } from '@/lib/animations';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  once?: boolean;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.3,
  direction = 'up',
  once = true,
}: FadeInProps) {
  const directionVariants = {
    up: ANIMATION_VARIANTS.slideUp,
    down: ANIMATION_VARIANTS.slideDown,
    left: ANIMATION_VARIANTS.slideLeft,
    right: ANIMATION_VARIANTS.slideRight,
    none: ANIMATION_VARIANTS.fadeIn,
  };

  const variant = directionVariants[direction];

  return (
    <motion.div
      className={cn(className)}
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
