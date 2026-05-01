/**
 * Base Service
 * Abstract service with dual-backend support
 */

import api from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import { useFeatureFlags } from '@/lib/api/feature-flags';

// ============================================
// Base Service Class
// ============================================

export abstract class BaseService<T, CreateDto, UpdateDto> {
  protected abstract endpoint: string;
  protected abstract table: string;

  /**
   * Check if new API should be used
   */
  protected get useNewApi(): boolean {
    return useFeatureFlags.getState().shouldUseNewApi();
  }

  /**
   * Get all records
   */
  async getAll(params?: Record<string, any>): Promise<T[]> {
    if (this.useNewApi) {
      const response = await api.get<T[]>(this.endpoint, params);
      return response.data;
    }

    // Legacy Supabase query
    let query = supabase.from(this.table).select('*');

    if (params?.organization_id) {
      query = query.eq('organization_id', params.organization_id);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, error } = await query.is('deleted_at', null);

    if (error) throw error;
    return data as T[];
  }

  /**
   * Get single record by ID
   */
  async getById(id: string): Promise<T> {
    if (this.useNewApi) {
      const response = await api.get<T>(`${this.endpoint}/${id}`);
      return response.data;
    }

    const { data, error } = await supabase.from(this.table).select('*').eq('id', id).single();

    if (error) throw error;
    return data as T;
  }

  /**
   * Create new record
   */
  async create(dto: CreateDto): Promise<T> {
    if (this.useNewApi) {
      const response = await api.post<T>(this.endpoint, dto);
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .insert(dto as Record<string, unknown>)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  /**
   * Update existing record
   */
  async update(id: string, dto: UpdateDto): Promise<T> {
    if (this.useNewApi) {
      const response = await api.put<T>(`${this.endpoint}/${id}`, dto);
      return response.data;
    }

    const { data, error } = await supabase
      .from(this.table)
      .update(dto as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  /**
   * Delete record (soft delete)
   */
  async delete(id: string): Promise<void> {
    if (this.useNewApi) {
      await api.delete(`${this.endpoint}/${id}`);
      return;
    }

    const { error } = await supabase
      .from(this.table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Search records
   */
  async search(query: string, params?: Record<string, any>): Promise<T[]> {
    if (this.useNewApi) {
      const response = await api.get<T[]>(this.endpoint, { ...params, search: query });
      return response.data;
    }

    let dbQuery = supabase.from(this.table).select('*').is('deleted_at', null);

    if (params?.organization_id) {
      dbQuery = dbQuery.eq('organization_id', params.organization_id);
    }

    // Use ilike for search (implementation depends on table structure)
    dbQuery = dbQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`);

    const { data, error } = await dbQuery.limit(params?.limit || 20);

    if (error) throw error;
    return data as T[];
  }

  /**
   * Count records
   */
  async count(params?: Record<string, any>): Promise<number> {
    if (this.useNewApi) {
      const response = await api.get<{ count: number }>(`${this.endpoint}/count`, params);
      return response.data.count;
    }

    let query = supabase
      .from(this.table)
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (params?.organization_id) {
      query = query.eq('organization_id', params.organization_id);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }
}

export default BaseService;
