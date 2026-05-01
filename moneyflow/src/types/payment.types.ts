// src/types/payment.types.ts
/**
 * Payment Type Definitions
 *
 * Types for payment integrations, transactions, and statistics.
 *
 * @module Types/Payment
 */

import type { PaymentProvider, PaymentTransactionStatus } from './database.types';

// ============================================
// PAYMENT INTEGRATION TYPES
// ============================================

/**
 * Payment integration configuration
 */
export interface PaymentIntegrationConfig {
  provider: PaymentProvider;
  account_name: string;
  merchant_id?: string;
  store_id?: string;
  raast_id?: string;
  iban?: string;
  api_key?: string;
  api_secret?: string;
  integrity_salt?: string;
  hash_key?: string;
  is_active?: boolean;
  is_default?: boolean;
  test_mode?: boolean;
  transaction_fee_percentage?: number;
  transaction_fee_fixed?: number;
  settings?: Record<string, unknown>;
}

// ============================================
// PAYMENT REQUEST TYPES
// ============================================

/**
 * Payment initiation request
 */
export interface PaymentInitiationRequest {
  invoice_id: string;
  payment_method: PaymentProvider;
  amount?: number;
  customer_email?: string;
  customer_phone?: string;
  return_url?: string;
  cancel_url?: string;
}

// ============================================
// PAYMENT FILTER TYPES
// ============================================

/**
 * Payment transaction filter options
 */
export interface PaymentTransactionFilters {
  status?: PaymentTransactionStatus[];
  payment_method?: PaymentProvider[];
  invoice_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

// ============================================
// PAYMENT STATISTICS TYPES
// ============================================

/**
 * Payment statistics and analytics
 */
export interface PaymentStatistics {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_amount: number;
  total_fees: number;
  net_amount: number;
  success_rate: number;
  by_provider: Record<PaymentProvider, {
    count: number;
    amount: number;
    success_rate: number;
  }>;
}

