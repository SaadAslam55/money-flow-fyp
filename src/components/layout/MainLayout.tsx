// src/components/layout/MainLayout.tsx
import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showNavbar?: boolean;
  className?: string;
}

/**
 * MainLayout - Main application layout with sidebar and navbar
 * Used for all authenticated pages
 */
export function MainLayout({
  children,
  showSidebar = true,
  showNavbar = true,
  className,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <>
          <Sidebar />
          {/* Sidebar backdrop for mobile (if needed) */}
          <div
            className={cn(
              'fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden',
              sidebarOpen ? 'block' : 'hidden'
            )}
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          showSidebar && 'lg:pl-64'
        )}
      >
        {/* Navbar */}
        {showNavbar && (
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        )}

        {/* Page Content */}
        <main
          className={cn(
            'flex-1 p-4 lg:p-6',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

