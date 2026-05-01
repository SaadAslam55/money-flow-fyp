// src/pages/auth/AuthCallbackPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Verifying your account...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL hash parameters (Supabase uses hash for auth callbacks)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        // Check for access_token in hash (magic link / OAuth flow)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // Check for token_hash in query params (email confirmation flow)
        const tokenHash = queryParams.get('token_hash') ?? queryParams.get('token');
        const type = queryParams.get('type') ?? hashParams.get('type') ?? 'signup';

        // Get stored redirect from OAuth flow
        const storedRedirect = sessionStorage.getItem('oauth_redirect');

        // Clean up sessionStorage
        sessionStorage.removeItem('oauth_redirect');
        sessionStorage.removeItem('oauth_mode');

        if (accessToken && refreshToken) {
          setStatus('Setting up your session...');

          // OAuth or magic link flow - set session directly
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          // Check if this is a new OAuth user who needs organization setup
          if (sessionData.user) {
            setStatus('Checking your account...');

            // Check if user exists in our users table
            const { data: existingUser, error: userCheckError } = await supabase
              .from('users')
              .select('id, organization_id')
              .eq('auth_user_id', sessionData.user.id)
              .maybeSingle();

            if (userCheckError && userCheckError.code !== 'PGRST116') {
              logger.error('Error checking user:', userCheckError instanceof Error ? userCheckError.message : String(userCheckError));
            }

            // If user doesn't exist, create user and organization (OAuth signup)
            if (!existingUser) {
              setStatus('Setting up your account...');

              // Get user info from OAuth provider with proper type handling
              const metadata = sessionData.user.user_metadata as
                | Record<string, unknown>
                | undefined;
              const userName = String(
                metadata?.full_name ??
                  metadata?.name ??
                  sessionData.user.email?.split('@')[0] ??
                  'User'
              );
              const userEmail = sessionData.user.email ?? '';

              // Generate business name from user name or email
              const businessName = `${userName}'s Business`;

              // Generate unique subdomain
              const baseSubdomain = userName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 30);

              const subdomain = `${baseSubdomain}-${Date.now().toString().slice(-6)}`;

              // Create organization
              const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                  name: businessName,
                  subdomain,
                  email: userEmail,
                })
                .select()
                .single();

              if (orgError) {
                logger.error('Error creating organization:', orgError instanceof Error ? orgError.message : String(orgError));
                throw new Error('Failed to create organization. Please try again.');
              }

              // Create user record
              const nameParts = userName.split(' ');
              const { error: createUserError } = await supabase.from('users').insert({
                auth_user_id: sessionData.user.id,
                organization_id: orgData.id,
                email: userEmail,
                full_name: userName,
                first_name: nameParts[0] ?? userName,
                last_name: nameParts.slice(1).join(' ') ?? '',
                role: 'admin',
              });

              if (createUserError) {
                logger.error('Error creating user:', createUserError instanceof Error ? createUserError.message : String(createUserError));
                throw new Error('Failed to create user profile. Please try again.');
              }

              // Seed default expense categories (ignore errors)
              try {
                await supabase.rpc('seed_default_expense_categories', {
                  org_id: orgData.id,
                });
              } catch {
                // Ignore seeding errors
              }

              toast.success('Account created successfully! Welcome to Money Flow!');
            } else {
              toast.success('Welcome back!');
            }
          }

          const redirectTo = storedRedirect ?? '/dashboard';
          navigate(redirectTo, { replace: true });
          return;
        }

        if (tokenHash) {
          setStatus('Verifying your email...');

          // Email confirmation flow - verify OTP with token_hash
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'signup' | 'recovery' | 'email_change' | 'magiclink',
          });

          if (verifyError) throw verifyError;

          // Handle different callback types
          if (type === 'signup') {
            toast.success('Email verified successfully! Welcome aboard!');
          } else if (type === 'recovery') {
            toast.info('Please set your new password');
            navigate('/auth/reset-password', { replace: true });
            return;
          } else if (type === 'email_change') {
            toast.success('Email changed successfully!');
          } else {
            toast.success('Authentication successful!');
          }

          navigate('/dashboard', { replace: true });
          return;
        }

        // No valid tokens found - try to get session from URL
        setStatus('Checking session...');
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          toast.success('Authentication successful!');
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('Invalid callback parameters - no valid authentication data found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        toast.error(errorMessage);

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 3000);
      }
    };

    void handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold text-destructive">Authentication Error</div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
