// src/services/api/invoiceReminders.ts
/**
 * Invoice Reminder API Service
 * Handles sending reminders for overdue or upcoming invoices
 * 
 * Features:
 * - Automated overdue invoice reminders
 * - Scheduled custom reminders
 * - Reminder tracking and history
 * 
 * @example
 * ```typescript
 * import { sendOverdueReminders, scheduleReminder } from '@/services/api/invoiceReminders';
 * 
 * // Send overdue reminders
 * const { data, error } = await sendOverdueReminders('org-id');
 * 
 * // Schedule custom reminder
 * const { data, error } = await scheduleReminder({
 *   invoice_id: 'invoice-id',
 *   reminder_type: 'upcoming',
 *   send_date: '2024-01-15',
 *   sent: false
 * });
 * ```
 */

import { supabase } from '@/services/supabase/client';
import { successResponse, errorResponse } from './baseApi';
import type { ApiResponse } from './baseApi';
import { logger } from '@/lib/logger';

export interface InvoiceReminder {
  id?: string;
  invoice_id: string;
  reminder_type: 'upcoming' | 'overdue' | 'custom';
  send_date: string;
  message?: string;
  sent: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Send reminder for overdue invoices
 * Automatically sends email reminders for all overdue invoices in an organization
 * 
 * @param organizationId - Organization ID
 * @returns Array of reminder results
 */
export async function sendOverdueReminders(
  organizationId: string
): Promise<ApiResponse<Array<{ success: boolean; invoice_id: string; error?: string }>>> {
  try {
    // Get all overdue invoices
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'overdue')
      .lte('due_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    // Send reminders via edge function
    const results = await Promise.allSettled(
      invoices.map((invoice) =>
        supabase.functions.invoke('send-invoice-email', {
          body: {
            invoice_id: invoice.id,
            message: `Reminder: Your invoice ${invoice.invoice_number} is overdue. Please make payment as soon as possible.`,
          },
        })
      )
    );

    // Format results
    const formattedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          success: true,
          invoice_id: invoices[index].id,
        };
      } else {
        return {
          success: false,
          invoice_id: invoices[index].id,
          error: result.reason?.message ?? 'Unknown error',
        };
      }
    });

    return successResponse(formattedResults);
  } catch (error) {
    logger.error('Error sending overdue reminders:', error instanceof Error ? error.message : String(error));
    return errorResponse<Array<{ success: boolean; invoice_id: string; error?: string }>>(error);
  }
}

/**
 * Schedule invoice reminder
 * Creates a scheduled reminder for a specific invoice
 * 
 * @param reminder - Reminder data including invoice ID, type, and send date
 * @returns Created reminder record
 */
export async function scheduleReminder(
  reminder: Omit<InvoiceReminder, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<InvoiceReminder>> {
  try {
    const { data, error } = await supabase
      .from('invoice_reminders')
      .insert(reminder)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as InvoiceReminder);
  } catch (error) {
    logger.error('Error scheduling reminder:', error instanceof Error ? error.message : String(error));
    return errorResponse<InvoiceReminder>(error);
  }
}

