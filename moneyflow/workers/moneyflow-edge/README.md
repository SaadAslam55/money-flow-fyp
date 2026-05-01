# MoneyFlow Edge API

Cloudflare Workers edge functions for the MoneyFlow application.

## Features

- **Edge Authentication**: JWT validation with session caching
- **Rate Limiting**: Configurable per-endpoint rate limits
- **Response Caching**: Stale-while-revalidate caching strategy
- **API Proxy**: Intelligent routing to NestJS backend
- **Multi-tenant**: Organization-scoped caching and data isolation

## Architecture

```
Client Request
      ↓
┌─────────────────────────────────┐
│     Cloudflare Edge (300+ PoPs) │
├─────────────────────────────────┤
│  Rate Limit → Auth → Cache      │
│                ↓                │
│           API Proxy             │
└─────────────────────────────────┘
              ↓
        Origin (NestJS)
```

## Setup

### 1. Install Dependencies

```bash
cd workers/moneyflow-edge
npm install
```

### 2. Create KV Namespaces

```bash
# Create namespaces
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "RATE_LIMIT"
wrangler kv:namespace create "SESSIONS"

# Create preview namespaces
wrangler kv:namespace create "CACHE" --preview
wrangler kv:namespace create "RATE_LIMIT" --preview
wrangler kv:namespace create "SESSIONS" --preview
```

Update `wrangler.toml` with the returned IDs.

### 3. Set Secrets

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put API_SECRET
```

### 4. Update Configuration

Edit `wrangler.toml`:

- Set `API_ORIGIN` to your NestJS API URL
- Configure routes for your domain

## Development

```bash
# Start dev server
npm run dev

# Start with local mode (no KV)
npm run dev:local

# Generate types
npm run types
```

## Deployment

```bash
# Deploy to production
npm run deploy

# Deploy to staging
npm run deploy:staging

# View logs
npm run tail
```

## Endpoints

### Health

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check with dependency status
- `GET /health/live` - Liveness probe
- `GET /health/version` - Version info

### Auth

- `POST /auth/validate` - Validate JWT token
- `POST /auth/refresh` - Refresh session
- `POST /auth/logout` - Invalidate session
- `GET /auth/session` - Get session info

### Cache (Admin)

- `POST /cache/invalidate` - Invalidate by pattern
- `POST /cache/clear` - Clear org cache
- `GET /cache/stats` - Cache statistics
- `POST /cache/warm` - Pre-warm cache

### API Proxy

- `* /api/*` - Proxied to origin with auth

## Rate Limits

| Endpoint    | Limit | Window |
| ----------- | ----- | ------ |
| Default     | 100   | 1 min  |
| Auth login  | 5     | 5 min  |
| Auth signup | 3     | 1 hour |
| Reports     | 10    | 1 min  |
| Bulk ops    | 3     | 1 min  |

## Cache TTLs

| Route     | TTL    | Stale-While-Revalidate |
| --------- | ------ | ---------------------- |
| Products  | 5 min  | 1 min                  |
| Customers | 3 min  | 30 sec                 |
| Dashboard | 1 min  | 30 sec                 |
| Settings  | 10 min | 2 min                  |

## Environment Variables

| Variable                    | Description                    |
| --------------------------- | ------------------------------ |
| `ENVIRONMENT`               | development/staging/production |
| `API_ORIGIN`                | NestJS API URL                 |
| `SUPABASE_URL`              | Supabase project URL           |
| `SUPABASE_ANON_KEY`         | Supabase anon key              |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key      |
| `API_SECRET`                | Internal API secret            |

## Response Headers

| Header                  | Description           |
| ----------------------- | --------------------- |
| `X-Cache`               | HIT/MISS/STALE/BYPASS |
| `X-RateLimit-Limit`     | Max requests          |
| `X-RateLimit-Remaining` | Remaining requests    |
| `X-Response-Time`       | Total response time   |
| `X-Origin-Latency`      | Origin request time   |
