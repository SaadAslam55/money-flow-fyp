// src/components/ui/mobile-form.tsx
/**
 * Mobile-Optimized Form Components
 * Provides touch-friendly form inputs with better UX on mobile devices
 */

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface MobileFormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Form field wrapper with mobile-optimized layout
 */
export function MobileFormField({
  label,
  id,
  error,
  required,
  description,
  className,
  children,
}: MobileFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-base sm:text-sm">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Mobile-friendly input with larger touch targets
 */
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

export function MobileInput({
  label,
  error,
  description,
  id,
  required,
  className,
  ...props
}: MobileInputProps) {
  const isMobile = useIsMobile();
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  if (!label) {
    return (
      <Input id={inputId} className={cn(isMobile && 'h-12 text-base', className)} {...props} />
    );
  }

  return (
    <MobileFormField
      label={label}
      id={inputId}
      error={error}
      required={required}
      description={description}
    >
      <Input id={inputId} className={cn(isMobile && 'h-12 text-base', className)} {...props} />
    </MobileFormField>
  );
}

/**
 * Mobile-friendly textarea
 */
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

export function MobileTextarea({
  label,
  error,
  description,
  id,
  required,
  className,
  ...props
}: MobileTextareaProps) {
  const isMobile = useIsMobile();
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  if (!label) {
    return (
      <Textarea
        id={textareaId}
        className={cn(isMobile && 'min-h-[120px] text-base', className)}
        {...props}
      />
    );
  }

  return (
    <MobileFormField
      label={label}
      id={textareaId}
      error={error}
      required={required}
      description={description}
    >
      <Textarea
        id={textareaId}
        className={cn(isMobile && 'min-h-[120px] text-base', className)}
        {...props}
      />
    </MobileFormField>
  );
}

/**
 * Mobile-optimized form actions (buttons)
 */
interface MobileFormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

export function MobileFormActions({
  children,
  className,
  align = 'right',
  sticky = false,
}: MobileFormActionsProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        'flex gap-3',
        {
          'justify-start': align === 'left',
          'justify-center': align === 'center',
          'justify-end': align === 'right',
        },
        isMobile && 'flex-col-reverse',
        sticky && isMobile && 'sticky bottom-0 border-t bg-background p-4 shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Mobile-optimized submit button
 */
interface MobileSubmitButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

export function MobileSubmitButton({
  loading,
  children,
  className,
  variant = 'default',
}: MobileSubmitButtonProps) {
  const isMobile = useIsMobile();

  return (
    <Button
      type="submit"
      disabled={loading}
      variant={variant}
      className={cn(isMobile && 'h-12 w-full text-base', className)}
    >
      {loading ? 'Loading...' : children}
    </Button>
  );
}

/**
 * Mobile form container
 */
interface MobileFormContainerProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export function MobileFormContainer({ children, onSubmit, className }: MobileFormContainerProps) {
  const isMobile = useIsMobile();

  return (
    <form onSubmit={onSubmit} className={cn('space-y-6', isMobile && 'space-y-8', className)}>
      {children}
    </form>
  );
}
