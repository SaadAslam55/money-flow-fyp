// src/components/admin/RoleManagement.tsx
import { useState } from 'react';
import { Shield, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PERMISSION_GROUPS, PERMISSIONS, getPermissionDescription } from '@/constants/permissions';
import { UserRole } from '@/types/database.types';
import { cn } from '@/lib/utils';

const ROLES: UserRole[] = ['super_admin', 'admin', 'manager', 'accountant', 'cashier', 'viewer'];

export function RoleManagement() {
  const [activeRole, setActiveRole] = useState<UserRole>('admin');

  const hasAccess = (role: UserRole, permission: string) => {
    return PERMISSIONS[permission as keyof typeof PERMISSIONS]?.includes(role) ?? false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
        <p className="text-muted-foreground">
          View and manage roles and their associated permissions.
        </p>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="details">Role Details</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>Overview of all permissions across different roles.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Permission</TableHead>
                    {ROLES.map((role) => (
                      <TableHead key={role} className="min-w-[100px] text-center capitalize">
                        {role.replace('_', ' ')}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(PERMISSION_GROUPS).map(([key, group]) => (
                    <>
                      <TableRow key={key} className="bg-muted/50 hover:bg-muted/50">
                        <TableCell colSpan={ROLES.length + 1} className="py-2 font-semibold">
                          <div className="flex items-center gap-2">
                            {/* We could render the icon here if we mapped string to Icon component */}
                            <span>{group.label}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      {group.permissions.map((permission) => (
                        <TableRow key={permission}>
                          <TableCell className="pl-8 text-sm font-medium">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="flex cursor-help items-center gap-1 text-left">
                                  {permission
                                    .split(':')[1]
                                    ?.split('_')
                                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(' ') || permission}
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getPermissionDescription(permission)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          {ROLES.map((role) => (
                            <TableCell key={`${role}-${permission}`} className="text-center">
                              <div className="flex justify-center">
                                {hasAccess(role, permission) ? (
                                  <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                                ) : (
                                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                                )}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-2 md:col-span-1">
              {ROLES.map((role) => (
                <div
                  key={role}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors',
                    activeRole === role
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-transparent bg-card hover:bg-muted'
                  )}
                  onClick={() => setActiveRole(role)}
                >
                  <span className="font-medium capitalize">{role.replace('_', ' ')}</span>
                  <Shield className="h-4 w-4" />
                </div>
              ))}
            </div>

            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="capitalize">
                        {activeRole.replace('_', ' ')} Permissions
                      </CardTitle>
                      <CardDescription>
                        Detailed view of permissions for the {activeRole.replace('_', ' ')} role.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {activeRole.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {Object.entries(PERMISSION_GROUPS).map(([key, group]) => {
                      const rolePermissions = group.permissions.filter((p) =>
                        hasAccess(activeRole, p)
                      );
                      if (rolePermissions.length === 0) return null;

                      return (
                        <div key={key} className="space-y-3">
                          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            {group.label}
                          </h3>
                          <div className="space-y-2">
                            {rolePermissions.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-center gap-2 rounded-md border p-2 text-sm"
                              >
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                <span>
                                  {permission
                                    .split(':')[1]
                                    ?.split('_')
                                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
