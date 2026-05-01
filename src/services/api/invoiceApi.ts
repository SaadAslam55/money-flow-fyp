// src/services/api/invoiceApi.ts
/**
 * Invoice API Service
 * Handles invoice CRUD operations, payment recording, and invoice calculations
 * Includes invoice filtering, search, and status management
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { 
  InvoiceFormData, 
  InvoiceWithDetails, 
  PaymentRecord,
  InvoiceCalculation 
} from '@/types/invoice.types';
import type { InvoiceFilters, InvoiceInsert } from '@/types/database.types';

/**
 * Calculate invoice totals with tax and discount
 */
export function calculateInvoiceTotals(
  items: InvoiceFormData['items'],
  discountType?: 'percentage' | 'fixed',
  discountValue?: number
): InvoiceCalculation {
  // Calculate line totals and tax
  const lineItems = items.map(item => ({
    ...item,
    line_total: item.quantity * item.unit_price,
    tax_amount: (item.quantity * item.unit_price) * (item.tax_rate / 100),
  }));

  // Calculate subtotal (before tax)
  const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);

  // Calculate total tax
  const tax_amount = lineItems.reduce((sum, item) => sum + item.tax_amount, 0);

  // Calculate discount
  let discount_amount = 0;
  if (discountValue && discountValue > 0) {
    if (discountType === 'percentage') {
      discount_amount = subtotal * (discountValue / 100);
    } else {
      discount_amount = discountValue;
    }
  }

  // Calculate final total
  const total_amount = subtotal + tax_amount - discount_amount;

  return {
    subtotal,
    tax_amount,
    discount_amount,
    total_amount,
    items: lineItems,
  };
}

/**
 * Create new invoice with items and stock updates
 */
