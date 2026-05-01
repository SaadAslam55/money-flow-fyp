// src/stores/organizationStore.ts
/**
 * Organization Store
 *
 * Manages multiple organizations for users who belong to multiple organizations.
 * Production-ready with validation, error handling, and persistence.
 *
 * Note: This store is separate from authStore's organization to support
 * multi-organization scenarios where users can switch between organizations.
 *
 * @module Stores/Organization
 */

import { logger } from '@/lib/logger';
import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';
import type { Organization } from '@/types/index';

interface OrganizationState {
  // State
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  error: Error | null;

  // Actions
  setCurrentOrganization: (organization: Organization | null) => void;
  setOrganizations: (organizations: Organization[]) => void;
  addOrganization: (organization: Organization) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clear: () => void;
  getOrganizationById: (id: string) => Organization | null;
}

interface PersistedOrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  _version: number;
}

/**
 * Validates organization object structure
 */
function isValidOrganization(org: unknown): org is Organization {
  if (!org || typeof org !== 'object') return false;
  const o = org as Partial<Organization>;
  return typeof o.id === 'string' && typeof o.name === 'string';
}

/**
 * Validates array of organizations
 */
function validateOrganizations(orgs: unknown[]): Organization[] {
  return orgs.filter((org): org is Organization => isValidOrganization(org));
}

/**
 * Organization store for managing multiple organizations
 *
 * Features:
 * - Multi-organization support
 * - Persistent storage
 * - CRUD operations with validation
 * - Error handling
 * - Type-safe operations
 */
export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentOrganization: null,
      organizations: [],
      loading: false,
      error: null,

      setCurrentOrganization: (organization) => {
        if (organization && !isValidOrganization(organization)) {
          logger.error('Invalid organization object provided to setCurrentOrganization');
          set({ error: new Error('Invalid organization data') });
          return;
        }

        set({
          currentOrganization: organization,
          error: null,
        });
      },

      setOrganizations: (organizations) => {
        if (!Array.isArray(organizations)) {
          logger.error('Organizations must be an array');
          set({ error: new Error('Invalid organizations data') });
          return;
        }

        const validOrgs = validateOrganizations(organizations);
        if (validOrgs.length !== organizations.length) {
          logger.warn('Some organizations were invalid and filtered out');
        }

        set({
          organizations: validOrgs,
          error: null,
        });
      },

      addOrganization: (organization) => {
        if (!isValidOrganization(organization)) {
          logger.error('Invalid organization object provided to addOrganization');
          set({ error: new Error('Invalid organization data') });
          return;
        }

        set((state) => {
          // Check if organization already exists
          const exists = state.organizations.some((org) => org.id === organization.id);
          if (exists) {
            logger.warn(`Organization with ID ${organization.id} already exists`);
            return { error: new Error('Organization already exists') };
          }

          return {
            organizations: [...state.organizations, organization],
            error: null,
          };
        });
      },

      updateOrganization: (id, updates) => {
        if (!id || typeof id !== 'string') {
          logger.error('Invalid organization ID provided to updateOrganization');
          set({ error: new Error('Invalid organization ID') });
          return;
        }

        // Prevent ID changes
        if (updates.id !== undefined && updates.id !== id) {
          logger.error('Cannot change organization ID');
          set({ error: new Error('Cannot modify organization ID') });
          return;
        }

        set((state) => {
          const orgExists = state.organizations.some((org) => org.id === id);
          if (!orgExists) {
            logger.warn(`Organization with ID ${id} not found`);
            return { error: new Error('Organization not found') };
          }

          const updatedOrgs = state.organizations.map((org) =>
            org.id === id ? { ...org, ...updates } : org
          );
          const updatedCurrent =
            state.currentOrganization?.id === id
              ? { ...state.currentOrganization, ...updates }
              : state.currentOrganization;

          return {
            organizations: updatedOrgs,
            currentOrganization: updatedCurrent,
            error: null,
          };
        });
      },

      removeOrganization: (id) => {
        if (!id || typeof id !== 'string') {
          logger.error('Invalid organization ID provided to removeOrganization');
          set({ error: new Error('Invalid organization ID') });
          return;
        }

        set((state) => ({
          organizations: state.organizations.filter((org) => org.id !== id),
          currentOrganization:
            state.currentOrganization?.id === id ? null : state.currentOrganization,
          error: null,
        }));
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      getOrganizationById: (id) => {
        const state = get();
        return state.organizations.find((org) => org.id === id) || null;
      },

      clear: () =>
        set({
          currentOrganization: null,
          organizations: [],
          loading: false,
          error: null,
        }),
    }),
    {
      name: 'organization-storage',
      storage: createJSONStorage(() => localStorage) as PersistStorage<PersistedOrganizationState>,
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
        organizations: state.organizations,
        _version: 1,
      }),
      version: 1,
      migrate: (persistedState: unknown, _version: number): PersistedOrganizationState => {
        const state = persistedState as Partial<PersistedOrganizationState>;
        return {
          currentOrganization:
            state.currentOrganization && isValidOrganization(state.currentOrganization)
              ? state.currentOrganization
              : null,
          organizations: state.organizations ? validateOrganizations(state.organizations) : [],
          _version: 1,
        };
      },
      skipHydration: false,
    }
  )
);
