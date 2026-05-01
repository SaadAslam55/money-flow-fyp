// src/lib/apiClient.ts
/**
 * Centralized API Client
 * Provides a unified interface for all API calls with consistent error handling,
 * loading states, caching, and request/response interceptors
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/services/api/baseApi';

/**
 * API Client configuration
 */
export interface ApiClientConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

/**
 * Request interceptor type
 */
export type RequestInterceptor = (
  config: ApiClientConfig
) => ApiClientConfig | Promise<ApiClientConfig>;

/**
 * Response interceptor type
 */
export type ResponseInterceptor = <T>(
  response: ApiResponse<T>
) => ApiResponse<T> | Promise<ApiResponse<T>>;

/**
 * Error interceptor type
 */
export type ErrorInterceptor = (error: Error) => Error | Promise<Error>;

/**
 * API Client class for managing all API requests
 */
class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private defaultConfig: ApiClientConfig = {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  };

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: ApiClientConfig): Promise<ApiClientConfig> {
    let finalConfig = { ...this.defaultConfig, ...config };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let finalResponse = response;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: Error): Promise<Error> {
    let finalError = error;
    for (const interceptor of this.errorInterceptors) {
      finalError = await interceptor(finalError);
    }
    return finalError;
  }

  /**
   * Execute API request with all interceptors and error handling
   */
  async execute<T>(
    fn: () => Promise<ApiResponse<T>>,
    config?: ApiClientConfig
  ): Promise<ApiResponse<T>> {
    try {
      // Apply request interceptors
      const finalConfig = await this.applyRequestInterceptors(config || {});

      // Execute the request with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timed out after ${finalConfig.timeout}ms`));
        }, finalConfig.timeout);
      });

      const response = await Promise.race([fn(), timeoutPromise]);

      // Apply response interceptors
      return await this.applyResponseInterceptors(response);
    } catch (error) {
      // Apply error interceptors
      const processedError = await this.applyErrorInterceptors(
        error instanceof Error ? error : new Error(String(error))
      );

      logger.error('API request failed:', processedError);

      return {
        data: null,
        error: processedError,
      };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      logger.error('Failed to get session:', error);
      return null;
    }
    return data.session;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Get auth headers
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await this.getSession();
    if (!session?.access_token) {
      return {};
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Add default request interceptor for auth headers
apiClient.addRequestInterceptor(async (config) => {
  const authHeaders = await apiClient.getAuthHeaders();
  return {
    ...config,
    headers: {
      ...config.headers,
      ...authHeaders,
    },
  };
});

// Add default response interceptor for logging
apiClient.addResponseInterceptor(async (response) => {
  if (response.error) {
    logger.warn('API response contains error:', response.error.message);
  }
  return response;
});

// Add default error interceptor for network errors
apiClient.addErrorInterceptor(async (error) => {
  if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
    return new Error('Network error. Please check your internet connection.');
  }
  return error;
});

export default apiClient;
