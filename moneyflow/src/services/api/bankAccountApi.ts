// src/services/api/bankAccountApi.ts
/**
 * Bank Account API Service
 * Handles bank account CRUD operations and reconciliation
 * Includes account balance tracking and transaction management
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { BankAccount, Transaction } from '@/types/database.types';

/**
 * Get all bank accounts for an organization
 */
export async function getBankAccounts(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .order('account_name');

    if (error) throw error;

    return { data: data as BankAccount[], error: null };
  } catch (error) {
    logger.error('Error fetching bank accounts:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Get active bank accounts only
 */
export async function getActiveBankAccounts(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('account_name');

    if (error) throw error;

    return { data: data as BankAccount[], error: null };
  } catch (error) {
    logger.error('Error fetching active bank accounts:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Get single bank account with recent transactions
 */
export async function getBankAccount(bankAccountId: string) {
  try {
    const { data: account, error: accountError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', bankAccountId)
      .single();

    if (accountError) throw accountError;

    // Get recent transactions for this account
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(
        `
        *,
        category:expense_categories(name, color, icon)
      `
      )
      .eq('bank_account_id', bankAccountId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (transactionsError) throw transactionsError;

    // Cast to proper type since TypeScript can't infer complex joins
    type TransactionWithCategory = Transaction & {
      category?: { name: string; color: string; icon: string } | null;
    };
    const typedTransactions = transactions as TransactionWithCategory[] | null;

    // Calculate transaction statistics
    const stats = {
      total_transactions: typedTransactions?.length ?? 0,
      total_deposits: 0,
      total_withdrawals: 0,
      deposit_count: 0,
      withdrawal_count: 0,
    };

    typedTransactions?.forEach((txn) => {
      if (txn.type === 'income') {
        stats.total_deposits += txn.amount;
        stats.deposit_count++;
      } else if (txn.type === 'expense') {
        stats.total_withdrawals += txn.amount;
        stats.withdrawal_count++;
      }
    });

    return {
      data: {
        ...(account as BankAccount),
        recent_transactions: transactions,
        stats,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching bank account:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Create new bank account
 */
export async function createBankAccount(
  accountData: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>,
  organizationId: string
) {
  try {
    // Set initial current_balance to opening_balance if not provided
    const dataWithBalance = {
      ...accountData,
      organization_id: organizationId,
      current_balance: accountData.current_balance ?? accountData.opening_balance ?? 0,
    };

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(dataWithBalance)
      .select()
      .single();

    if (error) throw error;

    return { data: data as BankAccount, error: null };
  } catch (error) {
    logger.error('Error creating bank account:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Update bank account details
 */
export async function updateBankAccount(bankAccountId: string, updates: Partial<BankAccount>) {
  try {
    // Remove fields that shouldn't be updated directly
    const { id, organization_id, created_at, updated_at, current_balance, ...updateData } = updates;

    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updateData)
      .eq('id', bankAccountId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as BankAccount, error: null };
  } catch (error) {
    logger.error('Error updating bank account:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Delete bank account (only if no transactions exist)
 */
export async function deleteBankAccount(bankAccountId: string) {
  try {
    // Check for existing transactions
    const { data: transactions, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('bank_account_id', bankAccountId)
      .limit(1);

    if (checkError) throw checkError;

    if (transactions && transactions.length > 0) {
      throw new Error(
        'Cannot delete bank account with existing transactions. ' +
          'Please mark the account as inactive instead.'
      );
    }

    const { error } = await supabase.from('bank_accounts').delete().eq('id', bankAccountId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    logger.error('Error deleting bank account:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error as Error };
  }
}

/**
 * Deactivate bank account (soft delete)
 */
export async function deactivateBankAccount(bankAccountId: string) {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ is_active: false })
      .eq('id', bankAccountId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as BankAccount, error: null };
  } catch (error) {
    logger.error('Error deactivating bank account:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Reactivate bank account
 */
export async function reactivateBankAccount(bankAccountId: string) {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ is_active: true })
      .eq('id', bankAccountId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as BankAccount, error: null };
  } catch (error) {
    logger.error('Error reactivating bank account:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Reconcile bank account with bank statement
 */
export async function reconcileBankAccount(
  bankAccountId: string,
  statementBalance: number,
  statementDate: string,
  notes?: string
) {
  try {
    const { data: account } = await getBankAccount(bankAccountId);
    if (!account) throw new Error('Bank account not found');

    const difference = statementBalance - account.current_balance;
    const tolerance = 0.01; // 1 cent tolerance for rounding

    // If there's a significant difference, create adjustment transaction
    if (Math.abs(difference) > tolerance) {
      const adjustmentType = difference > 0 ? 'income' : 'expense';
      const adjustmentAmount = Math.abs(difference);

      // Create reconciliation adjustment transaction
      const transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        organization_id: account.organization_id,
        type: adjustmentType,
        amount: adjustmentAmount,
        date: statementDate,
        description: `Bank reconciliation adjustment - ${notes ?? 'Statement reconciliation'}`,
        payment_method: 'bank_transfer',
        bank_account_id: bankAccountId,
        notes: `Automatic adjustment to match bank statement. Difference: ${difference.toFixed(2)}`,
        reference_type: 'reconciliation',
        reference_id: `RECON-${Date.now()}`,
      };

      const { error: transactionError } = await supabase.from('transactions').insert(transactionData);

      if (transactionError) throw transactionError;

      // Update account balance directly
      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update({
          current_balance: statementBalance,
          updated_at: new Date().toISOString(),
        })
      .eq('id', bankAccountId);

      if (updateError) throw updateError;
    }

    // Create reconciliation record
    const reconciliationRecord = {
      bank_account_id: bankAccountId,
      statement_date: statementDate,
      statement_balance: statementBalance,
      book_balance: account.current_balance,
      difference,
      was_adjusted: Math.abs(difference) > tolerance,
      notes: notes || null,
      reconciled_at: new Date().toISOString(),
    };

    return {
      data: reconciliationRecord,
      error: null,
    };
  } catch (error) {
    logger.error('Error reconciling bank account:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get account balance history
 */
export async function getAccountBalanceHistory(
  bankAccountId: string,
  startDate: string,
  endDate: string
) {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('date, type, amount')
      .eq('bank_account_id', bankAccountId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
      .order('created_at');

    if (error) throw error;

    // Get account opening balance at start date
    const { data: account } = await getBankAccount(bankAccountId);
    if (!account) throw new Error('Account not found');

    // Get transactions before start date to calculate opening balance
    const { data: priorTransactions, error: priorError } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('bank_account_id', bankAccountId)
      .lt('date', startDate);

    if (priorError) throw priorError;

    // Cast to ensure type safety
    type TransactionTypeAmount = { type: 'income' | 'expense' | 'transfer'; amount: number };
    const typedPriorTransactions = priorTransactions as TransactionTypeAmount[] | null;

    // Calculate opening balance for the period
    let openingBalance = account.opening_balance ?? 0;
    typedPriorTransactions?.forEach((txn) => {
      if (txn.type === 'income') {
        openingBalance += txn.amount;
      } else if (txn.type === 'expense') {
        openingBalance -= txn.amount;
      }
    });

    // Build balance history
    const history: Array<{ date: string; balance: number; change: number }> = [];
    let runningBalance = openingBalance;

    // Cast to ensure type safety
    type TransactionDateAmount = {
      date: string;
      type: 'income' | 'expense' | 'transfer';
      amount: number;
    };
    const typedTransactions = transactions as TransactionDateAmount[] | null;

    // Group transactions by date
    const transactionsByDate: Record<string, number> = {};
    typedTransactions?.forEach((txn) => {
      const change = txn.type === 'income' ? txn.amount : -txn.amount;
      transactionsByDate[txn.date] = (transactionsByDate[txn.date] ?? 0) + change;
    });

    // Create history entries
    Object.entries(transactionsByDate).forEach(([date, change]) => {
      runningBalance += change;
      history.push({
        date,
        balance: runningBalance,
        change,
      });
    });

    return {
      data: {
        opening_balance: openingBalance,
        closing_balance: runningBalance,
        history,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching balance history:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get total balance across all accounts
 */
export async function getTotalBalance(organizationId: string) {
  try {
    const { data: accounts, error } = await supabase
      .from('bank_accounts')
      .select('current_balance, currency, account_type, is_active')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (error) throw error;

    // Cast to ensure type safety
    type AccountBalance = {
      current_balance: number;
      currency: string;
      account_type: string;
      is_active: boolean;
    };
    const typedAccounts = accounts as AccountBalance[] | null;

    const totals = {
      total_balance: 0,
      by_type: {} as Record<string, number>,
      by_currency: {} as Record<string, number>,
      account_count: typedAccounts?.length ?? 0,
    };

    typedAccounts?.forEach((account) => {
      totals.total_balance += account.current_balance;

      // Sum by account type
      totals.by_type[account.account_type] =
        (totals.by_type[account.account_type] ?? 0) + account.current_balance;

      // Sum by currency
      totals.by_currency[account.currency] =
        (totals.by_currency[account.currency] ?? 0) + account.current_balance;
    });

    return { data: totals, error: null };
  } catch (error) {
    logger.error('Error calculating total balance:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}
