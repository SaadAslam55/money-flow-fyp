// src/contexts/OrganizationContext.tsx
/**
 * Organization Context
 * Provides organization management throughout the application
 * Wraps the useOrganization hook for React Context API access
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useOrganization, useOrganizationStats, useTeamMembers } from '@/hooks/useOrganization';
import type { Organization } from '@/types';

/**
 * Organization context type
 */
export interface OrganizationContextType {
  // Current organization
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;

  // Organization updates
  // Simpler signature for consumers; internally wrapped to match react-query mutate arg shape
  updateOrganization: (updates: Partial<Organization>, logoFile?: File) => Promise<unknown>;
  isUpdating: boolean;

  // Organization statistics
  stats: {
    totalInvoices: number;
    totalCustomers: number;
    totalProducts: number;
    totalRevenue: number;
    totalExpenses: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
  } | null;
  isLoadingStats: boolean;
  statsError: Error | null;
  refetchStats: () => Promise<unknown>;

  // Team members
  teamMembers: unknown[];
  teamCount: number;
  isLoadingTeam: boolean;
  teamError: Error | null;
  refetchTeam: () => Promise<unknown>;
  inviteTeamMember: (data: unknown) => Promise<unknown>;
  removeTeamMember: (userId: string) => Promise<unknown>;
  updateTeamMemberRole: (userId: string, updates: unknown) => Promise<unknown>;
  isInviting: boolean;
  isRemoving: boolean;
  isUpdatingRole: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

/**
 * OrganizationProvider component props
 */
interface OrganizationProviderProps {
  children: ReactNode;
}

/**
 * Organization Provider
 * Wraps the application with organization context
 *
 * @example
 * ```tsx
 * <OrganizationProvider>
 *   <App />
 * </OrganizationProvider>
 * ```
 */
export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const organization = useOrganization();
  const stats = useOrganizationStats();
  const team = useTeamMembers();

  const value: OrganizationContextType = {
    // Organization
    organization: organization.organization,
    isLoading: organization.isLoading,
    error: organization.error,
    refetch: organization.refetch,
    // Wrap react-query mutateAsync which expects an object argument
    updateOrganization: (updates, logoFile) =>
      organization.updateOrganization({ updates, logoFile }),
    isUpdating: organization.isUpdating,

    // Statistics
    stats: stats.stats ? (stats.stats as any) : null,
    isLoadingStats: stats.isLoading,
    statsError: stats.error,
    refetchStats: stats.refetch,

    // Team members
    teamMembers: team.teamMembers,
    teamCount: team.count,
    isLoadingTeam: team.isLoading,
    teamError: team.error,
    refetchTeam: team.refetch,
    // Wrap team member mutations to conform to declared context signatures
    inviteTeamMember: (data) => team.inviteTeamMember(data as any),
    removeTeamMember: team.removeTeamMember,
    updateTeamMemberRole: (userId, updates) =>
      team.updateTeamMemberRole({ id: userId, updates: updates as any }),
    isInviting: team.isInviting,
    isRemoving: team.isRemoving,
    isUpdatingRole: team.isUpdatingRole,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

/**
 * Hook to access organization context
 *
 * @throws Error if used outside OrganizationProvider
 * @returns Organization context value
 *
 * @example
 * ```tsx
 * const { organization, updateOrganization, stats } = useOrganizationContext();
 * ```
 */
export function useOrganizationContext(): OrganizationContextType {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }

  return context;
}
