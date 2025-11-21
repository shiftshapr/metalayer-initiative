/**
 * DEFAULT VS FOCUS MODE DIAGNOSTIC
 * 
 * Compares default mode (where replies are detected) vs focus mode (where replies don't display)
 * to identify why replies show in default but not in focus mode.
 */

import type { Message } from '../types/index.js';

interface ChatMessage {
  id: string;
  hasReplies?: boolean;
  replyCount?: number;
  parentId?: string | null;
  isReply?: boolean;
}

interface MessageElement {
  id: string;
  isReply: boolean;
  hasRepliesIndicator?: boolean;
  replyCountText?: string | null;
  visible: boolean;
  display: string;
  parentId?: string | null;
}

interface ReplyInfo {
  messageId: string;
  replyCount?: string | null;
  hasReplies?: boolean;
  replyCountText?: string | null;
  id?: string;
  parentId?: string | null;
  visible?: boolean;
}

interface ChatMessagesState {
  exists: boolean;
  focusMode: string;
  isLoading: boolean;
  childrenCount: number;
}

interface DefaultModeState {
  timestamp: string;
  mode: 'default';
  chatMessages: ChatMessagesState | null;
  messages: MessageElement[];
  replies: ReplyInfo[];
  currentChatData: ChatMessage[] | null;
  replyCounts: Record<string, { hasReplies: boolean; replyCount: number }>;
  hasReplies: Record<string, boolean>;
}

interface FocusModeState {
  timestamp: string;
  mode: 'focus';
  chatMessages: ChatMessagesState | null;
  focusedMessage: { id: string; hasRepliesIndicator: boolean; replyCountText: string | null } | null;
  messages: MessageElement[];
  replies: ReplyInfo[];
  replyLoader: { available: boolean; loadAllReplies: boolean } | null;
  currentChatData: ChatMessage[] | null;
}

interface Comparison {
  type: string;
  default?: string;
  focus?: string;
  issue: string;
  messageId?: string;
}

interface DiagnosticState {
  defaultMode: DefaultModeState | null;
  focusMode: FocusModeState | null;
  comparisons: Comparison[];
}

type WindowWithDiagnostics = Window & {
  currentChatData?: ChatMessage[] | Record<string, any>;
  ReplyLoader?: {
    loadAllReplies: () => void;
  };
}

console.log('🔍 DEFAULT_VS_FOCUS: Starting diagnostic...');

let diagnosticState: DiagnosticState = {
  defaultMode: null,
  focusMode: null,
  comparisons: []
};

function captureDefaultModeState(): DefaultModeState {
  const state: DefaultModeState = {
    timestamp: new Date().toISOString(),
    mode: 'default',
    chatMessages: null,
    messages: [],
    replies: [],
    currentChatData: null,
    replyCounts: {},
    hasReplies: {}
  };
  
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    state.chatMessages = {
      exists: true,
      focusMode: chatMessages.getAttribute('data-focus-mode') || 'false',
      isLoading: chatMessages.classList.contains('is-loading'),
      childrenCount: chatMessages.children.length
    };
    
    // Get all messages
    const messageElements = chatMessages.querySelectorAll('.message');
    state.messages = Array.from(messageElements).map(el => {
      const element = el as HTMLElement;
      const messageId = element.dataset.messageId || element.id;
      const isReply = element.classList.contains('message-reply');
      const hasRepliesIndicator = element.querySelector('.reply-count, .has-replies');
      
      const computed = window.getComputedStyle(element);
      return {
        id: messageId,
        isReply,
        hasRepliesIndicator: !!hasRepliesIndicator,
        replyCountText: hasRepliesIndicator?.textContent || null,
        visible: computed.visibility !== 'hidden',
        display: computed.display
      };
    });
    
    // Check for reply indicators
    messageElements.forEach(el => {
      const element = el as HTMLElement;
      const messageId = element.dataset.messageId || element.id;
      if (messageId) {
        const replyCountEl = element.querySelector('.reply-count');
        const hasRepliesEl = element.querySelector('.has-replies');
        
        if (replyCountEl || hasRepliesEl) {
          state.replies.push({
            messageId,
            replyCount: replyCountEl?.textContent || null,
            hasReplies: !!hasRepliesEl,
            replyCountText: replyCountEl?.textContent || hasRepliesEl?.textContent || null
          });
        }
      }
    });
  }
  
  // Check currentChatData
  const win = window as unknown as WindowWithDiagnostics;
  if (win.currentChatData && Array.isArray(win.currentChatData)) {
    state.currentChatData = win.currentChatData.map((m: any) => ({
      id: m.id,
      hasReplies: m.hasReplies,
      replyCount: m.replyCount,
      parentId: m.parentId,
      isReply: m.isReply
    }));
    
    // Build reply counts
    win.currentChatData.forEach(m => {
      const msg = m as Message & { isReply?: boolean; hasReplies?: boolean; replyCount?: number };
      if (!msg.isReply && (msg.hasReplies || (msg.replyCount && msg.replyCount > 0))) {
        state.replyCounts[msg.id] = {
          hasReplies: msg.hasReplies || false,
          replyCount: msg.replyCount || 0
        };
      }
    });
  }
  
  return state;
}

