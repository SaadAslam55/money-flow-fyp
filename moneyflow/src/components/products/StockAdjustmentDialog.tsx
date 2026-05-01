// src/components/products/StockAdjustmentDialog.tsx
import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Minus, Loader2, Box } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { stockAdjustmentSchema, STOCK_ADJUSTMENT_REASONS, type StockAdjustmentFormData } from '@/schemas/productSchemas';
import type { Product } from '@/types/database.types';

interface StockAdjustmentDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: StockAdjustmentFormData) => Promise<void>;
}

export function StockAdjustmentDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: StockAdjustmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      product_id: product?.id ?? '',
      adjustment: 0,
      reason: 'adjustment',
      notes: '',
    },
  });

  const watchedAdjustment = watch('adjustment');
  const watchedReason = watch('reason');

  // Calculate new stock
  const newStock =
    product && watchedAdjustment
      ? product.current_stock + (adjustmentType === 'increase' ? watchedAdjustment : -watchedAdjustment)
      : product?.current_stock ?? 0;

  const handleTypeChange = (type: 'increase' | 'decrease') => {
    setAdjustmentType(type);
    const currentValue = Math.abs(watchedAdjustment ?? 0);
    setValue('adjustment', type === 'increase' ? currentValue : -currentValue);
  };

  const handleAdjustmentChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setValue('adjustment', adjustmentType === 'increase' ? numValue : -numValue);
  };

  const onSubmit = async (data: StockAdjustmentFormData) => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      await onConfirm(data);
      reset();
      onOpenChange(false);
    } catch (error) {

      logger.error('Failed to adjust stock:', error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  const isLowStockAfter = newStock <= product.minimum_stock && newStock >= 0;
  const willBeNegative = newStock < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Adjust Stock
          </DialogTitle>
          <DialogDescription>
            Update stock level for {product.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Stock Info */}
          <div className="rounded-lg border bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Stock:</span>
              <span className="text-lg font-bold">{product.current_stock} units</span>
            </div>
            {product.minimum_stock > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Minimum Level:</span>
                <span className="text-sm">{product.minimum_stock} units</span>
              </div>
            )}
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={adjustmentType === 'increase' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleTypeChange('increase')}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Increase
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'decrease' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleTypeChange('decrease')}
                disabled={isSubmitting}
              >
                <Minus className="mr-2 h-4 w-4" />
                Decrease
              </Button>
            </div>
          </div>

          {/* Adjustment Amount */}
          <div className="space-y-2">
            <Label htmlFor="adjustment">
              {adjustmentType === 'increase' ? 'Increase' : 'Decrease'} Amount *
            </Label>
            <Input
              id="adjustment"
              type="number"
              min="1"
              step="1"
              placeholder="0"
              {...register('adjustment', {
                valueAsNumber: true,
                onChange: (e) => handleAdjustmentChange(e.target.value),
              })}
              disabled={isSubmitting}
            />
            {errors.adjustment && (
              <p className="text-destructive text-sm">{errors.adjustment.message}</p>
            )}
          </div>

          {/* New Stock Preview */}
          <div className="rounded-lg border bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Stock:</span>
              <span
                className={`text-lg font-bold ${
                  willBeNegative
                    ? 'text-red-600'
                    : isLowStockAfter
                      ? 'text-orange-600'
                      : 'text-green-600'
                }`}
              >
                {newStock} units
              </span>
            </div>
          </div>

          {/* Warnings */}
          {willBeNegative && (
            <Alert variant="destructive">
              <AlertDescription>
                Warning: This adjustment will result in negative stock, which is not allowed.
              </AlertDescription>
            </Alert>
          )}

          {isLowStockAfter && !willBeNegative && (
            <Alert className="border-orange-300 bg-orange-50">
              <AlertDescription className="text-orange-700">
                After this adjustment, stock will be at or below minimum level.
              </AlertDescription>
            </Alert>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select
              value={watchedReason}
              onValueChange={(value) => setValue('reason', value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {STOCK_ADJUSTMENT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    <span className="flex items-center gap-2">
                      <span>{reason.icon}</span>
                      <span>{reason.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-destructive text-sm">{errors.reason.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this adjustment..."
              rows={3}
              {...register('notes')}
              disabled={isSubmitting}
            />
            {errors.notes && (
              <p className="text-destructive text-sm">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || willBeNegative || !watchedAdjustment}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adjusting...
                </>
              ) : (
                <>
                  <Box className="mr-2 h-4 w-4" />
                  Confirm Adjustment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

