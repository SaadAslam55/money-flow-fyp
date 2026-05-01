// src/services/supabase/storage.ts
/**
 * Supabase Storage Service
 * Handles file uploads, downloads, and storage operations.
 * Provides secure file management with proper access control.
 * 
 * Features:
 * - File upload with validation
 * - Public and signed URL generation
 * - File listing and management
 * - File copy and move operations
 * - Secure file deletion
 * 
 * @example
 * ```typescript
 *
import { uploadFile, getPublicUrl, deleteFile } from '@/services/supabase/storage';
 * 
 * // Upload file
 * const { data, error } = await uploadFile('invoices', 'invoice-123.pdf', file);
 * 
 * // Get public URL
 * const url = getPublicUrl('invoices', 'invoice-123.pdf');
 * 
 * // Delete file
 * const { data, error } = await deleteFile('invoices', ['invoice-123.pdf']);
 * ```
 */

import { supabase } from './client';
import { logger } from '@/lib/logger';

/**
 * Upload file to Supabase Storage
 * 
 * Uploads a file to the specified bucket and path.
 * 
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @param file - File object to upload
 * @param options - Upload options (cache control, content type, upsert)
 * @returns Upload result with file path and error status
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
): Promise<{ data: { path: string } | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!bucket || typeof bucket !== 'string' || bucket.trim().length === 0) {
      return {
        data: null,
        error: new Error('Bucket name is required'),
      };
    }

    if (!path || typeof path !== 'string' || path.trim().length === 0) {
      return {
        data: null,
        error: new Error('File path is required'),
      };
    }

    if (!file || !(file instanceof File)) {
      return {
        data: null,
        error: new Error('Valid file object is required'),
      };
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        data: null,
        error: new Error(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`),
      };
    }

    // Sanitize bucket name and path
    const sanitizedBucket = bucket.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (sanitizedBucket !== bucket.trim()) {
      return {
        data: null,
        error: new Error('Invalid bucket name'),
      };
    }

    const sanitizedPath = path.trim().replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes

    const { data, error } = await supabase.storage
      .from(sanitizedBucket)
      .upload(sanitizedPath, file, {
        cacheControl: options?.cacheControl ?? '3600',
        contentType: (options?.contentType || file.type) ?? 'application/octet-stream',
        upsert: options?.upsert || false,
      });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('File upload error:', error instanceof Error ? error.message : String(error));
      }
      return { 
        data: null, 
        error: new Error(error.message ?? 'File upload failed') 
      };
    }

    return { data: { path: data.path }, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('File upload exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('File upload failed'),
    };
  }
}

/**
 * Get public URL for a file
 * 
 * Generates a public URL for a file in a public bucket.
 * Note: The bucket must be configured as public for this URL to work.
 * 
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @returns Public URL for the file
 */
export function getPublicUrl(bucket: string, path: string): string {
  // Validate inputs
  if (!bucket || typeof bucket !== 'string' || bucket.trim().length === 0) {
    throw new Error('Bucket name is required');
  }

  if (!path || typeof path !== 'string' || path.trim().length === 0) {
    throw new Error('File path is required');
  }

  const sanitizedBucket = bucket.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  const sanitizedPath = path.trim().replace(/^\/+|\/+$/g, '');

  const { data } = supabase.storage.from(sanitizedBucket).getPublicUrl(sanitizedPath);
  return data.publicUrl;
}

/**
 * Get signed URL for a file (temporary access)
 * 
 * Generates a signed URL that provides temporary access to a file.
 * Useful for private files that need time-limited access.
 * 
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour, max: 604800 = 7 days)
 * @returns Signed URL and error status
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<{ data: string | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!bucket || typeof bucket !== 'string' || bucket.trim().length === 0) {
      return {
        data: null,
        error: new Error('Bucket name is required'),
      };
    }

    if (!path || typeof path !== 'string' || path.trim().length === 0) {
      return {
        data: null,
        error: new Error('File path is required'),
      };
    }

    // Validate and clamp expiration time (1 second to 7 days)
    const validExpiresIn = Math.min(Math.max(1, Math.floor(expiresIn)), 604800);

    // Sanitize inputs
    const sanitizedBucket = bucket.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const sanitizedPath = path.trim().replace(/^\/+|\/+$/g, '');

    const { data, error } = await supabase.storage
      .from(sanitizedBucket)
      .createSignedUrl(sanitizedPath, validExpiresIn);

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('Signed URL creation error:', error instanceof Error ? error.message : String(error));
      }
      return { 
        data: null, 
        error: new Error(error.message ?? 'Failed to create signed URL') 
      };
    }

    return { data: data.signedUrl, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('Signed URL creation exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create signed URL'),
    };
  }
}

/**
 * Delete file from storage
 * 
 * Deletes one or more files from the specified bucket.
 * 
 * @param bucket - Storage bucket name
 * @param paths - Array of file paths to delete
 * @returns Array of deleted file names and error status
 */
