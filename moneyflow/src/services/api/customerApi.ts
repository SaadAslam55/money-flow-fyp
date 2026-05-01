// src/services/api/customerApi.ts
/**
 * Customer API Service
 * Handles customer CRUD operations, import/export, and customer portal management
 * Includes CSV import functionality and customer statistics
 */

import { supabase } from '@/services/supabase/client';
import type { Customer, Invoice, CustomerInsert } from '@/types/database.types';
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
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length < 2 || !lines[0]) {
          reject(new Error('CSV file is empty or invalid'));
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const data: T[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
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
 * Get all customers with optional filters and pagination
 */
export async function getCustomers(
  organizationId: string,
  filters?: {
    search?: string;
    hasOutstanding?: boolean;
    sortBy?: 'name' | 'balance' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  },
  page: number = 1,
  perPage: number = 50
) {
  try {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply search filter
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    // Filter by outstanding balance
    if (filters?.hasOutstanding) {
      query = query.gt('outstanding_balance', 0);
    }

    // Apply sorting
    const sortBy = filters?.sortBy ?? 'name';
    const sortOrder = filters?.sortOrder ?? 'asc';

    if (sortBy === 'balance') {
      query = query.order('outstanding_balance', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    // Calculate additional metrics
    const typedCustomers = (data ?? []) as Customer[];
    const customersWithMetrics = await Promise.all(
      typedCustomers.map(async (customer) => {
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total_amount, invoice_date, status')
          .eq('customer_id', customer.id)
          .order('invoice_date', { ascending: false });

        const typedInvoices = (invoices ?? []) as Array<
          Pick<Invoice, 'total_amount' | 'invoice_date' | 'status'>
        >;
        const paidInvoices = typedInvoices.filter((inv) => inv.status === 'paid');
        const totalPurchases = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);
        const lastPurchaseDate = paidInvoices[0]?.invoice_date || null;

        return {
          ...customer,
          total_purchases: totalPurchases,
          last_purchase_date: lastPurchaseDate,
        };
      })
    );

    return {
      data: customersWithMetrics as (Customer & {
        total_purchases: number;
        last_purchase_date: string | null;
      })[],
      count: count ?? 0,
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching customers:', error instanceof Error ? error.message : String(error));
    return { data: [], count: 0, error: error as Error };
  }
}

/**
 * Get single customer with detailed information
 */
export async function getCustomer(customerId: string) {
  try {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError) throw customerError;

    // Get customer's invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('invoice_date', { ascending: false });

    if (invoicesError) throw invoicesError;

    // Get customer's transactions (payments)
    type InvoiceWithId = { id: string; status: string; total_amount: number; invoice_date: string };
    const typedInvoices = invoices as InvoiceWithId[] | null;
    const invoiceIds = typedInvoices?.map((inv) => inv.id) || [];
    let transactions: any[] = [];

    if (invoiceIds.length > 0) {
      const { data: transData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference_type', 'invoice')
        .in('reference_id', invoiceIds)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;
      transactions = transData ?? [];
    }

    // Calculate metrics
    const totalPurchases =
      typedInvoices?.reduce(
        (sum, inv) => (inv.status === 'paid' ? sum + inv.total_amount : sum),
        0
      ) || 0;

    const lastPurchase = typedInvoices?.[0];

    return {
      data: {
        ...(customer as Customer),
        invoices,
        transactions,
        total_purchases: totalPurchases,
        last_purchase_date: lastPurchase?.invoice_date || null,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching customer:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Create new customer
 */
export async function createCustomer(
  customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'outstanding_balance'>,
  organizationId: string
) {
  try {
    // Check for duplicate email if provided
    if (customerData.email) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('email', customerData.email)
        .maybeSingle();

      if (existing) {
        throw new Error('A customer with this email already exists');
      }
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        organization_id: organizationId,
        outstanding_balance: 0,
      } satisfies CustomerInsert)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error creating customer:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Update customer
 */
export async function updateCustomer(customerId: string, updates: Partial<Customer>) {
  try {
    // Remove fields that shouldn't be updated directly
    const { id: _id, organization_id: _organization_id, created_at: _created_at, updated_at: _updated_at, outstanding_balance, ...updateData } =
      updates;

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error updating customer:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Delete customer (soft delete by deactivating)
 */
export async function deleteCustomer(customerId: string) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update({ is_active: false })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error deleting customer:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Enable customer portal access
 */
export async function enableCustomerPortal(customerId: string, password: string) {
  try {
    // Hash password (in production, use bcrypt or similar)
    const hashedPassword = btoa(password); // Simple base64 for demo

    const { data, error } = await supabase
      .from('customers')
      .update({
        portal_access: true,
        portal_password_hash: hashedPassword,
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error enabling portal access:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get customer statistics
 */
export async function getCustomerStatistics(organizationId: string) {
  try {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, outstanding_balance, created_at')
      .eq('organization_id', organizationId);

    const { data: invoices } = await supabase
      .from('invoices')
      .select('customer_id, total_amount, status')
      .eq('organization_id', organizationId);

    const typedCustomers = (customers ?? []) as Array<
      Pick<Customer, 'id' | 'name' | 'outstanding_balance' | 'created_at'>
    >;
    const totalCustomers = typedCustomers.length;
    const totalOutstanding = typedCustomers.reduce(
      (sum, c) => sum + (c.outstanding_balance ?? 0),
      0
    );

    const now = new Date();
    const newThisMonth = typedCustomers.filter((c) => {
      if (!c.created_at) return false;
      const created = new Date(c.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    // Top customers by revenue
    const typedInvoices = (invoices ?? []) as Array<
      Pick<Invoice, 'customer_id' | 'total_amount' | 'status'>
    >;
    const customerRevenue = new Map<string, { name: string; total: number }>();
    typedInvoices.forEach((inv) => {
      if (inv.status === 'paid') {
        const customer = typedCustomers.find((c) => c.id === inv.customer_id);
        const current = customerRevenue.get(inv.customer_id ?? '');
        customerRevenue.set(inv.customer_id ?? '', {
          name: customer?.name ?? 'Unknown',
          total: (current?.total ?? 0) + (inv.total_amount ?? 0),
        });
      }
    });

    const topCustomers = Array.from(customerRevenue.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c) => ({
        id: typedCustomers.find((cust) => cust.name === c.name)?.id ?? '',
        name: c.name,
        total_revenue: c.total,
      }));

    // Calculate average purchase
    const paidInvoices = typedInvoices.filter((inv) => inv.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);
    const uniqueCustomers = new Set(paidInvoices.map((inv) => inv.customer_id).filter(Boolean));
    const averagePurchase = uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0;

    return {
      data: {
        total_customers: totalCustomers,
        new_this_month: newThisMonth,
        total_outstanding: totalOutstanding,
        average_purchase: averagePurchase,
        top_customers: topCustomers,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching customer statistics:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Import customers from CSV file
 */
export async function importCustomersFromCSV(
  file: File,
  organizationId: string
): Promise<{ count: number; skipped: number; error: Error | null }> {
  try {
    const rows = await parseCSV<Record<string, string>>(file);

    if (rows.length === 0) {
      return { count: 0, skipped: 0, error: new Error('CSV file contains no data rows') };
    }

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        const name = row.name || row.customer_name || '';
        const email = row.email || '';

        if (!name) {
          skipped++;
          continue;
        }

        const { error: insertError } = await supabase
          .from('customers')
          .insert({
            organization_id: organizationId,
            name,
            email: email || null,
            phone: row.phone || null,
            address: row.address || null,
            city: row.city || null,
            state: row.state || row.province || null,
            postal_code: row.postal_code || row.zip || row.zip_code || null,
            country: row.country || 'Pakistan',
            tax_number: row.tax_number || row.ntn || null,
            is_active: true,
          });

        if (insertError) {
          logger.warn('Skipping customer row:', insertError.message);
          skipped++;
        } else {
          imported++;
        }
      } catch {
        skipped++;
      }
    }

    return { count: imported, skipped, error: null };
  } catch (error) {
    logger.error('Error importing customers:', error instanceof Error ? error.message : String(error));
    return { count: 0, skipped: 0, error: error as Error };
  }
}

/**
 * Export customers to CSV
 */
export async function exportCustomersToCSV(
  organizationId: string
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;

    if (!customers || customers.length === 0) {
      return { data: null, error: new Error('No customers to export') };
    }

    const headers = [
      'name',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'postal_code',
      'country',
      'tax_number',
      'is_active',
    ];

    const csvRows = [
      headers.join(','),
      ...customers.map((c) =>
        headers
          .map((h) => {
            const val = (c as Record<string, unknown>)[h];
            const str = val === null || val === undefined ? '' : String(val);
            return str.includes(',') ? `"${str}"` : str;
          })
          .join(',')
      ),
    ];

    return { data: csvRows.join('\n'), error: null };
  } catch (error) {
    logger.error('Error exporting customers:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}
