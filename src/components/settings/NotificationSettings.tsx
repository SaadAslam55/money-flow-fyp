// src/components/settings/NotificationSettings.tsx
/**
 * Notification Settings Component
 * Configure email, push, and in-app notification preferences
 */

import { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  FileText,
  CreditCard,
  Package,
  TrendingUp,
  Loader2,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotificationPreferences } from '@/hooks/useSettings';
import { Loader } from '@/components/common/Loader';

interface LocalPreferences {
  // Email Notifications
  emailEnabled: boolean;
  emailInvoiceCreated: boolean;
  emailInvoicePaid: boolean;
  emailInvoiceOverdue: boolean;
  emailPaymentReceived: boolean;
  emailLowStock: boolean;
  emailWeeklyReport: boolean;
  emailMonthlyReport: boolean;

  // Push Notifications (stored locally - browser-based)
  pushEnabled: boolean;
  pushInvoicePaid: boolean;
  pushPaymentReceived: boolean;
  pushLowStock: boolean;
  pushNewCustomer: boolean;

  // In-App Notifications
  inAppEnabled: boolean;
  inAppSound: boolean;

  // Digest Settings
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const defaultPreferences: LocalPreferences = {
  emailEnabled: true,
  emailInvoiceCreated: true,
  emailInvoicePaid: true,
  emailInvoiceOverdue: true,
  emailPaymentReceived: true,
  emailLowStock: true,
  emailWeeklyReport: false,
  emailMonthlyReport: true,

  pushEnabled: true,
  pushInvoicePaid: true,
  pushPaymentReceived: true,
  pushLowStock: true,
  pushNewCustomer: false,

  inAppEnabled: true,
  inAppSound: true,

  digestFrequency: 'realtime',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export function NotificationSettings() {
  const { preferences: backendPrefs, updatePreferences, isUpdating, isLoading } = useNotificationPreferences();
  const [localPreferences, setLocalPreferences] = useState<LocalPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Sync backend preferences to local state
  useEffect(() => {
    if (backendPrefs && !formInitialized) {
      setLocalPreferences({
        emailEnabled: true, // Master toggle (derived from having any email notifications)
        emailInvoiceCreated: backendPrefs.email_notifications?.invoices ?? true,
        emailInvoicePaid: backendPrefs.email_notifications?.payments ?? true,
        emailInvoiceOverdue: backendPrefs.email_notifications?.invoices ?? true,
        emailPaymentReceived: backendPrefs.email_notifications?.payments ?? true,
        emailLowStock: backendPrefs.email_notifications?.low_stock ?? true,
        emailWeeklyReport: backendPrefs.email_notifications?.weekly_report ?? false,
        emailMonthlyReport: backendPrefs.email_notifications?.monthly_report ?? true,

        pushEnabled: true,
        pushInvoicePaid: true,
        pushPaymentReceived: true,
        pushLowStock: true,
        pushNewCustomer: false,

        inAppEnabled: backendPrefs.in_app_notifications?.invoices ?? true,
        inAppSound: backendPrefs.in_app_notifications?.sound ?? true,

        digestFrequency: backendPrefs.digest_frequency ?? 'realtime',
        quietHoursEnabled: backendPrefs.quiet_hours_enabled ?? false,
        quietHoursStart: backendPrefs.quiet_hours_start ?? '22:00',
        quietHoursEnd: backendPrefs.quiet_hours_end ?? '08:00',
      });
      setFormInitialized(true);
    }
  }, [backendPrefs, formInitialized]);

  const updatePreference = <K extends keyof LocalPreferences>(
    key: K,
    value: LocalPreferences[K]
  ) => {
    setLocalPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Map local preferences to backend format
      await updatePreferences({
        email_notifications: {
          invoices: localPreferences.emailInvoiceCreated || localPreferences.emailInvoicePaid || localPreferences.emailInvoiceOverdue,
          payments: localPreferences.emailPaymentReceived,
          low_stock: localPreferences.emailLowStock,
          weekly_report: localPreferences.emailWeeklyReport,
          monthly_report: localPreferences.emailMonthlyReport,
        },
        sms_notifications: {
          invoices: false,
          payments: false,
        },
        in_app_notifications: {
          invoices: localPreferences.inAppEnabled,
          payments: localPreferences.inAppEnabled,
          low_stock: localPreferences.inAppEnabled,
          sound: localPreferences.inAppSound,
        },
        digest_frequency: localPreferences.digestFrequency,
        quiet_hours_enabled: localPreferences.quietHoursEnabled,
        quiet_hours_start: localPreferences.quietHoursStart,
        quiet_hours_end: localPreferences.quietHoursEnd,
      });
      setHasChanges(false);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return <Loader message="Loading notification preferences..." />;
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose which emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled" className="text-base font-medium">
                Enable Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              id="email-enabled"
              checked={localPreferences.emailEnabled}
              onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
            />
          </div>

          {localPreferences.emailEnabled && (
            <>
              <Separator />

              {/* Invoice Notifications */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Invoices
                </h4>
                <div className="ml-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-invoice-created">Invoice created</Label>
                    <Switch
                      id="email-invoice-created"
                      checked={localPreferences.emailInvoiceCreated}
                      onCheckedChange={(checked) =>
                        updatePreference('emailInvoiceCreated', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-invoice-paid">Invoice paid</Label>
                    <Switch
                      id="email-invoice-paid"
                      checked={localPreferences.emailInvoicePaid}
                      onCheckedChange={(checked) => updatePreference('emailInvoicePaid', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-invoice-overdue">Invoice overdue</Label>
                    <Switch
                      id="email-invoice-overdue"
                      checked={localPreferences.emailInvoiceOverdue}
                      onCheckedChange={(checked) =>
                        updatePreference('emailInvoiceOverdue', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Notifications */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4" />
                  Payments
                </h4>
                <div className="ml-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-payment-received">Payment received</Label>
                    <Switch
                      id="email-payment-received"
                      checked={localPreferences.emailPaymentReceived}
                      onCheckedChange={(checked) =>
                        updatePreference('emailPaymentReceived', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Inventory Notifications */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4" />
                  Inventory
                </h4>
                <div className="ml-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-low-stock">Low stock alerts</Label>
                    <Switch
                      id="email-low-stock"
                      checked={localPreferences.emailLowStock}
                      onCheckedChange={(checked) => updatePreference('emailLowStock', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reports */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Reports
                </h4>
                <div className="ml-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-weekly-report">Weekly summary</Label>
                    <Switch
                      id="email-weekly-report"
                      checked={localPreferences.emailWeeklyReport}
                      onCheckedChange={(checked) => updatePreference('emailWeeklyReport', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-monthly-report">Monthly report</Label>
                    <Switch
                      id="email-monthly-report"
                      checked={localPreferences.emailMonthlyReport}
                      onCheckedChange={(checked) => updatePreference('emailMonthlyReport', checked)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Get instant notifications on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled" className="text-base font-medium">
                Enable Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
            </div>
            <Switch
              id="push-enabled"
              checked={localPreferences.pushEnabled}
              onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
            />
          </div>

          {localPreferences.pushEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-invoice-paid">Invoice paid</Label>
                  <Switch
                    id="push-invoice-paid"
                    checked={localPreferences.pushInvoicePaid}
                    onCheckedChange={(checked) => updatePreference('pushInvoicePaid', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-payment-received">Payment received</Label>
                  <Switch
                    id="push-payment-received"
                    checked={localPreferences.pushPaymentReceived}
                    onCheckedChange={(checked) => updatePreference('pushPaymentReceived', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-low-stock">Low stock alerts</Label>
                  <Switch
                    id="push-low-stock"
                    checked={localPreferences.pushLowStock}
                    onCheckedChange={(checked) => updatePreference('pushLowStock', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-new-customer">New customer</Label>
                  <Switch
                    id="push-new-customer"
                    checked={localPreferences.pushNewCustomer}
                    onCheckedChange={(checked) => updatePreference('pushNewCustomer', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>Notifications shown within the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-enabled">Enable In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notification toasts and badges</p>
            </div>
            <Switch
              id="inapp-enabled"
              checked={localPreferences.inAppEnabled}
              onCheckedChange={(checked) => updatePreference('inAppEnabled', checked)}
            />
          </div>

          {localPreferences.inAppEnabled && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inapp-sound">Notification Sound</Label>
                <p className="text-sm text-muted-foreground">Play a sound for new notifications</p>
              </div>
              <Switch
                id="inapp-sound"
                checked={localPreferences.inAppSound}
                onCheckedChange={(checked) => updatePreference('inAppSound', checked)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Schedule
          </CardTitle>
          <CardDescription>Control when and how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Digest Frequency */}
          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select
              value={localPreferences.digestFrequency}
              onValueChange={(value) =>
                updatePreference(
                  'digestFrequency',
                  value as LocalPreferences['digestFrequency']
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time (Instant)</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {localPreferences.digestFrequency === 'realtime'
                ? 'Receive notifications as they happen'
                : `Receive a summary of notifications ${localPreferences.digestFrequency}`}
            </p>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="quiet-hours">Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Pause notifications during specific hours
                </p>
              </div>
              <Switch
                id="quiet-hours"
                checked={localPreferences.quietHoursEnabled}
                onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
              />
            </div>

            {localPreferences.quietHoursEnabled && (
              <div className="ml-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <input
                    type="time"
                    id="quiet-start"
                    value={localPreferences.quietHoursStart}
                    onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End Time</Label>
                  <input
                    type="time"
                    id="quiet-end"
                    value={localPreferences.quietHoursEnd}
                    onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating || !hasChanges}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Notification Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
