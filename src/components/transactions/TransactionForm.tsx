import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Calendar, Tag, FileText, Upload, CreditCard, X } from 'lucide-react';
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
import { transactionSchema, type TransactionFormData } from '@/schemas/transactionSchemas';
import { useActiveCategories } from '@/hooks/useExpenseCategories';
import { useActiveBankAccounts } from '@/hooks/useBankAccounts';
import { useCategorizeExpense } from '@/hooks/useAI';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '@/constants/status';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData, file?: File) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Record Transaction',
  isSubmitting = false,
}: TransactionFormProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    initialData?.receipt_url || null
  );

  const { categories } = useActiveCategories();
  const { bankAccounts } = useActiveBankAccounts();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ?? {
      type: 'expense',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      description: '',
    },
  });

  const transactionType = watch('type');
  const amount = watch('amount');
  const description = watch('description');
  const currentCategoryId = watch('category_id');
  const { categorize } = useCategorizeExpense();
  const { isEnabled } = useAIFeatures();
  const aiCategorizationEnabled = isEnabled('ai_expense_categorization');

  // AI category suggestion for expenses
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!aiCategorizationEnabled) return;
    if (transactionType === 'expense' && description && description.length > 3 && !currentCategoryId) {
      const aiCategory = categorize(description);
      // Find matching category in available categories
      const match = categories.find(
        (c) => c.name.toLowerCase().includes(aiCategory.toLowerCase()) ||
                aiCategory.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        setSuggestedCategory(match.id);
      } else {
        setSuggestedCategory(null);
      }
    } else {
      setSuggestedCategory(null);
    }
  }, [description, transactionType, categories, currentCategoryId, aiCategorizationEnabled, categorize]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    await onSubmit(data, receiptFile || undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed');
        return;
      }

      setReceiptFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Transaction Type & Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setValue('type', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span className={type.color}>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (PKR) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-9"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-9"
                  {...register('date')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            {/* Payment Method */}
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
              {errors.payment_method && (
                <p className="text-sm text-destructive">{errors.payment_method.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category & Bank Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Category (for income and expenses) */}
            {(transactionType === 'expense' || transactionType === 'income') && (
              <div className="space-y-2">
                <Label htmlFor="category_id">
                  {transactionType === 'expense' ? 'Expense Category' : 'Income Category'}
                </Label>
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
                        <div className="flex items-center gap-2">
                          {(category as any).color && (
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: (category as any).color }}
                            />
                          )}
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && (
                  <p className="text-sm text-destructive">{errors.category_id.message}</p>
                )}
              </div>
            )}

            {/* Bank Account */}
            <div className="space-y-2">
              <Label htmlFor="bank_account_id">Bank Account</Label>
              <Select
                value={watch('bank_account_id') ?? 'cash'}
                onValueChange={(value) =>
                  setValue('bank_account_id', value === 'cash' ? undefined : value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account or Cash" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name} ({account.bank_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bank_account_id && (
                <p className="text-sm text-destructive">{errors.bank_account_id.message}</p>
              )}
            </div>

          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this transaction for?"
              rows={3}
              {...register('description')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
            {suggestedCategory && !currentCategoryId && (
              <div className="flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs dark:border-indigo-800 dark:bg-indigo-950/20">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-indigo-700 dark:text-indigo-300">
                  AI Suggestion:{' '}
                  <span className="font-medium">
                    {categories.find((c) => c.id === suggestedCategory)?.name}
                  </span>
                </span>
                <button
                  type="button"
                  className="ml-auto flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-medium text-indigo-700 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                  onClick={() => {
                    setValue('category_id', suggestedCategory, { shouldValidate: true });
                    setSuggestedCategory(null);
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              rows={2}
              {...register('notes')}
              disabled={isSubmitting}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Receipt Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receipt (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!receiptFile && !receiptPreview ? (
            <div className="rounded-lg border-2 border-dashed p-6 text-center">
              <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-sm text-muted-foreground">
                Upload a photo or scan of your receipt (Max 5MB)
              </p>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="mx-auto max-w-xs"
                disabled={isSubmitting}
              />
              <p className="mt-2 text-xs text-muted-foreground">Supported formats: JPG, PNG, PDF</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receiptPreview && (
                <div className="relative overflow-hidden rounded-lg border">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{receiptFile?.name ?? 'Existing receipt'}</p>
                    {receiptFile && (
                      <p className="text-xs text-muted-foreground">
                        {(receiptFile.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeReceipt}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {amount > 0 && (
        <Card
          className={
            transactionType === 'expense'
              ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
              : 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
          }
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">
                {transactionType === 'expense' ? 'Money Out:' : 'Money In:'}
              </span>
              <div className="flex items-center gap-1">
                {transactionType !== 'transfer' && (
                  <span
                    className={
                      transactionType === 'expense'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }
                  >
                    {transactionType === 'expense' ? '-' : '+'}
                  </span>
                )}
                <CurrencyDisplay
                  amount={amount}
                  variant={
                    transactionType === 'expense'
                      ? 'negative'
                      : transactionType === 'income'
                        ? 'positive'
                        : 'default'
                  }
                  size="xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons - Sticky on mobile */}
      <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-4 px-4 sm:mx-0 sm:px-0 sm:border-0 sm:static flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Recording...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
