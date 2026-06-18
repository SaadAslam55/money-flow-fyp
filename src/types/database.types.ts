// src/types/database.types.ts
/**
 * Database Type Definitions
 *
 * This file contains all database table types and enums.
 * These types should match your Supabase database schema.
 *
 * Note: In production, you can auto-generate these types using:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================
// ENUMS
// ============================================

/**
 * Invoice status values
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

/**
 * Payment method values
 */
export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'card'
  | 'check'
  | 'upi'
  | 'other'
  | 'jazzcash'
  | 'easypaisa'
  | 'raast';

/**
 * Payment provider values
 */
export type PaymentProvider = 'jazzcash' | 'easypaisa' | 'raast';

/**
 * Payment transaction status values
 */
export type PaymentTransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

/**
 * Transaction type values
 */
export type TransactionType = 'income' | 'expense' | 'transfer';

/**
 * Bank account type values
 */
export type BankAccountType = 'checking' | 'savings' | 'credit_card' | 'cash';

/**
 * User role values
 */
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'accountant' | 'cashier' | 'viewer';

/**
 * Subscription plan values
 */
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

/**
 * Subscription status values
 */
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'suspended' | 'trialing';

// ============================================
// DATABASE TABLE TYPES
// ============================================

/**
 * Organizations table
 */
export interface Organization {
  id: string;
  name: string;
  subdomain?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  logo_url?: string | null;
  tax_id?: string | null;
  fiscal_year_start: string;
  currency: string;
  timezone: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  payment_provider?: PaymentProvider | null;
  payment_customer_id?: string | null;
  payment_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User preferences stored in JSONB
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  currencyDisplay?: 'symbol' | 'code' | 'name';
  numberFormat?: string;
  fontSize?: number;
  compactMode?: boolean;
  animations?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
}

/**
 * Users table
 */
