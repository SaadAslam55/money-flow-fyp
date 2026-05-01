// src/pages/subscription/SubscriptionPage.tsx
/**
 * Subscription Page
 * Displays available subscription plans and allows users to select and upgrade their plan
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Check } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { SUBSCRIPTION_PLANS } from '@/constants/status';
import { ROUTE_PATHS } from '@/config/routes.config';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { subscription, isLoading } = useSubscription();
  const { hasPermission } = usePermissions();

  // Track page view
  useEffect(() => {
    trackPageView(ROUTE_PATHS.SUBSCRIPTION.BASE, 'Subscription Plans');
  }, []);

  // Get plans from constants
  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
    id: id as 'free' | 'pro' | 'enterprise',
    name: plan.name,
    price: plan.price,
    description: plan.description,
    features: plan.features,
  }));

  const canUpgrade = hasPermission('business:settings');

  if (isLoading) {
    return (
      <PageTemplate
        title="Subscription"
        description="Choose the perfect plan for your business"
        keywords="subscription, pricing, plans, billing"
      >
        <Loader message="Loading subscription plans..." />
      </PageTemplate>
    );
  }

  const currentPlanId = subscription?.plan ?? 'free';
  const isCurrentPlan = (planId: string) => currentPlanId === planId;

  const handlePlanSelect = (planId: string) => {
    trackUserAction('select_plan_clicked', 'subscription', planId);
    if (isCurrentPlan(planId)) {
      navigate(ROUTE_PATHS.SUBSCRIPTION.MANAGE);
    } else {
      navigate(`${ROUTE_PATHS.SUBSCRIPTION.CHECKOUT}?plan=${planId}`);
    }
  };

  return (
    <PageTemplate
      title="Subscription Plans"
      description="Choose the perfect plan for your business"
      keywords="subscription, pricing, plans, billing, upgrade"
    >
      <div className="space-y-6">
        {/* Current Plan */}
        {subscription?.plan && (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="capitalize">{subscription?.plan}</span>
                <StatusBadge
                  status={
                    subscription.status === 'active'
                      ? 'active'
                      : subscription.status === 'cancelled'
                        ? 'inactive'
                        : 'pending'
                  }
                  type="subscription"
                  label={subscription.status}
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {subscription?.current_period_end
                  ? `Next billing date: ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : 'No upcoming billing date'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const planDetails = SUBSCRIPTION_PLANS[plan.id];
            const isCurrent = isCurrentPlan(plan.id);
            const isRecommended = plan.id === 'pro';

            return (
              <Card
                key={plan.id}
                className={
                  isRecommended
                    ? 'relative border-2 border-primary'
                    : isCurrent
                      ? 'border-2 border-green-500'
                      : ''
                }
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Recommended
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <CurrencyDisplay amount={plan.price} size="xl" />
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : isRecommended ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={!canUpgrade && !isCurrent}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageTemplate>
  );
}
