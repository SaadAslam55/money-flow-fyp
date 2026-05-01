---
description: Complete backend setup with email verification and MCP integration
---

# Backend Setup with MCP & Email Verification

## 1. Environment Setup

Create `.env.local` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ACCESS_TOKEN=your_access_token_for_mcp

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_DOMAIN=yourdomain.com
EMAIL_FROM=noreply@yourdomain.com

# Application
APP_URL=https://yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

## 2. Deploy Edge Functions

// turbo
```bash
# Deploy auth verification function
supabase functions deploy auth-verification

# Deploy AI processing function
supabase functions deploy ai-processing

# Deploy all other functions
supabase functions deploy send-invoice-email
supabase functions deploy stripe-webhook
supabase functions deploy payment-webhook
supabase functions deploy pakistani-payment-webhook
```

## 3. Configure Supabase Auth

In Supabase Dashboard → Authentication → Settings:

1. **Site URL**: `https://yourdomain.com`
2. **Redirect URLs**: Add:
   - `https://yourdomain.com/auth/verify-email`
   - `https://yourdomain.com/auth/reset-password`
   - `https://yourdomain.com/auth/callback`
3. **Enable Email Confirmations**: ON
4. **Secure Email Change**: ON
5. **Confirm Email Link**: Enabled

## 4. Database Setup

Enable RLS policies for security:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    performed_by UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## 5. MCP Configuration

The MCP servers are already configured in `c:\Users\DELL\.codeium\windsurf\mcp_config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

## 6. Email Templates

Configure email templates in Supabase Dashboard → Authentication → Email Templates:

**Confirm Signup**:
```html
<h2>Confirm your email</h2>
<p>Click the link below to verify your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>
<p>Or use this code: {{ .Token }}</p>
<p>Expires in 1 hour.</p>
```

**Reset Password**:
```html
<h2>Reset your password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>Or use this code: {{ .Token }}</p>
<p>Expires in 1 hour.</p>
```

## 7. Security Checklist

- [ ] Environment variables are set (not in code)
- [ ] RLS enabled on all tables
- [ ] Email confirmations enabled
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] CORS properly configured
- [ ] Service role key secured (server-side only)
- [ ] PKCE flow enabled
- [ ] HTTPS in production
- [ ] Secure session storage

## 8. Verification Flow

Frontend handles email verification:

1. **Signup** → User receives email → Clicks link → `/auth/verify-email?token=xyz`
2. **Verify Page** → Extracts token → Calls `verifyEmail(token)`
3. **Success** → Redirects to dashboard
4. **Failure** → Shows error + resend option

## 9. Health Monitoring

Check system health:

```typescript
// Check all services
const health = await Promise.all([
  checkAIEdgeHealth(),
  checkAuthHealth(),
  checkDatabaseHealth(),
]);
```

## 10. Troubleshooting

**Email not received**:
- Check spam folder
- Verify Resend API key
- Check Supabase email logs
- Use MCP: `get_logs` for edge function

**Verification fails**:
- Check token expiration (1 hour)
- Verify redirect URLs match
- Check browser console for errors
- Use MCP: `execute_sql` to check user status

**Rate limited**:
- Wait 1 minute between requests
- Check `X-RateLimit-Remaining` header
- Contact support if persistent
