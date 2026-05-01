// src/services/payment-providers/jazzcash.ts
/**
 * JazzCash Payment Provider Integration
 * 
 * Handles JazzCash payment initiation, webhook verification, and payment status updates.
 * 
 * Features:
 * - Payment initiation with secure hash generation
 * - Webhook signature verification
 * - Payment form auto-submission
 * - Support for test and production environments
 * 
 * Documentation: https://sandbox.jazzcash.com.pk/docs
 * 
 * @example
 * ```typescript
 *
import { initiateJazzCashPayment, verifyJazzCashWebhook } from '@/services/payment-providers/jazzcash';
 * 
 * // Initiate payment
 * const config = {
 *   merchantId: 'your-merchant-id',
 *   password: 'your-integrity-salt',
 *   returnUrl: 'https://yourapp.com/payment/return',
 *   testMode: true
 * };
 * 
 * const { paymentUrl, formData } = await initiateJazzCashPayment(
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
 * const isValid = verifyJazzCashWebhook(webhookPayload, config.password);
 * ```
 */

import CryptoJS from 'crypto-js';
import type { PaymentTransaction } from '@/types/database.types';
import { logger } from '@/lib/logger';

export interface JazzCashConfig {
  merchantId: string;
  password: string; // Integrity Salt
  returnUrl: string;
  testMode: boolean;
}

export interface JazzCashPaymentRequest {
  transactionRef: string;
  amount: number; // Amount in PKR
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  expiryHours?: number; // Default 1 hour
}

export interface JazzCashPaymentResponse {
  paymentUrl: string;
  formData: Record<string, string>;
}

export interface JazzCashWebhookPayload {
  pp_Version: string;
  pp_TxnType: string;
  pp_Language: string;
  pp_MerchantID: string;
  pp_SubMerchantID: string;
  pp_Password: string;
  pp_TxnRefNo: string;
  pp_Amount: string;
  pp_TxnCurrency: string;
  pp_TxnDateTime: string;
  pp_BillReference: string;
  pp_Description: string;
  pp_TxnExpiryDateTime: string;
  pp_ReturnURL: string;
  pp_SecureHash: string;
  pp_ResponseCode: string;
  pp_ResponseMessage: string;
  pp_ResponseCodeDesc?: string;
  ppmpf_1?: string;
  ppmpf_2?: string;
  ppmpf_3?: string;
  ppmpf_4?: string;
  ppmpf_5?: string;
}

/**
 * Generate JazzCash payment URL and form data
 * 
 * @param config - JazzCash configuration (merchant ID, password, return URL, test mode)
 * @param transaction - Payment transaction record from database
 * @param request - Payment request details (amount, description, customer info)
 * @returns Payment URL and form data for submission
 * @throws Error if payment initiation fails
 */
