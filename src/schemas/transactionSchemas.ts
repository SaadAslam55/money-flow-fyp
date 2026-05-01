// src/schemas/transactionSchemas.ts
/**
 * Transaction Validation Schemas
 * Comprehensive validation schemas for transactions, bank accounts, and related entities
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';

/**
 * Transaction Schema
 * Validates transaction creation and updates
 */
export const transactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer'], {
      required_error: 'Transaction type is required',
      invalid_type_error: 'Invalid transaction type',
    }),
    amount: z
      .number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
      })
      .positive('Amount must be greater than 0')
      .max(999999999.99, 'Amount is too large')
      .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
    date: z
      .string({
        required_error: 'Date is required',
      })
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
          // Allow dates up to 1 year in the future for planned transactions
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() + 1);
          return d <= maxDate;
        },
        { message: 'Date cannot be more than 1 year in the future' }
      ),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .trim()
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    payment_method: z.enum(
      ['cash', 'bank_transfer', 'card', 'check', 'upi', 'other', 'jazzcash', 'easypaisa', 'raast'],
      {
        required_error: 'Payment method is required',
      }
    ),
    category_id: z
      .string()
      .uuid('Invalid category ID')
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    bank_account_id: z
      .string()
      .uuid('Invalid bank account ID')
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    reference_type: z
      .string()
      .max(50, 'Reference type must be less than 50 characters')
      .trim()
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    reference_id: z
      .string()
      .uuid('Invalid reference ID')
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    notes: z
      .string()
      .max(1000, 'Notes must be less than 1000 characters')
      .trim()
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    receipt_url: z
      .string()
      .url('Invalid receipt URL')
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
  })
  .refine(
    (data) => {
      // For transfers, bank_account_id should be required
      if (data.type === 'transfer' && !data.bank_account_id) {
        return false;
      }
      return true;
    },
    {
      message: 'Bank account is required for transfers',
      path: ['bank_account_id'],
    }
  )
  .refine((data) => {
    // For expenses, category_id is recommended but not required
    // This is just a warning, not an error
    return true;
  });

export type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Transaction Update Schema
 * For partial updates
 */
export const transactionUpdateSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  amount: z.number().positive().max(999999999.99).multipleOf(0.01).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  description: z.string().max(500).trim().optional().nullable(),
  payment_method: z
    .enum(['cash', 'bank_transfer', 'card', 'check', 'upi', 'other', 'jazzcash', 'easypaisa', 'raast'])
    .optional(),
  category_id: z.string().uuid().optional().nullable(),
  bank_account_id: z.string().uuid().optional().nullable(),
  reference_type: z.string().max(50).trim().optional().nullable(),
  reference_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).trim().optional().nullable(),
  receipt_url: z.string().url().optional().nullable(),
});

/**
 * Bank Account Schema
 * Validates bank account creation and updates
 */
