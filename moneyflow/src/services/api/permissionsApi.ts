// src/services/api/permissionsApi.ts
/**
 * Permissions API Service
 * Handles permission CRUD operations and user permission management
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import { successResponse, errorResponse } from './baseApi';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPermission {
  permission_code: string;
  permission_name: string;
  is_granted: boolean;
  granted_via: string;
}

/**
 * Get all available permissions
 */
export async function getPermissions() {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('is_active', true)
      .order('category, name');

    if (error) throw error;

    return successResponse(data as Permission[]);
  } catch (error) {
    logger.error(
      'Error fetching permissions:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Permission[]>(error);
  }
}

/**
 * Get permissions by category
 */
export async function getPermissionsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return successResponse(data as Permission[]);
  } catch (error) {
    logger.error(
      'Error fetching permissions by category:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Permission[]>(error);
  }
}

/**
 * Get user permissions (role-based + custom grants)
 */
export async function getUserPermissions(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId,
    });

    if (error) throw error;

    return successResponse(data as UserPermission[]);
  } catch (error) {
    logger.error(
      'Error fetching user permissions:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<UserPermission[]>(error);
  }
}

/**
 * Check if user has a specific permission
 */
export async function checkUserPermission(userId: string, permissionCode: string) {
  try {
    const { data, error } = await supabase.rpc('check_user_permission', {
      p_user_id: userId,
      p_permission_code: permissionCode,
    });

    if (error) throw error;

    return successResponse(data as boolean);
  } catch (error) {
    logger.error(
      'Error checking user permission:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<boolean>(error);
  }
}

/**
 * Grant permission to a user
 */
export async function grantUserPermission(
  userId: string,
  permissionCode: string,
  grantedBy: string,
  notes?: string
) {
  try {
    const { data, error } = await supabase.rpc('grant_user_permission', {
      p_user_id: userId,
      p_permission_code: permissionCode,
      p_granted_by: grantedBy,
      p_notes: notes || null,
    });

    if (error) throw error;

    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as { error: string }).error);
    }

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error granting permission:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Revoke permission from a user
 */
export async function revokeUserPermission(
  userId: string,
  permissionCode: string,
  revokedBy: string
) {
  try {
    const { data, error } = await supabase.rpc('revoke_user_permission', {
      p_user_id: userId,
      p_permission_code: permissionCode,
      p_revoked_by: revokedBy,
    });

    if (error) throw error;

    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as { error: string }).error);
    }

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error revoking permission:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Get role permissions
 */
export async function getRolePermissions(role: string) {
  try {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(
        `
        *,
        permissions:permission_id (*)
      `
      )
      .eq('role', role);

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    logger.error(
      'Error fetching role permissions:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}

/**
 * Create a new permission (Super Admin only)
 */
export async function createPermission(permissionData: {
  code: string;
  name: string;
  description?: string;
  category: string;
}) {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .insert(permissionData)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Permission);
  } catch (error) {
    logger.error(
      'Error creating permission:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Permission>(error);
  }
}

/**
 * Update permission (Super Admin only)
 */
export async function updatePermission(permissionId: string, updates: Partial<Permission>) {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .update(updates)
      .eq('id', permissionId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as Permission);
  } catch (error) {
    logger.error(
      'Error updating permission:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse<Permission>(error);
  }
}

/**
 * Delete permission (Super Admin only)
 */
export async function deletePermission(permissionId: string) {
  try {
    const { error } = await supabase.from('permissions').delete().eq('id', permissionId);

    if (error) throw error;

    return successResponse(null);
  } catch (error) {
    logger.error(
      'Error deleting permission:',
      error instanceof Error ? error.message : String(error)
    );
    return errorResponse(error);
  }
}
