// src/pages/auth/ForgotPasswordPage.tsx
/**
 * Forgot Password Page
 * Password reset request page
 */

import { useEffect } from 'react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trackPageView } from '@/middleware/analyticsMiddleware';

export default function ForgotPasswordPage() {
  // SEO
  usePageTitle({
    title: 'Forgot Password',
    description: 'Reset your Money Flow account password',
    keywords: 'forgot password, reset password, password reset',
  });

  // Track page view
  useEffect(() => {
    trackPageView('/auth/forgot-password', 'Forgot Password');
  }, []);

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a password reset link"
      showFeatures={false}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}