// src/schemas/reportSchemas.ts
/**
 * Report Validation Schemas
 * Comprehensive validation schemas for reports, filters, and export options
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';

/**
 * Date range validation schema
 */
export const dateRangeSchema = z.object({
  start: z.string().min(1, 'Start date is required'),
  end: z.string().min(1, 'End date is required'),
}).refine(
  (data) => {
    const start = new Date(data.start);
    const end = new Date(data.end);
    return start <= end;
  },
  {
    message: 'End date must be after start date',
    path: ['end'],
  }
);

/**
 * Report filters validation schema
 */
export const reportFiltersSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  customer_id: z.array(z.string().uuid()).optional(),
  product_id: z.array(z.string().uuid()).optional(),
  category_id: z.array(z.string().uuid()).optional(),
  status: z.array(z.string()).optional(),
  payment_method: z.array(z.string()).optional(),
  comparison_period: z.boolean().optional(),
}).refine(
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

/**
 * Report export options validation schema
 */
export const reportExportOptionsSchema = z.object({
  format: z.enum(['pdf', 'excel', 'csv']),
  include_charts: z.boolean().default(false),
  orientation: z.enum(['portrait', 'landscape']).optional(),
});

/**
 * Schedule report validation schema
 */
export const scheduleReportSchema = z.object({
  report_type: z.enum([
    'profit_loss',
    'balance_sheet',
    'cash_flow',
    'sales',
    'expenses',
    'tax',
    'customer',
    'product',
  ]),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
  date_range: dateRangeSchema.optional(),
  filters: reportFiltersSchema.optional(),
});

/**
 * Custom report builder validation schema
 */
export const customReportSchema = z.object({
  name: z.string().min(1, 'Report name is required').max(100, 'Report name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  date_range: dateRangeSchema,
  filters: reportFiltersSchema.optional(),
  columns: z.array(z.string()).min(1, 'At least one column is required'),
  group_by: z.enum(['customer', 'product', 'category', 'period', 'none']).optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Type exports
 */
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>;
export type ReportExportOptionsInput = z.infer<typeof reportExportOptionsSchema>;
export type ScheduleReportInput = z.infer<typeof scheduleReportSchema>;
export type CustomReportInput = z.infer<typeof customReportSchema>;

