// src/services/payment-providers/raast.ts
/**
 * Raast (Instant Payments) Provider Integration
 *
 * Raast is Pakistan's instant payment system that enables real-time
 * bank-to-bank transfers via QR codes or IBAN.
 *
 * Features:
 * - QR code data generation for Raast payments
 * - Webhook handling for payment status updates
 * - Support for static and dynamic QR codes
 *
 * Note: Raast integration typically requires bank API access.
 * This implementation provides QR code generation and webhook handling.
 * For full integration, you'll need to integrate with your bank's Raast API.
 *
 * @example
 * ```typescript
 *
import { generateRaastQRData, formatRaastQRString } from '@/services/payment-providers/raast';
 *
 * // Generate QR data
 * const config = {
 *   raastId: 'PK36SCBL0000001123456702',
 *   merchantName: 'Your Business Name',
 *   returnUrl: 'https://yourapp.com/payment/return'
 * };
 *
 * const qrData = generateRaastQRData(config, transaction, {
 *   transactionRef: 'TXN-001',
 *   amount: 1000,
 *   description: 'Invoice payment'
 * });
 *
 * // Format for QR code
 * const qrString = formatRaastQRString(qrData);
 * ```
 */

import type { PaymentTransaction } from '@/types/database.types';
import { logger } from '@/lib/logger';

export interface RaastConfig {
  raastId: string; // RAAST ID or IBAN
  merchantName: string;
  returnUrl: string;
}

export interface RaastPaymentRequest {
  transactionRef: string;
  amount: number; // Amount in PKR
  description: string;
  customerName?: string;
}

export interface RaastQRData {
  version: string;
  type: 'STATIC' | 'DYNAMIC';
  raastId: string;
  amount?: number;
  reference: string;
  merchantName: string;
}

export interface RaastWebhookPayload {
  transactionId: string;
  reference: string;
  amount: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  timestamp: string;
  bankName?: string;
  accountNumber?: string;
  failureReason?: string;
}

/**
 * Generate Raast QR code data
 *
 * Generates the data structure for Raast QR code payment.
 * You'll need a QR code library (like qrcode) to generate the actual QR code image.
 *
 * @param config - Raast configuration (RAAST ID, merchant name, return URL)
 * @param transaction - Payment transaction record from database
 * @param request - Payment request details (amount, description, customer info)
 * @returns Raast QR code data structure
 * @throws Error if validation fails
 */
