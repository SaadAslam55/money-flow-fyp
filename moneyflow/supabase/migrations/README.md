# Database Migrations

This directory contains all database migration files for the Money Flow application.

## Migration Order

Migrations are executed in chronological order based on their timestamp prefix. The correct execution order is:

1. **20240101000000_initial_schema.sql**
   - Creates core tables: organizations, users, customers, expense_categories, bank_accounts
   - Sets up basic indexes and constraints
   - Establishes foundation for multi-tenant architecture

2. **20240102000000_products_invoices.sql**
   - Creates product and invoice related tables: products, invoices, invoice_items, transactions, audit_logs, stock_movements
   - Sets up indexes for performance
   - Establishes relationships between entities

3. **20240103000000_add_rls_policies.sql**
   - Enables Row Level Security (RLS) on all tables
   - Creates comprehensive RLS policies for multi-tenant data isolation
   - Implements role-based access control policies

4. **20240104000000_functions_triggers.sql**
   - Creates database functions for business logic
   - Sets up triggers for automatic updates (timestamps, balances, stock)
   - Implements audit logging and reporting functions

## Running Migrations

### Using Supabase CLI

```bash
# Apply all migrations
supabase db push

# Apply migrations to remote database
supabase db push --db-url "postgresql://..."

# Reset database and apply all migrations
supabase db reset
```

### Manual Execution

Migrations can be executed manually in order using any PostgreSQL client:

```bash
psql -h <host> -U <user> -d <database> -f 20240101000000_initial_schema.sql
psql -h <host> -U <user> -d <database> -f 20240102000000_products_invoices.sql
psql -h <host> -U <user> -d <database> -f 20240103000000_add_rls_policies.sql
psql -h <host> -U <user> -d <database> -f 20240104000000_functions_triggers.sql
```

## Migration Naming Convention

All migration files follow the pattern:
```
YYYYMMDDHHMMSS_description.sql
```

Example: `20240101000000_initial_schema.sql`

- **YYYYMMDDHHMMSS**: Timestamp ensures correct execution order
- **description**: Descriptive name in snake_case

## Important Notes

- ⚠️ **Never modify existing migrations** that have been applied to production
- ✅ **Always create new migrations** for schema changes
- 🔒 **RLS is enabled** on all tables for security
- 📊 **Indexes are optimized** for common query patterns
- 🔄 **Triggers handle** automatic updates (timestamps, balances, etc.)

## Troubleshooting

### Migration Fails Due to Existing Objects

If a migration fails because objects already exist:
1. Check if the migration was partially applied
2. Manually drop conflicting objects
3. Re-run the migration

### RLS Policy Errors

If RLS policies fail:
1. Ensure all tables exist (run migrations 001 and 002 first)
2. Check that auth.users table exists (Supabase Auth)
3. Verify organization_id columns exist on all tables

## Migration History

| Migration | Description | Tables Created | Functions Created |
|-----------|-------------|----------------|-------------------|
| 001 | Initial Schema | 5 | 0 |
| 002 | Products & Invoices | 6 | 0 |
| 003 | RLS Policies | 0 | 0 |
| 004 | Functions & Triggers | 0 | 11 |

## Next Steps

After running all migrations:
1. Seed the database with initial data (see `../seed/seed.sql`)
2. Create initial admin user
3. Set up organization
4. Configure subscription plans

