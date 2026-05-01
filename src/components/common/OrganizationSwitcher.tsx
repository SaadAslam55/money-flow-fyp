// src/components/common/OrganizationSwitcher.tsx
/**
 * Organization Switcher Component
 * Allows super admins to switch between different organizations
 */

import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { listOrganizations } from '@/services/api/organizationApi';
import { Skeleton } from '@/components/ui/skeleton';

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false);
  const { user, organization, updateOrganization } = useAuth();

  // Fetch all organizations (must be called before any early returns)
  const { data: orgsResponse, isLoading } = useQuery({
    queryKey: ['organizations', 'list'],
    queryFn: () => listOrganizations({ limit: 100 }),
    staleTime: 60000, // 1 minute
    // Only fetch if user is super_admin
    enabled: user?.role === 'super_admin',
  });

  // Only show for super admins - after all hooks are called
  if (!user || user.role !== 'super_admin') {
    return null;
  }

  const organizations = orgsResponse?.data || [];
  const currentOrgId = organization?.id;

  const handleSelectOrganization = async (orgId: string) => {
    const selected = organizations.find((org) => org.id === orgId);
    if (selected && updateOrganization) {
      // Update the organization in the auth store
      updateOrganization(selected as any);
      setOpen(false);

      // Reload the page to fetch new data for the selected organization
      window.location.reload();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organization"
          className="w-[200px] justify-between"
        >
          <Building2 className="mr-2 h-4 w-4" />
          <span className="truncate">{organization?.name || 'Select Organization'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="space-y-2 p-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                'No organization found.'
              )}
            </CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.id}
                  onSelect={() => handleSelectOrganization(org.id)}
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <div className="flex flex-1 flex-col">
                    <span className="truncate font-medium">{org.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {org.subdomain || org.email}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      currentOrgId === org.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  window.location.href = '/admin?tab=organizations';
                }}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Manage Organizations
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
