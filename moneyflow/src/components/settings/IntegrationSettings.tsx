// src/components/settings/IntegrationSettings.tsx
import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plug, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIntegrationSettings } from '@/hooks/useSettings';
import { Loader } from '@/components/common/Loader';
import { z } from 'zod';

const integrationSettingsSchema = z.object({
  email_service: z.enum(['sendgrid', 'resend', 'smtp']).optional().nullable(),
  email_api_key: z.string().optional().nullable(),
  sms_service: z.enum(['twilio', 'other']).optional().nullable(),
  sms_api_key: z.string().optional().nullable(),
  accounting_software: z.enum(['quickbooks', 'xero', 'sage']).optional().nullable(),
  accounting_api_key: z.string().optional().nullable(),
  crm_integration: z.enum(['salesforce', 'hubspot']).optional().nullable(),
  crm_api_key: z.string().optional().nullable(),
  payment_gateway: z.enum(['jazzcash', 'easypaisa', 'raast', 'sadapay', 'nayapay']).optional().nullable(),
  payment_api_key: z.string().optional().nullable(),
  payment_merchant_id: z.string().optional().nullable(),
});

type IntegrationSettingsFormData = z.infer<typeof integrationSettingsSchema>;

export function IntegrationSettings() {
  const { settings, updateSettings, isUpdating, isLoading } = useIntegrationSettings();
  const [showEmailKey, setShowEmailKey] = useState(false);
  const [showSmsKey, setShowSmsKey] = useState(false);
  const [showAccountingKey, setShowAccountingKey] = useState(false);
  const [showCrmKey, setShowCrmKey] = useState(false);

  const [formInitialized, setFormInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<IntegrationSettingsFormData>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      email_service: null,
      email_api_key: '',
      sms_service: null,
      sms_api_key: '',
      accounting_software: null,
      accounting_api_key: '',
      crm_integration: null,
      crm_api_key: '',
      payment_gateway: null,
      payment_api_key: '',
      payment_merchant_id: '',
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings && !formInitialized) {
      reset({
        email_service: settings.email_service || null,
        email_api_key: settings.email_api_key ?? '',
        sms_service: settings.sms_service || null,
        sms_api_key: settings.sms_api_key ?? '',
        accounting_software: settings.accounting_software || null,
        accounting_api_key: settings.accounting_api_key ?? '',
        crm_integration: settings.crm_integration || null,
        crm_api_key: settings.crm_api_key ?? '',
        payment_gateway: settings.payment_gateway || null,
        payment_api_key: settings.payment_api_key ?? '',
        payment_merchant_id: settings.payment_merchant_id ?? '',
      });
      setFormInitialized(true);
    }
  }, [settings, formInitialized, reset]);

  const emailService = watch('email_service');
  const smsService = watch('sms_service');
  const accountingSoftware = watch('accounting_software');
  const crmIntegration = watch('crm_integration');
  const paymentGateway = watch('payment_gateway');

  const handleFormSubmit = async (data: IntegrationSettingsFormData) => {
    try {
      await updateSettings({
        email_service: data.email_service || null,
        email_api_key: data.email_api_key || null,
        sms_service: data.sms_service || null,
        sms_api_key: data.sms_api_key || null,
        accounting_software: data.accounting_software || null,
        accounting_api_key: data.accounting_api_key || null,
        crm_integration: data.crm_integration || null,
        crm_api_key: data.crm_api_key || null,
        payment_gateway: data.payment_gateway || null,
        payment_api_key: data.payment_api_key || null,
        payment_merchant_id: data.payment_merchant_id || null,
      });
    } catch (error) {

      logger.error('Error updating integration settings:', error instanceof Error ? error.message : String(error));
    }
  };

  if (isLoading) {
    return <Loader message="Loading integration settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Email Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Email Service
          </CardTitle>
          <CardDescription>Configure email service for sending invoices and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email_service">Email Service Provider</Label>
            <Select
              value={emailService ?? ''}
              onValueChange={(value) => setValue('email_service', value as 'sendgrid' | 'resend' | 'smtp')}
              disabled={isUpdating}
            >
              <SelectTrigger id="email_service">
                <SelectValue placeholder="Select email service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="resend">Resend</SelectItem>
                <SelectItem value="smtp">SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {emailService && (
            <div className="space-y-2">
              <Label htmlFor="email_api_key">API Key</Label>
              <div className="relative">
                <Input
                  id="email_api_key"
                  type={showEmailKey ? 'text' : 'password'}
                  {...register('email_api_key')}
                  error={!!errors.email_api_key}
                  disabled={isUpdating}
                  placeholder="Enter API key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowEmailKey(!showEmailKey)}
                >
                  {showEmailKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.email_api_key && (
                <p className="text-sm text-destructive">{errors.email_api_key.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Service */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Service</CardTitle>
          <CardDescription>Configure SMS service for sending notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sms_service">SMS Service Provider</Label>
            <Select
              value={smsService ?? ''}
              onValueChange={(value) => setValue('sms_service', value as 'twilio' | 'other')}
              disabled={isUpdating}
            >
              <SelectTrigger id="sms_service">
                <SelectValue placeholder="Select SMS service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {smsService && (
            <div className="space-y-2">
              <Label htmlFor="sms_api_key">API Key</Label>
              <div className="relative">
                <Input
                  id="sms_api_key"
                  type={showSmsKey ? 'text' : 'password'}
                  {...register('sms_api_key')}
                  error={!!errors.sms_api_key}
                  disabled={isUpdating}
                  placeholder="Enter API key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowSmsKey(!showSmsKey)}
                >
                  {showSmsKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.sms_api_key && (
                <p className="text-sm text-destructive">{errors.sms_api_key.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accounting Software */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Software</CardTitle>
          <CardDescription>Connect with accounting software for data sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accounting_software">Accounting Software</Label>
            <Select
              value={accountingSoftware ?? ''}
              onValueChange={(value) => setValue('accounting_software', value as 'quickbooks' | 'xero' | 'sage')}
              disabled={isUpdating}
            >
              <SelectTrigger id="accounting_software">
                <SelectValue placeholder="Select accounting software" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quickbooks">QuickBooks</SelectItem>
                <SelectItem value="xero">Xero</SelectItem>
                <SelectItem value="sage">Sage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {accountingSoftware && (
            <div className="space-y-2">
              <Label htmlFor="accounting_api_key">API Key / Access Token</Label>
              <div className="relative">
                <Input
                  id="accounting_api_key"
                  type={showAccountingKey ? 'text' : 'password'}
                  {...register('accounting_api_key')}
                  error={!!errors.accounting_api_key}
                  disabled={isUpdating}
                  placeholder="Enter API key or access token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowAccountingKey(!showAccountingKey)}
                >
                  {showAccountingKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.accounting_api_key && (
                <p className="text-sm text-destructive">{errors.accounting_api_key.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CRM Integration */}
      <Card>
        <CardHeader>
          <CardTitle>CRM Integration</CardTitle>
          <CardDescription>Connect with CRM for customer data sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crm_integration">CRM Platform</Label>
            <Select
              value={crmIntegration ?? ''}
              onValueChange={(value) => setValue('crm_integration', value as 'salesforce' | 'hubspot')}
              disabled={isUpdating}
            >
              <SelectTrigger id="crm_integration">
                <SelectValue placeholder="Select CRM platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salesforce">Salesforce</SelectItem>
                <SelectItem value="hubspot">HubSpot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {crmIntegration && (
            <div className="space-y-2">
              <Label htmlFor="crm_api_key">API Key / Access Token</Label>
              <div className="relative">
                <Input
                  id="crm_api_key"
                  type={showCrmKey ? 'text' : 'password'}
                  {...register('crm_api_key')}
                  error={!!errors.crm_api_key}
                  disabled={isUpdating}
                  placeholder="Enter API key or access token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCrmKey(!showCrmKey)}
                >
                  {showCrmKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.crm_api_key && (
                <p className="text-sm text-destructive">{errors.crm_api_key.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pakistani Payment Gateway */}
      <Card className="border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:border-green-900/30 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            Pakistani Payment Gateway
          </CardTitle>
          <CardDescription>Connect with local Pakistani payment providers for seamless transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_gateway">Payment Provider</Label>
            <Select
              value={paymentGateway ?? ''}
              onValueChange={(value) => setValue('payment_gateway', value as 'jazzcash' | 'easypaisa' | 'raast' | 'sadapay' | 'nayapay')}
              disabled={isUpdating}
            >
              <SelectTrigger id="payment_gateway">
                <SelectValue placeholder="Select payment provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                <SelectItem value="raast">Raast (SBP)</SelectItem>
                <SelectItem value="sadapay">SadaPay</SelectItem>
                <SelectItem value="nayapay">NayaPay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentGateway && (
            <>
              <div className="space-y-2">
                <Label htmlFor="payment_merchant_id">Merchant ID</Label>
                <Input
                  id="payment_merchant_id"
                  {...register('payment_merchant_id')}
                  disabled={isUpdating}
                  placeholder="Enter merchant ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_api_key">API Key / Secret</Label>
                <div className="relative">
                  <Input
                    id="payment_api_key"
                    type={showCrmKey ? 'text' : 'password'}
                    {...register('payment_api_key')}
                    error={!!errors.payment_api_key}
                    disabled={isUpdating}
                    placeholder="Enter API key or secret"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit(handleFormSubmit)} disabled={isUpdating || !isDirty}>
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
    </div>
  );
}

