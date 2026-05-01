// src/components/ui/adaptive-dialog.tsx
/**
 * Adaptive Dialog Component
 * Renders as full-screen on mobile, dialog on desktop
 */

import { useIsMobile } from '@/hooks/useBreakpoint';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface AdaptiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Dialog that adapts to screen size
 */
export function AdaptiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = 'md',
}: AdaptiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        {open && (
          <div className="fixed inset-0 z-50 bg-background">
            {/* Mobile Header */}
            <div className="flex h-14 items-center justify-between border-b px-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-2 hover:bg-accent"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Content */}
            <div className="h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
              {description && <p className="mb-4 text-sm text-muted-foreground">{description}</p>}
              {children}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          {
            'max-w-md': size === 'sm',
            'max-w-lg': size === 'md',
            'max-w-2xl': size === 'lg',
            'max-w-4xl': size === 'xl',
            'max-w-full': size === 'full',
          },
          className
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Adaptive sheet (bottom drawer on mobile, side sheet on desktop)
 */
interface AdaptiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'bottom';
}

export function AdaptiveSheet({
  open,
  onOpenChange,
  title,
  children,
  side = 'right',
}: AdaptiveSheetProps) {
  const isMobile = useIsMobile();

  if (!open) return null;

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />

        {/* Bottom Sheet */}
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background shadow-xl">
          <div className="sticky top-0 border-b bg-background px-4 py-3">
            <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-muted" />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-2 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />

      {/* Side Sheet */}
      <div
        className={cn('fixed z-50 h-full w-96 overflow-y-auto bg-background shadow-xl', {
          'left-0 top-0': side === 'left',
          'right-0 top-0': side === 'right',
          'bottom-0 left-0 right-0 h-auto max-h-[85vh] rounded-t-2xl': side === 'bottom',
        })}
      >
        <div className="sticky top-0 border-b bg-background px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={() => onOpenChange(false)} className="rounded-lg p-2 hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}
