// src/pages/subscription/SuccessPage.tsx
/**
 * Subscription Success Page
 * Displays success message after successful subscription payment and verifies the payment session
 */

import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTemplate } from '@/components/common/PageTemplate';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { useSubscription } from '@/hooks/useSubscription';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { verifyCheckoutSession } from '@/services/payments/checkout';
import { toast } from 'sonner';
import { ROUTE_PATHS } from '@/config/routes.config';

export default function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetch } = useSubscription();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  // Track page view
  useEffect(() => {
    trackPageView(ROUTE_PATHS.SUBSCRIPTION.SUCCESS, 'Subscription Success');
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsVerifying(false);
        trackUserAction('verification_failed', 'subscription', 'no_session_id');
        return;
      }

      try {
        setIsVerifying(true);
        trackUserAction('verification_started', 'subscription', sessionId);
        const { valid, error: verifyError } = await verifyCheckoutSession(sessionId);

        if (verifyError || !valid) {
          throw verifyError || new Error('Session verification failed');
        }

        setIsVerified(true);
        trackUserAction('verification_success', 'subscription', sessionId);
        toast.success('Subscription activated successfully');

        // Refetch subscription data to get latest status
        await refetch();
      } catch (err) {

        logger.error('Session verification error:', err instanceof Error ? err.message : String(err));
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify session';
        setError(errorMessage);
        trackUserAction('verification_failed', 'subscription', errorMessage);
        toast.error('Failed to verify payment session');
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [sessionId, refetch]);

  return (
    <PageTemplate
      title="Subscription Successful"
      description="Your subscription has been activated"
      showHeader={false}
      className="min-h-screen flex items-center justify-center"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="mt-2">
            Your subscription has been activated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerifying ? (
            <Loader message="Verifying your payment..." />
          ) : error ? (
            <EmptyState
              icon={AlertCircle}
              title="Verification Failed"
              description={error}
            />
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Thank you for subscribing to Money Flow. You now have access to all premium
                  features.
                </p>
                {sessionId && (
                  <p className="text-xs text-muted-foreground">
                    Session ID: {sessionId.substring(0, 20)}...
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button
                  onClick={() => {
                    trackUserAction('go_to_dashboard_clicked', 'subscription', 'success_page');
                    navigate('/dashboard');
                  }}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    trackUserAction('manage_subscription_clicked', 'subscription', 'success_page');
                    navigate(ROUTE_PATHS.SUBSCRIPTION.MANAGE);
                  }}
                  className="w-full"
                >
                  Manage Subscription
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}

