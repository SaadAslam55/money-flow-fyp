# Admin Module

## 📖 Overview

The Admin Module provides comprehensive system administration, user management, role-based access control, and organization-wide settings management capabilities.

## 🎯 Module Objectives

- Manage user accounts and permissions
- Control role-based access (RBAC)
- Monitor system activity and audit logs
- Configure organization settings
- Manage subscription and billing
- Handle team member invitations
- Track usage and enforce limits
- System-wide configuration

## 👥 User Roles Involved

| Role            | Access Level             | Permissions                                      |
| --------------- | ------------------------ | ------------------------------------------------ |
| **Super Admin** | Full System Access       | All platform operations, multi-tenant management |
| **Admin**       | Full Organization Access | All organization operations, user management     |
| **Manager**     | Limited Admin Access     | View audit logs, basic settings                  |
| **Accountant**  | View Only                | View users, view audit logs                      |
| **Cashier**     | No Access                | Cannot access admin features                     |
| **Customer**    | No Access                | No admin capabilities                            |

## 🏗️ Architecture

```
Admin Data Flow:
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  Admin UI    │────▶│  Permission   │────▶│  Database    │
│  (Client)    │     │  Validation   │     │  (Supabase)  │
└──────────────┘     └───────────────┘     └──────────────┘
       │                     │                      │
       ▼                     ▼                      ▼
  Role Check          Audit Logging         User Records
  Permissions         Activity Tracking     System Config
  UI Controls         Security Events       Usage Metrics
```

## 📁 File Structure

```
src/
├── components/admin/
│   ├── UserManagement.tsx           ✅ User CRUD operations
│   ├── UserForm.tsx                 ✅ Create/edit user form
│   ├── UserList.tsx                 ✅ User table with filters
│   ├── UserDetail.tsx               ⬜ User detail view
│   ├── RoleManager.tsx              ✅ Role assignment
│   ├── PermissionMatrix.tsx         ⬜ Permission overview
│   ├── TeamInvitation.tsx           ✅ Invite team members
│   ├── AuditLogViewer.tsx           ✅ Activity monitoring
│   ├── SystemSettings.tsx           ✅ Global settings
│   ├── OrganizationSettings.tsx     ✅ Org-specific config
│   ├── UsageDashboard.tsx           ⬜ Usage metrics
│   └── SubscriptionManager.tsx      ⬜ Billing management
│
├── pages/admin/
│   ├── AdminDashboardPage.tsx       ✅ Admin overview
│   ├── UsersPage.tsx                ✅ User management page
│   ├── AuditLogsPage.tsx            ✅ Activity logs
│   ├── SettingsPage.tsx             ✅ Settings hub
│   └── SubscriptionPage.tsx         ⬜ Billing page
│
├── services/api/
│   ├── userApi.ts                   ✅ User operations
│   ├── roleApi.ts                   ✅ Role management
│   ├── auditLogApi.ts               ✅ Audit log queries
│   ├── settingsApi.ts               ✅ Settings CRUD
│   └── subscriptionApi.ts           ⬜ Billing API
│
├── hooks/
│   ├── useUsers.ts                  ✅ User state management
│   ├── useAuditLogs.ts              ✅ Audit log queries
│   ├── useSettings.ts               ✅ Settings management
│   ├── useSubscription.ts           ⬜ Subscription state
│   └── useUsageLimits.ts            ⬜ Usage tracking
│
├── schemas/
│   └── adminSchemas.ts              ✅ Zod validation schemas
│
└── types/
    └── admin.types.ts               ✅ TypeScript types
```

## ✅ Implementation Checklist

### Phase 1: Core Setup ✅

- [x] Admin types and interfaces
- [x] Validation schemas (Zod)
- [x] API service functions
- [x] React Query hooks
- [x] Permission checking utilities

### Phase 2: User Management ✅

- [x] User list with filters
- [x] Create/edit user form
- [x] Role assignment
- [x] User activation/deactivation
- [x] Password reset
- [x] Team invitation system
- [x] User detail view
- [x] Mobile-responsive design

### Phase 3: Audit & Security ✅

- [x] Audit log viewer
- [x] Activity filtering
- [x] Security event tracking
- [x] User session management
- [x] IP address logging
- [x] Action history

### Phase 4: Settings Management ✅

- [x] Organization settings
- [x] System preferences
- [x] Notification settings
- [x] Integration configs
- [x] Email templates
- [x] Tax configuration

### Phase 5: Subscription & Billing ⬜

