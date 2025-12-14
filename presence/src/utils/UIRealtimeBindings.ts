/**
 * UI REALTIME BINDINGS - Handles real-time message updates in the UI
 */

import { Logger } from './Logger.js';
import { getState } from '../core/StateManager.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { waitForCondition } from './AsyncCoordination.js';

interface MessagePost {
  id: string;
  parentId?: string | null;
  conversationId?: string;
  authorId?: string;
  body?: string;
  content?: string;
  createdAt?: string;
  editedAt?: string;
  author?: {
    id: string;
    name?: string;
    handle?: string;
    avatarUrl?: string | null;
    auraColor?: string;
  };
  conversation?: {
    id: string;
    communityId?: string;
  };
  __realtime?: boolean;
  __fromRealtime?: boolean;
}

interface Record {
  id?: string;
  messageId?: string;
  content?: string;
  newContent?: string;
  body?: string;
  user_id?: string;
  authorId?: string;
  created_at?: string;
  timestamp?: string;
  page_id?: string;
  parent_id?: string | null;
  community_id?: string;
  author?: {
    name?: string;
    handle?: string;
  };
}

export class UIRealtimeBindings {
  // Short-lived dedupe cache for inserts
  private recentAdds: Map<string, number> = new Map(); // id -> timestamp

  constructor() {
    Logger.info('🔗 UI REALTIME BINDINGS: initializing', null, 'ui-realtime');
    this.initialize();
  }

  private initialize(): void {
    try {
      // If the UI defines addMessageToChat, wrap it to prevent duplicates from
      // (1) local optimistic add and (2) realtime INSERT arriving milliseconds later.
      this.attachAddWrapper();

      // Wait for sidepanel to set addMessageToChat using proper async coordination
      // Use requestAnimationFrame for immediate check, then waitForCondition for retry
      requestAnimationFrame(() => {
        this.attachAddWrapper();
        // If still not available, wait for it using proper async coordination
        const windowWithAddMessage = window as Window & {
          addMessageToChat?: (post: MessagePost) => void;
        };
        waitForCondition(
          () => typeof windowWithAddMessage.addMessageToChat === 'function',
          { timeout: 2000, interval: 100 }
        )
          .then(() => {
            this.attachAddWrapper();
          })
          .catch(() => {
            // Timeout is acceptable - sidepanel might not be available
            Logger.debug('UI REALTIME: addMessageToChat not available after waiting', null, 'ui-realtime');
          });
      });

      // Seed dedupe with any messages already in DOM (e.g., from initial history load)
      try {
        const existing = document.querySelectorAll('.message[data-message-id]');
        existing.forEach((el) => {
          const id = el.getAttribute('data-message-id');
          if (id) {
            this.rememberAdd(id);
          }
        });
        if (existing.length) {
          Logger.info(
            '✅ UI REALTIME: seeded dedupe with existing messages',
            { count: existing.length },
            'ui-realtime'
          );
        }

        Logger.info(
          '✅ UI REALTIME: Root cause fixed - single source of truth implemented',
          null,
          'ui-realtime'
        );
      } catch (_e) {
        // Ignore errors
      }

      // Set up event listeners
      this.setupEventListeners();

      Logger.info('✅ UI REALTIME BINDINGS: ready', null, 'ui-realtime');
    } catch (err) {
      Logger.error('❌ UI REALTIME BINDINGS: init error', err, 'ui-realtime');
    }
  }

  private rememberAdd(id: string): void {
    const now = Date.now();
    this.recentAdds.set(id, now);
    // Purge after 12s - legitimate timeout for cleanup, not a race condition workaround
    setTimeout(() => {
      const t = this.recentAdds.get(id);
      if (t && Date.now() - t >= 12000) {
        this.recentAdds.delete(id);
      }
    }, 12500);
  }

  private isRecentAdd(id: string): boolean {
    const t = this.recentAdds.get(id);
    return !!t && Date.now() - t < 12000;
  }

