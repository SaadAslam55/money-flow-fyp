// src/constants/messages.ts
/**
 * UI Messages and User-Facing Text
 * Centralized message constants for consistent messaging across the application
 */

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  // General
  saved: 'Changes saved successfully',
  created: 'Created successfully',
  updated: 'Updated successfully',
  deleted: 'Deleted successfully',
  
  // Invoices
  invoiceCreated: 'Invoice created successfully',
  invoiceUpdated: 'Invoice updated successfully',
  invoiceSent: 'Invoice sent successfully',
  invoicePaid: 'Payment recorded successfully',
  invoiceDeleted: 'Invoice deleted successfully',
  
  // Customers
  customerCreated: 'Customer added successfully',
  customerUpdated: 'Customer updated successfully',
  customerDeleted: 'Customer deleted successfully',
  
  // Products
  productCreated: 'Product added successfully',
  productUpdated: 'Product updated successfully',
  productDeleted: 'Product deleted successfully',
  stockAdjusted: 'Stock adjusted successfully',
  
  // Transactions
  transactionCreated: 'Transaction recorded successfully',
  transactionUpdated: 'Transaction updated successfully',
  transactionDeleted: 'Transaction deleted successfully',
  
  // Team
  memberInvited: 'Team member invited successfully',
  memberRemoved: 'Team member removed successfully',
  roleUpdated: 'Role updated successfully',
  
  // Settings
  settingsSaved: 'Settings saved successfully',
  profileUpdated: 'Profile updated successfully',
  
  // File operations
  fileUploaded: 'File uploaded successfully',
  fileDeleted: 'File deleted successfully',
  exportCompleted: 'Export completed successfully',
  
  // Authentication
  loggedIn: 'Logged in successfully',
  loggedOut: 'Logged out successfully',
  passwordChanged: 'Password changed successfully',
  emailVerified: 'Email verified successfully',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  // General
  generic: 'Something went wrong. Please try again.',
  networkError: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validationError: 'Please check your input and try again.',
  
  // Invoices
  invoiceNotFound: 'Invoice not found',
  invoiceDeleteError: 'Cannot delete invoice. It may have payments recorded.',
  invoiceSendError: 'Failed to send invoice. Please try again.',
  
  // Customers
  customerNotFound: 'Customer not found',
  customerDeleteError: 'Cannot delete customer with existing invoices.',
  
  // Products
  productNotFound: 'Product not found',
  productDeleteError: 'Cannot delete product with existing transactions.',
  stockInsufficient: 'Insufficient stock available',
  
  // Transactions
  transactionNotFound: 'Transaction not found',
  transactionDeleteError: 'Cannot delete reconciled transaction.',
  
  // Authentication
  invalidCredentials: 'Invalid email or password',
  sessionExpired: 'Your session has expired. Please log in again.',
  emailNotVerified: 'Please verify your email address to continue.',
  
  // File operations
  fileUploadError: 'Failed to upload file. Please try again.',
  fileSizeExceeded: 'File size exceeds the maximum allowed size.',
  invalidFileType: 'Invalid file type. Please upload a supported file.',
  
  // Validation
  requiredField: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  invalidAmount: 'Please enter a valid amount',
  invalidDate: 'Please enter a valid date',
} as const;

/**
 * Warning messages
 */
export const WARNING_MESSAGES = {
  // General
  unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
  deleteConfirmation: 'Are you sure you want to delete this item? This action cannot be undone.',
  
  // Invoices
  invoiceUnpaid: 'This invoice has unpaid amounts.',
  invoiceOverdue: 'This invoice is overdue.',
  
  // Products
  lowStock: 'Product is running low on stock',
  outOfStock: 'Product is out of stock',
  
  // Transactions
  unreconciledTransaction: 'This transaction has not been reconciled.',
  
  // Subscription
  subscriptionExpiring: 'Your subscription is expiring soon.',
  subscriptionExpired: 'Your subscription has expired.',
  limitReached: 'You have reached your plan limit.',
} as const;

/**
 * Info messages
 */
export const INFO_MESSAGES = {
  // General
  loading: 'Loading...',
  processing: 'Processing...',
  saving: 'Saving...',
  
  // Invoices
  invoiceDraft: 'This invoice is still in draft mode.',
  invoiceSent: 'Invoice has been sent to the customer.',
  
  // Reports
  reportGenerating: 'Generating report... This may take a few moments.',
  reportReady: 'Your report is ready for download.',
  
  // Data
  noData: 'No data available',
  noResults: 'No results found',
  emptyState: 'Get started by creating your first item.',
} as const;

/**
 * Helper function to get message by key
 */
export function getMessage(
  category: 'success' | 'error' | 'warning' | 'info',
  key: string
): string {
  const messages = {
    success: SUCCESS_MESSAGES,
    error: ERROR_MESSAGES,
    warning: WARNING_MESSAGES,
    info: INFO_MESSAGES,
  };
  
  return (messages[category] as Record<string, string>)[key] || key;
}

/**
 * Type exports
 */
export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type WarningMessageKey = keyof typeof WARNING_MESSAGES;
export type InfoMessageKey = keyof typeof INFO_MESSAGES;

