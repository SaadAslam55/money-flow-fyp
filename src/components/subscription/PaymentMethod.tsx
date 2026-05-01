// src/components/subscription/PaymentMethod.tsx
import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}

/**
 * Component for managing payment methods
 */
export function PaymentMethod() {
  const { organization } = useAuth();
  const { subscription, refetch } = useSubscription();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<string | null>(null);

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    if (!organization?.stripe_customer_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        body: {
          customer_id: organization.stripe_customer_id,
        },
      });

      if (error) throw error;

      setPaymentMethods(data?.payment_methods ?? []);
    } catch (error) {

      logger.error('Error fetching payment methods:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  // Load payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, [organization?.stripe_customer_id]);

  const handleAddPaymentMethod = async () => {
    if (!organization?.stripe_customer_id) {
      toast.error('Stripe customer not found');
      return;
    }

    try {
      setIsAdding(true);

      // Create Stripe setup session for adding payment method
      const { data, error } = await supabase.functions.invoke('create-setup-session', {
        body: {
          customer_id: organization.stripe_customer_id,
          return_url: `${window.location.origin}/subscription/manage`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe to add payment method
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create setup session');
      }
    } catch (error) {

      logger.error('Error adding payment method:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to add payment method');
    } finally {
      setIsAdding(false);
      setIsDialogOpen(false);
    }
  };

  const handleDeletePaymentMethod = (paymentMethodId: string) => {
    setPaymentMethodToDelete(paymentMethodId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePaymentMethod = async () => {
    if (!paymentMethodToDelete || !organization?.stripe_customer_id) {
      toast.error('Stripe customer not found');
      return;
    }

    try {
      setIsDeleting(paymentMethodToDelete);

      const { error } = await supabase.functions.invoke('delete-payment-method', {
        body: {
          customer_id: organization.stripe_customer_id,
          payment_method_id: paymentMethodToDelete,
        },
      });

      if (error) throw error;

      toast.success('Payment method removed');
      await fetchPaymentMethods();
      setDeleteDialogOpen(false);
      setPaymentMethodToDelete(null);
    } catch (error) {

      logger.error('Error deleting payment method:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to remove payment method');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!organization?.stripe_customer_id) {
      toast.error('Stripe customer not found');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('set-default-payment-method', {
        body: {
          customer_id: organization.stripe_customer_id,
          payment_method_id: paymentMethodId,
        },
      });

      if (error) throw error;

      toast.success('Default payment method updated');
      await fetchPaymentMethods();
      await refetch();
    } catch (error) {

      logger.error('Error setting default payment method:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to update default payment method');
    }
  };

  const getCardBrandIcon = (brand: string) => {
    // Return brand name or icon - you can enhance this with actual icons
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader message="Loading payment methods..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  You will be redirected to Stripe to securely add your payment method.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPaymentMethod} disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Stripe'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payment methods"
            description="Add a payment method to manage your subscription."
            action={
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-14 bg-muted rounded flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {getCardBrandIcon(method.card.brand)} •••• {method.card.last4}
                      </p>
                      {method.is_default && (
                        <StatusBadge
                          status="active"
                          type="custom"
                          label="Default"
                          size="sm"
                        />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.card.exp_month}/{method.card.exp_year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    disabled={isDeleting === method.id}
                    title="Delete payment method"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeletePaymentMethod}
        title="Delete Payment Method"
        description="Are you sure you want to remove this payment method? This action cannot be undone."
        confirmText="Delete"
        confirmVariant={'destructive'}
        loading={isDeleting !== null}
      />
    </Card>
  );
}

