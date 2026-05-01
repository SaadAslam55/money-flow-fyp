// src/pages/auth/SignupPage.tsx
/**
 * Signup Page
 * User registration page with organization creation
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trackPageView } from '@/middleware/analyticsMiddleware';

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // SEO
  usePageTitle({
    title: 'Sign Up',
    description: 'Create your free Money Flow account and start managing your business finances today',
    keywords: 'sign up, register, create account, money flow, business management',
  });

  // Track page view
  useEffect(() => {
    trackPageView('/auth/signup', 'Sign Up');
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <AuthLayout
      title="Start your free trial today"
      subtitle="Join thousands of businesses managing their finances with Money Flow"
      showFeatures={true}
    >
      <SignupForm />
    </AuthLayout>
  );
}