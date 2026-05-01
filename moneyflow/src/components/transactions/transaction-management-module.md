# Transaction Management Module

## 📖 Overview

The Transaction Management Module provides comprehensive tracking of all financial transactions including income, expenses, and transfers with bank reconciliation.

## 🎯 Module Objectives

- Record income and expenses
- Manage bank accounts
- Upload and store receipts
- Categorize transactions
- Reconcile bank statements
- Generate cash flow reports
- Track payment methods
- Monitor account balances

## 👥 User Roles Involved

| Role           | Access Level | Permissions                     |
| -------------- | ------------ | ------------------------------- |
| **Admin**      | Full Access  | All transaction operations      |
| **Manager**    | Full Access  | All transaction operations      |
| **Accountant** | Create/View  | Create, view, edit transactions |
| **Cashier**    | Limited      | Record cash transactions only   |

## 🏗️ Architecture

```
Transaction Flow:
┌───────────────┐     ┌──────────────┐     ┌─────────────┐
│  Transaction  │────▶│ Validation   │────▶│  Database   │
│     Form      │     │ & Receipt    │     │  (Supabase) │
└───────────────┘     └──────────────┘     └─────────────┘
       │                     │                     │
       ▼                     ▼                     ▼
  Amount/Type         Receipt Upload       Transaction +
  Category            Bank Update          Bank Balance
  Payment Method      Category Link        Receipt URL
```

## 📁 File Structure

