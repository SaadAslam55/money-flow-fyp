# State Management Stores

This directory contains all Zustand stores for the Money Flow application. All stores are production-ready with proper error handling, persistence, and TypeScript types.

## Available Stores

### 1. `authStore.ts` - Authentication Store
Manages user authentication state, organization context, and auth-related operations.

**Usage:**
```typescript
import { useAuthStore } from '@/stores';

const { user, organization, isAuthenticated, loading, setUser, clearAuth } = useAuthStore();
```

**Features:**
- Persistent storage (localStorage)
- Error state management
- Timestamp tracking for auth checks
- Safe partial updates for user/organization

### 2. `organizationStore.ts` - Organization Store
Manages multiple organizations (useful for users belonging to multiple orgs).

**Usage:**
```typescript
import { useOrganizationStore } from '@/stores';

const { 
  currentOrganization, 
  organizations, 
  setCurrentOrganization,
  addOrganization 
} = useOrganizationStore();
```

**Features:**
- Multi-organization support
- Persistent storage
- CRUD operations for organizations

### 3. `uiStore.ts` - UI State Store
Manages application UI state (theme, sidebar, modals, etc.).

**Usage:**
```typescript
import { useUIStore } from '@/stores';

const { 
  theme, 
  setTheme, 
  sidebarState, 
  toggleSidebar,
  openModal,
  closeModal 
} = useUIStore();
```

**Features:**
- Theme management (light/dark/system)
- Sidebar state management
- Modal management
- View preferences (grid/list)
- Persistent user preferences

### 4. `cartStore.ts` - Shopping Cart Store
Manages POS shopping cart functionality.

**Usage:**
```typescript
import { useCartStore } from '@/stores';

const { 
  items, 
  addItem, 
  removeItem, 
  getTotal,
  clearCart 
} = useCartStore();
```

**Features:**
- Cart item management
- Automatic calculations (subtotal, tax, total)
- Session storage (cleared on browser close)
- Customer and payment method tracking

### 5. `notificationStore.ts` - Notification Store
Manages application notifications.

**Usage:**
```typescript
import { useNotificationStore } from '@/stores';

const { 
  notifications, 
  unreadCount, 
  addNotification,
  markAsRead 
} = useNotificationStore();
```

**Features:**
- Notification management
- Unread count tracking
- Automatic cleanup (max 100 notifications)
- Recent notifications helper

### 6. `cacheStore.ts` - Client-Side Cache Store
Manages temporary data caching with TTL support.

**Usage:**
```typescript
import { useCacheStore } from '@/stores';

const { set, get, has, clear } = useCacheStore();

// Set with 5 minute TTL (default)
set('key', data);

// Set with custom TTL (10 minutes)
set('key', data, 10 * 60 * 1000);

// Get cached data
const cached = get('key');
```

**Features:**
- TTL (Time To Live) support
- Automatic expiration cleanup
- Type-safe get/set operations
- Memory-efficient

## Best Practices

1. **Import from index**: Always import stores from `@/stores` for better organization:
   ```typescript
   import { useAuthStore, useUIStore } from '@/stores';
   ```

2. **Use hooks, not stores directly**: Prefer using custom hooks (e.g., `useAuth`) over direct store access when available.

3. **Persistence**: Most stores use localStorage for persistence. Cart store uses sessionStorage.

4. **Error Handling**: All stores include error state management. Always check for errors when using stores.

5. **Type Safety**: All stores are fully typed. Use TypeScript for better IDE support.

## Store Patterns

### Reading State
```typescript
const user = useAuthStore((state) => state.user);
```

### Updating State
```typescript
const setUser = useAuthStore((state) => state.setUser);
setUser(newUser);
```

### Multiple Selectors
```typescript
const { user, organization, isAuthenticated } = useAuthStore();
```

## Migration

If you need to migrate store data, use the `migrate` function in the persist configuration. See `authStore.ts` for an example.

## Performance

- Stores use Zustand's built-in optimizations
- Selectors prevent unnecessary re-renders
- Persistence is handled asynchronously
- Cache store auto-cleans expired entries every minute

