#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 *
 * Validates that all required environment variables are set based on
 * which features are enabled. Run this before starting the application.
 *
 * Usage:
 *   node scripts/validate-env.js
 *   node scripts/validate-env.js --strict  # Fail on warnings too
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Environment variable definitions
const ENV_DEFINITIONS = {
  // Core - Always required
  core: {
    required: true,
    description: 'Core application variables',
    vars: [
      { name: 'VITE_SUPABASE_URL', description: 'Supabase project URL' },
      { name: 'VITE_SUPABASE_ANON_KEY', description: 'Supabase anonymous key' },
    ],
  },

  // Backend API
  api: {
    required: false,
    enabledBy: 'FEATURE_USE_NEW_API',
    description: 'Backend API configuration',
    vars: [
      { name: 'API_PORT', description: 'API server port', default: '3001' },
      {
        name: 'JWT_SECRET',
        description: 'JWT signing secret (min 32 chars)',
        validate: (v) => v && v.length >= 32,
      },
      { name: 'CORS_ORIGINS', description: 'Allowed CORS origins' },
    ],
  },

  // TiDB Cloud
  tidb: {
    required: false,
    enabledBy: 'FEATURE_USE_TIDB',
    description: 'TiDB Cloud database configuration',
    vars: [
      { name: 'TIDB_HOST', description: 'TiDB Cloud host' },
      { name: 'TIDB_PORT', description: 'TiDB Cloud port', default: '4000' },
      { name: 'TIDB_USER', description: 'TiDB username' },
      { name: 'TIDB_PASSWORD', description: 'TiDB password', sensitive: true },
      { name: 'TIDB_DATABASE', description: 'TiDB database name' },
      { name: 'DATABASE_URL', description: 'Prisma database connection URL', sensitive: true },
    ],
  },

  // Upstash Redis
  redis: {
    required: false,
    enabledBy: 'FEATURE_USE_REDIS_CACHE',
    description: 'Upstash Redis cache configuration',
    vars: [
      { name: 'UPSTASH_REDIS_REST_URL', description: 'Upstash REST API URL' },
      { name: 'UPSTASH_REDIS_REST_TOKEN', description: 'Upstash REST API token', sensitive: true },
    ],
  },

  // Cloudflare Workers
  cloudflare: {
    required: false,
    enabledBy: 'FEATURE_USE_CLOUDFLARE_WORKERS',
    description: 'Cloudflare Workers configuration',
    vars: [
      { name: 'CLOUDFLARE_ACCOUNT_ID', description: 'Cloudflare account ID' },
      { name: 'CLOUDFLARE_API_TOKEN', description: 'Cloudflare API token', sensitive: true },
    ],
  },

  // Production only
  production: {
    required: false,
    enabledBy: () => process.env.NODE_ENV === 'production',
    description: 'Production environment variables',
    vars: [
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Supabase service role key',
        sensitive: true,
      },
      {
        name: 'ENCRYPTION_KEY',
        description: 'Data encryption key',
        sensitive: true,
        validate: (v) => v && v.length >= 32,
      },
    ],
  },
};

// Results tracking
const results = {
  passed: [],
  warnings: [],
  errors: [],
};

/**
 * Check if a feature group is enabled
 */
function isGroupEnabled(group) {
  if (group.required) return true;
  if (typeof group.enabledBy === 'function') return group.enabledBy();
  if (group.enabledBy) return process.env[group.enabledBy] === 'true';
  return false;
}

/**
 * Validate a single environment variable
 */
function validateVar(varDef, groupName) {
  const value = process.env[varDef.name];
  const hasDefault = varDef.default !== undefined;
  const hasValue = value !== undefined && value !== '';

  // Check if variable exists
  if (!hasValue && !hasDefault) {
    results.errors.push({
      group: groupName,
      var: varDef.name,
      message: `Missing required variable: ${varDef.description}`,
    });
    return false;
  }

  // Use default if not set
  const effectiveValue = hasValue ? value : varDef.default;

  // Run custom validation if provided
  if (varDef.validate && !varDef.validate(effectiveValue)) {
    results.errors.push({
      group: groupName,
      var: varDef.name,
      message: `Invalid value for ${varDef.name}: ${varDef.description}`,
    });
    return false;
  }

  // Check for default values in production
  if (process.env.NODE_ENV === 'production' && !hasValue && hasDefault) {
    results.warnings.push({
      group: groupName,
      var: varDef.name,
      message: `Using default value in production for ${varDef.name}`,
    });
  }

  results.passed.push({
    group: groupName,
    var: varDef.name,
    sensitive: varDef.sensitive,
  });

  return true;
}

