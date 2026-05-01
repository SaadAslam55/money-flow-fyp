// src/services/supabase/index.ts
/**
 * Centralized Supabase Service Exports
 * Import all Supabase services from here for better organization
 *
 * Usage:
 * import { supabase, signInWithPassword, uploadFile, subscribeToTable } from '@/services/supabase';
 */

// Client
export { supabase, getAuthenticatedClient, isSupabaseConfigured } from './client';

// Authentication
export {
  getCurrentSession,
  getCurrentUser,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  resetPassword,
  updatePassword,
  verifyOtp,
  refreshSession,
  onAuthStateChange,
} from './auth';

// Database
export {
  executeQuery,
  executeQueryWithRetry,
  checkTableAccess,
  getTableCount,
  batchInsert,
  executeRPC,
} from './database';

// Storage
export {
  uploadFile,
  getPublicUrl,
  getSignedUrl,
  deleteFile,
  listFiles,
  downloadFile,
  copyFile,
  moveFile,
} from './storage';

// Realtime
export {
  subscribeToTable,
  subscribeToInserts,
  subscribeToUpdates,
  subscribeToDeletes,
  subscribeToOrganizationChanges,
  unsubscribe,
  unsubscribeAll,
} from './realtime';

