// src/components/ui/toast.tsx
import * as React from 'react';
import { Toaster as Sonner, toast } from 'sonner';
import { useUIStore } from '@/stores/uiStore';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  let { theme } = useUIStore();
  
  // Determine actual theme (system -> light/dark based on system preference)
  const resolvedTheme = React.useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }, [theme]);

  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
        duration: 4000,
      }}
      {...props}
    />
  );
};

// Re-export toast function from sonner for convenience
export { toast };
export { Toaster };

// Export types for better TypeScript support
// Note: sonner doesn't export these types, using ToasterProps instead
export type { ToasterProps } from 'sonner';

// Compatibility exports (if using shadcn/ui toast pattern)
export const Toast = Sonner;
export const ToastAction = (Sonner as any).Action;
export const ToastClose = (Sonner as any).Close;
export const ToastDescription = (Sonner as any).Description;
export const ToastProvider = Sonner;
export const ToastTitle = (Sonner as any).Title;
export const ToastViewport = (Sonner as any).Toaster;

// Hook for programmatic toast control
export function useToast() {
  return {
    toast: (props: any) => {
      return toast(props);
    },
  };
}
