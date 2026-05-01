// src/components/ui/calendar.tsx
/**
 * Calendar Component
 *
 * Note: This is a basic calendar component. For full date picker functionality,
 * install react-day-picker: npm install react-day-picker
 *
 * For now, this provides a simple date input wrapper that can be enhanced later.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export interface CalendarProps {
  /**
   * Calendar mode - 'single' for single date, 'range' for date range
   * Note: Range mode requires react-day-picker for full implementation
   */
  mode?: 'single' | 'range';
  /**
   * Callback when date changes
   */
  onSelect?: (date: Date | undefined) => void;
  value?: Date | string;
  className?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

/**
 * Basic Calendar/DatePicker component
 *
 * This is a simplified version that uses native date input.
 * For advanced features (date ranges, custom styling, etc.),
 * install and use react-day-picker.
 */
const Calendar = React.forwardRef<HTMLInputElement, CalendarProps>(
  ({ className, mode = 'single', onSelect, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value ? new Date(e.target.value) : undefined;
      onSelect?.(date);
      props.onChange?.(e);
    };

    // Convert Date object to YYYY-MM-DD format for input
    const dateValue =
      value instanceof Date
        ? value.toISOString().split('T')[0]
        : typeof value === 'string'
          ? value
          : '';

    return (
      <Input
        ref={ref}
        type="date"
        className={cn('w-full', className)}
        value={dateValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Calendar.displayName = 'Calendar';

export { Calendar };
