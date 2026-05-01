// src/components/common/SuccessAnimation.tsx
/**
 * Success Animation Component - Phase 5: UI/UX Polish
 * Checkmark animation for successful actions
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onComplete?: () => void;
}

const sizes = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export function SuccessAnimation({ size = 'md', className, onComplete }: SuccessAnimationProps) {
  return (
    <motion.div
      className={cn('relative', sizes[size], className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onAnimationComplete={onComplete}
    >
      {/* Circle */}
      <motion.svg viewBox="0 0 50 50" className="h-full w-full">
        <motion.circle
          cx="25"
          cy="25"
          r="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-green-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Checkmark */}
        <motion.path
          d="M14 27 L22 35 L38 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
        />
      </motion.svg>
    </motion.div>
  );
}

export function ErrorAnimation({ size = 'md', className, onComplete }: SuccessAnimationProps) {
  return (
    <motion.div
      className={cn('relative', sizes[size], className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onAnimationComplete={onComplete}
    >
      <motion.svg viewBox="0 0 50 50" className="h-full w-full">
        <motion.circle
          cx="25"
          cy="25"
          r="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* X mark */}
        <motion.path
          d="M16 16 L34 34 M34 16 L16 34"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
        />
      </motion.svg>
    </motion.div>
  );
}

export default SuccessAnimation;