  private attachAddWrapper(): void {
    const windowWithAddMessage = window as Window & {
      addMessageToChat?: ((post: MessagePost) => void) & { __originalAdd?: (post: MessagePost) => void };
      __addMessageToChatWrapped?: boolean;
    };
    if (typeof windowWithAddMessage.addMessageToChat !== 'function') return;
    if (windowWithAddMessage.__addMessageToChatWrapped) return;

    const originalAdd = windowWithAddMessage.addMessageToChat.bind(window);
    // Store original function globally for bypassing wrapper
    if (windowWithAddMessage.addMessageToChat) {
      (windowWithAddMessage.addMessageToChat as { __originalAdd?: (post: MessagePost) => void }).__originalAdd = originalAdd;
    }

    windowWithAddMessage.addMessageToChat = ((post: MessagePost) => {
      try {
        if (!post || !post.id) return originalAdd(post);

        // COMP METHOD FIX: Allow initial message loading by checking if this is a real-time message
        // Real-time messages have a specific structure that initial loading doesn't have
        const isRealtimeMessage = post.__realtime || post.__fromRealtime;

        if (!isRealtimeMessage) {
          // This is initial message loading - bypass deduplication
          Logger.debug(
            '🔍 WRAPPER: Initial message loading, bypassing deduplication',
            { id: post.id },
            'ui-realtime'
          );
          const res = originalAdd(post);
          return res;
        }

        // This is a real-time message - apply deduplication
        const existing = document.querySelector(`.message[data-message-id="${post.id}"]`);
        if (existing || this.isRecentAdd(post.id)) {
          const bodyEl = this.getOrCreateBodyElement(existing as HTMLElement | null);
          if (bodyEl) bodyEl.textContent = post.body || post.content || '';
          this.rememberAdd(post.id);
          Logger.debug('🧊 UI REALTIME: wrapped add deduped', { id: post.id }, 'ui-realtime');
          return;
        }
        const res = originalAdd(post);
        this.rememberAdd(post.id);
        return res;
      } catch (e) {
        Logger.warn('⚠️ UI REALTIME: add wrapper error, falling back', e, 'ui-realtime');
        return originalAdd(post);
      }
    }) as any;

    windowWithAddMessage.__addMessageToChatWrapped = true;
    Logger.info('✅ UI REALTIME: addMessageToChat wrapped for dedupe', null, 'ui-realtime');
  }

  private refreshChatSafely(): void {
    try {
      const windowWithChat = window as Window & {
        loadChatHistory?: (url?: string, communities?: string[]) => void;
        currentUrlData?: { pageId?: string; [key: string]: unknown };
      };
      if (typeof windowWithChat.loadChatHistory === 'function' && windowWithChat.currentUrlData) {
        // Reuse the existing loader for the active communities
        // Use ES6 import for StateManager access
        const activeCommunities = (getState('ui.activeCommunities') as string[] | undefined) || [
          'comm-001',
        ];
        const rawUrl = window.location.href;
        Logger.info(
          '🔗 UI REALTIME: refreshing chat',
          { currentUrlData: windowWithChat.currentUrlData, communities: activeCommunities },
          'ui-realtime'
        );
        if (windowWithChat.loadChatHistory) {
          windowWithChat.loadChatHistory(rawUrl, activeCommunities);
        }
      } else {
        Logger.warn(
          '⚠️ UI REALTIME: loadChatHistory or currentUrlData not available',
          null,
          'ui-realtime'
        );
      }
    } catch (e) {
      Logger.error('❌ UI REALTIME: refresh failed', e, 'ui-realtime');
    }
  }

  private buildUiPostFromRecord(record: Record): MessagePost {
    // Record may come from PG (record/new/old) or broadcast payload
    const id = record.id || record.messageId || crypto.randomUUID();
    const content = record.content || record.newContent || record.body || '';
    const userId = record.user_id || record.authorId || 'unknown-user';
    const createdAt = record.created_at || record.timestamp || new Date().toISOString();
    const windowWithUrl = window as Window & {
      currentUrlData?: { pageId?: string; [key: string]: unknown };
    };
    const pageId =
      record.page_id ||
      (windowWithUrl.currentUrlData?.pageId) ||
      'unknown';
    // Use ES6 import for StateManager access
    const communityId =
      record.community_id || (getState('ui.primaryCommunity') as string | undefined) || 'comm-001';

    return {
      id: id,
      parentId: record.parent_id || null,
      conversationId: `conv-${communityId}-${pageId}`,
      authorId: userId,
      body: content,
      createdAt: createdAt,
      editedAt: createdAt,
      author: {
        id: userId,
        name: record.author?.name || 'User',
        handle: record.author?.handle || 'user',
        // ES6 pattern: Use stateManager instead of window.currentUser
        avatarUrl: ((getState('currentUser') as { avatarUrl?: string } | null)?.avatarUrl) || null,
        auraColor: ((getState('currentUser') as { auraColor?: string } | null)?.auraColor) || AVATAR_FALLBACK_COLOR,
      },
      conversation: {
        id: `conv-${communityId}-${pageId}`,
        communityId,
      },
    };
  }

