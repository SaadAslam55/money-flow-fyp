// src/schemas/index.ts
/**
 * Centralized Schema Exports
 * Import all validation schemas from here for better organization
 *
 * Usage:
 * import { loginSchema, customerSchema, invoiceSchema } from '@/schemas';
 */

// Auth Schemas
export {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginFormData,
  type SignupFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from './authSchemas';

// Invoice Schemas
export {
  invoiceItemSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  paymentRecordSchema,
  recurringInvoiceSchema,
  invoiceFilterSchema,
  type InvoiceItemFormData,
  type CreateInvoiceFormData,
  type UpdateInvoiceFormData,
  type PaymentRecordFormData,
  type RecurringInvoiceFormData,
  type InvoiceFilterData,
  validateInvoiceData,
  validateInvoiceUpdate,
  validatePaymentRecord,
  validateRecurringInvoice,
  validateInvoiceFilter,
} from './invoiceSchemas';

// Customer Schemas
export {
  customerSchema,
  customerUpdateSchema,
  importCustomersSchema,
  customerFilterSchema,
  customerPortalLoginSchema,
  enablePortalAccessSchema,
  customerCsvRowSchema,
  customerStatsSchema,
  type CustomerFormData,
  type CustomerUpdateData,
  type ImportCustomersFormData,
  type CustomerFilterData,
  type CustomerPortalLoginData,
  type EnablePortalAccessData,
  type CustomerCsvRowData,
  type CustomerStatsData,
  CUSTOMER_CSV_HEADERS,
  CUSTOMER_CSV_TEMPLATE,
  validateCustomerData,
  validateCustomerCsvRow,
  validateCustomerFilter,
} from './customerSchemas';

// Product Schemas
export {
  productSchema,
  productUpdateSchema,
  stockAdjustmentSchema,
  bulkStockAdjustmentSchema,
  importProductsSchema,
  productFilterSchema,
  productCsvRowSchema,
  productCategorySchema,
  lowStockAlertSchema,
  productStatsSchema,
  type ProductFormData,
  type ProductUpdateData,
  type StockAdjustmentFormData,
  type BulkStockAdjustmentData,
  type ImportProductsFormData,
  type ProductFilterData,
  type ProductCsvRowData,
  type ProductCategoryData,
  type LowStockAlertData,
  type ProductStatsData,
  STOCK_ADJUSTMENT_REASONS,
  PRODUCT_CSV_HEADERS,
  PRODUCT_CSV_TEMPLATE,
  validateProductData,
  validateStockAdjustment,
  validateProductCsvRow,
  validateProductFilter,
  calculateProfitMargin,
  calculatePriceWithTax,
  isLowStock,
  generateDefaultSKU,
} from './productSchemas';

// Transaction Schemas
export {
  transactionSchema,
  transactionUpdateSchema,
  bankAccountSchema,
  bankAccountUpdateSchema,
  bankReconciliationSchema,
  expenseCategorySchema,
  expenseCategoryUpdateSchema,
  transactionFiltersSchema,
  bulkTransactionSchema,
  recurringTransactionSchema,
  type TransactionFormData,
  type BankAccountFormData,
  type BankReconciliationFormData,
  type ExpenseCategoryFormData,
  type TransactionFiltersData,
  type BulkTransactionFormData,
  type RecurringTransactionFormData,
} from './transactionSchemas';

// Organization Schemas
export {
  organizationProfileSchema,
  organizationUpdateSchema,
  organizationSettingsSchema,
  teamMemberInvitationSchema,
  teamMemberUpdateSchema,
  organizationSubscriptionSchema,
  type OrganizationProfileData,
  type OrganizationUpdateData,
  type OrganizationSettingsData,
  type TeamMemberInvitationData,
  type TeamMemberUpdateData,
  type OrganizationSubscriptionData,
  validateOrganizationProfile,
  validateOrganizationSettings,
  validateTeamMemberInvitation,
} from './organizationSchemas';

// Settings Schemas
export {
  userProfileSchema,
  changePasswordSchema,
  notificationSettingsSchema,
  securitySettingsSchema,
  emailSettingsSchema,
  taxSettingsSchema,
  paymentSettingsSchema,
  invoiceSettingsSchema,
  integrationSettingsSchema,
  apiKeySchema,
  webhookSchema,
  backupSettingsSchema,
  type UserProfileData,
  type ChangePasswordData,
  type NotificationSettingsData,
  type SecuritySettingsData,
  type EmailSettingsData,
  type TaxSettingsData,
  type PaymentSettingsData,
  type InvoiceSettingsData,
  type IntegrationSettingsData,
  type APIKeyData,
  type WebhookData,
  type BackupSettingsData,
  validateUserProfile,
  validateChangePassword,
  validateNotificationSettings,
  validateSecuritySettings,
  validateEmailSettings,
  validateTaxSettings,
  validatePaymentSettings,
  validateInvoiceSettings,
  validateIntegrationSettings,
  validateAPIKey,
  validateWebhook,
} from './settingsSchemas';

// Report Schemas
export {
  dateRangeSchema,
  reportFiltersSchema,
  reportExportOptionsSchema,
  scheduleReportSchema,
  customReportSchema,
  type DateRangeInput,
  type ReportFiltersInput,
  type ReportExportOptionsInput,
  type ScheduleReportInput,
  type CustomReportInput,
} from './reportSchemas';

// Payment Schemas
export {
  paymentProviderSchema,
  paymentIntegrationSchema,
  createPaymentRequestSchema,
  updatePaymentIntegrationSchema,
  type PaymentIntegrationFormData,
  type CreatePaymentRequestData,
  type UpdatePaymentIntegrationData,
} from './paymentSchemas';

