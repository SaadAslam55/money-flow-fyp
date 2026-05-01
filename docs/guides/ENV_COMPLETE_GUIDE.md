# 🔐 Complete Environment Variables Guide

> Full configuration guide for all Money Flow components

## 📦 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MONEY FLOW ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│   │   Frontend   │───▶│  Edge Worker │───▶│  NestJS API  │             │
│   │   (Vite)     │    │ (Cloudflare) │    │   (Render)   │             │
│   └──────────────┘    └──────────────┘    └──────────────┘             │
│          │                   │                   │                      │
│          │                   │                   │                      │
│          ▼                   ▼                   ▼                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│   │   Supabase   │    │   Upstash    │    │  TiDB Cloud  │             │
│   │    (Auth)    │    │   (Redis)    │    │  (Database)  │             │
│   └──────────────┘    └──────────────┘    └──────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📁 Environment Files Map

```
moneyflow/
├── .env.example                    # Frontend template
├── .env.local                      # Frontend secrets (create this)
│
├── apps/api/
│   ├── .env.example                # API template
│   └── .env                        # API secrets (create this)
│
├── workers/moneyflow-edge/
│   ├── .env.example                # Workers template
│   ├── .dev.vars.example           # Local dev template
│   ├── .dev.vars                   # Local secrets (create this)
│   └── wrangler.toml               # Cloudflare config
│
└── scripts/cutover/
    └── (uses shell environment variables)
```

---

## 🌐 Part 1: Frontend Configuration

### Location: `/.env.local`

```bash
# Copy template
cp .env.example .env.local
```

### Required Variables

```env
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                         FRONTEND ENVIRONMENT                               ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

# =============================================================================
# SUPABASE (Required)
# =============================================================================
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# =============================================================================
# NEW API (TiDB Migration)
# =============================================================================
VITE_API_URL=http://localhost:3001
VITE_EDGE_API_URL=http://localhost:8787

# =============================================================================
# FEATURE FLAGS
# =============================================================================
VITE_USE_NEW_API=false
VITE_USE_TIDB=false
VITE_USE_EDGE_CACHE=false
VITE_NEW_API_ROLLOUT=0

# =============================================================================
# APP CONFIG
# =============================================================================
VITE_APP_NAME=Money Flow
VITE_APP_URL=http://localhost:5173
VITE_ENVIRONMENT=development
```

### Where to Get Values

| Variable                 | Source                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API → URL         |
| `VITE_SUPABASE_ANON_KEY` | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API → anon public |
| `VITE_API_URL`           | Your NestJS API URL (localhost:3001 for dev)                                          |
| `VITE_EDGE_API_URL`      | Your Cloudflare Worker URL (localhost:8787 for dev)                                   |

---

## 🖥️ Part 2: NestJS API Configuration

### Location: `/apps/api/.env`

```bash
# Copy template
cd apps/api
cp .env.example .env
```

### Required Variables

```env
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                           API ENVIRONMENT                                  ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

# =============================================================================
# APPLICATION
# =============================================================================
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# =============================================================================
# TIDB DATABASE (Required)
# =============================================================================
DATABASE_URL="mysql://username:password@host:4000/moneyflow?sslaccept=strict"

# Individual variables (alternative)
TIDB_HOST=gateway01.us-west-2.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_username
TIDB_PASSWORD=your_password
TIDB_DATABASE=moneyflow

# =============================================================================
# SUPABASE AUTH (Required)
# =============================================================================
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# =============================================================================
# UPSTASH REDIS (Required)
# =============================================================================
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# =============================================================================
# JWT
# =============================================================================
JWT_SECRET=your-32-character-minimum-secret-key
JWT_EXPIRES_IN=7d
```

### Where to Get Values

| Variable                    | Source                                                                     |
| --------------------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`              | [TiDB Cloud](https://tidbcloud.com) → Cluster → Connect → General          |
| `SUPABASE_URL`              | [Supabase](https://app.supabase.com) → Project Settings → API              |
| `SUPABASE_ANON_KEY`         | [Supabase](https://app.supabase.com) → Project Settings → API              |
| `SUPABASE_SERVICE_ROLE_KEY` | [Supabase](https://app.supabase.com) → Project Settings → API (⚠️ Secret!) |
| `SUPABASE_JWT_SECRET`       | [Supabase](https://app.supabase.com) → Project Settings → API → JWT Secret |
| `UPSTASH_REDIS_REST_URL`    | [Upstash](https://console.upstash.com) → Redis Database → REST API         |
| `UPSTASH_REDIS_REST_TOKEN`  | [Upstash](https://console.upstash.com) → Redis Database → REST API         |

---

## ⚡ Part 3: Cloudflare Workers Configuration

### Location: `/workers/moneyflow-edge/.dev.vars`

```bash
# Copy template
cd workers/moneyflow-edge
cp .dev.vars.example .dev.vars
```

### Required Variables (Local Development)

```env
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                        WORKERS LOCAL DEV                                   ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_SERVICE_KEY=your-service-role-key

# Origin
ORIGIN_API_URL=http://localhost:3001

# Admin
ADMIN_API_KEY=local-admin-key-for-testing
```

### Production Secrets (Cloudflare Dashboard)

Set these via Wrangler CLI or Cloudflare Dashboard:

```bash
# Set secrets via CLI
cd workers/moneyflow-edge
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put ADMIN_API_KEY
```

Or via [Cloudflare Dashboard](https://dash.cloudflare.com):

1. Workers & Pages → Your Worker → Settings → Variables
2. Add each secret under "Secrets"

---

## 🔧 Part 4: Migration Scripts Configuration

### Environment Variables (Shell)

For cutover scripts, set these in your shell:

```bash
# PowerShell
$env:SUPABASE_URL = "https://xxxxxxxxxxxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
$env:TIDB_API_URL = "http://localhost:3001"
$env:AUTH_TOKEN = "your-auth-token"
$env:ADMIN_TOKEN = "your-admin-token"

