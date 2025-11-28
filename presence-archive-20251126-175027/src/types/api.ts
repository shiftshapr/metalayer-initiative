/**
 * API Type Definitions
 * Types for API requests and responses
 */

export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  allow401?: boolean;
  allow404?: boolean;
  allow500?: boolean;
  timeout?: number;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string | ApiError;
  success?: boolean;
  status?: number;
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  [key: string]: unknown;
}

