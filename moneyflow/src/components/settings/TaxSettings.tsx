// src/components/settings/TaxSettings.tsx
import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Receipt, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTaxSettings } from '@/hooks/useSettings';
import { Loader } from '@/components/common/Loader';
import { taxSettingsSchema } from '@/schemas/settingsSchemas';
import type { TaxSettingsData } from '@/schemas/settingsSchemas';

export function TaxSettings() {
  const { settings, updateSettings, isUpdating, isLoading } = useTaxSettings();
  const [formInitialized, setFormInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<TaxSettingsData>({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      tax_enabled: true,
      default_tax_rate: 17,
      tax_name: 'GST',
      tax_number: '',
      compound_tax: false,
      tax_inclusive: false,
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings && !formInitialized) {
      reset({
        tax_enabled: settings.tax_enabled ?? true,
        default_tax_rate: settings.default_tax_rate ?? 17,
        tax_name: settings.tax_name ?? 'GST',
        tax_number: settings.tax_number ?? '',
        compound_tax: settings.compound_tax ?? false,
        tax_inclusive: settings.tax_inclusive ?? false,
      });
      setFormInitialized(true);
    }
  }, [settings, formInitialized, reset]);

  const taxEnabled = watch('tax_enabled');
  const taxInclusive = watch('tax_inclusive');
  const compoundTax = watch('compound_tax');

  const handleFormSubmit = async (data: TaxSettingsData) => {
    try {
      await updateSettings(data);
    } catch (error) {
      logger.error('Error updating tax settings:', error instanceof Error ? error.message : String(error));
    }
  };

  if (isLoading) {
    return <Loader message="Loading tax settings..." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Tax Settings
        </CardTitle>
        <CardDescription>Configure tax rates and tax display preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Tax Enabled Toggle */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="space-y-0.5">
              <Label htmlFor="tax_enabled">Enable Tax</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable tax calculations for your business
              </p>
            </div>
            <Switch
              id="tax_enabled"
              checked={taxEnabled}
              onCheckedChange={(checked) => setValue('tax_enabled', checked, { shouldDirty: true })}
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tax_name">
                Tax Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tax_name"
                {...register('tax_name')}
                error={!!errors.tax_name}
                disabled={isUpdating || !taxEnabled}
                placeholder="GST, VAT, Sales Tax"
              />
              {errors.tax_name && (
                <p className="text-sm text-destructive">{errors.tax_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_tax_rate">
                Default Tax Rate (%) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="default_tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('default_tax_rate', { valueAsNumber: true })}
                error={!!errors.default_tax_rate}
                disabled={isUpdating || !taxEnabled}
              />
              {errors.default_tax_rate && (
                <p className="text-sm text-destructive">{errors.default_tax_rate.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tax_number">Tax Registration Number (NTN)</Label>
              <Input
                id="tax_number"
                {...register('tax_number')}
                error={!!errors.tax_number}
                disabled={isUpdating}
                placeholder="e.g., NTN-1234567-8"
              />
              {errors.tax_number && (
                <p className="text-sm text-destructive">{errors.tax_number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tax_inclusive">Tax Inclusive Pricing</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, prices include tax. When disabled, tax is added on top.
                </p>
              </div>
              <Switch
                id="tax_inclusive"
                checked={taxInclusive}
                onCheckedChange={(checked) => setValue('tax_inclusive', checked, { shouldDirty: true })}
                disabled={isUpdating || !taxEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compound_tax">Compound Tax</Label>
                <p className="text-sm text-muted-foreground">
                  Apply tax on top of other taxes (tax-on-tax calculation)
                </p>
              </div>
              <Switch
                id="compound_tax"
                checked={compoundTax}
                onCheckedChange={(checked) => setValue('compound_tax', checked, { shouldDirty: true })}
                disabled={isUpdating || !taxEnabled}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isUpdating || !isDirty}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

