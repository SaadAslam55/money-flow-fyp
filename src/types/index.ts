// src/types/index.ts
/**
 * Centralized Type Exports
 *
 * This file re-exports all types from their respective modules
 * for convenient importing throughout the application.
 *
 * @module Types
 *
 * @example
 * ```typescript
 * // Import from centralized index
 * import type { User, Invoice, InvoiceStatus } from '@/types';
 *
 * // Import from specific files for better tree-shaking
 * import type { InvoiceStatus } from '@/types/database.types';
 * ```
 *
 * @see {@link ./README.md | Types Documentation}
 */

// ============================================================================
// Database Types
// ============================================================================
/**
 * Database table types, enums, and utilities
 *
 * @example
 * ```typescript
 * import type { User, Invoice, InvoiceStatus, Insert, Update } from '@/types';
 * ```
 */
export type {
  // Enums
  InvoiceStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentTransactionStatus,
  TransactionType,
  BankAccountType,
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
  // Tables
  Organization,
  User,
  Customer,
  Product,
  Invoice,
  InvoiceItem,
  Transaction,
  BankAccount,
  ExpenseCategory,
  AuditLog,
  PaymentIntegration,
  PaymentTransaction,
  PaymentWebhook,
  SuperAdminPaymentAccount,
  // Filters
  InvoiceFilters,
  TransactionFilters,
  ProductFilters,
  CustomerFilters,
  // Utilities
  TableName,
  Insert,
  Update,
  WithRelations,
  Database,
} from './database.types';

// ============================================================================
// API Types
// ============================================================================
/**
 * API request/response types for all endpoints
 *
 * @example
 * ```typescript
 * import type { CreateInvoiceRequest, InvoiceResponse, PaginationParams } from '@/types';
 * ```
 */
export type {
  // Request DTOs
  CreateInvoiceRequest,
  CreateInvoiceItemRequest,
  UpdateInvoiceRequest,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateProductRequest,
  UpdateProductRequest,
  CreateTransactionRequest,
  RecordPaymentRequest,
  AdjustStockRequest,
  SendInvoiceRequest,
  GenerateReportRequest,
  // Response types
  InvoiceResponse,
  InvoiceItemResponse,
  CustomerResponse,
  ProductResponse,
  // Pagination & Sorting
  PaginationParams,
  SortParams,
  ListRequestParams,
  // File upload
  FileUploadResponse,
  BulkImportResult,
} from './api.types';

// ============================================================================
// Auth Types
// ============================================================================
/**
 * Authentication and authorization types
 *
 * @example
 * ```typescript
 * import type { SignInRequest, AuthSession, PermissionCheck } from '@/types';
 * ```
 */
export type {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  AuthSession,
  SessionState,
  PermissionCheck,
  RBAC,
  Permission,
  AuthState,
  OAuthProvider,
  OAuthSignInRequest,
  OAuthSignInResponse,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  AuthErrorCode,
  AuthError,
} from './auth.types';

// ============================================================================
// Subscription Types
// ============================================================================
/**
 * Subscription and billing types
 *
 * @example
 * ```typescript
 * import type { Subscription, PlanDetails, CheckoutSessionRequest } from '@/types';
 * ```
 */
export type {
  Subscription,
  PlanDetails,
  PlanFeature,
  PlanLimits,
  SubscriptionUsage,
  BillingInvoice,
  PaymentMethod as SubscriptionPaymentMethod,
  BillingAddress,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  UpdatePlanRequest,
  UpdatePlanResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  ResumeSubscriptionRequest,
  ResumeSubscriptionResponse,
  StripeWebhookEvent,
  WebhookPayload,
  TrialInfo,
  PlanComparison,
} from './subscription.types';

// ============================================================================
// Invoice Types
// ============================================================================
/**
 * Invoice-specific types for forms and calculations
 *
 * @example
 * ```typescript
 * import type { InvoiceFormData, InvoiceWithDetails, PaymentRecord } from '@/types';
 * ```
 */
