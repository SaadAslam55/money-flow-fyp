// src/components/common/SearchBar.tsx
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Current search value (controlled)
   */
  value?: string;
  /**
   * Default search value (uncontrolled)
   */
  defaultValue?: string;
  /**
   * Callback when search value changes
   */
  onSearch?: (value: string) => void;
  /**
   * Debounce delay in milliseconds (default: 300)
   */
  debounceMs?: number;
  /**
   * Show clear button
   */
  showClear?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Auto focus on mount
   */
  autoFocus?: boolean;
}

/**
 * Production-ready search bar component
 * Provides debounced search with clear functionality
 */
export function SearchBar({
  placeholder = 'Search...',
  value: controlledValue,
  defaultValue,
  onSearch,
  debounceMs = 300,
  showClear = true,
  className,
  disabled = false,
  autoFocus = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    if (onSearch && debouncedValue !== undefined) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    // Call onSearch immediately for controlled components
    if (onSearch && isControlled) {
      onSearch(newValue);
    }
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'pl-9 pr-9',
            showClear && value && 'pr-9'
          )}
        />
        {showClear && value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

