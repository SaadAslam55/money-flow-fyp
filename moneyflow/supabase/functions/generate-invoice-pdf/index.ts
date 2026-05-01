/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/generate-invoice-pdf/index.ts
/**
 * Generate Invoice PDF Edge Function
 * Generates PDF from invoice data using HTML to PDF conversion
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, corsResponse, corsErrorResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';
import { parseJsonBody, validateRequired, isValidUUID } from '../_shared/validators.ts';
import { getServiceClient } from '../_shared/auth.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface RequestBody {
  invoice_id: string;
}

/**
 * Generate HTML template for invoice
 */
function generateInvoiceHTML(invoice: any): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: bold;
      color: #111827;
    }
    .invoice-number {
      text-align: right;
    }
    .invoice-number-label {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .invoice-number-value {
      font-size: 18px;
      font-weight: bold;
      color: #111827;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .info-box {
      flex: 1;
      max-width: 45%;
    }
    .info-box h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #111827;
    }
    .info-box p {
      font-size: 12px;
      color: #4b5563;
      margin-bottom: 4px;
    }
    .dates {
      display: flex;
      gap: 30px;
      margin-bottom: 30px;
    }
    .date-item {
      font-size: 12px;
    }
    .date-label {
      color: #6b7280;
      margin-bottom: 4px;
    }
    .date-value {
      font-weight: 600;
      color: #111827;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      background-color: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }
    th {
      text-align: left;
      padding: 12px;
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 12px;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-left: auto;
      max-width: 300px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 12px;
    }
    .total-row-label {
      color: #6b7280;
    }
    .total-row-value {
      font-weight: 600;
      color: #111827;
    }
    .total-final {
      border-top: 2px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 8px;
      font-size: 16px;
      font-weight: bold;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #6b7280;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 4px;
    }
    .notes h4 {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #111827;
    }
    .notes p {
      font-size: 11px;
      color: #4b5563;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <div class="invoice-number">
      <div class="invoice-number-label">Invoice Number</div>
      <div class="invoice-number-value">${invoice.invoice_number}</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>From</h3>
      <p><strong>${invoice.organization?.name || 'Your Company'}</strong></p>
      ${invoice.organization?.address ? `<p>${invoice.organization.address}</p>` : ''}
      ${invoice.organization?.email ? `<p>${invoice.organization.email}</p>` : ''}
      ${invoice.organization?.phone ? `<p>${invoice.organization.phone}</p>` : ''}
    </div>
    <div class="info-box">
      <h3>Bill To</h3>
      <p><strong>${invoice.customer.name}</strong></p>
      ${invoice.customer.address ? `<p>${invoice.customer.address}</p>` : ''}
      ${invoice.customer.email ? `<p>${invoice.customer.email}</p>` : ''}
      ${invoice.customer.phone ? `<p>${invoice.customer.phone}</p>` : ''}
    </div>
  </div>

  <div class="dates">
    <div class="date-item">
      <div class="date-label">Invoice Date</div>
      <div class="date-value">${formatDate(invoice.invoice_date)}</div>
    </div>
    <div class="date-item">
      <div class="date-label">Due Date</div>
      <div class="date-value">${formatDate(invoice.due_date)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Tax Rate</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map((item: any, index: number) => {
        const subtotal = item.quantity * item.unit_price;
        const taxAmount = subtotal * (item.tax_rate / 100);
        const lineTotal = subtotal + taxAmount;
        return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.unit_price)}</td>
          <td class="text-right">${item.tax_rate}%</td>
          <td class="text-right">${formatCurrency(lineTotal)}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span class="total-row-label">Subtotal:</span>
      <span class="total-row-value">${formatCurrency(invoice.subtotal)}</span>
    </div>
    ${invoice.tax_amount > 0 ? `
    <div class="total-row">
      <span class="total-row-label">Tax:</span>
      <span class="total-row-value">${formatCurrency(invoice.tax_amount)}</span>
    </div>
    ` : ''}
    ${invoice.discount_amount > 0 ? `
    <div class="total-row">
      <span class="total-row-label">Discount:</span>
      <span class="total-row-value">-${formatCurrency(invoice.discount_amount)}</span>
    </div>
    ` : ''}
    <div class="total-row total-final">
      <span>Total Amount:</span>
      <span>${formatCurrency(invoice.total_amount)}</span>
    </div>
    ${invoice.amount_paid > 0 ? `
    <div class="total-row">
      <span class="total-row-label">Amount Paid:</span>
      <span class="total-row-value">${formatCurrency(invoice.amount_paid)}</span>
    </div>
    <div class="total-row">
      <span class="total-row-label">Amount Due:</span>
      <span class="total-row-value">${formatCurrency(invoice.amount_due)}</span>
    </div>
    ` : ''}
  </div>

  ${invoice.notes || invoice.terms ? `
  <div class="notes">
    ${invoice.notes ? `
    <h4>Notes</h4>
    <p>${invoice.notes}</p>
    ` : ''}
    ${invoice.terms ? `
    <h4>Payment Terms</h4>
    <p>${invoice.terms}</p>
    ` : ''}
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>This is a computer-generated invoice. No signature required.</p>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    // Authenticate user
    const authResult = await requireAuth(req, ['admin', 'manager', 'accountant', 'cashier']);
    if (authResult.error || !authResult.user) {
      return corsErrorResponse(
        authResult.error || new Error('Authentication required'),
        401,
        req
      );
    }

    const { user } = authResult;

    // Parse request body
    const { data: body, error: parseError } = await parseJsonBody<RequestBody>(req);
    if (parseError || !body) {
      return corsErrorResponse(
        parseError || new Error('Invalid request body'),
        400,
        req
      );
    }

    // Validate required fields
    const validation = validateRequired(body.invoice_id, 'invoice_id');
    if (!validation.valid) {
      return corsErrorResponse(validation.error!, 400, req);
    }

    // Validate invoice_id format
    if (!isValidUUID(body.invoice_id)) {
      return corsErrorResponse(
        new Error('Invalid invoice_id format'),
        400,
        req
      );
    }

    const supabase = getServiceClient();

    // Fetch invoice with all details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(
        `
        *,
        customer:customers(*),
        items:invoice_items(
          *,
          product:products(*)
        ),
        organization:organizations(*)
      `
      )
      .eq('id', body.invoice_id)
      .eq('organization_id', user.organization_id)
      .single();

    if (invoiceError || !invoice) {
      return corsErrorResponse(
        new Error('Invoice not found or access denied'),
        404,
        req
      );
    }

    // Generate HTML
    const html = generateInvoiceHTML(invoice);

    // For now, return HTML (can be enhanced with actual PDF generation using puppeteer or similar)
    // In production, you would use a service like:
    // - Puppeteer (headless Chrome)
    // - wkhtmltopdf
    // - PDFKit
    // - Or a third-party service like PDFShift, HTMLPDF, etc.

    // For this implementation, we'll return the HTML and let the client handle PDF generation
    // Or use a service like Resend's PDF generation

    // Store HTML in storage temporarily (optional)
    const fileName = `invoices/${body.invoice_id}/invoice.html`;
    
    // Return HTML content with proper headers
    return corsResponse(
      {
        success: true,
        html: html,
        invoice_id: body.invoice_id,
        invoice_number: invoice.invoice_number,
        message: 'Invoice HTML generated successfully',
      },
      200,
      req
    );

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return corsErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500,
      req
    );
  }
});

