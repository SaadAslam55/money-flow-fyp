// src/schemas/productSchemas.ts
import { z } from 'zod';

/**
 * Product Schema - Main validation for product data
 */
// Base product schema for reuse (avoids ZodEffects when partial needed)
const productBaseSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(255, 'Product name is too long')
    .trim(),

  description: z
    .string()
    .max(1000, 'Description is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  sku: z
    .string()
    .max(100, 'SKU is too long')
    .regex(/^[A-Za-z0-9-]*$/, 'SKU must contain only letters, numbers, and hyphens')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val?.toUpperCase())),

  category: z
    .string()
    .max(100, 'Category name is too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  unit_price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(999999999, 'Price is too high')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),

  cost_price: z
    .number()
    .min(0, 'Cost price cannot be negative')
    .max(999999999, 'Cost price is too high')
    .multipleOf(0.01, 'Cost price must have at most 2 decimal places')
    .optional()
    .nullable(),

  tax_rate: z
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .multipleOf(0.01, 'Tax rate must have at most 2 decimal places')
    .default(17),

  is_service: z.boolean().default(false),

  track_inventory: z.boolean().default(true),

  current_stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .default(0),

  minimum_stock: z
    .number()
    .int('Minimum stock must be a whole number')
    .min(0, 'Minimum stock cannot be negative')
    .default(0),

  is_active: z.boolean().default(true),

  image_url: z.string().url('Invalid image URL').optional().nullable(),
});

export const productSchema = productBaseSchema
  .refine(
    (data) => {
      // If it's a service, inventory tracking should be disabled
      if (data.is_service && data.track_inventory) {
        return false;
      }
      return true;
    },
    {
      message: 'Services cannot have inventory tracking enabled',
      path: ['track_inventory'],
    }
  )
  .refine(
    (data) => {
      // If cost price is provided, it should be less than unit price
      if (data.cost_price && data.cost_price > data.unit_price) {
        return false;
      }
      return true;
    },
    {
      message: 'Cost price should be less than selling price',
      path: ['cost_price'],
    }
  );

/**
 * Product Update Schema - Allows partial updates
 */
export const productUpdateSchema = productBaseSchema.partial();

/**
 * Stock Adjustment Schema - For manual stock changes
 */
export const stockAdjustmentSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),

  adjustment: z
    .number()
    .int('Adjustment must be a whole number')
    .refine((val) => val !== 0, 'Adjustment cannot be zero'),

  reason: z.enum(
    ['purchase', 'sale', 'return', 'damage', 'theft', 'recount', 'adjustment', 'transfer', 'other'],
    {
      errorMap: () => ({ message: 'Please select a valid reason' }),
    }
  ),

  notes: z
    .string()
    .max(500, 'Notes are too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  reference_id: z.string().uuid().optional(),

  reference_type: z.enum(['invoice', 'purchase_order', 'transfer', 'manual']).optional(),
});

/**
 * Bulk Stock Adjustment Schema - For multiple products
 */
export const bulkStockAdjustmentSchema = z.object({
  adjustments: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        adjustment: z.number().int(),
        reason: z.string(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one adjustment is required'),
});

/**
 * Import Products Schema - Validates CSV file upload
 */
export const importProductsSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((file) => {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'];
      return validTypes.includes(file.type) || file.name.endsWith('.csv');
    }, 'Only CSV files are allowed'),
});

/**
 * Product Filter Schema - For search and filtering
 */
export const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  lowStock: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isService: z.boolean().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  sortBy: z.enum(['name', 'price', 'stock', 'created_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(50),
});

/**
 * Product CSV Row Schema - For validating imported CSV rows
 */
export const productCsvRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  sku: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  unit_price: z.string().transform((val) => parseFloat(val) || 0),
  cost_price: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  tax_rate: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : 17)),
  is_service: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
  track_inventory: z
    .string()
    .optional()
    .transform((val) => val !== 'false' && val !== '0'),
  current_stock: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  minimum_stock: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  is_active: z
    .string()
    .optional()
    .transform((val) => val !== 'false' && val !== '0'),
});

/**
 * Product Category Schema
 */
export const productCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  parent_category_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
});

/**
 * Low Stock Alert Schema
 */
