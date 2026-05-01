// src/components/common/AnimatedCard.tsx
/**
 * Animated Card Component - Phase 5: UI/UX Polish
 * Card with hover lift effect and smooth transitions
 */

import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CARD_ANIMATIONS } from '@/lib/animations';

interface AnimatedCardProps {
  className?: string;
  variant?: 'default' | 'interactive' | 'elevated';
  disableAnimation?: boolean;
  children?: ReactNode;
  onClick?: () => void;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = 'default', disableAnimation = false, children, onClick }, ref) => {
    const baseStyles = 'rounded-lg border bg-card text-card-foreground';

    const variantStyles = {
      default: 'shadow-sm',
      interactive: 'shadow-sm cursor-pointer',
      elevated: 'shadow-lg',
    };

    if (disableAnimation) {
      return (
        <div
          ref={ref}
          className={cn(baseStyles, variantStyles[variant], className)}
          onClick={onClick}
        >
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        whileHover={variant === 'interactive' ? CARD_ANIMATIONS.hover : undefined}
        whileTap={variant === 'interactive' ? CARD_ANIMATIONS.tap : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

export default AnimatedCard;
