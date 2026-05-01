// src/contexts/index.ts
/**
 * Centralized context exports
 * Import all contexts from here for better organization
 * 
 * Usage:
 * import { AuthProvider, ThemeProvider, PermissionProvider } from '@/contexts';
 */

// Auth Context
export {
  AuthProvider,
  useAuthContext,
  type AuthContextType,
} from './AuthContext';

// Theme Context
export {
  ThemeProvider,
  useThemeContext,
  type ThemeContextType,
} from './ThemeContext';

// Permission Context
export {
  PermissionProvider,
  usePermissionContext,
  type PermissionContextType,
} from './PermissionContext';

// Organization Context
export {
  OrganizationProvider,
  useOrganizationContext,
  type OrganizationContextType,
} from './OrganizationContext';

