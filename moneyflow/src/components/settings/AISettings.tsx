// src/components/settings/AISettings.tsx
/**
 * AI Settings Component
 * User-facing controls for AI-powered features
 */

import { useState, useEffect } from 'react';
import { Sparkles, Brain, TrendingUp, ShoppingCart, Receipt, Users, Bell, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface AISettingItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultEnabled: boolean;
}

const AI_SETTINGS: AISettingItem[] = [
  {
    id: 'ai_product_suggestions',
    label: 'Product Suggestions',
    description: 'Suggest frequently ordered products when creating invoices',
    icon: ShoppingCart,
    defaultEnabled: true,
  },
  {
    id: 'ai_expense_categorization',
    label: 'Smart Expense Categorization',
    description: 'Automatically suggest categories based on transaction descriptions',
    icon: Receipt,
    defaultEnabled: true,
  },
  {
    id: 'ai_business_insights',
    label: 'Business Insights',
    description: 'AI-powered alerts for low stock, overdue invoices, and revenue trends',
    icon: TrendingUp,
    defaultEnabled: true,
  },
  {
    id: 'ai_anomaly_detection',
    label: 'Anomaly Detection',
    description: 'Detect unusual spending patterns and transaction anomalies',
    icon: Brain,
    defaultEnabled: true,
  },
  {
    id: 'ai_revenue_prediction',
    label: 'Revenue Forecasting',
    description: 'Predict future revenue based on historical data',
    icon: TrendingUp,
    defaultEnabled: true,
  },
  {
    id: 'ai_churn_prediction',
    label: 'Churn Prediction',
    description: 'Identify at-risk customers using RFM analysis',
    icon: Users,
    defaultEnabled: true,
  },
  {
    id: 'ai_notifications',
    label: 'AI Notifications',
    description: 'Receive smart alerts and recommendations as notifications',
    icon: Bell,
    defaultEnabled: true,
  },
];

function getStoredSettings(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem('ai_settings');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return AI_SETTINGS.reduce((acc, s) => ({ ...acc, [s.id]: s.defaultEnabled }), {});
}

function saveSettings(settings: Record<string, boolean>) {
  localStorage.setItem('ai_settings', JSON.stringify(settings));
}

export function AISettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>(getStoredSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const toggleSetting = (id: string) => {
    setSettings((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast.success(`${AI_SETTINGS.find((s) => s.id === id)?.label} ${next[id] ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI Features
          </CardTitle>
          <CardDescription>
            Control which AI-powered features are active in your account.
            All AI processing is done locally — your data never leaves your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                MoneyFlow AI uses statistical analysis and rule-based algorithms on your local data.
                No data is sent to external AI services. You can disable any feature at any time.
              </p>
            </div>
          </div>

          <Separator />

          {AI_SETTINGS.map((setting) => {
            const Icon = setting.icon;
            const enabled = settings[setting.id] ?? setting.defaultEnabled;
            return (
              <div
                key={setting.id}
                className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1.5 ${enabled ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor={setting.id} className="cursor-pointer font-medium">
                      {setting.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch
                  id={setting.id}
                  checked={enabled}
                  onCheckedChange={() => toggleSetting(setting.id)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
