// src/services/payments/invoices.ts
/**
 * Payment Invoices Service
 * Handles billing history and invoice management for subscriptions
 * Supports local payment methods (JazzCash, EasyPaisa, Raast)
 * 
 * Features:
 * - Get billing history from payments table
 * - Get individual invoice details
 * - Download invoice PDFs
 * 
 * @example
 * ```typescript
 *
import { getBillingHistory, getInvoice, downloadInvoice } from '@/services/payments/invoices';
 * 
 * // Get billing history
 * const { data, error } = await getBillingHistory('org-id');
 * 
 * // Get invoice
 * const { data, error } = await getInvoice('invoice-id', 'org-id');
 * 
 * // Download PDF
 * const { url, error } = await downloadInvoice('invoice-id', 'org-id');
 * ```
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { BillingInvoice } from '@/types/subscription.types';

/**
 * Get billing history (invoices) for an organization
 * 
 * Fetches billing history from the payments table and converts to invoice format.
 * 
 * @param organizationId - Organization ID
 * @returns Billing invoices array and error status
 */
export async function getBillingHistory(
  organizationId: string
): Promise<{ data: BillingInvoice[] | null; error: Error | null }> {
  try {
    // Validate organization ID
    if (!organizationId || typeof organizationId !== 'string' || organizationId.trim().length === 0) {
      return {
        data: null,
        error: new Error('Organization ID is required'),
      };
    }

    // Get invoices from payments table
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('organization_id', organizationId.trim())
      .order('created_at', { ascending: false })
      .limit(100); // Limit to prevent excessive data

    if (paymentsError) {
      if (import.meta.env.DEV) {

        logger.error('Error fetching payments:', paymentsError instanceof Error ? paymentsError.message : String(paymentsError));
      }
      throw paymentsError;
    }

    // Convert local payments to invoice format
    const typedPayments = (payments ?? []) as Array<{
      id: string;
      status?: string;
      payment_reference?: string;
      amount?: number | string;
      currency?: string;
      created_at?: string;
      invoice_pdf_url?: string | null;
      hosted_invoice_url?: string | null;
    }>;
    
    const invoices: BillingInvoice[] = typedPayments.map((payment) => {
      // Determine status based on payment status
      let invoiceStatus: 'paid' | 'open' | 'void' | 'uncollectible' = 'open';
      if (payment.status === 'succeeded' || payment.status === 'completed') {
        invoiceStatus = 'paid';
      } else if (payment.status === 'failed' || payment.status === 'cancelled') {
        invoiceStatus = 'uncollectible';
      } else if (payment.status === 'void') {
        invoiceStatus = 'void';
      }

      return {
        id: payment.id,
        invoice_number: payment.payment_reference || payment.id,
        amount: Number(payment.amount) || 0,
        currency: payment.currency ?? 'PKR',
        status: invoiceStatus,
        due_date: payment.created_at || new Date().toISOString(),
        paid_at:
          payment.status === 'succeeded' || payment.status === 'completed'
            ? payment.created_at || null
            : null,
      pdf_url: (payment as any).invoice_pdf_url || null,
      hosted_invoice_url: (payment as any).hosted_invoice_url || null,
      created_at: (payment as any).created_at || new Date().toISOString(),
      };
    });

    return { data: invoices, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error fetching billing history:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch billing history'),
    };
  }
}

/**
 * Get a single invoice by ID
 * 
 * Fetches a specific invoice from the payments table by ID.
 * 
 * @param invoiceId - Invoice/payment ID
 * @param organizationId - Organization ID (for security/validation)
 * @returns Invoice data and error status
 */
