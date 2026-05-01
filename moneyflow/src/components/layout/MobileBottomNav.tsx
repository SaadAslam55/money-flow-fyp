import { NavLink } from 'react-router-dom';
import { useNavigationStore } from '@/stores/navigationStore';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Users, Menu, Plus } from 'lucide-react';

export function MobileBottomNav() {
  const { toggleDrawer, toggleBottomSheet } = useNavigationStore();

  return (
    <nav className="pb-safe-area-bottom fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="grid h-full grid-cols-5 items-center">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              'flex h-full w-full flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink
          to="/invoices"
          className={({ isActive }) =>
            cn(
              'flex h-full w-full flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <FileText className="h-6 w-6" />
          <span className="text-[10px] font-medium">Invoices</span>
        </NavLink>

        <div className="-mt-6 flex flex-col items-center justify-center">
          <button
            onClick={toggleBottomSheet}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Create New"
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>

        <NavLink
          to="/customers"
          className={({ isActive }) =>
            cn(
              'flex h-full w-full flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Users className="h-6 w-6" />
          <span className="text-[10px] font-medium">Customers</span>
        </NavLink>

        <button
          onClick={toggleDrawer}
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Menu className="h-6 w-6" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
