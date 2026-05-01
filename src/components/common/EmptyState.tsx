// src/components/common/EmptyState.tsx
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon?: LucideIcon;
  /**
   * Title text
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Action button
   */
  action?: React.ReactNode | {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  /**
   * Custom className
   */
  className?: string;
  /**
   * Custom content to render
   */
  children?: React.ReactNode;
  /**
   * SVG illustration to display above icon
   */
  illustration?: React.ReactNode;
  /**
   * Compact variant for inline empty states
   */
  compact?: boolean;
}

/**
 * Production-ready empty state component
 * Provides consistent empty states across the application
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
  illustration,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-6 px-4' : 'py-12 px-4',
        className
      )}
    >
      {illustration && (
        <div className={cn('mb-4', compact ? 'h-24 w-24' : 'h-32 w-32')}>
          {illustration}
        </div>
      )}

      {Icon && !illustration && (
        <div className={cn(
          'mb-4 flex items-center justify-center rounded-full bg-muted',
          compact ? 'h-10 w-10' : 'h-16 w-16'
        )}>
          <Icon className={cn('text-muted-foreground', compact ? 'h-5 w-5' : 'h-8 w-8')} />
        </div>
      )}

      <h3 className={cn('font-semibold', compact ? 'text-base mb-1' : 'text-lg mb-2')}>
        {title}
      </h3>

      {description && (
        <p className={cn('max-w-sm text-muted-foreground', compact ? 'text-xs mb-3' : 'text-sm mb-6')}>
          {description}
        </p>
      )}

      {children}

      {action && typeof action === 'object' && 'onClick' in action && (
        <Button onClick={action.onClick} variant={action.variant ?? 'default'} size={compact ? 'sm' : 'default'}>
          {action.label}
        </Button>
      )}
      {action && typeof action !== 'object' && action}
    </div>
  );
}

