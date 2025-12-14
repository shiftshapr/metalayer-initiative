/**
 * Message helper types and interfaces
 */

export interface RawMessagePayload {
  id?: string;
  messageId?: string;
  uuid?: string;
  body?: string;
  message?: string;
  author?: any;
  authorId?: string;
  authorEmail?: string;
  AppUser?: any;
  user?: any;
  userId?: string;
  parentId?: string;
  replyTo?: string;
  conversationId?: string;
  conversation_id?: string;
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

export interface ResolvedAuthor {
  id: string;
  name?: string;
  handle?: string;
  email?: string;
  avatarUrl?: string;
  auraColor?: string;
}

export interface NormalizedMessage {
  id: string;
  body: string;
  content?: string; // Added for compatibility with Message interface
  author: ResolvedAuthor;
  timestamp: string;
  createdAt?: string; // Added for compatibility
  updatedAt?: string; // Added for compatibility
  threadId?: string;
  parentId?: string;
  reactions?: ReactionsData;
  isBookmarked?: boolean;
  bookmarkCount?: number;
  shareCount?: number;
  isShared?: boolean;
}

export interface ReactionsData {
  [reactionType: string]: {
    count: number;
    users: string[];
  };
}

export interface MessageSystemIntegration {
  loadMessages: (pageId: string) => Promise<NormalizedMessage[]>;
  sendMessage: (message: Partial<NormalizedMessage>) => Promise<NormalizedMessage>;
  updateMessage: (messageId: string, updates: Partial<NormalizedMessage>) => Promise<NormalizedMessage>;
  loadFocusMode?: (messageId: string) => Promise<NormalizedMessage[]>;
}

export interface UnifiedMessageDisplay {
  renderMessage: (message: NormalizedMessage) => HTMLElement;
  updateMessage: (element: HTMLElement, message: NormalizedMessage) => void;
  removeMessage: (element: HTMLElement) => void;
}

export interface MessageLoader {
  loadInitial: (pageId: string) => Promise<NormalizedMessage[]>;
  loadMore: (pageId: string, beforeMessageId: string) => Promise<NormalizedMessage[]>;
  loadThread: (threadId: string) => Promise<NormalizedMessage[]>;
}

export interface MessageSystemIntegrationConfig {
  supabaseClient: any;
  onMessageUpdate?: (messages: any[]) => void;
  onError?: (error: Error) => void;
}