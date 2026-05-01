// src/components/subscription/CancelSubscriptionDialog.tsx
import { logger } from '@/lib/logger';
import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for canceling subscription
 */
export function CancelSubscriptionDialog({
  open,
  onOpenChange,
}: CancelSubscriptionDialogProps) {
  const { subscription, cancelSubscription, isCancelling } = useSubscription();
  const navigate = useNavigate();
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleCancel = async () => {
    if (confirmText.toLowerCase() !== 'cancel') {
      toast.error('Please type "cancel" to confirm');
      return;
    }

    try {
      await cancelSubscription();
      toast.success('Subscription cancelled successfully');
      onOpenChange(false);
      navigate('/subscription');
    } catch (error) {

      logger.error('Error cancelling subscription:', error instanceof Error ? error.message : String(error));
      toast.error('Failed to cancel subscription');
    }
  };

  const handleClose = () => {
    setCancelImmediately(false);
    setFeedback('');
    setConfirmText('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Are you sure you want to cancel your subscription? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>When should we cancel?</Label>
            <RadioGroup
              value={cancelImmediately ? 'immediately' : 'end-of-period'}
              onValueChange={(value) => setCancelImmediately(value === 'immediately')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end-of-period" id="end-of-period" />
                <Label htmlFor="end-of-period" className="font-normal cursor-pointer">
                  At the end of the current billing period (recommended)
                  <span className="block text-xs text-muted-foreground mt-1">
                    You'll continue to have access until{' '}
                    {(subscription as any)?.current_period_end
                      ? new Date((subscription as any).current_period_end).toLocaleDateString()
                      : 'the end of your billing period'}
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediately" id="immediately" />
                <Label htmlFor="immediately" className="font-normal cursor-pointer">
                  Cancel immediately
                  <span className="block text-xs text-muted-foreground mt-1">
                    You'll lose access immediately
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Reason for cancellation (optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Help us improve by sharing why you're canceling..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-mono font-semibold">cancel</span> to confirm
            </Label>
            <Input
              id="confirm"
              type="text"
              placeholder="Type 'cancel' to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your subscription will be cancelled</li>
              <li>
                {cancelImmediately
                  ? 'You will lose access immediately'
                  : 'You will retain access until the end of your billing period'}
              </li>
              <li>You can reactivate your subscription anytime</li>
              <li>Your data will be retained for 30 days</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isCancelling}>
            Keep Subscription
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={confirmText.toLowerCase() !== 'cancel' || isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCancelling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

