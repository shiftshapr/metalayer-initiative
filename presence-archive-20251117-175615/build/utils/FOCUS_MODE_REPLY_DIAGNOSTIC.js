/**
 * FOCUS MODE REPLY DIAGNOSTIC
 * 
 * Diagnoses why replies don't load in focus mode despite showing in default view.
 * Traces communityId resolution and message data structure.
 */

(function() {
  const DIAGNOSTIC_FLAG = '__focusModeReplyDiagnosticActive';
  if (window[DIAGNOSTIC_FLAG]) return;
  window[DIAGNOSTIC_FLAG] = true;

  const logs = [];
  const startTime = performance.now();

  function log(event, data = {}) {
    const timestamp = (performance.now() - startTime).toFixed(2);
    const entry = {
      time: timestamp,
      event,
      timestamp: new Date().toISOString(),
      ...data
    };
    logs.push(entry);
    console.log(`🔍 FOCUS_DIAG: [${timestamp}ms] ${event}`, data);
  }

  // Diagnostic function to trace focus mode reply loading
  window.diagnoseFocusModeReplies = async function(messageId) {
    log('DIAGNOSTIC_START', { messageId });

    if (!window.supabase) {
      log('ERROR', { message: 'Supabase client not available' });
      return { error: 'Supabase client not available' };
    }

    const results = {
      messageId,
      messageData: {},
      communityIdResolution: {},
      replyLoading: {},
      recommendations: []
    };

    try {
      // Step 1: Get message from database
      log('STEP_1', { check: 'Get message from database' });
      const { data: dbMessage, error: dbError } = await window.supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (dbError) {
        log('ERROR', { step: 'STEP_1', error: dbError });
        results.messageData.error = dbError.message;
      } else {
        log('STEP_1_RESULT', { message: dbMessage });
        results.messageData.database = {
          id: dbMessage.id,
          community_id: dbMessage.community_id,
          page_id: dbMessage.page_id,
          parent_id: dbMessage.parent_id,
          hasReplies: dbMessage.hasReplies,
          replyCount: dbMessage.replyCount
        };
      }

      // Step 2: Check message in currentChatData
      log('STEP_2', { check: 'Check message in currentChatData' });
      const currentChatData = window.currentChatData || {};
      const messageInChat = currentChatData[messageId];
      if (messageInChat) {
        log('STEP_2_RESULT', { message: messageInChat });
        results.messageData.currentChatData = {
          id: messageInChat.id,
          communityId: messageInChat.communityId,
          community_id: messageInChat.community_id,
          pageId: messageInChat.pageId,
          page_id: messageInChat.page_id,
          hasReplies: messageInChat.hasReplies,
          replyCount: messageInChat.replyCount
        };
      } else {
        log('STEP_2_RESULT', { message: 'Not found in currentChatData' });
        results.messageData.currentChatData = null;
      }

      // Step 3: Check message in DOM
      log('STEP_3', { check: 'Check message in DOM' });
      const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
      if (messageElement) {
        const domData = {
          dataset: {
            messageId: messageElement.dataset.messageId,
            communityId: messageElement.dataset.communityId,
            community_id: messageElement.dataset.community_id,
            pageId: messageElement.dataset.pageId,
            page_id: messageElement.dataset.page_id,
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
      const resolutionSteps = {
        step1_msg_communityId: null,
        step2_message_communityId: null,
        step3_activeCommunities: null,
        final: null
      };

      // Simulate the resolution logic from addMessageToFocus
      const msg = messageInChat || dbMessage || {};
      const message = messageInChat || dbMessage || {};
      
      resolutionSteps.step1_msg_communityId = msg.communityId || msg.community_id;
      resolutionSteps.step2_message_communityId = message.communityId || message.community_id;
      resolutionSteps.step3_activeCommunities = window.activeCommunities && window.activeCommunities[0];
      
      resolutionSteps.final = msg.communityId || message.communityId || 
                              msg.community_id || message.community_id ||
                              (window.activeCommunities && window.activeCommunities[0]);

      log('STEP_4_RESULT', resolutionSteps);
      results.communityIdResolution = resolutionSteps;

      // Step 5: Check if replies exist in database
      log('STEP_5', { check: 'Check replies in database' });
      if (dbMessage) {
        const { data: replies, error: repliesError } = await window.supabase
          .from('messages')
          .select('*')
          .eq('parent_id', messageId)
          .eq('page_id', dbMessage.page_id)
          .eq('community_id', dbMessage.community_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: true });

        if (repliesError) {
          log('ERROR', { step: 'STEP_5', error: repliesError });
          results.replyLoading.error = repliesError.message;
        } else {
          log('STEP_5_RESULT', { replyCount: replies?.length || 0, replies });
          results.replyLoading = {
            replyCount: replies?.length || 0,
            replies: replies || [],
            queryParams: {
              parent_id: messageId,
              page_id: dbMessage.page_id,
              community_id: dbMessage.community_id
            }
          };
        }
      }

      // Step 6: Analyze the issue
      log('STEP_6', { check: 'Analyze issue' });
      
      if (!resolutionSteps.final) {
        results.recommendations.push('❌ CRITICAL: communityId cannot be resolved');
        results.recommendations.push(`   - msg.communityId: ${resolutionSteps.step1_msg_communityId || 'missing'}`);
        results.recommendations.push(`   - message.communityId: ${resolutionSteps.step2_message_communityId || 'missing'}`);
        results.recommendations.push(`   - window.activeCommunities[0]: ${resolutionSteps.step3_activeCommunities || 'missing'}`);
        
        if (dbMessage && dbMessage.community_id) {
          results.recommendations.push(`✅ SOLUTION: Use dbMessage.community_id: ${dbMessage.community_id}`);
          results.recommendations.push('   Fix: Query message from database if communityId missing from message object');
        }
      } else {
        results.recommendations.push(`✅ communityId resolved: ${resolutionSteps.final}`);
      }

      if (results.replyLoading.replyCount > 0 && !resolutionSteps.final) {
        results.recommendations.push('⚠️ WARNING: Replies exist in database but cannot load due to missing communityId');
      }

      // Step 7: Check focus mode state
      log('STEP_7', { check: 'Check focus mode state' });
      const chatMessages = document.querySelector('.chat-messages');
      const focusModeState = {
        hasFocusModeClass: chatMessages?.classList.contains('focus-mode-active'),
        dataset: {
          focusMode: chatMessages?.dataset.focusMode,
          focusMessageId: chatMessages?.dataset.focusMessageId
        },
        activeCommunities: window.activeCommunities,
        currentPageId: window.currentUrlData?.pageId || window.currentPage?.pageId
      };
      log('STEP_7_RESULT', focusModeState);
      results.focusModeState = focusModeState;

      log('DIAGNOSTIC_COMPLETE', results);
      return results;

    } catch (err) {
      log('ERROR', { error: err.message, stack: err.stack });
      return { error: err.message, stack: err.stack };
    }
  };

  // Export diagnostic data
  window.getFocusModeReplyDiagnostic = function() {
    return {
      logs,
      summary: {
        totalEvents: logs.length,
        errors: logs.filter(l => l.event === 'ERROR').length
      }
    };
  };

  log('DIAGNOSTIC_LOADED', { timestamp: new Date().toISOString() });
  console.log('✅ FOCUS_DIAG: Diagnostic script loaded. Use window.diagnoseFocusModeReplies(messageId) to diagnose.');
})();

