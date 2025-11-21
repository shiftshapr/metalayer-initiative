import type { Message } from '../types/index.js';

/**
 * MESSAGE DISPLAY DIAGNOSTIC
 * 
 * Diagnoses why messages are not displaying after loadChatHistory completes
 */

interface ChatMessagesState {
  exists: boolean;
  visible: string | null;
  opacity: string | null;
  display: string | null;
  isLoading: boolean | null;
  focusMode: string | null;
  childrenCount: number | null;
}

interface OverlayState {
  exists: boolean;
  hidden: boolean | null;
  visible: boolean | null;
}

interface MessageVisibility {
  id: string;
  visibility: string;
  opacity: string;
  display: string;
}

interface MessagesState {
  count: number;
  ids: string[];
  visible: MessageVisibility[];
}

interface LoadingState {
  flag: boolean | string;
  isLoadingChatHistory: boolean | string;
}

interface CurrentChatDataMessage {
  id: string;
  body: string;
  hasReplies: boolean;
  replyCount: number;
}

interface CurrentChatDataState {
  exists: boolean;
  count: number;
  messages: CurrentChatDataMessage[];
}

interface LastLoadedUriState {
  value: string | unknown;
  currentPageId: string | null;
}

interface DiagnosticResults {
  timestamp: string;
  chatMessages: ChatMessagesState | null;
  overlay: OverlayState | null;
  messages: MessagesState;
  isLoading: LoadingState | null;
  currentChatData: CurrentChatDataState | null;
  lastLoadedUri: LastLoadedUriState | null;
}

interface DiagnosticOutput {
  results: DiagnosticResults;
  analysis: string[];
}