export const bankAccountSchema = z.object({
  account_name: z
    .string({
      required_error: 'Account name is required',
    })
    .min(2, 'Account name must be at least 2 characters')
    .max(100, 'Account name must be less than 100 characters'),
  bank_name: z
    .string({
      required_error: 'Bank name is required',
    })
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name must be less than 100 characters'),
  account_number: z
    .string({
      required_error: 'Account number is required',
    })
    .min(5, 'Account number must be at least 5 characters')
    .max(50, 'Account number must be less than 50 characters')
    .regex(/^[A-Z0-9-]+$/i, 'Account number can only contain letters, numbers, and hyphens'),
  account_type: z.enum(['checking', 'savings', 'credit_card', 'cash'], {
    required_error: 'Account type is required',
  }),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code (e.g., USD, PKR)')
    .default('PKR'),
  current_balance: z
    .number({
      required_error: 'Current balance is required',
      invalid_type_error: 'Balance must be a number',
    })
    .default(0),
  opening_balance: z.number().default(0),
  branch: z.string().max(100, 'Branch name must be less than 100 characters').optional().nullable(),
  iban: z
    .string()
    .max(34, 'IBAN must be less than 34 characters')
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/i, 'Invalid IBAN format')
    .optional()
    .nullable(),
  swift_code: z
    .string()
    .refine((val) => val.length === 8 || val.length === 11, 'SWIFT code must be 8 or 11 characters')
    .refine((val) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(val), 'Invalid SWIFT code format')
    .optional()
    .nullable(),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

/**
 * Bank Account Update Schema
 */
export const bankAccountUpdateSchema = bankAccountSchema.partial();

/**
 * Bank Reconciliation Schema
 */
export const bankReconciliationSchema = z.object({
  bank_account_id: z
    .string({
      required_error: 'Bank account is required',
    })
    .uuid('Invalid bank account ID'),
  statement_balance: z.number({
    required_error: 'Statement balance is required',
    invalid_type_error: 'Balance must be a number',
  }),
  statement_date: z
    .string({
      required_error: 'Statement date is required',
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
});

export type BankReconciliationFormData = z.infer<typeof bankReconciliationSchema>;

/**
 * Expense Category Schema
 * Validates category creation and updates
 */
export const expenseCategorySchema = z.object({
  name: z
    .string({
      required_error: 'Category name is required',
    })
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  parent_category_id: z.string().uuid('Invalid parent category ID').optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code (e.g., #FF0000)')
    .optional()
    .nullable(),
  icon: z.string().max(50, 'Icon name must be less than 50 characters').optional().nullable(),
  is_active: z.boolean().default(true),
  budget_limit: z.number().positive('Budget limit must be greater than 0').optional().nullable(),
});

export type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>;

/**
 * Expense Category Update Schema
 */
export const expenseCategoryUpdateSchema = expenseCategorySchema.partial();

/**
 * Transaction Filters Schema
 * For filtering transaction lists
 */
export const transactionFiltersSchema = z.object({
  type: z.array(z.enum(['income', 'expense', 'transfer'])).optional(),
  category_id: z.array(z.string().uuid()).optional(),
  bank_account_id: z.array(z.string().uuid()).optional(),
  payment_method: z
    .array(
      z.enum(['cash', 'bank_transfer', 'card', 'check', 'upi', 'other', 'jazzcash', 'easypaisa', 'raast'])
    )
    .optional(),
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
  search: z.string().optional(),
});

export type TransactionFiltersData = z.infer<typeof transactionFiltersSchema>;

/**
 * Bulk Transaction Import Schema
 */
export const bulkTransactionSchema = z.object({
  transactions: z.array(transactionSchema).min(1, 'At least one transaction is required'),
});

export type BulkTransactionFormData = z.infer<typeof bulkTransactionSchema>;

/**
 * Recurring Transaction Schema
 * For creating recurring/automated transactions
 */
export const recurringTransactionSchema = z
  .object({
    // Base transaction fields
    type: z.enum(['income', 'expense', 'transfer'], {
      required_error: 'Transaction type is required',
      invalid_type_error: 'Invalid transaction type',
    }),
    amount: z
      .number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
      })
      .positive('Amount must be greater than 0')
      .max(999999999.99, 'Amount is too large')
      .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
    date: z
      .string({
        required_error: 'Date is required',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .trim()
      .optional()
      .nullable(),
    payment_method: z.enum(
      ['cash', 'bank_transfer', 'card', 'check', 'upi', 'other', 'jazzcash', 'easypaisa', 'raast'],
      {
        required_error: 'Payment method is required',
      }
    ),
    category_id: z.string().uuid('Invalid category ID').optional().nullable(),
    bank_account_id: z.string().uuid('Invalid bank account ID').optional().nullable(),
    reference_type: z
      .string()
      .max(50, 'Reference type must be less than 50 characters')
      .trim()
      .optional()
      .nullable(),
    reference_id: z.string().uuid('Invalid reference ID').optional().nullable(),
    notes: z
      .string()
      .max(1000, 'Notes must be less than 1000 characters')
      .trim()
      .optional()
      .nullable(),
    receipt_url: z.string().url('Invalid receipt URL').optional().nullable(),
    // Recurring transaction specific fields
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
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
    repeat_count: z
      .number()
      .int('Repeat count must be a whole number')
      .min(1, 'Repeat count must be at least 1')
      .max(999, 'Repeat count cannot exceed 999')
      .optional()
      .nullable(),
    is_active: z.boolean().default(true),
  })
  .refine(
    (data: { end_date?: string | null; repeat_count?: number | null }) => {
      if (data.end_date && data.repeat_count) {
        return false; // Cannot have both end_date and repeat_count
      }
      return true;
    },
    {
      message: 'Cannot specify both end date and repeat count',
      path: ['end_date'],
    }
  )
  .refine(
    (data: { start_date: string; end_date?: string | null }) => {
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

export type RecurringTransactionFormData = z.infer<typeof recurringTransactionSchema>;
