// src/services/api/expenseCategoryApi.ts
/**
 * Expense Category API Service
 * Handles expense category CRUD operations and hierarchical category management
 * Includes category budgeting and transaction categorization
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { ExpenseCategory } from '@/types/database.types';

/**
 * Get all expense categories with hierarchical structure
 */
export async function getExpenseCategories(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;

    // Build category tree (parent-child relationships)
    const categories = data as ExpenseCategory[];
    const categoryMap = new Map(
      categories.map(cat => [
        cat.id, 
        { ...cat, children: [] as ExpenseCategory[] }
      ])
    );
    
    const rootCategories: any[] = [];

    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          parent.children.push(categoryWithChildren);
        } else {
          // Parent not found, treat as root
          rootCategories.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return { data: rootCategories, error: null };
  } catch (error) {
    logger.error('Error fetching expense categories:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Get flat list of active categories
 */
export async function getActiveCategories(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return { data: data as ExpenseCategory[], error: null };
  } catch (error) {
    logger.error('Error fetching active categories:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Get single category with statistics
 */
export async function getExpenseCategory(categoryId: string) {
  try {
    const { data: category, error: categoryError } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError) throw categoryError;

    // Get transaction statistics for this category
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('category_id', categoryId)
      .eq('type', 'expense');

    if (txnError) throw txnError;

    // Calculate statistics
    const stats = {
      total_spent: 0,
      transaction_count: transactions?.length ?? 0,
      average_amount: 0,
      last_transaction_date: null as string | null,
    };

    if (transactions && transactions.length > 0) {
      stats.total_spent = transactions.reduce((sum, txn) => sum + txn.amount, 0);
      stats.average_amount = stats.total_spent / transactions.length;
      
      // Get most recent transaction date
      const sortedDates = transactions
        .map(txn => txn.date)
        .sort()
        .reverse();
      stats.last_transaction_date = sortedDates[0] || null;
    }

    // Calculate budget utilization if budget limit exists
    let budgetUtilization = null;
    if (category.budget_limit && category.budget_limit > 0) {
      budgetUtilization = {
        limit: category.budget_limit,
        spent: stats.total_spent,
        remaining: category.budget_limit - stats.total_spent,
        percentage: (stats.total_spent / category.budget_limit) * 100,
      };
    }

    return {
      data: {
        ...category,
        stats,
        budget_utilization: budgetUtilization,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching expense category:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Create new expense category
 */
export async function createExpenseCategory(
  categoryData: Omit<ExpenseCategory, 'id' | 'created_at'>,
  organizationId: string
) {
  try {
    // Validate parent category if provided
    if (categoryData.parent_category_id) {
      const { data: parent, error: parentError } = await supabase
        .from('expense_categories')
        .select('id, organization_id')
        .eq('id', categoryData.parent_category_id)
        .single();

      if (parentError || !parent) {
        throw new Error('Parent category not found');
      }

      if (parent.organization_id !== organizationId) {
        throw new Error('Parent category belongs to different organization');
      }
    }

    const { data, error } = await supabase
      .from('expense_categories')
      .insert({
        ...categoryData,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as ExpenseCategory, error: null };
  } catch (error) {
    logger.error('Error creating expense category:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Update expense category
 */
export async function updateExpenseCategory(
  categoryId: string,
  updates: Partial<ExpenseCategory>
) {
  try {
    // Remove fields that shouldn't be updated directly
    const { id: _id, organization_id: _organization_id, created_at: _created_at, ...updateData } = updates;

    // Validate parent category if being updated
    if (updateData.parent_category_id) {
      // Prevent circular reference
      if (updateData.parent_category_id === categoryId) {
        throw new Error('Category cannot be its own parent');
      }

      // Check if new parent exists
      const { data: parent, error: parentError } = await supabase
        .from('expense_categories')
        .select('id, organization_id')
        .eq('id', updateData.parent_category_id)
        .single();

      if (parentError || !parent) {
        throw new Error('Parent category not found');
      }

      // Get current category to check organization
      const { data: current } = await supabase
        .from('expense_categories')
        .select('organization_id')
        .eq('id', categoryId)
        .single();

      if (current && parent.organization_id !== current.organization_id) {
        throw new Error('Parent category belongs to different organization');
      }
    }

    const { data, error } = await supabase
      .from('expense_categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as ExpenseCategory, error: null };
  } catch (error) {
    logger.error('Error updating expense category:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Delete expense category
 */
export async function deleteExpenseCategory(categoryId: string) {
  try {
    // Check for child categories
    const { data: children, error: childError } = await supabase
      .from('expense_categories')
      .select('id')
      .eq('parent_category_id', categoryId)
      .limit(1);

    if (childError) throw childError;

    if (children && children.length > 0) {
      throw new Error(
        'Cannot delete category with subcategories. ' +
        'Please delete or reassign subcategories first.'
      );
    }

    // Check for transactions using this category
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1);

    if (txnError) throw txnError;

    if (transactions && transactions.length > 0) {
      throw new Error(
        'Cannot delete category with existing transactions. ' +
        'Mark as inactive instead or reassign transactions to another category.'
      );
    }

    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    logger.error('Error deleting expense category:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error as Error };
  }
}

/**
 * Deactivate category (soft delete)
 */
export async function deactivateCategory(categoryId: string) {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .update({ is_active: false })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as ExpenseCategory, error: null };
  } catch (error) {
    logger.error('Error deactivating category:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Reactivate category
 */
export async function reactivateCategory(categoryId: string) {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .update({ is_active: true })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as ExpenseCategory, error: null };
  } catch (error) {
    logger.error('Error reactivating category:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}

/**
 * Get category spending trends
 */
export async function getCategorySpendingTrends(
  categoryId: string,
  months: number = 6
) {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('category_id', categoryId)
      .eq('type', 'expense')
      .gte('date', startDateStr)
      .order('date');

    if (error) throw error;

    // Group by month
    const monthlySpending: Record<string, number> = {};

    transactions?.forEach((txn) => {
      const date = new Date(txn.date);
      const monthLabel = date.toLocaleString('default', { 
        month: 'short',
        year: 'numeric' 
      });

      if (!monthlySpending[monthLabel]) {
        monthlySpending[monthLabel] = 0;
      }
      monthlySpending[monthLabel] += txn.amount;
    });

    const trendData = Object.entries(monthlySpending).map(([month, amount]) => ({
      month,
      amount,
    }));

    return { data: trendData, error: null };
  } catch (error) {
    logger.error('Error fetching category trends:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Get all categories with spending summary
 */
export async function getCategoriesWithSpending(
  organizationId: string,
  startDate: string,
  endDate: string
) {
  try {
    const { data: categories, error: catError } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (catError) throw catError;

    // Get transactions for date range
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('organization_id', organizationId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (txnError) throw txnError;

    // Calculate spending per category
    const spendingByCategory: Record<string, number> = {};
    transactions?.forEach((txn) => {
      if (txn.category_id) {
        spendingByCategory[txn.category_id] = 
          (spendingByCategory[txn.category_id] || 0) + txn.amount;
      }
    });

    // Combine categories with spending data
    const categoriesWithSpending = categories?.map((cat: any) => ({
      ...cat,
      spent: spendingByCategory[cat.id] || 0,
      budget_remaining: cat.budget_limit 
        ? cat.budget_limit - (spendingByCategory[cat.id] || 0)
        : null,
      budget_percentage: cat.budget_limit
        ? ((spendingByCategory[cat.id] || 0) / cat.budget_limit) * 100
        : null,
    })) || [];

    return { data: categoriesWithSpending, error: null };
  } catch (error) {
    logger.error('Error fetching categories with spending:', error instanceof Error ? error.message : String(error));
    return { data: [], error: error as Error };
  }
}

/**
 * Seed default expense categories for an organization
 */
export async function seedDefaultCategories(organizationId: string) {
  const defaultCategories = [
    // Expense Categories
    { name: 'Rent', description: 'Office/Shop rent payments', color: '#ef4444', icon: 'building' },
    { name: 'Salaries', description: 'Employee salaries and wages', color: '#f97316', icon: 'users' },
    { name: 'Utilities', description: 'Electricity, water, gas, internet', color: '#eab308', icon: 'zap' },
    { name: 'Supplies', description: 'Office and business supplies', color: '#22c55e', icon: 'package' },
    { name: 'Marketing', description: 'Advertising and marketing expenses', color: '#06b6d4', icon: 'megaphone' },
    { name: 'Travel', description: 'Business travel and transportation', color: '#3b82f6', icon: 'car' },
    { name: 'Maintenance', description: 'Equipment and facility maintenance', color: '#8b5cf6', icon: 'wrench' },
    { name: 'Insurance', description: 'Business insurance premiums', color: '#ec4899', icon: 'shield' },
    { name: 'Taxes', description: 'Business taxes and fees', color: '#64748b', icon: 'receipt' },
    { name: 'Miscellaneous', description: 'Other business expenses', color: '#6b7280', icon: 'more-horizontal' },
    // Income Categories
    { name: 'Sales', description: 'Product and service sales', color: '#10b981', icon: 'shopping-cart' },
    { name: 'Services', description: 'Service revenue', color: '#14b8a6', icon: 'briefcase' },
    { name: 'Interest', description: 'Interest income', color: '#0ea5e9', icon: 'percent' },
    { name: 'Refunds', description: 'Refunds received', color: '#a855f7', icon: 'rotate-ccw' },
    { name: 'Other Income', description: 'Other income sources', color: '#84cc16', icon: 'plus-circle' },
  ];

  try {
    // Check if categories already exist
    const { data: existing } = await supabase
      .from('expense_categories')
      .select('id')
      .eq('organization_id', organizationId)
      .limit(1);

    if (existing && existing.length > 0) {
      return { data: null, error: null, message: 'Categories already exist' };
    }

    const { data, error } = await supabase
      .from('expense_categories')
      .insert(
        defaultCategories.map(cat => ({
          ...cat,
          organization_id: organizationId,
          is_active: true,
        }))
      )
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error seeding default categories:', error instanceof Error ? error.message : String(error));
    return { data: null, error: error as Error };
  }
}