function diagnoseMessageDisplay(): DiagnosticOutput {
  const results: DiagnosticResults = {
    timestamp: new Date().toISOString(),
    chatMessages: null,
    overlay: null,
    messages: {
      count: 0,
      ids: [],
      visible: []
    },
    isLoading: null,
    currentChatData: null,
    lastLoadedUri: null
  };
  
  // Check chat messages container
  const chatMessages = document.querySelector('.chat-messages') as HTMLElement | null;
  if (chatMessages) {
    const computedStyle = window.getComputedStyle(chatMessages);
    results.chatMessages = {
      exists: true,
      visible: computedStyle.visibility,
      opacity: computedStyle.opacity,
      display: computedStyle.display,
      isLoading: chatMessages.classList.contains('is-loading'),
      focusMode: chatMessages.dataset.focusMode || null,
      childrenCount: chatMessages.children.length
    };
    
    // Check overlay
    const overlay = chatMessages.querySelector('.chat-loading-overlay') as HTMLElement | null;
    if (overlay) {
      const overlayStyle = window.getComputedStyle(overlay);
      results.overlay = {
        exists: true,
        hidden: overlay.classList.contains('hidden'),
        visible: overlayStyle.display !== 'none'
      };
    } else {
      results.overlay = {
        exists: false,
        hidden: null,
        visible: null
      };
    }
    
    // Check messages in DOM
    const messageElements = chatMessages.querySelectorAll('.message');
    results.messages = {
      count: messageElements.length,
      ids: Array.from(messageElements).map(el => {
        const element = el as HTMLElement;
        return element.dataset.messageId || element.id || '';
      }).filter(Boolean),
      visible: Array.from(messageElements).map(el => {
        const element = el as HTMLElement;
        const style = window.getComputedStyle(element);
        return {
          id: element.dataset.messageId || element.id || '',
          visibility: style.visibility,
          opacity: style.opacity,
          display: style.display
        };
      })
    };
  } else {
    results.chatMessages = {
      exists: false,
      visible: null,
      opacity: null,
      display: null,
      isLoading: null,
      focusMode: null,
      childrenCount: null
    };
  }
  
  // Check loading state
  results.isLoading = {
    flag: typeof window.__isLoadingChatHistory !== 'undefined' && window.__isLoadingChatHistory 
      ? window.__isLoadingChatHistory() 
      : 'function not available',
    isLoadingChatHistory: typeof window.isLoadingChatHistory !== 'undefined' 
      ? window.isLoadingChatHistory 
      : 'not exposed'
  };
  
  // Check currentChatData
  const currentChatData = window.currentChatData;
  const isArray = Array.isArray(currentChatData);
  const messageRecords: Message[] = (() => {
    if (isArray) {
      return currentChatData as Message[];
    }
    if (currentChatData && typeof currentChatData === 'object') {
      return Object.values(currentChatData).flatMap(value => Array.isArray(value) ? value : []);
    }
    return [];
  })();

  results.currentChatData = {
    exists: typeof currentChatData !== 'undefined' && currentChatData !== null,
    count: isArray ? (currentChatData as Message[]).length : (currentChatData ? Object.keys(currentChatData).length : 0),
    messages: messageRecords.map(message => {
      const extendedMessage = message as Message & { body?: string; hasReplies?: boolean; replyCount?: number };
      const bodyText = (typeof extendedMessage.body === 'string' && extendedMessage.body) ? extendedMessage.body : message.content;
      return {
        id: String(message.id || ''),
        body: bodyText ? bodyText.substring(0, 50) : '',
        hasReplies: Boolean(extendedMessage.hasReplies) || Boolean(extendedMessage.replyCount),
        replyCount: typeof extendedMessage.replyCount === 'number' ? extendedMessage.replyCount : 0
      };
    })
  };
  
  // Check last loaded URI
  results.lastLoadedUri = {
    value: typeof window.lastLoadedUri !== 'undefined' ? window.lastLoadedUri : 'not exposed',
    currentPageId: window.currentUrlData?.pageId || null
  };
  
  console.log('🔍 MESSAGE_DIAG: Diagnostic results:', results);
  
  // Analysis
  const analysis: string[] = [];
  
  if (!results.chatMessages || !results.chatMessages.exists) {
    analysis.push('❌ CRITICAL: .chat-messages container not found in DOM');
  }
  
  if (results.chatMessages && results.chatMessages.isLoading) {
    analysis.push('⚠️ WARNING: chat-messages has is-loading class - overlay may be blocking');
  }
  
  if (results.overlay && !results.overlay.hidden && results.overlay.visible) {
    analysis.push('⚠️ WARNING: Loading overlay is visible and not hidden - blocking messages');
  }
  
  if (results.messages.count === 0 && results.currentChatData && results.currentChatData.count > 0) {
    analysis.push('❌ CRITICAL: Messages exist in currentChatData but not in DOM');
  }
  
  if (results.messages.count === 0 && results.currentChatData && results.currentChatData.count === 0) {
    analysis.push('ℹ️ INFO: No messages in DOM or currentChatData - empty state expected');
  }
  
  if (results.isLoading && results.isLoading.flag === true) {
    analysis.push('⚠️ WARNING: isLoadingChatHistory is still true - loading may not have completed');
  }
  
  if (results.messages.count > 0) {
    const hiddenMessages = results.messages.visible.filter(m => 
      m.visibility === 'hidden' || m.opacity === '0' || m.display === 'none'
    );
    if (hiddenMessages.length > 0) {
      analysis.push(`⚠️ WARNING: ${hiddenMessages.length} messages are hidden in DOM`);
    }
  }
  
  console.log('🔍 MESSAGE_DIAG: Analysis:', analysis);
  
  return { results, analysis };
}

// Attach to window if available (for browser environment)
if (typeof window !== 'undefined') {
  window.diagnoseMessageDisplay = diagnoseMessageDisplay;
}

console.log('✅ MESSAGE_DIAG: Diagnostic complete. Call diagnoseMessageDisplay() to run again.');

// ES Module exports
export { diagnoseMessageDisplay };
export type { DiagnosticOutput, DiagnosticResults };