export interface User {
  id: string;
  organization_id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  is_active: boolean;
  last_login?: string | null;
  preferences?: UserPreferences | null;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

/**
 * Customers table
 */
export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  tax_id?: string | null;
  credit_limit: number;
  outstanding_balance: number;
  portal_access: boolean;
  portal_password_hash?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Products table
 */
export interface Product {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  unit_price: number;
  cost_price?: number | null;
  tax_rate: number;
  is_service: boolean;
  track_inventory: boolean;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Invoices table
 */
export interface Invoice {
  id: string;
  organization_id: string;
  customer_id?: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  notes?: string | null;
  terms?: string | null;
  footer?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: InvoiceItem[];
  created_by_user?: User;
}

/**
 * Invoice items table
 */
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  created_at: string;
  product?: Product;
}

/**
 * Transactions table
 */
export interface Transaction {
  id: string;
  organization_id: string;
  type: TransactionType;
  category_id?: string | null;
  amount: number;
  date: string;
  description?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  payment_method?: PaymentMethod | null;
  bank_account_id?: string | null;
  receipt_url?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
  bank_account?: BankAccount;
  created_by_user?: User;
}

/**
 * Bank accounts table
 */
export interface BankAccount {
  id: string;
  organization_id: string;
  account_name: string;
  bank_name?: string | null;
  account_number?: string | null;
  account_type: BankAccountType;
  opening_balance: number;
  current_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Expense categories table
 */
export interface ExpenseCategory {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  parent_category_id?: string | null;
  is_active: boolean;
  created_at: string;
  parent_category?: ExpenseCategory;
  children?: ExpenseCategory[];
}

/**
 * Audit logs table
 */
export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  user?: User;
}

// ============================================
// FILTER TYPES
// ============================================

/**
 * Invoice filters
 */
export interface InvoiceFilters {
  status?: InvoiceStatus[];
  customer_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

/**
 * Transaction filters
 */
export interface TransactionFilters {
  type?: TransactionType[];
  category_id?: string[];
  bank_account_id?: string[];
  payment_method?: PaymentMethod[];
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}

/**
 * Product filters
 */
export interface ProductFilters {
  category?: string;
  lowStock?: boolean;
  isActive?: boolean;
  search?: string;
}

/**
 * Customer filters
 */
export interface CustomerFilters {
  search?: string;
  hasOutstanding?: boolean;
  hasPortalAccess?: boolean;
}

// ============================================
// DATABASE TYPE UTILITIES
// ============================================

/**
 * Payment integrations table
 */
export interface PaymentIntegration {
  id: string;
  organization_id: string;
  provider: PaymentProvider;
  account_name: string;
  api_key_encrypted?: string | null;
  api_secret_encrypted?: string | null;
  merchant_id?: string | null;
  integrity_salt_encrypted?: string | null;
  store_id?: string | null;
  hash_key_encrypted?: string | null;
  raast_id?: string | null;
  iban?: string | null;
  is_active: boolean;
  is_default: boolean;
  currency: string;
  test_mode: boolean;
  transaction_fee_percentage: number;
  transaction_fee_fixed: number;
  webhook_url?: string | null;
  webhook_secret_encrypted?: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Payment transactions table
 */
export interface PaymentTransaction {
  id: string;
  organization_id: string;
  payment_integration_id?: string | null;
  invoice_id?: string | null;
  customer_id?: string | null;
  transaction_reference: string;
  provider_transaction_id?: string | null;
  provider_order_id?: string | null;
  amount: number;
  currency: string;
  status: PaymentTransactionStatus;
  payment_method: PaymentProvider;
  fee_amount: number;
  net_amount: number;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_name?: string | null;
  payment_date?: string | null;
  completed_at?: string | null;
  expired_at?: string | null;
  failure_reason?: string | null;
  failure_code?: string | null;
  metadata: Record<string, unknown>;
  return_url?: string | null;
  cancel_url?: string | null;
  created_at: string;
  updated_at: string;
  payment_integration?: PaymentIntegration;
  invoice?: Invoice;
  customer?: Customer;
}

/**
 * Payment webhooks table
 */
export interface PaymentWebhook {
  id: string;
  provider: PaymentProvider;
  event_type: string;
  transaction_reference?: string | null;
  payment_transaction_id?: string | null;
  payload: Record<string, unknown>;
  headers?: Record<string, unknown> | null;
  signature?: string | null;
  processed: boolean;
  processed_at?: string | null;
  error_message?: string | null;
  retry_count: number;
  created_at: string;
  payment_transaction?: PaymentTransaction;
}

/**
 * Super admin payment accounts table
 */
export interface SuperAdminPaymentAccount {
  id: string;
  provider: PaymentProvider;
  account_identifier: string;
  display_name: string;
  api_key_encrypted?: string | null;
  api_secret_encrypted?: string | null;
  merchant_id?: string | null;
  integrity_salt_encrypted?: string | null;
  store_id?: string | null;
  hash_key_encrypted?: string | null;
  raast_id?: string | null;
  iban?: string | null;
  is_active: boolean;
  priority: number;
  daily_limit?: number | null;
  daily_usage: number;
  monthly_limit?: number | null;
  monthly_usage: number;
  last_reset_date: string;
  settings: Record<string, unknown>;
  test_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceSettings {
  organization_id: string;
  invoice_prefix: string;
  invoice_starting_number: number;
  default_terms?: string | null;
  default_notes?: string | null;
  default_tax_rate: number;
  payment_terms_days: number;
  late_fee_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface TaxSettings {
  organization_id: string;
  default_tax_rate: number;
  tax_name: string;
  tax_registration_number?: string | null;
  tax_inclusive_pricing: boolean;
  show_tax_on_invoices: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSettings {
  organization_id: string;
  email_service?: 'sendgrid' | 'resend' | 'smtp' | null;
  email_api_key?: string | null;
  sms_service?: 'twilio' | 'other' | null;
  sms_api_key?: string | null;
  accounting_software?: 'quickbooks' | 'xero' | 'sage' | null;
  accounting_api_key?: string | null;
  crm_integration?: 'salesforce' | 'hubspot' | null;
  crm_api_key?: string | null;
  payment_gateway?: 'jazzcash' | 'easypaisa' | 'raast' | 'sadapay' | 'nayapay' | null;
  payment_api_key?: string | null;
  payment_merchant_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface APIKey {
  id: string;
  organization_id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  is_active: boolean;
  last_used_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  organization_id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: Record<string, boolean | undefined> & {
    invoices?: boolean;
    payments?: boolean;
    low_stock?: boolean;
  };
  sms_notifications: Record<string, boolean | undefined> & {
    invoices?: boolean;
    payments?: boolean;
  };
  in_app_notifications: Record<string, boolean | undefined> & {
    invoices?: boolean;
    payments?: boolean;
    low_stock?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  organization_id: string;
  report_type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  is_active: boolean;
  last_run_at?: string | null;
  next_run_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Extract table name from type
 */
export type TableName =
  | 'organizations'
  | 'users'
  | 'customers'
  | 'products'
  | 'invoices'
  | 'invoice_items'
  | 'transactions'
  | 'bank_accounts'
  | 'expense_categories'
  | 'audit_logs'
  | 'payment_integrations'
  | 'payment_transactions'
  | 'payment_webhooks'
  | 'super_admin_payment_accounts'
  | 'invoice_settings'
  | 'tax_settings'
  | 'integration_settings'
  | 'api_keys'
  | 'webhooks'
  | 'notification_preferences'
  | 'scheduled_reports';

/**
 * Type helper for database insert (omits auto-generated fields)
 */
export type Insert<T> = T extends { id: string; created_at: string; updated_at: string }
  ? Omit<T, 'id' | 'created_at' | 'updated_at'>
  : T extends { id: string; created_at: string }
    ? Omit<T, 'id' | 'created_at'>
    : T extends { created_at: string; updated_at: string }
      ? Omit<T, 'created_at' | 'updated_at'>
      : T extends { created_at: string }
        ? Omit<T, 'created_at'>
        : Omit<T, never>;

/**
 * Type helper for database update (makes all fields optional except primary key)
 */
export type Update<T> = T extends { id: string }
  ? Partial<Omit<T, 'id' | 'created_at'>> & { id?: string }
  : T extends { organization_id: string }
    ? Partial<Omit<T, 'organization_id' | 'created_at'>> & { organization_id?: string }
    : T extends { user_id: string }
      ? Partial<Omit<T, 'user_id' | 'created_at'>> & { user_id?: string }
      : Partial<Omit<T, 'created_at'>>;

/**
 * Type helper for database select with relations
 */
export type WithRelations<T, R extends Record<string, unknown>> = T & R;

/**
 * Database schema type for Supabase client
 * Maps all tables and their row types with proper Insert/Update types
 */
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Insert<Organization>;
        Update: Update<Organization>;
        Relationships: [];
      };
      users: {
        Row: User;
        Insert: Insert<User>;
        Update: Update<User>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Insert<Customer>;
        Update: Update<Customer>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Insert<Product>;
        Update: Update<Product>;
        Relationships: [];
      };
      invoices: {
        Row: Invoice;
        Insert: Insert<Invoice>;
        Update: Update<Invoice>;
        Relationships: [];
      };
      invoice_items: {
        Row: InvoiceItem;
        Insert: Omit<InvoiceItem, 'id' | 'created_at'>;
        Update: Partial<Omit<InvoiceItem, 'id' | 'created_at'>> & { id?: string };
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: Insert<Transaction>;
        Update: Update<Transaction>;
        Relationships: [];
      };
      bank_accounts: {
        Row: BankAccount;
        Insert: Insert<BankAccount>;
        Update: Update<BankAccount>;
        Relationships: [];
      };
      expense_categories: {
        Row: ExpenseCategory;
        Insert: Omit<ExpenseCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<ExpenseCategory, 'id' | 'created_at'>> & { id?: string };
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>> & { id?: string };
        Relationships: [];
      };
      payment_integrations: {
        Row: PaymentIntegration;
        Insert: Insert<PaymentIntegration>;
        Update: Update<PaymentIntegration>;
        Relationships: [];
      };
      payment_transactions: {
        Row: PaymentTransaction;
        Insert: Insert<PaymentTransaction>;
        Update: Update<PaymentTransaction>;
        Relationships: [];
      };
      payment_webhooks: {
        Row: PaymentWebhook;
        Insert: Omit<PaymentWebhook, 'id' | 'created_at'>;
        Update: Partial<Omit<PaymentWebhook, 'id' | 'created_at'>> & { id?: string };
        Relationships: [];
      };
      super_admin_payment_accounts: {
        Row: SuperAdminPaymentAccount;
        Insert: Insert<SuperAdminPaymentAccount>;
        Update: Update<SuperAdminPaymentAccount>;
        Relationships: [];
      };
      invoice_settings: {
        Row: InvoiceSettings;
        Insert: Omit<InvoiceSettings, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InvoiceSettings, 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      tax_settings: {
        Row: TaxSettings;
        Insert: Omit<TaxSettings, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TaxSettings, 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      integration_settings: {
        Row: IntegrationSettings;
        Insert: Omit<IntegrationSettings, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IntegrationSettings, 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      api_keys: {
        Row: APIKey;
        Insert: Insert<APIKey>;
        Update: Update<APIKey>;
        Relationships: [];
      };
      webhooks: {
        Row: Webhook;
        Insert: Insert<Webhook>;
        Update: Update<Webhook>;
        Relationships: [];
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: Omit<NotificationPreferences, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NotificationPreferences, 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      scheduled_reports: {
        Row: ScheduledReport;
        Insert: Insert<ScheduledReport>;
        Update: Update<ScheduledReport>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      transaction_type: TransactionType;
      payment_method: PaymentMethod;
      payment_provider: PaymentProvider;
      payment_transaction_status: PaymentTransactionStatus;
      user_role: UserRole;
      invoice_status: InvoiceStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// ============================================
// INSERT TYPES (for Supabase insert/update operations)
// ============================================

type OptionalAutoFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Organization insert type — id, created_at, updated_at are auto-generated */
export type OrganizationInsert = OptionalAutoFields<Organization, 'id' | 'created_at' | 'updated_at' | 'fiscal_year_start' | 'currency' | 'timezone' | 'subscription_plan' | 'subscription_status'>;

/** User insert type — id, created_at, updated_at are auto-generated */
export type UserInsert = OptionalAutoFields<User, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'organization'>;

/** Customer insert type — id, created_at, updated_at are auto-generated */
export type CustomerInsert = OptionalAutoFields<Customer, 'id' | 'created_at' | 'updated_at' | 'credit_limit' | 'outstanding_balance' | 'portal_access'>;

/** Product insert type — id, created_at, updated_at are auto-generated */
export type ProductInsert = OptionalAutoFields<Product, 'id' | 'created_at' | 'updated_at' | 'is_active'>;

/** Invoice insert type — id, created_at, updated_at are auto-generated */
export type InvoiceInsert = OptionalAutoFields<Invoice, 'id' | 'created_at' | 'updated_at'>;
