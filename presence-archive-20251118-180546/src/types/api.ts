/**
 * API Response Types
 * Type definitions for API requests and responses
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success?: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, unknown>;
}

/**
 * API request options
 */
export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: string | Record<string, unknown>;
  headers?: Record<string, string>;
  allow404?: boolean;
}

/**
 * User API responses
 */
export interface UserResponse {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  auraColor?: string;
  displayName?: string;
  headline?: string;
  preferences?: Record<string, unknown>;
}

/**
 * Message API responses
 */
export interface MessageResponse {
  id: string;
  body: string;
  authorId: string;
  author: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  parentId?: string | null;
  conversationId?: string;
  pageId?: string;
  communityId?: string;
}

/**
 * Community API responses
 */
export interface CommunityResponse {
  id: string;
  name: string;
  handle?: string;
  description?: string;
}

/**
 * Conversation API responses
 */
export interface ConversationResponse {
  id: string;
  communityId: string;
  pageId: string;
  posts?: Array<{ id: string }>;
}

/**
 * Preferences API responses
 */
export interface PreferencesResponse {
  preferences: Record<string, unknown>;
}
