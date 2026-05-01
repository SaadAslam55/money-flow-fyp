#!/usr/bin/env node

/**
 * Phase 0: Prerequisites Verification Script
 *
 * Verifies that all required tools and accounts are set up correctly
 * for the TiDB migration.
 *
 * Usage: node scripts/verify-prerequisites.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

// Results tracking
const results = {
  passed: [],
  warnings: [],
  failed: [],
};

// ============================================
// Utility Functions
// ============================================

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(message) {
  console.log(`\n${colors.cyan}[*] ${message}${colors.reset}`);
}

function logSuccess(name, detail = '') {
  const msg = detail ? `${name}: ${detail}` : name;
  console.log(`${colors.green}  ✓ ${msg}${colors.reset}`);
  results.passed.push(name);
}

function logWarning(name, detail = '') {
  const msg = detail ? `${name}: ${detail}` : name;
  console.log(`${colors.yellow}  ⚠ ${msg}${colors.reset}`);
  results.warnings.push({ name, detail });
}

function logFailure(name, detail = '') {
  const msg = detail ? `${name}: ${detail}` : name;
  console.log(`${colors.red}  ✗ ${msg}${colors.reset}`);
  results.failed.push({ name, detail });
}

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

function compareVersions(current, required) {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);

  for (let i = 0; i < requiredParts.length; i++) {
    if ((currentParts[i] || 0) < requiredParts[i]) return false;
    if ((currentParts[i] || 0) > requiredParts[i]) return true;
  }
  return true;
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', () => resolve({ status: 0, ok: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, ok: false });
    });
  });
}

// ============================================
// Check Functions
// ============================================

async function checkNodeVersion() {
  logStep('Checking Node.js version...');

  const version = execCommand('node --version');
  if (!version) {
    logFailure('Node.js', 'Not installed');
    return;
  }

  const cleanVersion = version.replace('v', '');
  if (compareVersions(cleanVersion, '18.0.0')) {
    logSuccess('Node.js', cleanVersion);
  } else {
    logFailure('Node.js', `${cleanVersion} (requires 18.0.0+)`);
  }
}

async function checkNpmVersion() {
  const version = execCommand('npm --version');
  if (!version) {
    logWarning('npm', 'Not found');
    return;
  }

  if (compareVersions(version, '9.0.0')) {
    logSuccess('npm', version);
  } else {
    logWarning('npm', `${version} (recommend 9.0.0+)`);
  }
}

async function checkGitVersion() {
  const version = execCommand('git --version');
  if (!version) {
    logFailure('Git', 'Not installed');
    return;
  }

  const match = version.match(/(\d+\.\d+\.\d+)/);
  logSuccess('Git', match ? match[1] : 'installed');
}

async function checkNestCLI() {
  logStep('Checking NestJS CLI...');

  const version = execCommand('nest --version');
  if (!version) {
    logWarning('NestJS CLI', 'Not installed (run: npm install -g @nestjs/cli)');
    return;
  }

  logSuccess('NestJS CLI', version);
}

async function checkWranglerCLI() {
  logStep('Checking Cloudflare Wrangler CLI...');

  const version = execCommand('wrangler --version');
  if (!version) {
    logWarning('Wrangler CLI', 'Not installed (run: npm install -g wrangler)');
    return;
  }

  const match = version.match(/(\d+\.\d+\.\d+)/);
  logSuccess('Wrangler CLI', match ? match[1] : version);

  // Check if logged in
  const whoami = execCommand('wrangler whoami');
  if (whoami && !whoami.includes('not authenticated')) {
    logSuccess('Wrangler Auth', 'Authenticated');
  } else {
    logWarning('Wrangler Auth', 'Not authenticated (run: wrangler login)');
  }
}

async function checkPrismaCLI() {
  logStep('Checking Prisma CLI...');

  const version = execCommand('npx prisma --version');
  if (!version) {
    logWarning('Prisma CLI', 'Not found');
    return;
  }

  const match = version.match(/(\d+\.\d+\.\d+)/);
  logSuccess('Prisma CLI', match ? match[1] : 'installed');
}

async function checkProjectFiles() {
  logStep('Checking project files...');

  const rootDir = path.join(__dirname, '..');

  // Required files
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    '.env.tidb.example',
    '.github/workflows/tidb-migration.yml',
    'scripts/validate-env.js',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      logSuccess(file);
    } else {
      logFailure(file, 'Missing');
    }
  }
}

async function checkEnvironmentFile() {
  logStep('Checking environment configuration...');

  const rootDir = path.join(__dirname, '..');
  const envFiles = ['.env', '.env.local', '.env.tidb'];
  let foundEnv = false;

  for (const file of envFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      logSuccess(`Environment file: ${file}`);
      foundEnv = true;

      // Check for critical variables
      const content = fs.readFileSync(filePath, 'utf8');
      const hasSupabaseUrl = content.includes('VITE_SUPABASE_URL');
      const hasSupabaseKey = content.includes('VITE_SUPABASE_ANON_KEY');

      if (hasSupabaseUrl && hasSupabaseKey) {
        logSuccess('Supabase config', 'Variables present');
      } else {
        logWarning('Supabase config', 'Missing variables');
      }
    }
  }

  if (!foundEnv) {
    logWarning('Environment file', 'No .env file found - copy from .env.tidb.example');
  }
}

async function checkSupabaseConnection() {
  logStep('Checking Supabase connection...');

  // Try to load env vars
  const rootDir = path.join(__dirname, '..');
  let supabaseUrl = process.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    // Try reading from .env files
    const envFiles = ['.env', '.env.local'];
    for (const file of envFiles) {
      const filePath = path.join(rootDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/VITE_SUPABASE_URL=(.+)/);
        if (match) {
          supabaseUrl = match[1].trim().replace(/["']/g, '');
          break;
        }
      }
    }
  }

  if (!supabaseUrl) {
    logWarning('Supabase URL', 'Not configured');
    return;
  }

  const result = await checkUrl(supabaseUrl);
  if (result.ok) {
    logSuccess('Supabase connection', 'Reachable');
  } else {
    logFailure('Supabase connection', `Not reachable (status: ${result.status})`);
  }
}

async function checkDirectoryStructure() {
  logStep('Checking directory structure...');

  const rootDir = path.join(__dirname, '..');
  const requiredDirs = [
    'src',
    'src/lib',
    'src/components',
    'migrations/tidb-integration',
    'scripts',
  ];

  for (const dir of requiredDirs) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      logSuccess(dir);
    } else {
      logWarning(dir, 'Missing directory');
    }
  }

  // Check for apps/api (optional at this stage)
  const apiDir = path.join(rootDir, 'apps/api');
  if (fs.existsSync(apiDir)) {
    logSuccess('apps/api', 'NestJS project exists');
  } else {
    logWarning('apps/api', 'Not created yet (run: .\\scripts\\setup-api.ps1)');
  }
}

async function checkGitBranch() {
  logStep('Checking Git branch...');

  const branch = execCommand('git branch --show-current');
  if (branch === 'integrate-tidb') {
    logSuccess('Git branch', 'integrate-tidb (correct)');
  } else if (branch) {
    logWarning('Git branch', `${branch} (should be integrate-tidb for migration work)`);
  } else {
    logWarning('Git branch', 'Could not determine');
  }
}

// ============================================
// Main
// ============================================

async function main() {
  console.log(`
${colors.magenta}╔═══════════════════════════════════════════════════════════╗
║      Phase 0: Prerequisites Verification                   ║
║              Money Flow - TiDB Migration                   ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
  `);

  // Run all checks
  await checkNodeVersion();
  await checkNpmVersion();
  await checkGitVersion();
  await checkNestCLI();
  await checkWranglerCLI();
  await checkPrismaCLI();
  await checkProjectFiles();
  await checkEnvironmentFile();
  await checkSupabaseConnection();
  await checkDirectoryStructure();
  await checkGitBranch();

  // Summary
  console.log(`
${colors.bold}═══════════════════════════════════════════════════════════
                       SUMMARY
═══════════════════════════════════════════════════════════${colors.reset}

  ${colors.green}Passed:${colors.reset}   ${results.passed.length}
  ${colors.yellow}Warnings:${colors.reset} ${results.warnings.length}
  ${colors.red}Failed:${colors.reset}   ${results.failed.length}
`);

  if (results.failed.length > 0) {
    console.log(`${colors.red}${colors.bold}Failed checks:${colors.reset}`);
    results.failed.forEach(({ name, detail }) => {
      console.log(`  - ${name}: ${detail}`);
    });
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}Warnings:${colors.reset}`);
    results.warnings.forEach(({ name, detail }) => {
      console.log(`  - ${name}: ${detail}`);
    });
    console.log('');
  }

  // Final status
  if (results.failed.length === 0) {
    console.log(`${colors.green}${colors.bold}✓ Prerequisites check passed!${colors.reset}`);
    console.log(`  You can proceed with Phase 1: Backend API Creation`);
    console.log('');
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}✗ Prerequisites check failed!${colors.reset}`);
    console.log(`  Please fix the failed items before proceeding.`);
    console.log('');
    process.exit(1);
  }
}

main().catch(console.error);
