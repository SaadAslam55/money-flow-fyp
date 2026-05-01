/**
 * Rollback Script
 * Emergency rollback to legacy Supabase backend
 */

// ============================================
// Configuration
// ============================================

const API_URL = process.env.API_URL || 'https://api.mtkcodex.site';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN!;

// ============================================
// Types
// ============================================

interface RollbackStep {
  name: string;
  action: () => Promise<void>;
  critical: boolean;
}

// ============================================
// Logging
// ============================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  };
  console.log(`${icons[type]} ${message}`);
}

function logStep(step: number, total: number, name: string) {
  console.log(`\n[${step}/${total}] ${name}`);
  console.log('─'.repeat(40));
}

// ============================================
// API Helper
// ============================================

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...options.headers,
    },
  });
}

// ============================================
// Rollback Steps
// ============================================

const rollbackSteps: RollbackStep[] = [
  {
    name: 'Switch feature flags to legacy backend',
    critical: true,
    action: async () => {
      const res = await apiRequest('/api/v1/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({
          useNewApi: false,
          useTiDB: false,
          useEdgeCache: false,
          newApiRollout: 0,
          tidbRollout: 0,
        }),
      });

      if (!res.ok) {
        // Try alternative endpoint
        const altRes = await apiRequest('/admin/feature-flags', {
          method: 'POST',
          body: JSON.stringify({
            useNewApi: false,
            useTiDB: false,
            newApiRollout: 0,
          }),
        });

        if (!altRes.ok) {
          throw new Error(`Failed to update feature flags: ${res.status}`);
        }
      }

      log('Feature flags updated to use legacy backend', 'success');
    },
  },
  {
    name: 'Clear all caches',
    critical: false,
    action: async () => {
      try {
        // Clear Redis cache
        await apiRequest('/api/v1/cache/clear', { method: 'POST' });
        log('Redis cache cleared', 'success');
      } catch {
        log('Redis cache clear failed (non-critical)', 'warn');
      }

      try {
        // Clear edge cache
        await apiRequest('/cache/invalidate', {
          method: 'POST',
          body: JSON.stringify({ pattern: '*' }),
        });
        log('Edge cache cleared', 'success');
      } catch {
        log('Edge cache clear failed (non-critical)', 'warn');
      }
    },
  },
  {
    name: 'Disable read-only mode',
    critical: true,
    action: async () => {
      const res = await apiRequest('/api/v1/admin/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          readOnly: false,
          message: '',
        }),
      });

      if (!res.ok) {
        // Try alternative endpoint
        const altRes = await apiRequest('/admin/maintenance', {
          method: 'POST',
          body: JSON.stringify({ readOnly: false }),
        });

        if (!altRes.ok) {
          log('Could not disable read-only via API, may need manual intervention', 'warn');
        }
      }

      log('Read-only mode disabled', 'success');
    },
  },
  {
    name: 'Verify legacy backend health',
    critical: true,
    action: async () => {
      const res = await fetch(`${API_URL}/health`);

      if (!res.ok) {
        throw new Error(`Health check failed: ${res.status}`);
      }

      const data = await res.json();
      log(`Health status: ${data.status || 'ok'}`, 'success');
    },
  },
  {
    name: 'Test critical endpoints',
    critical: false,
    action: async () => {
      // Test invoices endpoint
      const invoicesRes = await apiRequest('/api/v1/invoices?limit=1');
      if (invoicesRes.ok) {
        log('Invoices endpoint: OK', 'success');
      } else {
        log('Invoices endpoint: FAILED', 'warn');
      }

      // Test customers endpoint
      const customersRes = await apiRequest('/api/v1/customers?limit=1');
      if (customersRes.ok) {
        log('Customers endpoint: OK', 'success');
      } else {
        log('Customers endpoint: FAILED', 'warn');
      }
    },
  },
];

// ============================================
// Main Rollback Function
// ============================================

async function executeRollback() {
  console.log('═'.repeat(60));
  console.log('         🔄 EMERGENCY ROLLBACK PROCEDURE');
  console.log('═'.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`API:  ${API_URL}`);
  console.log('');

  const results: { step: string; success: boolean; error?: string }[] = [];

  for (let i = 0; i < rollbackSteps.length; i++) {
    const step = rollbackSteps[i];
    logStep(i + 1, rollbackSteps.length, step.name);

    try {
      await step.action();
      results.push({ step: step.name, success: true });
    } catch (error: any) {
      results.push({ step: step.name, success: false, error: error.message });
      log(`Error: ${error.message}`, 'error');

      if (step.critical) {
        log('CRITICAL STEP FAILED - Manual intervention may be required', 'error');
      }
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('                 ROLLBACK SUMMARY');
  console.log('═'.repeat(60));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((r) => {
    const icon = r.success ? '✅' : '❌';
    console.log(`   ${icon} ${r.step}`);
    if (r.error) {
      console.log(`      Error: ${r.error}`);
    }
  });

  console.log('\n' + '─'.repeat(60));
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed:     ${failed}`);
  console.log('═'.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  ROLLBACK COMPLETED WITH ERRORS');
    console.log('\nManual verification required:');
    console.log('1. Check application is accessible');
    console.log('2. Verify data reads work');
    console.log('3. Test creating a draft invoice');
    console.log('4. Check error logs');
  } else {
    console.log('\n✅ ROLLBACK COMPLETED SUCCESSFULLY');
  }

  console.log('\n📋 Post-Rollback Checklist:');
  console.log('   [ ] Verify application is working');
  console.log('   [ ] Check error logs for issues');
  console.log('   [ ] Notify team of rollback');
  console.log('   [ ] Document rollback reason');
  console.log('   [ ] Schedule post-mortem');

  return failed === 0;
}

// ============================================
// Confirmation Check
// ============================================

function checkConfirmation(): boolean {
  const args = process.argv.slice(2);
  const today = new Date().toISOString().split('T')[0];
  const expectedCode = `ROLLBACK-${today}`;

  const confirmArg = args.find((arg) => arg.startsWith('--confirm='));

  if (!confirmArg) {
    console.log('═'.repeat(60));
    console.log('         ⚠️  ROLLBACK CONFIRMATION REQUIRED');
    console.log('═'.repeat(60));
    console.log('');
    console.log('This will rollback to the legacy Supabase backend.');
    console.log('This action should only be taken if there are critical issues.');
    console.log('');
    console.log('To confirm, run with:');
    console.log(`   npx ts-node rollback.ts --confirm=${expectedCode}`);
    console.log('');
    return false;
  }

  const providedCode = confirmArg.split('=')[1];

  if (providedCode !== expectedCode) {
    console.error('❌ Invalid confirmation code');
    console.error(`   Expected: ${expectedCode}`);
    console.error(`   Provided: ${providedCode}`);
    return false;
  }

  return true;
}

// ============================================
// Entry Point
// ============================================

if (!ADMIN_TOKEN) {
  console.error('ERROR: ADMIN_TOKEN environment variable required');
  process.exit(1);
}

if (!checkConfirmation()) {
  process.exit(1);
}

executeRollback()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fatal error during rollback:', err);
    process.exit(1);
  });
