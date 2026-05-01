// src/components/subscription/UpgradePrompt.tsx
import { Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  title?: string;
  description?: string;
}

/**
 * Dialog component for prompting users to upgrade their plan
 */
export function UpgradePrompt({
  open,
  onClose,
  feature,
  title,
  description,
}: UpgradePromptProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription?upgrade=true');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <DialogTitle>{title ?? 'Upgrade Required'}</DialogTitle>
          </div>
          <DialogDescription>
            {description ||
              (feature
                ? `To use ${feature}, you need to upgrade to a higher plan.`
                : 'This feature is not available on your current plan. Upgrade to access it.')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Upgrade now to unlock premium features and get more value from Money Flow.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade}>
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