export async function deleteFile(
  bucket: string,
  paths: string[]
): Promise<{ data: string[] | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!bucket || typeof bucket !== 'string' || bucket.trim().length === 0) {
      return {
        data: null,
        error: new Error('Bucket name is required'),
      };
    }

    if (!Array.isArray(paths) || paths.length === 0) {
      return {
        data: null,
        error: new Error('At least one file path is required'),
      };
    }

    // Validate all paths
    const invalidPaths = paths.filter(
      (path) => !path || typeof path !== 'string' || path.trim().length === 0
    );
    if (invalidPaths.length > 0) {
      return {
        data: null,
        error: new Error('All file paths must be non-empty strings'),
      };
    }

    // Sanitize inputs
    const sanitizedBucket = bucket.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const sanitizedPaths = paths.map((path) => path.trim().replace(/^\/+|\/+$/g, ''));

    const { data, error } = await supabase.storage
      .from(sanitizedBucket)
      .remove(sanitizedPaths);

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('File deletion error:', error instanceof Error ? error.message : String(error));
      }
      return { 
        data: null, 
        error: new Error(error.message ?? 'File deletion failed') 
      };
    }

    return { data: data.map(item => item.name), error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('File deletion exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('File deletion failed'),
    };
  }
}

/**
 * List files in a bucket
 * 
 * Lists files in a storage bucket, optionally filtered by path.
 * 
 * @param bucket - Storage bucket name
 * @param path - Optional path prefix to filter files
 * @param options - Listing options (limit, offset, sort)
 * @returns Array of file information and error status
 */
export async function listFiles(
  bucket: string,
  path?: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order?: 'asc' | 'desc' };
  }
): Promise<{ data: Array<{ name: string; id: string; updated_at: string }> | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!bucket || typeof bucket !== 'string' || bucket.trim().length === 0) {
      return {
        data: null,
        error: new Error('Bucket name is required'),
      };
    }

    // Validate and clamp limit (1 to 1000)
    const validLimit = options?.limit
      ? Math.min(Math.max(1, Math.floor(options.limit)), 1000)
      : 100;

    // Validate offset
    const validOffset = options?.offset
      ? Math.max(0, Math.floor(options.offset))
      : 0;

    // Validate sortBy
    const validSortBy = options?.sortBy ?? { column: 'name', order: 'asc' as const };
    if (!['name', 'created_at', 'updated_at'].includes(validSortBy.column)) {
      return {
        data: null,
        error: new Error('Invalid sort column. Must be: name, created_at, or updated_at'),
      };
    }

    // Sanitize inputs
    const sanitizedBucket = bucket.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const sanitizedPath = path ? path.trim().replace(/^\/+|\/+$/g, '') : '';

    const { data, error } = await supabase.storage.from(sanitizedBucket).list(sanitizedPath, {
      limit: validLimit,
      offset: validOffset,
      sortBy: validSortBy,
    });

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('File listing error:', error instanceof Error ? error.message : String(error));
      }
      return { 
        data: null, 
        error: new Error(error.message ?? 'Failed to list files') 
      };
    }

    return {
      data: data?.map(item => ({
        name: item.name,
        id: item.id,
        updated_at: item.updated_at,
      })) || [],
      error: null,
    };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('File listing exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to list files'),
    };
  }
}

/**
 * Download file as blob
 * 
 * Downloads a file from storage as a Blob object.
 * 
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @returns File blob and error status
 */
