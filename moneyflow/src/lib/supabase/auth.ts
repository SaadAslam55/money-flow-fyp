// src/lib/supabase/auth.ts
/**
 * Re-export Supabase auth functions for backward compatibility.
 * New code should import from '@/services/supabase/auth' directly.
 */

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
} from '@/services/supabase/auth';

// Additional helpers used by other modules
import { supabase } from '@/services/supabase/client';

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
