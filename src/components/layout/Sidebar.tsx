import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, type Permission } from '@/constants/permissions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInitials, cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigationStore';
import { Logo } from '@/components/common/Logo';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowRightLeft,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Invoices',
    path: '/invoices',
    icon: FileText,
    permission: 'financial:create_invoices',
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
    permission: 'customers:view_all',
  },
  {
    label: 'Products',
    path: '/products',
    icon: Package,
    permission: 'inventory:view_products',
  },
  {
    label: 'Transactions',
    path: '/transactions',
    icon: ArrowRightLeft,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    permission: 'financial:view_reports',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    permission: 'business:settings',
  },
];

export function Sidebar() {
  const { user, organization, signOut } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useNavigationStore();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return user && hasPermission(user.role, item.permission as Permission);
  });

  // Get display name - prefer full_name, fallback to email username
  const getDisplayName = () => {
    if (user?.full_name && user.full_name !== user.email) {
      return user.full_name;
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0] ?? '';
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  };

  const displayName = getDisplayName();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-screen border-r bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out lg:flex lg:flex-col',
        sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      <div className="flex h-full w-full flex-col">
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-slate-700',
            sidebarCollapsed ? 'justify-center px-2' : 'px-4'
          )}
        >
          <Logo
            variant={sidebarCollapsed ? 'icon' : 'horizontal'}
            size={sidebarCollapsed ? 'sm' : 'md'}
            showText={!sidebarCollapsed}
            animated={true}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Navigation */}
        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-2">
          <TooltipProvider delayDuration={0}>
            {filteredNavItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        sidebarCollapsed ? 'justify-center' : 'gap-3',
                        isActive
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )
                    }
                  >
                    <item.icon
                      className={cn('h-5 w-5 flex-shrink-0', sidebarCollapsed ? 'h-6 w-6' : '')}
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="border-slate-700 bg-slate-800 text-white">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        {/* Collapse Toggle */}
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-slate-400 hover:bg-slate-800 hover:text-white',
              sidebarCollapsed ? 'px-0' : 'justify-end'
            )}
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator className="bg-slate-700" />

        {/* User Profile */}
        <div className="p-3">
          <div
            className={cn(
              'flex items-center rounded-lg border border-slate-700 bg-slate-800/50 p-2 transition-all',
              sidebarCollapsed ? 'justify-center border-transparent bg-transparent' : 'gap-3'
            )}
          >
            <Avatar className="h-9 w-9 cursor-pointer border-2 border-emerald-500/50 shadow-sm transition-transform hover:scale-105">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback className="bg-emerald-600 font-bold text-white">
                {user?.full_name ? getInitials(user.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 overflow-hidden animate-in fade-in slide-in-from-left-2">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-400">{organization?.name}</p>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              className="mt-2 w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
