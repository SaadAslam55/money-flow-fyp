// src/services/api/organizationApi.ts
/**
 * Organization API Service
 * Handles organization CRUD operations, profile management, and settings
 * Includes logo upload, subscription management, and team operations
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { Organization } from '@/types';
import type { OrganizationInsert } from '@/types/database.types';
import { successResponse, errorResponse } from './baseApi';

/**
 * Get organization by ID
 */
export async function getOrganization(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) throw error;

    return successResponse(data as Organization);
  } catch (error) {
    logger.error(
      'Error fetching organization:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Organization>(error);
  }
}

/**
 * Get organization by subdomain
 */
export async function getOrganizationBySubdomain(subdomain: string) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', subdomain)
      .single();

    if (error) throw error;

    return successResponse(data as Organization);
  } catch (error) {
    logger.error(
      'Error fetching organization by subdomain:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Organization>(error);
  }
}

/**
 * Create new organization
 */
export async function createOrganization(
  organizationData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    // Check if subdomain is unique (if provided)
    if (organizationData.subdomain) {
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', organizationData.subdomain)
        .maybeSingle();

      if (existing) {
        throw new Error('Subdomain already taken');
      }
    }

    // Check if email is unique
    const { data: existingEmail } = await supabase
      .from('organizations')
      .select('id')
      .eq('email', organizationData.email)
      .maybeSingle();

    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        ...organizationData,
        subscription_plan: organizationData.subscription_plan ?? 'free',
        subscription_status: organizationData.subscription_status ?? 'active',
        currency: organizationData.currency ?? 'PKR',
        timezone: organizationData.timezone ?? 'Asia/Karachi',
        fiscal_year_start: organizationData.fiscal_year_start ?? '2024-01-01',
      } satisfies OrganizationInsert)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Organization);
  } catch (error) {
    logger.error(
      'Error creating organization:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Organization>(error);
  }
}

/**
 * Update organization
 */
export async function updateOrganization(
  organizationId: string,
  updates: Partial<Organization>,
  logoFile?: File
) {
  try {
    let logoUrl = updates.logo_url;

    // Upload new logo if provided
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${organizationId}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-assets')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('organization-assets').getPublicUrl(fileName);

      logoUrl = publicUrl;

      // Delete old logo if exists
      if (updates.logo_url) {
        const oldUrlParts = updates.logo_url.split('/organization-assets/');
        if (oldUrlParts.length > 1) {
          const oldFileName = oldUrlParts[1];
          if (oldFileName) {
            await supabase.storage.from('organization-assets').remove([oldFileName]);
          }
        }
      }
    }

    // Remove fields that shouldn't be updated directly
    const {
      id: _id,
      created_at: _created_at,
      updated_at: _updated_at,
      payment_provider: _payment_provider,
      payment_customer_id: _payment_customer_id,
      payment_subscription_id: _payment_subscription_id,
      logo_url: _logo_url,
      ...updateData
    } = updates;

    // Validate subdomain uniqueness if being updated
    if (updateData.subdomain) {
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', updateData.subdomain)
        .neq('id', organizationId)
        .maybeSingle();

      if (existing) {
        throw new Error('Subdomain already taken');
      }
    }

    // Validate email uniqueness if being updated
    if (updateData.email) {
      const { data: existingEmail } = await supabase
        .from('organizations')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', organizationId)
        .maybeSingle();

      if (existingEmail) {
        throw new Error('Email already registered');
      }
    }

    const { data, error } = await supabase
      .from('organizations')
      .update({
        ...updateData,
        logo_url: logoUrl,
      })
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Organization);
  } catch (error) {
    logger.error(
      'Error updating organization:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Organization>(error);
  }
}

/**
 * Update organization subscription
 */
