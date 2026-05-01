// src/lib/invoiceFormatters.ts
/**
 * Invoice-specific formatting utilities
 * Re-exports from formatters.ts and adds invoice-specific helpers
 */

import { formatCurrency, formatDate, formatRelativeTime } from './formatters';

/**
 * Re-export common formatters
 */
export { formatCurrency, formatDate };

/**
 * Alias for formatRelativeTime for backward compatibility
 */
export const getRelativeTime = formatRelativeTime;

/**
 * Calculate days until due date
 */
export function calculateDaysUntilDue(dueDate: string | Date): {
  days: number;
  isOverdue: boolean;
  label: string;
} {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const days = Math.abs(diffDays);

  let label: string;
  if (isOverdue) {
    label = `${days} day${days !== 1 ? 's' : ''} overdue`;
  } else if (diffDays === 0) {
    label = 'Due today';
  } else if (diffDays === 1) {
    label = 'Due tomorrow';
  } else {
    label = `Due in ${days} days`;
  }

  return { days, isOverdue, label };
}

/**
 * Format invoice status for display
 */
export function formatInvoiceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    partially_paid: 'Partially Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };

  return statusMap[status] || status;
}

/**
 * Get payment progress percentage
 */
export function getPaymentProgress(amountPaid: number, totalAmount: number): number {
  if (totalAmount === 0) return 0;
  return Math.min(Math.round((amountPaid / totalAmount) * 100), 100);
}

/**
 * Format invoice number for display
 */
export function formatInvoiceNumber(invoiceNumber: string): string {
  return invoiceNumber.toUpperCase();
}

/**
 * Calculate invoice age in days
 */
export function calculateInvoiceAge(invoiceDate: string | Date): number {
  const invoice = typeof invoiceDate === 'string' ? new Date(invoiceDate) : invoiceDate;
  const today = new Date();
  const diffTime = today.getTime() - invoice.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
