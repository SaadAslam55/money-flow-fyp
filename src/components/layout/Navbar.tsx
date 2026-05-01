// src/components/layout/Navbar.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, Settings, LogOut, User, FileText, Package, ArrowLeftRight, Users, Loader2, X } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, cn } from '@/lib/utils';
import { useNavigationStore } from '@/stores/navigationStore';
import { OrganizationSwitcher } from '@/components/common/OrganizationSwitcher';
import { globalSearch, type SearchResult } from '@/services/api/searchApi';
import { useNotificationStore } from '@/stores/notificationStore';
import { logger } from '@/lib/logger';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, CheckCircle2, Info, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icon mapping for search results
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  FileText,
  Package,
  ArrowLeftRight,
};

interface NavbarProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  className?: string;
}

/**
 * Navbar - Top navigation bar with user menu, notifications, and mobile menu
 */
export function Navbar({ onMenuClick, showSearch = true, className }: NavbarProps) {
  const { user, organization, signOut } = useAuth();
  const navigate = useNavigate();
  const { toggleDrawer, toggleSidebar, toggleSearch } = useNavigationStore();
  const { unreadCount, getRecentNotifications, markAllAsRead, clearAll, markAsRead } = useNotificationStore();
  const notifications = getRecentNotifications(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2 || !organization?.id) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await globalSearch(query, organization.id, 8);
      setSearchResults(response.results);
      setShowResults(response.results.length > 0 || query.length >= 2);
    } catch (error) {
      logger.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [organization?.id]);

  // Handle input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Handle form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      const firstResult = searchResults[0];
      if (firstResult) {
        handleResultClick(firstResult);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
      >
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleDrawer}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Desktop Menu Button (for sidebar toggle) */}
          <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          {/* Logo (Mobile) */}
          <div className="lg:hidden">
            <Logo variant="horizontal" size="sm" animated={false} />
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div ref={searchRef} className="hidden max-w-md flex-1 md:block relative">
              <form onSubmit={handleSearch}>
                <div className="relative w-full">
                  {isSearching ? (
                    <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
                  ) : (
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <Input
                    type="text"
                    placeholder="Search customers, invoices, products..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={clearSearch}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => {
                        const IconComponent = iconMap[result.icon || 'FileText'] || FileText;
                        return (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full px-4 py-2 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className={cn(
                              "mt-0.5 p-1.5 rounded-md",
                              result.type === 'customer' && "bg-blue-100 text-blue-600",
                              result.type === 'invoice' && "bg-green-100 text-green-600",
                              result.type === 'product' && "bg-purple-100 text-purple-600",
                              result.type === 'transaction' && "bg-orange-100 text-orange-600",
                            )}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                              )}
                              <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      {searchQuery.length >= 2 ? (
                        <>
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No results found for "{searchQuery}"</p>
                          <p className="text-xs mt-1">Try searching for customers, invoices, or products</p>
                        </>
                      ) : (
                        <p>Type at least 2 characters to search</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Mobile Search Button */}
            {showSearch && (
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSearch}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}

            {/* Organization Switcher (Super Admin Only) */}
            <OrganizationSwitcher />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs animate-in zoom-in duration-300"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <DropdownMenuLabel className="p-0 font-bold">Notifications</DropdownMenuLabel>
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs text-primary hover:text-primary/80"
                        onClick={() => markAllAsRead()}
                      >
                        Mark all read
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => clearAll()}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={cn(
                            "p-4 transition-colors hover:bg-muted/50 cursor-pointer relative group",
                            !notification.read && "bg-blue-50/30 dark:bg-blue-900/10"
                          )}
                          onClick={() => {
                            if (!notification.read) markAsRead(notification.id);
                            if (notification.actionUrl) navigate(notification.actionUrl);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "mt-1 p-2 rounded-full flex-shrink-0",
                              notification.type === 'info' && "bg-blue-100 text-blue-600",
                              notification.type === 'success' && "bg-green-100 text-green-600",
                              notification.type === 'warning' && "bg-yellow-100 text-yellow-600",
                              notification.type === 'error' && "bg-red-100 text-red-600",
                            )}>
                              {notification.type === 'info' && <Info className="h-4 w-4" />}
                              {notification.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                              {notification.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                              {notification.type === 'error' && <XCircle className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className={cn(
                                  "text-sm leading-none",
                                  !notification.read ? "font-bold" : "font-medium"
                                )}>
                                  {notification.title}
                                </p>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {notification.message}
                              </p>
                              {notification.actionUrl && (
                                <div className="flex items-center text-[11px] font-semibold text-primary">
                                  {notification.actionLabel || 'View Details'}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </div>
                              )}
                            </div>
                            {!notification.read && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Bell className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No notifications yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        When you have updates, they'll appear here.
                      </p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-2 border-t bg-muted/20">
                    <Button 
                      variant="ghost" 
                      className="w-full text-xs font-semibold"
                      onClick={() => navigate('/settings')}
                    >
                      View All Settings
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.full_name ? getInitials(user.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.full_name ?? 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email ?? 'No email'}
                    </p>
                    {organization && (
                      <p className="mt-1 text-xs leading-none text-muted-foreground">
                        {organization.name}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
}
