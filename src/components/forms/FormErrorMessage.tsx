// src/components/forms/FormErrorMessage.tsx
/**
 * Form Error Message Component
 * Provides consistent error display for form fields
 */

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorMessageProps {
  error?: string | string[];
  className?: string;
  showIcon?: boolean;
}

/**
 * Display validation error messages for form fields
 */
export function FormErrorMessage({ error, className, showIcon = true }: FormErrorMessageProps) {
  if (!error) return null;

  const errors = Array.isArray(error) ? error : [error];

  return (
    <div className={cn('space-y-1', className)}>
      {errors.map((err, index) => (
        <div key={index} className="flex items-start gap-1.5 text-sm text-destructive">
          {showIcon && <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
          <span>{err}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Inline field error (compact version)
 */
export function FieldError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {error}
    </p>
  );
}

/**
 * Form-level error summary
 */
export function FormErrorSummary({ errors }: { errors: Record<string, string | string[]> }) {
  const errorEntries = Object.entries(errors).filter(([_, value]) => value);

  if (errorEntries.length === 0) return null;

  return (
    <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-destructive">Please fix the following errors:</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-destructive/90">
            {errorEntries.map(([field, error]) => {
              const errorMessages = Array.isArray(error) ? error : [error];
              return errorMessages.map((msg, index) => (
                <li key={`${field}-${index}`}>
                  <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {msg}
                </li>
              ));
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
