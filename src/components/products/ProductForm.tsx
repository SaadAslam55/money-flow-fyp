// src/components/products/ProductForm.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Package,
  DollarSign,
  Percent,
  Box,
  AlertTriangle,
  Save,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { productSchema, type ProductFormData } from '@/schemas/productSchemas';
import { useProductCategories } from '@/hooks/useProducts';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { handleError } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { TAX_RATES } from '@/constants/invoiceStatus';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Product',
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories: productCategories, isLoading: categoriesLoading } = useProductCategories();

  const isEditMode = !!(initialData && 'id' in initialData && initialData.id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ?? {
      name: '',
      description: '',
      sku: '',
      category: '',
      unit_price: 0,
      cost_price: undefined,
      tax_rate: 17,
      is_service: false,
      track_inventory: true,
      current_stock: 0,
      minimum_stock: 0,
      is_active: true,
      image_url: undefined,
    },
  });

  const watchedUnitPrice = watch('unit_price');
  const watchedCostPrice = watch('cost_price');
  const watchedIsService = watch('is_service');
  const watchedTrackInventory = watch('track_inventory');
  const watchedTaxRate = watch('tax_rate');

  // Auto-disable inventory tracking for services
  useEffect(() => {
    if (watchedIsService && watchedTrackInventory) {
      setValue('track_inventory', false);
    }
  }, [watchedIsService, watchedTrackInventory, setValue]);

  // Calculate profit margin
  const profitMargin =
    watchedUnitPrice > 0 && watchedCostPrice
      ? ((watchedUnitPrice - watchedCostPrice) / watchedUnitPrice) * 100
      : 0;

  // Calculate price with tax
  const priceWithTax = watchedUnitPrice * (1 + watchedTaxRate / 100);

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      handleError(error, 'ProductForm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Create Product'}</h2>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Update product details'
              : 'Add a new product or service to your inventory'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="mr-2 h-4 w-4" />
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
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Product Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Product/Service Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Laptop Dell XPS 13"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
              <Input
                id="sku"
                placeholder="DELL-001"
                {...register('sku')}
                disabled={isSubmitting}
                className="uppercase"
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
              <p className="text-xs text-muted-foreground">
                Unique identifier for this product (optional)
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch('category') || 'none'}
                onValueChange={(value) =>
                  setValue('category', value === 'none' ? undefined : value)
                }
                disabled={isSubmitting || categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {(productCategories ?? []).map((category, index) => {
                    const categoryValue =
                      typeof category === 'string'
                        ? category
                        : String(((category as any)?.name || category) ?? '');
                    const categoryKey =
                      typeof category === 'string'
                        ? category
                        : String((category as any)?.id || index);
                    // Skip empty values
                    if (!categoryValue || categoryValue === 'none') return null;
                    return (
                      <SelectItem key={categoryKey} value={categoryValue}>
                        {categoryValue}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Product description, features, specifications..."
              rows={3}
              maxLength={1000}
              {...register('description')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {watch('description')?.length ?? 0} / 1000 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Unit Price */}
            <div className="space-y-2">
              <Label htmlFor="unit_price">Selling Price (PKR) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rs
                </span>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-12"
                  {...register('unit_price', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>
              {errors.unit_price && (
                <p className="text-sm text-destructive">{errors.unit_price.message}</p>
              )}
            </div>

            {/* Cost Price */}
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (PKR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rs
                </span>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-12"
                  {...register('cost_price', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                  disabled={isSubmitting}
                />
              </div>
              {errors.cost_price && (
                <p className="text-sm text-destructive">{errors.cost_price.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Purchase cost (for profit calculation)
              </p>
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Select
                value={watchedTaxRate?.toString() || '17'}
                onValueChange={(value) => setValue('tax_rate', parseFloat(value))}
                disabled={isSubmitting}
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
              {errors.tax_rate && (
                <p className="text-sm text-destructive">{errors.tax_rate.message}</p>
              )}
            </div>

            {/* Price with Tax */}
            <div className="space-y-2">
              <Label>Price with Tax</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium">
                <CurrencyDisplay amount={priceWithTax} size="sm" />
              </div>
            </div>
          </div>

          {/* Profit Margin */}
          {watchedCostPrice && watchedCostPrice > 0 && (
            <div className="rounded-lg border bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profit Margin:</span>
                <span
                  className={`text-lg font-bold ${
                    profitMargin >= 30
                      ? 'text-green-600'
                      : profitMargin >= 15
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Profit:{' '}
                <CurrencyDisplay
                  amount={watchedUnitPrice - watchedCostPrice}
                  variant="positive"
                  size="sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Inventory Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Toggle */}
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id="is_service"
              checked={watchedIsService}
              onCheckedChange={(checked) => setValue('is_service', checked as boolean)}
              disabled={isSubmitting}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="is_service" className="cursor-pointer text-sm font-medium">
                This is a service (not a physical product)
              </Label>
              <p className="text-sm text-muted-foreground">
                Services don't require inventory tracking
              </p>
            </div>
          </div>

          {/* Track Inventory */}
          {!watchedIsService && (
            <>
              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <Checkbox
                  id="track_inventory"
                  checked={watchedTrackInventory}
                  onCheckedChange={(checked) => setValue('track_inventory', checked as boolean)}
                  disabled={isSubmitting}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="track_inventory" className="cursor-pointer text-sm font-medium">
                    Track inventory for this product
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable stock level tracking and low stock alerts
                  </p>
                </div>
              </div>

              {watchedTrackInventory && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Current Stock */}
                  <div className="space-y-2">
                    <Label htmlFor="current_stock">Current Stock *</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="0"
                      {...register('current_stock', { valueAsNumber: true })}
                      disabled={isSubmitting}
                    />
                    {errors.current_stock && (
                      <p className="text-sm text-destructive">{errors.current_stock.message}</p>
                    )}
                  </div>

                  {/* Minimum Stock */}
                  <div className="space-y-2">
                    <Label htmlFor="minimum_stock">Minimum Stock Level</Label>
                    <Input
                      id="minimum_stock"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="0"
                      {...register('minimum_stock', { valueAsNumber: true })}
                      disabled={isSubmitting}
                    />
                    {errors.minimum_stock && (
                      <p className="text-sm text-destructive">{errors.minimum_stock.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Alert when stock falls below this level
                    </p>
                  </div>
                </div>
              )}

              {/* Low Stock Alert */}
              {watchedTrackInventory &&
                watch('current_stock') <= watch('minimum_stock') &&
                watch('current_stock') > 0 && (
                  <Alert className="border-orange-300 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700">
                      Low stock alert! Current stock ({watch('current_stock')}) is at or below
                      minimum level ({watch('minimum_stock')}).
                    </AlertDescription>
                  </Alert>
                )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Status */}
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
              disabled={isSubmitting}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">
                Product is active
              </Label>
              <p className="text-sm text-muted-foreground">
                Inactive products won't appear in product lists or be available for selection
              </p>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image_url" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Product Image URL
            </Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register('image_url', {
                setValueAs: (v) => (v === '' ? undefined : v),
              })}
              disabled={isSubmitting}
            />
            {errors.image_url && (
              <p className="text-sm text-destructive">{errors.image_url.message}</p>
            )}
            <p className="text-xs text-muted-foreground">URL to product image (optional)</p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Product Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Selling Price:</span>
            <CurrencyDisplay amount={watchedUnitPrice} size="sm" />
          </div>
          {watchedCostPrice && watchedCostPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost Price:</span>
              <CurrencyDisplay amount={watchedCostPrice} size="sm" />
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax Rate:</span>
            <span className="font-medium">{watchedTaxRate}%</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Price with Tax:</span>
            <CurrencyDisplay amount={priceWithTax} size="sm" />
          </div>
          {watchedTrackInventory && !watchedIsService && (
            <>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Stock:</span>
                <span className="font-medium">{watch('current_stock') || 0} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minimum Stock:</span>
                <span className="font-medium">{watch('minimum_stock') || 0} units</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons - Sticky on mobile */}
      <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-4 px-4 sm:mx-0 sm:px-0 sm:border-0 sm:static flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
