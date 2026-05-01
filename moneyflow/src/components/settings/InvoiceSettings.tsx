// src/components/settings/InvoiceSettings.tsx
import { logger } from '@/lib/logger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useInvoiceSettings } from '@/hooks/useSettings';
import { Loader } from '@/components/common/Loader';
import { invoiceSettingsSchema } from '@/schemas/settingsSchemas';
import type { InvoiceSettingsData } from '@/schemas/settingsSchemas';

export function InvoiceSettings() {
  const { settings, updateSettings, isUpdating, isLoading } = useInvoiceSettings();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<InvoiceSettingsData>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: settings
      ? {
          invoice_prefix: settings.invoice_prefix ?? 'INV',
          invoice_number_format: 'year_sequential',
          default_due_days: settings.payment_terms_days ?? 30,
          default_notes: settings.default_notes ?? '',
          default_terms: settings.default_terms ?? '',
          invoice_footer_text: '',
          enable_invoice_numbering: true,
          auto_send_invoices: false,
        }
      : {
          invoice_prefix: 'INV',
          invoice_number_format: 'year_sequential',
          default_due_days: 30,
          enable_invoice_numbering: true,
          auto_send_invoices: false,
        },
  });

  const invoiceNumberFormat = watch('invoice_number_format');
  const enableInvoiceNumbering = watch('enable_invoice_numbering');
  const autoSendInvoices = watch('auto_send_invoices');

  const handleFormSubmit = async (data: InvoiceSettingsData) => {
    try {
      await updateSettings({
        invoice_prefix: data.invoice_prefix,
        invoice_starting_number: 1, // This would be managed separately
        default_terms: data.default_terms || null,
        default_notes: data.default_notes || null,
        payment_terms_days: data.default_due_days,
        late_fee_percentage: 0, // This would be managed separately
      });
    } catch (error) {

      logger.error('Error updating invoice settings:', error instanceof Error ? error.message : String(error));
    }
  };

  if (isLoading) {
    return <Loader message="Loading invoice settings..." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoice Settings
        </CardTitle>
        <CardDescription>Configure default invoice settings and templates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
              <Input
                id="invoice_prefix"
                {...register('invoice_prefix')}
                error={!!errors.invoice_prefix}
                disabled={isUpdating}
                placeholder="INV"
                maxLength={10}
              />
              {errors.invoice_prefix && (
                <p className="text-sm text-destructive">{errors.invoice_prefix.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Prefix for invoice numbers (e.g., INV-2024-001)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number_format">Invoice Number Format</Label>
              <Select
                value={invoiceNumberFormat}
                onValueChange={(value) => setValue('invoice_number_format', value as any)}
                disabled={isUpdating}
              >
                <SelectTrigger id="invoice_number_format" className={errors.invoice_number_format ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential (001, 002, 003)</SelectItem>
                  <SelectItem value="year_sequential">
                    Year + Sequential (2024-001, 2024-002)
                  </SelectItem>
                  <SelectItem value="custom">Custom Format</SelectItem>
                </SelectContent>
              </Select>
              {errors.invoice_number_format && (
                <p className="text-sm text-destructive">{errors.invoice_number_format.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_due_days">Default Payment Terms (Days)</Label>
              <Input
                id="default_due_days"
                type="number"
                min="0"
                max="365"
                {...register('default_due_days', { valueAsNumber: true })}
                error={!!errors.default_due_days}
                disabled={isUpdating}
              />
              {errors.default_due_days && (
                <p className="text-sm text-destructive">{errors.default_due_days.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_terms">Default Terms & Conditions</Label>
              <Textarea
                id="default_terms"
                {...register('default_terms')}
                error={!!errors.default_terms}
                disabled={isUpdating}
                rows={4}
                placeholder="Enter default terms and conditions for invoices..."
              />
              {errors.default_terms && (
                <p className="text-sm text-destructive">{errors.default_terms.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_notes">Default Notes</Label>
              <Textarea
                id="default_notes"
                {...register('default_notes')}
                error={!!errors.default_notes}
                disabled={isUpdating}
                rows={3}
                placeholder="Enter default notes to appear on invoices..."
              />
              {errors.default_notes && (
                <p className="text-sm text-destructive">{errors.default_notes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_footer_text">Invoice Footer Text</Label>
              <Textarea
                id="invoice_footer_text"
                {...register('invoice_footer_text')}
                error={!!errors.invoice_footer_text}
                disabled={isUpdating}
                rows={2}
                placeholder="Enter footer text (e.g., Thank you for your business!)"
              />
              {errors.invoice_footer_text && (
                <p className="text-sm text-destructive">{errors.invoice_footer_text.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable_invoice_numbering">Enable Invoice Numbering</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate sequential invoice numbers
                </p>
              </div>
              <Switch
                id="enable_invoice_numbering"
                checked={enableInvoiceNumbering}
                onCheckedChange={(checked) => setValue('enable_invoice_numbering', checked)}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_send_invoices">Auto-Send Invoices</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically email invoices to customers when created
                </p>
              </div>
              <Switch
                id="auto_send_invoices"
                checked={autoSendInvoices}
                onCheckedChange={(checked) => setValue('auto_send_invoices', checked)}
                disabled={isUpdating}
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