export async function updateSubscription(
  organizationId: string,
  subscriptionData: {
    subscription_plan?: 'free' | 'pro' | 'enterprise';
    subscription_status?: 'active' | 'past_due' | 'cancelled' | 'suspended' | 'trialing';
    payment_provider?: 'jazzcash' | 'easypaisa' | 'raast';
    payment_customer_id?: string;
    payment_subscription_id?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(subscriptionData)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Organization);
  } catch (error) {
    logger.error(
      'Error updating subscription:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Organization>(error);
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(organizationId: string) {
  try {
    // Get user count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true);

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

    // Get total revenue (from paid invoices)
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid');

    const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    // Get outstanding balance
    const { data: outstandingInvoices } = await supabase
      .from('invoices')
      .select('amount_due')
      .eq('organization_id', organizationId)
      .in('status', ['sent', 'partially_paid', 'overdue']);

    const typedOutstandingInvoices = (outstandingInvoices ?? []) as Array<{ amount_due: number }>;
    const outstandingBalance = typedOutstandingInvoices.reduce(
      (sum, inv) => sum + (inv.amount_due ?? 0),
      0
    );

    return successResponse({
      user_count: userCount ?? 0,
      customer_count: customerCount ?? 0,
      invoice_count: invoiceCount ?? 0,
      total_revenue: totalRevenue,
      outstanding_balance: outstandingBalance,
    });
  } catch (error) {
    logger.error(
      'Error fetching organization stats:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Upload organization logo
 */
export async function uploadOrganizationLogo(organizationId: string, logoFile: File) {
  try {
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${organizationId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('organization-assets')
      .upload(fileName, logoFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('organization-assets').getPublicUrl(fileName);

    // Update organization with logo URL
    const { data, error } = await supabase
      .from('organizations')
      .update({ logo_url: publicUrl })
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Organization);
  } catch (error) {
    logger.error('Error uploading logo:', error instanceof Error ? error.message : String(error));
    return errorResponse<Organization>(error);
  }
}

/**
 * Delete organization logo
 */
export async function deleteOrganizationLogo(organizationId: string) {
  try {
    // Get current logo URL
    const orgResponse = await getOrganization(organizationId);
    if (!orgResponse.data?.logo_url) {
      return successResponse(null);
    }

    // Extract file path from URL
    const urlParts = orgResponse.data.logo_url.split('/organization-assets/');
    if (urlParts.length > 1 && urlParts[1]) {
      const fileName: string = urlParts[1];
      await supabase.storage.from('organization-assets').remove([fileName]);
    }

    // Update organization to remove logo URL
    const { data, error } = await supabase
      .from('organizations')
      .update({ logo_url: null })
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Organization);
  } catch (error) {
    logger.error('Error deleting logo:', error instanceof Error ? error.message : String(error));
    return errorResponse<Organization>(error);
  }
}

// ============================================
// SUPER ADMIN FUNCTIONS
// ============================================

export interface OrganizationListItem {
  id: string;
  name: string;
  subdomain: string | null;
  email: string;
  phone: string | null;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  user_count: number;
  invoice_count: number;
  total_revenue: number;
}

export interface OrganizationListFilters {
  limit?: number;
  offset?: number;
  status?: string;
  plan?: string;
  search?: string;
}

/**
 * List all organizations (Super Admin only)
 */
export async function listOrganizations(filters?: OrganizationListFilters) {
  try {
    const { data, error } = await supabase.rpc('list_organizations', {
      p_limit: filters?.limit ?? 50,
      p_offset: filters?.offset ?? 0,
      p_status: filters?.status ?? null,
      p_plan: filters?.plan ?? null,
      p_search: filters?.search ?? null,
    });

    if (error) throw error;

    return successResponse(data as OrganizationListItem[]);
  } catch (error) {
    logger.error(
      'Error listing organizations:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<OrganizationListItem[]>(error);
  }
}

/**
 * Get organization details (Super Admin only)
 */
export async function getOrganizationDetails(organizationId: string) {
  try {
    const { data, error } = await supabase.rpc('get_organization_details', {
      p_organization_id: organizationId,
    });

    if (error) throw error;

    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as { error: string }).error);
    }

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error getting organization details:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Create organization (Super Admin only)
 */
export async function createOrganizationSuperAdmin(orgData: {
  name: string;
  email: string;
  subdomain?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  subscription_plan?: string;
}) {
  try {
    const { data, error } = await supabase.rpc('create_organization', {
      p_name: orgData.name,
      p_email: orgData.email,
      p_subdomain: orgData.subdomain ?? null,
      p_phone: orgData.phone ?? null,
      p_address: orgData.address ?? null,
      p_city: orgData.city ?? null,
      p_country: orgData.country ?? 'Pakistan',
      p_subscription_plan: orgData.subscription_plan ?? 'free',
    });

    if (error) throw error;

    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as { error: string }).error);
    }

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error creating organization:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Update organization status (Super Admin only)
 */
export async function updateOrganizationStatus(
  organizationId: string,
  status: 'active' | 'past_due' | 'cancelled' | 'suspended' | 'trialing'
) {
  try {
    const { data, error } = await supabase.rpc('update_organization_status', {
      p_organization_id: organizationId,
      p_status: status,
    });

    if (error) throw error;

    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as { error: string }).error);
    }

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error updating organization status:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Suspend organization (Super Admin only)
 */
export async function suspendOrganization(organizationId: string) {
  try {
    const { data, error } = await supabase.rpc('suspend_organization', {
      p_organization_id: organizationId,
    });

    if (error) throw error;

    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as { error: string }).error);
    }

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error suspending organization:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Delete organization (Super Admin only)
 */
export async function deleteOrganization(organizationId: string) {
  try {
    const { data, error } = await supabase.rpc('delete_organization', {
      p_organization_id: organizationId,
    });

    if (error) throw error;

    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as { error: string }).error);
    }

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error deleting organization:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Get organization statistics (Super Admin only)
 */
export async function getOrganizationStatsSuperAdmin() {
  try {
    const { data, error } = await supabase.rpc('get_organization_stats');

    if (error) throw error;

    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as { error: string }).error);
    }

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error getting organization stats:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}
