# Supabase Configuration

This directory contains all Supabase-related configuration, migrations, Edge Functions, and seed data for the Money Flow application.

## 📁 Directory Structure

```
supabase/
├── config.toml              # Supabase project configuration
├── migrations/              # Database migration files
│   ├── README.md           # Migration documentation
│   └── *.sql               # Migration SQL files
├── functions/              # Edge Functions (Deno)
│   ├── _shared/           # Shared utilities
│   │   ├── auth.ts        # Authentication utilities
│   │   ├── cors.ts        # CORS handling
│   │   └── validators.ts  # Input validation
│   ├── create-invoice/    # Create invoice function
│   ├── send-invoice-email/# Send invoice email
│   ├── generate-report/   # Generate reports
│   ├── adjust-stock/      # Stock adjustments
│   ├── payment-webhook/   # Payment webhooks
│   ├── stripe-webhook/    # Stripe webhooks
│   └── README.md          # Functions documentation
├── seed/                   # Seed data
│   ├── seed.sql           # SQL seed script
│   └── sample-data.json   # Sample JSON data
└── .gitignore              # Git ignore rules
```

## 🚀 Quick Start

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Link to Your Project

```bash
# Link to cloud project
supabase link --project-ref your-project-ref

# Or start local development
supabase start
```

### 3. Run Migrations

```bash
# Apply all migrations
supabase db push

# Or reset and apply all migrations
supabase db reset
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy create-invoice
```

## 📋 Configuration

### `config.toml`

The `config.toml` file contains all Supabase project settings:

- **API Configuration**: Port, schemas, max rows
- **Database Configuration**: Port, version
- **Auth Configuration**: JWT expiry, signup settings
- **Storage Configuration**: File size limits
- **Edge Functions**: Security settings
- **Realtime**: Connection limits

### Environment Variables

Edge Functions require these environment variables:

```bash
# Supabase (automatically provided)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_DOMAIN=yourdomain.com

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Application
APP_URL=https://your-app.com
ALLOWED_ORIGINS=https://your-app.com,https://www.your-app.com
ENVIRONMENT=production
```

Set secrets for Edge Functions:

```bash
supabase secrets set RESEND_API_KEY=your-key
supabase secrets set STRIPE_SECRET_KEY=your-key
supabase secrets set APP_URL=https://your-app.com
```

## 🗄️ Database Migrations

### Migration Files

Migrations are executed in chronological order:

1. `20240101000000_initial_schema.sql` - Core tables
2. `20240102000000_products_invoices.sql` - Products & invoices
3. `20240103000000_add_rls_policies.sql` - Row Level Security
4. `20240104000000_functions_triggers.sql` - Functions & triggers
5. `20240106000000_payment_integrations.sql` - Payment integrations

### Running Migrations

```bash
# Apply migrations
supabase db push

# Create new migration
supabase migration new migration_name

# Reset database (⚠️ deletes all data)
supabase db reset
```

See `migrations/README.md` for detailed migration documentation.

## ⚡ Edge Functions

### Available Functions

- **create-invoice**: Create invoices with line items
- **send-invoice-email**: Send invoices via email
- **generate-report**: Generate financial reports
- **adjust-stock**: Adjust product stock levels
- **payment-webhook**: Process payment webhooks
- **stripe-webhook**: Handle Stripe webhooks
- **pakistani-payment-webhook**: Handle Pakistani payment providers

### Shared Utilities

All functions use shared utilities from `_shared/`:

- **auth.ts**: Authentication and authorization
- **cors.ts**: CORS handling
- **validators.ts**: Input validation

### Testing Functions Locally

```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve create-invoice

# Test with curl
curl -X POST http://localhost:54321/functions/v1/create-invoice \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invoice_date": "2024-01-01", ...}'
```

See `functions/README.md` for detailed function documentation.

## 🌱 Seed Data

### Running Seed Script

```bash
# Seed database with sample data
supabase db seed

# Or manually
psql -h localhost -U postgres -d postgres -f seed/seed.sql
```

⚠️ **Warning**: Seed data is for development only. Never run seed scripts in production.

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS enabled with policies for:

- Multi-tenant data isolation
- Role-based access control
- Organization-level permissions

### Edge Functions Security

- JWT token verification
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Webhook signature verification

### Best Practices

1. **Never commit secrets** - Use Supabase secrets
2. **Enable RLS** - Always enable Row Level Security
3. **Validate inputs** - Always validate and sanitize inputs
4. **Use service role key carefully** - Only in Edge Functions
5. **Monitor logs** - Check Edge Function logs regularly
6. **Update dependencies** - Keep Supabase client updated

## 📊 Monitoring

### Database

- Check migration status: `supabase migration list`
- View database logs: Supabase Dashboard → Logs
- Monitor query performance: Supabase Dashboard → Database

### Edge Functions

- View function logs: `supabase functions logs <function-name>`
- Monitor errors: Supabase Dashboard → Edge Functions
- Check execution time: Function logs include timing

## 🐛 Troubleshooting

### Migration Issues

**Problem**: Migration fails with "relation already exists"

**Solution**: Check if migration was partially applied. Drop conflicting objects or create new migration.

**Problem**: RLS policy errors

**Solution**: Ensure all migrations are applied in order. Check that `auth.users` table exists.

### Edge Function Issues

**Problem**: Function returns 401 Unauthorized

**Solution**: Check that Authorization header includes valid JWT token.

**Problem**: CORS errors

**Solution**: Verify `ALLOWED_ORIGINS` environment variable includes your domain.

**Problem**: Environment variables not found

**Solution**: Set secrets using `supabase secrets set KEY=value`

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🔄 Maintenance

### Regular Tasks

1. **Review migrations** - Ensure all migrations are applied
2. **Update dependencies** - Keep Supabase client updated
3. **Monitor logs** - Check for errors and performance issues
4. **Backup database** - Regular backups (automated in production)
5. **Review RLS policies** - Ensure policies are correct

### Production Checklist

- [ ] All migrations applied
- [ ] RLS enabled on all tables
- [ ] Edge Functions deployed
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation updated

## 📝 Notes

- **Local Development**: Use `supabase start` for local development
- **Production**: Link to cloud project with `supabase link`
- **Migrations**: Never modify existing migrations, always create new ones
- **Secrets**: Never commit secrets to version control
- **RLS**: Always test RLS policies thoroughly
