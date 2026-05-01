// src/pages/subscription/CheckoutPage.tsx
/**
 * Checkout Page
 * Page for completing subscription checkout with payment provider selection
 */

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { usePermissions } from '@/hooks/usePermissions';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { SUBSCRIPTION_PLANS } from '@/constants/status';
import { redirectToCheckout } from '@/services/payments/checkout';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organization, user } = useAuth();
  const { isLoading } = useSubscription();
  const { hasPermission } = usePermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  const planId = (searchParams.get('plan') || 'pro') as 'free' | 'pro' | 'enterprise';
  const selectedPlan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.pro;

  const canUpgrade = hasPermission('business:settings');

  // Track page view
  useEffect(() => {
    trackPageView('/subscription/checkout', 'Subscription Checkout');
  }, [planId]);

  // Check permission
  if (!canUpgrade) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to upgrade subscription"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need permission to upgrade your subscription. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }

  const handleCheckout = async () => {
    if (!organization?.id || !user?.id) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      toast.info('You are already on the free plan');
      navigate('/subscription');
      return;
    }

    try {
      setIsProcessing(true);
      trackUserAction('checkout_initiated', 'subscription', planId);

      // Default to JazzCash, but can be made configurable
      const { error } = await redirectToCheckout(planId, organization.id, 'jazzcash');

      if (error) {
        trackUserAction('checkout_failed', 'subscription', planId);
        throw error;
      }

      trackUserAction('checkout_redirected', 'subscription', planId);
      // Redirect will happen automatically via payment provider
    } catch (error) {

      logger.error('Checkout error:', error instanceof Error ? error.message : String(error));
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
      setIsProcessing(false);
    }
  };

  return (
    <PageTemplate
      title="Checkout"
      description="Complete your subscription"
      keywords="checkout, subscription, payment"
      loading={isLoading}
      actions={
        <Button variant="ghost" size="icon" onClick={() => navigate('/subscription')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {isLoading ? (
          <Loader message="Loading checkout details..." />
        ) : (
          <>
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedPlan?.name ?? ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan?.description ?? ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={selectedPlan?.price ?? 0} size="lg" />
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Total</p>
                    <div className="text-right">
                      <CurrencyDisplay amount={selectedPlan?.price ?? 0} size="xl" />
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  You will be redirected to complete your payment securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your payment will be processed securely. You'll be redirected to complete the
                    checkout using JazzCash, EasyPaisa, or Raast.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <p className="text-sm font-medium">What's included:</p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {(selectedPlan?.features?.slice(0, 5) || []).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="mt-6 w-full"
                  onClick={handleCheckout}
                  size="lg"
                  disabled={isProcessing || !organization || !user}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By continuing, you agree to our terms of service and privacy policy
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageTemplate>
  );
}
