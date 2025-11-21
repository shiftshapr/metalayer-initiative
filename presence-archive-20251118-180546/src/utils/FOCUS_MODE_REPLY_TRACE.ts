/**
 * FOCUS MODE REPLY TRACE
 * 
 * Enhanced diagnostic to trace reply loading and DOM insertion in focus mode.
 */

export interface TraceEntry {
  time: string;
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface TraceSummary {
  totalEvents: number;
  replyLoaderCalls: number;
  replyLoaderResults: number;
  addMessageCalls: number;
  messagesInDOM: number;
  messagesNotInDOM: number;
}

export interface TraceData {
  traces: TraceEntry[];
  summary: TraceSummary;
}

interface ReplyLoader {
  loadAllReplies: (messageId: string, pageId: string, communityId: string) => Promise<unknown[]>;
}

declare global {
  interface Window {
    ReplyLoader?: ReplyLoader;
    addMessageToFocus?: (message: Record<string, unknown>, isReply?: boolean) => Promise<unknown>;
    getFocusModeReplyTrace?: () => TraceData;
    __focusModeReplyTraceActive?: boolean;
  }
}

const TRACE_FLAG = '__focusModeReplyTraceActive';

const traces: TraceEntry[] = [];
const startTime = performance.now();

function trace(event: string, data: Record<string, unknown> = {}): void {
  const timestamp = (performance.now() - startTime).toFixed(2);
  const entry: TraceEntry = {
    time: timestamp,
    event,
    timestamp: new Date().toISOString(),
    ...data
  };
  traces.push(entry);
  console.log(`🔍 FOCUS_TRACE: [${timestamp}ms] ${event}`, data);
}

// Wrap ReplyLoader.loadAllReplies
if (typeof window !== 'undefined' && window.ReplyLoader && window.ReplyLoader.loadAllReplies) {
  const originalLoadAllReplies = window.ReplyLoader.loadAllReplies;
  window.ReplyLoader.loadAllReplies = async function(messageId: string, pageId: string, communityId: string): Promise<unknown[]> {
    trace('REPLY_LOADER_CALLED', { messageId, pageId, communityId });
    
    try {
      const result = await originalLoadAllReplies.call(this, messageId, pageId, communityId);
      trace('REPLY_LOADER_RESULT', { 
        messageId, 
        replyCount: Array.isArray(result) ? result.length : 0, 
        replies: result 
      });
      return result;
    } catch (err) {
      const error = err as Error;
      trace('REPLY_LOADER_ERROR', { messageId, error: error.message, stack: error.stack });
      throw err;
    }
  };
}

// Wrap addMessageToFocus
if (typeof window !== 'undefined' && window.addMessageToFocus) {
  const originalAddMessageToFocus = window.addMessageToFocus;
  window.addMessageToFocus = async function(message: Record<string, unknown>, isReply = false): Promise<unknown> {
    trace('ADD_MESSAGE_TO_FOCUS_CALLED', { 
      messageId: message?.id, 
      isReply, 
      hasContent: !!message?.content,
      hasBody: !!message?.body
    });
    
    try {
      const result = await originalAddMessageToFocus.call(this, message, isReply);
      trace('ADD_MESSAGE_TO_FOCUS_RESULT', { 
        messageId: message?.id, 
        isReply,
        result 
      });
      
      // Check if message is in DOM after call
      setTimeout(() => {
        const messageId = String(message?.id || '');
        const domElement = document.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement | null;
        if (domElement) {
          trace('MESSAGE_IN_DOM', { 
            messageId: message?.id, 
            isReply,
            className: domElement.className,
            parentElement: domElement.parentElement?.className
          });
        } else {
          trace('MESSAGE_NOT_IN_DOM', { messageId: message?.id, isReply });
        }
      }, 100);
      
      return result;
    } catch (err) {
      const error = err as Error;
      trace('ADD_MESSAGE_TO_FOCUS_ERROR', { 
        messageId: message?.id, 
        isReply,
        error: error.message, 
        stack: error.stack 
      });
      throw err;
    }
  };
}

// Monitor DOM changes for reply elements
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node instanceof HTMLElement && node.classList && node.classList.contains('message')) {
        const messageId = (node as HTMLElement).dataset?.messageId;
        const isReply = node.classList.contains('message-reply');
        if (messageId) {
          trace('DOM_MESSAGE_ADDED', { 
            messageId, 
            isReply,
            parent: node.parentElement?.className,
            container: node.closest('.chat-messages')?.className
          });
        }
      }
    });
  });
});

// Start observing when focus mode is active
const startObserving = (): void => {
  const chatMessages = document.querySelector('.chat-messages') as HTMLElement | null;
  if (chatMessages && chatMessages.dataset.focusMode === 'true') {
    observer.observe(chatMessages, { childList: true, subtree: true });
    trace('DOM_OBSERVER_STARTED', { container: chatMessages.className });
  }
};

// Start observing once - no need to check periodically
startObserving();

// Only re-start if focus mode is activated (via event listener)
const chatMessages = document.querySelector('.chat-messages') as HTMLElement | null;
if (chatMessages) {
  const focusModeObserver = new MutationObserver(() => {
    if (chatMessages.dataset.focusMode === 'true' && !observer.takeRecords().length) {
      startObserving();
    }
  });
  focusModeObserver.observe(chatMessages, { attributes: true, attributeFilter: ['data-focus-mode'] });
}

// Export trace data
export function getFocusModeReplyTrace(): TraceData {
  return {
    traces,
    summary: {
      totalEvents: traces.length,
      replyLoaderCalls: traces.filter(t => t.event === 'REPLY_LOADER_CALLED').length,
      replyLoaderResults: traces.filter(t => t.event === 'REPLY_LOADER_RESULT').length,
      addMessageCalls: traces.filter(t => t.event === 'ADD_MESSAGE_TO_FOCUS_CALLED').length,
      messagesInDOM: traces.filter(t => t.event === 'MESSAGE_IN_DOM').length,
      messagesNotInDOM: traces.filter(t => t.event === 'MESSAGE_NOT_IN_DOM').length
    }
  };
}

// Attach to window if available (for browser environment)
if (typeof window !== 'undefined') {
  if (!window[TRACE_FLAG]) {
    window[TRACE_FLAG] = true;
    window.getFocusModeReplyTrace = getFocusModeReplyTrace;
    
    trace('TRACE_LOADED', { timestamp: new Date().toISOString() });
    console.log('✅ FOCUS_TRACE: Trace script loaded. Use window.getFocusModeReplyTrace() to view traces.');
  }
}
