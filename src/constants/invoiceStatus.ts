// src/constants/invoiceStatus.ts
/**
 * Invoice-specific status and configuration constants
 * 
 * Note: INVOICE_STATUS and PAYMENT_METHODS are also available in status.ts
 * with a more comprehensive format. This file is kept for backward compatibility
 * and invoice-specific constants. Consider migrating to status.ts for new code.
 */

export const INVOICE_STATUS = {
  draft: {
    label: 'Draft',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    description: 'Invoice is being prepared',
  },
  sent: {
    label: 'Sent',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    description: 'Invoice has been sent to customer',
  },
  paid: {
    label: 'Paid',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    description: 'Invoice has been fully paid',
  },
  partially_paid: {
    label: 'Partially Paid',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    description: 'Invoice has been partially paid',
  },
  overdue: {
    label: 'Overdue',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    description: 'Payment is past due date',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
    description: 'Invoice has been cancelled',
  },
} as const;

export const PAYMENT_METHODS = {
  cash: {
    label: 'Cash',
    icon: 'DollarSign',
    description: 'Cash payment',
  },
  bank_transfer: {
    label: 'Bank Transfer',
    icon: 'Building',
    description: 'Direct bank transfer',
  },
  card: {
    label: 'Card',
    icon: 'CreditCard',
    description: 'Credit/Debit card',
  },
  check: {
    label: 'Check',
    icon: 'FileText',
    description: 'Check payment',
  },
  upi: {
    label: 'Upaisa',
    icon: 'Smartphone',
    description: 'Upaisa payment',
  },
  other: {
    label: 'Other',
    icon: 'MoreHorizontal',
    description: 'Other payment method',
  },
} as const;

export const INVOICE_ACTIONS = {
  view: {
    label: 'View Details',
    icon: 'Eye',
    description: 'View invoice details',
    permission: 'view_invoice',
  },
  edit: {
    label: 'Edit',
    icon: 'Edit',
    description: 'Edit invoice',
    permission: 'edit_invoice',
    disabledStatuses: ['paid', 'cancelled'],
  },
  send: {
    label: 'Send',
    icon: 'Send',
    description: 'Send invoice to customer',
    permission: 'send_invoice',
    disabledStatuses: ['cancelled'],
  },
  download: {
    label: 'Download PDF',
    icon: 'Download',
    description: 'Download invoice as PDF',
    permission: 'view_invoice',
  },
  duplicate: {
    label: 'Duplicate',
    icon: 'Copy',
    description: 'Create a copy of this invoice',
    permission: 'create_invoice',
  },
  recordPayment: {
    label: 'Record Payment',
    icon: 'DollarSign',
    description: 'Record a payment for this invoice',
    permission: 'record_payment',
    disabledStatuses: ['paid', 'cancelled'],
  },
  cancel: {
    label: 'Cancel',
    icon: 'X',
    description: 'Cancel this invoice',
    permission: 'delete_invoice',
    disabledStatuses: ['paid', 'cancelled'],
  },
  delete: {
    label: 'Delete',
    icon: 'Trash2',
    description: 'Delete this invoice',
    permission: 'delete_invoice',
    disabledStatuses: ['paid'],
  },
} as const;

export const DISCOUNT_TYPES = {
  percentage: {
    label: 'Percentage (%)',
    symbol: '%',
    description: 'Discount as a percentage of subtotal',
  },
  fixed: {
    label: 'Fixed Amount',
    symbol: 'Rs',
    description: 'Fixed discount amount',
  },
} as const;

export const TAX_RATES = {
  standard: {
    label: 'Standard Rate (17%)',
    rate: 17,
    description: 'Pakistan standard GST rate',
  },
  reduced: {
    label: 'Reduced Rate (5%)',
    rate: 5,
    description: 'Reduced GST rate',
  },
  zero: {
    label: 'Zero Rated (0%)',
    rate: 0,
    description: 'Zero rated goods/services',
  },
  exempt: {
    label: 'Exempt',
    rate: 0,
    description: 'Tax exempt goods/services',
  },
} as const;

// Default invoice terms
export const DEFAULT_INVOICE_TERMS = `Payment Terms:
- Payment is due within 30 days of invoice date
- Late payments may incur additional charges
- Please include invoice number with payment

Bank Details:
- Bank: [Your Bank Name]
- Account: [Account Number]
- IBAN: [IBAN Number]

Thank you for your business!`;

// Default invoice notes
export const DEFAULT_INVOICE_NOTES = `Thank you for your business! We appreciate your trust in our services.

For any queries regarding this invoice, please contact us at:
Email: accounts@yourbusiness.com
Phone: +92-XXX-XXXXXXX`;

// Invoice number formats
export const INVOICE_NUMBER_FORMATS = {
  default: 'INV-{YYYY}-{####}', // INV-2024-0001
  simple: 'INV{####}',           // INV0001
  dated: '{YYYY}{MM}-{####}',    // 202411-0001
  prefixed: '{PREFIX}-{####}',   // SALES-0001
} as const;

// Validation rules
export const INVOICE_VALIDATION = {
  minItems: 1,
  maxItems: 100,
  minQuantity: 0.01,
  maxQuantity: 999999,
  minPrice: 0,
  maxPrice: 999999999,
  minTaxRate: 0,
  maxTaxRate: 100,
  minDiscount: 0,
  maxDiscount: 100, // percentage
  maxNoteLength: 1000,
  maxTermsLength: 2000,
  maxDescriptionLength: 500,
} as const;

// Invoice filters
export const INVOICE_FILTER_OPTIONS = {
  status: [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  dateRanges: [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ],
  sortOptions: [
    { value: 'date_desc', label: 'Date (Newest First)' },
    { value: 'date_asc', label: 'Date (Oldest First)' },
    { value: 'amount_desc', label: 'Amount (High to Low)' },
    { value: 'amount_asc', label: 'Amount (Low to High)' },
    { value: 'customer_asc', label: 'Customer (A-Z)' },
    { value: 'customer_desc', label: 'Customer (Z-A)' },
    { value: 'status', label: 'Status' },
  ],
} as const;

// Export formats
export const EXPORT_FORMATS = {
  pdf: {
    label: 'PDF Document',
    extension: '.pdf',
    mimeType: 'application/pdf',
    icon: 'FileText',
  },
  excel: {
    label: 'Excel Spreadsheet',
    extension: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    icon: 'Table',
  },
  csv: {
    label: 'CSV File',
    extension: '.csv',
    mimeType: 'text/csv',
    icon: 'FileText',
  },
} as const;