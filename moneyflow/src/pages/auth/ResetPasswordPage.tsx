// src/pages/auth/ResetPasswordPage.tsx
/**
 * Reset Password Page
 * New password setup page after clicking reset link
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trackPageView } from '@/middleware/analyticsMiddleware';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  // SEO
  usePageTitle({
    title: 'Reset Password',
    description: 'Set a new password for your Money Flow account',
    keywords: 'reset password, new password, password change',
  });

  // Track page view
  useEffect(() => {
    trackPageView('/auth/reset-password', 'Reset Password');
  }, []);

  // Check if token is present in URL
  const token = searchParams.get('token');
  const hasToken = !!token;

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter your new password below to complete the reset process"
      showFeatures={false}
    >
      {!hasToken && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid or missing reset token. Please request a new password reset link.
          </AlertDescription>
        </Alert>
      )}
      <ResetPasswordForm />
    </AuthLayout>
  );
}