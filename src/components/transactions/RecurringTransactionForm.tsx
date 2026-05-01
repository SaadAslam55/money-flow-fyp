import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Repeat, Calendar, DollarSign } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { transactionSchema } from '@/schemas/transactionSchemas';
import { useActiveCategories } from '@/hooks/useExpenseCategories';
import { useActiveBankAccounts } from '@/hooks/useBankAccounts';
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '@/constants/status';

const recurringTransactionSchema = (transactionSchema as any).extend({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    required_error: 'Frequency is required',
  }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  repeat_count: z.number().min(1).max(999).optional().nullable(),
  is_active: z.boolean().default(true),
});

type RecurringTransactionFormData = z.infer<typeof recurringTransactionSchema>;

interface RecurringTransactionFormProps {
  initialData?: Partial<RecurringTransactionFormData>;
  onSubmit: (data: RecurringTransactionFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function RecurringTransactionForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Recurring Transaction',
  isSubmitting = false,
}: RecurringTransactionFormProps) {
  const { categories } = useActiveCategories();
  const { bankAccounts } = useActiveBankAccounts();
  const [frequency, setFrequency] = useState<string>(initialData?.frequency ?? 'monthly');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecurringTransactionFormData>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      ...initialData,
      type: initialData?.type ?? 'expense',
      frequency: initialData?.frequency ?? 'monthly',
      start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
      is_active: initialData?.is_active ?? true,
    },
  });

  const handleFormSubmit = async (data: RecurringTransactionFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {String(errors.type.message ?? 'Invalid transaction type')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (PKR) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {String(errors.amount.message ?? 'Invalid amount')}
                </p>
              )}
            </div>

            {watch('type') === 'expense' && (
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={watch('category_id') ?? 'none'}
                  onValueChange={(value) =>
                    setValue('category_id', value === 'none' ? undefined : value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={watch('payment_method')}
                onValueChange={(value) => setValue('payment_method', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this recurring transaction for?"
              rows={2}
              {...register('description')}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recurrence Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Recurrence Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={frequency}
                onValueChange={(value) => {
                  setFrequency(value);
                  setValue('frequency', value as any);
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p className="text-sm text-destructive">
                  {String(errors.frequency.message ?? 'Invalid frequency')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                disabled={isSubmitting}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">
                  {String(errors.start_date.message ?? 'Invalid start date')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input id="end_date" type="date" {...register('end_date')} disabled={isSubmitting} />
              {errors.end_date && (
                <p className="text-sm text-destructive">
                  {String(errors.end_date.message ?? 'Invalid end date')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat_count">Repeat Count (Optional)</Label>
              <Input
                id="repeat_count"
                type="number"
                min="1"
                max="999"
                placeholder="Leave empty for unlimited"
                {...register('repeat_count', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Number of times to repeat (leave empty for unlimited)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
