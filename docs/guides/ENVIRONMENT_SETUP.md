# Environment Variables Setup Guide

> Complete guide for setting up environment variables in Money Flow

## 📋 Overview

Money Flow uses environment variables for configuration. Vite loads them in this priority order:

1. **`.env.local`** (highest priority) - Your local secrets, **gitignored**
2. **`.env`** (default) - Shared defaults, can be committed
3. **`.env.example`** (template) - Example values, committed to repo

## 🎯 Recommended Setup

### Option 1: `.env.local` Only (Recommended for Development)

**Best for:** Personal development, when you don't want to commit any env files

```bash
# Create .env.local with your real credentials
cp .env.example .env.local
# Then edit .env.local with your actual values
```

**Pros:**
- ✅ All secrets in one place
- ✅ Automatically gitignored
- ✅ Easy to manage

**Cons:**
- ❌ Not shared with team (each developer needs their own)

### Option 2: `.env` + `.env.local` (Recommended for Teams)

**Best for:** Team development, when you want to share defaults

**`.env`** (committed to git):
```env
# Default/example values
VITE_SUPABASE_URL=https://example.supabase.co
VITE_SUPABASE_ANON_KEY=example-key
VITE_APP_NAME=Money Flow
```

**`.env.local`** (gitignored, your real values):
```env
# Your actual credentials (overrides .env)
VITE_SUPABASE_URL=https://your-real-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-real-anon-key
```

**Pros:**
- ✅ Team can see what variables are needed
- ✅ Defaults for new developers
- ✅ Your secrets stay local

**Cons:**
- ⚠️ Need to maintain two files

## 📁 File Structure

```
moneyflow/
├── .env.example          # Template (committed) ✅
├── .env                  # Defaults (optional, can commit) ⚠️
├── .env.local            # Your secrets (gitignored) 🔒
└── .env.production       # Production (gitignored) 🔒
```

## 🔧 Setup Instructions

### Step 1: Copy Example File

```bash
# Copy the example file
cp .env.example .env.local
```

### Step 2: Fill in Your Values

Edit `.env.local` with your actual credentials:

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key

# Optional (add as needed)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_MIXPANEL_TOKEN=your-token
```

### Step 3: Verify Setup

```bash
# Check if variables are loaded
npm run dev

# Or test connection
# Visit: http://localhost:5173/test-connection
```

## 🔒 Security Best Practices

### ✅ DO:

- ✅ Use `.env.local` for secrets (automatically gitignored)
- ✅ Use `.env.example` as a template (safe to commit)
- ✅ Keep `.env.local` out of version control
- ✅ Use different values for dev/staging/production
- ✅ Rotate keys regularly

### ❌ DON'T:

- ❌ Commit `.env.local` to git
- ❌ Commit real API keys to `.env`
- ❌ Share `.env.local` files via email/chat
- ❌ Use production keys in development
- ❌ Hardcode secrets in code

## 📝 Required Variables

### Minimum Required (App won't work without these):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional (App works without these, but features may be disabled):

- `VITE_STRIPE_PUBLIC_KEY` - Payment processing
- `VITE_GA_MEASUREMENT_ID` - Google Analytics
- `VITE_MIXPANEL_TOKEN` - Mixpanel analytics
- `VITE_SENTRY_DSN` - Error tracking
- `VITE_ENABLE_INVENTORY` - Feature flags
- `VITE_ENABLE_MULTI_CURRENCY` - Feature flags
- `VITE_ENABLE_MULTI_BRANCH` - Feature flags

## 🎯 For Your Current Setup

Since you already have `.env.local` with your real configuration:

### Option A: Keep Only `.env.local` (Simplest)

**Current setup is fine!** Just keep using `.env.local`:

```bash
# You already have this ✅
.env.local  # Your real credentials
```

**No `.env` file needed** - Vite will use `.env.local` directly.

### Option B: Add `.env` for Team Sharing (Recommended)

If you want to share defaults with your team:

1. **Create `.env`** with example values:
   ```bash
   cp .env.example .env
   # Edit .env with example/placeholder values
   ```

2. **Keep `.env.local`** with your real values:
   ```bash
   # Your .env.local already has real values ✅
   ```

3. **Result:**
   - `.env` → Shared defaults (can commit)
   - `.env.local` → Your secrets (gitignored, overrides .env)

## 🔍 How Vite Loads Variables

Vite automatically loads environment files in this order:

```
.env.local          ← Highest priority (your secrets)
.env.development    ← Mode-specific (if NODE_ENV=development)
.env                ← Default values
.env.example        ← Template (not loaded, just for reference)
```

**Important:** Variables must start with `VITE_` to be exposed to client-side code.

## ✅ Verification

### Check if variables are loaded:

1. **Browser Console:**
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL);
   ```

2. **Connection Test Page:**
   ```
   http://localhost:5173/test-connection
   ```

3. **Command Line:**
   ```bash
   npm run db:test
   ```

## 🆘 Troubleshooting

### Variables not loading?

1. **Check file name:** Must be `.env` or `.env.local` (not `.env.local.txt`)
2. **Check variable prefix:** Must start with `VITE_`
3. **Restart dev server:** Vite only loads env files on startup
4. **Check file location:** Must be in project root (same level as `package.json`)

### Variables showing as undefined?

1. **Restart dev server:** `npm run dev`
2. **Clear browser cache:** Hard refresh (Ctrl+Shift+R)
3. **Check spelling:** Variable names are case-sensitive
4. **Check quotes:** Don't use quotes around values in `.env` files

## 📚 Related Documentation

- [Connection Test Guide](SUPABASE_CONNECTION_TEST.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Last Updated:** December 2024