export type {
  InvoiceFormData,
  InvoiceItemFormData,
  InvoiceWithDetails,
  InvoiceItemWithProduct,
  PaymentRecord,
  InvoiceCalculation,
  InvoiceItemCalculation,
} from './invoice.types';

// ============================================================================
// Dashboard Types
// ============================================================================
/**
 * Dashboard statistics and chart data types
 *
 * @example
 * ```typescript
 * import type { DashboardStats, ChartData, RecentInvoice } from '@/types';
 * ```
 */
export type {
  DashboardStats,
  ChartData,
  RecentInvoice,
  TopCustomer,
  ActivityItem,
} from './dashboard.types';

// ============================================================================
// Report Types
// ============================================================================
/**
 * Financial report data types
 *
 * @example
 * ```typescript
 * import type { ProfitLossData, SalesReportData, ReportFilters } from '@/types';
 * ```
 */
export type {
  DateRange,
  ProfitLossData,
  BalanceSheetData,
  CashFlowData,
  SalesReportData,
  ExpenseReportData,
  TaxReportData,
  CustomerReportData,
  ProductReportData,
  ReportFilters,
  ReportExportOptions,
  ReportType,
} from './report.types';

// ============================================================================
// UI Types
// ============================================================================
/**
 * UI component and form types
 *
 * @example
 * ```typescript
 * import type { FormState, TableState, DialogState, ToastOptions } from '@/types';
 * ```
 */
export type {
  FormFieldState,
  FormState,
  ValidationResult,
  TableColumn,
  TableSort,
  TableFilter,
  TablePagination,
  TableState,
  DialogState,
  ConfirmDialogOptions,
  ToastType,
  ToastOptions,
  Notification,
  LoadingState,
  AsyncState,
  SearchState,
  FilterOption,
  FilterGroup,
  PaginationState,
  PaginationControls,
  FileUploadState,
  FileUploadOptions,
  ChartDataPoint,
  ChartSeries,
  ChartConfig,
  ThemeMode,
  ThemeConfig,
  SidebarState,
  Breakpoint,
  ResponsiveValue,
  NavItem,
  BreadcrumbItem,
  DropzoneState,
  DateRange as UIDateRange,
  DatePickerMode,
} from './ui.types';

// ============================================================================
// Model Types
// ============================================================================
/**
 * Domain model types with computed properties
 *
 * @example
 * ```typescript
 * import type { User as UserModel, Organization as OrganizationModel } from '@/types';
 * ```
 */
export type {
  User as UserModel,
  Organization as OrganizationModel,
  Customer as CustomerModel,
  Product as ProductModel,
  Invoice as InvoiceModel,
} from './models.types';

// ============================================================================
// Payment Types
// ============================================================================
/**
 * Payment integration and transaction types
 *
 * @example
 * ```typescript
 * import type { PaymentIntegrationConfig, PaymentStatistics } from '@/types';
 * ```
 */
export type {
  PaymentIntegrationConfig,
  PaymentInitiationRequest,
  PaymentTransactionFilters,
  PaymentStatistics,
} from './payment.types';

// ============================================================================
// DTO Types
// ============================================================================
/**
 * Data Transfer Objects for API requests
 *
 * @example
 * ```typescript
 * import type { CreateInvoiceDto, UpdateCustomerDto } from '@/types';
 * ```
 */
export type {
  // Invoice DTOs
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreateInvoiceItemDto,
  UpdateInvoiceItemDto,
  // Customer DTOs
  CreateCustomerDto,
  UpdateCustomerDto,
  // Product DTOs
  CreateProductDto,
  UpdateProductDto,
  // Transaction DTOs
  CreateTransactionDto,
  UpdateTransactionDto,
  // User DTOs
  CreateUserDto,
  UpdateUserDto,
  // Organization DTOs
  CreateOrganizationDto,
  UpdateOrganizationDto,
  // Auth DTOs
  LoginDto,
  SignupDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  // Report DTOs
  ReportFiltersDto,
  ExportDto,
} from './dto';

// ============================================================================
// External Types
// ============================================================================
/**
 * Re-export commonly used external types for convenience
 */
export type { Session } from '@supabase/supabase-js';