export async function initiateJazzCashPayment(
  config: JazzCashConfig,
  transaction: PaymentTransaction,
  request: JazzCashPaymentRequest
): Promise<JazzCashPaymentResponse> {
  try {
    // Validate configuration
    if (!config.merchantId || !config.password) {
      throw new Error('JazzCash merchant ID and password are required');
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
    // Generate timestamp in format: YYYYMMDDHHmmss
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    // Calculate expiry time (default 1 hour)
    const expiryHours = request.expiryHours ?? 1;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);
    const expiryTimestamp = expiryDate
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    // Convert amount to paisas (multiply by 100)
    const amountInPaisas = Math.round(request.amount * 100);

    // Build request data
    const data: Record<string, string> = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: config.merchantId,
      pp_SubMerchantID: '',
      pp_Password: config.password,
      pp_TxnRefNo: request.transactionRef,
      pp_Amount: amountInPaisas.toString(),
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: timestamp,
      pp_BillReference: transaction.invoice_id || request.transactionRef,
      pp_Description: request.description.substring(0, 127), // Max 127 chars
      pp_TxnExpiryDateTime: expiryTimestamp,
      pp_ReturnURL: config.returnUrl,
      pp_SecureHash: '', // Will be calculated
      ppmpf_1: request.customerEmail ?? '',
      ppmpf_2: request.customerPhone ?? '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: '',
    };

    // Generate secure hash
    // Sort all fields except pp_SecureHash, concatenate values with &
    const sortedEntries = Object.entries(data)
      .filter(([key]) => key !== 'pp_SecureHash')
      .sort(([a], [b]) => a.localeCompare(b));

    const hashString = sortedEntries.map(([, value]) => value).join('&');

    // Calculate HMAC SHA256 hash
    const secureHash = CryptoJS.HmacSHA256(hashString, config.password).toString();

    data.pp_SecureHash = secureHash;

    // Build payment URL
    const baseUrl = config.testMode
      ? 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform'
      : 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform';

    return {
      paymentUrl: baseUrl,
      formData: data,
    };
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    if (import.meta.env.DEV) {

      logger.error('JazzCash payment initiation error:', error instanceof Error ? error.message : String(error));
    }
    throw new Error(
      `Failed to initiate JazzCash payment: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify JazzCash webhook signature
 * 
 * Validates the HMAC SHA256 signature sent by JazzCash to ensure webhook authenticity.
 * 
 * @param payload - Webhook payload from JazzCash
 * @param password - Integrity salt (password) from JazzCash configuration
 * @returns true if signature is valid, false otherwise
 */
export function verifyJazzCashWebhook(
  payload: JazzCashWebhookPayload,
  password: string
): boolean {
  try {
    // Validate inputs
    if (!payload || !password) {
      return false;
    }

    if (!payload.pp_SecureHash) {
      return false;
    }

    const { pp_SecureHash, ...payloadData } = payload;

    // Sort all fields except pp_SecureHash
    const sortedEntries = Object.entries(payloadData)
      .filter(([key]) => key !== 'pp_SecureHash')
      .sort(([a], [b]) => a.localeCompare(b));

    const hashString = sortedEntries.map(([, value]) => String(value)).join('&');

    // Calculate expected hash
    const expectedHash = CryptoJS.HmacSHA256(hashString, password).toString();

    const isValid = expectedHash === pp_SecureHash;

    // Log verification result in development
    if (import.meta.env.DEV && !isValid) {

      logger.warn('JazzCash webhook signature verification failed');
    }

    return isValid;
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    if (import.meta.env.DEV) {

      logger.error('JazzCash webhook verification error:', error instanceof Error ? error.message : String(error));
    }
    return false;
  }
}

/**
 * Parse JazzCash webhook response
 * 
 * Extracts and normalizes payment information from JazzCash webhook payload.
 * 
 * @param payload - Webhook payload from JazzCash
 * @returns Parsed payment information with success status
 */
export function parseJazzCashWebhook(
  payload: JazzCashWebhookPayload
): {
  success: boolean;
  transactionRef: string;
  providerTransactionId: string;
  amount: number;
  responseCode: string;
  responseMessage: string;
  failureReason?: string;
} {
  // Response codes: '000' = Success, 'T00' = Test Success, others = Failed
  const success = payload.pp_ResponseCode === '000' || payload.pp_ResponseCode === 'T00';
  
  // Convert amount from paisas to PKR (divide by 100)
  const amountInPaisas = parseFloat(payload.pp_Amount ?? '0');
  const amount = amountInPaisas / 100;

  return {
    success,
    transactionRef: payload.pp_TxnRefNo ?? '',
    providerTransactionId: payload.pp_TxnRefNo ?? '',
    amount,
    responseCode: payload.pp_ResponseCode ?? '',
    responseMessage: payload.pp_ResponseMessage ?? '',
    failureReason: success ? undefined : payload.pp_ResponseMessage ?? 'Payment failed',
  };
}

/**
 * Create auto-submit form for JazzCash payment
 * 
 * Creates a hidden HTML form that can be auto-submitted to redirect to JazzCash payment page.
 * This is used in the browser to initiate payment redirect.
 * 
 * @param paymentUrl - JazzCash payment gateway URL
 * @param formData - Form data to submit (from initiateJazzCashPayment)
 * @returns HTML form element ready for submission
 * @throws Error if called outside browser environment
 */
export function createJazzCashPaymentForm(
  paymentUrl: string,
  formData: Record<string, string>
): HTMLFormElement {
  if (typeof document === 'undefined') {
    throw new Error('createJazzCashPaymentForm can only be called in browser environment');
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
 * Submit JazzCash payment form
 * 
 * Creates and auto-submits a payment form to redirect user to JazzCash payment page.
 * 
 * @param paymentUrl - JazzCash payment gateway URL
 * @param formData - Form data to submit (from initiateJazzCashPayment)
 * @throws Error if called outside browser environment or if submission fails
 */
export function submitJazzCashPayment(
  paymentUrl: string,
  formData: Record<string, string>
): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('submitJazzCashPayment can only be called in browser environment');
  }

  try {
    const form = createJazzCashPaymentForm(paymentUrl, formData);
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
      `Failed to submit JazzCash payment form: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

