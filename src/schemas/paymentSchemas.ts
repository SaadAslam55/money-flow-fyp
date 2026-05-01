// src/schemas/paymentSchemas.ts
/**
 * Payment Validation Schemas
 * Comprehensive validation schemas for payment integrations and payment requests
 * Supports local payment methods: JazzCash, EasyPaisa, and Raast
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';

/**
 * Payment provider enum
 */
export const paymentProviderSchema = z.enum(['jazzcash', 'easypaisa', 'raast']);

/**
 * Payment integration configuration schema
 */
// Base integration schema for reuse (avoid refine chain on partial)
const paymentIntegrationBaseSchema = z.object({
  provider: paymentProviderSchema,
  account_name: z.string().min(1, 'Account name is required').max(255),
  merchant_id: z.string().optional(),
  store_id: z.string().optional(),
  raast_id: z.string().optional(),
  iban: z.string().optional(),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
  integrity_salt: z.string().optional(), // For JazzCash
  hash_key: z.string().optional(), // For EasyPaisa
  is_active: z.boolean().default(false),
  is_default: z.boolean().default(false),
  test_mode: z.boolean().default(true),
  transaction_fee_percentage: z.number().min(0).max(100).default(0),
  transaction_fee_fixed: z.number().min(0).default(0),
  settings: z.record(z.unknown()).optional(),
});

export const paymentIntegrationSchema = paymentIntegrationBaseSchema.refine(
  (data) => {
    // JazzCash requires merchant_id and integrity_salt
    if (data.provider === 'jazzcash') {
      return !!(data.merchant_id && data.integrity_salt);
    }
    // EasyPaisa requires store_id and hash_key
    if (data.provider === 'easypaisa') {
      return !!(data.store_id && data.hash_key);
    }
    // Raast requires raast_id or iban
    if (data.provider === 'raast') {
      return !!(data.raast_id || data.iban);
    }
    return true;
  },
  {
    message: 'Required credentials missing for selected provider',
  }
);

/**
 * Create payment request schema
 */
export const createPaymentRequestSchema = z.object({
  invoice_id: z.string().uuid('Invalid invoice ID'),
  payment_method: paymentProviderSchema,
  amount: z.number().positive().optional(),
  customer_email: z.string().email('Invalid email').optional(),
  customer_phone: z
    .string()
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number')
    .optional(),
  return_url: z.string().url('Invalid return URL').optional(),
  cancel_url: z.string().url('Invalid cancel URL').optional(),
});

/**
 * Update payment integration schema
 */
export const updatePaymentIntegrationSchema = paymentIntegrationBaseSchema.partial().extend({
  id: z.string().uuid('Invalid integration ID'),
});

export type PaymentIntegrationFormData = z.infer<typeof paymentIntegrationSchema>;
export type CreatePaymentRequestData = z.infer<typeof createPaymentRequestSchema>;
export type UpdatePaymentIntegrationData = z.infer<typeof updatePaymentIntegrationSchema>;
