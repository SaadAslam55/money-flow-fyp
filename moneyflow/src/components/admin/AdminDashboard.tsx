// src/components/admin/AdminDashboard.tsx
import { TrendingUp, Users, Building2, DollarSign, Activity, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemMetrics } from '@/hooks/useAdmin';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationsList } from './OrganizationsList';
import { AuditLogs } from './AuditLogs';

export function AdminDashboard() {
  const { metrics, isLoading, canAccess } = useSystemMetrics();

  if (!canAccess) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">You don't have permission to access this page</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load system metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Overview</h1>
        <p className="text-muted-foreground">Monitor platform health and performance</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics as any)?.total_organizations ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active businesses on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics as any)?.total_users ?? 0}</div>
            <p className="text-xs text-muted-foreground">Registered users across all orgs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics as any)?.total_customers ?? 0}</div>
            <p className="text-xs text-muted-foreground">Customers across all organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency((metrics as any)?.total_revenue ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Total revenue from paid invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      {(metrics as any)?.plan_distribution && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Free</span>
                  <span className="text-2xl font-bold">{(metrics as any).plan_distribution?.free ?? 0}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pro</span>
                  <span className="text-2xl font-bold">{(metrics as any).plan_distribution.pro ?? 0}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Enterprise</span>
                  <span className="text-2xl font-bold">
                    {(metrics as any).plan_distribution.enterprise ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Invoices</span>
              <span className="text-lg font-bold">{(metrics as any)?.total_invoices ?? 0}</span>
            </div>
              {(metrics as any)?.status_distribution && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Status Distribution</div>
                <div className="grid gap-2 md:grid-cols-2">
                  {Object.entries((metrics as any).status_distribution ?? {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground capitalize">
                        {status.replace('_', ' ')}
                      </span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

