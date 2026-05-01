// src/stores/uiStore.ts
/**
 * UI State Store
 *
 * Manages application UI state including theme, sidebar, modals, and view preferences.
 * Production-ready with validation, persistence, and optimized Set operations.
 *
 * @module Stores/UI
 */

import { logger } from '@/lib/logger';
import { create } from 'zustand';
import { persist, createJSONStorage, type PersistStorage } from 'zustand/middleware';

// Constants
const VALID_THEMES = ['light', 'dark', 'system'] as const;
const VALID_SIDEBAR_STATES = ['open', 'closed', 'collapsed'] as const;
const VALID_VIEW_MODES = ['grid', 'list'] as const;
const MIN_ITEMS_PER_PAGE = 10;
const MAX_ITEMS_PER_PAGE = 100;
const DEFAULT_ITEMS_PER_PAGE = 25;

export type Theme = (typeof VALID_THEMES)[number];
export type SidebarState = (typeof VALID_SIDEBAR_STATES)[number];
export type ViewMode = (typeof VALID_VIEW_MODES)[number];

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Sidebar
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Modals (stored as array for better serialization)
  openModals: string[];
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  isModalOpen: (modalId: string) => boolean;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Notifications panel
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
  toggleNotificationsPanel: () => void;

  // View preferences
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
}

interface PersistedUIState {
  theme: Theme;
  sidebarState: SidebarState;
  viewMode: ViewMode;
  itemsPerPage: number;
  _version: number;
}

/**
 * Validates theme value
 */
function isValidTheme(theme: unknown): theme is Theme {
  return typeof theme === 'string' && VALID_THEMES.includes(theme as Theme);
}

/**
 * Validates sidebar state value
 */
function isValidSidebarState(state: unknown): state is SidebarState {
  return typeof state === 'string' && VALID_SIDEBAR_STATES.includes(state as SidebarState);
}

/**
 * Validates view mode value
 */
function isValidViewMode(mode: unknown): mode is ViewMode {
  return typeof mode === 'string' && VALID_VIEW_MODES.includes(mode as ViewMode);
}

/**
 * UI state store for managing application UI state
 *
 * Features:
 * - Theme management (light/dark/system)
 * - Sidebar state management
 * - Modal management (optimized for serialization)
 * - View preferences (grid/list)
 * - Persistent user preferences
 * - Input validation
 * - Type-safe operations
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => {
        if (!isValidTheme(theme)) {
          logger.error(`Invalid theme: ${theme}. Must be one of: ${VALID_THEMES.join(', ')}`);
          return;
        }
        set({ theme });
      },

      // Sidebar
      sidebarState: 'open',
      setSidebarState: (state) => {
        if (!isValidSidebarState(state)) {
          logger.error(
            `Invalid sidebar state: ${state}. Must be one of: ${VALID_SIDEBAR_STATES.join(', ')}`
          );
          return;
        }
        set({ sidebarState: state });
      },
      toggleSidebar: () =>
        set((state) => ({
          sidebarState: state.sidebarState === 'open' ? 'closed' : 'open',
        })),

      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: Boolean(open) }),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      // Modals (using array for better serialization)
      openModals: [],
      openModal: (modalId) => {
        if (!modalId || typeof modalId !== 'string') {
          logger.error('Invalid modal ID provided to openModal');
          return;
        }
        set((state) => {
          if (state.openModals.includes(modalId)) {
            return state; // Already open
          }
          return { openModals: [...state.openModals, modalId] };
        });
      },
      closeModal: (modalId) => {
        if (!modalId || typeof modalId !== 'string') {
          logger.error('Invalid modal ID provided to closeModal');
          return;
        }
        set((state) => ({
          openModals: state.openModals.filter((id) => id !== modalId),
        }));
      },
      closeAllModals: () => set({ openModals: [] }),
      isModalOpen: (modalId) => {
        return get().openModals.includes(modalId);
      },

      // Loading
      globalLoading: false,
      setGlobalLoading: (loading) => set({ globalLoading: Boolean(loading) }),

      // Notifications panel
      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: Boolean(open) }),
      toggleNotificationsPanel: () =>
        set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),

      // View preferences
      viewMode: 'list',
      setViewMode: (mode) => {
        if (!isValidViewMode(mode)) {
          logger.error(
            `Invalid view mode: ${mode}. Must be one of: ${VALID_VIEW_MODES.join(', ')}`
          );
          return;
        }
        set({ viewMode: mode });
      },
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
      setItemsPerPage: (count) => {
        const num = Number(count);
        if (!Number.isInteger(num) || num < MIN_ITEMS_PER_PAGE || num > MAX_ITEMS_PER_PAGE) {
          logger.error(
            `Invalid items per page: ${count}. Must be between ${MIN_ITEMS_PER_PAGE} and ${MAX_ITEMS_PER_PAGE}`
          );
          return;
        }
        set({ itemsPerPage: num });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage) as PersistStorage<PersistedUIState>,
      partialize: (state) => ({
        theme: state.theme,
        sidebarState: state.sidebarState,
        viewMode: state.viewMode,
        itemsPerPage: state.itemsPerPage,
        _version: 1,
      }),
      version: 1,
      migrate: (persistedState: unknown, _version: number): PersistedUIState => {
        const state = persistedState as Partial<PersistedUIState>;
        return {
          theme: state.theme && isValidTheme(state.theme) ? state.theme : 'system',
          sidebarState:
            state.sidebarState && isValidSidebarState(state.sidebarState)
              ? state.sidebarState
              : 'open',
          viewMode: state.viewMode && isValidViewMode(state.viewMode) ? state.viewMode : 'list',
          itemsPerPage:
            state.itemsPerPage &&
            Number.isInteger(state.itemsPerPage) &&
            state.itemsPerPage >= MIN_ITEMS_PER_PAGE &&
            state.itemsPerPage <= MAX_ITEMS_PER_PAGE
              ? state.itemsPerPage
              : DEFAULT_ITEMS_PER_PAGE,
          _version: 1,
        };
      },
      skipHydration: false,
    }
  )
);
