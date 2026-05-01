# Changelog

All notable changes to this project will be documented in this file.

## v0.2.0 - 2025-11-18

- Env/Analytics initialization stabilized to avoid circular dependencies
  - Removed `logger` import from `src/config/env.config.ts` to prevent init cycle
  - Early env init now uses `console` for safe logging
  - Clearer error output when required env vars are missing
- Analytics made optional-friendly
  - Mixpanel initialization is skipped silently when `VITE_MIXPANEL_TOKEN` is not set
  - Reduced noisy analytics logs in development
- DX and linting
  - Minor ESLint-friendly tweaks in global error handlers (`src/main.tsx`)
  - General ESLint and project improvements merged from develop
- Tests: groundwork improvements; remaining complex UI tests deferred

Notes:

- No schema migrations
- No runtime behavior change when analytics tokens are configured
