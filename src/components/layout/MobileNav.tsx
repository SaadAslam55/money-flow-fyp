// src/components/layout/MobileNav.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, type Permission } from '@/constants/permissions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInitials, cn } from '@/lib/utils';
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
} from 'lucide-react';

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

interface MobileNavProps {
  open?: boolean;
  onClose?: () => void;
}

/**
 * MobileNav - Mobile navigation drawer component
 */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const { user, organization, signOut } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return user && hasPermission(user.role, item.permission as Permission);
  });

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Logo variant="horizontal" size="md" showText={true} animated={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg border p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.full_name ? getInitials(user.full_name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user?.full_name ?? 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {organization?.name ?? 'No organization'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            signOut();
            handleLinkClick();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
