// src/components/invoices/InvoiceForm.tsx
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Calculator,
  Save,
  X,
  AlertCircle,
  Loader2,
  Package,
  User,
  Calendar,
  FileText,
} from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createInvoiceSchema, type CreateInvoiceFormData } from '@/schemas/invoiceSchemas';
import { useInvoices } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { AISuggestionChips, SmartInvoiceDescription } from '@/components/ai';
import type { Product } from '@/types/database.types';
import { formatCurrency, formatDate } from '@/lib/invoiceFormatters';
import { calculateInvoiceTotals } from '@/services/api/invoiceApi';
import { INVOICE_VALIDATION, TAX_RATES, DISCOUNT_TYPES } from '@/constants/invoiceStatus';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import type { InvoiceWithDetails } from '@/types/invoice.types';

interface InvoiceFormProps {
  initialData?: Partial<InvoiceWithDetails>;
  onCancel?: () => void;
}

export function InvoiceForm({ initialData, onCancel }: InvoiceFormProps) {
  const navigate = useNavigate();
  const { createInvoice, updateInvoice, isCreating, isUpdating } = useInvoices();
  const { customers, isLoading: customersLoading } = useCustomers();
  const { products, isLoading: productsLoading } = useProducts({ isActive: true });

  const isEditMode = !!initialData?.id;
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      customer_id: initialData?.customer_id ?? '',
      invoice_date: initialData?.invoice_date || new Date().toISOString().split('T')[0],
      due_date:
        initialData?.due_date ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: initialData?.items?.map((item) => ({
        product_id: item.product_id || undefined,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
      })) || [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          tax_rate: 17,
        },
      ],
      notes: initialData?.notes ?? '',
      terms: initialData?.terms ?? '',
      discount_type: undefined,
      discount_value: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedCustomerId = watch('customer_id');
  const watchedDiscountType = watch('discount_type');
  const watchedDiscountValue = watch('discount_value');
  const watchedInvoiceDate = watch('invoice_date');

  // Calculate totals
  const totals = calculateInvoiceTotals(
    watchedItems ?? [],
    watchedDiscountType,
    watchedDiscountValue
  );

  // Set default due date when invoice date changes
  useEffect(() => {
    if (watchedInvoiceDate && !isEditMode) {
      const invoiceDate = new Date(watchedInvoiceDate);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30); // Default 30 days
      const dueDateStr = dueDate.toISOString().split('T')[0];
      if (dueDateStr) {
        setValue('due_date', dueDateStr);
      }
    }
  }, [watchedInvoiceDate, isEditMode, setValue]);

  const onSubmit = async (data: CreateInvoiceFormData) => {
    try {
      if (isEditMode && initialData?.id) {
        await updateInvoice({ id: initialData.id, data });
        navigate(`/invoices/${initialData.id}`);
      } else {
        const result = await createInvoice(data);
        const invoiceId = (result as any)?.data?.id;
        if (invoiceId && typeof invoiceId === 'string') {
          navigate(`/invoices/${invoiceId}`);
        }
      }
    } catch (error) {
      handleError(error, 'InvoiceForm');
    }
  };

  const handleAddItem = () => {
    append({
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 17,
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.product_id`, productId);
      setValue(`items.${index}.description`, product.name);
      setValue(`items.${index}.unit_price`, product.unit_price);
      setValue(`items.${index}.tax_rate`, product.tax_rate);
    }
  };

  const handleAddSuggestedProduct = (product: Product) => {
    append({
      product_id: product.id,
      description: product.name,
      quantity: 1,
      unit_price: product.unit_price,
      tax_rate: product.tax_rate ?? 17,
    });
  };

  const selectedCustomer = customers.find((c) => c.id === watchedCustomerId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{isEditMode ? 'Edit Invoice' : 'Create Invoice'}</h2>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? 'Update invoice details' : 'Create a new invoice for your customer'}
          </p>
        </div>
        {/* Hide header buttons on mobile - they're at the bottom */}
        <div className="hidden sm:flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update Invoice' : 'Create Invoice'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_id">Customer *</Label>
            <Select
              value={watchedCustomerId}
              onValueChange={(value) => setValue('customer_id', value)}
              disabled={isSubmitting || customersLoading}
            >
              <SelectTrigger id="customer_id">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers && customers.length > 0 && customers.map((customer) => (
                  <SelectItem key={`customer-${customer.id}`} value={customer.id}>
                    {customer.name} {customer.email && `(${customer.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer_id && (
              <p className="text-sm text-destructive">{errors.customer_id.message}</p>
            )}
            {customers.length === 0 && !customersLoading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No customers found.{' '}
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => navigate('/customers/new')}
                  >
                    Create one
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {selectedCustomer && (
            <div className="rounded-lg bg-muted p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedCustomer.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium">{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{' '}
                    <span className="font-medium">{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.outstanding_balance > 0 && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Outstanding Balance:</span>{' '}
                    <Badge variant="destructive">
                      {formatCurrency(selectedCustomer.outstanding_balance)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Product Suggestions */}
      <AISuggestionChips
        customerId={watchedCustomerId}
        existingProductIds={watchedItems?.map((item) => item.product_id).filter((id): id is string => !!id) ?? []}
        onSelectProduct={handleAddSuggestedProduct}
      />

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Invoice Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoice_date">Invoice Date *</Label>
            <Input
              id="invoice_date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register('invoice_date')}
            />
            {errors.invoice_date && (
              <p className="text-sm text-destructive">{errors.invoice_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date *</Label>
            <Input id="due_date" type="date" min={watchedInvoiceDate} {...register('due_date')} />
            {errors.due_date && (
              <p className="text-sm text-destructive">{errors.due_date.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Invoice Items
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              disabled={isSubmitting || fields.length >= INVOICE_VALIDATION.maxItems}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>At least one item is required</AlertDescription>
            </Alert>
          )}

          {fields.map((field, index) => {
            const itemErrors = errors.items?.[index];
            const item = watchedItems?.[index];
            const lineTotal = item
              ? (item.quantity ?? 0) * (item.unit_price ?? 0) * (1 + (item.tax_rate ?? 0) / 100)
              : 0;

            return (
              <Card key={field.id} className="border-2">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Product Selection */}
                    <div className="space-y-2">
                      <Label>Product (Optional)</Label>
                      <Select
                        value={item?.product_id ?? 'manual'}
                        onValueChange={(value) =>
                          handleProductSelect(index, value === 'manual' ? '' : value)
                        }
                        disabled={isSubmitting || productsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product or enter manually" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Entry</SelectItem>
                          {products && products.length > 0 && products.map((product) => (
                            <SelectItem key={`product-${product.id}`} value={product.id}>
                              {product.name} - {formatCurrency(product.unit_price)}
                              {product.track_inventory && (
                                <span className="ml-2 text-muted-foreground">
                                  (Stock: {product.current_stock})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.description`}>Description *</Label>
                      <Input
                        id={`items.${index}.description`}
                        placeholder="Item description"
                        {...register(`items.${index}.description`)}
                      />
                      {itemErrors?.description && (
                        <p className="text-sm text-destructive">{itemErrors.description.message}</p>
                      )}
                      <SmartInvoiceDescription
                        productName={item?.description || ''}
                        customerName={selectedCustomer?.name || ''}
                        quantity={item?.quantity || 1}
                        onApply={(desc) => setValue(`items.${index}.description`, desc)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                      <Input
                        id={`items.${index}.quantity`}
                        type="number"
                        step="0.01"
                        min={INVOICE_VALIDATION.minQuantity}
                        max={INVOICE_VALIDATION.maxQuantity}
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                      {itemErrors?.quantity && (
                        <p className="text-sm text-destructive">{itemErrors.quantity.message}</p>
                      )}
                    </div>

                    {/* Unit Price */}
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.unit_price`}>Unit Price *</Label>
                      <Input
                        id={`items.${index}.unit_price`}
                        type="number"
                        step="0.01"
                        min={INVOICE_VALIDATION.minPrice}
                        max={INVOICE_VALIDATION.maxPrice}
                        {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                      />
                      {itemErrors?.unit_price && (
                        <p className="text-sm text-destructive">{itemErrors.unit_price.message}</p>
                      )}
                    </div>

                    {/* Tax Rate */}
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.tax_rate`}>Tax Rate (%)</Label>
                      <Select
                        value={item?.tax_rate?.toString() || '17'}
                        onValueChange={(value) =>
                          setValue(`items.${index}.tax_rate`, parseFloat(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TAX_RATES).map(([key, config]) => (
                            <SelectItem key={key} value={config.rate.toString()}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Line Total */}
                    <div className="space-y-2">
                      <Label>Line Total</Label>
                      <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm font-medium">
                        {formatCurrency(lineTotal)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Discount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Discount (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="discount_type">Discount Type</Label>
            <Select
              value={watchedDiscountType ?? 'none'}
              onValueChange={(value) =>
                setValue(
                  'discount_type',
                  value === 'none' ? undefined : (value as 'percentage' | 'fixed')
                )
              }
            >
              <SelectTrigger id="discount_type">
                <SelectValue placeholder="No discount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Discount</SelectItem>
                {Object.entries(DISCOUNT_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {watchedDiscountType && (
            <div className="space-y-2">
              <Label htmlFor="discount_value">
                Discount Value ({watchedDiscountType === 'percentage' ? '%' : 'Amount'})
              </Label>
              <Input
                id="discount_value"
                type="number"
                step="0.01"
                min={0}
                max={watchedDiscountType === 'percentage' ? 100 : totals.subtotal}
                {...register('discount_value', { valueAsNumber: true })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals Summary */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Tax (
              {totals.items.reduce((sum, item) => sum + item.tax_amount, 0) > 0
                ? 'Included'
                : 'N/A'}
              ):
            </span>
            <span className="font-medium">{formatCurrency(totals.tax_amount)}</span>
          </div>
          {totals.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span className="font-medium">-{formatCurrency(totals.discount_amount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span>{formatCurrency(totals.total_amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for the customer..."
              rows={3}
              maxLength={INVOICE_VALIDATION.maxNoteLength}
              {...register('notes')}
            />
            <p className="text-xs text-muted-foreground">
              {watch('notes')?.length ?? 0} / {INVOICE_VALIDATION.maxNoteLength} characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Payment Terms (Optional)</Label>
            <Textarea
              id="terms"
              placeholder="Payment terms and conditions..."
              rows={4}
              maxLength={INVOICE_VALIDATION.maxTermsLength}
              {...register('terms')}
            />
            <p className="text-xs text-muted-foreground">
              {watch('terms')?.length ?? 0} / {INVOICE_VALIDATION.maxTermsLength} characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions - Sticky on mobile */}
      <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-4 px-4 sm:mx-0 sm:px-0 sm:static flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || fields.length === 0} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update Invoice' : 'Create Invoice'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
