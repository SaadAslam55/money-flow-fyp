// src/services/payment-providers/easypaisa.ts
/**
 * EasyPaisa Payment Provider Integration
 *
 * Handles EasyPaisa payment initiation, webhook verification, and payment status updates.
 *
 * Features:
 * - Payment initiation with secure hash generation
 * - Webhook signature verification
 * - Payment form auto-submission
 * - Support for test and production environments
 *
 * Documentation: https://easypaisa.com.pk/developers
 *
 * @example
 * ```typescript
 *
import { initiateEasyPaisaPayment, verifyEasyPaisaWebhook } from '@/services/payment-providers/easypaisa';
 *
 * // Initiate payment
 * const config = {
 *   storeId: 'your-store-id',
 *   hashKey: 'your-hash-key',
 *   returnUrl: 'https://yourapp.com/payment/return',
 *   testMode: true
 * };
 *
 * const { paymentUrl, formData } = await initiateEasyPaisaPayment(
 *   config,
 *   transaction,
 *   {
 *     transactionRef: 'TXN-001',
 *     amount: 1000,
 *     description: 'Invoice payment'
 *   }
 * );
 *
 * // Verify webhook
 * const isValid = verifyEasyPaisaWebhook(webhookPayload, config.hashKey);
 * ```
 */

import CryptoJS from 'crypto-js';
import type { PaymentTransaction } from '@/types/database.types';
import { logger } from '@/lib/logger';

export interface EasyPaisaConfig {
  storeId: string;
  hashKey: string;
  returnUrl: string;
  testMode: boolean;
}

export interface EasyPaisaPaymentRequest {
  transactionRef: string;
  amount: number; // Amount in PKR
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  expiryDays?: number; // Default 1 day
}

export interface EasyPaisaPaymentResponse {
  paymentUrl: string;
  formData: Record<string, string>;
}

export interface EasyPaisaWebhookPayload {
  orderRefNum: string;
  storeId: string;
  paymentMethod: string;
  bankTxId: string;
  txStatus: string;
  txDateTime: string;
  txAmount: string;
  orderStatus: string;
  merchantHashedReq: string;
  merchantReqHash: string;
}

/**
 * Generate EasyPaisa payment URL and form data
 *
 * @param config - EasyPaisa configuration (store ID, hash key, return URL, test mode)
 * @param transaction - Payment transaction record from database
 * @param request - Payment request details (amount, description, customer info)
 * @returns Payment URL and form data for submission
 * @throws Error if payment initiation fails
 */