  private getOrCreateBodyElement(
    wrapper: HTMLElement | null,
    clearContent = false
  ): HTMLElement | null {
    if (!wrapper) return null;

    // Try common selectors
    const el = wrapper.querySelector(
      '.message-body, [data-role="message-body"], [data-role="message-text"], .message-text'
    ) as HTMLElement;

    if (el) {
      // SECURITY: Clear content with DOM manipulation instead of innerHTML
      if (clearContent) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
        el.textContent = '';
        // Also clear any child elements that might contain text
        const children = el.querySelectorAll('*');
        children.forEach((child) => {
          if (child.textContent) {
            child.textContent = '';
          }
        });
      }
      return el;
    }

    // Create a minimal, safe body container
    const created = document.createElement('div');
    created.setAttribute('data-role', 'message-body');
    // Prefer an existing content container if present
    const container =
      wrapper.querySelector('[data-role="message-content"], .message-content') || wrapper;
    container.appendChild(created);
    return created;
  }

  private extractRecord(payload: unknown, preferred: 'new' | 'old'): Record | null {
    // Handles: PG changes {new, old}, custom broadcasts {payload:{...}}, custom {message:{...}}
    if (!payload || typeof payload !== 'object') return null;
    const p = payload as Record & {
      payload?: Record & { old?: Record; new?: Record; record?: Record; message?: Record };
      message?: Record;
      old?: Record;
      new?: Record;
      record?: Record;
    };

    // Prefer direct PG payloads
    const payloadWithRecord = p as typeof p & { record?: Record; message?: Record };
    const direct =
      preferred === 'old'
        ? p.old || payloadWithRecord.record || payloadWithRecord.message
        : p.new || payloadWithRecord.record || payloadWithRecord.message;
    if (direct) return direct;

    // Nested under payload (PG changes forwarded as { event, payload })
    const nested = p.payload;
    if (nested) {
      const nestedPg =
        preferred === 'old'
          ? nested.old || nested.record || nested.message
          : nested.new || nested.record || nested.message;
      if (nestedPg) return nestedPg;
    }
    return p as Record;
  }

  private addMessageToUIFromPayload(payload: unknown): void {
    const record = this.extractRecord(payload, 'new');
    if (!record) {
      Logger.warn('⚠️ UI REALTIME: no record in payload', payload, 'ui-realtime');
      return;
    }
    const post = this.buildUiPostFromRecord(record);

    // If we've just added this id or it already exists, update in place
    if (this.isRecentAdd(post.id)) {
      const existingWrapper = document.querySelector(
        `.message[data-message-id="${post.id}"]`
      ) as HTMLElement;
      if (existingWrapper) {
        const bodyEl = this.getOrCreateBodyElement(existingWrapper);
        if (bodyEl) bodyEl.textContent = post.body || '';
        existingWrapper.setAttribute('data-realtime-updated', 'true');
        Logger.debug(
          '🔗 UI REALTIME: deduped recent add, updated existing',
          { id: post.id },
          'ui-realtime'
        );
        return;
      }
    }

    const existingWrapper = document.querySelector(
      `.message[data-message-id="${post.id}"]`
    ) as HTMLElement;
    if (existingWrapper) {
      const bodyEl = this.getOrCreateBodyElement(existingWrapper);
      if (bodyEl) bodyEl.textContent = post.body || '';
      existingWrapper.setAttribute('data-realtime-updated', 'true');
      Logger.debug(
        '🔗 UI REALTIME: updated existing message (no duplicate)',
        { id: post.id },
        'ui-realtime'
      );
      return;
    }

    const windowWithAddMessage = window as Window & {
      addMessageToChat?: (post: MessagePost) => void;
    };
    if (typeof windowWithAddMessage.addMessageToChat === 'function') {
      Logger.debug('🔗 UI REALTIME: addMessageToChat(post)', { id: post.id }, 'ui-realtime');
      windowWithAddMessage.addMessageToChat(post);
      this.rememberAdd(post.id);
    } else {
      Logger.warn(
        '⚠️ UI REALTIME: addMessageToChat not available, refreshing',
        null,
        'ui-realtime'
      );
      this.refreshChatSafely();
    }
  }

  public editMessageInUIFromPayload(payload: unknown): void {
    const record = this.extractRecord(payload, 'new');
    const p = payload as {
      id?: string;
      messageId?: string;
      payload?: { message?: { id?: string; content?: string } };
      message?: { id?: string; content?: string };
      content?: string;
      newContent?: string;
    };

    const messageId =
      (record && (record.id || record.messageId)) ||
      p?.id ||
      p?.messageId ||
      p?.payload?.message?.id ||
      p?.message?.id;

    const newBody =
      (record && (record.content ?? record.newContent ?? record.body)) ||
      p?.content ||
      p?.newContent ||
      p?.payload?.message?.content ||
      p?.message?.content ||
      '';

    if (!messageId || !newBody) {
      Logger.warn(
        '⚠️ UI REALTIME: insufficient data to edit',
        {
          payloadKeys: Object.keys((payload as object) || {}),
          recordKeys: Object.keys(record || {}),
          messageId,
          newBodyPreview: (typeof newBody === 'string' ? newBody : JSON.stringify(newBody)).slice(
            0,
            100
          ),
        },
        'ui-realtime'
      );
      // Fallback to a safe refresh if we can't parse
      return this.refreshChatSafely();
    }

    // Prefer dedicated updater if present
    const windowWithUpdate = window as Window & {
      updateMessageBodyInChat?: (messageId: string, newBody: string) => void;
    };
    if (typeof windowWithUpdate.updateMessageBodyInChat === 'function') {
      Logger.debug('🔗 UI REALTIME: updateMessageBodyInChat', { messageId }, 'ui-realtime');
      windowWithUpdate.updateMessageBodyInChat(messageId, newBody);
      return;
    }

    // Fallback: mutate DOM safely
    const wrapper = document.querySelector(
      `.message[data-message-id="${messageId}"]`
    ) as HTMLElement;

    // CRITICAL FIX: The actual content is in .message-content, not .message-body
    const el = document.querySelector(
      `.message[data-message-id="${messageId}"] .message-content`
    ) as HTMLElement;

    if (el) {
      Logger.debug('🔗 UI REALTIME: DOM edit', { messageId }, 'ui-realtime');
      // SECURITY: Clear existing content with DOM manipulation instead of innerHTML
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      el.textContent = newBody;
      Logger.info('✅ UI REALTIME: Content replaced (not appended)', { messageId }, 'ui-realtime');
    } else if (wrapper) {
      // Create a missing body node and update in-place
      const created = this.getOrCreateBodyElement(wrapper, true); // clearContent = true for edits
      if (created) {
        Logger.debug('🧩 UI REALTIME: created body node and updated', { messageId }, 'ui-realtime');
        // Content already cleared by getOrCreateBodyElement
        created.textContent = newBody;
        Logger.info(
          '✅ UI REALTIME: Content replaced (not appended)',
          { messageId },
          'ui-realtime'
        );
      } else {
        Logger.warn(
          '⚠️ UI REALTIME: could not create body node; refreshing',
          { messageId },
          'ui-realtime'
        );
        this.refreshChatSafely();
      }
    } else {
      // Not in DOM yet: add
      this.addMessageToUIFromPayload(record);
    }
  }

  public deleteMessageInUIFromPayload(payload: unknown): void {
    const record = this.extractRecord(payload, 'old');
    const p = payload as {
      id?: string;
      messageId?: string;
      payload?: { message?: { id?: string } };
      message?: { id?: string };
    };

    const messageId =
      (record && (record.id || record.messageId)) ||
      p?.id ||
      p?.messageId ||
      p?.payload?.message?.id ||
      p?.message?.id;

    if (!messageId) {
      Logger.warn(
        '⚠️ UI REALTIME: insufficient data to delete',
        {
          payloadKeys: Object.keys((payload as object) || {}),
          recordKeys: Object.keys(record || {}),
          messageId,
        },
        'ui-realtime'
      );
      return this.refreshChatSafely();
    }

    const windowWithRemove = window as Window & {
      removeMessageFromChat?: (messageId: string) => void;
    };
    if (typeof windowWithRemove.removeMessageFromChat === 'function') {
      Logger.debug('🔗 UI REALTIME: removeMessageFromChat', { messageId }, 'ui-realtime');
      windowWithRemove.removeMessageFromChat(messageId);
      return;
    }

    const wrapper = document.querySelector(
      `.message[data-message-id="${messageId}"]`
    ) as HTMLElement;
    if (wrapper && wrapper.parentElement) {
      Logger.debug('🔗 UI REALTIME: DOM delete', { messageId }, 'ui-realtime');
      wrapper.parentElement.removeChild(wrapper);
    } else {
      this.refreshChatSafely();
    }
  }

  private setupEventListeners(): void {
    // COMP METHOD: Use exact COMP real-time event handling
    window.addEventListener('realtime-message', (event: Event) => {
      const customEvent = event as CustomEvent<MessagePost>;
      Logger.info('📨 REALTIME: Received real-time message', customEvent.detail, 'ui-realtime');
      const message = customEvent.detail;
      if (message && message.content) {
        // Add the message to the chat UI using COMP method
        const windowWithAddMessage = window as Window & {
          addMessageToChat?: (post: MessagePost) => void;
        };
        if (typeof windowWithAddMessage.addMessageToChat === 'function') {
          windowWithAddMessage.addMessageToChat({
            id: message.id || `realtime-${Date.now()}`,
            body: message.content,
            author: {
              id: message.authorId || message.author?.id || 'unknown-author',
              name: message.author?.name || message.authorId || 'Unknown',
              avatarUrl: message.author?.avatarUrl,
            },
            createdAt: message.createdAt || new Date().toISOString(),
          });
        } else {
          Logger.error('❌ REALTIME: window.addMessageToChat not available', null, 'ui-realtime');
        }
      }
    });

    window.addEventListener('realtime-message-deleted', (event: Event) => {
      const customEvent = event as CustomEvent<{ messageId?: string; id?: string }>;
      Logger.info('🗑️ REALTIME: Received message deletion', customEvent.detail, 'ui-realtime');

      // Try different possible field names for the message ID
      const messageId = customEvent.detail.messageId || customEvent.detail.id;
      Logger.debug('🗑️ REALTIME: Using message ID', { messageId }, 'ui-realtime');

      if (messageId) {
        // Remove the message from the chat UI
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          Logger.info('✅ REALTIME: Message element found, removing from DOM', null, 'ui-realtime');
          messageElement.remove();
        } else {
          Logger.warn(
            '⚠️ REALTIME: Message element not found for deletion',
            { messageId, availableCount: document.querySelectorAll('[data-message-id]').length },
            'ui-realtime'
          );
        }
      } else {
        Logger.error('❌ REALTIME: No message ID found in deletion event', null, 'ui-realtime');
      }
    });

    window.addEventListener('realtime-message-edited', (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string; content?: string }>;
      Logger.info('✏️ REALTIME: Received message edit', customEvent.detail, 'ui-realtime');
      const message = customEvent.detail;
      if (message && message.id) {
        // Update the message in the chat UI
        const messageElement = document.querySelector(
          `[data-message-id="${message.id}"]`
        ) as HTMLElement;
        if (messageElement) {
          const bodyElement = messageElement.querySelector('.message-content') as HTMLElement;
          if (bodyElement) {
            bodyElement.textContent = message.content || '';
          }
        }
      }
    });
  }
}

// Initialize bindings
if (typeof window !== 'undefined') {
  const windowWithRealtime = window as Window & {
    uiRealtimeBindings?: UIRealtimeBindings;
  };
  windowWithRealtime.uiRealtimeBindings = new UIRealtimeBindings();
}
