// src/services/api/settingsApi.ts
/**
 * Settings API Service
 * Handles application settings management including business profile, tax settings,
 * invoice settings, integrations, API keys, webhooks, and notification preferences
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import { successResponse, errorResponse, type ApiResponse } from './baseApi';

/**
 * Invoice Settings
 */
export interface InvoiceSettings {
  organization_id: string;
  invoice_prefix: string;
  invoice_starting_number: number;
  default_terms?: string | null;
  default_notes?: string | null;
  default_tax_rate: number;
  payment_terms_days: number;
  late_fee_percentage: number;
  created_at: string;
  updated_at: string;
}

/**
 * Tax Settings
 */
export interface TaxSettings {
  id?: string;
  organization_id: string;
  tax_enabled: boolean;
  default_tax_rate: number;
  tax_number?: string | null;
  tax_name: string;
  compound_tax: boolean;
  tax_inclusive: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Single Integration Record (matches database schema)
 */
export interface IntegrationRecord {
  id?: string;
  organization_id: string;
  provider: string;
  enabled: boolean;
  config: Record<string, any>;
  credentials: Record<string, any>;
  last_sync_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Integration Settings (aggregated view for frontend)
 */
export interface IntegrationSettings {
  organization_id: string;
  email_service?: 'sendgrid' | 'resend' | 'smtp' | null;
  email_api_key?: string | null;
  sms_service?: 'twilio' | 'other' | null;
  sms_api_key?: string | null;
  accounting_software?: 'quickbooks' | 'xero' | 'sage' | null;
  accounting_api_key?: string | null;
  crm_integration?: 'salesforce' | 'hubspot' | null;
  crm_api_key?: string | null;
  payment_gateway?: 'jazzcash' | 'easypaisa' | 'raast' | 'sadapay' | 'nayapay' | null;
  payment_api_key?: string | null;
  payment_merchant_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * API Key (matches database schema)
 */
export interface APIKey {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: string[];
  is_active: boolean;
  last_used_at?: string | null;
  expires_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Alias for frontend compatibility
  permissions?: string[];
}

/**
 * Webhook
 */
export interface Webhook {
  id: string;
  organization_id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Notification Preferences (matches database schema)
 */
export interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_notifications: {
    invoices?: boolean;
    payments?: boolean;
    low_stock?: boolean;
    weekly_report?: boolean;
    monthly_report?: boolean;
    [key: string]: boolean | undefined;
  };
  sms_notifications: {
    invoices?: boolean;
    payments?: boolean;
    [key: string]: boolean | undefined;
  };
  in_app_notifications: {
    invoices?: boolean;
    payments?: boolean;
    low_stock?: boolean;
    sound?: boolean;
    [key: string]: boolean | undefined;
  };
  digest_frequency?: 'realtime' | 'hourly' | 'daily' | 'weekly';
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get invoice settings
 */
export async function getInvoiceSettings(organizationId: string): Promise<ApiResponse<InvoiceSettings>> {
  try {
    const { data, error } = await supabase
      .from('invoice_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    // Return default settings if none exist
    if (!data) {
      const defaultSettings: InvoiceSettings = {
        organization_id: organizationId,
        invoice_prefix: 'INV',
        invoice_starting_number: 1,
        default_tax_rate: 0,
        payment_terms_days: 30,
        late_fee_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return successResponse(defaultSettings);
    }

    return successResponse(data as InvoiceSettings);
  } catch (error) {
    logger.error('Error fetching invoice settings:', error instanceof Error ? error.message : String(error));
    return errorResponse<InvoiceSettings>(error);
  }
}

/**
 * Update invoice settings
 */
export async function updateInvoiceSettings(
  organizationId: string,
  settings: Partial<Omit<InvoiceSettings, 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<InvoiceSettings>> {
  try {
    const { data, error } = await supabase
      .from('invoice_settings')
      .upsert({
        organization_id: organizationId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as InvoiceSettings);
  } catch (error) {
    logger.error('Error updating invoice settings:', error instanceof Error ? error.message : String(error));
    return errorResponse<InvoiceSettings>(error);
  }
}

/**
 * Get tax settings
 */
export async function getTaxSettings(organizationId: string): Promise<ApiResponse<TaxSettings>> {
  try {
    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      const defaultSettings: TaxSettings = {
        organization_id: organizationId,
        tax_enabled: true,
        default_tax_rate: 17,
        tax_number: null,
        tax_name: 'GST',
        compound_tax: false,
        tax_inclusive: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return successResponse(defaultSettings);
    }

    return successResponse(data as TaxSettings);
  } catch (error) {
    logger.error('Error fetching tax settings:', error instanceof Error ? error.message : String(error));
    return errorResponse<TaxSettings>(error);
  }
}

/**
 * Update tax settings
 */
export async function updateTaxSettings(
  organizationId: string,
  settings: Partial<Omit<TaxSettings, 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<TaxSettings>> {
  try {
    const { data, error } = await supabase
      .from('tax_settings')
      .upsert({
        organization_id: organizationId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as TaxSettings);
  } catch (error) {
    logger.error('Error updating tax settings:', error instanceof Error ? error.message : String(error));
    return errorResponse<TaxSettings>(error);
  }
}

/**
 * Provider type mapping for integration settings
 */
const PROVIDER_TYPES = {
  email: ['sendgrid', 'resend', 'smtp'],
  sms: ['twilio', 'other'],
  accounting: ['quickbooks', 'xero', 'sage'],
  crm: ['salesforce', 'hubspot'],
} as const;

/**
 * Get integration settings (aggregates multi-row data into single object)
 */
export async function getIntegrationSettings(organizationId: string): Promise<ApiResponse<IntegrationSettings>> {
  try {
    const { data, error } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;

    // Aggregate multiple rows into single settings object
    const settings: IntegrationSettings = {
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (data && data.length > 0) {
      for (const record of data as IntegrationRecord[]) {
        if (!record.enabled) continue;
        
        const provider = record.provider;
        const apiKey = record.credentials?.api_key || null;

        // Map provider to appropriate field
        if ((PROVIDER_TYPES.email as readonly string[]).includes(provider)) {
          settings.email_service = provider as IntegrationSettings['email_service'];
          settings.email_api_key = apiKey;
        } else if ((PROVIDER_TYPES.sms as readonly string[]).includes(provider)) {
          settings.sms_service = provider as IntegrationSettings['sms_service'];
          settings.sms_api_key = apiKey;
        } else if ((PROVIDER_TYPES.accounting as readonly string[]).includes(provider)) {
          settings.accounting_software = provider as IntegrationSettings['accounting_software'];
          settings.accounting_api_key = apiKey;
        } else if ((PROVIDER_TYPES.crm as readonly string[]).includes(provider)) {
          settings.crm_integration = provider as IntegrationSettings['crm_integration'];
          settings.crm_api_key = apiKey;
        }

        // Use latest updated_at
        if (record.updated_at > settings.updated_at) {
          settings.updated_at = record.updated_at;
        }
      }
    }

    return successResponse(settings);
  } catch (error) {
    logger.error('Error fetching integration settings:', error instanceof Error ? error.message : String(error));
    return errorResponse<IntegrationSettings>(error);
  }
}

/**
 * Update integration settings (upserts individual provider rows)
 */
export async function updateIntegrationSettings(
  organizationId: string,
  settings: Partial<Omit<IntegrationSettings, 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<IntegrationSettings>> {
  try {
    const updates: Array<{
      provider: string;
      enabled: boolean;
      credentials: Record<string, any>;
    }> = [];

    // Build update records for each integration type
    if (settings.email_service !== undefined) {
      updates.push({
        provider: settings.email_service || 'none',
        enabled: !!settings.email_service,
        credentials: { api_key: settings.email_api_key || null },
      });
    }

    if (settings.sms_service !== undefined) {
      updates.push({
        provider: settings.sms_service || 'none',
        enabled: !!settings.sms_service,
        credentials: { api_key: settings.sms_api_key || null },
      });
    }

    if (settings.accounting_software !== undefined) {
      updates.push({
        provider: settings.accounting_software || 'none',
        enabled: !!settings.accounting_software,
        credentials: { api_key: settings.accounting_api_key || null },
      });
    }

    if (settings.crm_integration !== undefined) {
      updates.push({
        provider: settings.crm_integration || 'none',
        enabled: !!settings.crm_integration,
        credentials: { api_key: settings.crm_api_key || null },
      });
    }

    // Upsert each integration record
    for (const update of updates) {
      if (update.provider === 'none') {
        // Delete any existing records for this type
        continue;
      }

      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          organization_id: organizationId,
          provider: update.provider,
          enabled: update.enabled,
          credentials: update.credentials,
          config: {},
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'organization_id,provider',
        });

      if (error) throw error;
    }

    // Return aggregated settings
    return getIntegrationSettings(organizationId);
  } catch (error) {
    logger.error('Error updating integration settings:', error instanceof Error ? error.message : String(error));
    return errorResponse<IntegrationSettings>(error);
  }
}

/**
 * Get API keys
 */
export async function getAPIKeys(organizationId: string): Promise<ApiResponse<APIKey[]>> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map scopes to permissions for frontend compatibility
    const apiKeys = (data ?? []).map((key: any) => ({
      ...key,
      permissions: key.scopes || [],
    })) as APIKey[];

    return successResponse(apiKeys);
  } catch (error) {
    logger.error('Error fetching API keys:', error instanceof Error ? error.message : String(error));
    return errorResponse<APIKey[]>(error);
  }
}

/**
 * Generate API key
 */
export async function generateAPIKey(
  organizationId: string,
  userId: string,
  name: string,
  permissions: string[]
): Promise<ApiResponse<APIKey & { key: string }>> {
  try {
    // Generate secure API key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const randomHex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    
    const keyPrefix = `sk_${organizationId.slice(0, 8)}`;
    const apiKey = `${keyPrefix}_${randomHex}`;

    // Hash the key for storage (simple hash for demo - use proper hashing in production)
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const { data: keyData, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: organizationId,
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes: permissions,
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Map scopes to permissions for frontend compatibility
    const result = {
      ...(keyData as APIKey),
      permissions: keyData.scopes || [],
      key: apiKey,
    };

    return successResponse(result);
  } catch (error) {
    logger.error('Error generating API key:', error instanceof Error ? error.message : String(error));
    return errorResponse<APIKey & { key: string }>(error);
  }
}

/**
 * Revoke API key
 */
export async function revokeAPIKey(apiKeyId: string): Promise<ApiResponse<APIKey>> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', apiKeyId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as APIKey);
  } catch (error) {
    logger.error('Error revoking API key:', error instanceof Error ? error.message : String(error));
    return errorResponse<APIKey>(error);
  }
}

/**
 * Delete API key
 */
export async function deleteAPIKey(apiKeyId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', apiKeyId);

    if (error) throw error;

    return successResponse(undefined);
  } catch (error) {
    logger.error('Error deleting API key:', error instanceof Error ? error.message : String(error));
    return errorResponse<void>(error);
  }
}

/**
 * Get webhooks
 */
export async function getWebhooks(organizationId: string): Promise<ApiResponse<Webhook[]>> {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return successResponse((data ?? []) as Webhook[]);
  } catch (error) {
    logger.error('Error fetching webhooks:', error instanceof Error ? error.message : String(error));
    return errorResponse<Webhook[]>(error);
  }
}

/**
 * Create webhook
 */
export async function createWebhook(
  organizationId: string,
  webhook: {
    name: string;
    url: string;
    events: string[];
    secret: string;
  }
): Promise<ApiResponse<Webhook>> {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        organization_id: organizationId,
        ...webhook,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Webhook);
  } catch (error) {
    logger.error('Error creating webhook:', error instanceof Error ? error.message : String(error));
    return errorResponse<Webhook>(error);
  }
}

/**
 * Update webhook
 */
export async function updateWebhook(
  webhookId: string,
  updates: Partial<Omit<Webhook, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<Webhook>> {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', webhookId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Webhook);
  } catch (error) {
    logger.error('Error updating webhook:', error instanceof Error ? error.message : String(error));
    return errorResponse<Webhook>(error);
  }
}

/**
 * Delete webhook
 */
export async function deleteWebhook(webhookId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) throw error;

    return successResponse(undefined);
  } catch (error) {
    logger.error('Error deleting webhook:', error instanceof Error ? error.message : String(error));
    return errorResponse<void>(error);
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(userId: string): Promise<ApiResponse<NotificationPreferences>> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      const defaultPreferences: NotificationPreferences = {
        user_id: userId,
        email_notifications: {
          invoices: true,
          payments: true,
          low_stock: true,
          weekly_report: false,
          monthly_report: true,
        },
        sms_notifications: {
          invoices: false,
          payments: false,
        },
        in_app_notifications: {
          invoices: true,
          payments: true,
          low_stock: true,
          sound: true,
        },
        digest_frequency: 'realtime',
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return successResponse(defaultPreferences);
    }

    return successResponse(data as NotificationPreferences);
  } catch (error) {
    logger.error('Error fetching notification preferences:', error instanceof Error ? error.message : String(error));
    return errorResponse<NotificationPreferences>(error);
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<NotificationPreferences>> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as NotificationPreferences);
  } catch (error) {
    logger.error('Error updating notification preferences:', error instanceof Error ? error.message : String(error));
    return errorResponse<NotificationPreferences>(error);
  }
}

