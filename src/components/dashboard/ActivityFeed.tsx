// src/components/dashboard/ActivityFeed.tsx

import { useNavigate } from 'react-router-dom';
import { Activity, FileText, Users, Package, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/formatters';
import { EmptyState } from '@/components/common/EmptyState';
import { Loader } from '@/components/common/Loader';
import type { ActivityItem } from '@/types/dashboard.types';

interface ActivityFeedProps {
  activities?: ActivityItem[];
  loading?: boolean;
}

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  const navigate = useNavigate();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_created':
      case 'invoice_updated':
      case 'invoice_paid':
        return FileText;
      case 'customer_created':
      case 'customer_updated':
        return Users;
      case 'product_created':
      case 'product_updated':
      case 'stock_adjusted':
        return Package;
      case 'transaction_created':
      case 'payment_received':
        return DollarSign;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    if (type.includes('invoice') || type.includes('payment')) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (type.includes('customer')) {
      return 'text-green-600 dark:text-green-400';
    }
    if (type.includes('product') || type.includes('stock')) {
      return 'text-purple-600 dark:text-purple-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const getActivityUrl = (activity: ActivityItem) => {
    if (activity.reference_id) {
      if (activity.type.includes('invoice')) {
        return `/invoices/${activity.reference_id}`;
      }
      if (activity.type.includes('customer')) {
        return `/customers/${activity.reference_id}`;
      }
      if (activity.type.includes('product')) {
        return `/products/${activity.reference_id}`;
      }
      if (activity.type.includes('transaction')) {
        return `/transactions/${activity.reference_id}`;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Loader size="md" message="Loading activity..." />
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Activity will appear here as you use the system"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Activity</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/reports')}
          className="h-8"
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            const url = getActivityUrl(activity);

            return (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  url ? 'hover:bg-accent cursor-pointer' : ''
                }`}
                onClick={() => url && navigate(url)}
              >
                <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${colorClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(activity.created_at)}</span>
                    {activity.user_name && (
                      <>
                        <span>•</span>
                        <span>by {activity.user_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

