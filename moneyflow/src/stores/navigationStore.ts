import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  // Desktop State
  sidebarCollapsed: boolean;

  // Mobile State
  drawerOpen: boolean;
  bottomSheetOpen: boolean;
  searchOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  toggleBottomSheet: () => void;
  setBottomSheetOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  closeAllMobileMenus: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      // Desktop Defaults
      sidebarCollapsed: false,

      // Mobile Defaults
      drawerOpen: false,
      bottomSheetOpen: false,
      searchOpen: false,

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
      setDrawerOpen: (open) => set({ drawerOpen: open }),

      toggleBottomSheet: () => set((state) => ({ bottomSheetOpen: !state.bottomSheetOpen })),
      setBottomSheetOpen: (open) => set({ bottomSheetOpen: open }),

      toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
      setSearchOpen: (open) => set({ searchOpen: open }),

      closeAllMobileMenus: () =>
        set({
          drawerOpen: false,
          bottomSheetOpen: false,
          searchOpen: false,
        }),
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }), // Only persist sidebar preference
    }
  )
);
