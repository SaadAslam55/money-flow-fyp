// src/components/common/PageTransition.tsx
/**
 * Page Transition Component - Phase 5: UI/UX Polish
 * Wraps page content with smooth enter/exit animations
 */

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { PAGE_TRANSITIONS } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slide' | 'scale';
}

export function PageTransition({ children, variant = 'fade' }: PageTransitionProps) {
  const location = useLocation();
  const animation = PAGE_TRANSITIONS[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={animation.initial}
        animate={animation.animate}
        exit={animation.exit}
        transition={animation.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;
