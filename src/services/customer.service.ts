/**
 * Customer Service
 * Customer operations with dual-backend support
 */

import { BaseService } from './base.service';
import api from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types';

// ============================================
// Customer Service
// ============================================

class CustomerService extends BaseService<Customer, CreateCustomerDto, UpdateCustomerDto> {
  protected endpoint = '/customers';
  protected table = 'customers';

  /**
   * Get all customers with optional filters
   */
  override async getAll(params?: Record<string, any>): Promise<Customer[]> {
    if (this.useNewApi) {
      const response = await api.get<Customer[]>(this.endpoint, params);
      return response.data;
    }

    let query = supabase.from(this.table).select('*');

    if (params?.organization_id) {
      query = query.eq('organization_id', params.organization_id);
    }
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    const { data, error } = await query.is('deleted_at', null).order('name', { ascending: true });

    if (error) throw error;
    return data as Customer[];
  }

  /**
   * Get customer with invoices and transactions
   */
  async getWithDetails(id: string): Promise<Customer & { invoices: unknown[]; transactions: unknown[] }> {
    if (this.useNewApi) {
      const response = await api.get<Customer>(
        `${this.endpoint}/${id}?include=invoices,transactions`
      );
      return response.data as Customer & { invoices: unknown[]; transactions: unknown[] };
    }

    const { data, error } = await supabase
      .from(this.table)
      .select(
        `
        *,
        invoices(*),
        transactions(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Customer & { invoices: unknown[]; transactions: unknown[] };
  }

  /**
   * Search customers
   */
  override async search(query: string, params?: Record<string, unknown>): Promise<Customer[]> {
    const limit = typeof params?.limit === 'number' ? params.limit : 10;
    if (this.useNewApi) {
      const response = await api.get<Customer[]>(this.endpoint, { search: query, limit });
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .is('deleted_at', null)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data as Customer[];
  }

  /**
   * Update customer balance
   */
  async updateBalance(id: string, amount: number, type: 'add' | 'subtract'): Promise<Customer> {
    if (this.useNewApi) {
      const response = await api.post<Customer>(`${this.endpoint}/${id}/balance`, {
        amount,
        type,
      });
      return response.data;
    }

    // Legacy: Get current balance and update
    const { data: current, error: fetchError } = await supabase
      .from(this.table)
      .select('balance')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const currentBalance = current?.balance || 0;
    const newBalance = type === 'add' ? currentBalance + amount : currentBalance - amount;

    const { data, error } = await supabase
      .from(this.table)
      .update({ balance: newBalance })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  }

  /**
   * Get customer statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withBalance: number;
    totalBalance: number;
  }> {
    if (this.useNewApi) {
      const response = await api.get<any>(`${this.endpoint}/stats`);
      return response.data;
    }

    // Legacy: Calculate stats client-side
    const { data, error } = await supabase
      .from(this.table)
      .select('status, balance')
      .is('deleted_at', null);

    if (error) throw error;

    const customers = data || [];
    return {
      total: customers.length,
      active: customers.filter((c: any) => c.status === 'ACTIVE').length,
      inactive: customers.filter((c: any) => c.status === 'INACTIVE').length,
      withBalance: customers.filter((c: any) => c.balance > 0).length,
      totalBalance: customers.reduce((sum: number, c: any) => sum + (c.balance || 0), 0),
    };
  }

  /**
   * Get top customers by revenue
   */
  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    if (this.useNewApi) {
      const response = await api.get<Customer[]>(`${this.endpoint}/top`, { limit });
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .is('deleted_at', null)
      .order('total_spent', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Customer[];
  }
}

// ============================================
// Export Singleton
// ============================================

export const customerService = new CustomerService();
export default customerService;
