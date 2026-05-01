/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/pakistani-payment-webhook/index.ts
/**
 * Pakistani Payment Providers Webhook Handler
 * 
 * Handles webhooks from JazzCash, EasyPaisa, and Raast payment providers
 * 
 * Endpoints:
 * - POST /pakistani-payment-webhook/jazzcash
 * - POST /pakistani-payment-webhook/easypaisa
 * - POST /pakistani-payment-webhook/raast
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCorsPreflight, corsResponse, corsErrorResponse } from '../_shared/cors.ts';
import { getServiceClient } from '../_shared/auth.ts';

// Import crypto for hash verification (Deno compatible)
const encoder = new TextEncoder();

/**
 * HMAC SHA256 implementation for Deno
 */
async function hmacSha256(key: string, message: string): Promise<string> {
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const provider = pathParts[pathParts.length - 1] as 'jazzcash' | 'easypaisa' | 'raast';

    if (!['jazzcash', 'easypaisa', 'raast'].includes(provider)) {
      return corsErrorResponse(
        new Error('Invalid payment provider'),
        400,
        req
      );
    }

    const supabase = getServiceClient();

    // Parse webhook payload
    let payload: Record<string, unknown>;
    
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        payload = await req.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData();
        payload = Object.fromEntries(formData);
      } else {
        payload = await req.json().catch(() => ({}));
      }
    } else {
      return corsErrorResponse(
        new Error('Method not allowed'),
        405,
        req
      );
    }

    // Log webhook
    const { data: webhookLog, error: logError } = await supabase
      .from('payment_webhooks')
      .insert({
        provider,
        event_type: 'payment_response',
        payload,
        headers: Object.fromEntries(req.headers),
        processed: false,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    // Process webhook based on provider
    let transactionRef: string;
    let success: boolean;
    let amount: number;
    let providerTransactionId: string;
    let failureReason: string | undefined;

    switch (provider) {
      case 'jazzcash': {
        const jazzcashPayload = payload as {
          pp_TxnRefNo?: string;
          pp_ResponseCode?: string;
          pp_ResponseMessage?: string;
          pp_Amount?: string;
          pp_MerchantID?: string;
          pp_SecureHash?: string;
        };

        transactionRef = jazzcashPayload.pp_TxnRefNo || '';
        
        if (!transactionRef) {
          throw new Error('Missing transaction reference');
        }

        // Get payment integration to verify hash
        const { data: integration } = await supabase
          .from('payment_integrations')
          .select('*')
          .eq('provider', 'jazzcash')
          .eq('merchant_id', jazzcashPayload.pp_MerchantID || '')
          .eq('is_active', true)
          .single();

        if (integration?.integrity_salt_encrypted) {
          // Verify hash (simplified - in production, decrypt salt first)
          // Note: In production, decrypt integrity_salt_encrypted using pgcrypto
          const { pp_SecureHash, ...payloadData } = jazzcashPayload;
          const sortedEntries = Object.entries(payloadData)
            .filter(([key]) => key !== 'pp_SecureHash')
            .sort(([a], [b]) => a.localeCompare(b));
          
          const hashString = sortedEntries.map(([, value]) => String(value)).join('&');
          const expectedHash = await hmacSha256(
            integration.integrity_salt_encrypted, // Should be decrypted
            hashString
          );

          if (expectedHash !== pp_SecureHash) {
            throw new Error('Invalid secure hash');
          }
        }

        success = jazzcashPayload.pp_ResponseCode === '000' || jazzcashPayload.pp_ResponseCode === 'T00';
        amount = parseFloat(jazzcashPayload.pp_Amount || '0') / 100; // Convert from paisas
        providerTransactionId = transactionRef;
        failureReason = success ? undefined : jazzcashPayload.pp_ResponseMessage;
        break;
      }

      case 'easypaisa': {
        const easypaisaPayload = payload as {
          orderRefNum?: string;
          txStatus?: string;
          orderStatus?: string;
          txAmount?: string;
          storeId?: string;
          merchantReqHash?: string;
        };

        transactionRef = easypaisaPayload.orderRefNum || '';
        
        if (!transactionRef) {
          throw new Error('Missing transaction reference');
        }

        // Get payment integration to verify hash
        const { data: integration } = await supabase
          .from('payment_integrations')
          .select('*')
          .eq('provider', 'easypaisa')
          .eq('store_id', easypaisaPayload.storeId || '')
          .eq('is_active', true)
          .single();

        if (integration?.hash_key_encrypted) {
          // Verify hash (simplified - in production, decrypt hash_key first)
          const hashString = `${easypaisaPayload.storeId}${easypaisaPayload.txAmount}${transactionRef}`;
          const expectedHash = await hmacSha256(
            integration.hash_key_encrypted, // Should be decrypted
            hashString
          );

          if (expectedHash !== easypaisaPayload.merchantReqHash) {
            throw new Error('Invalid hash');
          }
        }

        success = easypaisaPayload.orderStatus === 'PAID' || easypaisaPayload.txStatus === 'SUCCESS';
        amount = parseFloat(easypaisaPayload.txAmount || '0');
        providerTransactionId = easypaisaPayload.orderRefNum || transactionRef;
        failureReason = success ? undefined : easypaisaPayload.orderStatus;
        break;
      }

      case 'raast': {
        const raastPayload = payload as {
          transactionId?: string;
          reference?: string;
          amount?: string;
          status?: string;
          failureReason?: string;
        };

        transactionRef = raastPayload.reference || '';
        
        if (!transactionRef) {
          throw new Error('Missing transaction reference');
        }

        success = raastPayload.status === 'SUCCESS';
        amount = parseFloat(raastPayload.amount || '0');
        providerTransactionId = raastPayload.transactionId || transactionRef;
        failureReason = success ? undefined : raastPayload.failureReason;
        break;
      }
    }

    // Find payment transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*, invoice:invoices(*)')
      .eq('transaction_reference', transactionRef)
      .single();

    if (transactionError || !transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status
    const newStatus = success ? 'completed' : 'failed';
    
    const { error: updateError } = await supabase.rpc('update_payment_transaction_status', {
      p_transaction_id: transaction.id,
      p_status: newStatus,
      p_provider_transaction_id: providerTransactionId,
      p_failure_reason: failureReason,
      p_failure_code: undefined,
    });

    if (updateError) {
      throw new Error('Failed to update transaction status');
    }

    // If payment successful, update invoice
    if (success && transaction.invoice_id) {
      const invoice = transaction.invoice as { amount_paid: number; amount_due: number; total_amount: number; status: string };
      
      const newAmountPaid = invoice.amount_paid + amount;
      const newAmountDue = invoice.amount_due - amount;
      let newInvoiceStatus = invoice.status;

      if (newAmountDue <= 0) {
        newInvoiceStatus = 'paid';
      } else if (newAmountPaid > 0 && invoice.status === 'draft') {
        newInvoiceStatus = 'sent';
      } else if (newAmountPaid > 0) {
        newInvoiceStatus = 'partially_paid';
      }

      await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          amount_due: newAmountDue,
          status: newInvoiceStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.invoice_id);

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          organization_id: transaction.organization_id,
          type: 'income',
          amount,
          date: new Date().toISOString().split('T')[0],
          description: `Payment for invoice ${(invoice as any).invoice_number || ''}`,
          reference_type: 'invoice',
          reference_id: transaction.invoice_id,
          payment_method: provider,
          created_by: (transaction as any).created_by || null,
        });
    }

    // Mark webhook as processed
    if (webhookLog) {
      await supabase
        .from('payment_webhooks')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          payment_transaction_id: transaction.id,
        })
        .eq('id', webhookLog.id);
    }

    return corsResponse(
      {
        success: true,
        message: 'Webhook processed successfully',
        transaction_ref: transactionRef,
        status: newStatus,
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

