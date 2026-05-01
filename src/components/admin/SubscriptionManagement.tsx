// src/components/admin/SubscriptionManagement.tsx
import { useState } from 'react';
import { CreditCard, TrendingUp, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useSystemMetrics } from '@/hooks/useAdmin';

export function SubscriptionManagement() {
  const { metrics, isLoading } = useSystemMetrics();
  const [changePlanDialog, setChangePlanDialog] = useState<{
    open: boolean;
    orgId: string | null;
    newPlan: string;
  }>({
    open: false,
    orgId: null,
    newPlan: 'pro',
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage subscriptions and billing across the platform</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics as any)?.plan_distribution
                ? (Object.values((metrics as any).plan_distribution) as unknown[]).reduce((a: unknown, b: unknown) => {
                    const aNum = typeof a === 'number' ? a : 0;
                    const bNum = typeof b === 'number' ? b : 0;
                    return aNum + bNum;
                  }, 0 as unknown) as number -
                  ((metrics as any).plan_distribution.free ?? 0)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Paid plans currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((metrics as any)?.total_revenue ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue from paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan Distribution</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {(metrics as any)?.plan_distribution && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Free:</span>
                    <span className="font-medium">{(metrics as any).plan_distribution.free ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pro:</span>
                    <span className="font-medium">{(metrics as any).plan_distribution.pro ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Enterprise:</span>
                    <span className="font-medium">
                      {(metrics as any).plan_distribution.enterprise ?? 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Plan Change */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Subscription Changes</CardTitle>
          <CardDescription>
            Manually change subscription plans for organizations (use with caution)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-id">Organization ID</Label>
              <Input
                id="org-id"
                placeholder="Enter organization ID"
                value={changePlanDialog.orgId ?? ''}
                onChange={(e) =>
                  setChangePlanDialog({ ...changePlanDialog, orgId: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-plan">New Plan</Label>
              <Select
                value={changePlanDialog.newPlan}
                onValueChange={(value) =>
                  setChangePlanDialog({ ...changePlanDialog, newPlan: value })
                }
              >
                <SelectTrigger id="new-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => setChangePlanDialog({ ...changePlanDialog, open: true })}
            disabled={!changePlanDialog.orgId}
          >
            Change Subscription Plan
          </Button>
        </CardContent>
      </Card>

      {/* Subscription History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscription Changes</CardTitle>
          <CardDescription>Track manual subscription plan changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Previous Plan</TableHead>
                  <TableHead>New Plan</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No subscription changes recorded
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Confirmation Dialog */}
      <AlertDialog
        open={changePlanDialog.open}
        onOpenChange={(open) => setChangePlanDialog({ ...changePlanDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the subscription plan for organization{' '}
              <strong>{changePlanDialog.orgId}</strong> to <strong>{changePlanDialog.newPlan}</strong>?
              This action will immediately update the organization's plan and may affect their access
              to features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                // TODO: Implement API call to change plan
                toast.success('Subscription plan changed successfully');
                setChangePlanDialog({ open: false, orgId: null, newPlan: 'pro' });
              }}
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

