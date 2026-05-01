// src/pages/settings/SettingsPage.tsx
/**
 * Settings Page
 * Main settings page with tabbed interface for managing business settings, team, integrations, and preferences
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTemplate } from '@/components/common/PageTemplate';
import { EmptyState } from '@/components/common/EmptyState';
import { BusinessProfile } from '@/components/settings/BusinessProfile';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { TaxSettings } from '@/components/settings/TaxSettings';
import { TeamManagement } from '@/components/settings/TeamManagement';
import { InvoiceSettings } from '@/components/settings/InvoiceSettings';
import { IntegrationSettings } from '@/components/settings/IntegrationSettings';
import { APISettings } from '@/components/settings/APISettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { PreferenceSettings } from '@/components/settings/PreferenceSettings';
import { AISettings } from '@/components/settings/AISettings';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import {
  Building2,
  Receipt,
  Users,
  FileText,
  Plug,
  Key,
  Bell,
  Settings,
  Shield,
  User,
  Sparkles,
} from 'lucide-react';

const SETTINGS_TABS = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    component: ProfileSettings,
    permission: 'business:settings',
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Sparkles,
    component: AISettings,
    permission: 'business:settings',
  },
  {
    id: 'business',
    label: 'Business',
    icon: Building2,
    component: BusinessProfile,
    permission: 'business:update_profile',
  },
  {
    id: 'tax',
    label: 'Tax',
    icon: Receipt,
    component: TaxSettings,
    permission: 'business:settings',
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    component: TeamManagement,
    permission: 'business:manage_team',
  },
  {
    id: 'invoice',
    label: 'Invoice',
    icon: FileText,
    component: InvoiceSettings,
    permission: 'business:settings',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    component: IntegrationSettings,
    permission: 'business:settings',
  },
  { id: 'api', label: 'API', icon: Key, component: APISettings, permission: 'business:settings' },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    component: NotificationSettings,
    permission: 'business:settings',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: Settings,
    component: PreferenceSettings,
    permission: 'business:settings',
  },
] as const;

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'business';

  // Track page view
  useEffect(() => {
    trackPageView('/settings', 'Settings');
  }, []);

  // Track tab changes
  useEffect(() => {
    if (activeTab) {
      trackUserAction('settings_tab_changed', 'settings', activeTab);
    }
  }, [activeTab]);

  // Check base permission
  if (!hasPermission('business:settings')) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to access settings"
      >
        <EmptyState
          icon={Shield}
          title="Access Denied"
          description="You need permission to access settings. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  const handleTabChange = (value: string) => {
    trackUserAction('settings_tab_clicked', 'settings', value);
    navigate(`/settings?tab=${value}`, { replace: true });
  };

  // Filter tabs based on permissions
  const availableTabs = SETTINGS_TABS.filter((tab) => hasPermission(tab.permission));

  // If no tabs are available, show empty state
  if (availableTabs.length === 0) {
    return (
      <PageTemplate
        title="Settings"
        description="Manage your business settings and preferences"
        keywords="settings, business settings, preferences, configuration"
      >
        <EmptyState
          icon={Shield}
          title="No Settings Available"
          description="You don't have permission to access any settings. Please contact your administrator."
        />
      </PageTemplate>
    );
  }

  // Ensure active tab is available, otherwise use first available tab
  const validActiveTab =
    availableTabs.find((tab) => tab.id === activeTab)?.id || availableTabs[0]!.id;

  return (
    <PageTemplate
      title="Settings"
      description="Manage your business settings and preferences"
      keywords="settings, business settings, preferences, configuration, team management, integrations"
    >
      <div className="space-y-6">
        <Tabs value={validActiveTab} onValueChange={handleTabChange} className="w-full">
          {/* Mobile: Horizontal scrollable tabs */}
          <div className="scrollbar-thin scrollbar-thumb-muted -mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
            <TabsList className="inline-flex h-auto min-w-max gap-1 bg-muted/50 p-1 md:grid md:w-full md:grid-cols-4 lg:grid-cols-8">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {availableTabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <Component />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </PageTemplate>
  );
}
