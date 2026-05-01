/**
 * API Router
 * Routes requests to appropriate backend based on feature flags
 */

import api, { edgeApi, ApiResponse } from './client';
import { useFeatureFlags } from './feature-flags';
import { supabase } from '@/lib/supabase/client';

// ============================================
// Types
// ============================================

type Backend = 'supabase' | 'nestjs' | 'edge';

interface RouterConfig {
  default: Backend;
  overrides: Record<string, Backend>;
}

// ============================================
// Configuration
// ============================================

const routerConfig: RouterConfig = {
  default: 'supabase', // Will change to 'nestjs' after migration
  overrides: {
    // Endpoints that should always use specific backend
    '/auth': 'supabase',
    '/storage': 'supabase',
    '/realtime': 'supabase',

    // TiDB-powered features (always use new API)
    '/analytics': 'nestjs',
    '/reports': 'nestjs',
    '/dashboard/stats': 'nestjs',
  },
};

// ============================================
// API Router Class
// ============================================

class ApiRouter {
  /**
   * Determine which backend to use for an endpoint
   */
  private getBackend(endpoint: string): Backend {
    const flags = useFeatureFlags.getState();

    // Check for endpoint-specific overrides
    for (const [pattern, backend] of Object.entries(routerConfig.overrides)) {
      if (endpoint.startsWith(pattern)) {
        return backend;
      }
    }

    // Check feature flags for gradual rollout
    if (flags.shouldUseNewApi()) {
      return 'nestjs';
    }

    // Edge API for specific use cases
    if (flags.useEdgeApi && this.isEdgeEndpoint(endpoint)) {
      return 'edge';
    }

    return routerConfig.default;
  }

  /**
   * Check if endpoint should use edge API
   */
  private isEdgeEndpoint(endpoint: string): boolean {
    const edgeEndpoints = ['/pdf', '/email', '/webhook'];
    return edgeEndpoints.some((e) => endpoint.startsWith(e));
  }

  /**
   * Convert API endpoint to Supabase table name
   */
  private endpointToTable(endpoint: string): string {
    // /invoices/123 -> invoices
    // /customers -> customers
    const parts = endpoint.split('/').filter(Boolean);
    return parts[0] ?? '';
  }

  // ============================================
  // HTTP Methods
  // ============================================

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const backend = this.getBackend(endpoint);

    switch (backend) {
      case 'nestjs':
        return api.get<T>(endpoint, params);

      case 'edge':
        return edgeApi.get<T>(endpoint, params);

      case 'supabase':
      default:
        return this.supabaseGet<T>(endpoint, params);
    }
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const backend = this.getBackend(endpoint);

    switch (backend) {
      case 'nestjs':
        return api.post<T>(endpoint, body);

      case 'edge':
        return edgeApi.post<T>(endpoint, body);

      case 'supabase':
      default:
        return this.supabasePost<T>(endpoint, body);
    }
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const backend = this.getBackend(endpoint);

    switch (backend) {
      case 'nestjs':
        return api.put<T>(endpoint, body);

      case 'edge':
        return edgeApi.put<T>(endpoint, body);

      case 'supabase':
      default:
        return this.supabasePut<T>(endpoint, body);
    }
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const backend = this.getBackend(endpoint);

    switch (backend) {
      case 'nestjs':
        return api.patch<T>(endpoint, body);

      case 'edge':
        return edgeApi.patch<T>(endpoint, body);

      case 'supabase':
      default:
        return this.supabasePatch<T>(endpoint, body);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const backend = this.getBackend(endpoint);

    switch (backend) {
      case 'nestjs':
        return api.delete<T>(endpoint);

      case 'edge':
        return edgeApi.delete<T>(endpoint);

      case 'supabase':
      default:
        return this.supabaseDelete<T>(endpoint);
    }
  }

  // ============================================
  // Supabase Direct Queries (Legacy)
  // ============================================

  private async supabaseGet<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const table = this.endpointToTable(endpoint);
    const id = this.extractId(endpoint);

    let query = supabase.from(table).select('*', { count: 'exact' });

    // If fetching single record
    if (id) {
      const { data, error } = await query.eq('id', id).single();
      if (error) throw error;
      return { success: true, data: data as T };
    }

    // Apply filters
    if (params) {
      if (params.organization_id) {
        query = query.eq('organization_id', params.organization_id);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset || params.page) {
        const offset = params.offset || (params.page - 1) * (params.limit || 20);
        query = query.range(offset, offset + (params.limit || 20) - 1);
      }
      if (params.orderBy) {
        query = query.order(params.orderBy, { ascending: params.order !== 'desc' });
      }
    }

    // Filter out soft-deleted
    query = query.is('deleted_at', null);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data as T,
      meta: count ? { total: count } : undefined,
    };
  }

  private async supabasePost<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const table = this.endpointToTable(endpoint);

    const { data, error } = await supabase.from(table).insert(body).select().single();

    if (error) throw error;

    return { success: true, data: data as T };
  }

  private async supabasePut<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const table = this.endpointToTable(endpoint);
    const id = this.extractId(endpoint);

    if (!id) throw new Error('ID required for PUT');

    const { data, error } = await supabase.from(table).update(body).eq('id', id).select().single();

    if (error) throw error;

    return { success: true, data: data as T };
  }

  private async supabasePatch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.supabasePut<T>(endpoint, body);
  }

  private async supabaseDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const table = this.endpointToTable(endpoint);
    const id = this.extractId(endpoint);

    if (!id) throw new Error('ID required for DELETE');

    // Soft delete
    const { data, error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as T };
  }

  /**
   * Extract ID from endpoint like /invoices/123
   */
  private extractId(endpoint: string): string | null {
    const parts = endpoint.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[1] && !parts[1].includes('?')) {
      return parts[1];
    }
    return null;
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get current backend for debugging
   */
  getActiveBackend(endpoint: string): Backend {
    return this.getBackend(endpoint);
  }

  /**
   * Force use of specific backend (for testing)
   */
  setDefaultBackend(backend: Backend): void {
    routerConfig.default = backend;
  }
}

// ============================================
// Export
// ============================================

export const apiRouter = new ApiRouter();
export default apiRouter;
