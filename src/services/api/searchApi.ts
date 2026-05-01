// src/services/api/searchApi.ts
/**
 * Global Search API Service
 * Searches across customers, invoices, products, and transactions
 */

import { supabase } from '@/services/supabase/client';
import { logger } from '@/lib/logger';

export interface SearchResult {
  id: string;
  type: 'customer' | 'invoice' | 'product' | 'transaction';
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  error?: string;
}

/**
 * Global search across all entities
 */
export async function globalSearch(
  query: string,
  organizationId: string,
  limit: number = 10
): Promise<SearchResponse> {
  try {
    if (!query || query.trim().length < 2) {
      return { results: [], total: 0 };
    }

    if (!organizationId) {
      return { results: [], total: 0, error: 'Organization ID required' };
    }

    const searchTerm = query.trim().toLowerCase();
    const results: SearchResult[] = [];

    // Search in parallel for better performance
    const [customersResult, invoicesResult, productsResult, transactionsResult] = await Promise.all([
      // Search customers
      supabase
        .from('customers')
        .select('id, name, email, phone')
        .eq('organization_id', organizationId)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(limit),

      // Search invoices
      supabase
        .from('invoices')
        .select('id, invoice_number, status, total_amount, customer:customers(name)')
        .eq('organization_id', organizationId)
        .or(`invoice_number.ilike.%${searchTerm}%`)
        .limit(limit),

      // Search products
      supabase
        .from('products')
        .select('id, name, sku, unit_price')
        .eq('organization_id', organizationId)
        .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
        .limit(limit),

      // Search transactions
      supabase
        .from('transactions')
        .select('id, description, amount, type, date')
        .eq('organization_id', organizationId)
        .ilike('description', `%${searchTerm}%`)
        .limit(limit),
    ]);

    // Process customers
    if (!customersResult.error && customersResult.data) {
      customersResult.data.forEach((customer: any) => {
        results.push({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: customer.email || customer.phone,
          url: `/customers/${customer.id}`,
          icon: 'Users',
        });
      });
    }

    // Process invoices
    if (!invoicesResult.error && invoicesResult.data) {
      invoicesResult.data.forEach((invoice: any) => {
        const customerName = Array.isArray(invoice.customer) 
          ? invoice.customer[0]?.name 
          : invoice.customer?.name;
        results.push({
          id: invoice.id,
          type: 'invoice',
          title: invoice.invoice_number,
          subtitle: `${customerName || 'Unknown'} - PKR ${invoice.total_amount?.toLocaleString() || 0}`,
          url: `/invoices/${invoice.id}`,
          icon: 'FileText',
        });
      });
    }

    // Process products
    if (!productsResult.error && productsResult.data) {
      productsResult.data.forEach((product: any) => {
        results.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: product.sku ? `SKU: ${product.sku} - PKR ${product.unit_price?.toLocaleString() || 0}` : `PKR ${product.unit_price?.toLocaleString() || 0}`,
          url: `/products/${product.id}`,
          icon: 'Package',
        });
      });
    }

    // Process transactions
    if (!transactionsResult.error && transactionsResult.data) {
      transactionsResult.data.forEach((transaction: any) => {
        results.push({
          id: transaction.id,
          type: 'transaction',
          title: transaction.description || 'Transaction',
          subtitle: `${transaction.type === 'income' ? '+' : '-'} PKR ${transaction.amount?.toLocaleString() || 0} - ${transaction.date}`,
          url: `/transactions/${transaction.id}`,
          icon: 'ArrowLeftRight',
        });
      });
    }

    // Log any errors
    const errors = [customersResult.error, invoicesResult.error, productsResult.error, transactionsResult.error].filter(Boolean);
    if (errors.length > 0) {
      logger.warn('Search partial errors:', errors);
    }

    return {
      results: results.slice(0, limit),
      total: results.length,
    };
  } catch (error) {
    logger.error('Global search error:', error);
    return {
      results: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}