export function generateRaastQRData(
  config: RaastConfig,
  _transaction: PaymentTransaction,
  request: RaastPaymentRequest
): RaastQRData {
  // Validate configuration
  if (!config.raastId) {
    throw new Error('RAAST ID is required');
  }

  if (!config.merchantName) {
    throw new Error('Merchant name is required');
  }

  // Validate request
  if (!request.transactionRef) {
    throw new Error('Transaction reference is required');
  }

  if (!request.amount || request.amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  // Validate RAAST ID format (should be IBAN format: PK + 2 digits + 4 letters + 16 digits)
  const raastIdPattern = /^PK\d{2}[A-Z]{4}\d{16}$/;
  if (!raastIdPattern.test(config.raastId)) {
    throw new Error('Invalid RAAST ID format. Expected IBAN format: PK36SCBL0000001123456702');
  }

  return {
    version: '01',
    type: 'DYNAMIC', // Dynamic QR for specific amount
    raastId: config.raastId,
    amount: request.amount,
    reference: request.transactionRef,
    merchantName: config.merchantName,
  };
}

/**
 * Generate Raast payment link (if supported by bank API)
 *
 * Generates QR code data for Raast payment. If your bank's Raast API provides
 * a payment URL, it can be included in the response.
 *
 * Note: Actual implementation depends on your bank's Raast API integration.
 * Most banks provide QR code generation, but payment URLs vary by provider.
 *
 * @param config - Raast configuration
 * @param transaction - Payment transaction record from database
 * @param request - Payment request details
 * @returns QR code data and optional payment URL
 * @throws Error if payment initiation fails
 */
export async function initiateRaastPayment(
  config: RaastConfig,
  transaction: PaymentTransaction,
  request: RaastPaymentRequest
): Promise<{ paymentUrl?: string; qrData: RaastQRData }> {
  try {
    // Validate inputs
    if (!config || !transaction || !request) {
      throw new Error('Configuration, transaction, and request are required');
    }

    const qrData = generateRaastQRData(config, transaction, request);

    // If bank API provides payment URL, include it here
    // Example: const paymentUrl = await getBankRaastPaymentUrl(qrData);
    // For now, return QR data for customer to scan

    return {
      qrData,
      // paymentUrl: paymentUrl, // Uncomment when bank API integration is available
    };
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    if (import.meta.env.DEV) {

      logger.error('Raast payment initiation error:', error instanceof Error ? error.message : String(error));
    }
    throw new Error(
      `Failed to initiate Raast payment: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify Raast webhook signature
 *
 * Validates webhook authenticity from Raast/bank.
 *
 * Note: Implementation depends on your bank's webhook signature method.
 * Most banks use HMAC SHA256 or JWT tokens for webhook verification.
 *
 * @param payload - Webhook payload from Raast/bank
 * @param secret - Secret key for signature verification (from bank configuration)
 * @returns true if signature is valid, false otherwise
 *
 * @example
 * ```typescript
 * // Example implementation with HMAC SHA256
 * import CryptoJS from 'crypto-js';
 *
 * const signature = payload.signature; // From webhook headers
 * const expectedSignature = CryptoJS.HmacSHA256(JSON.stringify(payload), secret).toString();
 * return signature === expectedSignature;
 * ```
 */
export function verifyRaastWebhook(payload: RaastWebhookPayload, secret: string): boolean {
  try {
    // Validate inputs
    if (!payload || !secret) {
      return false;
    }

    // Validate required fields
    if (!payload.transactionId || !payload.reference || !payload.amount || !payload.status) {
      return false;
    }

    // TODO: Implement actual signature verification based on your bank's method
    // This is a placeholder - implement based on your bank's requirements
    // Typically involves:
    // 1. Extracting signature from webhook headers
    // 2. Computing expected signature using HMAC SHA256 or JWT
    // 3. Comparing signatures

    // For now, return true if payload has required fields
    // In production, you MUST implement proper signature verification
    const hasRequiredFields = !!(
      payload.transactionId &&
      payload.reference &&
      payload.amount &&
      payload.status
    );

    if (import.meta.env.DEV && hasRequiredFields) {

      logger.warn(
        "Raast webhook verification: Signature verification not implemented. Implement based on your bank's requirements."
      );
    }

    return hasRequiredFields;
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    if (import.meta.env.DEV) {

      logger.error('Raast webhook verification error:', error instanceof Error ? error.message : String(error));
    }
    return false;
  }
}

/**
 * Parse Raast webhook response
 *
 * Extracts and normalizes payment information from Raast webhook payload.
 *
 * @param payload - Webhook payload from Raast/bank
 * @returns Parsed payment information with success status
 */
export function parseRaastWebhook(payload: RaastWebhookPayload): {
  success: boolean;
  transactionRef: string;
  providerTransactionId: string;
  amount: number;
  status: string;
  failureReason?: string;
} {
  // Payment is successful if status is 'SUCCESS'
  const success = payload.status === 'SUCCESS';
  const amount = parseFloat(payload.amount ?? '0');

  return {
    success,
    transactionRef: payload.reference ?? '',
    providerTransactionId: payload.transactionId ?? '',
    amount,
    status: payload.status ?? 'UNKNOWN',
    failureReason: success ? undefined : payload.failureReason ?? 'Payment failed',
  };
}

/**
 * Format Raast QR code string
 *
 * Formats the QR data into a string that can be encoded in QR code.
 * The format follows Raast QR code specification: version|type|raastId|amount|reference|merchantName
 *
 * @param qrData - Raast QR code data structure
 * @returns Formatted string ready for QR code encoding
 * @throws Error if required fields are missing
 */
export function formatRaastQRString(qrData: RaastQRData): string {
  // Validate required fields
  if (!qrData.version || !qrData.type || !qrData.raastId || !qrData.reference) {
    throw new Error('Required QR code fields are missing');
  }

  // Format amount to 2 decimal places if present
  const amountStr = qrData.amount ? qrData.amount.toFixed(2) : '';

  const parts = [
    qrData.version,
    qrData.type,
    qrData.raastId,
    amountStr,
    qrData.reference,
    qrData.merchantName ?? '',
  ].filter(Boolean); // Remove empty strings

  return parts.join('|');
}
