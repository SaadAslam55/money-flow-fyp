// src/components/subscription/CurrentPlanCard.tsx
import { CheckCircle2, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '@/constants/status';
import { Loader } from '@/components/common/Loader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { useNavigate } from 'react-router-dom';

/**
 * Component for displaying current subscription plan
 */
export function CurrentPlanCard() {
  const { organization } = useAuth();
  const { subscription, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription plan details</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader message="Loading plan information..." />
        </CardContent>
      </Card>
    );
  }

  const currentPlan = ((subscription as any)?.plan || organization?.subscription_plan) ?? 'free';
  const planDetails = SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS];

  const getPlanIcon = () => {
    switch (currentPlan) {
      case 'enterprise':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'pro':
        return <Zap className="h-6 w-6 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPlanIcon()}
            <div>
              <CardTitle className="text-2xl">{planDetails?.name ?? 'Free'} Plan</CardTitle>
              <CardDescription>
                {planDetails?.description ?? 'Basic plan features'}
              </CardDescription>
            </div>
          </div>
          <StatusBadge
            status={(subscription as any)?.status === 'active' ? 'active' : 'inactive'}
            type="custom"
            label={(subscription as any)?.status === 'active' ? 'Active' : (subscription as any)?.status ?? 'Active'}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            {planDetails && (
              <>
                <CurrencyDisplay amount={planDetails.price} currency={planDetails.currency} size="xl" />
                <span className="text-muted-foreground">/{planDetails.interval}</span>
              </>
            )}
          </div>
          {currentPlan === 'free' && (
            <p className="text-sm text-muted-foreground mt-1">Forever free</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">What's included:</p>
          <ul className="space-y-1.5">
            {planDetails?.features.slice(0, 6).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {currentPlan !== 'enterprise' && (
          <Button
            className="w-full"
            onClick={() => navigate('/subscription?upgrade=true')}
          >
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

