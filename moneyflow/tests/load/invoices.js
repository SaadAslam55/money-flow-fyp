/**
 * Load Test Script (k6)
 * Performance and load testing for invoice API
 *
 * Run: k6 run tests/load/invoices.js --env API_URL=https://api.example.com --env AUTH_TOKEN=xxx
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================
// Custom Metrics
// ============================================

const errorRate = new Rate('errors');
const invoiceListTrend = new Trend('invoice_list_duration', true);
const invoiceDetailTrend = new Trend('invoice_detail_duration', true);
const invoiceCreateTrend = new Trend('invoice_create_duration', true);
const requestCounter = new Counter('total_requests');

// ============================================
// Configuration
// ============================================

export const options = {
  // Stages for ramping up/down
  stages: [
    { duration: '30s', target: 10 }, // Warm up
    { duration: '1m', target: 25 }, // Ramp up to 25 users
    { duration: '2m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 100 }, // Peak load
    { duration: '30s', target: 50 }, // Scale down
    { duration: '30s', target: 0 }, // Cool down
  ],

  // Thresholds for pass/fail criteria
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms
    errors: ['rate<0.05'], // Error rate under 5%
    invoice_list_duration: ['p(95)<300'],
    invoice_detail_duration: ['p(95)<200'],
    invoice_create_duration: ['p(95)<500'],
  },

  // Tags for better organization
  tags: {
    name: 'invoice-api-load-test',
    environment: __ENV.ENVIRONMENT || 'staging',
  },
};

// ============================================
// Setup
// ============================================

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${AUTH_TOKEN}`,
  'User-Agent': 'k6-load-test',
};

// ============================================
// Test Scenarios
// ============================================

export default function () {
  // ============================================
  // Scenario 1: List Invoices (Most Common)
  // ============================================

  group('List Invoices', () => {
    const startTime = Date.now();

    const res = http.get(`${BASE_URL}/invoices?page=1&limit=20`, {
      headers,
      tags: { name: 'GET /invoices' },
    });

    const duration = Date.now() - startTime;
    invoiceListTrend.add(duration);
    requestCounter.add(1);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'has data array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data);
        } catch {
          return false;
        }
      },
      'has pagination meta': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.meta && typeof body.meta.total === 'number';
        } catch {
          return false;
        }
      },
      'response time < 300ms': (r) => r.timings.duration < 300,
    });

    if (!success) {
      errorRate.add(1);
    }
  });

  sleep(1);

  // ============================================
  // Scenario 2: Get Invoice Detail
  // ============================================

  group('Get Invoice Detail', () => {
    // First get an invoice ID
    const listRes = http.get(`${BASE_URL}/invoices?page=1&limit=1`, { headers });

    let invoiceId = null;
    try {
      const body = JSON.parse(listRes.body);
      if (body.data && body.data.length > 0) {
        invoiceId = body.data[0].id;
      }
    } catch {
      // Ignore
    }

    if (invoiceId) {
      const startTime = Date.now();

      const res = http.get(`${BASE_URL}/invoices/${invoiceId}`, {
        headers,
        tags: { name: 'GET /invoices/:id' },
      });

      const duration = Date.now() - startTime;
      invoiceDetailTrend.add(duration);
      requestCounter.add(1);

      const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'has invoice id': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.id === invoiceId;
          } catch {
            return false;
          }
        },
        'has customer data': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.customer !== undefined;
          } catch {
            return false;
          }
        },
        'response time < 200ms': (r) => r.timings.duration < 200,
      });

      if (!success) {
        errorRate.add(1);
      }
    }
  });

  sleep(1);

  // ============================================
  // Scenario 3: Create Invoice (Less Frequent)
  // ============================================

  // Only create invoices occasionally to avoid overwhelming the system
  if (Math.random() < 0.1) {
    // 10% of iterations
    group('Create Invoice', () => {
      const startTime = Date.now();

      const payload = JSON.stringify({
        customer_id: 'load-test-customer',
        due_date: '2024-12-31',
        notes: `Load test invoice - ${Date.now()}`,
        items: [
          {
            description: 'Load Test Item',
            quantity: 1,
            unit_price: 100,
          },
        ],
      });

      const res = http.post(`${BASE_URL}/invoices`, payload, {
        headers,
        tags: { name: 'POST /invoices' },
      });

      const duration = Date.now() - startTime;
      invoiceCreateTrend.add(duration);
      requestCounter.add(1);

      const success = check(res, {
        'status is 201': (r) => r.status === 201,
        'has invoice id': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.id !== undefined;
          } catch {
            return false;
          }
        },
        'has invoice number': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.invoice_number !== undefined;
          } catch {
            return false;
          }
        },
        'response time < 500ms': (r) => r.timings.duration < 500,
      });

      if (!success) {
        errorRate.add(1);
      }
    });
  }

  sleep(1);

  // ============================================
  // Scenario 4: Get Invoice Stats
  // ============================================

  group('Get Invoice Stats', () => {
    const res = http.get(`${BASE_URL}/invoices/stats?period=month`, {
      headers,
      tags: { name: 'GET /invoices/stats' },
    });

    requestCounter.add(1);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'has stats data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.total !== undefined;
        } catch {
          return false;
        }
      },
    });

    if (!success) {
      errorRate.add(1);
    }
  });

  sleep(2);
}

// ============================================
// Summary Handler
// ============================================

export function handleSummary(data) {
  const summary = generateSummary(data);

  return {
    'tests/load/results/summary.json': JSON.stringify(data, null, 2),
    'tests/load/results/report.txt': summary,
    stdout: summary,
  };
}

function generateSummary(data) {
  const metrics = data.metrics;

  let output = `
╔══════════════════════════════════════════════════════════════╗
║                   LOAD TEST RESULTS                          ║
╠══════════════════════════════════════════════════════════════╣
║  Test Duration: ${data.state.testRunDurationMs / 1000}s
║  Total Requests: ${metrics.total_requests?.values?.count || 'N/A'}
║  
║  HTTP Performance:
║    - Avg Response Time: ${Math.round(metrics.http_req_duration?.values?.avg || 0)}ms
║    - 95th Percentile:   ${Math.round(metrics.http_req_duration?.values['p(95)'] || 0)}ms
║    - 99th Percentile:   ${Math.round(metrics.http_req_duration?.values['p(99)'] || 0)}ms
║    - Max Response Time: ${Math.round(metrics.http_req_duration?.values?.max || 0)}ms
║
║  Endpoint Performance:
║    - Invoice List (p95):   ${Math.round(metrics.invoice_list_duration?.values['p(95)'] || 0)}ms
║    - Invoice Detail (p95): ${Math.round(metrics.invoice_detail_duration?.values['p(95)'] || 0)}ms
║    - Invoice Create (p95): ${Math.round(metrics.invoice_create_duration?.values['p(95)'] || 0)}ms
║
║  Error Rate: ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%
║  
║  Thresholds:
`;

  // Add threshold results
  for (const [name, threshold] of Object.entries(data.thresholds || {})) {
    const status = threshold.ok ? '✓ PASS' : '✗ FAIL';
    output += `║    - ${name}: ${status}\n`;
  }

  output += `╚══════════════════════════════════════════════════════════════╝
`;

  return output;
}
