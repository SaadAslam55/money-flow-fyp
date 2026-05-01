// src/stores/authStore.ts
/**
 * Authentication Store
 *
 * Manages user authentication state, organization context, and auth-related operations.
 * Production-ready with persistence, error handling, and validation.
 *
 * @module Stores/Auth
 */

import { logger } from '@/lib/logger';
import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';
import type { User, Organization } from '@/types/index';

interface AuthState {
  // State
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
  lastAuthCheck: number | null;

  // Actions
  setUser: (user: User | null) => void;
  setOrganization: (organization: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateOrganization: (updates: Partial<Organization>) => void;
}

interface PersistedAuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  lastAuthCheck: number | null;
  _version: number;
}

/**
 * Validates user object structure
 */
function isValidUser(user: unknown): user is User {
  if (!user || typeof user !== 'object') return false;
  const u = user as Partial<User>;
  return typeof u.id === 'string' && typeof u.email === 'string';
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
 * Production-ready authentication store
 *
 * Features:
 * - Persistent storage with error handling
 * - Timestamp tracking for auth checks
 * - Safe partial updates with validation
 * - Error state management
 * - Version migration support
 * - Type-safe operations
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      organization: null,
      isAuthenticated: false,
      loading: true, // Start true — initializeAuth will set false when done
      error: null,
      lastAuthCheck: null,

      setUser: (user) => {
        // Validate user if provided
        if (user && !isValidUser(user)) {
          logger.error('Invalid user object provided to setUser');
          set({ error: new Error('Invalid user data') });
          return;
        }

        set({
          user,
          isAuthenticated: !!user,
          error: null,
          lastAuthCheck: Date.now(),
        });
      },

      setOrganization: (organization) => {
        // Validate organization if provided
        if (organization && !isValidOrganization(organization)) {
          logger.error('Invalid organization object provided to setOrganization');
          set({ error: new Error('Invalid organization data') });
          return;
        }

        set({
          organization,
          error: null,
        });
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (!currentUser) {
          logger.warn('Cannot update user: no user is currently set');
          return;
        }

        // Validate updates don't break required fields
        if (updates.id !== undefined && updates.id !== currentUser.id) {
          logger.error('Cannot change user ID');
          set({ error: new Error('Cannot modify user ID') });
          return;
        }

        set({
          user: { ...currentUser, ...updates },
          error: null,
        });
      },

      updateOrganization: (updates) => {
        const currentOrg = get().organization;
        if (!currentOrg) {
          logger.warn('Cannot update organization: no organization is currently set');
          return;
        }

        // Validate updates don't break required fields
        if (updates.id !== undefined && updates.id !== currentOrg.id) {
          logger.error('Cannot change organization ID');
          set({ error: new Error('Cannot modify organization ID') });
          return;
        }

        set({
          organization: { ...currentOrg, ...updates },
          error: null,
        });
      },

      clearAuth: () =>
        set({
          user: null,
          organization: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          lastAuthCheck: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage) as PersistStorage<PersistedAuthState>,
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        // Don't persist isAuthenticated - it should be derived from session
        isAuthenticated: false,
        lastAuthCheck: state.lastAuthCheck,
        _version: 1,
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number): PersistedAuthState => {
        // Handle migration from version 0 to 1
        if (version === 0) {
          const state = persistedState as Partial<PersistedAuthState>;
          return {
            user: state.user && isValidUser(state.user) ? state.user : null,
            organization:
              state.organization && isValidOrganization(state.organization)
                ? state.organization
                : null,
            isAuthenticated: state.isAuthenticated ?? false,
            lastAuthCheck: state.lastAuthCheck ?? null,
            _version: 1,
          };
        }

        // Validate current version
        const state = persistedState as Partial<PersistedAuthState>;
        return {
          user: state.user && isValidUser(state.user) ? state.user : null,
          organization:
            state.organization && isValidOrganization(state.organization)
              ? state.organization
              : null,
          isAuthenticated: state.isAuthenticated ?? false,
          lastAuthCheck: state.lastAuthCheck ?? null,
          _version: 1,
        };
      },
      // Skip hydration errors in development
      skipHydration: false,
    }
  )
);
