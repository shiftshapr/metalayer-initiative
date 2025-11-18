/**
 * Chat Loading Overlay Patch (TypeScript)
 * Provides a persistent loading indicator with emergency cleanup paths.
 */

const PATCH_FLAG = '__chatLoadingOverlayPatched';
const MIN_CHAT_LOADING_DURATION = 800;

type LoadChatHistoryFn = (...args: any[]) => Promise<any>;
type AddMessageFn = (...args: any[]) => Promise<any>;

export interface ChatLoadingState {
  overlay: HTMLElement;
  startTime: number;
}

type ChatWindow = Window & {
  loadChatHistory?: LoadChatHistoryFn;
  addMessageToChat?: AddMessageFn;
  __isLoadingChatHistory?: () => boolean;
  __lastLoadStartTime?: number;
  forceHideChatLoadingOverlay?: () => void;
};

const getChatMessagesContainer = (doc: Document): HTMLElement | null =>
  doc.querySelector<HTMLElement>('.chat-messages');

const ensureOverlayContainer = (doc: Document, chatMessages: HTMLElement | null): HTMLElement | null => {
  if (!chatMessages) return null;

  const existingOverlays = chatMessages.querySelectorAll<HTMLElement>(':scope > .chat-loading-overlay');
  existingOverlays.forEach(overlay => overlay.remove());

  const overlay = doc.createElement('div');
  overlay.className = 'chat-loading-overlay';
  overlay.innerHTML = `
    <div class="chat-loading-indicator">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading messages...</div>
    </div>
  `;
  overlay.classList.remove('hidden');
  overlay.style.display = '';
  overlay.style.visibility = '';
  overlay.style.opacity = '';
  overlay.style.pointerEvents = '';
  chatMessages.appendChild(overlay);

  return overlay;
};

const showLoading = (doc: Document, chatMessages: HTMLElement | null): ChatLoadingState | null => {
  if (!chatMessages) return null;

  const existingEmptyState = chatMessages.querySelector('.empty-state-message');
  if (existingEmptyState) {
    existingEmptyState.remove();
    console.log('🔧 CHAT_PATCH: Removed empty state before showing loading');
  }

  const overlay = ensureOverlayContainer(doc, chatMessages);
  if (!overlay) {
    return null;
  }

  const startTime = performance.now();
  chatMessages.classList.add('is-loading');
  chatMessages.setAttribute('aria-busy', 'true');
  overlay.classList.remove('hidden');

  return { overlay, startTime };
};

const makeElementsVisible = (elements: NodeListOf<HTMLElement>): void => {
  elements.forEach(msg => {
    msg.style.setProperty('display', 'flex', 'important');
    msg.style.setProperty('visibility', 'visible', 'important');
    msg.style.setProperty('opacity', '1', 'important');
  });
};

