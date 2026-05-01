// src/pages/subscription/ManageSubscriptionPage.tsx
/**
 * Manage Subscription Page
 * Page for managing subscription settings, viewing usage, billing history, and payment methods
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { CurrentPlanCard } from '@/components/subscription/CurrentPlanCard';
import { UsageLimits } from '@/components/subscription/UsageLimits';
import { BillingHistory } from '@/components/subscription/BillingHistory';
import { PaymentMethod } from '@/components/subscription/PaymentMethod';
import { CancelSubscriptionDialog } from '@/components/subscription/CancelSubscriptionDialog';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { formatDate } from '@/lib/formatters';
import { SUBSCRIPTION_PLANS } from '@/constants/status';
import { ROUTE_PATHS } from '@/config/routes.config';

export default function ManageSubscriptionPage() {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const { subscription, isLoading, refetch } = useSubscription();
  const { hasPermission } = usePermissions();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const currentPlan = subscription?.plan ?? organization?.subscription_plan ?? 'free';
  const planDetails = SUBSCRIPTION_PLANS[currentPlan];

  const canManage = hasPermission('business:settings');

  // Track page view
  useEffect(() => {
    trackPageView(ROUTE_PATHS.SUBSCRIPTION.MANAGE, 'Manage Subscription');
  }, []);

  if (isLoading) {
    return (
      <PageTemplate title="Manage Subscription" description="Manage your subscription and billing">
        <Loader message="Loading subscription details..." />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Manage Subscription"
      description="Manage your subscription and billing"
      keywords="subscription, billing, payment, plan"
      actions={
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION.BASE)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Current Plan Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CurrentPlanCard />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Status</p>
                <StatusBadge
                  status={
                    subscription?.status === 'active' ||
                    organization?.subscription_status === 'active'
                      ? 'active'
                      : subscription?.status === 'cancelled' ||
                          organization?.subscription_status === 'cancelled'
                        ? 'inactive'
                        : 'pending'
                  }
                  type="subscription"
                  label={subscription?.status ?? organization?.subscription_status ?? 'active'}
                />
              </div>
              {subscription?.current_period_start && subscription.current_period_start && (
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Current Period</p>
                  <p className="text-sm font-medium">
                    {formatDate(subscription.current_period_start, 'medium')} -{' '}
                    {subscription?.current_period_end
                      ? formatDate(subscription.current_period_end, 'medium')
                      : 'N/A'}
                  </p>
                </div>
              )}
              {subscription?.cancel_at_period_end && subscription.cancel_at_period_end && (
                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Subscription will cancel at the end of the billing period
                  </p>
                </div>
              )}
              {subscription?.trial_end && new Date(subscription.trial_end) > new Date() && (
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Trial Ends</p>
                  <p className="text-sm font-medium">
                    {formatDate(subscription.trial_end, 'medium')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <UsageLimits />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <BillingHistory organizationId={organization?.id} />
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <PaymentMethod />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Actions</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              {canManage && currentPlan !== 'enterprise' && (
                <Button
                  onClick={() => {
                    trackUserAction('upgrade_plan_clicked', 'subscription', 'manage_page');
                    navigate(`${ROUTE_PATHS.SUBSCRIPTION.BASE}?upgrade=true`);
                  }}
                  className="flex-1"
                >
                  Upgrade Plan
                </Button>
              )}
              {canManage && currentPlan !== 'free' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      trackUserAction('change_plan_clicked', 'subscription', 'manage_page');
                      navigate(ROUTE_PATHS.SUBSCRIPTION.BASE);
                    }}
                    className="flex-1"
                  >
                    Change Plan
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      trackUserAction('cancel_subscription_clicked', 'subscription', 'manage_page');
                      setShowCancelDialog(true);
                    }}
                    className="flex-1"
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CancelSubscriptionDialog open={showCancelDialog} onOpenChange={setShowCancelDialog} />
    </PageTemplate>
  );
}
