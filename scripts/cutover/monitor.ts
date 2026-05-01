/**
 * Production Monitor
 * Real-time health monitoring during and after cutover
 */

// ============================================
// Configuration
// ============================================

const MONITOR_API_URL = process.env.API_URL || 'https://api.mtkcodex.site';
const MONITOR_AUTH_TOKEN = process.env.AUTH_TOKEN!;
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '30000', 10); // 30 seconds

// ============================================
// Types
// ============================================

interface HealthStatus {
  timestamp: string;
  api: boolean;
  tidb: boolean;
  redis: boolean;
  latency: number;
  statusCode: number;
}

interface AlertThresholds {
  maxLatency: number;
  minUptime: number;
  maxConsecutiveFailures: number;
}

// ============================================
// State
// ============================================

const healthHistory: HealthStatus[] = [];
let consecutiveFailures = 0;
let alertsSent = 0;

const thresholds: AlertThresholds = {
  maxLatency: 1000, // 1 second
  minUptime: 95, // 95%
  maxConsecutiveFailures: 3, // Trigger alert after 3 failures
};

// ============================================
// Health Check
// ============================================

async function checkHealth(): Promise<HealthStatus> {
  const start = Date.now();

  try {
    const res = await fetch(`${MONITOR_API_URL}/health/ready`, {
      headers: {
        Authorization: `Bearer ${MONITOR_AUTH_TOKEN}`,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const latency = Date.now() - start;
    let data: any = {};

    try {
      data = await res.json();
    } catch {
      // Response might not be JSON
    }

    return {
      timestamp: new Date().toISOString(),
      api: res.ok,
      tidb: data.checks?.tidb ?? data.database ?? false,
      redis: data.checks?.redis ?? data.cache ?? false,
      latency,
      statusCode: res.status,
    };
  } catch (error: any) {
    return {
      timestamp: new Date().toISOString(),
      api: false,
      tidb: false,
      redis: false,
      latency: Date.now() - start,
      statusCode: 0,
    };
  }
}

// ============================================
// Alert System
// ============================================

function triggerAlert(message: string, severity: 'warning' | 'critical') {
  alertsSent++;
  const icon = severity === 'critical' ? '🚨' : '⚠️';

  console.log('\n' + '!'.repeat(60));
  console.log(`${icon} ALERT [${severity.toUpperCase()}]: ${message}`);
  console.log('!'.repeat(60));

  // In production, you would send this to:
  // - Slack webhook
  // - PagerDuty
  // - Email
  // - SMS

  if (severity === 'critical') {
    console.log('\n🔴 CRITICAL ALERT - CONSIDER ROLLBACK');
    console.log('   Run: npx ts-node rollback.ts --confirm=ROLLBACK-<date>');
  }
}

// ============================================
// Display Functions
// ============================================

function clearScreen() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

function getStatusIcon(status: boolean): string {
  return status ? '🟢' : '🔴';
}

function getLatencyColor(latency: number): string {
  if (latency < 200) return '\x1b[32m'; // Green
  if (latency < 500) return '\x1b[33m'; // Yellow
  return '\x1b[31m'; // Red
}

function displayDashboard(status: HealthStatus) {
  clearScreen();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           📊 PRODUCTION MONITOR - LIVE                     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Target:     ${MONITOR_API_URL.padEnd(44)} ║`);
  console.log(`║  Last Check: ${status.timestamp.padEnd(44)} ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║                                                            ║');
  console.log(
    `║  API Status:   ${getStatusIcon(status.api)} ${status.api ? 'HEALTHY' : 'DOWN'}`.padEnd(60) +
      ' ║'
  );
  console.log(
    `║  TiDB:         ${getStatusIcon(status.tidb)} ${status.tidb ? 'CONNECTED' : 'DISCONNECTED'}`.padEnd(
      60
    ) + ' ║'
  );
  console.log(
    `║  Redis:        ${getStatusIcon(status.redis)} ${status.redis ? 'CONNECTED' : 'DISCONNECTED'}`.padEnd(
      60
    ) + ' ║'
  );
  console.log(`║  Latency:      ${status.latency}ms`.padEnd(60) + ' ║');
  console.log(`║  Status Code:  ${status.statusCode}`.padEnd(60) + ' ║');
  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');

  // Calculate metrics from healthHistory
  if (healthHistory.length > 0) {
    const uptime = (
      (healthHistory.filter((h) => h.api).length / healthHistory.length) *
      100
    ).toFixed(1);
    const avgLatency = Math.round(
      healthHistory.reduce((sum, h) => sum + h.latency, 0) / healthHistory.length
    );
    const maxLatency = Math.max(...healthHistory.map((h) => h.latency));
    const minLatency = Math.min(...healthHistory.map((h) => h.latency));

    console.log(
      '║  STATISTICS (last ' +
        healthHistory.length.toString().padEnd(3) +
        ' checks)                          ║'
    );
    console.log('║  ─────────────────────────────────────────────────────    ║');
    console.log(`║  Uptime:       ${uptime}%`.padEnd(60) + ' ║');
    console.log(`║  Avg Latency:  ${avgLatency}ms`.padEnd(60) + ' ║');
    console.log(`║  Min Latency:  ${minLatency}ms`.padEnd(60) + ' ║');
    console.log(`║  Max Latency:  ${maxLatency}ms`.padEnd(60) + ' ║');
    console.log(`║  Alerts Sent:  ${alertsSent}`.padEnd(60) + ' ║');
    console.log('║                                                            ║');
  }

  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Press Ctrl+C to stop monitoring                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Recent healthHistory
  if (healthHistory.length > 0) {
    console.log('\nRecent Checks:');
    const recent = healthHistory.slice(-5).reverse();
    recent.forEach((h) => {
      const time = h.timestamp.split('T')[1].split('.')[0];
      const icon = h.api ? '✓' : '✗';
      console.log(
        `  ${time} - ${icon} API | ${h.latency}ms | TiDB:${h.tidb ? '✓' : '✗'} Redis:${h.redis ? '✓' : '✗'}`
      );
    });
  }
}

// ============================================
// Main Monitor Loop
// ============================================

async function monitor() {
  console.log('Starting production monitor...');
  console.log(`Checking ${MONITOR_API_URL} every ${CHECK_INTERVAL / 1000}s`);
  console.log('');

  // Initial check
  const initialStatus = await checkHealth();
  healthHistory.push(initialStatus);
  displayDashboard(initialStatus);

  // Continuous monitoring
  const interval = setInterval(async () => {
    const status = await checkHealth();
    healthHistory.push(status);

    // Keep last 100 checks
    while (healthHistory.length > 100) {
      healthHistory.shift();
    }

    // Check for failures
    if (!status.api) {
      consecutiveFailures++;

      if (consecutiveFailures >= thresholds.maxConsecutiveFailures) {
        triggerAlert(`API has been down for ${consecutiveFailures} consecutive checks`, 'critical');
      }
    } else {
      if (consecutiveFailures > 0) {
        console.log(`\n✅ API recovered after ${consecutiveFailures} failures`);
      }
      consecutiveFailures = 0;
    }

    // Check latency
    if (status.latency > thresholds.maxLatency && status.api) {
      triggerAlert(
        `High latency detected: ${status.latency}ms (threshold: ${thresholds.maxLatency}ms)`,
        'warning'
      );
    }

    // Check uptime
    if (healthHistory.length >= 10) {
      const recentUptime = (healthHistory.slice(-10).filter((h) => h.api).length / 10) * 100;
      if (recentUptime < thresholds.minUptime) {
        triggerAlert(
          `Uptime dropped to ${recentUptime}% (threshold: ${thresholds.minUptime}%)`,
          'critical'
        );
      }
    }

    displayDashboard(status);
  }, CHECK_INTERVAL);

  // Handle shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n\nMonitoring stopped.');
    console.log(`Total checks: ${healthHistory.length}`);
    console.log(`Alerts sent: ${alertsSent}`);

    const uptime = (
      (healthHistory.filter((h) => h.api).length / healthHistory.length) *
      100
    ).toFixed(1);
    console.log(`Overall uptime: ${uptime}%`);

    process.exit(0);
  });
}

// ============================================
// Entry Point
// ============================================

if (!MONITOR_AUTH_TOKEN) {
  console.error('ERROR: AUTH_TOKEN environment variable required');
  console.error('Usage: AUTH_TOKEN=xxx npx ts-node monitor.ts');
  process.exit(1);
}

monitor().catch((err) => {
  console.error('Monitor error:', err);
  process.exit(1);
});
