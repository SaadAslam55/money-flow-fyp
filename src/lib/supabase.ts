// src/lib/supabase.ts
/**
 * Supabase client export
 * 
 * This file re-exports the Supabase client from services for backward compatibility.
 * New code should import directly from '@/services/supabase/client'
 */

export { supabase, getAuthenticatedClient, isSupabaseConfigured } from '@/services/supabase/client';
