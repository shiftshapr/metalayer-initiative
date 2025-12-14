/**
 * Core Type Definitions
 * Shared types for the Canopi application
 */

// Message types
export interface Message {
  id: string;
  content: string;
  authorId: string;
  authorEmail?: string;
  authorHandle?: string;
  conversationId: string;
  communityId?: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
  reactions?: ReactionsData;
  bookmarkCount?: number;
  isBookmarked?: boolean;
  author: User;
  conversation?: {
    id: string;
    communityId: string;
  };
}

export interface RawMessagePayload {
  id?: string;
  messageId?: string;
  uuid?: string;
  body?: string;
  message?: string;
  content?: string;
  author?: any;
  authorId?: string;
  authorEmail?: string;
  AppUser?: any;
  user?: any;
  user_id?: string;
  userId?: string;
  parentId?: string;
  parent_id?: string;
  replyTo?: string;
  conversationId?: string;
  conversation_id?: string;
  communityId?: string;
  threadId?: string;
  thread_id?: string;
  pageId?: string;
  page_id?: string;
  rawUrl?: string;
  normalizedUrl?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  timestamp?: string;
  modified_at?: string;
  reactions?: any;
  optionalContent?: any;
  optional_content?: any;
  uri?: string;
  url?: string;
  messageUrl?: string;
  isBookmarked?: boolean;
  bookmarkCount?: number;
  shareCount?: number;
  isShared?: boolean;
  deletedAt?: string;
  deleted_at?: string;
}

// User types
export interface User {
  id: string;
  email?: string;
  name?: string;
  handle?: string;
  avatarUrl?: string;
  auraColor?: string;
  theme?: string;
  headline?: string;
  displayName?: string;
  auraIntensity?: number;
  primaryCommunityId?: string;
  activeCommunities?: string;
  preferences?: {
    theme?: string;
    headline?: string;
    displayName?: string;
    auraIntensity?: number;
  };
}

// Supabase types (simplified)
export interface SupabaseClient {
  from: (table: string) => any;
  auth: any;
  realtime: any;
}

// Presence types
export interface PresenceData {
  userId: string;
  url: string;
  timestamp: string;
  user?: User;
}

// Additional types that may be needed
export interface Community {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  visible: boolean;
  builtIn?: boolean;
  isDeveloperMode?: boolean;
  order?: number;
  tabContentId?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface ModuleGraph {
  [key: string]: unknown;
}

export interface ReactionsData {
  [reactionType: string]: {
    count: number;
    users: string[];
  };
}