// supabase/functions/stripe-webhook/index.ts
/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
/**
 * Payment Webhook Handler
 * Processes payment webhook events from multiple payment providers:
 * - JazzCash
 * - EasyPaisa
 * - Raast
 * - Future: Bank integrations
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, corsResponse, corsErrorResponse } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/auth.ts';

const PAYMENT_WEBHOOK_SECRET = Deno.env.get('PAYMENT_WEBHOOK_SECRET') || '';
const JAZZCASH_MERCHANT_ID = Deno.env.get('JAZZCASH_MERCHANT_ID') || '';
const EASYPAISA_MERCHANT_ID = Deno.env.get('EASYPAISA_MERCHANT_ID') || '';
const RAAST_MERCHANT_ID = Deno.env.get('RAAST_MERCHANT_ID') || '';

interface PaymentEvent {
  id: string;
  type: string;
  provider: 'jazzcash' | 'easypaisa' | 'raast' | 'bank';
  data: Record<string, unknown>;
}

/**
 * Verify webhook signature using HMAC
 */
async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  try {
    if (!PAYMENT_WEBHOOK_SECRET) {
      console.warn('PAYMENT_WEBHOOK_SECRET not configured');
      return false;
    }

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(PAYMENT_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      new TextEncoder().encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Handle JazzCash payment
 */
async function handleJazzCashPayment(
  paymentData: Record<string, unknown>,
  supabase: ReturnType<typeof getServiceClient>
) {
  const transactionId = paymentData.pp_TransactionID as string;
  const amount = parseFloat(paymentData.pp_Amount as string) || 0;
  const status = paymentData.pp_ResponseCode as string;
  const customerId = paymentData.pp_CustomerID as string;

  // Find organization by merchant reference
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('merchant_reference', customerId)
    .single();

  if (!organization) {
    console.error('Organization not found for JazzCash payment:', customerId);
    return;
  }

  // Create payment record
  await supabase.from('payments').insert({
    organization_id: organization.id,
    provider: 'jazzcash',
    transaction_id: transactionId,
    amount,
    status: status === '0' ? 'completed' : 'failed',
    payment_data: paymentData,
    created_at: new Date().toISOString(),
  });

  // Create audit log
  await supabase.from('audit_logs').insert({
    organization_id: organization.id,
    action: 'payment_received',
    entity_type: 'payment',
    entity_id: transactionId,
    new_values: {
      amount,
      provider: 'jazzcash',
      status: status === '0' ? 'completed' : 'failed',
    },
  });
}

/**
 * Handle EasyPaisa payment
 */
async function handleEasyPaisaPayment(
  paymentData: Record<string, unknown>,
  supabase: ReturnType<typeof getServiceClient>
) {
  const transactionId = paymentData.transactionId as string;
  const amount = parseFloat(paymentData.amount as string) || 0;
  const status = paymentData.status as string;
  const customerId = paymentData.customerId as string;

  // Find organization by merchant reference
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('merchant_reference', customerId)
    .single();

  if (!organization) {
    console.error('Organization not found for EasyPaisa payment:', customerId);
    return;
  }

  // Create payment record
  await supabase.from('payments').insert({
    organization_id: organization.id,
    provider: 'easypaisa',
    transaction_id: transactionId,
    amount,
    status: status === 'success' ? 'completed' : 'failed',
    payment_data: paymentData,
    created_at: new Date().toISOString(),
  });

  // Create audit log
  await supabase.from('audit_logs').insert({
    organization_id: organization.id,
    action: 'payment_received',
    entity_type: 'payment',
    entity_id: transactionId,
    new_values: {
      amount,
      provider: 'easypaisa',
      status: status === 'success' ? 'completed' : 'failed',
    },
  });
}

/**
 * Handle Raast payment
 */
async function handleRaastPayment(
  paymentData: Record<string, unknown>,
  supabase: ReturnType<typeof getServiceClient>
) {
  const transactionId = paymentData.RefNo as string;
  const amount = parseFloat(paymentData.Amount as string) || 0;
  const status = paymentData.Status as string;
  const customerId = paymentData.PartAccNum as string;

  // Find organization by merchant reference
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('merchant_reference', customerId)
    .single();

  if (!organization) {
    console.error('Organization not found for Raast payment:', customerId);
    return;
  }

  // Create payment record
  await supabase.from('payments').insert({
    organization_id: organization.id,
    provider: 'raast',
    transaction_id: transactionId,
    amount,
    status: status === 'SUCCESS' ? 'completed' : 'failed',
    payment_data: paymentData,
    created_at: new Date().toISOString(),
  });

  // Create audit log
  await supabase.from('audit_logs').insert({
    organization_id: organization.id,
    action: 'payment_received',
    entity_type: 'payment',
    entity_id: transactionId,
    new_values: {
      amount,
      provider: 'raast',
      status: status === 'SUCCESS' ? 'completed' : 'failed',
    },
  });
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(
  payment: Record<string, unknown>,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId = payment.customer as string;
  const amount = (payment.amount_total as number) / 100; // Convert from cents
  const currency = payment.currency as string;

  // Find organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!organization) {
    console.error('Organization not found for payment:', customerId);
    return;
  }

  // Create audit log
  await supabase.from('audit_logs').insert({
    organization_id: organization.id,
    action: 'payment_received',
    entity_type: 'payment',
    entity_id: payment.id as string,
    new_values: {
      amount,
      currency,
      payment_method: 'stripe',
    },
  });
}

serve(async (req: Request) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    // Get webhook signature
    const signature = req.headers.get('x-webhook-signature');
    if (!signature) {
      return corsErrorResponse(new Error('Missing webhook signature'), 401, req);
    }

    // Get request body
    const payload = await req.text();

    // Verify signature
    const isValid = await verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return corsErrorResponse(new Error('Invalid webhook signature'), 401, req);
    }

    // Parse event
    const event: PaymentEvent = JSON.parse(payload);
    const supabase = getServiceClient();

    // Handle different payment providers
    switch (event.provider) {
      case 'jazzcash':
        await handleJazzCashPayment(event.data, supabase);
        break;

      case 'easypaisa':
        await handleEasyPaisaPayment(event.data, supabase);
        break;

      case 'raast':
        await handleRaastPayment(event.data, supabase);
        break;

      case 'bank':
        // Handle future bank integrations
        console.log('Bank payment received:', event.id);
        break;

      default:
        console.log('Unhandled payment provider:', event.provider);
    }

    return corsResponse(
      {
        success: true,
        message: 'Webhook processed successfully',
      },
      200,
      req
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    return corsErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500,
      req
    );
  }
});
