import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNavigationStore } from '@/stores/navigationStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInitials, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowRightLeft,
  BarChart3,
  Settings,
  LogOut,
  X,
  Building,
  UserCog,
  Bell,
  HelpCircle,
} from 'lucide-react';

export function MobileDrawer() {
  const { user, organization, signOut } = useAuth();
  const { drawerOpen, closeAllMobileMenus } = useNavigationStore();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Team', path: '/team', icon: UserCog },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const secondaryItems = [
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: 3 },
    { label: 'Help & Support', path: '/help', icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeAllMobileMenus}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-[85%] max-w-[320px] flex-col bg-background shadow-xl lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.full_name ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="max-w-[180px] truncate text-sm font-semibold">{user?.full_name}</p>
                  <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                    {organization?.name}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeAllMobileMenus}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeAllMobileMenus}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
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

              <Separator className="my-4" />

              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </p>

              <nav className="space-y-1">
                {secondaryItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeAllMobileMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t bg-muted/30 p-4">
              <Button
                variant="outline"
                className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  closeAllMobileMenus();
                  signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
