/**
 * MessageStore - Centralized message cache and state management
 * 
 * Features:
 * - Per pageId + parentId cache keys
 * - Keyset pagination support
 * - Event emitter for UI updates
 * - Real-time event merging
 */

import { Message as BaseMessage } from '../types/index.js';

// Attachment type (simplified - can be extended later)
export interface Attachment {
  id?: string;
  url?: string;
  type?: string;
  name?: string;
  size?: number;
  [key: string]: unknown;
}

// Emoji metadata type (simplified - can be extended later)
export interface EmojiMetadata {
  [emoji: string]: {
    count?: number;
    users?: string[];
    [key: string]: unknown;
  };
}

// Extended Message interface for MessageStore (includes store-specific fields)
export interface Message extends BaseMessage {
  messageKind?: string;
  attachments?: Attachment[];
  emojiMetadata?: EmojiMetadata | null;
  author?: {
    id: string;
    name: string;
    handle: string;
    avatarUrl: string;
    auraColor?: string;
  };
  createdAt: string | Date;
  updatedAt?: string | Date;
  parentId?: string | null;
  thread?: {
    replyCount: number;
    topReply?: {
      id: string;
      content: string;
      reactions: Record<string, number>;
      createdAt: string;
      author: {
        id: string;
        name: string;
        avatarUrl: string;
      };
      hasMoreReplies: boolean;
    } | null;
  };
  focusContext?: {
    mode: 'default' | 'parent' | 'child';
  };
}

export interface MessagesResponse {
  pageId: string;
  parentId: string | null;
  items: Message[];
  parent: Message | null;
  nextCursor: string | null;
  hasMore: boolean;
  metadata?: {
    pageTitle?: string | null;
    totalCountApprox?: number | null;
  };
}

export type CacheKey = `${string}|${string | 'null'}`;

export type StoreStatus = 'idle' | 'loading' | 'ready' | 'exhausted' | 'error';

export interface CacheEntry {
  items: Message[];
  nextCursor: string | null;
  status: StoreStatus;
  lastFetched: number;
  parent?: Message | null;
}

type StoreEvent = 'update' | 'error' | 'statusChange';

// Store event data types
interface StoreUpdateData {
  key: CacheKey | null;
  data: CacheEntry | null;
}

interface StoreErrorData {
  key: CacheKey;
  error: unknown;
}

interface StoreStatusChangeData {
  key: CacheKey;
  status: StoreStatus;
}

type StoreEventData = StoreUpdateData | StoreErrorData | StoreStatusChangeData;

type StoreEventListener = (data: StoreEventData) => void;

