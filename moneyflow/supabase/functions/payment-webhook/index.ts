/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/payment-webhook/index.ts
/**
 * Payment Webhook Handler
 * Processes payment webhooks from various payment providers
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, corsResponse, corsErrorResponse } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/auth.ts';
import { isValidUUID, validateRequired } from '../_shared/validators.ts';

interface PaymentWebhookPayload {
  invoice_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_date: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    // Parse request body
    const body = await req.json() as PaymentWebhookPayload;

    // Validate required fields
    const requiredFields = ['invoice_id', 'amount', 'payment_method', 'transaction_id', 'payment_date'];
    for (const field of requiredFields) {
      const validation = validateRequired(body[field as keyof PaymentWebhookPayload], field);
      if (!validation.valid) {
        return corsErrorResponse(validation.error!, 400, req);
      }
    }

    // Validate invoice_id format
    if (!isValidUUID(body.invoice_id)) {
      return corsErrorResponse(
        new Error('Invalid invoice_id format'),
        400,
        req
      );
    }

    // Validate amount
    if (body.amount <= 0) {
      return corsErrorResponse(
        new Error('Payment amount must be greater than 0'),
        400,
        req
      );
    }

    const supabase = getServiceClient();

    // Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, organization:organizations(id)')
      .eq('id', body.invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return corsErrorResponse(
        new Error('Invoice not found'),
        404,
        req
      );
    }

    // Check if payment amount exceeds amount due
    if (body.amount > invoice.amount_due) {
      return corsErrorResponse(
        new Error('Payment amount exceeds amount due'),
        400,
        req
      );
    }

    // Update invoice payment
    const newAmountPaid = invoice.amount_paid + body.amount;
    const newAmountDue = invoice.amount_due - body.amount;
    let newStatus = invoice.status;

    // Update status if fully paid
    if (newAmountDue <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0 && invoice.status === 'draft') {
      newStatus = 'sent';
    }

    // Update invoice
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.invoice_id);

    if (updateError) {
      console.error('Invoice update error:', updateError);
      return corsErrorResponse(
        new Error('Failed to update invoice'),
        500,
        req
      );
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        organization_id: invoice.organization_id,
        type: 'income',
        amount: body.amount,
        date: body.payment_date,
        description: `Payment for invoice ${invoice.invoice_number}`,
        reference_type: 'invoice',
        reference_id: body.invoice_id,
        payment_method: body.payment_method,
        created_by: invoice.created_by || null,
      });

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      // Don't fail the request, but log the error
    }

    // Update customer outstanding balance if customer exists
    if (invoice.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('outstanding_balance')
        .eq('id', invoice.customer_id)
        .single();

      if (customer) {
        const newBalance = Math.max(0, customer.outstanding_balance - body.amount);
        await supabase
          .from('customers')
          .update({ outstanding_balance: newBalance })
          .eq('id', invoice.customer_id);
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: invoice.organization_id,
      user_id: invoice.created_by || null,
      action: 'payment_received',
      entity_type: 'invoice',
      entity_id: body.invoice_id,
      new_values: {
        amount: body.amount,
        payment_method: body.payment_method,
        transaction_id: body.transaction_id,
        new_status: newStatus,
      },
    });

    return corsResponse(
      {
        success: true,
        message: 'Payment processed successfully',
        data: {
          invoice_id: body.invoice_id,
          amount_paid: newAmountPaid,
          amount_due: newAmountDue,
          status: newStatus,
        },
      },
      200,
      req
    );
  } catch (error) {
    console.error('Payment webhook error:', error);
    return corsErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500,
      req
    );
  }
});

