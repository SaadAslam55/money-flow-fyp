// src/services/api/userApi.ts
/**
 * User API Service
 * Handles user CRUD operations, profile management, and user permissions
 * Includes user search, filtering, and role management
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/services/supabase/client';
import type { User } from '@/types';
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
 * Get all users in an organization with pagination
 */
export async function getUsers(
  organizationId: string,
  filters?: {
    search?: string;
    role?: string[];
    isActive?: boolean;
    sortBy?: 'name' | 'role' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  },
  page: number = DEFAULT_PAGE,
  perPage: number = DEFAULT_PER_PAGE
) {
  try {
    let query = supabase
      .from('users')
      .select('*, organization:organizations(id, name)', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.role && filters.role.length > 0) {
      query = query.in('role', filters.role);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    // Apply sorting
    const sortBy = filters?.sortBy ?? 'full_name';
    const sortOrder = filters?.sortOrder ?? 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const { start, end } = buildPaginationRange(page, perPage);
    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return paginatedSuccessResponse(data as User[], count ?? 0, page, perPage);
  } catch (error) {
    logger.error('Error fetching users:', error instanceof Error ? error.message : String(error));
    return paginatedErrorResponse<User>(page, perPage, error);
  }
}

/**
 * Get single user by ID
 */
export async function getUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error fetching user:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Get user by auth user ID
 */
export async function getUserByAuthId(authUserId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('auth_user_id', authUserId)
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error fetching user by auth ID:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Create new user
 */
export async function createUser(
  userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login'>,
  organizationId: string
) {
  try {
    // Check if email already exists in organization
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', userData.email)
      .maybeSingle();

    if (existing) {
      throw new Error('User with this email already exists in this organization');
    }

    // Check if auth_user_id exists
    if (userData.auth_user_id) {
      const { data: existingAuth } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', userData.auth_user_id)
        .maybeSingle();

      if (existingAuth) {
        throw new Error('User with this auth ID already exists');
      }
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        organization_id: organizationId,
      })
      .select('*, organization:organizations(*)')
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error creating user:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Update user
 */
export async function updateUser(userId: string, updates: Partial<User>) {
  try {
    // Remove fields that shouldn't be updated directly
    const { _id, _organization_id, _auth_user_id, _created_at, _updated_at, _last_login, ...updateData } =
      updates as Record<string, unknown>;

    // Validate email uniqueness if being updated
    if (updateData.email) {
      const currentUserResponse = await getUser(userId);
      if (currentUserResponse.data) {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('organization_id', currentUserResponse.data.organization_id)
          .eq('email', updateData.email)
          .neq('id', userId)
          .maybeSingle();

        if (existing) {
          throw new Error('Email already in use by another user');
        }
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('*, organization:organizations(*)')
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error updating user:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Delete user (soft delete by deactivating)
 */
export async function deleteUser(userId: string) {
  try {
    // Don't allow deleting yourself
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser) {
      const currentUserResponse = await getUserByAuthId(authUser.id);
      if (currentUserResponse?.data?.id === userId) {
        throw new Error('Cannot delete your own account');
      }
    }

    // Soft delete by deactivating
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error deleting user:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Activate user
 */
export async function activateUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)
      .select('*, organization:organizations(*)')
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error activating user:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      .select('*, organization:organizations(*)')
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error deactivating user:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, newRole: User['role']) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select('*, organization:organizations(*)')
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error updating user role:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(userId: string, avatarFile: File) {
  try {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('user-avatars').getPublicUrl(fileName);

    // Update user with avatar URL
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)
      .select('*, organization:organizations(*)')
      .single();

    if (error) throw error;

    return successResponse(data as User);
  } catch (error) {
    logger.error('Error uploading avatar:', error instanceof Error ? error.message : String(error));
    return errorResponse<User>(error);
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(organizationId: string, role: User['role']) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, organization:organizations(id, name)')
      .eq('organization_id', organizationId)
      .eq('role', role)
      .eq('is_active', true)
      .order('full_name');

    if (error) throw error;

    return successResponse(data as User[]);
  } catch (error) {
    logger.error('Error fetching users by role:', error instanceof Error ? error.message : String(error));
    return errorResponse<User[]>(error);
  }
}

/**
 * User Preferences Interface
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat?: '12h' | '24h';
  currencyDisplay?: 'symbol' | 'code' | 'name';
  numberFormat?: '1,234.56' | '1.234,56' | '1 234,56';
  fontSize?: number;
  compactMode?: boolean;
  animations?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const defaultPreferences: UserPreferences = {
      theme: 'system',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currencyDisplay: 'symbol',
      numberFormat: '1,234.56',
      fontSize: 14,
      compactMode: false,
      animations: true,
      highContrast: false,
      reducedMotion: false,
    };

    return successResponse({
      ...defaultPreferences,
      ...(data?.preferences || {}),
    } as UserPreferences);
  } catch (error) {
    logger.error('Error fetching user preferences:', error instanceof Error ? error.message : String(error));
    return errorResponse<UserPreferences>(error);
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
  try {
    // Get current preferences first
    const { data: currentData } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    const currentPrefs = currentData?.preferences || {};
    const mergedPrefs = { ...currentPrefs, ...preferences };

    const { data, error } = await supabase
      .from('users')
      .update({ preferences: mergedPrefs })
      .eq('id', userId)
      .select('preferences')
      .single();

    if (error) throw error;

    return successResponse(data?.preferences as UserPreferences);
  } catch (error) {
    logger.error('Error updating user preferences:', error instanceof Error ? error.message : String(error));
    return errorResponse<UserPreferences>(error);
  }
}