export async function downloadFile(
  bucket: string,
  path: string
): Promise<{ data: Blob | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!bucket || typeof bucket !== 'string' || bucket.trim().length === 0) {
      return {
        data: null,
        error: new Error('Bucket name is required'),
      };
    }

    if (!path || typeof path !== 'string' || path.trim().length === 0) {
      return {
        data: null,
        error: new Error('File path is required'),
      };
    }

    // Sanitize inputs
    const sanitizedBucket = bucket.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const sanitizedPath = path.trim().replace(/^\/+|\/+$/g, '');

    const { data, error } = await supabase.storage
      .from(sanitizedBucket)
      .download(sanitizedPath);

    if (error) {
      if (import.meta.env.DEV) {

        logger.error('File download error:', error instanceof Error ? error.message : String(error));
      }
      return { 
        data: null, 
        error: new Error(error.message ?? 'File download failed') 
      };
    }

    return { data, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('File download exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('File download failed'),
    };
  }
}

/**
 * Copy file within storage
 * 
 * Copies a file from one path to another within the same bucket.
 * This is implemented by downloading and re-uploading the file.
 * 
 * @param bucket - Storage bucket name
 * @param sourcePath - Source file path
 * @param destinationPath - Destination file path
 * @returns Copy result with destination path and error status
 */
export async function copyFile(
  bucket: string,
  sourcePath: string,
  destinationPath: string
): Promise<{ data: { path: string } | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!bucket || typeof bucket !== 'string' || bucket.trim().length === 0) {
      return {
        data: null,
        error: new Error('Bucket name is required'),
      };
    }

    if (!sourcePath || typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
      return {
        data: null,
        error: new Error('Source path is required'),
      };
    }

    if (!destinationPath || typeof destinationPath !== 'string' || destinationPath.trim().length === 0) {
      return {
        data: null,
        error: new Error('Destination path is required'),
      };
    }

    if (sourcePath === destinationPath) {
      return {
        data: null,
        error: new Error('Source and destination paths cannot be the same'),
      };
    }

    // Download source file
    const downloadResult = await downloadFile(bucket, sourcePath);
    if (downloadResult.error || !downloadResult.data) {
      return { 
        data: null, 
        error: downloadResult.error || new Error('Failed to download source file') 
      };
    }

    // Upload to destination
    const blob = new Blob([downloadResult.data]);
    const fileName = destinationPath.split('/').pop() || 'file';
    const file = new File([blob], fileName, { type: downloadResult.data.type ?? 'application/octet-stream' });
    
    return await uploadFile(bucket, destinationPath, file, { upsert: true });
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('File copy exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('File copy failed'),
    };
  }
}

/**
 * Move file (copy + delete)
 * 
 * Moves a file from one path to another within the same bucket.
 * This is implemented by copying the file and then deleting the source.
 * 
 * @param bucket - Storage bucket name
 * @param sourcePath - Source file path
 * @param destinationPath - Destination file path
 * @returns Move result with destination path and error status
 */
export async function moveFile(
  bucket: string,
  sourcePath: string,
  destinationPath: string
): Promise<{ data: { path: string } | null; error: Error | null }> {
  try {
    // Validate inputs
    if (!bucket || typeof bucket !== 'string' || bucket.trim().length === 0) {
      return {
        data: null,
        error: new Error('Bucket name is required'),
      };
    }

    if (!sourcePath || typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
      return {
        data: null,
        error: new Error('Source path is required'),
      };
    }

    if (!destinationPath || typeof destinationPath !== 'string' || destinationPath.trim().length === 0) {
      return {
        data: null,
        error: new Error('Destination path is required'),
      };
    }

    if (sourcePath === destinationPath) {
      return {
        data: null,
        error: new Error('Source and destination paths cannot be the same'),
      };
    }

    // Copy file
    const copyResult = await copyFile(bucket, sourcePath, destinationPath);
    if (copyResult.error || !copyResult.data) {
      return copyResult;
    }

    // Delete source file
    const deleteResult = await deleteFile(bucket, [sourcePath]);
    if (deleteResult.error) {
      // If delete fails, we still have the copy, so return success but log warning
      if (import.meta.env.DEV) {

        logger.warn('Failed to delete source file after copy:', deleteResult.error);
      }
      // Return success since copy succeeded
      return copyResult;
    }

    return copyResult;
  } catch (error) {
    if (import.meta.env.DEV) {

      logger.error('File move exception:', error instanceof Error ? error.message : String(error));
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error('File move failed'),
    };
  }
}