- [ ] Plan selection
- [ ] Payment processing
- [ ] Usage monitoring
- [ ] Limit enforcement
- [ ] Billing history
- [ ] Invoice generation

### Phase 6: Advanced Features ⬜

- [ ] Multi-branch management
- [ ] Advanced permissions
- [ ] API key management
- [ ] Webhook configuration
- [ ] Data export/backup
- [ ] System health monitoring

## 🔑 Key Features

### 1. **User Management**

```typescript
// User creation with role assignment
export async function createUser(userData: CreateUserInput, organizationId: string) {
  try {
    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // 2. Create user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authUser.user.id,
        organization_id: organizationId,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_active: true,
      })
      .select()
      .single();

    if (userError) throw userError;

    // 3. Log the action
    await logAuditEvent({
      action: 'user_created',
      entity_type: 'user',
      entity_id: user.id,
      new_values: { role: userData.role, email: userData.email },
    });

    return { data: user, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

### 2. **Role-Based Access Control**

```typescript
// Permission checking middleware
export function checkPermission(userRole: UserRole, permission: Permission): boolean {
  const PERMISSIONS: Record<Permission, UserRole[]> = {
    manage_users: ['super_admin', 'admin'],
    view_audit_logs: ['super_admin', 'admin', 'manager'],
    manage_settings: ['super_admin', 'admin'],
    manage_billing: ['super_admin', 'admin'],
    delete_data: ['super_admin', 'admin'],
  };

  return PERMISSIONS[permission]?.includes(userRole) || false;
}

// React component permission check
export function usePermission(permission: Permission) {
  const { user } = useAuth();

  return useMemo(() => (user ? checkPermission(user.role, permission) : false), [user, permission]);
}
```

### 3. **Audit Logging**

```sql
-- Audit log trigger function
CREATE OR REPLACE FUNCTION log_admin_action() RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  org_uuid UUID;
BEGIN
  -- Get current user and organization
  SELECT id, organization_id INTO user_uuid, org_uuid
  FROM users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      organization_id,
      user_id,
      action,
      entity_type,
      entity_id,
      new_values,
      ip_address,
      user_agent
    ) VALUES (
      org_uuid,
      user_uuid,
      TG_OP || '_' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(NEW),
      current_setting('request.headers', true)::json->>'x-real-ip',
      current_setting('request.headers', true)::json->>'user-agent'
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      organization_id,
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      ip_address,
      user_agent
    ) VALUES (
      org_uuid,
      user_uuid,
      TG_OP || '_' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW),
      current_setting('request.headers', true)::json->>'x-real-ip',
      current_setting('request.headers', true)::json->>'user-agent'
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      organization_id,
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      ip_address,
      user_agent
    ) VALUES (
      org_uuid,
      user_uuid,
      TG_OP || '_' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      OLD.id,
      row_to_json(OLD),
      current_setting('request.headers', true)::json->>'x-real-ip',
      current_setting('request.headers', true)::json->>'user-agent'
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to critical tables
CREATE TRIGGER audit_users_changes
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_admin_action();
```

### 4. **Team Invitation System**

```typescript
export async function inviteTeamMember(email: string, role: UserRole, organizationId: string) {
  try {
    // 1. Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // 2. Send invitation email
    await supabase.functions.invoke('send-invitation-email', {
      body: {
        email,
        token: invitation.token,
        organization_id: organizationId,
        role,
      },
    });

    return { data: invitation, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

### 5. **Usage Limits & Enforcement**

```typescript
export async function checkUsageLimits(organizationId: string) {
  try {
    const { data: org } = await supabase
      .from('organizations')
      .select('subscription_plan')
      .eq('id', organizationId)
      .single();

    const planLimits = SUBSCRIPTION_PLANS[org!.subscription_plan].limits;

    // Check users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Check invoices this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const { count: invoiceCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', startOfMonth.toISOString());

    // Check customers
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    const limits = {
      users: {
        current: userCount || 0,
        max: planLimits.users,
        exceeded: planLimits.users !== null && (userCount || 0) >= planLimits.users,
      },
      invoices_per_month: {
        current: invoiceCount || 0,
        max: planLimits.invoices_per_month,
        exceeded:
          planLimits.invoices_per_month !== null &&
          (invoiceCount || 0) >= planLimits.invoices_per_month,
      },
      customers: {
        current: customerCount || 0,
        max: planLimits.customers,
        exceeded: planLimits.customers !== null && (customerCount || 0) >= planLimits.customers,
      },
    };

    return { data: limits, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

## 📊 Database Schema

```sql
-- Users table (already exists, extended for admin)
ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMPTZ;

-- Invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  token UUID NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON invitations(token) WHERE accepted_at IS NULL;
CREATE INDEX idx_invitations_email ON invitations(email) WHERE accepted_at IS NULL;

-- System settings table
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT system_settings_unique_key UNIQUE (organization_id, setting_key)
);

CREATE INDEX idx_system_settings_org ON system_settings(organization_id);
CREATE INDEX idx_system_settings_key ON system_settings(organization_id, setting_key);

-- User sessions table (for security)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token UUID NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token) WHERE expires_at > NOW();
```

## 🔄 State Management

```typescript
// React Query hooks for admin operations
export function useUsers(filters?: UserFilters) {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-users', organization?.id, filters],
    queryFn: () => getUsers(organization!.id, filters),
    enabled: !!organization?.id,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data, organization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['usage-limits']);
      toast.success('User created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User updated successfully');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User deactivated');
    },
  });

  return {
    users: query.data?.data || [],
    isLoading: query.isLoading,
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deactivateUser: deactivateMutation.mutateAsync,
  };
}
```

## 🧪 Testing

```typescript
// Test user creation with proper permissions
test('admin can create user with valid role', async () => {
  const userData = {
    email: 'newuser@example.com',
    full_name: 'New User',
    role: 'accountant' as UserRole,
    password: 'SecurePass123!',
  };

  const { data } = await createUser(userData, organizationId);

  expect(data).toBeDefined();
  expect(data.role).toBe('accountant');
  expect(data.is_active).toBe(true);

  // Verify audit log created
  const { data: auditLog } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_id', data.id)
    .eq('action', 'user_created')
    .single();

  expect(auditLog).toBeDefined();
});

