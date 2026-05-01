/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/create-invoice/index.ts
/**
 * Create Invoice Edge Function
 * Creates a new invoice with line items and calculates totals
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, corsResponse, corsErrorResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';
import {
  parseJsonBody,
  validateRequired,
  validateObjectFields,
  isValidUUID,
  validateNumberRange,
} from '../_shared/validators.ts';
import { getServiceClient } from '../_shared/auth.ts';

interface InvoiceItem {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface CreateInvoiceRequest {
  [key: string]: unknown;
  customer_id?: string;
  invoice_date: string;
  due_date: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  discount_amount?: number;
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
    const { data: body, error: parseError } = await parseJsonBody<CreateInvoiceRequest>(req);
    if (parseError || !body) {
      return corsErrorResponse(
        parseError || new Error('Invalid request body'),
        400,
        req
      );
    }

    // Validate required fields
    const requiredFields = ['invoice_date', 'due_date', 'items'];
    const validation = validateObjectFields(body, requiredFields);
    if (!validation.valid) {
      return corsErrorResponse(validation.error!, 400, req);
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return corsErrorResponse(
        new Error('At least one invoice item is required'),
        400,
        req
      );
    }

    // Validate each item
    for (const item of body.items) {
      if (!item.description || item.description.trim() === '') {
        return corsErrorResponse(
          new Error('Item description is required'),
          400,
          req
        );
      }

      if (item.quantity <= 0) {
        return corsErrorResponse(
          new Error('Item quantity must be greater than 0'),
          400,
          req
        );
      }

      if (item.unit_price < 0) {
        return corsErrorResponse(
          new Error('Item unit price must be non-negative'),
          400,
          req
        );
      }

      if (item.tax_rate < 0 || item.tax_rate > 100) {
        return corsErrorResponse(
          new Error('Item tax rate must be between 0 and 100'),
          400,
          req
        );
      }

      if (item.product_id && !isValidUUID(item.product_id)) {
        return corsErrorResponse(
          new Error('Invalid product_id format'),
          400,
          req
        );
      }
    }

    // Validate customer_id if provided
    if (body.customer_id && !isValidUUID(body.customer_id)) {
      return corsErrorResponse(
        new Error('Invalid customer_id format'),
        400,
        req
      );
    }

    // Validate dates
    const invoiceDate = new Date(body.invoice_date);
    const dueDate = new Date(body.due_date);

    if (isNaN(invoiceDate.getTime())) {
      return corsErrorResponse(
        new Error('Invalid invoice_date format'),
        400,
        req
      );
    }

    if (isNaN(dueDate.getTime())) {
      return corsErrorResponse(
        new Error('Invalid due_date format'),
        400,
        req
      );
    }

    if (dueDate < invoiceDate) {
      return corsErrorResponse(
        new Error('Due date must be after invoice date'),
        400,
        req
      );
    }

    // Validate discount
    if (body.discount_amount !== undefined && body.discount_amount < 0) {
      return corsErrorResponse(
        new Error('Discount amount must be non-negative'),
        400,
        req
      );
    }

    const supabase = getServiceClient();

    // Verify customer belongs to organization if provided
    if (body.customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', body.customer_id)
        .eq('organization_id', user.organization_id)
        .single();

      if (customerError || !customer) {
        return corsErrorResponse(
          new Error('Customer not found or access denied'),
          404,
          req
        );
      }
    }

    // Generate invoice number
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let invoiceNumber = 'INV-0001';
    if (lastInvoice?.invoice_number) {
      const match = lastInvoice.invoice_number.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10) + 1;
        invoiceNumber = `INV-${String(num).padStart(4, '0')}`;
      }
    }

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of body.items) {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemTax = itemSubtotal * (item.tax_rate / 100);
      subtotal += itemSubtotal;
      taxAmount += itemTax;
    }

    const discountAmount = body.discount_amount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        organization_id: user.organization_id,
        customer_id: body.customer_id || null,
        invoice_number: invoiceNumber,
        invoice_date: body.invoice_date,
        due_date: body.due_date,
        status: 'draft',
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        amount_paid: 0,
        amount_due: totalAmount,
        notes: body.notes || null,
        terms: body.terms || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice creation error:', invoiceError);
      return corsErrorResponse(
        new Error('Failed to create invoice'),
        500,
        req
      );
    }

    // Create invoice items
    const invoiceItems = body.items.map((item) => ({
      invoice_id: invoice.id,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
      line_total: item.quantity * item.unit_price * (1 + item.tax_rate / 100),
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      // Rollback invoice creation
      await supabase.from('invoices').delete().eq('id', invoice.id);
      console.error('Invoice items creation error:', itemsError);
      return corsErrorResponse(
        new Error('Failed to create invoice items'),
        500,
        req
      );
    }

    // Update stock if products are involved
    for (const item of body.items) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('track_inventory, current_stock')
          .eq('id', item.product_id)
          .single();

        if (product?.track_inventory) {
          const newStock = product.current_stock - item.quantity;
          await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', item.product_id);

          // Log stock movement
          await supabase.from('stock_movements').insert({
            organization_id: user.organization_id,
            product_id: item.product_id,
            type: 'sale',
            quantity: -item.quantity,
            reference_type: 'invoice',
            reference_id: invoice.id,
            created_by: user.id,
          });
        }
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: user.organization_id,
      user_id: user.id,
      action: 'create_invoice',
      entity_type: 'invoice',
      entity_id: invoice.id,
      new_values: { invoice_number: invoiceNumber, total_amount: totalAmount },
    });

    // Fetch complete invoice with items
    const { data: completeInvoice } = await supabase
      .from('invoices')
      .select(
        `
        *,
        customer:customers(*),
        items:invoice_items(*),
        organization:organizations(*)
      `
      )
      .eq('id', invoice.id)
      .single();

    return corsResponse(
      {
        success: true,
        data: completeInvoice,
        message: 'Invoice created successfully',
      },
      201,
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

