// src/services/notifications/whatsapp.ts
/**
 * WhatsApp Notification Service
 * Handles WhatsApp messaging via Supabase Edge Functions
 * 
 * Features:
 * - Send text messages to customers
 * - Send invoices via WhatsApp
 * - Payment reminders
 * - Phone number validation and formatting
 * 
 * @example
 * ```typescript
 *
import { 
 *   sendWhatsAppMessage, 
 *   sendInvoiceViaWhatsApp,
 *   formatPhoneToE164 
 * } from '@/services/notifications/whatsapp';
 * 
 * // Send custom message
 * const { success } = await sendWhatsAppMessage({
 *   to: '+923001234567',
 *   message: 'Your invoice is ready'
 * });
 * 
 * // Send invoice
 * await sendInvoiceViaWhatsApp(
 *   '+923001234567',
 *   'INV-001',
 *   5000,
 *   '2024-01-15'
 * );
 * ```
 */

import { supabase } from '@/services/supabase/client';
import { logger } from '@/lib/logger';

export interface WhatsAppMessage {
  to: string; // Phone number in E.164 format (e.g., +923001234567)
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'video';
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send WhatsApp message via Supabase Edge Function
 * 
 * @param message - WhatsApp message object with recipient and content
 * @returns WhatsApp response with success status and message ID
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<WhatsAppResponse> {
  try {
    // Validate phone number format (E.164)
    if (!isValidPhoneNumber(message.to)) {
      return {
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +923001234567)',
      };
    }

    // Validate message content
    if (!message.message || message.message.trim().length === 0) {
      return {
        success: false,
        error: 'Message content is required',
      };
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        to: message.to,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
      },
    });

    if (error) {

      logger.error('Error sending WhatsApp message:', error instanceof Error ? error.message : String(error));
      return {
        success: false,
        error: error.message ?? 'Failed to send WhatsApp message',
      };
    }

    return {
      success: true,
      messageId: data?.messageId || data?.id,
    };
  } catch (error) {

    logger.error('Error sending WhatsApp message:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'WhatsApp sending failed',
    };
  }
}

/**
 * Send invoice via WhatsApp
 * 
 * @param phoneNumber - Customer phone number in E.164 format
 * @param invoiceNumber - Invoice number
 * @param amount - Invoice amount
 * @param dueDate - Invoice due date
 * @param pdfUrl - Optional PDF URL for invoice attachment
 * @returns WhatsApp response with success status
 */
export async function sendInvoiceViaWhatsApp(
  phoneNumber: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string,
  pdfUrl?: string
): Promise<WhatsAppResponse> {
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

  const message = `Hello! Your invoice ${invoiceNumber} for ${formattedAmount} is ready.\n\nDue date: ${formattedDate}${pdfUrl ? `\n\nView invoice: ${pdfUrl}` : ''}\n\nThank you for your business!`;

  return sendWhatsAppMessage({
    to: phoneNumber,
    message,
    mediaUrl: pdfUrl,
    mediaType: pdfUrl ? 'document' : undefined,
  });
}

/**
 * Send payment reminder via WhatsApp
 * 
 * @param phoneNumber - Customer phone number in E.164 format
 * @param invoiceNumber - Invoice number
 * @param amount - Invoice amount
 * @param dueDate - Invoice due date
 * @returns WhatsApp response with success status
 */
export async function sendPaymentReminderViaWhatsApp(
  phoneNumber: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string
): Promise<WhatsAppResponse> {
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

  const message = `Payment Reminder\n\nInvoice: ${invoiceNumber}\nAmount: ${formattedAmount}\nDue Date: ${formattedDate}\n\nPlease make payment at your earliest convenience to avoid any late fees.\n\nThank you for your business!`;

  return sendWhatsAppMessage({
    to: phoneNumber,
    message,
  });
}

/**
 * Send welcome message via WhatsApp
 * 
 * @param phoneNumber - Customer phone number in E.164 format
 * @param customerName - Customer name for personalization
 * @returns WhatsApp response with success status
 */
export async function sendWelcomeViaWhatsApp(
  phoneNumber: string,
  customerName: string
): Promise<WhatsAppResponse> {
  const message = `Hello ${customerName}!\n\nWelcome to Money Flow. We're here to help you manage your business finances efficiently.\n\nIf you have any questions or need assistance, feel free to reach out to us. We're always happy to help!\n\nBest regards,\nMoney Flow Team`;

  return sendWhatsAppMessage({
    to: phoneNumber,
    message,
  });
}

/**
 * Validate phone number format (E.164)
 * 
 * @param phone - Phone number to validate
 * @returns true if phone number is in valid E.164 format
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  // E.164 format: +[country code][number] (max 15 digits total)
  return /^\+[1-9]\d{1,14}$/.test(phone.trim());
}

/**
 * Format phone number to E.164 format
 * Converts various phone number formats to E.164 standard
 * 
 * @param phone - Phone number in any format
 * @param countryCode - Country code (default: +92 for Pakistan)
 * @returns Phone number in E.164 format
 * 
 * @example
 * ```typescript
 * formatPhoneToE164('03001234567', '+92') // Returns: +923001234567
 * formatPhoneToE164('300-123-4567', '+92') // Returns: +923001234567
 * formatPhoneToE164('+923001234567') // Returns: +923001234567
 * ```
 */
export function formatPhoneToE164(
  phone: string,
  countryCode: string = '+92'
): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required');
  }

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If already starts with +, validate and return
  if (cleaned.startsWith('+')) {
    if (isValidPhoneNumber(cleaned)) {
      return cleaned;
    }
    throw new Error('Invalid phone number format');
  }

  // Remove leading zeros (common in Pakistani numbers)
  const digits = cleaned.replace(/^0+/, '');

  // Extract country code digits
  const countryCodeDigits = countryCode.replace('+', '');

  // Check if country code is already present
  if (digits.startsWith(countryCodeDigits)) {
    return `+${digits}`;
  }

  // Add country code
  const formatted = `${countryCode}${digits}`;

  // Validate final format
  if (!isValidPhoneNumber(formatted)) {
    throw new Error(`Invalid phone number format: ${phone}`);
  }

  return formatted;
}

