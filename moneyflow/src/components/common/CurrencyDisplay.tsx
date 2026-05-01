// src/components/common/CurrencyDisplay.tsx
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  /**
   * Amount to display
   */
  amount: number;
  /**
   * Currency code (default: PKR)
   */
  currency?: string;
  /**
   * Locale for formatting (default: en-PK)
   */
  locale?: string;
  /**
   * Show currency symbol
   */
  showSymbol?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Color variant
   */
  variant?: 'default' | 'positive' | 'negative' | 'muted';
  /**
   * Show as compact number (e.g., 1.5K)
   */
  compact?: boolean;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl font-semibold',
};

const variantClasses = {
  default: 'text-foreground',
  positive: 'text-green-600 dark:text-green-400',
  negative: 'text-red-600 dark:text-red-400',
  muted: 'text-muted-foreground',
};

/**
 * Production-ready currency display component
 * Formats and displays currency amounts consistently
 */
export function CurrencyDisplay({
  amount,
  currency = 'PKR',
  locale = 'en-PK',
  showSymbol = true,
  className,
  size = 'md',
  variant = 'default',
  compact = false,
}: CurrencyDisplayProps) {
  const formatted = showSymbol
    ? formatCurrency(amount, currency, locale)
    : amount.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  return (
    <span
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        'font-medium tabular-nums',
        className
      )}
    >
      {formatted}
    </span>
  );
}

