// src/components/layout/DashboardLayout.tsx
import { ReactNode } from 'react';
import { MainLayout } from './MainLayout';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * DashboardLayout - Layout specifically for dashboard pages
 * Wrapper around MainLayout with dashboard-specific styling
 */
export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <MainLayout className={className}>
      {children}
    </MainLayout>
  );
}

