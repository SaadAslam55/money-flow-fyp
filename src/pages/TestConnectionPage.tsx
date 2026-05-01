/**
 * Supabase Connection Test Page
 * 
 * Standalone page for testing Supabase connection
 * Access at: /test-connection (development only)
 */

import { SupabaseConnectionTest } from '@/components/common/SupabaseConnectionTest';

export default function TestConnectionPage() {
  // Only show in development
  if ((import.meta as { env?: { PROD?: boolean } }).env?.PROD) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Not Available</h1>
          <p className="text-muted-foreground">Connection test is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Supabase Connection Test</h1>
        <p className="text-muted-foreground">Test your Supabase backend connection</p>
      </div>
      <div className="mx-auto max-w-4xl">
        <SupabaseConnectionTest />
      </div>
    </div>
  );
}

