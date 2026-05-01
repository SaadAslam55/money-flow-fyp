// src/pages/admin/AdminPage.tsx
/**
 * Admin Page
 * System administration interface for super admins
 * Manages organizations, users, subscriptions, audit logs, and system settings
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { OrganizationsList } from '@/components/admin/OrganizationsList';
import { OrganizationDetails } from '@/components/admin/OrganizationDetails';
import { AuditLogs } from '@/components/admin/AuditLogs';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';
import { SupportTickets } from '@/components/admin/SupportTickets';
import { UserManagement } from '@/components/admin/UserManagement';
import { RoleManagement } from '@/components/admin/RoleManagement';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { requireRole } from '@/middleware/authMiddleware';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
  CreditCard,
  MessageSquare,
  Shield,
  Key,
} from 'lucide-react';

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: Key },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', icon: MessageSquare },
] as const;

type AdminTab = (typeof ADMIN_TABS)[number]['id'];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Track page view
  useEffect(() => {
    trackPageView('/admin', 'System Administration');
  }, []);

  // Check if user has admin access
  useEffect(() => {
    if (!authLoading && user) {
      try {
        requireRole(user, ['super_admin']);
      } catch (error) {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Determine active tab from URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as AdminTab;
    if (tabFromUrl && ADMIN_TABS.some((t) => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (location.pathname.includes('/organizations/')) {
      // Organization details view
      setActiveTab('organizations');
    } else {
      // Default to overview
      setActiveTab('overview');
    }
  }, [location.pathname, searchParams]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    const newTab = value as AdminTab;
    setActiveTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <PageTemplate title="System Administration" description="Loading..." loading={true}>
        <Loader message="Checking permissions..." />
      </PageTemplate>
    );
  }

  // Check permission
  if (!user || !hasPermission('system:view_all_businesses')) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to access this page"
      >
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need super admin privileges to access the system administration panel."
        />
      </PageTemplate>
    );
  }

  // Check if we're viewing organization details
  if (params.id && location.pathname.includes('/organizations/')) {
    return (
      <PageTemplate
        title="Organization Details"
        description="View and manage organization details"
        keywords="admin, organization, management"
      >
        <OrganizationDetails />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="System Administration"
      description="Manage the entire platform, organizations, and users"
      keywords="admin, system administration, platform management, organizations, users"
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <OrganizationsList />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditLogs />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <SubscriptionManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
