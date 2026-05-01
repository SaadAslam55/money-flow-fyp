// src/pages/UnauthorizedPage.tsx
/**
 * 403 Unauthorized Page
 * Displays when a user doesn't have permission to access a page
 * Provides user role information and quick links to accessible pages
 */

import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTemplate } from '@/components/common/PageTemplate';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { getRoleLabel } from '@/constants/roles';
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

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { userRole, hasPermission } = usePermissions();

  // Track 403 page view
  useEffect(() => {
    trackPageView('/403', 'Access Denied');
    trackUserAction('403_page_viewed', 'error', location.pathname);
  }, [location]);

  // Filter quick links based on permissions
  const availableQuickLinks = useMemo(() => {
    return QUICK_LINKS.filter((link) => {
      if (!link.permission) return true;
      return hasPermission(link.permission as any);
    }).slice(0, 4); // Limit to 4 links for better UI
  }, [hasPermission]);

  const handleGoHome = () => {
    trackUserAction('403_go_home_clicked', 'error', location.pathname);
    navigate('/dashboard', { replace: true });
  };

  const handleGoBack = () => {
    trackUserAction('403_go_back_clicked', 'error', location.pathname);
    navigate(-1);
  };

  const handleQuickLink = (path: string, label: string) => {
    trackUserAction('403_quick_link_clicked', 'error', `${location.pathname}_to_${path}_${label}`);
    navigate(path);
  };

  return (
    <PageTemplate
      title="Access Denied"
      description="You don't have permission to access this page"
      keywords="403, unauthorized, access denied, permission"
      showHeader={false}
      className="flex min-h-screen items-center justify-center"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-6xl font-bold">403</CardTitle>
          <CardDescription className="mt-2 text-lg">Access Denied</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground">
              You don't have permission to access this page. Please contact your administrator if
              you believe this is an error.
            </p>

            {/* User Role Information */}
            {user && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Your role:</span>
                <Badge variant="secondary" className="font-medium">
                  {getRoleLabel(userRole)}
                </Badge>
              </div>
            )}

            {/* Alert with helpful information */}
            <Alert className="mt-4 text-left">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                <p className="mb-1 font-medium">What you can do:</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Contact your administrator to request access</li>
                  <li>Navigate to pages you have permission to access</li>
                  <li>Check your role and permissions in settings</li>
                </ul>
              </AlertDescription>
            </Alert>
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
              <p className="mb-3 text-center text-sm font-medium">Pages You Can Access:</p>
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
