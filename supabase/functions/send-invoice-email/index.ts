/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/send-invoice-email/index.ts
/**
 * Send Invoice Email Edge Function
 * Sends invoice via email using Resend API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, corsResponse, corsErrorResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';
import { parseJsonBody, validateRequired, isValidUUID, isValidEmail } from '../_shared/validators.ts';
import { getServiceClient } from '../_shared/auth.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const EMAIL_DOMAIN = Deno.env.get('EMAIL_DOMAIN') || 'moneyflow.app';
const APP_URL = Deno.env.get('APP_URL') || 'https://moneyflow.app';

interface RequestBody {
  invoice_id: string;
  recipient_email?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    // Authenticate user
    const authResult = await requireAuth(req, ['admin', 'manager', 'accountant']);
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

    // Validate recipient_email if provided
    if (body.recipient_email && !isValidEmail(body.recipient_email)) {
      return corsErrorResponse(
        new Error('Invalid recipient_email format'),
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

    // Use recipient_email if provided, otherwise use customer email
    const toEmail = body.recipient_email || (invoice.customer as { email?: string })?.email;
    if (!toEmail) {
      return corsErrorResponse(
        new Error('No recipient email provided'),
        400,
        req
      );
    }

    // Validate recipient email format
    if (!isValidEmail(toEmail)) {
      return corsErrorResponse(
        new Error('Invalid recipient email format'),
        400,
        req
      );
    }

    // Generate email HTML
    const emailHtml = generateInvoiceEmailHtml(invoice, body.message);

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${(invoice.organization as { name: string }).name} <invoices@${EMAIL_DOMAIN}>`,
        to: [toEmail],
        subject: `Invoice ${invoice.invoice_number} from ${(invoice.organization as { name: string }).name}`,
        html: emailHtml,
        // TODO: Attach PDF
        // attachments: [{
        //   filename: `invoice-${invoice.invoice_number}.pdf`,
        //   content: pdfBase64
        // }]
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      console.error('Resend API error:', error);
      return corsErrorResponse(
        new Error(`Email send failed: ${JSON.stringify(error)}`),
        500,
        req
      );
    }

    const emailData = await emailResponse.json();

    // Update invoice status if it's draft
    if (invoice.status === 'draft') {
      await supabase
        .from('invoices')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('id', body.invoice_id);
    }

    // Log the send in audit_logs
    await supabase.from('audit_logs').insert({
      organization_id: invoice.organization_id,
      user_id: user.id,
      action: 'sent_invoice',
      entity_type: 'invoice',
      entity_id: body.invoice_id,
      new_values: { recipient_email: toEmail, email_id: emailData.id },
    });

    return corsResponse(
      {
        success: true,
        email_id: emailData.id,
        message: 'Invoice sent successfully',
      },
      200,
      req
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return corsErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500,
      req
    );
  }
});

/**
 * Generate HTML email template for invoice
 */
