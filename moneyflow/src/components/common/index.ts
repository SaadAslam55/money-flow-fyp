// src/components/common/index.ts
/**
 * Common Components - Production-ready reusable components
 *
 * This module exports all common components for easy importing:
 *
 * @example
 * import { Loader, EmptyState, StatusBadge } from '@/components/common';
 */

export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export { PageTemplate } from './PageTemplate';
export { ConfirmDialog } from './ConfirmDialog';
export { ProtectedRoute } from './ProtectedRoute';
export { Loader } from './Loader';
export { EmptyState } from './EmptyState';
export { StatusBadge } from './StatusBadge';
export { CurrencyDisplay } from './CurrencyDisplay';
export { SearchBar } from './SearchBar';

// Phase 5: Animation Components
export { AnimatedCard } from './AnimatedCard';
export { AnimatedButton } from './AnimatedButton';
export { AnimatedList, AnimatedListItem } from './AnimatedList';
export { PageTransition } from './PageTransition';
export { FadeIn } from './FadeIn';
export { SuccessAnimation, ErrorAnimation } from './SuccessAnimation';
export {
  SkeletonLoader,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonStats,
} from './SkeletonLoader';

export type { PageTemplateProps } from './PageTemplate';
