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
  userMetadata?: Record<string, unknown>; // Supabase auth user metadata (kept as Record for compatibility)
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
  body?: string | Record<string, unknown>; // Body can be string (JSON) or object
  allow404?: boolean;
}

export interface APIResponse<T = unknown> {
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

// Presence data type for realtime presence handlers
export interface PresenceData {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  metadata?: Record<string, unknown>;
}

// Auras integration interface
export interface AurasIntegration {
  updateAura?: (userId: string, auraColor: string) => void;
  getAura?: (userId: string) => Promise<string | null>;
  initialize?: () => Promise<boolean>;
  isInitialized?: boolean;
}

// Supabase presence record (snake_case from database, transformed to camelCase)
export interface SupabasePresenceRecord {
  id?: string;
  page_id?: string; // snake_case from Supabase
  user_id?: string; // snake_case from Supabase
  is_active?: boolean;
  last_seen?: string;
  enter_time?: string;
  [key: string]: unknown; // Allow additional fields
}

// User profile data from Supabase
export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  handle?: string;
  avatarUrl?: string;
  auraColor?: string;
  [key: string]: unknown; // Allow additional fields
}

// Page user data (from getPageUsers)
export interface PageUser {
  id?: string;
  email?: string;
  lastSeen?: string | Date;
  isActive?: boolean;
  [key: string]: unknown; // Allow additional fields
}

// Setting options for saveSetting
export interface SettingOptions {
  apiKey?: string;
  skipApi?: boolean;
  forceDatabase?: boolean;
  batch?: boolean;
  [key: string]: unknown; // Allow additional options
}

// Preferences type (for settings)
export interface Preferences {
  isVisible?: boolean;
  globalAvailability?: string;
  theme?: 'light' | 'dark' | 'auto';
  auraColor?: string;
  auraIntensity?: number;
  displayName?: string;
  [key: string]: unknown; // Allow additional preferences
}

// Avatar data for visibility display
export interface AvatarData {
  userId: string;
  url?: string;
  color?: string;
  initials?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

// Visibility update callback data
export interface VisibilityUpdate {
  userId: string;
  isVisible: boolean;
  timestamp: Date;
}

// Tab data for UI management
export interface TabData {
  id: string;
  name: string;
  element: HTMLElement;
  isActive: boolean;
}

// Notification data input (for showNotification)
export interface NotificationDataInput {
  id?: string;
  title?: string;
  message?: string;
  url?: string;
  anchor?: string;
  contentAnchor?: string;
  priority?: 'high' | 'medium' | 'low';
  timestamp?: number;
  read?: boolean;
  queued?: boolean;
  data?: Record<string, unknown>;
  source?: {
    category?: string;
    targetType?: string;
    targetId?: string;
    subscriptionId?: string;
  };
  [key: string]: unknown; // Allow additional fields
}

// Notification options
export interface NotificationOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  dismissible?: boolean;
  [key: string]: unknown; // Allow additional options
}

// Export provenance types
export * from './provenance';

// Export anchor types
export * from './anchors';
export * from './api.js';
export * from './events.js';
