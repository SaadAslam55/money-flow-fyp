Authentication Module
📖 Overview
The Authentication Module handles all user authentication, authorization, and session management in Money Flow. It provides secure signup, login, password reset, and role-based access control.
🎯 Module Objectives

Secure user authentication with email/password
Multi-tenant organization management
Role-based access control (RBAC)
Session management with auto-refresh
Password reset functionality
Email verification
Persistent authentication state

👥 User Roles Involved
RoleAccess LevelPermissionsSuper AdminFull SystemAll operations, system settingsAdminOrganizationFull org access, user managementManagerDepartmentView reports, manage operationsAccountantFinancialInvoices, transactions, reportsCashierLimitedCreate invoices, record paymentsCustomerPortal OnlyView own invoices, make payments
🏗️ Architecture
Authentication Flow:
┌─────────────┐ ┌──────────────┐ ┌────────────┐
│ Client │────▶│ Auth Store │────▶│ Supabase │
│ (React) │◀────│ (Zustand) │◀────│ Auth │
└─────────────┘ └──────────────┘ └────────────┘
│ │ │
│ │ │
▼ ▼ ▼
Protected Session State JWT Tokens
Routes (Local) (HttpOnly)
📁 File Structure
src/
├── components/auth/
│ ├── LoginForm.tsx ✅ Login form with validation
│ ├── SignupForm.tsx ✅ Registration with org creation
│ ├── ForgotPasswordForm.tsx ✅ Password reset request
│ ├── ResetPasswordForm.tsx ✅ New password form
│ └── TwoFactorAuth.tsx ⬜ 2FA setup (future)
│
├── pages/auth/
│ ├── LoginPage.tsx ✅ Login page layout
│ ├── SignupPage.tsx ✅ Registration page
│ ├── ForgotPasswordPage.tsx ✅ Password reset page
│ ├── ResetPasswordPage.tsx ✅ Reset password page
│ └── VerifyEmailPage.tsx ✅ Email verification
│
├── services/api/
│ └── authApi.ts ✅ Auth API operations
│
├── hooks/
│ └── useAuth.ts ✅ Authentication hook
│
├── stores/
│ └── authStore.ts ✅ Auth state management
│
├── schemas/
│ └── authSchemas.ts ✅ Zod validation schemas
│
├── types/
│ └── auth.types.ts ✅ TypeScript types
│
└── constants/
├── roles.ts ✅ Role definitions
└── permissions.ts ✅ Permission mappings
✅ Implementation Checklist
Phase 1: Core Setup ✅

Auth store with Zustand
Supabase client configuration
TypeScript types
Validation schemas
Role definitions
Permission mappings

Phase 2: UI Components ✅

Login form component
Signup form component
Forgot password form
Reset password form
Form validation with react-hook-form
Error handling and display

Phase 3: Pages ✅

Login page with branding
Signup page with terms
Forgot password page
Reset password page
Email verification page
Unauthorized page (403)

Phase 4: API Integration ✅

Sign in function
Sign up with org creation
Sign out function
Password reset request
Password update
Session refresh
Get current user

Phase 5: Auth Flow ✅

Protected route component
Auth state persistence
Auto-refresh tokens
Redirect after login
Handle auth errors
Loading states

Phase 6: Advanced Features ⬜

Two-factor authentication
Social login (Google, Microsoft)
Remember device
Session timeout warnings
Login activity tracking

🔑 Key Features

1. Secure Authentication
   typescript// Email/password with validation
   const { signIn } = useAuth();
   await signIn(email, password);
2. Multi-Tenant Organization
   typescript// Auto-creates organization on signup
   {
   user: User,
   organization: Organization,
   role: 'admin'
   }
3. Role-Based Access
   typescript// Permission checking
   hasPermission(user.role, 'create_invoices'); // true/false
4. Protected Routes
   tsx<ProtectedRoute allowedRoles={['admin', 'manager']}>
   <SettingsPage />
   </ProtectedRoute>
5. Persistent Sessions
   typescript// Auto-saves to localStorage
   {
   user: User,
   organization: Organization,
   isAuthenticated: true
   }
   🔐 Security Features

Password Requirements

Minimum 8 characters
One uppercase letter
One number
One special character

Session Management

JWT tokens with auto-refresh
Secure HTTP-only cookies
Session expiration handling

Rate Limiting

Login attempts limited
Password reset throttled
Account lockout on abuse

Email Verification

Required for account activation
Token-based verification
Expiration after 24 hours

📊 Database Schema
sql-- Users table
users {
id: uuid PRIMARY KEY,
organization_id: uuid REFERENCES organizations,
auth_user_id: uuid REFERENCES auth.users,
email: string UNIQUE,
full_name: string,
role: enum('super_admin', 'admin', 'manager', 'accountant', 'cashier', 'customer'),
avatar_url: text,
is_active: boolean,
last_login: timestamp,
created_at: timestamp,
updated_at: timestamp
}

-- Organizations table
organizations {
id: uuid PRIMARY KEY,
name: string,
subdomain: string UNIQUE,
email: string,
subscription_plan: enum('free', 'pro', 'enterprise'),
subscription_status: enum('active', 'past_due', 'cancelled'),
created_at: timestamp,
updated_at: timestamp
}
🔄 API Endpoints
EndpointMethodPurpose/auth/signupPOSTCreate account/auth/loginPOSTSign in/auth/logoutPOSTSign out/auth/reset-passwordPOSTRequest reset/auth/update-passwordPATCHUpdate password/auth/verify-emailPOSTVerify email/auth/refreshPOSTRefresh token
🧪 Testing
typescript// Test login flow
test('should login successfully', async () => {
const { result } = renderHook(() => useAuth());

await act(async () => {
await result.current.signIn('test@example.com', 'password123');
});

expect(result.current.isAuthenticated).toBe(true);
expect(result.current.user).toBeDefined();
});
🐛 Common Issues & Solutions
Issue: Session expires too quickly
Solution: Increase token expiration in Supabase settings:
typescript// supabase/config.toml
[auth]
jwt_expiry = 3600 # 1 hour
refresh_token_rotation_enabled = true
Issue: Login fails silently
Solution: Check RLS policies:
sql-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for viewing own user data
CREATE POLICY "users_view_own" ON users
FOR SELECT USING (auth.uid() = auth_user_id);
Issue: Role permissions not working
Solution: Verify role is set correctly:
typescript// After signup, ensure role is set
const { data: userData } = await supabase
.from('users')
.insert({ role: 'admin', ... })
.select()
.single();

```

## 📚 Related Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Role-Based Access Control](../architecture/rbac.md)
- [Security Best Practices](../architecture/security.md)

## 🎓 Learning Resources

- [JWT Authentication](https://jwt.io/introduction)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

```