export async function createInvoice(
  data: InvoiceFormData, 
  organizationId: string, 
  userId: string
) {
  try {
    // Calculate totals
    const totals = calculateInvoiceTotals(
      data.items,
      data.discount_type,
      data.discount_value
    );

    // Generate invoice number using RPC function
    const { data: invoiceNumber, error: numberError } = await supabase
      .rpc('generate_invoice_number', { p_org_id: organizationId });

    if (numberError) throw numberError;

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        organization_id: organizationId,
        customer_id: data.customer_id,
        invoice_number: invoiceNumber,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        subtotal: totals.subtotal,
        tax_amount: totals.tax_amount,
        discount_amount: totals.discount_amount,
        total_amount: totals.total_amount,
        amount_paid: 0,
        amount_due: totals.total_amount,
        notes: data.notes || null,
        terms: data.terms || null,
        status: 'draft',
        created_by: userId,
      } satisfies InvoiceInsert)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    const typedInvoice = invoice as { id: string };
    // Create invoice items
    const itemsToInsert = totals.items.map(item => ({
      invoice_id: typedInvoice.id,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
      line_total: item.line_total + item.tax_amount,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // Update product stock for items with product_id
    for (const item of data.items) {
      if (item.product_id) {
        await updateProductStock(item.product_id, -item.quantity);
      }
    }

    // Update customer outstanding balance
    await updateCustomerBalance(data.customer_id);

    return { data: invoice, error: null };
  } catch (error) {
    logger.error('Error creating invoice:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get all invoices with filters and pagination
 */
export async function getInvoices(
  organizationId: string,
  filters?: InvoiceFilters,
  page: number = 1,
  perPage: number = 50
) {
  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, name, email, phone, address),
        items:invoice_items(
          *,
          product:products(id, name, sku)
        ),
        created_by_user:users!invoices_created_by_fkey(id, full_name, email)
      `, { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    if (filters?.start_date) {
      query = query.gte('invoice_date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('invoice_date', filters.end_date);
    }

    if (filters?.search) {
      query = query.or(`invoice_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    // Pagination
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;

    const { data, error, count } = await query
      .order('invoice_date', { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      data: data as InvoiceWithDetails[],
      count: count ?? 0,
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching invoices:', error instanceof Error ? error.message : String(error));
    return { data: [], count: 0, error: error as Error };
  }
}

/**
 * Get single invoice by ID with all details
 */
export async function getInvoice(invoiceId: string) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(
          *,
          product:products(*)
        ),
        created_by_user:users!invoices_created_by_fkey(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;

    return { data: data as InvoiceWithDetails, error: null };
  } catch (error) {
    logger.error('Error fetching invoice:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Update invoice with recalculation
 */
export async function updateInvoice(
  invoiceId: string,
  updates: Partial<InvoiceFormData>
) {
  try {
    let updateData: any = {};

    // If items are updated, recalculate totals
    if (updates.items) {
      const totals = calculateInvoiceTotals(
        updates.items,
        updates.discount_type,
        updates.discount_value
      );

      updateData = {
        subtotal: totals.subtotal,
        tax_amount: totals.tax_amount,
        discount_amount: totals.discount_amount,
        total_amount: totals.total_amount,
        amount_due: totals.total_amount,
      };

      // Delete old items and insert new ones
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      const itemsToInsert = totals.items.map(item => ({
        invoice_id: invoiceId,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        line_total: item.line_total + item.tax_amount,
      }));

      await supabase
        .from('invoice_items')
        .insert(itemsToInsert);
    }

    // Add other updates
    if (updates.customer_id) updateData.customer_id = updates.customer_id;
    if (updates.invoice_date) updateData.invoice_date = updates.invoice_date;
    if (updates.due_date) updateData.due_date = updates.due_date;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.terms !== undefined) updateData.terms = updates.terms;

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error updating invoice:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Delete invoice and restore stock
 */
export async function deleteInvoice(invoiceId: string) {
  try {
    // Get invoice details first to restore stock
    const { data: invoice } = await getInvoice(invoiceId);
    
    if (invoice) {
      // Restore product stock
      for (const item of invoice.items) {
        if (item.product_id) {
          await updateProductStock(item.product_id, item.quantity);
        }
      }

      // Update customer balance
      await updateCustomerBalance(invoice.customer_id);
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    logger.error('Error deleting invoice:', error instanceof Error ? error.message : String(error));
    return { error: error as Error };
  }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: string
) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error updating invoice status:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Record payment for invoice
 */
export async function recordPayment(payment: PaymentRecord) {
  try {
    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', payment.invoice_id)
      .single();

    if (invoiceError) throw invoiceError;

    // Calculate new amounts
    const new_amount_paid = invoice.amount_paid + payment.amount;
    const new_amount_due = invoice.total_amount - new_amount_paid;

    // Determine new status
    let new_status = invoice.status;
    if (new_amount_due <= 0) {
      new_status = 'paid';
    } else if (new_amount_paid > 0) {
      new_status = 'partially_paid';
    }

    // Update invoice
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        amount_paid: new_amount_paid,
        amount_due: new_amount_due,
        status: new_status,
      })
      .eq('id', payment.invoice_id);

    if (updateError) throw updateError;

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        organization_id: invoice.organization_id,
        type: 'income',
        amount: payment.amount,
        date: payment.payment_date,
        description: `Payment for invoice ${invoice.invoice_number}`,
        reference_type: 'invoice',
        reference_id: payment.invoice_id,
        payment_method: payment.payment_method,
        created_by: invoice.created_by,
      });

    if (transactionError) throw transactionError;

    // Update customer balance
    await updateCustomerBalance(invoice.customer_id);

    return { error: null };
  } catch (error) {
    logger.error('Error recording payment:', error instanceof Error ? error.message : String(error));
    return { error: error as Error };
  }
}

/**
 * Send invoice via email
 */
export async function sendInvoice(
  invoiceId: string,
  recipientEmail?: string,
  message?: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('send-invoice-email', {
      body: {
        invoice_id: invoiceId,
        recipient_email: recipientEmail,
        message,
      },
    });

    if (error) throw error;

    // Update invoice status to 'sent' if currently 'draft'
    const { data: invoice } = await getInvoice(invoiceId);
    if (invoice?.status === 'draft') {
      await updateInvoiceStatus(invoiceId, 'sent');
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Error sending invoice:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Duplicate invoice
 */
export async function duplicateInvoice(invoiceId: string, userId: string) {
  try {
    const { data: original, error } = await getInvoice(invoiceId);
    if (error) throw error;
    if (!original) throw new Error('Invoice not found');

    // Create new invoice with same data
    const invoiceDate = new Date().toISOString().split('T')[0];
    if (!invoiceDate) throw new Error('Failed to generate invoice date');
    const newInvoiceData: InvoiceFormData = {
      customer_id: original.customer_id,
      invoice_date: invoiceDate,
      due_date: original.due_date,
      items: original.items.map(item => ({
        product_id: item.product_id || undefined,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
      })),
      notes: original.notes || undefined,
      terms: original.terms || undefined,
    };

    return await createInvoice(newInvoiceData, original.organization_id, userId);
  } catch (error) {
    logger.error('Error duplicating invoice:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Generate and download invoice PDF
 */
export async function downloadInvoicePDF(invoiceId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
      body: { invoice_id: invoiceId },
    });

    if (error) throw error;

    // If HTML is returned, convert to PDF using browser print
    if (data?.html) {
      // Open new window with HTML and trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } else if (data?.pdf_url) {
      // If PDF URL is provided, download directly
      const response = await fetch(data.pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${data.invoice_number || invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Error downloading invoice PDF:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Helper: Update product stock
 */
async function updateProductStock(productId: string, adjustment: number) {
  const { data: product } = await supabase
    .from('products')
    .select('current_stock, track_inventory')
    .eq('id', productId)
    .single();

  if (product) {
    const typedProduct = product as { current_stock?: number | null; track_inventory?: boolean };
    if (typedProduct.track_inventory) {
      await supabase
        .from('products')
        .update({ current_stock: (typedProduct.current_stock ?? 0) + adjustment })
        .eq('id', productId);
    }
  }
}

/**
 * Helper: Update customer outstanding balance
 */
async function updateCustomerBalance(customerId: string) {
  const { data } = await supabase
    .from('invoices')
    .select('amount_due')
    .eq('customer_id', customerId)
    .not('status', 'in', '(cancelled,paid)');

  const outstanding = data?.reduce((sum, inv) => sum + inv.amount_due, 0) || 0;

  await supabase
    .from('customers')
    .update({ outstanding_balance: outstanding })
    .eq('id', customerId);
}