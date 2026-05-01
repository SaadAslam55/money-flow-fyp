import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationStore } from '@/stores/navigationStore';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileDrawer } from './MobileDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileActionSheet } from './MobileActionSheet';
import { MobileSearchOverlay } from './MobileSearchOverlay';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { breakpoints } from '@/design-system/tokens/breakpoints';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const location = useLocation();
  const { sidebarCollapsed, closeAllMobileMenus } = useNavigationStore();

  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md})`);

  // Close mobile menus on route change
  useEffect(() => {
    closeAllMobileMenus();
  }, [location.pathname, closeAllMobileMenus]);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'bg-sidebar fixed inset-y-0 left-0 z-30 hidden border-r transition-all duration-300 ease-in-out lg:block',
          sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out',
          isDesktop ? (sidebarCollapsed ? 'ml-[72px]' : 'ml-[280px]') : 'ml-0',
          // Add bottom padding for mobile nav
          isMobile && 'pb-16'
        )}
      >
        {/* Header */}
        <Navbar />

        {/* Content */}
        <main className={cn('flex-1 overflow-x-hidden p-4 lg:p-6', className)}>{children}</main>
      </div>

      {/* Mobile Overlays */}
      <MobileDrawer />
      <MobileActionSheet />
      <MobileSearchOverlay />

      {/* Mobile Bottom Nav */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
