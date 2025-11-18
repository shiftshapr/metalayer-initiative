/**
 * DIAGNOSTIC SCRIPT: Loading Indicator & Reply Loading
 * 
 * Traces loading indicator behavior and reply loading failures
 * to identify root causes.
 */

(function() {
  const DIAGNOSTIC_FLAG = '__loadingReplyDiagnosticActive';
  if (window[DIAGNOSTIC_FLAG]) return;
  window[DIAGNOSTIC_FLAG] = true;

  const logs = [];
  const startTime = performance.now();

  function log(event, data = {}) {
    const timestamp = (performance.now() - startTime).toFixed(2);
    const entry = {
      time: timestamp,
      event,
      ...data
    };
    logs.push(entry);
    console.log(`🔍 DIAG_LOADING: [${timestamp}ms] ${event}`, data);
  }

  // Track loadChatHistory calls
  function trackLoadChatHistory() {
    if (typeof window.loadChatHistory !== 'function') {
      return;
    }

    const original = window.loadChatHistory;
    let callCount = 0;
    window.loadChatHistory = async function(...args) {
      callCount++;
      const callId = `load-${callCount}`;
      log('loadChatHistory_START', { callId, callCount });
      
      const chatMessages = document.querySelector('.chat-messages');
      const overlayState = chatMessages?.querySelector('.chat-loading-overlay');
      const isVisible = overlayState && !overlayState.classList.contains('hidden');
      log('loadChatHistory_OVERLAY_STATE', { callId, hasOverlay: !!overlayState, isVisible });

      const startTime = performance.now();
      const result = await original.apply(this, args);
      const duration = (performance.now() - startTime).toFixed(2);
      log('loadChatHistory_COMPLETE', { callId, duration: `${duration}ms`, success: true });
      return result;
    };
  }

  // Track overlay visibility changes
  function trackOverlayVisibility() {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      return;
    }

    let lastState = null;
    
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
  function trackReplyLoading() {
    if (!window.ReplyLoader) {
      return;
    }

    const original = window.ReplyLoader.loadAllReplies;
    window.ReplyLoader.loadAllReplies = async function(messageId, pageId, communityId) {
      log('REPLY_LOAD_START', { messageId, pageId, communityId });
      
      if (pageId && typeof pageId === 'string') {
        const hasSpecialChars = /[^a-zA-Z0-9_-]/.test(pageId);
        log('REPLY_LOAD_PAGEID_CHECK', { pageId, hasSpecialChars, length: pageId.length });
      }

      const result = await original.apply(this, arguments);
      log('REPLY_LOAD_SUCCESS', { messageId, replyCount: result?.length || 0 });
      return result;
    };
  }

  // Track Supabase queries
  function trackSupabaseQueries() {
    if (!window.supabase) {
      return;
    }

    const originalFrom = window.supabase.from;
    window.supabase.from = function(table) {
      const query = originalFrom.call(this, table);
      const originalSelect = query.select;
      
      query.select = function(...args) {
        const selectQuery = originalSelect.apply(this, args);
        
        ['eq', 'is', 'order'].forEach(method => {
          const originalMethod = selectQuery[method];
          if (originalMethod) {
            selectQuery[method] = function(...methodArgs) {
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
      
      return query;
    };
  }

  // Export diagnostic data
  window.getLoadingReplyDiagnostic = function() {
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
  };

  // Start tracking
  trackLoadChatHistory();
  trackOverlayVisibility();
  trackReplyLoading();
  trackSupabaseQueries();

  log('DIAGNOSTIC_STARTED', { timestamp: new Date().toISOString() });
  console.log('✅ DIAG_LOADING: Diagnostic script loaded. Use window.getLoadingReplyDiagnostic() to view logs.');
})();

