// src/services/api/paymentApi.ts
/**
 * Payment API Service
 *
 * This service handles payment initiation, status updates, and integration management
 * for Pakistani payment providers (JazzCash, EasyPaisa, Raast).
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type {
  PaymentIntegration,
  PaymentTransaction,
  PaymentProvider,
  Invoice,
  Customer,
  SuperAdminPaymentAccount,
} from '@/types/database.types';
import * as jazzcash from '@/services/payment-providers/jazzcash';
import * as easypaisa from '@/services/payment-providers/easypaisa';
import * as raast from '@/services/payment-providers/raast';

// ============================================
// TYPES
// ============================================

export interface CreatePaymentRequest {
  invoice_id: string;
  payment_method: PaymentProvider;
  amount?: number; // If not provided, uses invoice total_amount
  customer_email?: string;
  customer_phone?: string;
  return_url?: string;
  cancel_url?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  paymentUrl?: string;
  qrData?: raast.RaastQRData;
  transaction: PaymentTransaction;
  error?: string;
}

export interface PaymentIntegrationConfig {
  provider: PaymentProvider;
  account_name: string;
  merchant_id?: string;
  store_id?: string;
  raast_id?: string;
  iban?: string;
  api_key?: string;
  api_secret?: string;
  integrity_salt?: string; // For JazzCash
  hash_key?: string; // For EasyPaisa
  is_active?: boolean;
  is_default?: boolean;
  test_mode?: boolean;
  transaction_fee_percentage?: number;
  transaction_fee_fixed?: number;
  settings?: Record<string, unknown>;
}

// ============================================
// PAYMENT INTEGRATION MANAGEMENT
// ============================================

/**
 * Get payment integrations for an organization
 */
