# Deployment Guide

This guide covers deploying Money Flow v2.0 to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Frontend Deployment](#frontend-deployment)
- [Supabase Configuration](#supabase-configuration)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Edge Functions](#edge-functions)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)

## Prerequisites

Before deployment, ensure you have:

- ✅ Supabase project (production instance)
- ✅ GitHub account for CI/CD
- ✅ Domain name (optional but recommended)
- ✅ SSL certificate (handled automatically by most platforms)
- ✅ Verified email sending domain

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Step 1: Push to GitHub**

```bash
git add -A
git commit -m "feat: ready for production deployment"
git push origin main
```

**Step 2: Import to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

**Step 3: Environment Variables**

Add these in Vercel dashboard:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-domain.com
```

**Step 4: Deploy**

Click "Deploy" and wait for build to complete.

**Step 5: Custom Domain (Optional)**

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Option 2: Netlify

**Step 1: Install Netlify CLI**

```bash
npm install -g netlify-cli
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Deploy**

```bash
netlify deploy --prod --dir=dist
```

**Step 4: Configure**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### Option 3: AWS Amplify

**Step 1: Connect Repository**

1. Go to AWS Amplify Console
2. Choose "Host web app"
3. Connect your Git provider

**Step 2: Build Settings**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Step 3: Environment Variables**

Add in Amplify console under Environment Variables.

## Supabase Configuration

### Step 1: Create Production Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set strong database password
5. Wait for project to be ready

### Step 2: Get API Credentials\*\*

From Project Settings → API:

- Project URL
- anon/public key
- service_role key (keep secret!)

### Step 3: Configure Auth

**Email Templates**

Go to Authentication → Email Templates:

1. **Confirm Signup**:
   - Redirect URL: `https://your-domain.com/auth/callback`

2. **Reset Password**:
   - Redirect URL: `https://your-domain.com/auth/reset-password`

3. **Magic Link**:
   - Redirect URL: `https://your-domain.com/auth/callback`

**Auth Providers**

Enable desired providers:

- Email (enabled by default)
- Google (optional)
- GitHub (optional)

**Site URL Configuration**

Set in Authentication → URL Configuration:

- Site URL: `https://your-domain.com`
- Redirect URLs: `https://your-domain.com/**`

## Environment Variables

### Production .env

**Never commit this file!**

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx

# App
VITE_APP_URL=https://your-domain.com
VITE_APP_NAME=Money Flow
NODE_ENV=production

# Optional: Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Optional: Error Tracking
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Optional: Payments
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

### Setting in Hosting Platform

**Vercel:**

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Netlify:**

```bash
netlify env:set VITE_SUPABASE_URL "your-value"
netlify env:set VITE_SUPABASE_ANON_KEY "your-value"
```

## Database Migrations

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Link to Production

```bash
supabase link --project-ref your-project-ref
```

Enter your database password when prompted.

### Step 3: Run Migrations

```bash
# Check status
supabase db diff

# Apply all migrations
supabase db push
```

### Step 4: Verify

```bash
supabase db remote status
```

### Important Notes

- ⚠️ Always test migrations locally first
- ⚠️ Backup database before migrations
- ⚠️ Run migrations during low-traffic periods
- ⚠️ Have rollback plan ready

## Edge Functions

### Step 1: Review Functions

Ensure all Edge Functions are tested:

```bash
supabase functions serve
```

### Step 2: Deploy All Functions

```bash
supabase functions deploy
```

### Step 3: Deploy Specific Function

```bash
supabase functions deploy function-name
```

### Step 4: Set Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
supabase secrets set RESEND_API_KEY=re_xxxxx
```

### Step 5: Verify

```bash
supabase functions list
```

## Post-Deployment

### 1. Verify Deployment

**Checklist:**

- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] Database queries work
- [ ] API calls succeed
- [ ] Realtime subscriptions work
- [ ] File uploads work
- [ ] Email sending works
- [ ] Error tracking active
- [ ] SSL certificate valid

### 2. Create Super Admin

```sql
-- Run in Supabase SQL Editor
INSERT INTO users (id, email, role, organization_id)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@yourdomain.com'),
  'admin@yourdomain.com',
  'super_admin',
  NULL
);
```

### 3. Test Critical Flows

- [ ] User registration
- [ ] User login
- [ ] Password reset
- [ ] Invoice creation
- [ ] Payment processing
- [ ] Email notifications
- [ ] Report generation

### 4. Enable Monitoring

**Supabase Dashboard:**

- API usage
- Database performance
- Function logs
- Auth activity

**Sentry (if configured):**

- Error tracking
- Performance monitoring
- Release tracking

## Monitoring

### Application Metrics

**Key Metrics to Monitor:**

- Response time (p50, p95, p99)
- Error rate
- Request volume
- Database query performance
- Edge function execution time

### Database Monitoring

```sql
-- Query performance
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Alerts

**Set up alerts for:**

- High error rate (> 1%)
- Slow response time (> 2s)
- High CPU usage (> 80%)
- Database connection limit
- Failed function executions

### Logs

**Supabase Logs:**

```bash
supabase functions logs function-name
```

**Application Logs:**

- Check Vercel/Netlify logs
- Monitor Sentry dashboard
- Review database logs

## Scaling

### Frontend

**Vercel:**

- Auto-scales automatically
- No configuration needed

**CDN Configuration:**

- Enable Edge caching
- Configure cache headers
- Optimize images

### Database

**Vertical Scaling:**

- Upgrade Supabase plan
- Increase CPU/RAM

**Horizontal Scaling:**

- Enable read replicas
- Implement connection pooling
- Use database indexes

### Edge Functions

**Optimization:**

- Reduce cold starts
- Optimize bundle size
- Use caching where appropriate
- Monitor execution time

## Backup & Recovery

### Automated Backups

Supabase provides:

- Daily automatic backups (retained for 7 days on Pro plan)
- Point-in-time recovery (PITR)

### Manual Backup

```bash
# Export database
supabase db dump -f backup.sql

# Export data only
supabase db dump --data-only -f data.sql
```

### Recovery

```bash
# Restore from backup
psql -h your-db-host -U postgres -d postgres -f backup.sql
```

## Rollback Plan

### If Deployment Fails

**Step 1: Rollback Frontend**

**Vercel:**

- Go to Deployments
- Find previous working deployment
- Click "Promote to Production"

**Netlify:**

```bash
netlify rollback
```

**Step 2: Rollback Database**

```bash
# Revert last migration
supabase db reset --db-url your-db-url
```

**Step 3: Rollback Functions**

```bash
# Redeploy previous version
git checkout previous-tag
supabase functions deploy
```

## Security Checklist

Before going live:

- [ ] Environment variables secured
- [ ] RLS policies enabled
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Audit logging enabled
- [ ] Secrets rotated
- [ ] Access keys restricted
- [ ] Monitoring alerts set

## Support

For deployment issues:

- **Documentation**: docs.moneyflow.app
- **Email**: deploy@moneyflow.app
- **Community**: community.moneyflow.app

---

**Congratulations on deploying Money Flow! 🎉**

Next steps:

- [Configure monitoring](./MONITORING.md)
- [Set up CI/CD](./CICD.md)
- [Performance optimization](./PERFORMANCE.md)