function captureFocusModeState(): FocusModeState {
  const state: FocusModeState = {
    timestamp: new Date().toISOString(),
    mode: 'focus',
    chatMessages: null,
    focusedMessage: null,
    messages: [],
    replies: [],
    replyLoader: null,
    currentChatData: null
  };
  
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    state.chatMessages = {
      exists: true,
      focusMode: chatMessages.getAttribute('data-focus-mode') || 'false',
      isLoading: chatMessages.classList.contains('is-loading'),
      childrenCount: chatMessages.children.length
    };
    
    // Get focused message
    const focusedMessageEl = chatMessages.querySelector('.message:not(.message-reply)');
    if (focusedMessageEl) {
      const element = focusedMessageEl as HTMLElement;
      const focusedId = element.dataset.messageId || element.id;
      const replyCountEl = element.querySelector('.reply-count');
      state.focusedMessage = {
        id: focusedId,
        hasRepliesIndicator: !!element.querySelector('.reply-count, .has-replies'),
        replyCountText: replyCountEl?.textContent || null
      };
    }
    
    // Get all messages (including replies)
    const messageElements = chatMessages.querySelectorAll('.message');
    state.messages = Array.from(messageElements).map(el => {
      const element = el as HTMLElement;
      const messageId = element.dataset.messageId || element.id;
      const isReply = element.classList.contains('message-reply');
      const computed = window.getComputedStyle(element);
      
      return {
        id: messageId,
        isReply,
        visible: computed.visibility !== 'hidden',
        display: computed.display,
        parentId: element.dataset.parentId || null
      };
    });
    
    // Get replies
    const replyElements = chatMessages.querySelectorAll('.message-reply');
    state.replies = Array.from(replyElements).map(el => {
      const element = el as HTMLElement;
      const computed = window.getComputedStyle(element);
      return {
        messageId: element.dataset.messageId || element.id,
        id: element.dataset.messageId || element.id,
        parentId: element.dataset.parentId || null,
        visible: computed.visibility !== 'hidden',
        display: computed.display
      };
    });
  }
  
  // Check ReplyLoader
  const win = window as unknown as WindowWithDiagnostics;
  if (win.ReplyLoader) {
    state.replyLoader = {
      available: true,
      loadAllReplies: typeof win.ReplyLoader.loadAllReplies === 'function'
    };
  }
  
  // Check currentChatData
  if (win.currentChatData) {
    state.currentChatData = win.currentChatData.map((m: Message | ChatMessage) => {
      const msg = m as Message & { hasReplies?: boolean; replyCount?: number; isReply?: boolean };
      return {
        id: msg.id,
        hasReplies: msg.hasReplies,
        replyCount: msg.replyCount,
        parentId: msg.parentId,
        isReply: msg.isReply
      };
    });
  }
  
  return state;
}

