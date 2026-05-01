/**
 * Supabase Connection Test Component
 * 
 * Displays connection status and allows testing Supabase connection
 * Useful for debugging connection issues
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export function SupabaseConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'warning' | 'pending'>('pending');

  const runTests = async () => {
    setIsTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Configuration Check
    testResults.push({
      name: 'Configuration',
      status: 'pending',
      message: 'Checking configuration...',
    });
    setResults([...testResults]);

    const isConfigured = isSupabaseConfigured();
    testResults[0] = {
      name: 'Configuration',
      status: isConfigured ? 'success' : 'error',
      message: isConfigured
        ? 'Supabase is properly configured'
        : 'Missing or invalid environment variables',
      details: isConfigured
        ? 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set'
        : 'Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
    };
    setResults([...testResults]);

    if (!isConfigured) {
      setIsTesting(false);
      setOverallStatus('error');
      return;
    }

    // Test 2: Network Connectivity
    testResults.push({
      name: 'Network Connectivity',
      status: 'pending',
      message: 'Testing network connection...',
    });
    setResults([...testResults]);

    try {
      const supabaseUrl = (import.meta as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        testResults[1] = {
          name: 'Network Connectivity',
          status: 'error',
          message: 'VITE_SUPABASE_URL not configured',
        };
        setResults([...testResults]);
        return;
      }
      const url = new URL(supabaseUrl);
      const healthUrl = `${url.origin}/rest/v1/`;

      const anonKey = (import.meta as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY ?? '';

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          apikey: anonKey,
        },
      });

      testResults[1] = {
        name: 'Network Connectivity',
        status: response.ok || response.status === 401 || response.status === 404 ? 'success' : 'warning',
        message:
          response.ok || response.status === 401 || response.status === 404
            ? 'Network connection successful'
            : 'Unexpected response',
        details: `Status: ${response.status} ${response.statusText}`,
      };
    } catch (error) {
      testResults[1] = {
        name: 'Network Connectivity',
        status: 'error',
        message: 'Failed to reach Supabase server',
        details: error instanceof Error ? error.message : String(error),
      };
    }
    setResults([...testResults]);

    // Test 3: Database Connection
    testResults.push({
      name: 'Database Connection',
      status: 'pending',
      message: 'Testing database connection...',
    });
    setResults([...testResults]);

    try {
      const { data, error } = await supabase.from('organizations').select('count').limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
          testResults[2] = {
            name: 'Database Connection',
            status: 'success',
            message: 'Database is accessible',
            details: 'Connection successful (RLS policies may restrict data access)',
          };
        } else if (error.code === '42P01') {
          testResults[2] = {
            name: 'Database Connection',
            status: 'error',
            message: 'Table does not exist',
            details: 'Run migrations: npm run db:push',
          };
        } else {
          testResults[2] = {
            name: 'Database Connection',
            status: 'error',
            message: 'Database query failed',
            details: `${error.code}: ${error.message}`,
          };
        }
      } else {
        testResults[2] = {
          name: 'Database Connection',
          status: 'success',
          message: 'Database connection successful',
          details: 'Can query database tables',
        };
      }
    } catch (error) {
      testResults[2] = {
        name: 'Database Connection',
        status: 'error',
        message: 'Failed to connect to database',
        details: error instanceof Error ? error.message : String(error),
      };
    }
    setResults([...testResults]);

    // Test 4: Authentication Endpoint
    testResults.push({
      name: 'Authentication',
      status: 'pending',
      message: 'Testing authentication endpoint...',
    });
    setResults([...testResults]);

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        if (error.message.includes('session') || error.message.includes('No session')) {
          testResults[3] = {
            name: 'Authentication',
            status: 'success',
            message: 'Authentication endpoint is accessible',
            details: 'No active session (expected)',
          };
        } else {
          testResults[3] = {
            name: 'Authentication',
            status: 'error',
            message: 'Authentication endpoint error',
            details: error.message,
          };
        }
      } else {
        testResults[3] = {
          name: 'Authentication',
          status: 'success',
          message: 'Authentication endpoint is accessible',
          details: data.session ? 'Active session found' : 'No active session (expected)',
        };
      }
    } catch (error) {
      testResults[3] = {
        name: 'Authentication',
        status: 'error',
        message: 'Failed to reach authentication endpoint',
        details: error instanceof Error ? error.message : String(error),
      };
    }
    setResults([...testResults]);

    // Test 5: Storage Endpoint
    testResults.push({
      name: 'Storage',
      status: 'pending',
      message: 'Testing storage endpoint...',
    });
    setResults([...testResults]);

    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        if (error.message.includes('permission') || error.message.includes('JWT')) {
          testResults[4] = {
            name: 'Storage',
            status: 'success',
            message: 'Storage endpoint is accessible',
            details: 'Permission error (expected without auth)',
          };
        } else {
          testResults[4] = {
            name: 'Storage',
            status: 'warning',
            message: 'Storage endpoint may have issues',
            details: error.message,
          };
        }
      } else {
        testResults[4] = {
          name: 'Storage',
          status: 'success',
          message: 'Storage endpoint is accessible',
          details: `Found ${data.length} bucket(s)`,
        };
      }
    } catch (error) {
      testResults[4] = {
        name: 'Storage',
        status: 'error',
        message: 'Failed to reach storage endpoint',
        details: error instanceof Error ? error.message : String(error),
      };
    }
    setResults([...testResults]);

    // Calculate overall status
    const hasErrors = testResults.some((r) => r.status === 'error');
    const hasWarnings = testResults.some((r) => r.status === 'warning');
    const allSuccess = testResults.every((r) => r.status === 'success');

    if (allSuccess) {
      setOverallStatus('success');
    } else if (hasErrors) {
      setOverallStatus('error');
    } else if (hasWarnings) {
      setOverallStatus('warning');
    } else {
      setOverallStatus('pending');
    }

    setIsTesting(false);
  };

  useEffect(() => {
    // Auto-run tests on mount
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">PASS</Badge>;
      case 'error':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">WARNING</Badge>;
      case 'pending':
        return <Badge variant="outline">TESTING...</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Supabase Connection Test</CardTitle>
            <CardDescription>Test your Supabase backend connection and configuration</CardDescription>
          </div>
          <Button onClick={runTests} disabled={isTesting} size="sm" variant="outline">
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {overallStatus !== 'pending' && (
          <Alert
            variant={
              overallStatus === 'success'
                ? 'default'
                : overallStatus === 'error'
                  ? 'destructive'
                  : 'default'
            }
            className={
              overallStatus === 'success'
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : overallStatus === 'error'
                  ? ''
                  : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
            }
          >
            {getStatusIcon(overallStatus)}
            <AlertDescription>
              {overallStatus === 'success' && (
                <span className="font-semibold text-green-700 dark:text-green-300">
                  ✅ All tests passed! Supabase is connected successfully.
                </span>
              )}
              {overallStatus === 'error' && (
                <span className="font-semibold">
                  ❌ Some tests failed. Please check the errors below and fix your configuration.
                </span>
              )}
              {overallStatus === 'warning' && (
                <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                  ⚠️ Some warnings detected. Connection may work but check details.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Environment Variables Info */}
        <div className="rounded-lg border bg-muted p-4">
          <h3 className="mb-2 text-sm font-semibold">Environment Variables</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">VITE_SUPABASE_URL:</span>
              <code className="rounded bg-background px-2 py-1">
                {(import.meta as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL
                  ? `${(import.meta as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.substring(0, 30)}...`
                  : '❌ Not set'}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">VITE_SUPABASE_ANON_KEY:</span>
              <code className="rounded bg-background px-2 py-1">
                {(import.meta as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY
                  ? `***${(import.meta as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY?.slice(-10)}`
                  : '❌ Not set'}
              </code>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Test Results</h3>
          {results.map((result, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.name}</span>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.details && (
                      <p className="mt-1 text-xs text-muted-foreground font-mono">{result.details}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {results.length === 0 && !isTesting && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Click "Run Tests" to check your Supabase connection
            </p>
          )}
        </div>

        {/* Help Section */}
        {overallStatus === 'error' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Check that your .env file exists and contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                <li>Verify your Supabase project is active in the Supabase dashboard</li>
                <li>Ensure your Supabase URL and keys are correct</li>
                <li>Check your internet connection</li>
                <li>Run migrations if tables don't exist: <code>npm run db:push</code></li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

