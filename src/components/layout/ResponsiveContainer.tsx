// src/components/layout/ResponsiveContainer.tsx
/**
 * Responsive Container Component
 * Provides consistent container widths and padding across breakpoints
 */

import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
}

/**
 * Container with responsive max-width and padding
 */
export function ResponsiveContainer({
  children,
  className,
  size = 'xl',
  padding = 'md',
  center = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        {
          'max-w-3xl': size === 'sm',
          'max-w-5xl': size === 'md',
          'max-w-6xl': size === 'lg',
          'max-w-7xl': size === 'xl',
          'max-w-full': size === 'full',
        },
        {
          'px-0': padding === 'none',
          'px-4 sm:px-6': padding === 'sm',
          'px-4 sm:px-6 lg:px-8': padding === 'md',
          'px-6 sm:px-8 lg:px-12': padding === 'lg',
        },
        {
          'mx-auto': center,
        },
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Responsive grid layout
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid',
        {
          'gap-0': gap === 'none',
          'gap-2': gap === 'sm',
          'gap-4': gap === 'md',
          'gap-6': gap === 'lg',
          'gap-8': gap === 'xl',
        },
        {
          [`grid-cols-${cols.xs}`]: cols.xs,
          [`sm:grid-cols-${cols.sm}`]: cols.sm,
          [`md:grid-cols-${cols.md}`]: cols.md,
          [`lg:grid-cols-${cols.lg}`]: cols.lg,
          [`xl:grid-cols-${cols.xl}`]: cols.xl,
          [`2xl:grid-cols-${cols['2xl']}`]: cols['2xl'],
        },
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Responsive flex layout
 */
interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveFlex({
  children,
  className,
  direction = 'row',
  wrap = false,
  align = 'start',
  justify = 'start',
  gap = 'md',
}: ResponsiveFlexProps) {
  return (
    <div
      className={cn(
        'flex',
        {
          'flex-row': direction === 'row',
          'flex-col': direction === 'col',
        },
        {
          'flex-wrap': wrap,
        },
        {
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
        },
        {
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end',
          'justify-between': justify === 'between',
          'justify-around': justify === 'around',
        },
        {
          'gap-0': gap === 'none',
          'gap-2': gap === 'sm',
          'gap-4': gap === 'md',
          'gap-6': gap === 'lg',
          'gap-8': gap === 'xl',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stack layout with responsive spacing
 */
interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  divider?: boolean;
}

export function Stack({ children, className, spacing = 'md', divider = false }: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        {
          'space-y-0': spacing === 'none',
          'space-y-2': spacing === 'sm',
          'space-y-4': spacing === 'md',
          'space-y-6': spacing === 'lg',
          'space-y-8': spacing === 'xl',
        },
        {
          'divide-y divide-border': divider,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