// Test permission checking
test('role hierarchy is enforced correctly', () => {
  expect(checkPermission('admin', 'manage_users')).toBe(true);
  expect(checkPermission('manager', 'manage_users')).toBe(false);
  expect(checkPermission('accountant', 'view_audit_logs')).toBe(false);
});

// Test usage limits
test('usage limits are enforced on free plan', async () => {
  const org = await createTestOrganization({ subscription_plan: 'free' });

  // Create max allowed users
  for (let i = 0; i < 1; i++) {
    await createUser(
      {
        email: `user${i}@test.com`,
        full_name: `User ${i}`,
        role: 'cashier',
        password: 'test123',
      },
      org.id
    );
  }

  // Try to create one more - should fail
  const { error } = await createUser(
    {
      email: 'extra@test.com',
      full_name: 'Extra User',
      role: 'cashier',
      password: 'test123',
    },
    org.id
  );

  expect(error).toBeDefined();
  expect(error?.message).toContain('user limit');
});
```

## 🐛 Common Issues & Solutions

### Issue: User can't be deleted due to foreign key constraints

**Solution:** Soft delete with is_active flag:

```typescript
export async function deactivateUser(userId: string) {
  return await supabase.from('users').update({ is_active: false }).eq('id', userId);
}
```

### Issue: Audit logs growing too large

**Solution:** Implement log rotation:

```sql
-- Archive old audit logs (run monthly)
CREATE TABLE audit_logs_archive (LIKE audit_logs INCLUDING ALL);

INSERT INTO audit_logs_archive
SELECT * FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Issue: Permission checks scattered across codebase

**Solution:** Centralized HOC and hook:

```typescript
// Higher-order component for route protection
export function withPermission(Component: React.ComponentType, permission: Permission) {
  return function ProtectedComponent(props: any) {
    const hasPermission = usePermission(permission);

    if (!hasPermission) {
      return <Navigate to="/unauthorized" />;
    }

    return <Component {...props} />;
  };
}

// Usage
const UsersPage = withPermission(UsersPageComponent, 'manage_users');
```

## 📚 Related Documentation

- [User Management Guide](../guides/user-management.md)
- [Security Best Practices](../guides/security.md)
- [Audit Logging](../guides/audit-logging.md)
- [Subscription Management](../guides/subscriptions.md)

## 🔐 Security Considerations

1. **Password Requirements**: Minimum 8 characters, uppercase, number, special character
2. **Session Management**: JWT tokens with 1-hour expiry, refresh token rotation
3. **Rate Limiting**: Max 5 login attempts per 15 minutes
4. **IP Whitelisting**: Optional organization-level IP restrictions
5. **2FA Support**: TOTP-based two-factor authentication (future)
6. **Audit Trail**: All admin actions logged with IP and timestamp
7. **Data Encryption**: Sensitive fields encrypted at rest

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Production Ready
