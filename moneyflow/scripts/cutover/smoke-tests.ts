/**
 * Production Smoke Tests
 * Critical path verification after cutover
 */

// ============================================
// Configuration
// ============================================

const API_URL = process.env.API_URL || 'https://api.mtkcodex.site';
const AUTH_TOKEN = process.env.AUTH_TOKEN!;

// ============================================
// Types
// ============================================

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: string;
}

// ============================================
// Test Runner
// ============================================

async function runTest(
  name: string,
  category: string,
  testFn: () => Promise<string | void>
): Promise<TestResult> {
  const start = Date.now();
  try {
    const details = await testFn();
    return {
      name,
      category,
      passed: true,
      duration: Date.now() - start,
      details: details || undefined,
    };
  } catch (error: any) {
    return {
      name,
      category,
      passed: false,
      duration: Date.now() - start,
      error: error.message,
    };
  }
}

// ============================================
// HTTP Helper
// ============================================

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (AUTH_TOKEN) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }

  return fetch(url, { ...options, headers });
}

// ============================================
// Test Definitions
// ============================================

const tests: Array<{
  name: string;
  category: string;
  test: () => Promise<string | void>;
}> = [
  // ============================================
  // Infrastructure Tests
  // ============================================
  {
    name: 'API Health Check',
    category: 'Infrastructure',
    test: async () => {
      const res = await apiRequest('/health');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (data.status !== 'healthy') throw new Error('Unhealthy status');
      return `Status: ${data.status}`;
    },
  },
  {
    name: 'Readiness Check',
    category: 'Infrastructure',
    test: async () => {
      const res = await apiRequest('/health/ready');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      return `TiDB: ${data.checks?.tidb ? 'OK' : 'FAIL'}, Redis: ${data.checks?.redis ? 'OK' : 'FAIL'}`;
    },
  },
  {
    name: 'Response Time',
    category: 'Infrastructure',
    test: async () => {
      const start = Date.now();
      await apiRequest('/health');
      const latency = Date.now() - start;
      if (latency > 500) throw new Error(`Latency too high: ${latency}ms`);
      return `Latency: ${latency}ms`;
    },
  },

  // ============================================
  // Authentication Tests
  // ============================================
  {
    name: 'Auth Token Validation',
    category: 'Authentication',
    test: async () => {
      const res = await apiRequest('/api/v1/auth/me');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (!data.id) throw new Error('No user ID in response');
      return `User: ${data.email}`;
    },
  },
  {
    name: 'Unauthorized Access Blocked',
    category: 'Authentication',
    test: async () => {
      const res = await fetch(`${API_URL}/api/v1/invoices`);
      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
      return 'Correctly returned 401';
    },
  },

  // ============================================
  // Invoice Tests
  // ============================================
  {
    name: 'Invoice List',
    category: 'Invoices',
    test: async () => {
      const res = await apiRequest('/api/v1/invoices?limit=5');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Invalid response format');
      return `Found ${data.meta?.total || data.data.length} invoices`;
    },
  },
  {
    name: 'Invoice Stats',
    category: 'Invoices',
    test: async () => {
      const res = await apiRequest('/api/v1/invoices/stats');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (typeof data.total !== 'number') throw new Error('Invalid stats format');
      return `Total: ${data.total}, Paid: ${data.paid}`;
    },
  },
  {
    name: 'Create Draft Invoice',
    category: 'Invoices',
    test: async () => {
      const res = await apiRequest('/api/v1/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: 'smoke-test-customer',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: `Smoke test - ${new Date().toISOString()}`,
          items: [
            {
              description: 'Smoke Test Item',
              quantity: 1,
              unit_price: 1,
            },
          ],
        }),
      });
      if (res.status !== 201) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (!data.id) throw new Error('No invoice ID returned');
      return `Created: ${data.invoice_number}`;
    },
  },

  // ============================================
  // Customer Tests
  // ============================================
  {
    name: 'Customer List',
    category: 'Customers',
    test: async () => {
      const res = await apiRequest('/api/v1/customers?limit=5');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Invalid response format');
      return `Found ${data.meta?.total || data.data.length} customers`;
    },
  },
  {
    name: 'Customer Search',
    category: 'Customers',
    test: async () => {
      const res = await apiRequest('/api/v1/customers?search=test');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return 'Search working';
    },
  },

  // ============================================
  // Product Tests
  // ============================================
  {
    name: 'Product List',
    category: 'Products',
    test: async () => {
      const res = await apiRequest('/api/v1/products?limit=5');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Invalid response format');
      return `Found ${data.meta?.total || data.data.length} products`;
    },
  },
  {
    name: 'Low Stock Check',
    category: 'Products',
    test: async () => {
      const res = await apiRequest('/api/v1/products/low-stock');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return 'Low stock endpoint working';
    },
  },

  // ============================================
  // Reports Tests
  // ============================================
  {
    name: 'Dashboard Data',
    category: 'Reports',
    test: async () => {
      const res = await apiRequest('/api/v1/reports/dashboard');
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      return `Revenue: ${data.revenue?.total || 'N/A'}`;
    },
  },

  // ============================================
  // Cache Tests
  // ============================================
  {
    name: 'Cache Headers',
    category: 'Performance',
    test: async () => {
      const res = await apiRequest('/api/v1/invoices?limit=1');
      const cacheControl = res.headers.get('cache-control');
      if (!cacheControl) throw new Error('No cache-control header');
      return `Cache: ${cacheControl}`;
    },
  },
];

// ============================================
// Main Runner
// ============================================

async function runSmokeTests() {
  console.log('═'.repeat(60));
  console.log('           PRODUCTION SMOKE TESTS');
  console.log('═'.repeat(60));
  console.log(`API: ${API_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');

  const results: TestResult[] = [];
  const categories = [...new Set(tests.map((t) => t.category))];

  for (const category of categories) {
    console.log(`\n📋 ${category}`);
    console.log('─'.repeat(40));

    const categoryTests = tests.filter((t) => t.category === category);

    for (const test of categoryTests) {
      const result = await runTest(test.name, test.category, test.test);
      results.push(result);

      const icon = result.passed ? '✅' : '❌';
      const time = `${result.duration}ms`.padStart(6);
      console.log(`   ${icon} ${test.name} (${time})`);

      if (result.details) {
        console.log(`      ${result.details}`);
      }
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log('\n' + '═'.repeat(60));
  console.log('                      RESULTS');
  console.log('═'.repeat(60));
  console.log(`   Total Tests:  ${results.length}`);
  console.log(`   Passed:       ${passed} ✅`);
  console.log(`   Failed:       ${failed} ${failed > 0 ? '❌' : ''}`);
  console.log(`   Total Time:   ${totalTime}ms`);
  console.log('═'.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  SMOKE TESTS FAILED');
    console.log('\nFailed tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    console.log('\n🔴 CONSIDER ROLLBACK IF CRITICAL FAILURES');
    process.exit(1);
  }

  console.log('\n✅ ALL SMOKE TESTS PASSED');
  console.log('\nProduction is operational. Continue monitoring.');
}

// ============================================
// Entry Point
// ============================================

if (!AUTH_TOKEN) {
  console.error('ERROR: AUTH_TOKEN environment variable required');
  console.error('Usage: AUTH_TOKEN=xxx npx ts-node smoke-tests.ts');
  process.exit(1);
}

runSmokeTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
