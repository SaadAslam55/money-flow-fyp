/**
 * Product Service
 * Product/inventory operations with dual-backend support
 */

import { BaseService } from './base.service';
import api from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types';

// ============================================
// Product Service
// ============================================

class ProductService extends BaseService<Product, CreateProductDto, UpdateProductDto> {
  protected endpoint = '/products';
  protected table = 'products';

  /**
   * Get all products with filters
   */
  override async getAll(params?: Record<string, any>): Promise<Product[]> {
    if (this.useNewApi) {
      const response = await api.get<Product[]>(this.endpoint, params);
      return response.data;
    }

    let query = supabase.from(this.table).select('*');

    if (params?.organization_id) {
      query = query.eq('organization_id', params.organization_id);
    }
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%`);
    }
    // low_stock filter applied client-side after fetch since Supabase JS v2
    // doesn't support column-to-column comparisons in query builder

    const { data, error } = await query.is('deleted_at', null).order('name', { ascending: true });

    if (error) throw error;

    const products = (data || []) as Product[];
    if (params?.low_stock) {
      return products.filter((p) => p.track_inventory && (p.current_stock || 0) <= (p.minimum_stock || 0));
    }
    return products;
  }

  /**
   * Get low stock products
   */
  async getLowStock(): Promise<Product[]> {
    if (this.useNewApi) {
      const response = await api.get<Product[]>(`${this.endpoint}/low-stock`);
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .is('deleted_at', null);

    if (error) throw error;
    return ((data || []) as Product[]).filter((p) => p.track_inventory && (p.current_stock || 0) <= (p.minimum_stock || 0));
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<string[]> {
    if (this.useNewApi) {
      const response = await api.get<string[]>(`${this.endpoint}/categories`);
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .select('category')
      .is('deleted_at', null)
      .not('category', 'is', null);

    if (error) throw error;

    // Get unique categories
    const products = (data || []) as Product[];
    const categories = [...new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))];
    return categories;
  }

  /**
   * Update stock quantity
   */
  async updateStock(
    id: string,
    quantity: number,
    type: 'add' | 'subtract' | 'set',
    notes?: string
  ): Promise<Product> {
    if (this.useNewApi) {
      const response = await api.post<Product>(`${this.endpoint}/${id}/stock`, {
        quantity,
        type,
        notes,
      });
      return response.data;
    }

    // Legacy: Get current stock and update
    const { data: current, error: fetchError } = await supabase
      .from(this.table)
      .select('stock_quantity')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    let newQuantity: number;
    switch (type) {
      case 'add':
        newQuantity = (current?.stock_quantity || 0) + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, (current?.stock_quantity || 0) - quantity);
        break;
      case 'set':
      default:
        newQuantity = quantity;
    }

    const { data, error } = await supabase
      .from(this.table)
      .update({
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log inventory movement (if table exists)
    try {
      await supabase.from('inventory_logs').insert({
        product_id: id,
        type,
        quantity,
        notes,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Ignore if inventory_logs table doesn't exist
    }

    return data as Product;
  }

  /**
   * Bulk update prices
   */
  async bulkUpdatePrices(
    updates: Array<{ id: string; unit_price: number }>
  ): Promise<{ updated: number }> {
    if (this.useNewApi) {
      const response = await api.post<{ updated: number }>(`${this.endpoint}/bulk-update-prices`, {
        updates,
      });
      return response.data;
    }

    // Legacy: Update one by one
    let updated = 0;
    for (const { id, unit_price } of updates) {
      const { error } = await supabase.from(this.table).update({ unit_price }).eq('id', id);

      if (!error) updated++;
    }

    return { updated };
  }

  /**
   * Search products
   */
  override async search(query: string, params?: Record<string, any>): Promise<Product[]> {
    const limit = params?.limit ?? 10;
    if (this.useNewApi) {
      const response = await api.get<Product[]>(this.endpoint, { search: query, limit });
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .is('deleted_at', null)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data as Product[];
  }

  /**
   * Get inventory valuation
   */
  async getValuation(): Promise<{
    totalItems: number;
    totalValue: number;
    byCategory: Array<{ category: string; value: number }>;
  }> {
    if (this.useNewApi) {
      const response = await api.get<{
        totalItems: number;
        totalValue: number;
        byCategory: Array<{ category: string; value: number }>;
      }>(`${this.endpoint}/valuation`);
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .select('category, current_stock, unit_price')
      .is('deleted_at', null);

    if (error) throw error;

    interface ProductValuationData {
      category?: string | null;
      current_stock: number;
      unit_price: number;
    }

    const products = (data || []) as ProductValuationData[];
    const totalItems = products.reduce((sum, p) => sum + (p.current_stock || 0), 0);
    const totalValue = products.reduce(
      (sum, p) => sum + (p.current_stock || 0) * (p.unit_price || 0),
      0
    );

    // Group by category
    const categoryMap = new Map<string, number>();
    for (const p of products) {
      const category = p.category || 'Uncategorized';
      const value = (p.current_stock || 0) * (p.unit_price || 0);
      categoryMap.set(category, (categoryMap.get(category) || 0) + value);
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
    }));

    return { totalItems, totalValue, byCategory };
  }
}

// ============================================
// Export Singleton
// ============================================

export const productService = new ProductService();
export default productService;