/**
 * Print results to console
 */
function printResults() {
  console.log(
    '\n' + colors.bold + '═══════════════════════════════════════════════' + colors.reset
  );
  console.log(colors.bold + '  Environment Variable Validation Report' + colors.reset);
  console.log(
    colors.bold + '═══════════════════════════════════════════════' + colors.reset + '\n'
  );

  // Summary
  const totalChecked = results.passed.length + results.errors.length;
  console.log(colors.cyan + 'Summary:' + colors.reset);
  console.log(`  Total checked: ${totalChecked}`);
  console.log(`  ${colors.green}Passed: ${results.passed.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${results.warnings.length}${colors.reset}`);
  console.log(`  ${colors.red}Errors: ${results.errors.length}${colors.reset}`);
  console.log('');

  // Print errors
  if (results.errors.length > 0) {
    console.log(colors.red + colors.bold + '✗ Errors:' + colors.reset);
    results.errors.forEach((err) => {
      console.log(colors.red + `  [${err.group}] ${err.var}` + colors.reset);
      console.log(`    ${err.message}`);
    });
    console.log('');
  }

  // Print warnings
  if (results.warnings.length > 0) {
    console.log(colors.yellow + colors.bold + '⚠ Warnings:' + colors.reset);
    results.warnings.forEach((warn) => {
      console.log(colors.yellow + `  [${warn.group}] ${warn.var}` + colors.reset);
      console.log(`    ${warn.message}`);
    });
    console.log('');
  }

  // Print passed (grouped)
  if (results.passed.length > 0) {
    console.log(colors.green + colors.bold + '✓ Passed:' + colors.reset);
    const grouped = {};
    results.passed.forEach((p) => {
      if (!grouped[p.group]) grouped[p.group] = [];
      grouped[p.group].push(p);
    });

    Object.entries(grouped).forEach(([group, vars]) => {
      console.log(colors.cyan + `  [${group}]` + colors.reset);
      vars.forEach((v) => {
        const value = v.sensitive ? '********' : process.env[v.var] || '(default)';
        console.log(`    ${colors.green}✓${colors.reset} ${v.var}: ${value}`);
      });
    });
  }

  console.log(
    '\n' + colors.bold + '═══════════════════════════════════════════════' + colors.reset + '\n'
  );
}

/**
 * Main validation function
 */
function validate() {
  console.log(colors.blue + '\n🔍 Validating environment variables...\n' + colors.reset);

  // Load .env file if exists (for local development)
  const envFiles = ['.env', '.env.local', '.env.tidb'];
  envFiles.forEach((file) => {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      console.log(colors.cyan + `  Loading ${file}...` + colors.reset);
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
    }
  });

  console.log('');

  // Validate each group
  Object.entries(ENV_DEFINITIONS).forEach(([groupName, group]) => {
    const enabled = isGroupEnabled(group);

    if (enabled) {
      console.log(colors.blue + `Checking ${group.description}...` + colors.reset);
      group.vars.forEach((varDef) => validateVar(varDef, groupName));
    } else {
      console.log(colors.yellow + `Skipping ${group.description} (not enabled)` + colors.reset);
    }
  });

  printResults();

  // Determine exit code
  const strictMode = process.argv.includes('--strict');
  if (results.errors.length > 0) {
    console.log(colors.red + '❌ Validation failed! Please fix the errors above.\n' + colors.reset);
    process.exit(1);
  } else if (strictMode && results.warnings.length > 0) {
    console.log(
      colors.yellow + '⚠ Validation passed with warnings (strict mode enabled).\n' + colors.reset
    );
    process.exit(1);
  } else {
    console.log(colors.green + '✅ All required environment variables are set!\n' + colors.reset);
    process.exit(0);
  }
}

// Run validation
validate();
