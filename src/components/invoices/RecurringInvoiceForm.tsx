// src/components/invoices/RecurringInvoiceForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  Repeat,
  Save,
  X,
  AlertCircle,
  Loader2,
  Clock,
  DollarSign,
} from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate } from '@/lib/invoiceFormatters';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import type { InvoiceWithDetails } from '@/types/invoice.types';

const recurringInvoiceSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  next_invoice_date: z.string().min(1, 'Next invoice date is required'),
  auto_send: z.boolean().default(false),
  send_before_days: z.number().min(0).max(30).optional(),
  max_occurrences: z.number().min(1).max(999).optional(),
});

type RecurringInvoiceFormData = z.infer<typeof recurringInvoiceSchema>;

interface RecurringInvoiceFormProps {
  invoice: InvoiceWithDetails;
  onSave: (data: RecurringInvoiceFormData) => Promise<void>;
  onCancel: () => void;
}

const FREQUENCY_OPTIONS = {
  daily: { label: 'Daily', description: 'Every day' },
  weekly: { label: 'Weekly', description: 'Every week' },
  monthly: { label: 'Monthly', description: 'Every month' },
  quarterly: { label: 'Quarterly', description: 'Every 3 months' },
  yearly: { label: 'Yearly', description: 'Every year' },
} as const;

/**
 * RecurringInvoiceForm - Form for setting up recurring invoices
 * 
 * @example
 * <RecurringInvoiceForm 
 *   invoice={invoice} 
 *   onSave={handleSave} 
 *   onCancel={handleCancel} 
 * />
 */
export function RecurringInvoiceForm({
  invoice,
  onSave,
  onCancel,
}: RecurringInvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultStartDate = new Date().toISOString().split('T')[0];
  const defaultNextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecurringInvoiceFormData>({
    resolver: zodResolver(recurringInvoiceSchema),
    defaultValues: {
      frequency: 'monthly',
      start_date: defaultStartDate,
      next_invoice_date: defaultNextDate,
      auto_send: false,
      send_before_days: 0,
    },
  });

  const watchedFrequency = watch('frequency');
  const watchedStartDate = watch('start_date');
  const watchedAutoSend = watch('auto_send');

  // Calculate next invoice date based on frequency
  const calculateNextDate = (startDate: string, frequency: string): string => {
    const date = new Date(startDate);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    const dateStr = date.toISOString().split('T')[0];
    return dateStr || new Date().toISOString().slice(0, 10);
  };

  const handleFrequencyChange = (frequency: string) => {
    setValue('frequency', frequency as RecurringInvoiceFormData['frequency']);
    if (watchedStartDate && typeof watchedStartDate === 'string') {
      const nextDate = calculateNextDate(watchedStartDate, frequency);
      setValue('next_invoice_date', nextDate);
    }
  };

  const handleStartDateChange = (date: string) => {
    setValue('start_date', date);
    if (watchedFrequency && typeof watchedFrequency === 'string') {
      const nextDate = calculateNextDate(date, watchedFrequency);
      setValue('next_invoice_date', nextDate);
    }
  };

  const onSubmit = async (data: RecurringInvoiceFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success('Recurring invoice created successfully');
    } catch (error) {
      handleError(error, 'RecurringInvoiceForm');
      toast.error('Failed to create recurring invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Set Up Recurring Invoice</h2>
          <p className="text-muted-foreground text-sm">
            Configure automatic invoice generation for invoice {invoice.invoice_number}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Number:</span>
            <span className="font-medium">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{invoice.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">{invoice.total_amount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Recurrence Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select
              value={watchedFrequency}
              onValueChange={handleFrequencyChange}
              disabled={isSubmitting}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_OPTIONS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-muted-foreground text-xs">
                        {config.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.frequency && (
              <p className="text-destructive text-sm">{errors.frequency.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date *</Label>
            <Input
              id="start_date"
              type="date"
              min={defaultStartDate}
              {...register('start_date')}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
            {errors.start_date && (
              <p className="text-destructive text-sm">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_invoice_date">Next Invoice Date *</Label>
            <Input
              id="next_invoice_date"
              type="date"
              min={watchedStartDate}
              {...register('next_invoice_date')}
            />
            {errors.next_invoice_date && (
              <p className="text-destructive text-sm">
                {errors.next_invoice_date.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date (Optional)</Label>
            <Input
              id="end_date"
              type="date"
              min={watchedStartDate}
              {...register('end_date')}
            />
            <p className="text-muted-foreground text-xs">
              Leave empty for indefinite recurrence
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_occurrences">Max Occurrences (Optional)</Label>
            <Input
              id="max_occurrences"
              type="number"
              min={1}
              max={999}
              {...register('max_occurrences', { valueAsNumber: true })}
            />
            <p className="text-muted-foreground text-xs">
              Stop after this many invoices
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auto-send Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Auto-Send Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="auto_send"
              checked={watchedAutoSend}
              onCheckedChange={(checked) => setValue('auto_send', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="auto_send"
                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Automatically send invoices
              </label>
              <p className="text-muted-foreground text-xs">
                Send invoices automatically when they are generated
              </p>
            </div>
          </div>

          {watchedAutoSend && (
            <div className="space-y-2">
              <Label htmlFor="send_before_days">
                Send Before Due Date (Days)
              </Label>
              <Input
                id="send_before_days"
                type="number"
                min={0}
                max={30}
                {...register('send_before_days', { valueAsNumber: true })}
              />
              <p className="text-muted-foreground text-xs">
                Send invoice this many days before the due date
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-1">How recurring invoices work:</p>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Invoices will be automatically created based on the frequency</li>
            <li>Each invoice will use the same items and amounts as the original</li>
            <li>Invoice dates will be adjusted based on the schedule</li>
            <li>You can pause or cancel recurring invoices at any time</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Recurring Invoice
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

