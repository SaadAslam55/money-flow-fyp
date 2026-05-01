// src/schemas/invoiceSchemas.ts
/**
 * Invoice Validation Schemas
 * Comprehensive validation schemas for invoices, invoice items, and payments
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';

export const invoiceItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID').optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  quantity: z
    .number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity must be a number',
    })
    .positive('Quantity must be greater than 0')
    .max(999999, 'Quantity is too large')
    .multipleOf(0.01, 'Quantity must have at most 2 decimal places'),
  unit_price: z
    .number({
      required_error: 'Unit price is required',
      invalid_type_error: 'Unit price must be a number',
    })
    .min(0, 'Price cannot be negative')
    .max(999999999.99, 'Price is too large')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  tax_rate: z
    .number({
      required_error: 'Tax rate is required',
      invalid_type_error: 'Tax rate must be a number',
    })
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .multipleOf(0.01, 'Tax rate must have at most 2 decimal places')
    .default(17),
});

// Base schema (object only) so we can reuse for partial update
const createInvoiceBaseSchema = z.object({
  customer_id: z.string().uuid('Please select a customer'),
  invoice_number: z
    .string()
    .max(100, 'Invoice number is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  invoice_date: z
    .string()
    .min(1, 'Invoice date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      },
      { message: 'Invalid date format' }
    ),
  due_date: z
    .string()
    .min(1, 'Due date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      },
      { message: 'Invalid date format' }
    ),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'At least one item is required')
    .max(100, 'Maximum 100 items allowed per invoice'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  terms: z
    .string()
    .max(2000, 'Terms must be less than 2000 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(999999999.99, 'Discount value is too large')
    .optional(),
});

export const createInvoiceSchema = createInvoiceBaseSchema
  .refine(
    (data) => {
      const invoiceDate = new Date(data.invoice_date);
      const dueDate = new Date(data.due_date);
      return dueDate >= invoiceDate;
    },
    {
      message: 'Due date must be on or after invoice date',
      path: ['due_date'],
    }
  )
  .refine(
    (data) => {
      if (data.discount_type && data.discount_value !== undefined) {
        if (data.discount_type === 'percentage' && data.discount_value > 100) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Percentage discount cannot exceed 100%',
      path: ['discount_value'],
    }
  );

export const paymentRecordSchema = z.object({
  invoice_id: z.string().uuid('Invalid invoice ID'),
  amount: z
    .number({
      required_error: 'Payment amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(999999999.99, 'Amount is too large')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  payment_date: z
    .string()
    .min(1, 'Payment date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      },
      { message: 'Invalid date format' }
    )
    .refine(
      (date) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return d <= today;
      },
      { message: 'Payment date cannot be in the future' }
    ),
  payment_method: z.enum(['cash', 'bank_transfer', 'card', 'check', 'upi', 'other'], {
    required_error: 'Payment method is required',
  }),
  reference_number: z
    .string()
    .max(100, 'Reference number must be less than 100 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

/**
 * Invoice Update Schema - For partial updates
 */
export const updateInvoiceSchema = createInvoiceBaseSchema.partial().extend({
  id: z.string().uuid('Invalid invoice ID'),
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']).optional(),
});

/**
 * Recurring Invoice Schema
 * For creating recurring/automated invoices
 */
export const recurringInvoiceSchema = z
  .object({
    invoice_id: z.string().uuid('Invalid invoice ID').optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], {
      required_error: 'Frequency is required',
      invalid_type_error: 'Invalid frequency',
    }),
    start_date: z
      .string({
        required_error: 'Start date is required',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine(
        (date) => {
          const d = new Date(date);
          return !isNaN(d.getTime());
        },
        { message: 'Invalid date format' }
      ),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine(
        (date) => {
          const d = new Date(date);
          return !isNaN(d.getTime());
        },
        { message: 'Invalid date format' }
      )
      .optional()
      .nullable(),
    next_invoice_date: z
      .string({
        required_error: 'Next invoice date is required',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine(
        (date) => {
          const d = new Date(date);
          return !isNaN(d.getTime());
        },
        { message: 'Invalid date format' }
      ),
    auto_send: z.boolean().default(false),
    send_before_days: z
      .number()
      .int('Days must be a whole number')
      .min(0, 'Days cannot be negative')
      .max(30, 'Days cannot exceed 30')
      .optional(),
    max_occurrences: z
      .number()
      .int('Occurrences must be a whole number')
      .min(1, 'Occurrences must be at least 1')
      .max(999, 'Occurrences cannot exceed 999')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.end_date && data.max_occurrences) {
        return false; // Cannot have both end_date and max_occurrences
      }
      return true;
    },
    {
      message: 'Cannot specify both end date and max occurrences',
      path: ['end_date'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const next = new Date(data.next_invoice_date);
      return next >= start;
    },
    {
      message: 'Next invoice date must be on or after start date',
      path: ['next_invoice_date'],
    }
  )
  .refine(
    (data) => {
      if (data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        return end >= start;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['end_date'],
    }
  );

/**
 * Invoice Filter Schema - For search and filtering
 */
export const invoiceFilterSchema = z
  .object({
    search: z.string().optional(),
    status: z.array(z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'])).optional(),
    customer_id: z.array(z.string().uuid()).optional(),
    date_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    date_to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    amount_min: z.number().optional(),
    amount_max: z.number().optional(),
    sortBy: z
      .enum(['invoice_date', 'due_date', 'total_amount', 'created_at'])
      .default('invoice_date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(50),
  })
  .refine(
    (data) => {
      if (data.date_from && data.date_to) {
        const start = new Date(data.date_from);
        const end = new Date(data.date_to);
        return start <= end;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['date_to'],
    }
  );

// Type exports
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;
export type PaymentRecordFormData = z.infer<typeof paymentRecordSchema>;
export type RecurringInvoiceFormData = z.infer<typeof recurringInvoiceSchema>;
export type InvoiceFilterData = z.infer<typeof invoiceFilterSchema>;

/**
 * Validation helper functions
 */
export const validateInvoiceData = (data: unknown) => {
  return createInvoiceSchema.safeParse(data);
};

export const validateInvoiceUpdate = (data: unknown) => {
  return updateInvoiceSchema.safeParse(data);
};

export const validatePaymentRecord = (data: unknown) => {
  return paymentRecordSchema.safeParse(data);
};

export const validateRecurringInvoice = (data: unknown) => {
  return recurringInvoiceSchema.safeParse(data);
};

export const validateInvoiceFilter = (filter: unknown) => {
  return invoiceFilterSchema.safeParse(filter);
};
