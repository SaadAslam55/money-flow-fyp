// src/components/invoices/PaymentDialog.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { paymentRecordSchema } from '@/schemas/invoiceSchemas';
import { useInvoices } from '@/hooks/useInvoices';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { PAYMENT_METHODS } from '@/constants/invoiceStatus';
import { handleError } from '@/lib/errorHandler';
import type { InvoiceWithDetails, PaymentRecord } from '@/types/invoice.types';

interface PaymentDialogProps {
  invoice: InvoiceWithDetails;
  open: boolean;
  onClose: () => void;
}

export function PaymentDialog({ invoice, open, onClose }: PaymentDialogProps) {
  const { recordPayment } = useInvoices();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentRecord>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      invoice_id: invoice.id,
      amount: invoice.amount_due,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    },
  });

  const watchedAmount = watch('amount');
  const watchedPaymentMethod = watch('payment_method');
  const remainingBalance = invoice.amount_due - (watchedAmount ?? 0);
  const isOverpayment = remainingBalance < 0;

  const onSubmit = async (data: PaymentRecord) => {
    setIsSubmitting(true);
    try {
      await recordPayment(data);
      reset();
      onClose();
    } catch (error) {
      handleError(error, 'PaymentDialog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const paymentMethodOptions = Object.entries(PAYMENT_METHODS).map(([key, value]) => ({
    value: key,
    label: value.label,
    icon: value.icon,
  }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-2">
          {/* Invoice Summary */}
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{invoice.customer.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice Total:</span>
              <CurrencyDisplay amount={invoice.total_amount} size="sm" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Paid:</span>
              <CurrencyDisplay amount={invoice.amount_paid} variant="positive" size="sm" />
            </div>
            <div className="flex justify-between border-t pt-2 text-sm font-bold">
              <span>Amount Due:</span>
              <CurrencyDisplay amount={invoice.amount_due} variant="negative" size="lg" />
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Amount *
            </Label>
            <div className="relative">
              <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                Rs
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={invoice.amount_due * 2} // Allow overpayment up to 2x
                className="pl-12"
                {...register('amount', { valueAsNumber: true })}
              />
            </div>
            {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('amount', invoice.amount_due)}
              >
                Pay Full Amount
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('amount', invoice.amount_due / 2)}
              >
                Pay Half
              </Button>
            </div>
          </div>

          {/* Remaining Balance Alert */}
          {watchedAmount > 0 && (
            <Alert
              variant={
                isOverpayment ? 'destructive' : remainingBalance === 0 ? 'default' : 'default'
              }
              className={
                isOverpayment
                  ? 'border-red-300 bg-red-50'
                  : remainingBalance === 0
                    ? 'border-green-300 bg-green-50'
                    : 'border-blue-300 bg-blue-50'
              }
            >
              <AlertDescription className="flex items-center justify-between">
                <span className="font-medium">
                  {isOverpayment
                    ? 'Overpayment:'
                    : remainingBalance === 0
                      ? 'Invoice will be fully paid'
                      : 'Remaining Balance:'}
                </span>
                <span
                  className={`text-lg font-bold ${
                    isOverpayment
                      ? 'text-red-700'
                      : remainingBalance === 0
                        ? 'text-green-700'
                        : 'text-blue-700'
                  }`}
                >
                  {remainingBalance === 0 ? (
                    '✓ Paid'
                  ) : (
                    <CurrencyDisplay amount={Math.abs(remainingBalance)} variant={isOverpayment ? 'negative' : 'default'} size="sm" />
                  )}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Payment Date *
            </Label>
            <Input
              id="payment_date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register('payment_date')}
            />
            {errors.payment_date && (
              <p className="text-destructive text-sm">{errors.payment_date.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment_method" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Method *
            </Label>
            <Select
              value={watchedPaymentMethod}
              onValueChange={(value) => setValue('payment_method', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-destructive text-sm">{errors.payment_method.message}</p>
            )}
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="reference_number" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reference Number
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              id="reference_number"
              placeholder="Transaction ID, Check number, etc."
              {...register('reference_number')}
            />
            <p className="text-muted-foreground text-xs">
              Enter any reference number like transaction ID, check number, or receipt number
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes
              <span className="text-muted-foreground ml-2 text-xs">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional payment details or notes..."
              rows={3}
              {...register('notes')}
            />
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="sticky bottom-0 bg-background pt-4 border-t mt-4">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !watchedAmount || watchedAmount <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Recording...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Record Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
