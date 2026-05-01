/**
 * Invoice Service
 * Invoice operations with dual-backend support
 */

import { BaseService } from './base.service';
import api from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto } from '@/types';

// ============================================
// Invoice Service
// ============================================

class InvoiceService extends BaseService<Invoice, CreateInvoiceDto, UpdateInvoiceDto> {
  protected endpoint = '/invoices';
  protected table = 'invoices';

  /**
   * Get all invoices with relations
   */
  override async getAll(params?: Record<string, any>): Promise<Invoice[]> {
    if (this.useNewApi) {
      const response = await api.get<Invoice[]>(this.endpoint, params);
      return response.data;
    }

    // Legacy Supabase with relations
    let query = supabase.from(this.table).select(`
      *,
      customer:customers(id, name, email),
      items:invoice_items(*)
    `);

    if (params?.organization_id) {
      query = query.eq('organization_id', params.organization_id);
    }
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.customer_id) {
      query = query.eq('customer_id', params.customer_id);
    }
    if (params?.start_date) {
      query = query.gte('invoice_date', params.start_date);
    }
    if (params?.end_date) {
      query = query.lte('invoice_date', params.end_date);
    }

    const { data, error } = await query
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
  }

  /**
   * Get single invoice with full relations
   */
  override async getById(id: string): Promise<Invoice> {
    if (this.useNewApi) {
      const response = await api.get<Invoice>(`${this.endpoint}/${id}`);
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .select(
        `
        *,
        customer:customers(*),
        items:invoice_items(*, product:products(*)),
        transactions(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Invoice;
  }

  /**
   * Send invoice to customer
   */
  async send(id: string): Promise<Invoice> {
    if (this.useNewApi) {
      const response = await api.post<Invoice>(`${this.endpoint}/${id}/send`);
      return response.data;
    }

    // Legacy: Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-invoice', {
      body: { invoiceId: id },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Record payment for invoice
   */
  async recordPayment(
    id: string,
    payment: {
      amount: number;
      payment_method: string;
      reference?: string;
      notes?: string;
    }
  ): Promise<Invoice> {
    if (this.useNewApi) {
      const response = await api.post<Invoice>(`${this.endpoint}/${id}/record-payment`, payment);
      return response.data;
    }

    // Legacy: Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('record-payment', {
      body: { invoiceId: id, ...payment },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Mark invoice as paid
   */
  async markPaid(id: string): Promise<Invoice> {
    if (this.useNewApi) {
      const response = await api.post<Invoice>(`${this.endpoint}/${id}/mark-paid`);
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .update({
        status: 'PAID',
        payment_status: 'PAID',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Invoice;
  }

  /**
   * Duplicate invoice
   */
  async duplicate(id: string): Promise<Invoice> {
    if (this.useNewApi) {
      const response = await api.post<Invoice>(`${this.endpoint}/${id}/duplicate`);
      return response.data;
    }

    // Legacy: Fetch and recreate
    const original = await this.getById(id);

    const newInvoice = {
      ...original,
      id: undefined,
      invoice_number: undefined, // Will be auto-generated
      status: 'DRAFT',
      payment_status: 'UNPAID',
      created_at: undefined,
      updated_at: undefined,
    };

    return this.create(newInvoice as CreateInvoiceDto);
  }

  /**
   * Get invoice statistics (always uses new API)
   */
  async getStats(period: string = 'month'): Promise<{
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
  }> {
    const response = await api.get<{
      total: number;
      paid: number;
      pending: number;
      overdue: number;
      totalAmount: number;
      paidAmount: number;
    }>(`${this.endpoint}/stats`, { period });
    return response.data;
  }

  /**
   * Get overdue invoices (always uses new API)
   */
  async getOverdue(): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>(`${this.endpoint}/overdue`);
    return response.data;
  }

  /**
   * Generate PDF
   */
  async generatePdf(id: string): Promise<Blob> {
    if (this.useNewApi) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}${this.endpoint}/${id}/pdf`, {
        headers: {
          Authorization: `Bearer ${await this.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      return response.blob();
    }

    // Legacy: Use Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
      body: { invoiceId: id },
    });

    if (error) throw error;
    return new Blob([data], { type: 'application/pdf' });
  }

  /**
   * Get next invoice number
   */
  async getNextNumber(prefix?: string): Promise<string> {
    if (this.useNewApi) {
      const response = await api.get<{ number: string }>(`${this.endpoint}/next-number`, {
        prefix,
      });
      return response.data.number;
    }

    // Legacy: Generate client-side
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix || 'INV'}-${timestamp}`;
  }

  /**
   * Helper to get access token
   */
  private async getAccessToken(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || '';
  }
}

// ============================================
// Export Singleton
// ============================================

export const invoiceService = new InvoiceService();
export default invoiceService;