export const forceHideAllOverlays = (domWindow: ChatWindow, doc: Document): void => {
  const chatMessages = getChatMessagesContainer(doc);
  if (!chatMessages) {
    console.warn('⚠️ CHAT_PATCH: forceHideAllOverlays called but .chat-messages not found');
    return;
  }

  const overlays = chatMessages.querySelectorAll<HTMLElement>(
    '.chat-loading-overlay, .chat-loading-indicator, .loading-spinner, [class*="loading"]'
  );
  overlays.forEach(overlay => {
    overlay.classList.add('hidden');
    overlay.setAttribute('style', 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;');
    overlay.remove();
  });

  chatMessages.classList.remove('is-loading');
  chatMessages.removeAttribute('aria-busy');
  chatMessages.style.setProperty('visibility', 'visible', 'important');
  chatMessages.style.setProperty('opacity', '1', 'important');
  chatMessages.style.setProperty('display', 'block', 'important');

  makeElementsVisible(chatMessages.querySelectorAll<HTMLElement>('.message, [data-message-id]'));
  console.log('🔧 CHAT_PATCH: Force-hid all overlays and made messages visible');
};

const hideLoading = async (
  domWindow: ChatWindow,
  doc: Document,
  chatMessages: HTMLElement | null,
  state: ChatLoadingState | null
): Promise<void> => {
  if (!chatMessages || !state) {
    console.warn('⚠️ CHAT_PATCH: hideLoading called without required params, forcing cleanup');
    forceHideAllOverlays(domWindow, doc);
    return;
  }

  const elapsed = performance.now() - state.startTime;
  const remainingTime = MIN_CHAT_LOADING_DURATION - elapsed;
  if (remainingTime > 0) {
    await new Promise(resolve => setTimeout(resolve, remainingTime));
  }

  const overlays = chatMessages.querySelectorAll<HTMLElement>('.chat-loading-overlay, .chat-loading-indicator, .loading-spinner');
  overlays.forEach(overlay => {
    overlay.classList.add('hidden');
    overlay.style.setProperty('display', 'none', 'important');
    overlay.style.setProperty('visibility', 'hidden', 'important');
    overlay.style.setProperty('opacity', '0', 'important');
    overlay.style.setProperty('pointer-events', 'none', 'important');
    overlay.remove();
  });

  chatMessages.classList.remove('is-loading');
  chatMessages.removeAttribute('aria-busy');
  makeElementsVisible(chatMessages.querySelectorAll<HTMLElement>('.message, [data-message-id]'));
  chatMessages.style.setProperty('visibility', 'visible', 'important');
  chatMessages.style.setProperty('opacity', '1', 'important');
  chatMessages.style.setProperty('display', 'block', 'important');

  chatMessages
    .querySelectorAll<HTMLElement>('[style*="visibility: hidden"], [style*="opacity: 0"]')
    .forEach(el => {
      if (!el.classList.contains('chat-loading-overlay') && !el.classList.contains('chat-loading-indicator')) {
        el.style.removeProperty('visibility');
        el.style.removeProperty('opacity');
      }
    });

  setTimeout(() => {
    const allMessagesAfterDelay = chatMessages.querySelectorAll<HTMLElement>('.message, [data-message-id]');
    if (allMessagesAfterDelay.length === 0) {
      const emptyState = doc.createElement('p');
      emptyState.className = 'empty-state-message';
      emptyState.style.cssText =
        'text-align: center; color: var(--text-secondary, #999); padding: 20px; visibility: visible !important; opacity: 1 !important; display: block !important;';
      emptyState.textContent = 'No messages yet. Be the first to start the conversation!';
      chatMessages.appendChild(emptyState);
    } else {
      chatMessages.querySelectorAll<HTMLElement>('.empty-state-message').forEach(message => message.remove());
    }
  }, 100);

  console.log('✅ CHAT_PATCH: Loading overlay hidden after', (performance.now() - state.startTime).toFixed(0), 'ms');
};

const wrapLoadChatHistory = (domWindow: ChatWindow, doc: Document): void => {
  if (typeof domWindow.loadChatHistory !== 'function') return;

  const originalLoadChatHistory = domWindow.loadChatHistory!;
  let activeLoadState: ChatLoadingState | null = null;

  domWindow.loadChatHistory = async function patchedLoadChatHistory(this: unknown, ...args: any[]) {
    const isAlreadyLoading = domWindow.__isLoadingChatHistory ? domWindow.__isLoadingChatHistory() : false;
    if (activeLoadState || isAlreadyLoading) {
      console.log('⚠️ CHAT_PATCH: Already loading, skipping duplicate call');
      return;
    }

    const chatMessages = getChatMessagesContainer(doc);
    const loadingState = showLoading(doc, chatMessages);
    activeLoadState = loadingState;
    domWindow.__lastLoadStartTime = performance.now();

    try {
      return await originalLoadChatHistory.apply(this, args);
    } catch (error) {
      console.error('❌ CHAT_PATCH: Error in loadChatHistory, forcing overlay cleanup:', error);
      if (chatMessages) {
        forceHideAllOverlays(domWindow, doc);
        chatMessages.style.visibility = 'visible';
        chatMessages.style.opacity = '1';
      }
      throw error;
    } finally {
      const cleanupTimeout = domWindow.setTimeout(() => {
        console.warn('⚠️ CHAT_PATCH: Cleanup timeout - forcing immediate overlay removal');
        forceHideAllOverlays(domWindow, doc);
      }, 2000);

      const container = getChatMessagesContainer(doc);
      if (loadingState && container) {
        try {
          await hideLoading(domWindow, doc, container, loadingState);
        } finally {
          domWindow.clearTimeout(cleanupTimeout);
        }
      } else {
        domWindow.clearTimeout(cleanupTimeout);
        forceHideAllOverlays(domWindow, doc);
      }
      activeLoadState = null;
    }
  };
  console.log('✅ CHAT_PATCH: Wrapped loadChatHistory with loading overlay');
};

const wrapAddMessageToChat = (domWindow: ChatWindow, doc: Document): void => {
  if (typeof domWindow.addMessageToChat !== 'function') return;
  const originalAddMessageToChat = domWindow.addMessageToChat!;

  domWindow.addMessageToChat = async function patchedAddMessageToChat(this: unknown, message: any) {
    const result = await originalAddMessageToChat.apply(this, arguments as any);
    ensureReplyVisible(doc, message);
    return result;
  };
  console.log('✅ CHAT_PATCH: Wrapped addMessageToChat with reply visibility check');
};

const ensureReplyVisible = (doc: Document, message: any): void => {
  if (!message || !message.isReply) return;
  const chatMessages = getChatMessagesContainer(doc);
  if (!chatMessages || chatMessages.dataset.focusMode !== 'true') {
    return;
  }

  const messageId = message.id || message.messageId;
  if (!messageId) return;

  const existing = chatMessages.querySelector(`[data-message-id="${CSS.escape(messageId)}"]`);
  if (!existing) {
    console.warn(`⚠️ CHAT_PATCH: Reply ${messageId} not found in DOM after addMessageToChat`);
  }
};

const startStuckOverlayWatcher = (domWindow: ChatWindow, doc: Document): void => {
  domWindow.setInterval(() => {
    const chatMessages = getChatMessagesContainer(doc);
    if (!chatMessages) return;

    const hasOverlay = chatMessages.querySelector('.chat-loading-overlay, .chat-loading-indicator, .loading-spinner');
    const isStuck = chatMessages.classList.contains('is-loading') || hasOverlay;

    if (isStuck) {
      const stuckTime = performance.now() - (domWindow.__lastLoadStartTime || 0);
      if (stuckTime > 5000) {
        console.warn('⚠️ CHAT_PATCH: Detected stuck overlay after 5 seconds, forcing cleanup');
        forceHideAllOverlays(domWindow, doc);
      }
    }
  }, 2000);
};

export const applyChatLoadingOverlayPatch = (domWindow: ChatWindow = window as ChatWindow): void => {
  if (typeof domWindow === 'undefined') {
    return;
  }
  if ((domWindow as any)[PATCH_FLAG]) {
    return;
  }
  (domWindow as any)[PATCH_FLAG] = true;

  const doc = domWindow.document;
  domWindow.forceHideChatLoadingOverlay = () => forceHideAllOverlays(domWindow, doc);

  const initialize = () => {
    wrapLoadChatHistory(domWindow, doc);
    wrapAddMessageToChat(domWindow, doc);
    startStuckOverlayWatcher(domWindow, doc);
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
};

if (typeof window !== 'undefined') {
  applyChatLoadingOverlayPatch(window as ChatWindow);
}

declare global {
  interface Window {
    forceHideChatLoadingOverlay?: () => void;
  }
}