function compareStates(defaultState: DefaultModeState, focusState: FocusModeState): Comparison[] {
  const comparisons: Comparison[] = [];
  
  // Compare reply detection
  if (defaultState.replyCounts && Object.keys(defaultState.replyCounts).length > 0) {
    const defaultReplyMessages = Object.keys(defaultState.replyCounts);
    comparisons.push({
      type: 'reply_detection',
      default: `Found ${defaultReplyMessages.length} messages with replies in default mode`,
      focus: `Found ${focusState.replies.length} replies in DOM in focus mode`,
      issue: defaultReplyMessages.length > 0 && focusState.replies.length === 0 ? 
        '❌ Replies detected in default mode but not displayed in focus mode' : 
        '✅ Reply counts match'
    });
    
    // Check specific messages
    defaultReplyMessages.forEach(msgId => {
      const defaultInfo = defaultState.replyCounts[msgId];
      const focusReply = focusState.replies.find(r => r.parentId === msgId);
      
      comparisons.push({
        type: 'message_reply_check',
        messageId: msgId,
        default: `hasReplies: ${defaultInfo.hasReplies}, replyCount: ${defaultInfo.replyCount}`,
        focus: focusReply ? `Reply found in DOM (visible: ${focusReply.visible})` : '❌ No reply in DOM',
        issue: !focusReply ? `❌ Message ${msgId} has replies in default mode but no replies in focus mode DOM` : '✅ Reply found'
      });
    });
  }
  
  // Compare currentChatData
  if (defaultState.currentChatData && focusState.currentChatData) {
    const defaultWithReplies = defaultState.currentChatData.filter(m => m.hasReplies || (m.replyCount && m.replyCount > 0));
    const focusWithReplies = focusState.currentChatData.filter(m => m.hasReplies || (m.replyCount && m.replyCount > 0));
    
    comparisons.push({
      type: 'chat_data_comparison',
      default: `${defaultWithReplies.length} messages with replies in currentChatData`,
      focus: `${focusWithReplies.length} messages with replies in currentChatData`,
      issue: defaultWithReplies.length !== focusWithReplies.length ? 
        '❌ Reply counts differ between modes' : 
        '✅ Reply counts match in currentChatData'
    });
  }
  
  // Compare DOM state
  comparisons.push({
    type: 'dom_state',
    default: `${defaultState.messages.length} messages in DOM`,
    focus: `${focusState.messages.length} messages in DOM (${focusState.replies.length} replies)`,
    issue: focusState.replies.length === 0 && defaultState.replyCounts && Object.keys(defaultState.replyCounts).length > 0 ?
      '❌ Replies exist in default mode but not in focus mode DOM' :
      '✅ DOM state consistent'
  });
  
  return comparisons;
}

export function runDiagnostic(): DefaultModeState | { defaultState: DefaultModeState; focusState: FocusModeState; comparisons: Comparison[] } {
  console.log('🔍 DEFAULT_VS_FOCUS: Capturing default mode state...');
  const defaultState = captureDefaultModeState();
  diagnosticState.defaultMode = defaultState;
  
  console.log('🔍 DEFAULT_VS_FOCUS: Default mode state:', defaultState);
  
  // Wait for focus mode if not already in it
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages?.getAttribute('data-focus-mode') !== 'true') {
    console.log('ℹ️ DEFAULT_VS_FOCUS: Not in focus mode. Click a message to enter focus mode, then call compareWithFocusMode()');
    return defaultState;
  }
  
  console.log('🔍 DEFAULT_VS_FOCUS: Capturing focus mode state...');
  const focusState = captureFocusModeState();
  diagnosticState.focusMode = focusState;
  
  console.log('🔍 DEFAULT_VS_FOCUS: Focus mode state:', focusState);
  
  const comparisons = compareStates(defaultState, focusState);
  diagnosticState.comparisons = comparisons;
  
  console.log('🔍 DEFAULT_VS_FOCUS: Comparisons:', comparisons);
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 DEFAULT VS FOCUS MODE DIAGNOSTIC SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  comparisons.forEach(comp => {
    console.log(`\n${comp.type.toUpperCase()}:`);
    console.log(`  Default: ${comp.default}`);
    console.log(`  Focus: ${comp.focus}`);
    console.log(`  ${comp.issue}`);
  });
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  return { defaultState, focusState, comparisons };
}