function generateInvoiceEmailHtml(invoice: any, customMessage?: string): string {
  const formatCurrency = (amount: number) => {
    return `${invoice.organization.currency || 'PKR'} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status !== 'paid';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #6366F1;
    }
    .header h1 {
      color: #6366F1;
      margin: 0;
      font-size: 28px;
    }
    .header .logo {
      max-height: 60px;
      margin-bottom: 10px;
    }
    .invoice-info {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 30px;
    }
    .invoice-info table {
      width: 100%;
      border-collapse: collapse;
    }
    .invoice-info td {
      padding: 8px 0;
    }
    .invoice-info td:first-child {
      color: #6b7280;
      width: 40%;
    }
    .invoice-info td:last-child {
      font-weight: 600;
    }
    .message {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      background-color: #f9fafb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .totals {
      text-align: right;
      margin-bottom: 30px;
    }
    .totals table {
      margin-left: auto;
      min-width: 300px;
    }
    .totals td {
      padding: 8px 0;
    }
    .totals .total-row {
      font-size: 18px;
      font-weight: bold;
      color: #6366F1;
      border-top: 2px solid #e5e7eb;
      padding-top: 12px;
    }
    .button {
      display: inline-block;
      background-color: #6366F1;
      color: #ffffff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .due-date {
      color: ${isOverdue ? '#ef4444' : '#059669'};
      font-weight: 600;
    }
    .overdue-alert {
      background-color: #fee2e2;
      border: 1px solid #ef4444;
      color: #991b1b;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${
        invoice.organization.logo_url
          ? `<img src="${invoice.organization.logo_url}" alt="${invoice.organization.name}" class="logo">`
          : ''
      }
      <h1>${invoice.organization.name}</h1>
      <p style="margin: 5px 0; color: #6b7280;">${invoice.organization.email}</p>
      ${
        invoice.organization.phone
          ? `<p style="margin: 5px 0; color: #6b7280;">${invoice.organization.phone}</p>`
          : ''
      }
    </div>

    ${
      isOverdue
        ? `
    <div class="overdue-alert">
      ⚠️ This invoice is overdue. Please arrange payment as soon as possible.
    </div>
    `
        : ''
    }

    ${
      customMessage
        ? `
    <div class="message">
      <p style="margin: 0; white-space: pre-line;">${customMessage}</p>
    </div>
    `
        : ''
    }

    <div class="invoice-info">
      <table>
        <tr>
          <td>Invoice Number:</td>
          <td>${invoice.invoice_number}</td>
        </tr>
        <tr>
          <td>Invoice Date:</td>
          <td>${formatDate(invoice.invoice_date)}</td>
        </tr>
        <tr>
          <td>Due Date:</td>
          <td class="due-date">${formatDate(invoice.due_date)}</td>
        </tr>
        <tr>
          <td>Bill To:</td>
          <td>${invoice.customer.name}</td>
        </tr>
      </table>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Quantity</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items
          .map(
            (item: any) => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: right;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.unit_price)}</td>
            <td style="text-align: right;">${formatCurrency(item.line_total)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">${formatCurrency(invoice.subtotal)}</td>
        </tr>
        <tr>
          <td>Tax:</td>
          <td style="text-align: right;">${formatCurrency(invoice.tax_amount)}</td>
        </tr>
        ${
          invoice.discount_amount > 0
            ? `
        <tr>
          <td>Discount:</td>
          <td style="text-align: right; color: #059669;">-${formatCurrency(invoice.discount_amount)}</td>
        </tr>
        `
            : ''
        }
        <tr class="total-row">
          <td>Total:</td>
          <td style="text-align: right;">${formatCurrency(invoice.total_amount)}</td>
        </tr>
        ${
          invoice.amount_paid > 0
            ? `
        <tr>
          <td>Amount Paid:</td>
          <td style="text-align: right; color: #059669;">-${formatCurrency(invoice.amount_paid)}</td>
        </tr>
        <tr class="total-row">
          <td>Amount Due:</td>
          <td style="text-align: right;">${formatCurrency(invoice.amount_due)}</td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/invoices/${invoice.id}" class="button">
        View Invoice Online
      </a>
    </div>

    ${
      invoice.notes
        ? `
    <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 6px;">
      <strong>Notes:</strong>
      <p style="margin: 10px 0 0 0; color: #6b7280; white-space: pre-line;">${invoice.notes}</p>
    </div>
    `
        : ''
    }

    ${
      invoice.terms
        ? `
    <div style="margin-top: 15px; padding: 15px; background-color: #f9fafb; border-radius: 6px;">
      <strong>Payment Terms:</strong>
      <p style="margin: 10px 0 0 0; color: #6b7280; white-space: pre-line;">${invoice.terms}</p>
    </div>
    `
        : ''
    }

    <div class="footer">
      <p><strong>Thank you for your business!</strong></p>
      <p>If you have any questions about this invoice, please contact us:</p>
      <p>${invoice.organization.email}${invoice.organization.phone ? ` • ${invoice.organization.phone}` : ''}</p>
      ${invoice.organization.address ? `<p style="margin-top: 10px;">${invoice.organization.address}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}