export async function initiateEasyPaisaPayment(
  config: EasyPaisaConfig,
  _transaction: PaymentTransaction,
  request: EasyPaisaPaymentRequest
): Promise<EasyPaisaPaymentResponse> {
  try {
    // Validate configuration
    if (!config.storeId || !config.hashKey) {
      throw new Error('EasyPaisa store ID and hash key are required');
    }

    if (!config.returnUrl) {
      throw new Error('Return URL is required');
    }

    // Validate request
    if (!request.transactionRef) {
      throw new Error('Transaction reference is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (!request.description || request.description.trim().length === 0) {
      throw new Error('Payment description is required');
    }

    // Validate amount (max 10,000,000 PKR)
    if (request.amount > 10000000) {
      throw new Error('Payment amount exceeds maximum limit (10,000,000 PKR)');
    }
    // Calculate expiry date (default 1 day)
    const expiryDays = request.expiryDays ?? 1;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    // Format amount to 2 decimal places
    const amountStr = request.amount.toFixed(2);

    // Build request data
    const data: Record<string, string> = {
      storeId: config.storeId,
      amount: amountStr,
      postBackURL: config.returnUrl,
      orderRefNum: request.transactionRef,
      expiryDate: expiryDate.toISOString().split('T')[0] || '', // YYYY-MM-DD format
      merchantHashedReq: '', // Will be calculated
      autoRedirect: '1',
      paymentMethod: 'MA_PAYMENT_METHOD', // Mobile account payment
      emailAddress: request.customerEmail ?? '',
      mobileNumber: request.customerPhone ?? '',
    };

    // Generate hash
    // Hash string format: storeId + amount + orderRefNum
    const hashString = `${config.storeId}${amountStr}${request.transactionRef}`;
    const merchantHashedReq = CryptoJS.HmacSHA256(hashString, config.hashKey).toString();

    data.merchantHashedReq = merchantHashedReq;

    // Build payment URL
    const baseUrl = config.testMode
      ? 'https://easypay-sandbox.easypaisa.com.pk/easypay/Index.jsf'
      : 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';

    return {
      paymentUrl: baseUrl,
      formData: data,
    };
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    if (import.meta.env.DEV) {

      logger.error('EasyPaisa payment initiation error:', error instanceof Error ? error.message : String(error));
    }
    throw new Error(
      `Failed to initiate EasyPaisa payment: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify EasyPaisa webhook signature
 *
 * Validates the HMAC SHA256 signature sent by EasyPaisa to ensure webhook authenticity.
 *
 * @param payload - Webhook payload from EasyPaisa
 * @param hashKey - Hash key from EasyPaisa configuration
 * @returns true if signature is valid, false otherwise
 */
export function verifyEasyPaisaWebhook(payload: EasyPaisaWebhookPayload, hashKey: string): boolean {
  try {
    // Validate inputs
    if (!payload || !hashKey) {
      return false;
    }

    if (!payload.storeId || !payload.txAmount || !payload.orderRefNum) {
      return false;
    }

    // Verify merchant request hash
    // Hash format: storeId + txAmount + orderRefNum
    const hashString = `${payload.storeId}${payload.txAmount}${payload.orderRefNum}`;
    const expectedHash = CryptoJS.HmacSHA256(hashString, hashKey).toString();

    // Check against both possible hash field names
    const isValid =
      expectedHash === payload.merchantReqHash || expectedHash === payload.merchantHashedReq;

    // Log verification result in development
    if (import.meta.env.DEV && !isValid) {

      logger.warn('EasyPaisa webhook signature verification failed');
    }

    return isValid;
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    if (import.meta.env.DEV) {

      logger.error('EasyPaisa webhook verification error:', error instanceof Error ? error.message : String(error));
    }
    return false;
  }
}

/**
 * Parse EasyPaisa webhook response
 *
 * Extracts and normalizes payment information from EasyPaisa webhook payload.
 *
 * @param payload - Webhook payload from EasyPaisa
 * @returns Parsed payment information with success status
 */
export function parseEasyPaisaWebhook(payload: EasyPaisaWebhookPayload): {
  success: boolean;
  transactionRef: string;
  providerTransactionId: string;
  amount: number;
  orderStatus: string;
  txStatus: string;
  failureReason?: string;
} {
  // Payment is successful if order status is 'PAID' or transaction status is 'SUCCESS'
  const success = payload.orderStatus === 'PAID' || payload.txStatus === 'SUCCESS';
  const amount = parseFloat(payload.txAmount ?? '0');

  return {
    success,
    transactionRef: payload.orderRefNum ?? '',
    providerTransactionId: (payload.bankTxId || payload.orderRefNum) ?? '',
    amount,
    orderStatus: payload.orderStatus ?? '',
    txStatus: payload.txStatus ?? '',
    failureReason: success ? undefined : payload.orderStatus ?? 'Payment failed',
  };
}

/**
 * Create auto-submit form for EasyPaisa payment
 *
 * Creates a hidden HTML form that can be auto-submitted to redirect to EasyPaisa payment page.
 *
 * @param paymentUrl - EasyPaisa payment gateway URL
 * @param formData - Form data to submit (from initiateEasyPaisaPayment)
 * @returns HTML form element ready for submission
 * @throws Error if called outside browser environment
 */
export function createEasyPaisaPaymentForm(
  paymentUrl: string,
  formData: Record<string, string>
): HTMLFormElement {
  if (typeof document === 'undefined') {
    throw new Error('createEasyPaisaPaymentForm can only be called in browser environment');
  }

  if (!paymentUrl || !formData) {
    throw new Error('Payment URL and form data are required');
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;
  form.style.display = 'none';
  form.setAttribute('target', '_self');

  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  return form;
}

/**
 * Submit EasyPaisa payment form
 *
 * Creates and auto-submits a payment form to redirect user to EasyPaisa payment page.
 *
 * @param paymentUrl - EasyPaisa payment gateway URL
 * @param formData - Form data to submit (from initiateEasyPaisaPayment)
 * @throws Error if called outside browser environment or if submission fails
 */
export function submitEasyPaisaPayment(paymentUrl: string, formData: Record<string, string>): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('submitEasyPaisaPayment can only be called in browser environment');
  }

  try {
    const form = createEasyPaisaPaymentForm(paymentUrl, formData);
    document.body.appendChild(form);
    form.submit();

    // Clean up form after submission (with delay to ensure submission)
    setTimeout(() => {
      if (form.parentNode) {
        form.parentNode.removeChild(form);
      }
    }, 1000);
  } catch (error) {
    throw new Error(
      `Failed to submit EasyPaisa payment form: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