export async function getInvoice(
  invoiceId: string,
  organizationId: string
): Promise<{ data: BillingInvoice | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!invoiceId || typeof invoiceId !== 'string' || invoiceId.trim().length === 0) {
      return {
        data: null,
        error: new Error('Invoice ID is required'),
      };
    }

    if (!organizationId || typeof organizationId !== 'string' || organizationId.trim().length === 0) {
      return {
        data: null,
        error: new Error('Organization ID is required'),
      };
    }

    // Check local payments
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', invoiceId.trim())
      .eq('organization_id', organizationId.trim())
      .single();

    if (paymentError || !payment) {
      if (import.meta.env.DEV && paymentError) {

        logger.error('Error fetching payment:', paymentError instanceof Error ? paymentError.message : String(paymentError));
      }
      return {
        data: null,
        error: new Error('Invoice not found'),
      };
    }

    // Determine status based on payment status
    const typedPayment = payment as {
      id: string;
      status?: string;
      payment_reference?: string;
      amount?: number | string;
      currency?: string;
      created_at?: string;
      invoice_pdf_url?: string | null;
      hosted_invoice_url?: string | null;
    };

    let invoiceStatus: 'paid' | 'open' | 'void' | 'uncollectible' = 'open';
    if (typedPayment.status === 'succeeded' || typedPayment.status === 'completed') {
      invoiceStatus = 'paid';
    } else if (typedPayment.status === 'failed' || typedPayment.status === 'cancelled') {
      invoiceStatus = 'uncollectible';
    } else if (typedPayment.status === 'void') {
      invoiceStatus = 'void';
    }

    const invoice: BillingInvoice = {
      id: typedPayment.id,
      invoice_number: typedPayment.payment_reference || typedPayment.id,
      amount: Number(typedPayment.amount) || 0,
      currency: typedPayment.currency ?? 'PKR',
      status: invoiceStatus,
      due_date: typedPayment.created_at || new Date().toISOString(),
      paid_at:
        typedPayment.status === 'succeeded' || typedPayment.status === 'completed'
          ? typedPayment.created_at || null
          : null,
      pdf_url: typedPayment.invoice_pdf_url || null,
      hosted_invoice_url: typedPayment.hosted_invoice_url || null,
      created_at: typedPayment.created_at || new Date().toISOString(),
    };

    return { data: invoice, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error fetching invoice:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch invoice'),
    };
  }
}

/**
 * Download invoice PDF
 * 
 * Generates and downloads invoice PDF from payment data via Supabase Edge Function.
 * 
 * @param invoiceId - Invoice/payment ID
 * @param organizationId - Organization ID (for security/validation)
 * @returns PDF blob URL and error status
 */
export async function downloadInvoice(
  invoiceId: string,
  organizationId: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!invoiceId || typeof invoiceId !== 'string' || invoiceId.trim().length === 0) {
      return {
        url: null,
        error: new Error('Invoice ID is required'),
      };
    }

    if (!organizationId || typeof organizationId !== 'string' || organizationId.trim().length === 0) {
      return {
        url: null,
        error: new Error('Organization ID is required'),
      };
    }

    // First verify invoice exists and belongs to organization
    const { data: invoice, error: invoiceError } = await getInvoice(
      invoiceId.trim(),
      organizationId.trim()
    );

    if (invoiceError || !invoice) {
      return {
        url: null,
        error: invoiceError || new Error('Invoice not found'),
      };
    }

    // If PDF URL already exists, return it
    if (invoice.pdf_url) {
      return { url: invoice.pdf_url, error: null };
    }

    // Generate PDF via Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: {
          invoiceId: invoiceId.trim(),
          organizationId: organizationId.trim(),
        },
      });

      if (error) {
        if (import.meta.env.DEV) {

          logger.warn('Failed to generate invoice PDF:', error instanceof Error ? error.message : String(error));
        }
        return {
          url: null,
          error: new Error('PDF generation failed'),
        };
      }

      // If PDF URL is returned, use it
      if (data?.pdfUrl || data?.url) {
        return {
          url: data.pdfUrl || data.url,
          error: null,
        };
      }

      // If PDF blob is returned, create object URL
      if (data?.pdfBlob) {
        const blob = new Blob([data.pdfBlob], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        return { url, error: null };
      }

      return {
        url: null,
        error: new Error('PDF not available for this invoice'),
      };
    } catch (pdfErr) {
      if (import.meta.env.DEV) {

        logger.warn('Failed to generate invoice PDF:', pdfErr instanceof Error ? pdfErr.message : String(pdfErr));
      }
      return {
        url: null,
        error: new Error('PDF generation failed'),
      };
    }
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Error downloading invoice:', error instanceof Error ? error.message : String(error));
    }
    return {
      url: null,
      error: error instanceof Error ? error : new Error('Failed to download invoice'),
    };
  }
}

