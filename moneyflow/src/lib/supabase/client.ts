// src/lib/supabase/client.ts
/**
 * Re-export Supabase client for backward compatibility.
 * New code should import from '@/services/supabase/client' directly.
 */

export {
  supabase,
  getAuthenticatedClient,
  isSupabaseConfigured,
  getSupabaseConfigError,
} from '@/services/supabase/client';
