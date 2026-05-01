# Backend Setup Guide - Industry Standard

Complete backend configuration with email verification, MCP integration, and enterprise-grade security.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [MCP Integration](#mcp-integration)
3. [Email Verification Flow](#email-verification-flow)
4. [Security Features](#security-features)
5. [Health Monitoring](#health-monitoring)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
├─────────────────────────────────────────────────────────────┤
│  Auth Pages → VerifyEmailPage → AuthCallbackPage           │
│  Hooks → useAuth, useUser, useSystemHealth                  │
│  Services → systemHealth, aiEdgeService                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Platform                          │
├─────────────────────────────────────────────────────────────┤
│  Auth: Email/Password, OAuth, Magic Link                   │
│  Database: PostgreSQL with RLS                             │
│  Realtime: WebSocket subscriptions                         │
│  Storage: File uploads                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Edge Functions                             │
├─────────────────────────────────────────────────────────────┤
│  auth-verification: Email verification, OTP                │
│  ai-processing: Revenue prediction, anomaly detection       │
│  send-invoice-email: Email delivery via Resend             │
│  stripe-webhook: Payment processing                          │
└─────────────────────────────────────────────────────────────┘
```

## MCP Integration

### Available MCP Servers

The project uses Model Context Protocol (MCP) for AI-assisted development:

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

### MCP Commands Available

| Command | Description | Usage |
|---------|-------------|-------|
| `list_tables` | List database tables | `list_tables` |
| `execute_sql` | Run SQL queries | `execute_sql SELECT * FROM users` |
| `apply_migration` | Apply database migrations | `apply_migration name query` |
| `deploy_edge_function` | Deploy edge function | `deploy_edge_function name files` |
| `check_health` | Check service health | `check_health` |

## Email Verification Flow

### 1. User Signup
```
User → SignupForm → supabase.auth.signUp()
                          ↓
                    Email sent with token
                          ↓
                    VerifyEmailPage ("Check your email")
```

### 2. Email Link Click
```
Email Link → /auth/callback?token_hash=xxx&type=signup
                  ↓
           AuthCallbackPage
                  ↓
           supabase.auth.verifyOtp()
                  ↓
           Success → /dashboard
           Error → Error message + resend option
```

### 3. Resend Verification
```
VerifyEmailPage → resendVerification(email)
                        ↓
                  supabase.auth.resend()
                        ↓
                  New email sent
```

## Security Features

### Authentication Security

| Feature | Implementation | Status |
|---------|---------------|--------|
| Email Verification | Required before access | ✅ |
| Password Reset | Token-based with expiration | ✅ |
| Session Management | Auto-refresh, secure storage | ✅ |
| Rate Limiting | 5 requests/min per IP/email | ✅ |
| PKCE Flow | OAuth security enhancement | ✅ |
| Audit Logging | All auth events logged | ✅ |

### Database Security

```sql
-- RLS Policies Example
CREATE POLICY users_organization_isolation ON users
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE auth_user_id = auth.uid()
    ));
```

### Edge Function Security

```typescript
// Rate limiting
const rateLimit = checkRateLimit(clientIp);
if (!rateLimit.allowed) {
  return corsErrorResponse(new Error('Too many requests'), 429, req);
}

// Auth verification
const { user, error } = await verifyAuth(request);
if (error) {
  return corsErrorResponse(error, 401, request);
}
```

## Health Monitoring

### System Health Check

```typescript
import { checkSystemHealth } from '@/services/health';

const health = await checkSystemHealth();
// {
//   healthy: true,
//   overallStatus: 'healthy',
//   timestamp: '2024-01-15T10:30:00Z',
//   services: [
//     { name: 'Database', status: 'healthy', responseTime: 45 },
//     { name: 'Auth', status: 'healthy', responseTime: 23 },
//     { name: 'AI Edge', status: 'healthy', responseTime: 120 },
//   ]
// }
```

### Service Status Dashboard

| Service | Endpoint | Health Check |
|---------|----------|--------------|
| Database | Supabase | `checkServiceHealth('database')` |
| Auth | Supabase Auth | `checkServiceHealth('auth')` |
| AI Processing | Edge Function | `checkAIEdgeHealth()` |
| Auth Verification | Edge Function | `checkAuthHealth()` |
| Realtime | Supabase Realtime | `checkServiceHealth('realtime')` |
| Storage | Supabase Storage | `checkServiceHealth('storage')` |

## Deployment

### 1. Environment Variables

Create `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ACCESS_TOKEN=sbp_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_DOMAIN=yourapp.com
EMAIL_FROM=noreply@yourapp.com

# Application
APP_URL=https://yourapp.com
VITE_APP_URL=https://yourapp.com
```

### 2. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy auth-verification
supabase functions deploy ai-processing
supabase functions deploy send-invoice-email
supabase functions deploy stripe-webhook

# Or deploy all at once
supabase functions deploy
```

### 3. Apply Database Migrations

```bash
# Via MCP
apply_migration add_audit_logs "CREATE TABLE audit_logs (...)"

# Or via CLI
supabase migration up
```

### 4. Configure Supabase Auth Settings

In Supabase Dashboard → Authentication → Settings:

- **Site URL**: `https://yourapp.com`
- **Redirect URLs**:
  - `https://yourapp.com/auth/callback`
  - `https://yourapp.com/auth/verify-email`
  - `https://yourapp.com/auth/reset-password`
- **Email Confirmations**: Enabled
- **Secure Email Change**: Enabled

### 5. Email Templates

**Confirm Signup**:
```html
<h2>Welcome to Money Flow!</h2>
<p>Please verify your email by clicking the link below:</p>
<a href="{{ .ConfirmationURL }}">Verify Email</a>
<p>Or use code: {{ .Token }}</p>
```

**Reset Password**:
```html
<h2>Reset Your Password</h2>
<p>Click to reset your password:</p>
<a href="{{ .ConfirmationURL }}">Reset Password</a>
<p>Or use code: {{ .Token }}</p>
```

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify Resend API key is set
3. Check Supabase Auth → Logs
4. Use MCP: `get_logs auth`

### Verification Link Not Working

1. Check token hasn't expired (1 hour limit)
2. Verify redirect URL matches Supabase settings
3. Check browser console for errors
4. Use MCP: `execute_sql SELECT * FROM auth.users WHERE email='user@example.com'`

### Edge Function Errors

1. Check function logs: `supabase functions logs auth-verification`
2. Verify environment variables are set
3. Test locally: `supabase functions serve auth-verification`
4. Use MCP: `get_logs edge-function`

### Rate Limiting

Default limits:
- 5 requests per minute per IP
- 60 second cooldown for resend

To adjust, modify in `supabase/functions/auth-verification/index.ts`:
```typescript
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;
```

## Security Checklist

- [ ] Environment variables in `.env.local` (not in code)
- [ ] RLS enabled on all tables
- [ ] Service role key only in Edge Functions
- [ ] Email confirmations enabled
- [ ] Secure password requirements (8+ chars, complexity)
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] HTTPS only in production
- [ ] CORS properly configured
- [ ] PKCE flow for OAuth

## Support

For issues with:
- **Supabase MCP**: Check `.codeium/windsurf/mcp_config.json`
- **Edge Functions**: Check `supabase/functions/README.md`
- **Auth Flow**: Check `src/components/auth/authentication-module.md`

## License

MIT License - See LICENSE file for details.
