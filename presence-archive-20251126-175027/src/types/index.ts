/**
 * Core Type Definitions
 * Shared types used across the application
 */

// Re-export all types from sub-modules
export * from './api.js';
export * from './events.js';
export * from './notifications.js';
export * from './provenance.js';
export * from './subscriptions.js';
export * from './anchors.js';
export * from './supabaseTables.js';
export * from './realtime.js';

// Core domain types
export interface User {
  id?: string;
  email?: string;
  name?: string;
  handle?: string;
  avatarUrl?: string;
  auraColor?: string;
  headline?: string;
  displayName?: string;
  userId?: string;
  communities?: string[] | Array<{ id: string; name: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface EmojiMetadata {
  emojis?: string[];
  emojiCount?: number;
  hasEmoji?: boolean;
}

export interface FocusContext {
  mode: 'default' | 'parent-in-focus' | 'child-in-focus';
  parentId?: string;
  childId?: string;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  communityId?: string;
  pageId?: string;
  parentId?: string | null;
  author?: User;
  createdAt: Date | string;
  updatedAt: Date | string;
  isReply?: boolean;
  hasReplies?: boolean;
  replyCount?: number;
  // Rich message fields
  messageKind?: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'MIXED';
  attachments?: Attachment[];
  emojiMetadata?: EmojiMetadata;
  focusContext?: FocusContext;
  cameraSource?: string;
  hasSensitiveMedia?: boolean;
  // Runtime fields
  conversationId?: string; // Thread/conversation grouping identifier (runtime, may be computed)
  optionalContent?: string | null; // JSON-serialized ContentAnchor for anchored messages
  // Bookmark fields
  bookmarkCount?: number;
  isBookmarked?: boolean;
  [key: string]: unknown;
}

/**
 * Raw message payload from API/database
 * May have different field names (snake_case, camelCase, etc.)
 */
export interface RawMessagePayload {
  id?: string;
  messageId?: string;
  uuid?: string;
  content?: string;
  body?: string;
  message?: string;
  authorId?: string;
  author_id?: string;
  userId?: string;
  user_id?: string;
  communityId?: string;
  community_id?: string;
  pageId?: string;
  page_id?: string;
  parentId?: string | null;
  parent_id?: string | null;
  replyTo?: string | null;
  conversationId?: string;
  conversation_id?: string;
  threadId?: string;
  thread_id?: string;
  createdAt?: Date | string;
  created_at?: Date | string;
  timestamp?: Date | string;
  updatedAt?: Date | string;
  updated_at?: Date | string;
  modified_at?: Date | string;
  deletedAt?: Date | string;
  deleted_at?: Date | string;
  author?: User | Record<string, unknown>;
  AppUser?: User | Record<string, unknown>;
  user?: User | Record<string, unknown>;
  reactions?: Array<Record<string, unknown>>;
  optionalContent?: string | null;
  optional_content?: string | null;
  uri?: string;
  url?: string;
  messageUrl?: string;
  rawUrl?: string;
  normalizedUrl?: string;
  isBookmarked?: boolean;
  bookmarkCount?: number;
  shareCount?: number;
  isShared?: boolean;
  authorEmail?: string;
  [key: string]: unknown;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  memberCount?: number;
  isPublic?: boolean;
  isPrimary?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  settings?: {
    allowPublicMessages?: boolean;
    requireApproval?: boolean;
    [key: string]: unknown;
  };
  metadata?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface StateData {
  [key: string]: unknown;
}

export interface StateManager {
  initialize(initialState?: StateData): Promise<void>;
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  getAll(): Promise<StateData>;
  getState(path: string): unknown;
  setState(path: string, value: unknown, persist?: boolean): void;
  subscribe(path: string, callback: (newValue: unknown, oldValue: unknown, path: string) => void): () => void;
  getHistory(path?: string): unknown[];
  getSnapshot(): unknown;
  resetState(path?: string): void;
  cleanup(): void;
}

// Supabase types
// Import official types if available, otherwise define minimal interface
export interface SupabaseQueryBuilder<T = Record<string, unknown>> {
  select: (columns: string) => SupabaseFilterBuilder<T>;
  insert: (values: unknown) => SupabaseFilterBuilder<T>;
  update: (values: unknown) => SupabaseFilterBuilder<T>;
  delete: () => SupabaseFilterBuilder<T>;
}

export interface SupabaseFilterBuilder<T = Record<string, unknown>> {
  eq: (column: string, value: string | boolean | number) => SupabaseFilterBuilder<T>;
  neq: (column: string, value: string | boolean | number) => SupabaseFilterBuilder<T>;
  gt: (column: string, value: string | number) => SupabaseFilterBuilder<T>;
  lt: (column: string, value: string | number) => SupabaseFilterBuilder<T>;
  gte: (column: string, value: string | number) => SupabaseFilterBuilder<T>;
  lte: (column: string, value: string | number) => SupabaseFilterBuilder<T>;
  like: (column: string, pattern: string) => SupabaseFilterBuilder<T>;
  ilike: (column: string, pattern: string) => SupabaseFilterBuilder<T>;
  is: (column: string, value: unknown) => SupabaseFilterBuilder<T>;
  in: (column: string, values: unknown[]) => SupabaseFilterBuilder<T>;
  contains: (column: string, value: unknown) => SupabaseFilterBuilder<T>;
  order: (column: string, options?: { ascending?: boolean }) => Promise<{
    data: T[] | null;
    error: { message: string; code?: string } | null;
  }>;
  limit: (count: number) => SupabaseFilterBuilder<T>;
  range: (from: number, to: number) => SupabaseFilterBuilder<T>;
  single: () => Promise<{
    data: T | null;
    error: { message: string; code?: string } | null;
  }>;
  maybeSingle: () => Promise<{
    data: T | null;
    error: { message: string; code?: string } | null;
  }>;
  then: <U>(
    onfulfilled?: (value: { data: T[] | null; error: { message: string; code?: string } | null }) => U | PromiseLike<U>,
    onrejected?: (reason: unknown) => U | PromiseLike<U>
  ) => Promise<U>;
}

export interface SupabaseRealtimeChannel {
  // Event subscription with chaining support
  on: (
    event: string,
    filter: { event?: string; schema?: string; table?: string; filter?: string },
    callback: (payload?: { eventType?: string; new?: unknown; old?: unknown; key?: string; newPresences?: unknown[]; leftPresences?: unknown[] }) => void
  ) => SupabaseRealtimeChannel;
  subscribe: (callback?: (status: string, err?: Error) => void | Promise<void>) => void;
  unsubscribe: () => void;
  send: (type: string, payload: unknown) => void;
  // Presence-specific methods
  presenceState?: () => unknown;
  track?: (data: { userId?: string; userName?: string; [key: string]: unknown }) => Promise<void>;
}

export interface SupabaseClient {
  from: <T = Record<string, unknown>>(table: string) => SupabaseQueryBuilder<T>;
  channel: (name: string) => SupabaseRealtimeChannel;
  removeChannel: (channel: SupabaseRealtimeChannel) => void;
  auth: {
    getSession: () => Promise<{ data: { session: { user: { id?: string; email?: string }; expires_at: number } | null } | null; error: unknown }>;
    onAuthStateChange: (callback: (event: string, session: unknown) => void) => { data: { subscription: unknown } };
    [key: string]: unknown;
  };
  realtime?: {
    channel: (name: string) => SupabaseRealtimeChannel;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// API Response type (re-export from api.ts)
export type { ApiResponse as APIResponse } from './api.js';

// Reaction type
export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  type: string;
  createdAt?: Date | string;
  [key: string]: unknown;
}

// Presence Data type
export interface PresenceData {
  userId: string;
  lastSeen: string;
  pageId?: string;
  status?: string;
  [key: string]: unknown;
}

// Auras Integration type
export interface AurasIntegration {
  initialize?: () => Promise<void>;
  updateAura?: (userId: string, auraColor: string) => Promise<void>;
  [key: string]: unknown;
}

// Tab Data type
export interface TabData {
  id: string;
  label: string;
  content?: unknown;
  active?: boolean;
  [key: string]: unknown;
}

// Preferences type
export interface Preferences {
  theme?: string;
  displayName?: string;
  headline?: string;
  [key: string]: unknown;
}
