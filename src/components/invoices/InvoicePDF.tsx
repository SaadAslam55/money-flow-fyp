// src/components/invoices/InvoicePDF.tsx
/**
 * InvoicePDF - Utilities and components for PDF generation
 * 
 * This file contains utilities for generating PDF invoices.
 * The actual PDF generation is handled server-side via Supabase Edge Functions.
 */

import { InvoiceTemplate } from './InvoiceTemplate';
import type { InvoiceWithDetails } from '@/types/invoice.types';

/**
 * Generate PDF from invoice data (client-side preview)
 * Note: Actual PDF generation should be done server-side
 */
export function generateInvoicePDFPreview(invoice: InvoiceWithDetails) {
  // This is a placeholder for client-side PDF preview
  // Actual PDF generation should use server-side rendering
  return <InvoiceTemplate invoice={invoice} showStatus={false} />;
}

/**
 * Print invoice as PDF
 */
export function printInvoice(invoice: InvoiceWithDetails) {
  // Open print dialog
  window.print();
}

/**
 * Export invoice to PDF (triggers server-side generation)
 */
export function exportInvoiceToPDF(_invoiceId: string): Promise<void> {
  // This should call the Supabase Edge Function
  // Implementation is in invoiceApi.downloadInvoicePDF
  return Promise.reject(new Error('Use invoiceApi.downloadInvoicePDF instead'));
}

