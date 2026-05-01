// src/schemas/settingsSchemas.ts
import { z } from 'zod';

/**
 * User Profile Schema - For updating user profile
 */
export const userProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long')
    .trim(),

  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),

  phone: z
    .string()
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  avatar_url: z
    .string()
    .url('Invalid avatar URL')
    .optional()
    .nullable(),

  timezone: z
    .string()
    .default('Asia/Karachi'),

  language: z
    .enum(['en', 'ur'])
    .default('en'),
});

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Current password is required'),

  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  confirm_password: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
}).refine((data) => data.current_password !== data.new_password, {
  message: 'New password must be different from current password',
  path: ['new_password'],
});

/**
 * Notification Settings Schema
 */
export const notificationSettingsSchema = z.object({
  email_notifications: z.object({
    invoice_sent: z.boolean().default(true),
    invoice_paid: z.boolean().default(true),
    invoice_overdue: z.boolean().default(true),
    payment_received: z.boolean().default(true),
    low_stock_alert: z.boolean().default(true),
    monthly_report: z.boolean().default(true),
    system_updates: z.boolean().default(false),
  }),

  push_notifications: z.object({
    invoice_sent: z.boolean().default(true),
    invoice_paid: z.boolean().default(true),
    invoice_overdue: z.boolean().default(true),
    payment_received: z.boolean().default(true),
    low_stock_alert: z.boolean().default(true),
  }),

  sms_notifications: z.object({
    invoice_sent: z.boolean().default(false),
    invoice_overdue: z.boolean().default(true),
    payment_received: z.boolean().default(false),
  }),
});

/**
 * Security Settings Schema
 */
export const securitySettingsSchema = z.object({
  two_factor_enabled: z.boolean().default(false),
  session_timeout: z
    .number()
    .int()
    .min(5)
    .max(480)
    .default(60), // minutes

  require_password_for_sensitive_actions: z.boolean().default(true),
  login_notifications: z.boolean().default(true),
});

/**
 * Email Settings Schema
 */
export const emailSettingsSchema = z.object({
  from_name: z
    .string()
    .min(2, 'From name must be at least 2 characters')
    .max(100, 'From name is too long')
    .default('Money Flow'),

  from_email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),

  reply_to_email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .optional(),

  email_signature: z
    .string()
    .max(1000, 'Signature is too long')
    .optional(),

  invoice_email_template: z
    .string()
    .max(5000, 'Template is too long')
    .optional(),

  payment_reminder_template: z
    .string()
    .max(5000, 'Template is too long')
    .optional(),
});

/**
 * Tax Settings Schema
 * Matches database schema: tax_enabled, default_tax_rate, tax_number, tax_name, compound_tax, tax_inclusive
 */
