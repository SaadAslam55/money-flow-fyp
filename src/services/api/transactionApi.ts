// src/services/api/transactionApi.ts
/**
 * Transaction API Service
 * Handles transaction CRUD operations, bank account management, and reconciliation
 * Includes expense categories, receipt uploads, and transaction filtering
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import { uploadFile, deleteFile, getPublicUrl } from '@/services/supabase/storage';
import type { Transaction, TransactionFilters, BankAccount } from '@/types/database.types';

/**
 * Get all transactions with filters and pagination
 */
export async function getTransactions(
  organizationId: string,
  filters?: TransactionFilters,
  page: number = 1,
  perPage: number = 50
) {
  try {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:expense_categories(id, name, color, icon),
        bank_account:bank_accounts(id, account_name, bank_name)
      `, { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply type filter
    if (filters?.type && filters.type.length > 0) {
      query = query.in('type', filters.type);
    }

    // Apply category filter
    if (filters?.category_id && filters.category_id.length > 0) {
      query = query.in('category_id', filters.category_id);
    }

    // Apply bank account filter
    if (filters?.bank_account_id && filters.bank_account_id.length > 0) {
      query = query.in('bank_account_id', filters.bank_account_id);
    }

    // Apply payment method filter
    if (filters?.payment_method && filters.payment_method.length > 0) {
      query = query.in('payment_method', filters.payment_method);
    }

    // Apply date range filters
    if (filters?.date_from) {
      query = query.gte('date', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('date', filters.date_to);
    }

    // Apply amount range filters
    if (filters?.amount_min !== undefined) {
      query = query.gte('amount', filters.amount_min);
    }

    if (filters?.amount_max !== undefined) {
      query = query.lte('amount', filters.amount_max);
    }

    // Apply search filter
    if (filters?.search) {
      query = query.or(`description.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    // Apply pagination
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;

    const { data, error, count } = await query
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      data: data as Transaction[],
      count: count ?? 0,
      page,
      perPage,
      totalPages: count ? Math.ceil(count / perPage) : 0,
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching transactions:', error instanceof Error ? error.message : String(error));
    return { 
      data: [], 
      count: 0, 
      page, 
      perPage, 
      totalPages: 0, 
      error: error as Error 
    };
  }
}

/**
 * Get single transaction with full details
 */
