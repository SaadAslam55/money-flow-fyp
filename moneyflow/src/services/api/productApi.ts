// src/services/api/productApi.ts
/**
 * Product API Service
 * Handles product CRUD operations, inventory management, and stock adjustments
 * Includes product import/export, category management, and low stock alerts
 */

import { supabase } from '@/services/supabase/client';
import type { Product, ProductInsert } from '@/types/database.types';
import { logger } from '@/lib/logger';

/**
 * Parse CSV file
 */
async function parseCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2 || !lines[0]) {
          reject(new Error('CSV file is empty or invalid'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data: T[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const obj: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            obj[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || '';
          });
          
          data.push(obj as unknown as T);
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Generate SKU
 */
function generateSKU(productName: string, existingSKUs: string[]): string {
  // Create base SKU from product name
  const base = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
  
  // Find next available number
  let counter = 1;
  let sku = `${base}-${counter.toString().padStart(3, '0')}`;
  
  while (existingSKUs.includes(sku)) {
    counter++;
    sku = `${base}-${counter.toString().padStart(3, '0')}`;
  }
  
  return sku;
}

/**
 * Get all products with filters
 */
export async function getProducts(
  organizationId: string,
  filters?: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    isActive?: boolean;
    sortBy?: 'name' | 'price' | 'stock';
    sortOrder?: 'asc' | 'desc';
  }
) {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.lowStock) {
      // This requires a custom comparison, we'll filter after fetch
    }

    // Apply sorting
    const sortBy = filters?.sortBy ?? 'name';
    const sortOrder = filters?.sortOrder ?? 'asc';
    
    const sortColumn = sortBy === 'price' ? 'unit_price' : sortBy === 'stock' ? 'current_stock' : 'name';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) throw error;

    // Apply low stock filter if needed
    const typedData = (data ?? []) as Product[];
    let filteredData = typedData;
    if (filters?.lowStock) {
      filteredData = typedData.filter(p => p.track_inventory && (p.current_stock ?? 0) <= (p.minimum_stock ?? 0));
    }

    return { data: filteredData, error: null };
  } catch (error) {
    logger.error('Error fetching products:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Get single product with stock movement history
 */
export async function getProduct(productId: string) {
  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    // Get stock movements if table exists
    const { data: movements } = await supabase
      .from('stock_movements')
      .select(`
        *,
        created_by_user:users!stock_movements_created_by_fkey(full_name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(50);

    const typedProduct = product as Product;
    return {
      data: {
        ...typedProduct,
        stock_movements: movements ?? [],
      } as Product & { stock_movements: unknown[] },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching product:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Create new product
 */
export async function createProduct(
  productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
  organizationId: string
) {
  try {
    // Generate SKU if not provided
    let { sku } = productData;
    if (!sku) {
      const { data: existingProducts } = await supabase
        .from('products')
        .select('sku')
        .eq('organization_id', organizationId);

      const typedExisting = (existingProducts ?? []) as Array<{ sku?: string | null }>;
      const existingSKUs = typedExisting.map(p => p.sku).filter(Boolean) as string[];
      sku = generateSKU(productData.name, existingSKUs);
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        sku,
        organization_id: organizationId,
      } satisfies ProductInsert)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error creating product:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Update product
 */
export async function updateProduct(
  productId: string,
  updates: Partial<Product>
) {
  try {
    // Remove fields that shouldn't be updated directly
    const { id: _id, organization_id: _organization_id, created_at: _created_at, updated_at: _updated_at, ...updateData } = updates;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error updating product:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string) {
  try {
    // Check if product is used in any invoices
    const { data: invoiceItems } = await supabase
      .from('invoice_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    if (invoiceItems && invoiceItems.length > 0) {
      throw new Error('Cannot delete product that has been used in invoices. Mark as inactive instead.');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    logger.error('Error deleting product:', error instanceof Error ? error.message : String(error));
    return { error: error as Error };
  }
}

/**
 * Adjust product stock
 */
export async function adjustStock(
  productId: string,
  adjustment: number,
  reason: string,
  notes?: string,
  userId?: string
) {
  try {
    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('current_stock')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;
    if (!product) throw new Error('Product not found');

    const typedProduct = product as Pick<Product, 'current_stock'>;
    const currentStock = typedProduct.current_stock ?? 0;
    const newStock = currentStock + adjustment;

    if (newStock < 0) {
      throw new Error('Insufficient stock for this adjustment');
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', productId);

    if (updateError) throw updateError;

    // Log stock movement (if table exists)
    try {
      await supabase
        .from('stock_movements')
        .insert({
          product_id: productId,
          adjustment,
          reason,
          notes,
          previous_stock: currentStock,
          new_stock: newStock,
          created_by: userId,
        });
    } catch (e) {
      // Stock movements table might not exist yet
      logger.warn('Stock movements logging failed:', e instanceof Error ? e.message : String(e));
    }

    return { error: null };
  } catch (error) {
    logger.error('Error adjusting stock:', error instanceof Error ? error.message : String(error));
    return { error: error as Error };
  }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .eq('track_inventory', true);

    if (error) throw error;

    // Filter products where current_stock <= minimum_stock
    const typedData = (data ?? []) as Product[];
    const lowStockProducts = typedData.filter(
      product => (product.current_stock ?? 0) <= (product.minimum_stock ?? 0)
    );

    return {
      data: lowStockProducts.sort((a, b) => (a.current_stock ?? 0) - (b.current_stock ?? 0)),
      error: null 
    };
  } catch (error) {
    logger.error('Error fetching low stock products:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Get product categories
 */
export async function getProductCategories(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('organization_id', organizationId)
      .not('category', 'is', null);

    if (error) throw error;

    // Get unique categories
    const typedData = (data ?? []) as Array<{ category?: string | null }>;
    const categories = Array.from(new Set(typedData.map(p => p.category).filter(Boolean) as string[]));

    return { data: categories, error: null };
  } catch (error) {
    logger.error('Error fetching categories:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Import products from CSV
 */
export async function importProductsFromCSV(
  file: File,
  organizationId: string
) {
  try {
    const products = await parseCSV<any>(file);

    if (products.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Get existing SKUs to avoid duplicates
    const { data: existingProducts } = await supabase
      .from('products')
      .select('sku')
      .eq('organization_id', organizationId);

    const typedExisting = (existingProducts ?? []) as Array<{ sku?: string | null }>;
    const existingSKUs = new Set(typedExisting.map(p => p.sku).filter(Boolean) as string[]);

    // Validate and transform data
    const validProducts = products
      .filter(product => product.name?.trim())
      .map(product => {
        let sku = product.sku?.trim().toUpperCase() || generateSKU(product.name, Array.from(existingSKUs));
        
        // Ensure SKU is unique
        while (existingSKUs.has(sku)) {
          sku = generateSKU(product.name, Array.from(existingSKUs));
        }
        existingSKUs.add(sku);

        return {
          organization_id: organizationId,
          name: product.name.trim(),
          description: product.description?.trim() || null,
          sku,
          category: product.category?.trim() || null,
          unit_price: parseFloat(product.unit_price) || 0,
          cost_price: parseFloat(product.cost_price) || null,
          tax_rate: parseFloat(product.tax_rate) || 17,
          is_service: product.is_service === 'true' || product.is_service === '1',
          track_inventory: product.track_inventory !== 'false' && product.track_inventory !== '0',
          current_stock: parseInt(product.current_stock) || 0,
          minimum_stock: parseInt(product.minimum_stock) || 0,
          is_active: product.is_active !== 'false' && product.is_active !== '0',
        };
      });

    if (validProducts.length === 0) {
      throw new Error('No valid products found in CSV');
    }

    const { data, error } = await supabase
      .from('products')
      .insert(validProducts)
      .select();

    if (error) throw error;

    return {
      data,
      count: data?.length ?? 0,
      skipped: products.length - validProducts.length,
      error: null,
    };
  } catch (error) {
    logger.error('Error importing products:', error instanceof Error ? error.message : String(error));
    return { data: null, count: 0, skipped: 0, error: error as Error };
  }
}

/**
 * Export products to CSV
 */
export async function exportProductsToCSV(organizationId: string) {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;

    // Convert to CSV format
    const headers = [
      'Name',
      'Description',
      'SKU',
      'Category',
      'Unit Price',
      'Cost Price',
      'Tax Rate',
      'Is Service',
      'Track Inventory',
      'Current Stock',
      'Minimum Stock',
      'Is Active',
    ];

    const typedProducts = (products ?? []) as Product[];
    const rows = typedProducts.map(product => [
      product.name,
      product.description ?? '',
      product.sku ?? '',
      product.category ?? '',
      product.unit_price,
      product.cost_price ?? '',
      product.tax_rate,
      product.is_service ? '1' : '0',
      product.track_inventory ? '1' : '0',
      product.current_stock,
      product.minimum_stock,
      product.is_active ? '1' : '0',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return { data: csvContent, error: null };
  } catch (error) {
    logger.error('Error exporting products:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}