class MessageStore {
  private cache: Map<CacheKey, CacheEntry> = new Map();
  private listeners: Map<StoreEvent, Set<StoreEventListener>> = new Map();
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api/messages') {
    this.apiBaseUrl = apiBaseUrl;
    this.setupEventListeners();
  }

  /**
   * Generate cache key from pageId and parentId
   */
  private getCacheKey(pageId: string, parentId: string | null): CacheKey {
    return `${pageId}|${parentId || 'null'}`;
  }

  /**
   * Subscribe to store events
   */
  on(event: StoreEvent, listener: StoreEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /**
   * Emit store events
   */
  private emit(event: StoreEvent, data: StoreEventData): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in store event listener:`, error);
      }
    });
  }

  /**
   * Setup event listeners (for real-time updates, etc.)
   */
  private setupEventListeners(): void {
    // Listen for real-time message events
    if (typeof window !== 'undefined') {
      window.addEventListener('realtime-message', (event: Event) => {
        const customEvent = event as CustomEvent<Partial<Message>>;
        this.handleRealtimeMessage(customEvent.detail || {});
      });

      window.addEventListener('realtime-message-updated', (event: Event) => {
        const customEvent = event as CustomEvent<Partial<Message>>;
        this.handleRealtimeUpdate(customEvent.detail || {});
      });

      window.addEventListener('realtime-message-deleted', (event: Event) => {
        const customEvent = event as CustomEvent<{ id?: string; message_id?: string }>;
        this.handleRealtimeDelete(customEvent.detail || {});
      });
    }
  }

  /**
   * Get cached entry
   */
  get(pageId: string, parentId: string | null): CacheEntry | null {
    const key = this.getCacheKey(pageId, parentId);
    return this.cache.get(key) || null;
  }

  /**
   * Get status for a cache entry
   */
  getStatus(pageId: string, parentId: string | null): StoreStatus {
    const entry = this.get(pageId, parentId);
    return entry?.status || 'idle';
  }

  /**
   * Load messages from API
   */
  async load(
    pageId: string,
    parentId: string | null = null,
    options: {
      limit?: number;
      cursor?: string | null;
      includeTopReply?: boolean;
      communityId?: string;
    } = {}
  ): Promise<MessagesResponse> {
    const key = this.getCacheKey(pageId, parentId);
    const {
      limit = 10,
      cursor = null,
      includeTopReply = parentId === null,
      communityId = 'comm-001'
    } = options;

    // Update status to loading
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      existingEntry.status = 'loading';
      this.emit('statusChange', { key, status: 'loading' });
    }

    try {
      // Build query params
      const params = new URLSearchParams({
        pageId,
        limit: limit.toString(),
        includeTopReply: includeTopReply.toString(),
        communityId
      });

      if (parentId) {
        params.append('parentId', parentId);
      } else {
        params.append('parentId', 'null');
      }

      if (cursor) {
        params.append('cursor', cursor);
      }

      // Fetch from API
      const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: MessagesResponse = await response.json();

      // Update cache
      const entry: CacheEntry = {
        items: cursor ? [...(existingEntry?.items || []), ...data.items] : data.items,
        nextCursor: data.nextCursor,
        status: data.hasMore ? 'ready' : 'exhausted',
        lastFetched: Date.now(),
        parent: data.parent || existingEntry?.parent || null
      };

      this.cache.set(key, entry);
      this.emit('update', { key, data: entry });
      this.emit('statusChange', { key, status: entry.status });

      return data;

    } catch (error) {
      console.error('MessageStore.load error:', error);
      
      // Update status to error
      if (existingEntry) {
        existingEntry.status = 'error';
        this.emit('statusChange', { key, status: 'error' });
      }
      
      this.emit('error', { key, error });
      throw error;
    }
  }

  /**
   * Load next page (lazy loading)
   */
  async loadNextPage(pageId: string, parentId: string | null = null): Promise<MessagesResponse | null> {
    const entry = this.get(pageId, parentId);
    
    if (!entry || !entry.nextCursor || entry.status === 'exhausted') {
      return null;
    }

    return this.load(pageId, parentId, {
      cursor: entry.nextCursor,
      includeTopReply: parentId === null
    });
  }

  /**
   * Invalidate cache entry
   */
  invalidate(pageId: string, parentId: string | null): void {
    const key = this.getCacheKey(pageId, parentId);
    this.cache.delete(key);
    this.emit('update', { key, data: null });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.emit('update', { key: null, data: null });
  }

  /**
   * Handle real-time message insert
   */
  private handleRealtimeMessage(message: Partial<Message> & { page_id?: string; parent_id?: string }): void {
    // Find matching cache entries and merge
    for (const [key, entry] of this.cache.entries()) {
      const [cachedPageId, cachedParentId] = key.split('|');
      const messageParentId = message.parent_id || 'null';
      
      // Check if message belongs to this cache entry
      if (
        message.page_id === cachedPageId &&
        (messageParentId === cachedParentId || 
         (cachedParentId === 'null' && !message.parent_id))
      ) {
        // Check if message already exists (avoid duplicates)
        const exists = entry.items.some(m => m.id === message.id);
        if (!exists) {
          // Add to beginning (newest first)
          entry.items.unshift(this.normalizeMessage(message));
          this.emit('update', { key, data: entry });
        }
      }
    }
  }

  /**
   * Handle real-time message update
   */
  private handleRealtimeUpdate(message: Partial<Message> & { updated_at?: string }): void {
    for (const [key, entry] of this.cache.entries()) {
      const index = entry.items.findIndex(m => m.id === message.id);
      if (index !== -1) {
        // Update existing message (prefer real-time data, but use timestamp for conflict resolution)
        const existing = entry.items[index];
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const newTime = (message.updated_at || message.updatedAt) ? new Date(message.updated_at || message.updatedAt || '').getTime() : 0;
        
        if (newTime >= existingTime) {
          entry.items[index] = this.normalizeMessage(message);
          this.emit('update', { key, data: entry });
        }
      }
    }
  }

  /**
   * Handle real-time message deletion
   */
  private handleRealtimeDelete(message: { id?: string; message_id?: string }): void {
    for (const [key, entry] of this.cache.entries()) {
      const index = entry.items.findIndex(m => m.id === message.id || m.id === message.message_id);
      if (index !== -1) {
        entry.items.splice(index, 1);
        this.emit('update', { key, data: entry });
      }
    }
  }

  /**
   * Normalize message from API format
   */
  private normalizeMessage(message: Partial<Message> & { 
    user_id?: string;
    author_name?: string;
    author_handle?: string;
    author_avatar_url?: string;
    author_aura_color?: string;
    created_at?: string;
    updated_at?: string;
    parent_id?: string;
    focusContext?: { mode: 'default' | 'parent' | 'child' };
  }): Message {
    const normalized: Message = {
      id: message.id || '',
      authorId: (message.authorId || message.user_id || '') as string,
      communityId: message.communityId || '',
      content: message.content || '',
      createdAt: message.createdAt || message.created_at || new Date().toISOString(),
      messageKind: message.messageKind || 'TEXT',
      attachments: message.attachments || [],
      emojiMetadata: message.emojiMetadata || null,
      parentId: message.parentId || message.parent_id || null,
      updatedAt: message.updatedAt || message.updated_at,
      ...(message.author && { author: message.author }),
      ...(message.thread && { thread: message.thread }),
      ...(message.focusContext && { focusContext: message.focusContext })
    };

    // If no author object, create minimal one
    if (!normalized.author && message.user_id) {
      normalized.author = {
        id: message.user_id,
        name: message.author_name || 'Unknown',
        handle: message.author_handle || 'unknown',
        avatarUrl: message.author_avatar_url || '',
        ...(message.author_aura_color && { auraColor: message.author_aura_color })
      };
    }

    return normalized;
  }
}

// Export singleton instance
export const messageStore = new MessageStore();

// Also export class for testing
export { MessageStore };

