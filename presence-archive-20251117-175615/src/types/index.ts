/**
 * Shared Type Definitions
 * Common types used across the application
 */

// User type definition
// Standardized to camelCase - all fields use consistent naming
export interface User {
  id: string; // Primary user identifier
  name?: string;
  email?: string;
  avatarUrl?: string; // User avatar image URL
  handle?: string; // Username/handle
  communityId?: string; // Current community context
  lastSeen?: string | Date; // Last seen timestamp
  status?: 'online' | 'offline' | 'inactive' | 'AVAILABLE' | 'BUSY' | 'AWAY'; // User status
  auraColor?: string; // User's aura color
  auraIntensity?: number; // Aura intensity value
  isActive?: boolean; // Whether user is active
  userMetadata?: any; // Supabase auth user metadata (kept as-is for compatibility)
  isVisible?: boolean; // Whether user is visible
  visibilityEnabled?: boolean; // Whether visibility is enabled
  displayName?: string; // Display name (different from name)
  availability?: string; // Availability status (AVAILABLE, BUSY, AWAY, etc.)
}

// Message type definition
// Standardized to camelCase - all fields use consistent naming
export interface Message {
  id: string;
  content: string; // Message text content
  parentId?: string | null; // For threaded replies
  author?: User; // Full author object
  authorId: string; // Author user ID (required)
  communityId: string; // Community/space ID
  conversationId?: string; // For conversation grouping
  pageId?: string; // Normalized page identifier
  rawUrl?: string | null; // Raw URL associated with the message
  normalizedUrl?: string | null; // Canonical URL reference
  createdAt: string | Date; // Creation timestamp
  updatedAt?: string | Date; // Last update timestamp
  reactions?: Reaction[]; // Array of reactions
  optionalContent?: string | null; // JSON-serialized ContentAnchor
  uri?: string | null; // Optional URI reference
  threadId?: string | null; // Thread identifier
  deletedAt?: string | Date | null; // Soft delete timestamp
  
  // Bookmark and share data (optional, populated when needed)
  bookmarks?: Bookmark[];
  bookmarkCount?: number;
  isBookmarked?: boolean; // Current user's bookmark status
  shares?: Share[];
  shareCount?: number;
  isShared?: boolean; // Whether current user has shared
}

// Reaction type definition
export interface Reaction {
  id: string;
  emoji: string;
  messageId: string;
  AppUser?: User;
}

// Bookmark type definition
export interface Bookmark {
  id: string;
  userId: string;
  messageId: string;
  categoryId?: string; // Future: For organizing bookmarks into categories
  comments?: string; // Future: User notes/comments on the bookmark
  isPrivate?: boolean; // Future: For sharing bookmarks (default: true)
  tags?: string[]; // Future: For tagging/organizing bookmarks
  priority?: number; // Future: For sorting/importance (1-5, etc.)
  sortOrder?: number; // Future: Custom sort order within category
  archived?: boolean; // Future: Archive without deleting (default: false)
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null; // Soft delete
  
  // Relations (optional, populated when joined)
  AppUser?: User;
  message?: Message;
}

// Share type definition
export type ShareType = 'link' | 'twitter' | 'navigate' | 'focus' | 'notify' | 'reference';

export interface Share {
  id?: string; // Optional, may not be stored in DB
  messageId: string;
  userId?: string; // User who shared (optional for anonymous shares)
  shareType: ShareType;
  shareUrl?: string; // Generated share URL
  createdAt?: string | Date;
  
  // Share metadata
  pageUrl?: string;
  conversationId?: string;
  messageUrl?: string; // Full URL to the shared message
  
  // Relations (optional)
  message?: Message;
  user?: User;
}

// Visibility data type
export interface VisibilityData {
  id: string;
  userId: string;
  pageId: string;
  isVisible: boolean;
  enterTime?: string;
  lastSeen?: string;
}

// URL data type
export interface UrlData {
  pageId: string;
  rawUrl: string;
  normalizedUrl: string;
}

// Chat data type
export interface ChatData {
  messages: Message[];
  communityId: string;
  pageId: string;
}

// State Manager types
export interface StateData {
  [key: string]: any;
}

export interface StateManager {
  initialize(initialState: StateData): Promise<void>;
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  getAll(): Promise<StateData>;
}

// Event Bus types
export type EventCallback = (data?: any) => void | Promise<void>;
export type EventType = string;

export interface EventBus {
  on(event: EventType, callback: EventCallback): string;
  off(event: EventType, listenerId: string): void;
  emit(event: EventType, data?: any): void;
}

// Supabase types
export interface SupabaseClient {
  channel: (name: string) => SupabaseChannel;
  from: (table: string) => SupabaseQueryBuilder;
  auth: {
    getUser: () => Promise<any>;
    signInWithOAuth: (options: any) => Promise<any>;
    signOut: () => Promise<any>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: any }; unsubscribe: () => void };
  };
  [key: string]: any;
}

export interface SupabaseChannel {
  on: (event: string, callback: (payload: any) => void) => SupabaseChannel;
  subscribe: (callback: (status: string) => void) => SupabaseChannel;
  unsubscribe: () => void;
}

export interface SupabaseQueryBuilder {
  select: (columns?: string) => SupabaseQueryBuilder;
  insert: (data: any) => Promise<any>;
  update: (data: any) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
  eq: (column: string, value: any) => SupabaseQueryBuilder;
  [key: string]: any;
}

// API types
export interface APIRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  allow404?: boolean;
}

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  status?: number;
}

// Logger types
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SUCCESS';

export interface Logger {
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  setLevel(level: LogLevel): void;
}

// Export provenance types
export * from './provenance';

// Export anchor types
export * from './anchors';
