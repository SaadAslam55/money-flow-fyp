/**
 * API Client for MoneyFlow
 * Unified HTTP client with auth, retry, and error handling
 */

import { getSession } from '@/lib/supabase/auth';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    timestamp?: string;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

export class ApiErrorClass extends Error implements ApiError {
  code: string;
  status: number;
  details?: Record<string, any>;

  constructor(message: string, code: string, status: number, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiErrorClass.prototype);
  }
}

export interface RequestOptions {
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers,
    };
  }

  /**
   * Get authorization headers from Supabase session
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const session = await getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch (error) {
      logger.warn('Failed to get auth session:', error);
    }
    return {};
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  /**
   * Main request method
   */
  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { body, params, headers, signal, skipAuth } = options;

    const url = this.buildUrl(endpoint, params);

    // Merge headers
    const authHeaders = skipAuth ? {} : await this.getAuthHeaders();
    const requestHeaders = {
      ...this.defaultHeaders,
      ...authHeaders,
      ...headers,
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.fetchWithRetry(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createApiError(response.status, errorData);
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return { success: true, data: null as T };
      }

      const data = await response.json();

      // Normalize response format
      if (data.success !== undefined) {
        return data as ApiResponse<T>;
      }

      return {
        success: true,
        data: data.data ?? data,
        meta: data.meta,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithRetry(url: string, options: RequestInit, attempt = 1): Promise<Response> {
    try {
      const response = await fetch(url, options);

      // Retry on 5xx errors
      if (response.status >= 500 && attempt < this.retries) {
        await this.delay(Math.pow(2, attempt) * 100);
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      return response;
    } catch (error) {
      // Retry on network errors
      if (attempt < this.retries && this.isRetryableError(error)) {
        await this.delay(Math.pow(2, attempt) * 100);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRetryableError(error: any): boolean {
    return (
      error.name === 'TypeError' ||
      error.name === 'AbortError' ||
      error.message?.includes('network') ||
      error.message?.includes('fetch')
    );
  }

  private createApiError(status: number, data: any): ApiErrorClass {
    const errorMessages: Record<number, string> = {
      400: 'Bad request',
      401: 'Unauthorized - please log in again',
      403: 'You do not have permission to perform this action',
      404: 'Resource not found',
      409: 'Conflict - resource already exists',
      422: 'Validation error',
      429: 'Too many requests - please wait',
      500: 'Internal server error',
      502: 'Service temporarily unavailable',
      503: 'Service unavailable',
    };

    return new ApiErrorClass(
      data.message || errorMessages[status] || 'An error occurred',
      data.code || data.error || `HTTP_${status}`,
      status,
      data.details || data.errors,
    );
  }

  private handleError(error: any): ApiErrorClass {
    if (error.status) {
      return error as ApiErrorClass;
    }

    if (error.name === 'AbortError') {
      return new ApiErrorClass(
        'Request timeout - please try again',
        'TIMEOUT',
        408,
      );
    }

    return new ApiErrorClass(
      error.message || 'Network error - please check your connection',
      'NETWORK_ERROR',
      0,
    );
  }

  // ============================================
  // HTTP Methods
  // ============================================

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, { params });
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Health check
   */
  async health(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.get('/health');
      return { status: 'healthy', latency: Date.now() - start };
    } catch {
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }
}

// ============================================
// API Instances
// ============================================

// Main NestJS API (TiDB backend)
export const api = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  retries: 3,
});

// Edge API (Cloudflare Workers)
export const edgeApi = new ApiClient({
  baseUrl: import.meta.env.VITE_EDGE_API_URL || 'https://api.moneyflow.workers.dev',
  timeout: 10000,
  retries: 2,
});

export default api;
