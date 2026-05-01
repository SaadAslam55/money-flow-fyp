// src/schemas/customerSchemas.ts
import { z } from 'zod';

/**
 * Customer Schema - Main validation for customer data
 */
// Base schema without refinement for update/partial usage
const baseCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long').trim(),

  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .regex(
      /^[+]?[\d\s-()]+$/,
      'Invalid phone number format. Use only numbers, spaces, dashes, and parentheses'
    )
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

  country: z.string().max(100, 'Country name is too long').default('Pakistan').optional(),

  tax_id: z
    .string()
    .max(100, 'Tax ID is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  credit_limit: z
    .number()
    .min(0, 'Credit limit cannot be negative')
    .max(999999999, 'Credit limit is too high')
    .default(0),

  notes: z
    .string()
    .max(1000, 'Notes are too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  portal_access: z.boolean().default(false),

  portal_password: z
    .string()
    .min(8, 'Portal password must be at least 8 characters')
    .max(50, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

export const customerSchema = baseCustomerSchema.refine(
  (data) => {
    if (data.portal_access && !data.portal_password) return false;
    return true;
  },
  {
    message: 'Portal password is required when portal access is enabled',
    path: ['portal_password'],
  }
);

/**
 * Customer Update Schema - Allows partial updates
 */
export const customerUpdateSchema = baseCustomerSchema.partial();

/**
 * Import Customers Schema - Validates CSV file upload
 */
export const importCustomersSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((file) => {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'];
      return validTypes.includes(file.type) || file.name.endsWith('.csv');
    }, 'Only CSV files are allowed'),
});

/**
 * Customer Filter Schema - For search and filtering
 */
export const customerFilterSchema = z.object({
  search: z.string().optional(),
  hasOutstanding: z.boolean().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  sortBy: z.enum(['name', 'balance', 'created_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(50),
});

/**
 * Customer Portal Login Schema
 */
export const customerPortalLoginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Enable Portal Access Schema
 */
export const enablePortalAccessSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  send_email: z.boolean().default(true),
});

/**
 * Customer CSV Row Schema - For validating imported CSV rows
 */
export const customerCsvRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  tax_id: z.string().optional().or(z.literal('')),
  credit_limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : 0)),
  notes: z.string().optional().or(z.literal('')),
});

/**
 * Customer Statistics Schema
 */
export const customerStatsSchema = z.object({
  total_customers: z.number(),
  new_this_month: z.number(),
  total_outstanding: z.number(),
  average_purchase: z.number().optional(),
  top_customers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        total_revenue: z.number(),
      })
    )
    .optional(),
});

// Type exports
export type CustomerFormData = z.infer<typeof customerSchema>;
export type CustomerUpdateData = z.infer<typeof customerUpdateSchema>;
export type ImportCustomersFormData = z.infer<typeof importCustomersSchema>;
export type CustomerFilterData = z.infer<typeof customerFilterSchema>;
export type CustomerPortalLoginData = z.infer<typeof customerPortalLoginSchema>;
export type EnablePortalAccessData = z.infer<typeof enablePortalAccessSchema>;
export type CustomerCsvRowData = z.infer<typeof customerCsvRowSchema>;
export type CustomerStatsData = z.infer<typeof customerStatsSchema>;

/**
 * CSV Template Headers
 */
export const CUSTOMER_CSV_HEADERS = [
  'name',
  'email',
  'phone',
  'address',
  'city',
  'country',
  'tax_id',
  'credit_limit',
  'notes',
] as const;

/**
 * CSV Template Example
 */
export const CUSTOMER_CSV_TEMPLATE = `name,email,phone,address,city,country,tax_id,credit_limit,notes
"John Doe","john@example.com","+92-300-1234567","123 Main St","Karachi","Pakistan","GST123",50000,"VIP Customer"
"Jane Smith","jane@example.com","+92-301-9876543","456 Park Ave","Lahore","Pakistan","GST456",25000,"Regular Customer"`;

/**
 * Validation helper functions
 */
export const validateCustomerData = (data: unknown) => {
  return customerSchema.safeParse(data);
};

export const validateCustomerCsvRow = (row: unknown) => {
  return customerCsvRowSchema.safeParse(row);
};

export const validateCustomerFilter = (filter: unknown) => {
  return customerFilterSchema.safeParse(filter);
};
