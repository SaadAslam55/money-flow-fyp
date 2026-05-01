# Settings Module

## 📖 Overview

The Settings Module provides configuration management for business profile, users, integrations, and system preferences.

## 🎯 Module Objectives

- Manage business profile
- Configure tax settings
- Manage team members
- Set up integrations
- Configure notifications
- Customize invoice templates
- Manage API access
- Set preferences

## 👥 User Roles Involved

| Role           | Access Level | Permissions                   |
| -------------- | ------------ | ----------------------------- |
| **Admin**      | Full Access  | All settings                  |
| **Manager**    | Limited      | View most, edit some settings |
| **Accountant** | View Only    | View business settings only   |

## 🏗️ Architecture

```
Settings Flow:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Settings   │────▶│ Validation   │────▶│  Database   │
│    Form     │     │ & Processing │     │  (Supabase) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                     │                    │
       ▼                     ▼                    ▼
  User Input          Schema Check        Organization
  Changes             Permission          Record Update
                      Verification         + Cache Clear
```

## 📁 File Structure

```
src/
├── components/settings/
│   ├── BusinessProfile.tsx          ⬜ Company info
│   ├── TaxSettings.tsx              ⬜ Tax configuration
│   ├── TeamManagement.tsx           ⬜ User management
│   ├── InvoiceSettings.tsx          ⬜ Invoice customization
│   ├── NotificationSettings.tsx     ⬜ Email/SMS preferences
│   ├── IntegrationSettings.tsx      ⬜ Third-party apps
│   ├── APISettings.tsx              ⬜ API key management
│   └── PreferenceSettings.tsx       ⬜ User preferences
│
├── pages/settings/
│   ├── SettingsPage.tsx             ⬜ Settings layout
│   ├── BusinessSettingsPage.tsx     ⬜ Business settings
│   ├── TeamSettingsPage.tsx         ⬜ Team management
│   └── IntegrationsPage.tsx         ⬜ Integrations setup
│
├── services/api/
│   ├── organizationApi.ts           ⬜ Organization CRUD
│   ├── userApi.ts                   ⬜ User management
│   └── settingsApi.ts               ⬜ Settings operations
│
└── hooks/
    ├── useOrganization.ts           ⬜ Organization hooks
    ├── useTeamMembers.ts            ⬜ Team hooks
    └── useSettings.ts               ⬜ Settings hooks
✅ Implementation Checklist
Phase 1: Business Profile ⬜

 Company information form
 Logo upload
 Address management
 Tax ID configuration
 Fiscal year settings
 Currency selection
 Timezone settings

Phase 2: Team Management ⬜

 User list view
 Invite team members
 Role assignment
 Permission management
 Deactivate users
 Activity log

Phase 3: Invoice Settings ⬜

 Default terms & notes
 Invoice number format
 Tax rate defaults
 Payment terms
 Late fee configuration
 Template customization

Phase 4: Integrations ⬜

 Email service (SendGrid/Resend)
 SMS service (Twilio)
 Payment gateway (Stripe)
 Accounting software
 CRM integration
 Webhook setup

Phase 5: Notifications ⬜

 Email notifications
 SMS notifications
 In-app notifications
 Notification preferences
 Alert thresholds

Phase 6: API & Security ⬜

 API key generation
 Webhook management
 Rate limiting
 IP whitelisting
 Two-factor authentication
 Session management

🔑 Key Features
1. Business Profile Management
typescriptexport async function updateOrganization(
  organizationId: string,
  updates: Partial<Organization>,
  logoFile?: File
) {
  let logoUrl = updates.logo_url;

  // Upload new logo if provided
  if (logoFile) {
    const fileName = `${organizationId}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
    const { url, error } = await uploadFile('logos', fileName, logoFile);

    if (error) throw error;
    logoUrl = url;

    // Delete old logo if exists
    if (updates.logo_url) {
      const oldPath = updates.logo_url.split('/logos/')[1];
      if (oldPath) await deleteFile('logos', oldPath);
    }
  }

  const { data, error } = await supabase
    .from('organizations')
    .update({
      ...updates,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)
    .select()
    .single();

  if (error) throw error;
  return { data, error: null };
}
2. Team Member Management
typescriptexport async function inviteTeamMember(
  organizationId: string,
  email: string,
  role: UserRole,
  invitedBy: string
) {
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .eq('organization_id', organizationId)
    .single();

  if (existingUser) {
    throw new Error('User already exists in this organization');
  }

  // Create invite token
  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Store invitation
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email,
      role,
      token: inviteToken,
      expires_at: expiresAt.toISOString(),
      invited_by: invitedBy,
    })
    .select()
    .single();

  if (error) throw error;

  // Send invitation email
  await sendInvitationEmail(email, inviteToken, organizationId);

  return { data: invitation, error: null };
}
3. Invoice Template Customization
typescriptexport async function updateInvoiceSettings(
  organizationId: string,
  settings: {
    invoice_prefix?: string;
    invoice_starting_number?: number;
    default_terms?: string;
    default_notes?: string;
    default_tax_rate?: number;
    payment_terms_days?: number;
    late_fee_percentage?: number;
  }
) {
  const { data, error } = await supabase
    .from('invoice_settings')
    .upsert({
      organization_id: organizationId,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return { data, error: null };
}
4. API Key Management
typescriptexport async function generateAPIKey(
  organizationId: string,
  name: string,
  permissions: string[]
) {
  // Generate secure API key
  const apiKey = `sk_${organizationId.slice(0, 8)}_${crypto.randomUUID().replace(/-/g, '')}`;

  // Hash the key for storage
  const hashedKey = await hashAPIKey(apiKey);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      organization_id: organizationId,
      name,
      key_hash: hashedKey,
      permissions,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  // Return the plain key only once (user must save it)
  return {
    data: {
      ...data,
      key: apiKey, // Only returned once
    },
    error: null,
  };
}

// Verify API key for requests
export async function verifyAPIKey(apiKey: string) {
  const hashedKey = await hashAPIKey(apiKey);

  const { data, error } = await supabase
    .from('api_keys')
    .select('*, organization:organizations(*)')
    .eq('key_hash', hashedKey)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('Invalid API key');
  }

  return data;
}
📊 Database Schema
sql-- Organization settings extension
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Invoice settings table
CREATE TABLE invoice_settings (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_prefix VARCHAR(10) DEFAULT 'INV',
  invoice_starting_number INTEGER DEFAULT 1,
  default_terms TEXT,
  default_notes TEXT,
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  payment_terms_days INTEGER DEFAULT 30,
  late_fee_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by UUID REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_notifications JSONB DEFAULT '{"invoices": true, "payments": true, "low_stock": true}',
  sms_notifications JSONB DEFAULT '{"invoices": false, "payments": false}',
  in_app_notifications JSONB DEFAULT '{"invoices": true, "payments": true, "low_stock": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
🔄 State Management
typescript// Organization hooks
export function useOrganization() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ updates, logo }: { updates: Partial<Organization>; logo?: File }) =>
      updateOrganization(organization!.id, updates, logo),
    onSuccess: (result) => {
      queryClient.setQueryData(['auth'], (old: any) => ({
        ...old,
        organization: result.data,
      }));
      toast.success('Business profile updated successfully');
    },
  });

  return {
    organization,
    updateOrganization: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

// Team management hooks
export function useTeamMembers() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['team-members', organization?.id],
    queryFn: () => getTeamMembers(organization!.id),
    enabled: !!organization?.id,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: UserRole }) =>
      inviteTeamMember(organization!.id, email, role, organization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members']);
      toast.success('Invitation sent successfully');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeTeamMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members']);
      toast.success('Team member removed successfully');
    },
  });

  return {
    teamMembers: query.data?.data || [],
    isLoading: query.isLoading,
    inviteTeamMember: inviteMutation.mutateAsync,
    removeTeamMember: removeMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
  };
}
🧪 Testing
typescript// Test organization update
test('should update organization with logo', async () => {
  const logoFile = new File(['logo'], 'logo.png', { type: 'image/png' });

  const result = await updateOrganization(
    organizationId,
    { name: 'Updated Name' },
    logoFile
  );

  expect(result.data.name).toBe('Updated Name');
  expect(result.data.logo_url).toBeDefined();
});

// Test team invitation
test('should send team invitation', async () => {
  const result = await inviteTeamMember(
    organizationId,
    'newmember@example.com',
    'accountant',
    adminUserId
  );

  expect(result.data.email).toBe('newmember@example.com');
  expect(result.data.role).toBe('accountant');
  expect(result.data.token).toBeDefined();
});

// Test API key generation
test('should generate unique API key', async () => {
  const result = await generateAPIKey(
    organizationId,
    'Production Key',
    ['invoices:read', 'invoices:write']
  );

  expect(result.data.key).toMatch(/^sk_[a-f0-9]{8}_[a-f0-9]{32}$/);
  expect(result.data.permissions).toEqual(['invoices:read', 'invoices:write']);
});
📚 Related Documentation

Team Management Guide
API Documentation
Integration Setup

```
