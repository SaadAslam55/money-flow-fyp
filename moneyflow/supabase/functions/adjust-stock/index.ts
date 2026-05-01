/// <reference path="../deno.d.ts" />
/// <reference path="../http-server.d.ts" />
// supabase/functions/adjust-stock/index.ts
/**
 * Adjust Stock Edge Function
 * Adjusts product stock levels and logs movements
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, corsResponse, corsErrorResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/auth.ts';
import { parseJsonBody, validateRequired, isValidUUID, validateNumberRange } from '../_shared/validators.ts';
import { getServiceClient } from '../_shared/auth.ts';

interface StockAdjustmentRequest {
  product_id: string;
  adjustment_type: 'add' | 'subtract' | 'set';
  quantity: number;
  reason: string;
  reference_type?: string;
  reference_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    // Authenticate user
    const authResult = await requireAuth(req, ['admin', 'manager']);
    if (authResult.error || !authResult.user) {
      return corsErrorResponse(
        authResult.error || new Error('Authentication required'),
        401,
        req
      );
    }

    const { user } = authResult;

    // Parse request body
    const { data: body, error: parseError } = await parseJsonBody<StockAdjustmentRequest>(req);
    if (parseError || !body) {
      return corsErrorResponse(
        parseError || new Error('Invalid request body'),
        400,
        req
      );
    }

    // Validate required fields
    const requiredFields = ['product_id', 'adjustment_type', 'quantity', 'reason'];
    for (const field of requiredFields) {
      const validation = validateRequired(body[field as keyof StockAdjustmentRequest], field);
      if (!validation.valid) {
        return corsErrorResponse(validation.error!, 400, req);
      }
    }

    // Validate product_id
    if (!isValidUUID(body.product_id)) {
      return corsErrorResponse(
        new Error('Invalid product_id format'),
        400,
        req
      );
    }

    // Validate adjustment_type
    if (!['add', 'subtract', 'set'].includes(body.adjustment_type)) {
      return corsErrorResponse(
        new Error('Invalid adjustment_type. Must be: add, subtract, or set'),
        400,
        req
      );
    }

    // Validate quantity
    if (body.quantity < 0) {
      return corsErrorResponse(
        new Error('Quantity must be non-negative'),
        400,
        req
      );
    }

    const supabase = getServiceClient();

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, current_stock, track_inventory, organization_id')
      .eq('id', body.product_id)
      .eq('organization_id', user.organization_id)
      .single();

    if (productError || !product) {
      return corsErrorResponse(
        new Error('Product not found or access denied'),
        404,
        req
      );
    }

    // Check if inventory tracking is enabled
    if (!product.track_inventory) {
      return corsErrorResponse(
        new Error('Inventory tracking is not enabled for this product'),
        400,
        req
      );
    }

    // Calculate new stock
    let newStock: number;
    let adjustmentQuantity: number;

    switch (body.adjustment_type) {
      case 'add':
        newStock = product.current_stock + body.quantity;
        adjustmentQuantity = body.quantity;
        break;

      case 'subtract':
        newStock = product.current_stock - body.quantity;
        if (newStock < 0) {
          return corsErrorResponse(
            new Error('Insufficient stock. Cannot subtract more than available.'),
            400,
            req
          );
        }
        adjustmentQuantity = -body.quantity;
        break;

      case 'set':
        newStock = body.quantity;
        adjustmentQuantity = body.quantity - product.current_stock;
        break;

      default:
        return corsErrorResponse(
          new Error('Invalid adjustment type'),
          400,
          req
        );
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.product_id);

    if (updateError) {
      console.error('Stock update error:', updateError);
      return corsErrorResponse(
        new Error('Failed to update stock'),
        500,
        req
      );
    }

    // Log stock movement
    const { data: stockMovement, error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        organization_id: user.organization_id,
        product_id: body.product_id,
        type: body.adjustment_type === 'add' ? 'adjustment_in' : 'adjustment_out',
        quantity: adjustmentQuantity,
        reason: body.reason,
        reference_type: body.reference_type || null,
        reference_id: body.reference_id || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (movementError) {
      console.error('Stock movement logging error:', movementError);
      // Don't fail the request, but log the error
    }

    // Check for low stock alert
    const { data: productDetails } = await supabase
      .from('products')
      .select('minimum_stock, name')
      .eq('id', body.product_id)
      .single();

    const isLowStock = productDetails && newStock <= (productDetails.minimum_stock || 0);

    // Create audit log
    await supabase.from('audit_logs').insert({
      organization_id: user.organization_id,
      user_id: user.id,
      action: 'adjust_stock',
      entity_type: 'product',
      entity_id: body.product_id,
      old_values: { stock: product.current_stock },
      new_values: {
        stock: newStock,
        adjustment_type: body.adjustment_type,
        quantity: body.quantity,
        reason: body.reason,
      },
    });

    return corsResponse(
      {
        success: true,
        message: 'Stock adjusted successfully',
        data: {
          product_id: body.product_id,
          previous_stock: product.current_stock,
          new_stock: newStock,
          adjustment_quantity: adjustmentQuantity,
          stock_movement_id: stockMovement?.id,
          low_stock_alert: isLowStock,
        },
      },
      200,
      req
    );
  } catch (error) {
    console.error('Stock adjustment error:', error);
    return corsErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500,
      req
    );
  }
});

