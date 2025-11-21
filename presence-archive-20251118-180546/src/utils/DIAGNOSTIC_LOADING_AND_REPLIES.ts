/**
 * DIAGNOSTIC SCRIPT: Loading Indicator & Reply Loading
 * 
 * Traces loading indicator behavior and reply loading failures
 * to identify root causes.
 */

// Type definitions
interface DiagnosticLogEntry {
  time: string;
  event: string;
  [key: string]: unknown;
}

interface DiagnosticSummary {
  totalEvents: number;
  loadChatHistoryCalls: number;
  overlayChanges: number;
  replyLoads: number;
  errors: number;
}

interface DiagnosticData {
  logs: DiagnosticLogEntry[];
  summary: DiagnosticSummary;
}

interface SupabaseQuery {
  select: (...args: unknown[]) => SupabaseQuery;
  eq: (column: string, value: unknown) => SupabaseQuery;
  is: (column: string, value: unknown) => SupabaseQuery;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseQuery;
}

interface SupabaseClient {
  from: (table: string) => SupabaseQuery;
}

// Declare window globals
declare const window: Window & {
  [key: string]: unknown;
  loadChatHistory?: ((communityIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>) | ((...args: unknown[]) => Promise<unknown>);
  ReplyLoader?: {
    loadAllReplies: (messageId: string, pageId: string, communityId?: string) => Promise<Array<Record<string, unknown>>>;
  };
  supabase?: SupabaseClient;
  getLoadingReplyDiagnostic?: () => DiagnosticData;
};

(function() {
  const DIAGNOSTIC_FLAG = '__loadingReplyDiagnosticActive';
  if ((window as Window & { [key: string]: unknown })[DIAGNOSTIC_FLAG]) return;
  (window as Window & { [key: string]: unknown })[DIAGNOSTIC_FLAG] = true;

  const logs: DiagnosticLogEntry[] = [];
  const startTime = performance.now();

  function log(event: string, data: Record<string, unknown> = {}): void {
    const timestamp = (performance.now() - startTime).toFixed(2);
    const entry: DiagnosticLogEntry = {
      time: timestamp,
      event,
      ...data
    };
    logs.push(entry);
    console.log(`🔍 DIAG_LOADING: [${timestamp}ms] ${event}`, data);
  }

  // Track loadChatHistory calls
  function trackLoadChatHistory(): void {
    if (typeof window.loadChatHistory !== 'function') {
      return;
    }

    const original = window.loadChatHistory!;
    let callCount = 0;
    window.loadChatHistory = async function(communityIdOrRawUrl?: string | null, activeCommunities?: string[]): Promise<void> {
      callCount++;
      const callId = `load-${callCount}`;
      log('loadChatHistory_START', { callId, callCount });
      
      const chatMessages = document.querySelector('.chat-messages');
      const overlayState = chatMessages?.querySelector('.chat-loading-overlay');
      const isVisible = overlayState && !overlayState.classList.contains('hidden');
      log('loadChatHistory_OVERLAY_STATE', { callId, hasOverlay: !!overlayState, isVisible });

      const startTime = performance.now();
      await original.call(this, communityIdOrRawUrl ?? undefined, activeCommunities);
      const duration = (performance.now() - startTime).toFixed(2);
      log('loadChatHistory_COMPLETE', { callId, duration: `${duration}ms`, success: true });
    };
  }

  // Track overlay visibility changes
  function trackOverlayVisibility(): void {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      return;
    }

    let lastState: string | null = null;
    
    const observer = new MutationObserver(() => {
      const overlay = chatMessages.querySelector('.chat-loading-overlay');
      const isVisible = overlay && !overlay.classList.contains('hidden');
      const hasLoadingClass = chatMessages.classList.contains('is-loading');
      const currentState = `${!!overlay}-${isVisible}-${hasLoadingClass}`;
      
      if (currentState !== lastState) {
        log('OVERLAY_VISIBILITY_CHANGE', {
          hasOverlay: !!overlay,
          isVisible,
          hasLoadingClass,
          classList: Array.from(chatMessages.classList)
        });
        lastState = currentState;
      }
    });

    observer.observe(chatMessages, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // Track reply loading
  function trackReplyLoading(): void {
    if (!window.ReplyLoader) {
      return;
    }

    const original = window.ReplyLoader.loadAllReplies;
    window.ReplyLoader.loadAllReplies = async function(
      messageId: string,
      pageId: string,
      communityId?: string
    ): Promise<any[]> {
      log('REPLY_LOAD_START', { messageId, pageId, communityId });
      
      if (pageId && typeof pageId === 'string') {
        const hasSpecialChars = /[^a-zA-Z0-9_-]/.test(pageId);
        log('REPLY_LOAD_PAGEID_CHECK', { pageId, hasSpecialChars, length: pageId.length });
      }

      const result = await original.call(this, messageId, pageId, communityId);
      log('REPLY_LOAD_SUCCESS', { messageId, replyCount: result?.length || 0 });
      return result;
    };
  }

  // Track Supabase queries
  function trackSupabaseQueries(): void {
    if (!window.supabase) {
      return;
    }

    const supabaseClient = window.supabase;
    const originalFrom = supabaseClient.from.bind(supabaseClient);
    supabaseClient.from = ((table: string) => {
      const queryBuilder = originalFrom(table);
      const query = queryBuilder as unknown as SupabaseQuery;
      const originalSelect = query.select;
      
      query.select = function(...args: unknown[]): SupabaseQuery {
        const selectQuery = originalSelect.apply(this, args) as unknown as SupabaseQuery;
        
        (['eq', 'is', 'order'] as const).forEach(method => {
          const selectQueryRecord = selectQuery as unknown as Record<string, (...args: unknown[]) => SupabaseQuery>;
          const originalMethod = selectQueryRecord[method];
          if (typeof originalMethod === 'function') {
            selectQueryRecord[method] = function(...methodArgs: unknown[]): SupabaseQuery {
              if (table === 'messages' && methodArgs[0] === 'page_id') {
                log('SUPABASE_QUERY_PAGEID', {
                  method,
                  value: methodArgs[1],
                  table
                });
              }
              return originalMethod.apply(this, methodArgs);
            };
          }
        });
        
        return selectQuery;
      };
      
      return queryBuilder;
    }) as typeof supabaseClient.from;
  }

  // Export diagnostic data
  function getLoadingReplyDiagnostic(): DiagnosticData {
    return {
      logs,
      summary: {
        totalEvents: logs.length,
        loadChatHistoryCalls: logs.filter(l => l.event.includes('loadChatHistory')).length,
        overlayChanges: logs.filter(l => l.event.includes('OVERLAY')).length,
        replyLoads: logs.filter(l => l.event.includes('REPLY_LOAD')).length,
        errors: logs.filter(l => l.event.includes('ERROR')).length
      }
    };
  }

  // Expose globally for backward compatibility
  window.getLoadingReplyDiagnostic = getLoadingReplyDiagnostic;

  // Start tracking
  trackLoadChatHistory();
  trackOverlayVisibility();
  trackReplyLoading();
  trackSupabaseQueries();

  log('DIAGNOSTIC_STARTED', { timestamp: new Date().toISOString() });
  console.log('✅ DIAG_LOADING: Diagnostic script loaded. Use window.getLoadingReplyDiagnostic() to view logs.');
})();

// Export for ES module usage
export function getLoadingReplyDiagnostic(): DiagnosticData {
  const windowWithDiagnostic = window as Window & { getLoadingReplyDiagnostic?: () => DiagnosticData };
  return windowWithDiagnostic.getLoadingReplyDiagnostic?.() || { logs: [], summary: { totalEvents: 0, loadChatHistoryCalls: 0, overlayChanges: 0, replyLoads: 0, errors: 0 } };
}

