// src/components/layout/AdminLayout.tsx
import { ReactNode } from 'react';
import { MainLayout } from './MainLayout';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * AdminLayout - Layout specifically for admin pages
 * Wrapper around MainLayout with admin-specific styling
 */
export function AdminLayout({ children, className }: AdminLayoutProps) {
  return (
    <MainLayout className={cn('bg-muted/30', className)}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </MainLayout>
  );
}

