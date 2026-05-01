// src/services/api/invoicePaymentLinks.ts
/**
 * Invoice Payment Links API Service
 * Handles generating and managing online payment links for invoices
 * 
 * Features:
 * - Generate secure payment links with tokens
 * - Payment link expiration management
 * - Payment link status tracking
 * 
 * @example
 * ```typescript
 * import { generatePaymentLink, getPaymentLinkByToken } from '@/services/api/invoicePaymentLinks';
 * 
 * // Generate payment link
 * const { data, error } = await generatePaymentLink('invoice-id');
 * 
 * // Get payment link by token
 * const { data: link, error } = await getPaymentLinkByToken('token');
 * ```
 */

import { supabase } from '@/services/supabase/client';
import { successResponse, errorResponse } from './baseApi';
import type { ApiResponse } from './baseApi';
import { logger } from '@/lib/logger';

export interface PaymentLink {
  id: string;
  invoice_id: string;
  payment_token: string;
  payment_url: string;
  expires_at?: string;
  amount: number;
  status: 'active' | 'expired' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
}

/**
 * Generate payment link for invoice
 * Creates a secure, token-based payment link that expires after 30 days
 * 
 * @param invoiceId - Invoice ID to generate payment link for
 * @returns Payment link data with URL and token
 */
export async function generatePaymentLink(
  invoiceId: string
): Promise<ApiResponse<PaymentLink>> {
  try {
    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, organization:organizations(*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;

    // Generate unique payment token
    const paymentToken = crypto.randomUUID();

    // Create payment link record
    const { data: paymentLink, error: linkError } = await supabase
      .from('invoice_payment_links')
      .insert({
        invoice_id: invoiceId,
        payment_token: paymentToken,
        amount: invoice.amount_due,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        status: 'active',
      })
      .select()
      .single();

    if (linkError) throw linkError;

    // Generate payment URL
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const paymentUrl = `${appUrl}/pay/${paymentToken}`;

    // Update payment link with URL
    const { data: updatedLink, error: updateError } = await supabase
      .from('invoice_payment_links')
      .update({ payment_url: paymentUrl })
      .eq('id', paymentLink.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return successResponse(updatedLink as PaymentLink);
  } catch (error) {
    logger.error('Error generating payment link:', error instanceof Error ? error.message : String(error));
    return errorResponse<PaymentLink>(error);
  }
}

/**
 * Get payment link by token
 * Retrieves payment link details and validates expiration
 * 
 * @param token - Payment link token
 * @returns Payment link data if valid and not expired
 */
export async function getPaymentLinkByToken(
  token: string
): Promise<ApiResponse<PaymentLink & { invoice: unknown }>> {
  try {
    const { data, error } = await supabase
      .from('invoice_payment_links')
      .select('*, invoice:invoices(*)')
      .eq('payment_token', token)
      .eq('status', 'active')
      .single();

    if (error) throw error;

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('invoice_payment_links')
        .update({ status: 'expired' })
        .eq('id', data.id);
      
      throw new Error('Payment link has expired');
    }

    return successResponse(data as PaymentLink & { invoice: unknown });
  } catch (error) {
    logger.error('Error getting payment link:', error instanceof Error ? error.message : String(error));
    return errorResponse<PaymentLink & { invoice: unknown }>(error);
  }
}

/**
 * Mark payment link as paid
 * Updates payment link status to 'paid' after successful payment
 * 
 * @param linkId - Payment link ID
 * @returns Updated payment link data
 */
export async function markPaymentLinkAsPaid(
  linkId: string
): Promise<ApiResponse<PaymentLink>> {
  try {
    const { data, error } = await supabase
      .from('invoice_payment_links')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', linkId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as PaymentLink);
  } catch (error) {
    logger.error('Error marking payment link as paid:', error instanceof Error ? error.message : String(error));
    return errorResponse<PaymentLink>(error);
  }
}

