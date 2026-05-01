// src/components/admin/OrganizationDetails.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, FileText, DollarSign, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizationDetails } from '@/hooks/useAdmin';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Separator } from '@/components/ui/separator';

export function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { organization, statistics, isLoading } = useOrganizationDetails(id || null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Organization not found</p>
        <Button onClick={() => navigate('/admin/organizations')} className="mt-4">
          Back to Organizations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/organizations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">Organization Details</p>
          </div>
        </div>
        <Badge variant={organization.subscription_status === 'active' ? 'default' : 'destructive'}>
          {organization.subscription_status.toUpperCase()}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.user_count ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.customer_count ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.invoice_count ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statistics?.total_revenue ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Organization Name</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {organization.name}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {organization.email}
                  </div>
                </div>

                {organization.phone && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Phone</div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {organization.phone}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Created</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(organization.created_at)}
                  </div>
                </div>

                {organization.address && (
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-sm font-medium text-muted-foreground">Address</div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <div>
                        {organization.address}
                        {organization.city && `, ${organization.city}`}
                        {organization.country && `, ${organization.country}`}
                      </div>
                    </div>
                  </div>
                )}

                {organization.subdomain && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Subdomain</div>
                    <div>{organization.subdomain}</div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Currency</div>
                  <div>{organization.currency}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Timezone</div>
                  <div>{organization.timezone}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Plan</div>
                  <Badge variant="outline" className="text-base">
                    {organization.subscription_plan?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <Badge
                    variant={
                      organization.subscription_status === 'active' ? 'default' : 'destructive'
                    }
                  >
                    {organization.subscription_status.toUpperCase()}
                  </Badge>
                </div>

                {organization.stripe_customer_id && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Stripe Customer ID</div>
                    <div className="font-mono text-sm">{organization.stripe_customer_id}</div>
                  </div>
                )}

                {organization.stripe_subscription_id && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Stripe Subscription ID</div>
                    <div className="font-mono text-sm">{organization.stripe_subscription_id}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

