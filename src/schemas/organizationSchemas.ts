// src/schemas/organizationSchemas.ts
import { z } from 'zod';

/**
 * Organization Profile Schema - For updating organization details
 */
export const organizationProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(255, 'Business name is too long')
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

  address: z
    .string()
    .max(500, 'Address is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  city: z
    .string()
    .max(100, 'City name is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  country: z
    .string()
    .max(100, 'Country name is too long')
    .default('Pakistan'),

  tax_id: z
    .string()
    .max(100, 'Tax ID is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  logo_url: z
    .string()
    .url('Invalid logo URL')
    .optional()
    .nullable(),

  fiscal_year_start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => {
        const d = new Date(date);
        return d.getMonth() === 0 && d.getDate() === 1;
      },
      { message: 'Fiscal year start must be January 1st' }
    ),

  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code (e.g., PKR, USD)')
    .default('PKR'),

  timezone: z
    .string()
    .default('Asia/Karachi'),
});

/**
 * Organization Update Schema - Allows partial updates
 */
export const organizationUpdateSchema = organizationProfileSchema.partial();

/**
 * Organization Settings Schema
 */
export const organizationSettingsSchema = z.object({
  invoice_prefix: z
    .string()
    .max(10, 'Invoice prefix is too long')
    .optional(),

  invoice_number_format: z
    .enum(['sequential', 'year_sequential', 'custom'])
    .default('year_sequential'),

  default_payment_terms: z
    .number()
    .int()
    .min(0)
    .max(365)
    .default(30),

  default_tax_rate: z
    .number()
    .min(0)
    .max(100)
    .default(17),

  invoice_footer_text: z
    .string()
    .max(500, 'Footer text is too long')
    .optional(),

  enable_invoice_reminders: z
    .boolean()
    .default(true),

  reminder_days_before_due: z
    .array(z.number().int().min(0).max(30))
    .default([7, 3, 1]),

  enable_low_stock_alerts: z
    .boolean()
    .default(true),

  low_stock_threshold_percentage: z
    .number()
    .min(0)
    .max(100)
    .default(20),

  date_format: z
    .enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
    .default('DD/MM/YYYY'),

  time_format: z
    .enum(['12h', '24h'])
    .default('12h'),

  currency_symbol_position: z
    .enum(['before', 'after'])
    .default('before'),
});

/**
 * Team Member Invitation Schema
 */
export const teamMemberInvitationSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),

  role: z.enum(['admin', 'manager', 'accountant', 'cashier'], {
    required_error: 'Role is required',
  }),

  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long')
    .optional(),

  send_invitation_email: z
    .boolean()
    .default(true),
});

/**
 * Team Member Update Schema
 */
export const teamMemberUpdateSchema = z.object({
  role: z.enum(['admin', 'manager', 'accountant', 'cashier']).optional(),
  is_active: z.boolean().optional(),
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long')
    .optional(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

/**
 * Organization Subscription Schema
 */
export const organizationSubscriptionSchema = z.object({
  plan: z.enum(['free', 'pro', 'enterprise'], {
    required_error: 'Plan is required',
  }),

  billing_cycle: z.enum(['monthly', 'yearly']).default('monthly'),

  auto_renew: z.boolean().default(true),
});

// Type exports
export type OrganizationProfileData = z.infer<typeof organizationProfileSchema>;
export type OrganizationUpdateData = z.infer<typeof organizationUpdateSchema>;
export type OrganizationSettingsData = z.infer<typeof organizationSettingsSchema>;
export type TeamMemberInvitationData = z.infer<typeof teamMemberInvitationSchema>;
export type TeamMemberUpdateData = z.infer<typeof teamMemberUpdateSchema>;
export type OrganizationSubscriptionData = z.infer<typeof organizationSubscriptionSchema>;

/**
 * Validation helper functions
 */
export const validateOrganizationProfile = (data: unknown) => {
  return organizationProfileSchema.safeParse(data);
};

export const validateOrganizationSettings = (data: unknown) => {
  return organizationSettingsSchema.safeParse(data);
};

export const validateTeamMemberInvitation = (data: unknown) => {
  return teamMemberInvitationSchema.safeParse(data);
};