# Bash/Zsh
export SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export TIDB_API_URL="http://localhost:3001"
export AUTH_TOKEN="your-auth-token"
export ADMIN_TOKEN="your-admin-token"
```

---

## 🚀 Quick Setup Script

Create all env files at once:

```bash
# Run from project root
# Windows PowerShell:

# Frontend
Copy-Item .env.example .env.local

# API
Copy-Item apps/api/.env.example apps/api/.env

# Workers
Copy-Item workers/moneyflow-edge/.dev.vars.example workers/moneyflow-edge/.dev.vars

Write-Host "✅ All .env files created! Now edit them with your credentials."
```

```bash
# Bash/Zsh:

# Frontend
cp .env.example .env.local

# API
cp apps/api/.env.example apps/api/.env

# Workers
cp workers/moneyflow-edge/.dev.vars.example workers/moneyflow-edge/.dev.vars

echo "✅ All .env files created! Now edit them with your credentials."
```

---

## 📋 Service Setup Guide

### 1️⃣ Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to **Project Settings** → **API**
4. Copy:
   - **URL** → `VITE_SUPABASE_URL`, `SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)
   - **JWT Secret** → `SUPABASE_JWT_SECRET`

### 2️⃣ TiDB Cloud Setup

1. Go to [tidbcloud.com](https://tidbcloud.com) and create account
2. Create new cluster (Serverless tier is free)
3. Go to **Clusters** → Your cluster → **Connect**
4. Select **General** connection method
5. Copy connection string and extract:
   - **Host** → `TIDB_HOST`
   - **Port** → `TIDB_PORT` (usually 4000)
   - **Username** → `TIDB_USER`
   - **Password** → `TIDB_PASSWORD`
6. Create database named `moneyflow`

**DATABASE_URL format:**

```
mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict
```

### 3️⃣ Upstash Redis Setup

1. Go to [upstash.com](https://upstash.com) and create account
2. Create new Redis database
3. Go to **REST API** tab
4. Copy:
   - **UPSTASH_REDIS_REST_URL** → URL starting with `https://`
   - **UPSTASH_REDIS_REST_TOKEN** → Token string

### 4️⃣ Cloudflare Workers Setup

1. Go to [cloudflare.com](https://cloudflare.com) and create account
2. Install Wrangler: `npm install -g wrangler`
3. Login: `wrangler login`
4. Create KV namespaces:
   ```bash
   cd workers/moneyflow-edge
   wrangler kv:namespace create CACHE
   wrangler kv:namespace create SESSIONS
   wrangler kv:namespace create RATE_LIMIT
   ```
5. Update `wrangler.toml` with KV namespace IDs

---

## ✅ Verification Checklist

### Frontend

```bash
npm run dev
# Visit http://localhost:5173
# Check browser console for errors
```

### API

```bash
cd apps/api
npm run start:dev
# Visit http://localhost:3001/health
# Should return { status: "healthy" }
```

### Workers

```bash
cd workers/moneyflow-edge
npm run dev
# Visit http://localhost:8787/health
# Should return health status
```

### Database Connection

```bash
cd apps/api
npx prisma db pull
# Should connect without errors
```

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] `apps/api/.env` is in `.gitignore`
- [ ] `.dev.vars` is in `.gitignore`
- [ ] No secrets in `wrangler.toml`
- [ ] Service role key only in backend (never frontend)
- [ ] Different credentials for dev/staging/production
- [ ] Secrets rotated regularly

---

## 📚 Environment Variable Reference

### All Variables by Component

| Component | File            | Key Variables                                                 |
| --------- | --------------- | ------------------------------------------------------------- |
| Frontend  | `.env.local`    | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` |
| API       | `apps/api/.env` | `DATABASE_URL`, `SUPABASE_*`, `UPSTASH_*`, `JWT_SECRET`       |
| Workers   | `.dev.vars`     | `SUPABASE_*`, `ORIGIN_API_URL`, `ADMIN_API_KEY`               |
| Scripts   | Shell env       | `SUPABASE_*`, `TIDB_API_URL`, `AUTH_TOKEN`                    |

### Feature Flags

| Flag                   | Default | Description           |
| ---------------------- | ------- | --------------------- |
| `VITE_USE_NEW_API`     | `false` | Enable NestJS API     |
| `VITE_USE_TIDB`        | `false` | Enable TiDB database  |
| `VITE_USE_EDGE_CACHE`  | `false` | Enable edge caching   |
| `VITE_NEW_API_ROLLOUT` | `0`     | % of users on new API |

---

## 🆘 Troubleshooting

### "SUPABASE_URL is undefined"

- Check file is named correctly (`.env.local` not `.env.local.txt`)
- Restart dev server after changes
- Variables must start with `VITE_` for frontend

### "Database connection failed"

- Check `DATABASE_URL` format
- Verify TiDB cluster is running
- Check IP allowlist in TiDB Cloud

### "Redis connection failed"

- Verify Upstash URL starts with `https://`
- Check token is correct
- Ensure REST API is enabled

### "CORS error"

- Add your frontend URL to `CORS_ORIGINS`
- Check no trailing slash in URLs

---

**Last Updated:** November 2024