export const lowStockAlertSchema = z.object({
  product_id: z.string().uuid(),
  current_stock: z.number().int(),
  minimum_stock: z.number().int(),
  alert_threshold: z.number().int().default(0),
});

/**
 * Product Statistics Schema
 */
export const productStatsSchema = z.object({
  total_products: z.number(),
  active_products: z.number(),
  low_stock_products: z.number(),
  total_inventory_value: z.number(),
  categories_count: z.number(),
  top_selling: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        units_sold: z.number(),
        revenue: z.number(),
      })
    )
    .optional(),
});

// Type exports
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;
export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
export type BulkStockAdjustmentData = z.infer<typeof bulkStockAdjustmentSchema>;
export type ImportProductsFormData = z.infer<typeof importProductsSchema>;
export type ProductFilterData = z.infer<typeof productFilterSchema>;
export type ProductCsvRowData = z.infer<typeof productCsvRowSchema>;
export type ProductCategoryData = z.infer<typeof productCategorySchema>;
export type LowStockAlertData = z.infer<typeof lowStockAlertSchema>;
export type ProductStatsData = z.infer<typeof productStatsSchema>;

/**
 * Stock Adjustment Reasons
 */
export const STOCK_ADJUSTMENT_REASONS = [
  { value: 'purchase', label: 'Purchase/Restock', icon: '📦' },
  { value: 'sale', label: 'Sale', icon: '💰' },
  { value: 'return', label: 'Customer Return', icon: '↩️' },
  { value: 'damage', label: 'Damaged/Expired', icon: '⚠️' },
  { value: 'theft', label: 'Theft/Loss', icon: '🔒' },
  { value: 'recount', label: 'Stock Recount', icon: '📊' },
  { value: 'adjustment', label: 'Manual Adjustment', icon: '✏️' },
  { value: 'transfer', label: 'Transfer', icon: '🔄' },
  { value: 'other', label: 'Other', icon: '📝' },
] as const;

/**
 * CSV Template Headers
 */
export const PRODUCT_CSV_HEADERS = [
  'name',
  'description',
  'sku',
  'category',
  'unit_price',
  'cost_price',
  'tax_rate',
  'is_service',
  'track_inventory',
  'current_stock',
  'minimum_stock',
  'is_active',
] as const;

/**
 * CSV Template Example
 */
export const PRODUCT_CSV_TEMPLATE = `name,description,sku,category,unit_price,cost_price,tax_rate,is_service,track_inventory,current_stock,minimum_stock,is_active
"Laptop Dell XPS 13","High performance laptop","DELL-001","Electronics",85000,70000,17,0,1,50,10,1
"Consultation Service","1 hour business consultation","SERV-001","Services",5000,0,17,1,0,0,0,1
"iPhone 15 Pro","Latest iPhone model","APPL-001","Electronics",450000,400000,17,0,1,25,5,1`;

/**
 * Validation helper functions
 */
export const validateProductData = (data: unknown) => {
  return productSchema.safeParse(data);
};

export const validateStockAdjustment = (data: unknown) => {
  return stockAdjustmentSchema.safeParse(data);
};

export const validateProductCsvRow = (row: unknown) => {
  return productCsvRowSchema.safeParse(row);
};

export const validateProductFilter = (filter: unknown) => {
  return productFilterSchema.safeParse(filter);
};

/**
 * Calculate profit margin
 */
export const calculateProfitMargin = (unitPrice: number, costPrice: number): number => {
  if (unitPrice === 0) return 0;
  return ((unitPrice - costPrice) / unitPrice) * 100;
};

/**
 * Calculate price with tax
 */
export const calculatePriceWithTax = (price: number, taxRate: number): number => {
  return price * (1 + taxRate / 100);
};

/**
 * Check if product is low stock
 */
export const isLowStock = (currentStock: number, minimumStock: number): boolean => {
  return currentStock <= minimumStock;
};

/**
 * Generate default SKU
 */
export const generateDefaultSKU = (productName: string, existingSKUs: string[] = []): string => {
  const base = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);

  let counter = 1;
  let sku = `${base}-${counter.toString().padStart(3, '0')}`;

  while (existingSKUs.includes(sku)) {
    counter++;
    sku = `${base}-${counter.toString().padStart(3, '0')}`;
  }

  return sku;
};
