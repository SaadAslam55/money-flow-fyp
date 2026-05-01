# Production Cutover Scripts

Scripts for executing the production cutover from Supabase to the new multi-cloud architecture.

## Prerequisites

```bash
# Install dependencies
npm install

# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"
export TIDB_API_URL="https://api.mtkcodex.site"
export AUTH_TOKEN="your-auth-token"
export ADMIN_TOKEN="your-admin-token"
```

## Scripts

### 1. Final Sync (`final-sync.ts`)

Synchronizes data from Supabase to TiDB.

```bash
# Incremental sync (last hour)
npx ts-node final-sync.ts

# Full sync (all records)
npx ts-node final-sync.ts --full

# Sync since specific time
npx ts-node final-sync.ts --since=2024-01-01T00:00:00Z

# Skip validation
npx ts-node final-sync.ts --skip-validation
```

### 2. Validate Sync (`validate-sync.ts`)

Validates data integrity between Supabase and TiDB.

```bash
npx ts-node validate-sync.ts
```

Checks:

- Record counts match (< 0.1% difference)
- Sample records match (hash comparison)
- Invoice calculations are correct

### 3. Smoke Tests (`smoke-tests.ts`)

Runs critical path tests after cutover.

```bash
AUTH_TOKEN=xxx npx ts-node smoke-tests.ts
```

Tests:

- Health endpoints
- Authentication
- Invoice CRUD
- Customer/Product lists
- Dashboard data

### 4. Rollback (`rollback.ts`)

Emergency rollback to legacy backend.

```bash
# Shows confirmation code
npx ts-node rollback.ts

# Execute rollback (replace date with today)
ADMIN_TOKEN=xxx npx ts-node rollback.ts --confirm=ROLLBACK-2024-01-15
```

Actions:

- Switches feature flags to legacy
- Clears all caches
- Disables read-only mode
- Verifies health

### 5. Monitor (`monitor.ts`)

Real-time production monitoring.

```bash
AUTH_TOKEN=xxx npx ts-node monitor.ts

# Custom check interval (seconds)
CHECK_INTERVAL=60000 AUTH_TOKEN=xxx npx ts-node monitor.ts
```

Features:

- Health status dashboard
- Latency tracking
- Uptime calculation
- Alert thresholds
- Rollback recommendations

## Cutover Timeline

```
T-24h   Final data sync initiated
T-12h   Team briefing
T-6h    User notification
T-2h    Final Supabase backup
T-1h    Enable read-only mode
T-30m   Run final-sync.ts
T-15m   Run validate-sync.ts
T-5m    Switch traffic (feature flags)
T-0     CUTOVER COMPLETE
T+5m    Run smoke-tests.ts
T+15m   Start monitor.ts
T+30m   Disable read-only mode
T+1h    Confirm success
T+24h   Full validation
```

## Rollback Criteria

Initiate rollback if:

- Smoke tests fail critical checks
- Error rate > 5%
- API latency > 2s (sustained)
- Database connectivity lost
- Data corruption detected

## Environment Variables

| Variable                    | Description           | Required            |
| --------------------------- | --------------------- | ------------------- |
| `SUPABASE_URL`              | Supabase project URL  | Yes                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key  | Yes                 |
| `TIDB_API_URL`              | NestJS API URL        | Yes                 |
| `AUTH_TOKEN`                | User auth token       | Yes                 |
| `ADMIN_TOKEN`               | Admin auth token      | For rollback        |
| `CHECK_INTERVAL`            | Monitor interval (ms) | No (default: 30000) |

## Post-Cutover Checklist

- [ ] All smoke tests pass
- [ ] Error rates normal (< 1%)
- [ ] Latency acceptable (< 500ms avg)
- [ ] Read-only mode disabled
- [ ] Team notified
- [ ] Users notified
- [ ] Monitoring active
- [ ] Rollback tested (dry run)
