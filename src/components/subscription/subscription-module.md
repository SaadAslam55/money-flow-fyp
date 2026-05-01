Subscription Module
📖 Overview
The Subscription Module manages billing, plan upgrades/downgrades, and feature access control using Stripe for payment processing.
🎯 Module Objectives

Manage subscription plans (Free, Pro, Enterprise)
Handle Stripe payment processing
Enforce usage limits per plan
Process subscription webhooks
Manage billing history
Handle plan upgrades/downgrades
Provide trial periods
Send payment notifications

👥 User Roles Involved
RoleAccess LevelPermissionsSuper AdminFull AccessView all subscriptions, override limitsAdminManage OwnUpgrade/downgrade, view billingManagerView OnlyView current plan detailsOther RolesNo AccessCannot access subscription settings
🏗️ Architecture
Subscription Flow:
┌──────────────┐ ┌───────────────┐ ┌──────────────┐
│ Plan │────▶│ Stripe │────▶│ Webhook │
│ Selection │ │ Checkout │ │ Handler │
└──────────────┘ └───────────────┘ └──────────────┘
│ │ │
▼ ▼ ▼
Create Session Process Payment Update Database
Redirect User Generate Invoice Grant Features
Send Receipt Update Limits
📁 File Structure
src/
├── components/subscription/
│ ├── PricingPlans.tsx ✅ Plan comparison cards
│ ├── CurrentPlanCard.tsx ✅ Active subscription display
│ ├── UpgradePrompt.tsx ✅ Upgrade CTA component
│ ├── UsageLimits.tsx ✅ Usage tracking display
│ ├── BillingHistory.tsx ⬜ Invoice history table
│ ├── PaymentMethod.tsx ⬜ Card management
│ └── CancelSubscriptionDialog.tsx ⬜ Cancellation flow
│
├── pages/subscription/
│ ├── PricingPage.tsx ✅ Public pricing page
│ ├── CheckoutPage.tsx ⬜ Stripe checkout page
│ ├── SuccessPage.tsx ⬜ Payment success page
│ └── ManageSubscriptionPage.tsx ⬜ Subscription management
│
├── services/
│ ├── stripe/
│ │ ├── checkout.ts ✅ Create checkout sessions
│ │ ├── webhooks.ts ✅ Handle Stripe events
│ │ ├── subscriptions.ts ✅ Subscription management
│ │ └── invoices.ts ⬜ Invoice retrieval
│ │
│ └── api/
│ └── subscriptionApi.ts ✅ Subscription CRUD
│
├── hooks/
│ ├── useSubscription.ts ✅ Subscription state
│ ├── useUsageLimits.ts ✅ Usage tracking
│ └── useBillingHistory.ts ⬜ Invoice history
│
├── lib/
│ └── stripe.ts ✅ Stripe client setup
│
└── types/
└── subscription.types.ts ✅ Subscription types
✅ Implementation Checklist
Phase 1: Stripe Setup ✅

Stripe account configuration
API key management
Product/price setup in Stripe
Webhook endpoint configuration
Test mode setup

Phase 2: Plan Definition ✅

Free plan definition
Pro plan definition
Enterprise plan definition
Feature matrix
Usage limits configuration
Pricing display

Phase 3: Checkout Flow ✅

Create checkout session
Redirect to Stripe
Handle success callback
Handle cancellation
Trial period logic

Phase 4: Webhook Processing ✅

Webhook signature verification
Payment success handler
Subscription created handler
Subscription updated handler
Subscription deleted handler
Invoice payment failed handler

Phase 5: Usage Enforcement ✅

Check limits on operations
Display usage warnings
Block over-limit actions
Upgrade prompts

Phase 6: Management Features ⬜

Change payment method
Cancel subscription
Resume subscription
View billing history
Download invoices
Update billing details

🔑 Key Features

1. Plan Configuration
   typescript// src/constants/status.ts
   export const SUBSCRIPTION_PLANS = {
   free: {
   name: 'Free',
   price: 0,
   interval: 'month',
   features: [
   '1 user',
   '50 invoices per month',
   '100 customers',
   '50 products',
   'Basic reports',
   'Email support',
   ],
   limits: {
   users: 1,
   invoices_per_month: 50,
   customers: 100,
   products: 50,
   },
   features_access: {
   inventory: false,
   multi_branch: false,
   api_access: false,
   advanced_reports: false,
   custom_branding: false,
   },
   },
   pro: {
   name: 'Pro',
   price: 15,
   interval: 'month',
   stripe_price_id: 'price_xxx', // From Stripe Dashboard
   features: [
   '5 users',
   'Unlimited invoices',
   'Unlimited customers',
   'Unlimited products',
   'Inventory tracking',
   'Advanced reports',
   'Priority email support',
   ],
   limits: {
   users: 5,
   invoices_per_month: null,
   customers: null,
   products: null,
   },
   features_access: {
   inventory: true,
   multi_branch: false,
   api_access: false,
   advanced_reports: true,
   custom_branding: false,
   },
   },
   enterprise: {
   name: 'Enterprise',
   price: 49,
   interval: 'month',
   stripe_price_id: 'price_yyy',
   features: [
   'Unlimited users',
   'Everything in Pro',
   'Multi-branch support',
   'API access',
   'Custom branding',
   'Advanced integrations',
   'Priority phone support',
   'Dedicated account manager',
   ],
   limits: {
   users: null,
   invoices_per_month: null,
   customers: null,
   products: null,
   },
   features_access: {
   inventory: true,
   multi_branch: true,
   api_access: true,
   advanced_reports: true,
   custom_branding: true,
   },
   },
   } as const;