```
src/
├── components/transactions/
│   ├── TransactionForm.tsx          ✅ Income/expense form
│   ├── TransactionList.tsx          ✅ Transaction table
│   ├── TransactionDetail.tsx        ⬜ Detail view
│   ├── RecurringTransactionForm.tsx ⬜ Recurring setup
│   ├── BankReconciliation.tsx       ⬜ Reconciliation tool
│   └── CashFlowChart.tsx            ⬜ Visual analytics
│
├── components/bank-accounts/
│   ├── BankAccountForm.tsx          ✅ Account creation
│   ├── BankAccountList.tsx          ✅ Account list
│   └── BankAccountDetail.tsx        ⬜ Account detail
│
├── pages/transactions/
│   ├── TransactionsPage.tsx         ✅ Main transactions page
│   ├── BankAccountsPage.tsx         ⬜ Bank accounts page
│   └── RecurringTransactionsPage.tsx ⬜ Recurring setup
│
├── services/api/
│   ├── transactionApi.ts            ✅ Transaction CRUD
│   ├── bankAccountApi.ts            ✅ Bank account CRUD
│   └── expenseCategoryApi.ts        ✅ Category management
│
├── hooks/
│   ├── useTransactions.ts           ✅ Transaction hooks
│   ├── useBankAccounts.ts           ✅ Bank account hooks
│   ├── useExpenseCategories.ts      ✅ Category hooks
│   └── useCashFlow.ts               ✅ Cash flow data
│
└── schemas/
    └── transactionSchemas.ts        ✅ Zod validation
✅ Implementation Checklist
Phase 1: Core Setup ✅

 Transaction types
 Validation schemas
 API service functions
 React Query hooks
 File upload utilities

Phase 2: Transaction Form ✅

 Income/expense selection
 Category dropdown
 Payment method selection
 Bank account selection
 Receipt upload
 Date picker
 Amount validation

Phase 3: Transaction List ✅

 Filterable table
 Type indicators (income/expense)
 Category display
 Search functionality
 Export to CSV
 Mobile responsive

Phase 4: Bank Accounts ✅

 Account creation
 Balance tracking
 Transaction linking
 Account reconciliation

Phase 5: Categories ✅

 Expense categories
 Hierarchical structure
 Usage tracking
 Active/inactive status

Phase 6: Advanced Features ⬜

 Recurring transactions
 Bulk import
 Bank feed integration
 Split transactions
 Transaction rules
 Budget tracking

🔑 Key Features
1. Transaction Recording
typescriptexport async function createTransaction(
  transactionData: TransactionFormData,
  organizationId: string,
  userId: string,
  receiptFile?: File
) {
  let receiptUrl: string | null = null;

  // Upload receipt if provided
  if (receiptFile) {
    const fileName = `${organizationId}/${Date.now()}-${receiptFile.name}`;
    const { url, error } = await uploadFile('receipts', fileName, receiptFile);
    if (error) throw error;
    receiptUrl = url;
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
    .select()
    .single();

  if (error) throw error;

  // Update bank account balance
  if (transactionData.bank_account_id) {
    await updateBankAccountBalance(
      transactionData.bank_account_id,
      transactionData.type,
      transactionData.amount
    );
  }

  return { data, error: null };
}
2. Bank Balance Updates
typescriptasync function updateBankAccountBalance(
  bankAccountId: string,
  type: 'income' | 'expense' | 'transfer',
  amount: number
) {
  const { data: account } = await supabase
    .from('bank_accounts')
    .select('current_balance')
    .eq('id', bankAccountId)
    .single();

  if (!account) return;

  const adjustment = type === 'income' ? amount : -amount;
  const newBalance = account.current_balance + adjustment;

  await supabase
    .from('bank_accounts')
    .update({ current_balance: newBalance })
    .eq('id', bankAccountId);
}
3. Bank Reconciliation
typescriptexport async function reconcileBankAccount(
  bankAccountId: string,
  statementBalance: number,
  statementDate: string
) {
  const { data: account } = await getBankAccount(bankAccountId);
  if (!account) throw new Error('Bank account not found');

  const difference = statementBalance - account.current_balance;

  if (Math.abs(difference) > 0.01) {
    // Create adjustment transaction
    await supabase
      .from('transactions')
      .insert({
        organization_id: account.organization_id,
        type: difference > 0 ? 'income' : 'expense',
        amount: Math.abs(difference),
        date: statementDate,
        description: 'Bank reconciliation adjustment',
        payment_method: 'bank_transfer',
        bank_account_id: bankAccountId,
      });

    // Update account balance
    await updateBankAccount(bankAccountId, {
      current_balance: statementBalance,
    });
  }

  return {
    was_adjusted: Math.abs(difference) > 0.01,
    difference,
    new_balance: statementBalance,
  };
}
4. Cash Flow Analysis
typescriptexport async function getCashFlowData(
  organizationId: string,
  months: number = 6
) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .eq('organization_id', organizationId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date');

  // Group by month
  const monthlyData: Record<string, { income: number; expenses: number }> = {};

  transactions?.forEach((transaction) => {
    const month = new Date(transaction.date).toLocaleString('default', {
      month: 'short',
      year: 'numeric'
    });

    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 };
    }

    if (transaction.type === 'income') {
      monthlyData[month].income += transaction.amount;
    } else if (transaction.type === 'expense') {
      monthlyData[month].expenses += transaction.amount;
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses,
  }));
}
📊 Database Schema
sql-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category_id UUID REFERENCES expense_categories(id),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id UUID,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'check', 'upi', 'other')),
  bank_account_id UUID REFERENCES bank_accounts(id),
  receipt_url TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank accounts table
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255),
  account_number VARCHAR(50),
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit_card', 'cash')),
  current_balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PKR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense categories table
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES expense_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT expense_categories_unique_name UNIQUE (organization_id, name)
);

-- Indexes
CREATE INDEX idx_transactions_organization ON transactions(organization_id);
CREATE INDEX idx_transactions_date ON transactions(organization_id, date DESC);
CREATE INDEX idx_transactions_type ON transactions(organization_id, type);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_bank_account ON transactions(bank_account_id);
CREATE INDEX idx_bank_accounts_organization ON bank_accounts(organization_id);
🔄 State Management
typescript// Transaction hooks
export function useTransactions(filters?: TransactionFilters, page: number = 1) {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', organization?.id, filters, page],
    queryFn: () => getTransactions(organization!.id, filters, page),
    enabled: !!organization?.id,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: ({ data, file }: { data: TransactionFormData; file?: File }) =>
      createTransaction(data, organization!.id, user!.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['bank-accounts']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success('Transaction recorded successfully');
    },
  });

  return {
    transactions: query.data?.data || [],
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    createTransaction: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
🧪 Testing
typescript// Test transaction creation
test('should create transaction and update bank balance', async () => {
  const bankAccount = await createTestBankAccount({ current_balance: 1000 });

  await createTransaction({
    type: 'expense',
    amount: 200,
    description: 'Office supplies',
    bank_account_id: bankAccount.id,
  }, organizationId, userId);

  const updated = await getBankAccount(bankAccount.id);
  expect(updated.current_balance).toBe(800);
});

// Test bank reconciliation
test('should reconcile bank account with adjustment', async () => {
  const bankAccount = await createTestBankAccount({ current_balance: 1000 });

  const result = await reconcileBankAccount(
    bankAccount.id,
    1050, // Statement balance
    '2024-01-31'
  );

  expect(result.was_adjusted).toBe(true);
  expect(result.difference).toBe(50);
  expect(result.new_balance).toBe(1050);
});
```

## 📚 Related Documentation

- [Transaction Categories Guide](../guides/transaction-categories.md)
- [Bank Reconciliation](../guides/bank-reconciliation.md)
- [Receipt Management](../guides/receipt-management.md)

---
