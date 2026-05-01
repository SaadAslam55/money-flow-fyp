// src/pages/auth/LoginPage.tsx
/**
 * Login Page
 * User authentication page with email/password login
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trackPageView } from '@/middleware/analyticsMiddleware';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // SEO
  usePageTitle({
    title: 'Login',
    description: 'Sign in to your Money Flow account to manage your business finances',
    keywords: 'login, sign in, money flow, business management',
  });

  // Track page view
  useEffect(() => {
    trackPageView('/auth/login', 'Login');
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Get redirect path from location state or default to dashboard
      const from = (location.state as { from?: string })?.from ?? '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.state]);

  return (
    <AuthLayout
      title="Manage your business finances with ease"
      subtitle="All-in-one platform for invoicing, inventory, and accounting"
      showFeatures={true}
    >
      <LoginForm />
    </AuthLayout>
  );
}