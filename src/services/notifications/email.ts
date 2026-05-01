// src/services/notifications/email.ts
/**
 * Email Notification Service
 * Handles email sending via Supabase Edge Functions
 *
 * Features:
 * - Send transactional emails (invoices, reminders, etc.)
 * - HTML email templates
 * - Email attachments support
 * - Error handling and retry logic
 *
 * @example
 * ```typescript
 *
import { sendEmail, sendInvoiceEmail } from '@/services/notifications/email';
 *
 * // Send custom email
 * const { success, error } = await sendEmail({
 *   to: 'customer@example.com',
 *   subject: 'Invoice Ready',
 *   html: '<p>Your invoice is ready</p>'
 * });
 *
 * // Send invoice email
 * const { success } = await sendInvoiceEmail(
 *   'customer@example.com',
 *   'invoice-id',
 *   'INV-001',
 *   'https://example.com/invoice.pdf'
 * );
 * ```
 */

import { supabase } from '@/services/supabase/client';
import { logger } from '@/lib/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded content for browser compatibility
    contentType?: string;
  }>;
  metadata?: Record<string, unknown>; // Additional metadata for tracking/logging
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Supabase Edge Function
 *
 * @param options - Email options including recipient, subject, and content
 * @returns Email response with success status and message ID
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    // Validate required fields
    if (!options.to || !options.subject) {
      return {
        success: false,
        error: 'Recipient and subject are required',
      };
    }

    // Normalize recipients to array
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    if (recipients.length === 0) {
      return {
        success: false,
        error: 'At least one recipient is required',
      };
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return {
        success: false,
        error: `Invalid email addresses: ${invalidEmails.join(', ')}`,
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        from: options.from,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
        metadata: options.metadata,
      },
    });

    if (error) {

      logger.error('Error sending email:', error instanceof Error ? error.message : String(error));
      return {
        success: false,
        error: error.message ?? 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: data?.messageId || data?.id,
    };
  } catch (error) {

    logger.error('Error sending email:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email sending failed',
    };
  }
}

/**
 * Send invoice email to customer
 *
 * @param to - Customer email address
 * @param invoiceId - Invoice ID (for tracking/logging purposes)
 * @param invoiceNumber - Invoice number to display
 * @param pdfUrl - Optional PDF URL for invoice attachment
 * @returns Email response with success status
 */
export async function sendInvoiceEmail(
  to: string,
  invoiceId: string,
  invoiceNumber: string,
  pdfUrl?: string
): Promise<EmailResponse> {
  // Escape HTML in invoice number for security
  const safeInvoiceNumber = invoiceNumber.replace(/[<>&"']/g, (char: string): string => {
    const map: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return map[char] || char;
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin: 0 0 10px 0;">Invoice ${safeInvoiceNumber}</h2>
        <p style="color: #6b7280; margin: 0;">Invoice #${safeInvoiceNumber}</p>
      </div>
      <div style="padding: 20px 0;">
        <p style="color: #374151; line-height: 1.6;">Dear Customer,</p>
        <p style="color: #374151; line-height: 1.6;">Please find your invoice attached. You can view and download it using the link below.</p>
        ${pdfUrl ? `<p style="margin: 20px 0;"><a href="${pdfUrl}" style="background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">View Invoice</a></p>` : ''}
        <p style="color: #374151; line-height: 1.6; margin-top: 20px;">Thank you for your business!</p>
      </div>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Invoice ${safeInvoiceNumber}`,
    html,
    metadata: {
      invoiceId,
      invoiceNumber,
      type: 'invoice',
    },
    // Note: PDF attachments should be handled server-side via edge function
    // as browser cannot directly attach files from URLs
  });
}

/**
 * Send password reset email
 *
 * @param to - User email address
 * @param resetLink - Password reset link (should be a secure token-based URL)
 * @returns Email response with success status
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<EmailResponse> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
        <h2 style="color: #92400e; margin: 0 0 10px 0;">Password Reset Request</h2>
        <p style="color: #78350f; margin: 0;">You requested to reset your password for your Money Flow account.</p>
      </div>
      <div style="padding: 20px 0;">
        <p style="color: #374151; line-height: 1.6;">Click the button below to reset your password:</p>
        <p style="margin: 20px 0;"><a href="${resetLink}" style="background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Reset Password</a></p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">This link will expire in 1 hour for security reasons.</p>
        <p style="color: #ef4444; font-size: 14px; line-height: 1.6; margin-top: 20px;"><strong>Important:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      </div>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your Password - Money Flow',
    html,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<EmailResponse> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Money Flow!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for signing up. We're excited to help you manage your business finances.</p>
      <p>Get started by creating your first invoice or adding your customers.</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Money Flow',
    html,
  });
}

/**
 * Send payment reminder email
 *
 * @param to - Customer email address
 * @param invoiceNumber - Invoice number
 * @param amount - Invoice amount
 * @param dueDate - Invoice due date
 * @returns Email response with success status
 */
export async function sendPaymentReminderEmail(
  to: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string
): Promise<EmailResponse> {
  // Format currency (assuming PKR)
  const formattedAmount = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);

  // Format date
  const formattedDate = new Date(dueDate).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Escape HTML for security
  const safeInvoiceNumber = invoiceNumber.replace(/[<>&"']/g, (char: string): string => {
    const map: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return map[char] || char;
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
        <h2 style="color: #991b1b; margin: 0 0 10px 0;">Payment Reminder</h2>
        <p style="color: #7f1d1d; margin: 0;">Invoice ${safeInvoiceNumber} - Payment Due</p>
      </div>
      <div style="padding: 20px 0;">
        <p style="color: #374151; line-height: 1.6;">Dear Customer,</p>
        <p style="color: #374151; line-height: 1.6;">This is a friendly reminder that invoice <strong>${safeInvoiceNumber}</strong> for <strong>${formattedAmount}</strong> is due on <strong>${formattedDate}</strong>.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #1f2937; font-weight: 600;">Invoice Details:</p>
          <p style="margin: 5px 0; color: #374151;">Invoice Number: ${safeInvoiceNumber}</p>
          <p style="margin: 5px 0; color: #374151;">Amount Due: ${formattedAmount}</p>
          <p style="margin: 5px 0; color: #374151;">Due Date: ${formattedDate}</p>
        </div>
        <p style="color: #374151; line-height: 1.6;">Please make payment at your earliest convenience to avoid any late fees.</p>
        <p style="color: #374151; line-height: 1.6; margin-top: 20px;">Thank you for your business!</p>
      </div>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Payment Reminder: Invoice ${safeInvoiceNumber}`,
    html,
  });
}
