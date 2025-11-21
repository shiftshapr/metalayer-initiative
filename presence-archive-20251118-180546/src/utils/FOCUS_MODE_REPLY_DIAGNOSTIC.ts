/**
 * FOCUS MODE REPLY DIAGNOSTIC
 * 
 * Diagnoses why replies don't load in focus mode despite showing in default view.
 * Traces communityId resolution and message data structure.
 */

import type { Message } from '../types/index.js';

export interface DiagnosticLogEntry {
  time: string;
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface MessageData {
  id?: string;
  communityId?: string;
  pageId?: string;
  parentId?: string;
  hasReplies?: boolean;
  replyCount?: number;
  error?: string;
  database?: MessageData;
  currentChatData?: MessageData | null;
  dom?: {
    dataset: {
      messageId?: string;
      communityId?: string;
      pageId?: string;
      hasReplies?: string;
      replyCount?: string;
    };
  } | null;
}

export interface CommunityIdResolution {
  step1MsgCommunityId: string | null;
  step2MessageCommunityId: string | null;
  step3ActiveCommunities: string | null;
  final: string | null;
}

export interface ReplyLoading {
  replyCount?: number;
  replies?: unknown[];
  queryParams?: {
    parentId: string;
    pageId: string;
    communityId: string;
  };
  error?: string;
}

export interface FocusModeState {
  hasFocusModeClass: boolean;
  dataset: {
    focusMode?: string;
    focusMessageId?: string;
  };
  activeCommunities?: string[];
  currentPageId?: string;
}

export interface DiagnosticResults {
  messageId: string;
  messageData: MessageData;
  communityIdResolution: CommunityIdResolution;
  replyLoading: ReplyLoading;
  recommendations: string[];
  focusModeState?: FocusModeState;
  error?: string;
  stack?: string;
}

export interface DiagnosticSummary {
  totalEvents: number;
  errors: number;
}

export interface DiagnosticData {
  logs: DiagnosticLogEntry[];
  summary: DiagnosticSummary;
}

const DIAGNOSTIC_FLAG = '__focusModeReplyDiagnosticActive';

const logs: DiagnosticLogEntry[] = [];
const startTime = performance.now();

function log(event: string, data: Record<string, unknown> = {}): void {
  const timestamp = (performance.now() - startTime).toFixed(2);
  const entry: DiagnosticLogEntry = {
    time: timestamp,
    event,
    timestamp: new Date().toISOString(),
    ...data
  };
  logs.push(entry);
  console.log(`🔍 FOCUS_DIAG: [${timestamp}ms] ${event}`, data);
}

// Diagnostic function to trace focus mode reply loading
export async function diagnoseFocusModeReplies(messageId: string): Promise<DiagnosticResults> {
  log('DIAGNOSTIC_START', { messageId });

  if (typeof window === 'undefined' || !window.supabase) {
    log('ERROR', { message: 'Supabase client not available' });
    return { 
      messageId,
      messageData: {},
      communityIdResolution: {
        step1MsgCommunityId: null,
        step2MessageCommunityId: null,
        step3ActiveCommunities: null,
        final: null
      },
      replyLoading: {},
      recommendations: [],
      error: 'Supabase client not available' 
    };
  }

  const results: DiagnosticResults = {
    messageId,
    messageData: {},
    communityIdResolution: {
      step1MsgCommunityId: null,
      step2MessageCommunityId: null,
      step3ActiveCommunities: null,
      final: null
    },
    replyLoading: {},
    recommendations: []
  };

  try {
    // Step 1: Get message from database
    log('STEP_1', { check: 'Get message from database' });
    const { data: dbMessage, error: dbError } = await (window.supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single() as any) as { data: Record<string, unknown> | null; error: { message: string } | null };

    if (dbError) {
      log('ERROR', { step: 'STEP_1', error: dbError });
      results.messageData.error = dbError.message;
    } else if (dbMessage) {
      log('STEP_1_RESULT', { message: dbMessage });
      results.messageData.database = {
        id: String(dbMessage.id || ''),
        communityId: String(dbMessage.community_id || dbMessage.communityId || ''),
        pageId: String(dbMessage.page_id || dbMessage.pageId || ''),
        parentId: String(dbMessage.parent_id || dbMessage.parentId || ''),
        hasReplies: Boolean(dbMessage.hasReplies),
        replyCount: Number(dbMessage.replyCount || 0)
      };
    }

    // Step 2: Check message in currentChatData
    log('STEP_2', { check: 'Check message in currentChatData' });
    const currentChatData = window.currentChatData;
    const messageInChat = Array.isArray(currentChatData) 
      ? currentChatData.find(m => m.id === messageId)
      : (currentChatData && typeof currentChatData === 'object' ? (currentChatData as Record<string, Message[]>)[messageId] : undefined);
    if (messageInChat) {
      const msg = Array.isArray(messageInChat) ? messageInChat[0] : messageInChat;
      log('STEP_2_RESULT', { message: msg });
      results.messageData.currentChatData = {
        id: msg.id,
        communityId: msg.communityId,
        pageId: msg.pageId,
        hasReplies: (msg as Message & { hasReplies?: boolean }).hasReplies,
        replyCount: (msg as Message & { replyCount?: number }).replyCount
      };
    } else {
      log('STEP_2_RESULT', { message: 'Not found in currentChatData' });
      results.messageData.currentChatData = null;
    }

    // Step 3: Check message in DOM
    log('STEP_3', { check: 'Check message in DOM' });
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement | null;
    if (messageElement) {
      const domData = {
        dataset: {
          messageId: messageElement.dataset.messageId,
          communityId: messageElement.dataset.communityId,
          pageId: messageElement.dataset.pageId,
          hasReplies: messageElement.dataset.hasReplies,
          replyCount: messageElement.dataset.replyCount
        }
      };
      log('STEP_3_RESULT', { domData });
      results.messageData.dom = domData;
    } else {
      log('STEP_3_RESULT', { message: 'Not found in DOM' });
      results.messageData.dom = null;
    }

    // Step 4: Trace communityId resolution
    log('STEP_4', { check: 'Trace communityId resolution' });
    const resolutionSteps: CommunityIdResolution = {
      step1MsgCommunityId: null,
      step2MessageCommunityId: null,
      step3ActiveCommunities: null,
      final: null
    };

    // Simulate the resolution logic from addMessageToFocus
    const msgRaw = messageInChat || (dbMessage as MessageData) || {};
    const msg = Array.isArray(msgRaw) ? msgRaw[0] : (typeof msgRaw === 'object' && msgRaw !== null ? msgRaw : {});
    const messageRaw = messageInChat || (dbMessage as MessageData) || {};
    const message = Array.isArray(messageRaw) ? messageRaw[0] : (typeof messageRaw === 'object' && messageRaw !== null ? messageRaw : {});
    
    resolutionSteps.step1MsgCommunityId = ((msg as Message & MessageData).communityId || (msg as Record<string, unknown>).community_id as string) || null;
    resolutionSteps.step2MessageCommunityId = ((message as Message & MessageData).communityId || (message as Record<string, unknown>).community_id as string) || null;
    resolutionSteps.step3ActiveCommunities = (window.activeCommunities && window.activeCommunities[0]) || null;
    
    resolutionSteps.final = (msg.communityId || message.communityId || 
                            (msg as Record<string, unknown>).community_id as string || 
                            (message as Record<string, unknown>).community_id as string ||
                            (window.activeCommunities && window.activeCommunities[0])) || null;

    log('STEP_4_RESULT', resolutionSteps as unknown as Record<string, unknown>);
    results.communityIdResolution = resolutionSteps;

    // Step 5: Check if replies exist in database
    log('STEP_5', { check: 'Check replies in database' });
    if (dbMessage) {
      const dbMsg = dbMessage as Record<string, unknown>;
      // Use type assertion for complex Supabase query chain
      const query = (window.supabase
        .from('messages')
        .select('*')
        .eq('parent_id', messageId) as any)
        .eq('page_id', dbMsg.page_id || dbMsg.pageId)
        .eq('community_id', dbMsg.community_id || dbMsg.communityId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      const { data: replies, error: repliesError } = await query as { data: unknown[] | null; error: { message: string } | null };

      if (repliesError) {
        log('ERROR', { step: 'STEP_5', error: repliesError });
        results.replyLoading.error = repliesError.message;
      } else {
        log('STEP_5_RESULT', { replyCount: replies?.length || 0, replies });
        results.replyLoading = {
          replyCount: replies?.length || 0,
          replies: replies || [],
          queryParams: {
            parentId: messageId,
            pageId: String(dbMsg.page_id || dbMsg.pageId || ''),
            communityId: String(dbMsg.community_id || dbMsg.communityId || '')
          }
        };
      }
    }

    // Step 6: Analyze the issue
    log('STEP_6', { check: 'Analyze issue' });
    
    if (!resolutionSteps.final) {
      results.recommendations.push('❌ CRITICAL: communityId cannot be resolved');
      results.recommendations.push(`   - msg.communityId: ${resolutionSteps.step1MsgCommunityId || 'missing'}`);
      results.recommendations.push(`   - message.communityId: ${resolutionSteps.step2MessageCommunityId || 'missing'}`);
      results.recommendations.push(`   - window.activeCommunities[0]: ${resolutionSteps.step3ActiveCommunities || 'missing'}`);
      
      if (dbMessage && (dbMessage as Record<string, unknown>).community_id) {
        results.recommendations.push(`✅ SOLUTION: Use dbMessage.communityId: ${(dbMessage as Record<string, unknown>).community_id}`);
        results.recommendations.push('   Fix: Query message from database if communityId missing from message object');
      }
    } else {
      results.recommendations.push(`✅ communityId resolved: ${resolutionSteps.final}`);
    }

    if (results.replyLoading.replyCount && results.replyLoading.replyCount > 0 && !resolutionSteps.final) {
      results.recommendations.push('⚠️ WARNING: Replies exist in database but cannot load due to missing communityId');
    }

    // Step 7: Check focus mode state
    log('STEP_7', { check: 'Check focus mode state' });
    const chatMessages = document.querySelector('.chat-messages') as HTMLElement | null;
    const focusModeState: FocusModeState = {
      hasFocusModeClass: chatMessages?.classList.contains('focus-mode-active') || false,
      dataset: {
        focusMode: chatMessages?.dataset.focusMode,
        focusMessageId: chatMessages?.dataset.focusMessageId
      },
      activeCommunities: window.activeCommunities,
      currentPageId: window.currentUrlData?.pageId || window.currentPage?.pageId
    };
    log('STEP_7_RESULT', focusModeState as unknown as Record<string, unknown>);
    results.focusModeState = focusModeState;

    log('DIAGNOSTIC_COMPLETE', results as unknown as Record<string, unknown>);
    return results;

  } catch (err) {
    const error = err as Error;
    log('ERROR', { error: error.message, stack: error.stack });
    return { 
      messageId,
      messageData: {},
      communityIdResolution: {
        step1MsgCommunityId: null,
        step2MessageCommunityId: null,
        step3ActiveCommunities: null,
        final: null
      },
      replyLoading: {},
      recommendations: [],
      error: error.message, 
      stack: error.stack 
    };
  }
}

// Export diagnostic data
export function getFocusModeReplyDiagnostic(): DiagnosticData {
  return {
    logs,
    summary: {
      totalEvents: logs.length,
      errors: logs.filter(l => l.event === 'ERROR').length
    }
  };
}

// Attach to window if available (for browser environment)
if (typeof window !== 'undefined') {
  if (!window[DIAGNOSTIC_FLAG]) {
    window[DIAGNOSTIC_FLAG] = true;
    window.diagnoseFocusModeReplies = diagnoseFocusModeReplies;
    window.getFocusModeReplyDiagnostic = getFocusModeReplyDiagnostic;
    
    log('DIAGNOSTIC_LOADED', { timestamp: new Date().toISOString() });
    console.log('✅ FOCUS_DIAG: Diagnostic script loaded. Use window.diagnoseFocusModeReplies(messageId) to diagnose.');
  }
}
