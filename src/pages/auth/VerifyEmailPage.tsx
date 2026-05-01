// src/pages/auth/VerifyEmailPage.tsx
/**
 * Verify Email Page
 * Email verification confirmation page with resend functionality
 */

import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { trackPageView, trackUserAction } from '@/middleware/analyticsMiddleware';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerification, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState<string>(
    (location.state as { email?: string })?.email ?? ''
  );
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // SEO
  usePageTitle({
    title: 'Verify Email',
    description: 'Verify your email address to complete your Money Flow account setup',
    keywords: 'verify email, email verification, account verification',
  });

  // Track page view
  useEffect(() => {
    trackPageView('/auth/verify-email', 'Verify Email');
  }, []);

  // Check if user is already authenticated (email verified)
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    if (cooldown > 0) return;

    setIsResending(true);
    try {
      const { error } = await resendVerification(email);
      if (error) {
        toast.error(error.message ?? 'Failed to resend verification email');
        trackUserAction('resend_verification_failed', 'auth', email);
      } else {
        toast.success('Verification email sent! Please check your inbox.');
        trackUserAction('resend_verification_success', 'auth', email);
        setCooldown(60); // 60 second cooldown
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
      trackUserAction('resend_verification_error', 'auth', email);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We've sent a verification link to your email address"
      showFeatures={false}
    >
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Check your email</h1>
          {email ? (
            <>
              <p className="text-muted-foreground">
                We've sent a verification link to
              </p>
              <p className="font-medium break-all">{email}</p>
            </>
          ) : (
            <p className="text-muted-foreground">
              We've sent a verification link to your email address
            </p>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Click the link in your email to verify your account. If you don't see it, check your spam folder.
          </p>

          {email && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend available in ${cooldown}s`
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          )}

          <Link to="/auth/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
