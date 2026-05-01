// src/components/common/AnimatedList.tsx
/**
 * Animated List Component - Phase 5: UI/UX Polish
 * List with staggered children animations
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LIST_ITEM_ANIMATIONS, createStaggerAnimation } from '@/lib/animations';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function AnimatedList({ children, className, staggerDelay = 0.05 }: AnimatedListProps) {
  return (
    <motion.div
      className={cn('space-y-2', className)}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        animate: {
          transition: createStaggerAnimation(staggerDelay),
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      variants={LIST_ITEM_ANIMATIONS.item}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedList;