export async function getTransaction(transactionId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:expense_categories(*),
        bank_account:bank_accounts(*)
      `)
      .eq('id', transactionId)
      .single();

    if (error) throw error;

    return { data: data as Transaction, error: null };
  } catch (error) {
    logger.error('Error fetching transaction:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Create new transaction with optional receipt upload
 */
export async function createTransaction(
  transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>,
  organizationId: string,
  userId: string,
  receiptFile?: File
) {
  try {
    let receiptUrl: string | null = null;

    // Upload receipt if provided
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${organizationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await uploadFile(
        'receipts',
        fileName,
        receiptFile
      );

      if (uploadError) {
        logger.error('Receipt upload failed:', uploadError instanceof Error ? uploadError.message : String(uploadError));
        // Continue without receipt rather than failing entire transaction
      } else if (uploadData?.path) {
        receiptUrl = getPublicUrl('receipts', uploadData.path);
      }
    }

    // Create transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        organization_id: organizationId,
        created_by: userId,
        receipt_url: receiptUrl,
      })
      .select(`
        *,
        category:expense_categories(id, name, color, icon),
        bank_account:bank_accounts(id, account_name, bank_name)
      `)
      .single();

    if (error) throw error;

    // Update bank account balance if applicable
    if (transactionData.bank_account_id) {
      await updateBankAccountBalance(
        transactionData.bank_account_id,
        transactionData.type,
        transactionData.amount
      );
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Error creating transaction:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Update existing transaction
 */
export async function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>,
  receiptFile?: File
) {
  try {
    // Get original transaction to calculate balance adjustments
    const { data: original } = await getTransaction(transactionId);
    if (!original) throw new Error('Transaction not found');

    // Handle receipt upload
    let receiptUrl = original.receipt_url;
    if (receiptFile) {
      // Delete old receipt if exists
      if (original.receipt_url) {
        const oldPath = original.receipt_url.split('/receipts/')[1];
        if (oldPath) {
          await deleteFile('receipts', [oldPath]);
        }
      }

      // Upload new receipt
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${original.organization_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await uploadFile(
        'receipts',
        fileName,
        receiptFile
      );

      if (uploadError) {
        logger.error('Receipt upload failed:', uploadError instanceof Error ? uploadError.message : String(uploadError));
      } else if (uploadData?.path) {
        receiptUrl = getPublicUrl('receipts', uploadData.path);
      }
    }

    // Remove fields that shouldn't be updated directly
    const { _id, _organization_id, _created_at, _updated_at, _created_by, ...updateData } = updates as Record<string, unknown>;

    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...updateData,
        receipt_url: receiptUrl,
      })
      .eq('id', transactionId)
      .select(`
        *,
        category:expense_categories(id, name, color, icon),
        bank_account:bank_accounts(id, account_name, bank_name)
      `)
      .single();

    if (error) throw error;

    // Update bank balances if amount, type, or bank account changed
    const balanceFieldsChanged = 
      updates.amount !== undefined || 
      updates.type !== undefined || 
      updates.bank_account_id !== undefined;

    if (original.bank_account_id && balanceFieldsChanged) {
      // Revert original balance effect
      await updateBankAccountBalance(
        original.bank_account_id,
        original.type === 'income' ? 'expense' : 'income', // Reverse operation
        original.amount
      );

      // Apply new balance effect
      const newBankAccountId = updates.bank_account_id !== undefined 
        ? updates.bank_account_id 
        : original.bank_account_id;
      
      if (newBankAccountId) {
        const newAmount = updates.amount !== undefined ? updates.amount : original.amount;
        const newType = updates.type !== undefined ? updates.type : original.type;
        
        await updateBankAccountBalance(newBankAccountId, newType, newAmount);
      }
    } else if (updates.bank_account_id && !original.bank_account_id) {
      // Transaction didn't have bank account before, now it does
      const newAmount = updates.amount !== undefined ? updates.amount : original.amount;
      const newType = updates.type !== undefined ? updates.type : original.type;
      await updateBankAccountBalance(updates.bank_account_id, newType, newAmount);
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Error updating transaction:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Delete transaction and clean up associated data
 */
export async function deleteTransaction(transactionId: string) {
  try {
    // Get transaction details before deletion
    const { data: transaction } = await getTransaction(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    // Delete receipt file if exists
    if (transaction.receipt_url) {
      const path = transaction.receipt_url.split('/receipts/')[1];
      if (path) {
        await deleteFile('receipts', [path]);
      }
    }

    // Revert bank account balance if applicable
    if (transaction.bank_account_id) {
      await updateBankAccountBalance(
        transaction.bank_account_id,
        transaction.type === 'income' ? 'expense' : 'income', // Reverse operation
        transaction.amount
      );
    }

    // Delete transaction record
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    logger.error('Error deleting transaction:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error as Error };
  }
}

/**
 * Helper: Update bank account balance
 * @private
 */
async function updateBankAccountBalance(
  bankAccountId: string,
  type: 'income' | 'expense' | 'transfer',
  amount: number
) {
  try {
    // Get current balance
    const { data: account, error: fetchError } = await supabase
      .from('bank_accounts')
      .select('current_balance')
      .eq('id', bankAccountId)
      .single();

    if (fetchError) throw fetchError;
    if (!account) return;

    // Calculate adjustment based on transaction type
    const adjustment = type === 'income' ? amount : -amount;
    const typedAccount = account as Pick<BankAccount, 'current_balance'>;
    const newBalance = (typedAccount.current_balance ?? 0) + adjustment;

    // Update balance
    const { error: updateError } = await supabase
      .from('bank_accounts')
      .update({ 
        current_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', bankAccountId);

    if (updateError) throw updateError;
  } catch (error) {
    logger.error('Error updating bank balance:', error instanceof Error ? error.message : String(error));
    throw error; // Propagate error to transaction operation
  }
}

/**
 * Get transaction summary for date range
 */
export async function getTransactionSummary(
  organizationId: string,
  startDate: string,
  endDate: string
) {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('type, amount, category_id, expense_categories(name, color)')
      .eq('organization_id', organizationId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const summary = {
      total_income: 0,
      total_expenses: 0,
      net_cashflow: 0,
      by_category: {} as Record<string, { amount: number; color?: string }>,
      transaction_count: transactions?.length ?? 0,
      income_count: 0,
      expense_count: 0,
    };

    transactions?.forEach((transaction: Record<string, unknown>) => {
      if (transaction.type === 'income') {
        summary.total_income += (transaction.amount as number) ?? 0;
        summary.income_count++;
      } else if (transaction.type === 'expense') {
        summary.total_expenses += (transaction.amount as number) ?? 0;
        summary.expense_count++;
        
        const expenseCategories = transaction.expense_categories as Record<string, string> | undefined;
        const categoryName = expenseCategories?.name ?? 'Uncategorized';
        const categoryColor = expenseCategories?.color;
        
        if (!summary.by_category[categoryName]) {
          summary.by_category[categoryName] = { 
            amount: 0, 
            color: categoryColor 
          };
        }
        summary.by_category[categoryName].amount += (transaction.amount as number) ?? 0;
      }
    });

    summary.net_cashflow = summary.total_income - summary.total_expenses;

    return { data: summary, error: null };
  } catch (error) {
    logger.error('Error fetching transaction summary:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get cash flow data for chart visualization
 */
export async function getCashFlowData(
  organizationId: string,
  months: number = 6
) {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('type, amount, date')
      .eq('organization_id', organizationId)
      .gte('date', startDateStr)
      .order('date');

    if (error) throw error;

    // Group by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    const typedTransactions = (transactions ?? []) as Pick<Transaction, 'date' | 'type' | 'amount'>[];

    typedTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthLabel = date.toLocaleString('default', { 
        month: 'short',
        year: 'numeric' 
      });

      if (!monthlyData[monthLabel]) {
        monthlyData[monthLabel] = { income: 0, expenses: 0 };
      }

      if (transaction.type === 'income') {
        monthlyData[monthLabel].income += transaction.amount ?? 0;
      } else if (transaction.type === 'expense') {
        monthlyData[monthLabel].expenses += transaction.amount ?? 0;
      }
    });

    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }));

    return { data: chartData, error: null };
  } catch (error) {
    logger.error('Error fetching cash flow data:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(
  organizationId: string,
  limit: number = 10
) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:expense_categories(id, name, color, icon),
        bank_account:bank_accounts(id, account_name, bank_name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data: data as Transaction[], error: null };
  } catch (error) {
    logger.error('Error fetching recent transactions:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}