// src/services/api/adminApi.ts
/**
 * Admin API Service
 * Handles super admin operations for system-wide management
 * Includes organization management, user management, and system metrics
 */

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { Organization, User } from '@/types';
import {
  successResponse,
  errorResponse,
  paginatedSuccessResponse,
  paginatedErrorResponse,
  buildPaginationRange,
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
} from './baseApi';

/**
 * Get all organizations (super admin only)
 */
export async function getAllOrganizations(
  filters?: {
    search?: string;
    subscription_plan?: string[];
    subscription_status?: string[];
    sortBy?: 'name' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  },
  page: number = DEFAULT_PAGE,
  perPage: number = DEFAULT_PER_PAGE
) {
  try {
    let query = supabase.from('organizations').select('*', { count: 'exact' });

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subdomain.ilike.%${filters.search}%`
      );
    }

    if (filters?.subscription_plan && filters.subscription_plan.length > 0) {
      query = query.in('subscription_plan', filters.subscription_plan);
    }

    if (filters?.subscription_status && filters.subscription_status.length > 0) {
      query = query.in('subscription_status', filters.subscription_status);
    }

    // Apply sorting
    const sortBy = filters?.sortBy ?? 'created_at';
    const sortOrder = filters?.sortOrder ?? 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const { start, end } = buildPaginationRange(page, perPage);
    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return paginatedSuccessResponse(data as Organization[], count ?? 0, page, perPage);
  } catch (error) {
    // Enhanced error logging with fallback, ensuring consistent error structure
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error);

    if (typeof logger !== 'undefined' && typeof logger.error === 'function') {
      logger.error('Error fetching organizations:', undefined, error);
    } else {
      logger.error('Error fetching organizations:', errorMessage, error);
    }
    return paginatedErrorResponse<Organization>(page, perPage, errorMessage);
  }
}

/**
 * Get organization details with statistics (super admin)
 */
export async function getOrganizationDetails(organizationId: string) {
  try {
    const orgResult = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: org, error: orgError } = orgResult;

    if (orgError) throw orgError;

    // Get user count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Get customer count
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Get invoice count
    const { count: invoiceCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Get total revenue
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid');

    type InvoiceWithAmount = { total_amount?: number };
    const typedInvoices = (invoices ?? []) as InvoiceWithAmount[];
    const totalRevenue = typedInvoices.reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);

    return successResponse({
      organization: org as Organization,
      statistics: {
        user_count: userCount ?? 0,
        customer_count: customerCount ?? 0,
        invoice_count: invoiceCount ?? 0,
        total_revenue: totalRevenue,
      },
    });
  } catch (error) {
    logger.error('Error fetching organization details:', undefined, error);
    return errorResponse(error);
  }
}

/**
 * Get all users across all organizations (super admin)
 */
export async function getAllUsers(
  filters?: {
    search?: string;
    role?: string[];
    organization_id?: string;
    isActive?: boolean;
    sortBy?: 'full_name' | 'role' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  },
  page: number = DEFAULT_PAGE,
  perPage: number = DEFAULT_PER_PAGE
) {
  try {
    let query = supabase
      .from('users')
      .select('*, organization:organizations(id, name, email)', { count: 'exact' });

    // Apply filters
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.role && filters.role.length > 0) {
      query = query.in('role', filters.role);
    }

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    // Apply sorting
    const sortBy = filters?.sortBy ?? 'created_at';
    const sortOrder = filters?.sortOrder ?? 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const { start, end } = buildPaginationRange(page, perPage);
    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return paginatedSuccessResponse(data as User[], count ?? 0, page, perPage);
  } catch (error) {
    logger.error('Error fetching all users:', undefined, error);
    return paginatedErrorResponse<User>(page, perPage, error);
  }
}

/**
 * Suspend organization
 */
export async function suspendOrganization(organizationId: string, reason?: string) {
  try {
    const result = await supabase
      .from('organizations')
      .update({
        subscription_status: 'suspended',
      })
      .eq('id', organizationId)
      .select()
      .single();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = result;

    if (error) throw error;

    // Log suspension action (if audit_logs table exists)
    try {
      await supabase.from('audit_logs').insert({
        organization_id: organizationId,
        action: 'organization_suspended',
        entity_type: 'organization',
        entity_id: organizationId,
        notes: reason ?? 'Organization suspended by admin',
      });
    } catch (e) {
      // Audit logging is optional
      logger.warn('Failed to log suspension:', undefined, e);
    }

    return successResponse(data as Organization);
  } catch (error) {
    logger.error('Error suspending organization:', undefined, error);
    return errorResponse<Organization>(error);
  }
}

/**
 * Activate organization
 */
export async function activateOrganization(organizationId: string) {
  try {
    const result = await supabase
      .from('organizations')
      .update({
        subscription_status: 'active',
      })
      .eq('id', organizationId)
      .select()
      .single();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = result;

    if (error) throw error;

    return successResponse(data as Organization);
  } catch (error) {
    logger.error('Error activating organization:', undefined, error);
    return errorResponse<Organization>(error);
  }
}

/**
 * Get system statistics
 */
export async function getSystemStatistics() {
  try {
    // Get total organizations
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });

    // Get total users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total customers
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get total invoices
    const { count: invoiceCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    // Get organizations by plan
    const { data: orgsByPlan } = await supabase.from('organizations').select('subscription_plan');

    const planDistribution: Record<string, number> = {};
    const typedOrgsByPlan = (orgsByPlan ?? []) as Array<{ subscription_plan?: string }>;
    typedOrgsByPlan.forEach((org) => {
      const plan = org.subscription_plan ?? 'free';
      planDistribution[plan] = (planDistribution[plan] ?? 0) + 1;
    });

    // Get organizations by status
    const { data: orgsByStatus } = await supabase
      .from('organizations')
      .select('subscription_status');

    const statusDistribution: Record<string, number> = {};
    const typedOrgsByStatus = (orgsByStatus ?? []) as Array<{ subscription_status?: string }>;
    typedOrgsByStatus.forEach((org) => {
      const status = org.subscription_status ?? 'active';
      statusDistribution[status] = (statusDistribution[status] ?? 0) + 1;
    });

    // Get total revenue (from all paid invoices)
    const { data: allInvoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('status', 'paid');

    const typedAllInvoices = (allInvoices ?? []) as Array<{ total_amount?: number }>;
    const totalRevenue = typedAllInvoices.reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);

    return successResponse({
      total_organizations: orgCount ?? 0,
      total_users: userCount ?? 0,
      total_customers: customerCount ?? 0,
      total_invoices: invoiceCount ?? 0,
      total_revenue: totalRevenue,
      plan_distribution: planDistribution,
      status_distribution: statusDistribution,
    });
  } catch (error) {
    logger.error('Error fetching system statistics:', undefined, error);
    return errorResponse(error);
  }
}

/**
 * Get audit logs (super admin)
 */
export async function getAuditLogs(
  filters?: {
    organization_id?: string;
    user_id?: string;
    action?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
  },
  page: number = DEFAULT_PAGE,
  perPage: number = DEFAULT_PER_PAGE
) {
  try {
    let query = supabase.from('audit_logs').select('*', { count: 'exact' });

    // Apply filters
    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    // Apply sorting
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const { start, end } = buildPaginationRange(page, perPage);
    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return paginatedSuccessResponse(data ?? [], count ?? 0, page, perPage);
  } catch (error) {
    logger.error('Error fetching audit logs:', undefined, error);
    return paginatedErrorResponse(page, perPage, error);
  }
}
