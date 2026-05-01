// src/pages/NotFoundPage.tsx
/**
 * 404 Not Found Page
 * Displays when a route doesn't exist or has been moved
 * Provides navigation options and quick links to help users find what they're looking for
 */

import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileQuestion,
  Home,
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowRightLeft,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTemplate } from '@/components/common/PageTemplate';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import type { LucideIcon } from 'lucide-react';

interface QuickLink {
  path: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
}

const QUICK_LINKS: QuickLink[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/invoices', label: 'Invoices', icon: FileText, permission: 'financial:create_invoices' },
  { path: '/customers', label: 'Customers', icon: Users, permission: 'customers:view_all' },
  { path: '/products', label: 'Products', icon: Package, permission: 'inventory:view_products' },
  {
    path: '/transactions',
    label: 'Transactions',
    icon: ArrowRightLeft,
    permission: 'financial:create_transactions',
  },
  { path: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports:view_basic' },
  { path: '/settings', label: 'Settings', icon: Settings, permission: 'business:settings' },
];

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();

  // Track 404 page view
  useEffect(() => {
    trackPageView('/404', 'Page Not Found');
    trackUserAction('404_page_viewed', 'error', location.pathname);
  }, [location]);

  // Filter quick links based on permissions
  const availableQuickLinks = useMemo(() => {
    return QUICK_LINKS.filter((link) => {
      if (!link.permission) return true;
      return hasPermission(link.permission as any);
    }).slice(0, 4); // Limit to 4 links for better UI
  }, [hasPermission]);

  const handleGoHome = () => {
    trackUserAction('404_go_home_clicked', 'error', location.pathname);
    navigate('/dashboard', { replace: true });
  };

  const handleGoBack = () => {
    trackUserAction('404_go_back_clicked', 'error', location.pathname);
    navigate(-1);
  };

  const handleQuickLink = (path: string, label: string) => {
    trackUserAction('404_quick_link_clicked', 'error', `${location.pathname}_to_${path}_${label}`);
    navigate(path);
  };

  return (
    <PageTemplate
      title="Page Not Found - 404"
      description="The page you're looking for doesn't exist or has been moved"
      keywords="404, page not found, error, navigation"
      showHeader={false}
      className="flex min-h-screen items-center justify-center"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-6xl font-bold">404</CardTitle>
          <CardDescription className="mt-2 text-lg">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check the URL or navigate using the menu.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-2 pt-4 sm:flex-row">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={handleGoHome}>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          {/* Quick Links */}
          {availableQuickLinks.length > 0 && (
            <div className="border-t pt-6">
              <p className="mb-3 text-center text-sm font-medium">Quick Links:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {availableQuickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.path}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickLink(link.path, link.label)}
                      className="justify-start"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