export async function getPaymentIntegrations(
  organizationId: string
): Promise<{ data: PaymentIntegration[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('payment_integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as PaymentIntegration[], error: null };
  } catch (error) {
    logger.error('Error fetching payment integrations:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get active payment integration for a provider
 */
export async function getActivePaymentIntegration(
  organizationId: string,
  provider: PaymentProvider
): Promise<{ data: PaymentIntegration | null; error: Error | null }> {
  try {
    // First, try organization's own integration
    let { data, error } = await supabase
      .from('payment_integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('provider', provider)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    // If not found, try super admin pool
    if (!data) {
      const { data: superAdminAccount, error: superAdminError } = await supabase
        .from('super_admin_payment_accounts')
        .select('*')
        .eq('provider', provider)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (superAdminError) throw superAdminError;

      if (superAdminAccount) {
        const typedAccount = superAdminAccount as SuperAdminPaymentAccount;
        // Check limits
        if (typedAccount.daily_limit && typedAccount.daily_usage >= typedAccount.daily_limit) {
          throw new Error('Daily limit reached for this payment method');
        }

        if (
          typedAccount.monthly_limit &&
          typedAccount.monthly_usage >= typedAccount.monthly_limit
        ) {
          throw new Error('Monthly limit reached for this payment method');
        }

        // Convert super admin account to integration format
        const convertedData: PaymentIntegration = {
          id: typedAccount.id,
          organization_id: organizationId, // Use requesting org ID
          provider: typedAccount.provider,
          account_name: typedAccount.display_name,
          merchant_id: typedAccount.merchant_id || null,
          store_id: typedAccount.store_id || null,
          raast_id: typedAccount.raast_id || null,
          iban: typedAccount.iban || null,
          api_key_encrypted: typedAccount.api_key_encrypted || null,
          api_secret_encrypted: typedAccount.api_secret_encrypted || null,
          integrity_salt_encrypted: typedAccount.integrity_salt_encrypted || null,
          hash_key_encrypted: typedAccount.hash_key_encrypted || null,
          is_active: true,
          is_default: false,
          currency: 'PKR',
          test_mode: typedAccount.test_mode,
          transaction_fee_percentage: 0,
          transaction_fee_fixed: 0,
          webhook_url: null,
          webhook_secret_encrypted: null,
          settings: typedAccount.settings,
          created_at: typedAccount.created_at,
          updated_at: typedAccount.updated_at,
        };
        data = convertedData;
      }
    }

    if (!data) {
      throw new Error(`No active ${provider} integration found`);
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Error fetching active payment integration:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Create payment integration
 *
 * Note: Credentials should be encrypted on the backend before storing
 */
export async function createPaymentIntegration(
  organizationId: string,
  config: PaymentIntegrationConfig
): Promise<{ data: PaymentIntegration | null; error: Error | null }> {
  try {
    // Note: In production, encrypt credentials using edge function
    // For now, we'll store them (they should be encrypted by RLS or edge function)

    const { data, error } = await supabase
      .from('payment_integrations')
      .insert({
        organization_id: organizationId,
        provider: config.provider,
        account_name: config.account_name,
        merchant_id: config.merchant_id || null,
        store_id: config.store_id || null,
        raast_id: config.raast_id || null,
        iban: config.iban || null,
        // Note: These should be encrypted before insertion
        // For now, storing as-is (backend should handle encryption)
        is_active: config.is_active ?? false,
        is_default: config.is_default ?? false,
        test_mode: config.test_mode ?? true,
        transaction_fee_percentage: config.transaction_fee_percentage ?? 0,
        transaction_fee_fixed: config.transaction_fee_fixed ?? 0,
        settings: config.settings ?? {},
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as PaymentIntegration, error: null };
  } catch (error) {
    logger.error('Error creating payment integration:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Update payment integration
 */
export async function updatePaymentIntegration(
  integrationId: string,
  updates: Partial<PaymentIntegrationConfig>
): Promise<{ data: PaymentIntegration | null; error: Error | null }> {
  try {
    const updateData: Record<string, unknown> = {};

    if (updates.account_name) updateData.account_name = updates.account_name;
    if (updates.merchant_id !== undefined) updateData.merchant_id = updates.merchant_id;
    if (updates.store_id !== undefined) updateData.store_id = updates.store_id;
    if (updates.raast_id !== undefined) updateData.raast_id = updates.raast_id;
    if (updates.iban !== undefined) updateData.iban = updates.iban;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    if (updates.is_default !== undefined) updateData.is_default = updates.is_default;
    if (updates.test_mode !== undefined) updateData.test_mode = updates.test_mode;
    if (updates.transaction_fee_percentage !== undefined)
      updateData.transaction_fee_percentage = updates.transaction_fee_percentage;
    if (updates.transaction_fee_fixed !== undefined)
      updateData.transaction_fee_fixed = updates.transaction_fee_fixed;
    if (updates.settings) updateData.settings = updates.settings;

    const { data, error } = await supabase
      .from('payment_integrations')
      .update(updateData)
      .eq('id', integrationId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as PaymentIntegration, error: null };
  } catch (error) {
    logger.error('Error updating payment integration:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Delete payment integration
 */
export async function deletePaymentIntegration(
  integrationId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('payment_integrations').delete().eq('id', integrationId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    logger.error('Error deleting payment integration:', error instanceof Error ? error.message : String(error));
    return { error: error as Error };
  }
}

// ============================================
// PAYMENT INITIATION
// ============================================

/**
 * Generate unique transaction reference
 */
function generateTransactionReference(): string {
  const dateStr = new Date().toISOString().split('T')[0]?.replace(/-/g, '') || '';
  const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `PAY-${dateStr}-${randomStr}`;
}

/**
 * Calculate transaction fee
 */
function calculateTransactionFee(amount: number, feePercentage: number, feeFixed: number): number {
  const percentageFee = (amount * feePercentage) / 100;
  return percentageFee + feeFixed;
}

/**
 * Initiate payment
 */
export async function initiatePayment(
  organizationId: string,
  request: CreatePaymentRequest
): Promise<PaymentInitiationResponse> {
  try {
    // 1. Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, customer:customers(*)')
      .eq('id', request.invoice_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    const invoiceData = invoice as Invoice & { customer?: Customer };

    // 2. Determine payment amount
    const amount = request.amount || invoiceData.amount_due;
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // 3. Get active payment integration
    const { data: integration, error: integrationError } = await getActivePaymentIntegration(
      organizationId,
      request.payment_method
    );

    if (integrationError || !integration) {
      throw new Error(`No active ${request.payment_method} integration found`);
    }

    // 4. Calculate fees
    const feeAmount = calculateTransactionFee(
      amount,
      integration.transaction_fee_percentage,
      integration.transaction_fee_fixed
    );

    // 5. Generate transaction reference
    const transactionRef = generateTransactionReference();

    // 6. Create payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        organization_id: organizationId,
        payment_integration_id: integration.id,
        invoice_id: request.invoice_id,
        customer_id: invoiceData.customer_id,
        transaction_reference: transactionRef,
        amount,
        currency: 'PKR',
        status: 'pending',
        payment_method: request.payment_method,
        fee_amount: feeAmount,
        net_amount: amount - feeAmount,
        return_url: request.return_url,
        cancel_url: request.cancel_url,
        metadata: {},
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      throw new Error('Failed to create payment transaction');
    }

    const transactionData = transaction as PaymentTransaction;

    // 7. Initiate payment with provider
    let paymentUrl: string | undefined;
    let qrData: raast.RaastQRData | undefined;

    // Note: In production, decrypt credentials using edge function
    // For now, we'll assume they're available (they should be decrypted server-side)

    switch (request.payment_method) {
      case 'jazzcash': {
        if (!integration.merchant_id || !integration.integrity_salt_encrypted) {
          throw new Error('JazzCash credentials not configured');
        }

        const config: jazzcash.JazzCashConfig = {
          merchantId: integration.merchant_id,
          password: integration.integrity_salt_encrypted, // Should be decrypted
          returnUrl: transactionData.return_url ?? '',
          testMode: integration.test_mode,
        };

        const paymentRequest: jazzcash.JazzCashPaymentRequest = {
          transactionRef,
          amount,
          description: `Payment for Invoice ${invoiceData.invoice_number}`,
          customerEmail: transactionData.customer_email || undefined,
          customerPhone: transactionData.customer_phone || undefined,
        };

        const result = await jazzcash.initiateJazzCashPayment(
          config,
          transactionData,
          paymentRequest
        );

        paymentUrl = result.paymentUrl;
        break;
      }

      case 'easypaisa': {
        if (!integration.store_id || !integration.hash_key_encrypted) {
          throw new Error('EasyPaisa credentials not configured');
        }

        const config: easypaisa.EasyPaisaConfig = {
          storeId: integration.store_id,
          hashKey: integration.hash_key_encrypted, // Should be decrypted
          returnUrl: transactionData.return_url ?? '',
          testMode: integration.test_mode,
        };

        const paymentRequest: easypaisa.EasyPaisaPaymentRequest = {
          transactionRef,
          amount,
          description: `Payment for Invoice ${invoiceData.invoice_number}`,
          customerEmail: transactionData.customer_email || undefined,
          customerPhone: transactionData.customer_phone || undefined,
        };

        const result = await easypaisa.initiateEasyPaisaPayment(
          config,
          transactionData,
          paymentRequest
        );

        paymentUrl = result.paymentUrl;
        break;
      }

      case 'raast': {
        if (!integration.raast_id) {
          throw new Error('Raast ID not configured');
        }

        const config: raast.RaastConfig = {
          raastId: integration.raast_id,
          merchantName: integration.account_name,
          returnUrl: transactionData.return_url ?? '',
        };

        const paymentRequest: raast.RaastPaymentRequest = {
          transactionRef,
          amount,
          description: `Payment for Invoice ${invoiceData.invoice_number}`,
          customerName: transactionData.customer_name || undefined,
        };

        const result = await raast.initiateRaastPayment(config, transactionData, paymentRequest);

        qrData = result.qrData;
        break;
      }

      default:
        throw new Error(`Unsupported payment method: ${request.payment_method}`);
    }

    return {
      success: true,
      paymentUrl,
      qrData,
      transaction: transactionData,
    };
  } catch (error) {
    logger.error('Error initiating payment:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      transaction: {} as PaymentTransaction,
      error: error instanceof Error ? error.message : 'Failed to initiate payment',
    };
  }
}

/**
 * Get payment transaction by reference
 */
export async function getPaymentTransaction(
  transactionRef: string
): Promise<{ data: PaymentTransaction | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*, invoice:invoices(*), customer:customers(*)')
      .eq('transaction_reference', transactionRef)
      .single();

    if (error) throw error;

    return { data: data as PaymentTransaction, error: null };
  } catch (error) {
    logger.error('Error fetching payment transaction:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get payment transactions for an organization
 */
export async function getPaymentTransactions(
  organizationId: string,
  filters?: {
    status?: string[];
    payment_method?: PaymentProvider[];
    invoice_id?: string;
    start_date?: string;
    end_date?: string;
  }
): Promise<{ data: PaymentTransaction[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('payment_transactions')
      .select('*, invoice:invoices(*), customer:customers(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.payment_method && filters.payment_method.length > 0) {
      query = query.in('payment_method', filters.payment_method);
    }

    if (filters?.invoice_id) {
      query = query.eq('invoice_id', filters.invoice_id);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as PaymentTransaction[], error: null };
  } catch (error) {
    logger.error('Error fetching payment transactions:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}