2. Checkout Session Creation
   typescript// src/services/stripe/checkout.ts
   import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

export async function createCheckoutSession(
priceId: string,
organizationId: string,
userId: string
) {
const { data, error } = await supabase.functions.invoke(
'create-checkout-session',
{
body: {
price_id: priceId,
organization_id: organizationId,
user_id: userId,
success_url: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${window.location.origin}/subscription`,
},
}
);

if (error) throw error;

const stripe = await stripePromise;
if (!stripe) throw new Error('Stripe not loaded');

const { error: redirectError } = await stripe.redirectToCheckout({
sessionId: data.sessionId,
});

if (redirectError) throw redirectError;
} 3. Stripe Webhook Handler
typescript// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.1.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
apiVersion: '2023-10-16',
});

serve(async (req) => {
const signature = req.headers.get('stripe-signature');
if (!signature) {
return new Response('No signature', { status: 400 });
}

try {
const body = await req.text();
const event = stripe.webhooks.constructEvent(
body,
signature,
Deno.env.get('STRIPE_WEBHOOK_SECRET')!
);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update organization subscription
        await supabase
          .from('organizations')
          .update({
            subscription_plan: session.metadata?.plan,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq('id', session.metadata?.organization_id);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Record payment
        await supabase
          .from('payments')
          .insert({
            organization_id: invoice.metadata?.organization_id,
            amount: invoice.amount_paid / 100,
            status: 'succeeded',
            stripe_invoice_id: invoice.id,
          });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status
        await supabase
          .from('organizations')
          .update({
            subscription_status: subscription.status,
            subscription_plan: subscription.metadata?.plan,
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Downgrade to free plan
        await supabase
          .from('organizations')
          .update({
            subscription_plan: 'free',
            subscription_status: 'cancelled',
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        // Mark subscription as past_due
        await supabase
          .from('organizations')
          .update({
            subscription_status: 'past_due',
          })
          .eq('stripe_customer_id', invoice.customer);

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

} catch (err) {
console.error('Webhook error:', err);
return new Response(err.message, { status: 400 });
}
}); 4. Usage Limit Enforcement
typescript// src/hooks/useUsageLimits.ts
export function useUsageLimits() {
const { organization } = useAuth();

const query = useQuery({
queryKey: ['usage-limits', organization?.id],
queryFn: async () => {
const plan = SUBSCRIPTION_PLANS[organization!.subscription_plan];

      // Get current usage
      const [usersCount, invoicesCount, customersCount, productsCount] =
        await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true })
            .eq('organization_id', organization!.id),
          supabase.from('invoices').select('id', { count: 'exact', head: true })
            .eq('organization_id', organization!.id)
            .gte('created_at', startOfMonth()),
          supabase.from('customers').select('id', { count: 'exact', head: true })
            .eq('organization_id', organization!.id),
          supabase.from('products').select('id', { count: 'exact', head: true })
            .eq('organization_id', organization!.id),
        ]);

      return {
        plan: organization!.subscription_plan,
        limits: {
          users: {
            current: usersCount.count || 0,
            max: plan.limits.users,
          },
          invoices_per_month: {
            current: invoicesCount.count || 0,
            max: plan.limits.invoices_per_month,
          },
          customers: {
            current: customersCount.count || 0,
            max: plan.limits.customers,
          },
          products: {
            current: productsCount.count || 0,
            max: plan.limits.products,
          },
        },
        features: plan.features_access,
      };
    },
    enabled: !!organization,
    staleTime: 60000, // 1 minute

});

const canPerformAction = (action: string) => {
const limits = query.data?.limits;
if (!limits) return false;

    switch (action) {
      case 'create_user':
        return !limits.users.max || limits.users.current < limits.users.max;
      case 'create_invoice':
        return !limits.invoices_per_month.max ||
               limits.invoices_per_month.current < limits.invoices_per_month.max;
      case 'create_customer':
        return !limits.customers.max || limits.customers.current < limits.customers.max;
      case 'create_product':
        return !limits.products.max || limits.products.current < limits.products.max;
      default:
        return true;
    }

};

const hasFeature = (feature: string) => {
return query.data?.features?.[feature] || false;
};

return {
limits: query.data,
isLoading: query.isLoading,
canPerformAction,
hasFeature,
};
}

// Usage in components
function CreateInvoiceButton() {
const { canPerformAction } = useUsageLimits();
const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

const handleClick = () => {
if (!canPerformAction('create_invoice')) {
setShowUpgradePrompt(true);
return;
}
// Proceed with invoice creation
};

return (
<>
<Button onClick={handleClick}>
<Plus className="h-4 w-4 mr-2" />
New Invoice
</Button>

      <UpgradePrompt
        open={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="unlimited invoices"
      />
    </>

);
} 5. Pricing Plans Component
typescript// src/components/subscription/PricingPlans.tsx
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SUBSCRIPTION_PLANS } from '@/constants/status';
import { createCheckoutSession } from '@/services/stripe/checkout';

export function PricingPlans() {
const { organization, user } = useAuth();
const currentPlan = organization?.subscription_plan || 'free';

const handleSubscribe = async (plan: string) => {
if (plan === 'free') {
toast.info('You are already on the free plan');
return;
}

    try {
      const priceId = SUBSCRIPTION_PLANS[plan].stripe_price_id;
      await createCheckoutSession(priceId!, organization!.id, user!.id);
    } catch (error) {
      toast.error('Failed to start checkout');
    }

};

return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
const isCurrent = currentPlan === key;
const isUpgrade = getPlanLevel(key) > getPlanLevel(currentPlan);

        return (
          <Card
            key={key}
            className={isCurrent ? 'border-primary shadow-lg' : ''}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {isCurrent && (
                  <Badge variant="default">Current Plan</Badge>
                )}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? 'outline' : 'default'}
                disabled={isCurrent}
                onClick={() => handleSubscribe(key)}
              >
                {isCurrent ? 'Current Plan' : isUpgrade ? 'Upgrade' : 'Choose Plan'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>

);
}

function getPlanLevel(plan: string): number {
const levels = { free: 0, pro: 1, enterprise: 2 };
return levels[plan] || 0;
}
📊 Database Schema
sql-- Add subscription fields to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Payments tracking table
CREATE TABLE payments (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
amount DECIMAL(10,2) NOT NULL,
currency VARCHAR(3) DEFAULT 'USD',
status VARCHAR(20) NOT NULL,
stripe_invoice_id VARCHAR(100),
stripe_payment_intent_id VARCHAR(100),
created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_organization ON payments(organization_id);
CREATE INDEX idx_payments_created ON payments(created_at DESC);
🧪 Testing
typescript// Test subscription upgrade
test('should upgrade from free to pro plan', async () => {
const org = await createTestOrganization({ subscription_plan: 'free' });

// Simulate successful Stripe checkout
const mockSession = {
customer: 'cus_test',
subscription: 'sub_test',
metadata: { plan: 'pro', organization_id: org.id },
};

await handleCheckoutSessionCompleted(mockSession);

const updated = await getOrganization(org.id);
expect(updated.subscription_plan).toBe('pro');
expect(updated.subscription_status).toBe('active');
expect(updated.stripe_customer_id).toBe('cus_test');
});

// Test usage limits
test('should block action when limit exceeded', async () => {
const org = await createTestOrganization({
subscription_plan: 'free'
});

// Create 50 invoices (limit for free plan)
for (let i = 0; i < 50; i++) {
await createTestInvoice(org.id);
}

const { canPerformAction } = useUsageLimits();
expect(canPerformAction('create_invoice')).toBe(false);
});

// Test webhook signature verification
test('should reject webhook with invalid signature', async () => {
const response = await fetch('/api/stripe-webhook', {
method: 'POST',
headers: {
'stripe-signature': 'invalid_signature',
'Content-Type': 'application/json',
},
body: JSON.stringify({ type: 'checkout.session.completed' }),
});

expect(response.status).toBe(400);
});
🐛 Common Issues & Solutions
Issue: Webhook not receiving events
Solution: Verify webhook configuration in Stripe Dashboard:
bash# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Test webhook endpoint

stripe trigger checkout.session.completed
Issue: Double-charging customers
Solution: Implement idempotency:
typescript// Store processed event IDs
const processedEvents = new Set();

async function handleWebhook(event: Stripe.Event) {
if (processedEvents.has(event.id)) {
return { status: 'already_processed' };
}

// Process event
await processEvent(event);

processedEvents.add(event.id);

// Clean up old IDs after 24 hours
setTimeout(() => processedEvents.delete(event.id), 24 _ 60 _ 60 _ 1000);
}
Issue: Incorrect usage counts
Solution: Add database constraints and recalculation:
sql-- Function to recalculate usage
CREATE OR REPLACE FUNCTION recalculate_usage(org_id UUID)
RETURNS JSON AS $$
DECLARE
usage JSON;
BEGIN
SELECT json_build_object(
'users', (SELECT COUNT(_) FROM users WHERE organization_id = org_id),
'invoices_this_month', (SELECT COUNT(_) FROM invoices
WHERE organization_id = org_id
AND created_at >= date_trunc('month', CURRENT_DATE)),
'customers', (SELECT COUNT(_) FROM customers WHERE organization_id = org_id),
'products', (SELECT COUNT(\*) FROM products WHERE organization_id = org_id)
) INTO usage;

RETURN usage;
END;

$$
LANGUAGE plpgsql;
```

## 📚 Related Documentation

- [Stripe Integration Guide](../guides/stripe-integration.md)
- [Plan Comparison](../guides/plan-comparison.md)
- [Billing FAQ](../guides/billing-faq.md)

---
$$