export const taxSettingsSchema = z.object({
  tax_enabled: z.boolean().default(true),

  default_tax_rate: z
    .number()
    .min(0)
    .max(100)
    .default(17),

  tax_name: z
    .string()
    .min(1, 'Tax name is required')
    .max(50, 'Tax name is too long')
    .default('GST'),

  tax_number: z
    .string()
    .max(100, 'Tax number is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),

  compound_tax: z.boolean().default(false),

  tax_inclusive: z.boolean().default(false),
});

/**
 * Payment Settings Schema
 */
export const paymentSettingsSchema = z.object({
  default_payment_method: z
    .enum(['cash', 'bank_transfer', 'card', 'check', 'upi', 'other'])
    .default('cash'),

  default_payment_terms: z
    .number()
    .int()
    .min(0)
    .max(365)
    .default(30), // days

  enable_online_payments: z.boolean().default(false),

  stripe_public_key: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  stripe_secret_key: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  payment_gateway: z
    .enum(['stripe', 'paypal', 'razorpay', 'other'])
    .optional(),
});

/**
 * Invoice Settings Schema
 */
export const invoiceSettingsSchema = z.object({
  invoice_prefix: z
    .string()
    .max(10, 'Prefix is too long')
    .default('INV'),

  invoice_number_format: z
    .enum(['sequential', 'year_sequential', 'custom'])
    .default('year_sequential'),

  default_due_days: z
    .number()
    .int()
    .min(0)
    .max(365)
    .default(30),

  default_notes: z
    .string()
    .max(1000, 'Notes are too long')
    .optional(),

  default_terms: z
    .string()
    .max(2000, 'Terms are too long')
    .optional(),

  invoice_footer_text: z
    .string()
    .max(500, 'Footer text is too long')
    .optional(),

  enable_invoice_numbering: z.boolean().default(true),

  auto_send_invoices: z.boolean().default(false),
});

/**
 * Integration Settings Schema
 */
export const integrationSettingsSchema = z.object({
  email_service: z.enum(['sendgrid', 'resend', 'smtp']).optional().nullable(),
  email_api_key: z.string().optional().nullable(),
  sms_service: z.enum(['twilio', 'other']).optional().nullable(),
  sms_api_key: z.string().optional().nullable(),
  accounting_software: z.enum(['quickbooks', 'xero', 'sage']).optional().nullable(),
  accounting_api_key: z.string().optional().nullable(),
  crm_integration: z.enum(['salesforce', 'hubspot']).optional().nullable(),
  crm_api_key: z.string().optional().nullable(),
});

/**
 * API Key Schema
 */
export const apiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

/**
 * Webhook Schema
 */
export const webhookSchema = z.object({
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  secret: z.string().min(1, 'Secret is required'),
});

/**
 * Backup Settings Schema
 */
export const backupSettingsSchema = z.object({
  auto_backup_enabled: z.boolean().default(true),

  backup_frequency: z
    .enum(['daily', 'weekly', 'monthly'])
    .default('daily'),

  backup_retention_days: z
    .number()
    .int()
    .min(7)
    .max(365)
    .default(30),

  backup_location: z
    .enum(['cloud', 'local', 'both'])
    .default('cloud'),
});

// Type exports
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;
export type SecuritySettingsData = z.infer<typeof securitySettingsSchema>;
export type EmailSettingsData = z.infer<typeof emailSettingsSchema>;
export type TaxSettingsData = z.infer<typeof taxSettingsSchema>;
export type PaymentSettingsData = z.infer<typeof paymentSettingsSchema>;
export type InvoiceSettingsData = z.infer<typeof invoiceSettingsSchema>;
export type IntegrationSettingsData = z.infer<typeof integrationSettingsSchema>;
export type APIKeyData = z.infer<typeof apiKeySchema>;
export type WebhookData = z.infer<typeof webhookSchema>;
export type BackupSettingsData = z.infer<typeof backupSettingsSchema>;

/**
 * Validation helper functions
 */
export const validateUserProfile = (data: unknown) => {
  return userProfileSchema.safeParse(data);
};

export const validateChangePassword = (data: unknown) => {
  return changePasswordSchema.safeParse(data);
};

export const validateNotificationSettings = (data: unknown) => {
  return notificationSettingsSchema.safeParse(data);
};

export const validateSecuritySettings = (data: unknown) => {
  return securitySettingsSchema.safeParse(data);
};

export const validateEmailSettings = (data: unknown) => {
  return emailSettingsSchema.safeParse(data);
};

export const validateTaxSettings = (data: unknown) => {
  return taxSettingsSchema.safeParse(data);
};

export const validatePaymentSettings = (data: unknown) => {
  return paymentSettingsSchema.safeParse(data);
};

export const validateInvoiceSettings = (data: unknown) => {
  return invoiceSettingsSchema.safeParse(data);
};

export const validateIntegrationSettings = (data: unknown) => {
  return integrationSettingsSchema.safeParse(data);
};

export const validateAPIKey = (data: unknown) => {
  return apiKeySchema.safeParse(data);
};

export const validateWebhook = (data: unknown) => {
  return webhookSchema.safeParse(data);
};