export function compareWithFocusMode(): { defaultState: DefaultModeState; focusState: FocusModeState; comparisons: Comparison[] } | void {
  if (!diagnosticState.defaultMode) {
    console.log('⚠️ DEFAULT_VS_FOCUS: Default mode state not captured. Call runDiagnostic() first in default mode.');
    return;
  }
  
  const focusState = captureFocusModeState();
  diagnosticState.focusMode = focusState;
  
  const comparisons = compareStates(diagnosticState.defaultMode, focusState);
  diagnosticState.comparisons = comparisons;
  
  console.log('🔍 DEFAULT_VS_FOCUS: Focus mode comparison:', comparisons);
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 DEFAULT VS FOCUS MODE COMPARISON');
  console.log('═══════════════════════════════════════════════════════════');
  comparisons.forEach(comp => {
    console.log(`\n${comp.type.toUpperCase()}:`);
    console.log(`  Default: ${comp.default}`);
    console.log(`  Focus: ${comp.focus}`);
    console.log(`  ${comp.issue}`);
  });
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  return { defaultState: diagnosticState.defaultMode, focusState, comparisons };
}

export function getDiagnosticState(): DiagnosticState {
  return diagnosticState;
}

// Auto-run if in default mode
function autoRunDiagnostic(): void {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) {
    // Retry if chat messages container not ready yet
    setTimeout(autoRunDiagnostic, 1000);
    return;
  }
  
  if (chatMessages.getAttribute('data-focus-mode') !== 'true') {
    // In default mode - capture state
    console.log('🔍 DEFAULT_VS_FOCUS: Auto-running diagnostic in default mode...');
    runDiagnostic();
  } else {
    // In focus mode - compare if we have default state
    if (diagnosticState.defaultMode) {
      console.log('🔍 DEFAULT_VS_FOCUS: Auto-comparing with focus mode...');
      compareWithFocusMode();
    }
  }
}

// Watch for focus mode changes
let lastFocusMode: boolean | null = null;
function watchFocusMode(): void {
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    const currentFocusMode = chatMessages.getAttribute('data-focus-mode') === 'true';
    if (currentFocusMode !== lastFocusMode) {
      lastFocusMode = currentFocusMode;
      if (currentFocusMode && diagnosticState.defaultMode) {
        // Just entered focus mode - auto-compare
        setTimeout(() => {
          console.log('🔍 DEFAULT_VS_FOCUS: Detected focus mode entry, auto-comparing...');
          compareWithFocusMode();
        }, 1000);
      } else if (!currentFocusMode) {
        // Just exited focus mode - capture default state again
        setTimeout(() => {
          console.log('🔍 DEFAULT_VS_FOCUS: Detected exit from focus mode, capturing default state...');
          runDiagnostic();
        }, 500);
      }
    }
  }
  setTimeout(watchFocusMode, 500);
}

// Initial run
if (typeof document !== 'undefined') {
  if (document.readyState === 'complete') {
    setTimeout(autoRunDiagnostic, 2000);
    watchFocusMode();
  } else {
    window.addEventListener('load', () => {
      setTimeout(autoRunDiagnostic, 2000);
      watchFocusMode();
    });
  }
  
  console.log('✅ DEFAULT_VS_FOCUS: Diagnostic ready and auto-running. State captured automatically.');
}

