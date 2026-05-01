// src/services/api/storageApi.ts
/**
 * Storage API Service
 * Handles file uploads for avatars, organization logos, and other assets
 * Implements best practices for Supabase Storage
 */

import { supabase } from '@/services/supabase/client';
import { logger } from '@/lib/logger';

export interface UploadResult {
  url: string | null;
  error: Error | null;
}

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate file before upload
 */
function validateFile(file: File, allowedTypes: string[] = ALLOWED_IMAGE_TYPES, maxSize: number = MAX_FILE_SIZE): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`;
  }
  if (file.size > maxSize) {
    return `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`;
  }
  return null;
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  try {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return { url: null, error: new Error(validationError) };
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

    // Delete old avatars first
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
      await supabase.storage.from('avatars').remove(filesToDelete);
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      logger.error('Avatar upload error:', uploadError.message);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('auth_user_id', userId);

    if (updateError) {
      logger.error('Avatar URL update error:', updateError.message);
      // Don't throw - the file is uploaded, just the DB update failed
    }

    // Also update auth user metadata
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    return { url: publicUrl, error: null };
  } catch (error) {
    logger.error('Avatar upload failed:', error instanceof Error ? error.message : String(error));
    return { url: null, error: error as Error };
  }
}

/**
 * Delete user avatar
 */
export async function deleteAvatar(userId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    // List and delete all files in user's avatar folder
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (files && files.length > 0) {
      const filesToDelete = files.map(f => `${userId}/${f.name}`);
      await supabase.storage.from('avatars').remove(filesToDelete);
    }

    // Update user profile
    await supabase
      .from('users')
      .update({ avatar_url: null })
      .eq('auth_user_id', userId);

    // Update auth metadata
    await supabase.auth.updateUser({
      data: { avatar_url: null }
    });

    return { success: true, error: null };
  } catch (error) {
    logger.error('Avatar delete failed:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error as Error };
  }
}

/**
 * Upload organization logo
 */
export async function uploadOrganizationLogo(organizationId: string, file: File): Promise<UploadResult> {
  try {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return { url: null, error: new Error(validationError) };
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${organizationId}/logo-${Date.now()}.${fileExt}`;

    // Delete old logos first
    const { data: existingFiles } = await supabase.storage
      .from('organization-assets')
      .list(organizationId);

    if (existingFiles && existingFiles.length > 0) {
      const logoFiles = existingFiles.filter(f => f.name.startsWith('logo'));
      if (logoFiles.length > 0) {
        const filesToDelete = logoFiles.map(f => `${organizationId}/${f.name}`);
        await supabase.storage.from('organization-assets').remove(filesToDelete);
      }
    }

    // Upload new logo
    const { error: uploadError } = await supabase.storage
      .from('organization-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      logger.error('Logo upload error:', uploadError.message);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('organization-assets')
      .getPublicUrl(fileName);

    // Update organization in database
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ logo_url: publicUrl })
      .eq('id', organizationId);

    if (updateError) {
      logger.error('Logo URL update error:', updateError.message);
      throw updateError;
    }

    return { url: publicUrl, error: null };
  } catch (error) {
    logger.error('Logo upload failed:', error instanceof Error ? error.message : String(error));
    return { url: null, error: error as Error };
  }
}

/**
 * Delete organization logo
 */
export async function deleteOrganizationLogo(organizationId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    // List and delete logo files
    const { data: files } = await supabase.storage
      .from('organization-assets')
      .list(organizationId);

    if (files && files.length > 0) {
      const logoFiles = files.filter(f => f.name.startsWith('logo'));
      if (logoFiles.length > 0) {
        const filesToDelete = logoFiles.map(f => `${organizationId}/${f.name}`);
        await supabase.storage.from('organization-assets').remove(filesToDelete);
      }
    }

    // Update organization
    await supabase
      .from('organizations')
      .update({ logo_url: null })
      .eq('id', organizationId);

    return { success: true, error: null };
  } catch (error) {
    logger.error('Logo delete failed:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error as Error };
  }
}

/**
 * Get signed URL for private files (if needed)
 */
export async function getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    logger.error('Failed to get signed URL:', error instanceof Error ? error.message : String(error));
    return null;
  }
}
