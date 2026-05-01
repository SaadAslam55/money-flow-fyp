# Money Flow - Quick Start Guide

> Fast reference for getting started with Money Flow

## 🚀 Quick Setup (5 Minutes)

### 1. Install & Configure

```bash
# Clone and install
git clone https://github.com/yourusername/moneyflow.git
cd moneyflow
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Setup database
supabase link --project-ref your-project-ref
supabase db push
```

### 2. Create Super Admin

**Option A: SQL Editor (Fastest)**
```sql
-- In Supabase SQL Editor
-- First create auth user via Authentication → Users
-- Then:
UPDATE users
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

**Option B: Sign Up First**
1. Go to `/auth/signup`
2. Create account (becomes Admin)
3. Update to super_admin via SQL

### 3. Start Application

```bash
npm run dev
# Open http://localhost:5173
```

---

## 👑 User Access Summary

### Super Admin
- **How to get:** Database update (see [Setup Guide](SETUP_GUIDE.md))
- **Access:** `/admin` panel
- **Can do:** Everything (all businesses, system settings)

### Admin
- **How to get:** Sign up at `/auth/signup` (automatic)
- **Access:** Full business management
- **Can do:** Manage team, settings, all business data

### Regular Users
- **How to get:** Invited by Admin
- **Access:** Based on role (Manager, Accountant, Cashier)
- **Can do:** See [User Guide](USER_GUIDE.md) for details

---

## 📝 Common Tasks

### Create Super Admin
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'email@example.com';
```

### Create Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'email@example.com';
```

### Invite User (via UI)
1. Login as Admin
2. Go to Settings → Team
3. Click "Add Team Member"
4. Fill form and send invitation

### Check User Role
```sql
SELECT email, role, is_active FROM users WHERE email = 'user@example.com';
```

---

## 🔗 Important Links

- **User Guide:** [docs/USER_GUIDE.md](USER_GUIDE.md)
- **Setup Guide:** [docs/SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Main README:** [README.md](../README.md)

---

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
supabase db push         # Apply migrations
supabase db reset        # Reset with seed data
supabase db seed         # Run seed script

# Testing
npm run test             # Run tests
npm run test:coverage    # Test with coverage
npm run test:e2e         # E2E tests

# Code Quality
npm run type-check       # TypeScript check
npm run lint             # Lint code
npm run format           # Format code
```

---

**Need more details?** See [USER_GUIDE.md](USER_GUIDE.md) for comprehensive documentation.

