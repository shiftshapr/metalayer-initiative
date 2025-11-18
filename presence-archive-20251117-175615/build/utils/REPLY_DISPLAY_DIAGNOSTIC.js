/**
 * REPLY DISPLAY DIAGNOSTIC
 * 
 * Diagnoses why replies are not displaying despite successful loading.
 * Checks database values vs query parameters to identify mismatches.
 */

(function() {
  const DIAGNOSTIC_FLAG = '__replyDisplayDiagnosticActive';
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
    console.log(`🔍 REPLY_DIAG: [${timestamp}ms] ${event}`, data);
  }

  // Diagnostic function to check database vs query parameters
  window.diagnoseReplyDisplay = async function(messageId, pageId, communityId) {
    log('DIAGNOSTIC_START', { messageId, pageId, communityId });

    if (!window.supabase) {
      log('ERROR', { message: 'Supabase client not available' });
      return { error: 'Supabase client not available' };
    }

    const results = {
      queryParams: { messageId, pageId, communityId },
      databaseChecks: {},
      mismatches: [],
      recommendations: []
    };

    try {
      // Check 1: Find all replies for this message (any page, any community)
      log('CHECK_1', { check: 'Find all replies for message (any constraints)' });
      const { data: allReplies, error: allError } = await window.supabase
        .from('messages')
        .select('*')
        .eq('parent_id', messageId)
        .is('deleted_at', null); // Only check non-deleted replies

      if (allError) {
        log('ERROR', { check: 'CHECK_1', error: allError, errorCode: allError.code, errorDetails: allError.details, errorHint: allError.hint });
        results.databaseChecks.allReplies = { 
          error: allError.message,
          errorCode: allError.code,
          errorDetails: allError.details,
          errorHint: allError.hint
        };
      } else {
        results.databaseChecks.allReplies = {
          count: allReplies?.length || 0,
          replies: allReplies || []
        };
        log('CHECK_1_RESULT', { count: allReplies?.length || 0, replies: allReplies });
      }

      // Check 2: Check with normalized pageId
      const normalizedPageId = pageId ? String(pageId).replace(/_+$/, '').trim() : pageId;
      log('CHECK_2', { check: 'Find replies with normalized pageId', normalizedPageId });
      const { data: normalizedReplies, error: normalizedError } = await window.supabase
        .from('messages')
        .select('*')
        .eq('parent_id', messageId)
        .eq('page_id', normalizedPageId)
        .is('deleted_at', null); // Only check non-deleted replies

      if (normalizedError) {
        log('ERROR', { check: 'CHECK_2', error: normalizedError });
        results.databaseChecks.normalizedPageId = { error: normalizedError.message };
      } else {
        results.databaseChecks.normalizedPageId = {
          count: normalizedReplies?.length || 0,
          replies: normalizedReplies || []
        };
        log('CHECK_2_RESULT', { count: normalizedReplies?.length || 0 });
      }

      // Check 3: Check with original pageId (with trailing underscore)
      if (normalizedPageId !== pageId) {
        log('CHECK_3', { check: 'Find replies with original pageId', originalPageId: pageId });
        const { data: originalReplies, error: originalError } = await window.supabase
          .from('messages')
          .select('*')
          .eq('parent_id', messageId)
          .eq('page_id', pageId)
          .is('deleted_at', null); // Only check non-deleted replies

        if (originalError) {
          log('ERROR', { check: 'CHECK_3', error: originalError });
          results.databaseChecks.originalPageId = { error: originalError.message };
        } else {
          results.databaseChecks.originalPageId = {
            count: originalReplies?.length || 0,
            replies: originalReplies || []
          };
          log('CHECK_3_RESULT', { count: originalReplies?.length || 0 });
        }
      }

      // Check 4: Check with community ID
      log('CHECK_4', { check: 'Find replies with communityId', communityId });
      const { data: communityReplies, error: communityError } = await window.supabase
        .from('messages')
        .select('*')
        .eq('parent_id', messageId)
        .eq('community_id', communityId)
        .is('deleted_at', null); // Only check non-deleted replies

      if (communityError) {
        log('ERROR', { check: 'CHECK_4', error: communityError });
        results.databaseChecks.communityId = { error: communityError.message };
      } else {
        results.databaseChecks.communityId = {
          count: communityReplies?.length || 0,
          replies: communityReplies || []
        };
        log('CHECK_4_RESULT', { count: communityReplies?.length || 0 });
      }

      // Check 5: Check with both normalized pageId and communityId (actual query)
      log('CHECK_5', { check: 'Find replies with normalized pageId + communityId (actual query)' });
      const { data: actualQueryReplies, error: actualError } = await window.supabase
        .from('messages')
        .select('*')
        .eq('parent_id', messageId)
        .eq('page_id', normalizedPageId)
        .eq('community_id', communityId)
        .is('deleted_at', null); // Only check non-deleted replies

      if (actualError) {
        log('ERROR', { check: 'CHECK_5', error: actualError });
        results.databaseChecks.actualQuery = { error: actualError.message };
      } else {
        results.databaseChecks.actualQuery = {
          count: actualQueryReplies?.length || 0,
          replies: actualQueryReplies || []
        };
        log('CHECK_5_RESULT', { count: actualQueryReplies?.length || 0 });
      }

      // Analyze mismatches and provide detailed diagnostics
      if (allReplies && allReplies.length > 0) {
        // Log actual column names from first reply for debugging
        if (allReplies[0]) {
          const actualColumns = Object.keys(allReplies[0]);
          log('SCHEMA_INFO', { actualColumns, sampleReply: allReplies[0] });
          results.schemaInfo = { actualColumns, sampleReply: allReplies[0] };
        }
        
        // CRITICAL: Show actual communityId from database
        const uniqueCommunityIds = [...new Set(allReplies.map(r => r.community_id))];
        const actualCommunityId = uniqueCommunityIds[0];
        if (actualCommunityId && actualCommunityId !== communityId) {
          log('COMMUNITY_ID_MISMATCH', { 
            queryCommunityId: communityId, 
            actualCommunityId,
            allCommunityIds: uniqueCommunityIds 
          });
          results.actualCommunityId = actualCommunityId;
          results.mismatches.push(`⚠️ CRITICAL: Query uses communityId '${communityId}', but reply has '${actualCommunityId}'`);
          results.recommendations.push(`❌ RED-LINE VIOLATION: Remove 'comm-001' fallback. Use actual community_id: '${actualCommunityId}'`);
        }
        
        // Replies exist but query found none
        if (actualQueryReplies && actualQueryReplies.length === 0) {
          results.mismatches.push('Replies exist but query with normalized pageId + communityId found none');
          
          // Check page ID format
          const uniquePageIds = [...new Set(allReplies.map(r => r.page_id))];
          if (!uniquePageIds.includes(normalizedPageId) && !uniquePageIds.includes(pageId)) {
            results.mismatches.push(`Page ID mismatch: Query uses '${normalizedPageId}' or '${pageId}', but database has: ${uniquePageIds.join(', ')}`);
            results.recommendations.push(`Use page_id: '${uniquePageIds[0]}' from database`);
          }

          // Check community ID format (already checked above, but show again)
          if (!uniqueCommunityIds.includes(communityId)) {
            results.mismatches.push(`Community ID mismatch: Query uses '${communityId}', but database has: ${uniqueCommunityIds.join(', ')}`);
            results.recommendations.push(`Use community_id: '${uniqueCommunityIds[0]}' from database`);
          }
        }
      } else {
        results.mismatches.push('No replies exist in database for this message');
        results.recommendations.push('Verify message has replies in database');
      }

      log('DIAGNOSTIC_COMPLETE', results);
      return results;

    } catch (err) {
      log('ERROR', { error: err.message, stack: err.stack });
      return { error: err.message, stack: err.stack };
    }
  };

  // Export diagnostic data
  window.getReplyDisplayDiagnostic = function() {
    return {
      logs,
      summary: {
        totalEvents: logs.length,
        errors: logs.filter(l => l.event === 'ERROR').length
      }
    };
  };

  log('DIAGNOSTIC_LOADED', { timestamp: new Date().toISOString() });
  console.log('✅ REPLY_DIAG: Diagnostic script loaded. Use window.diagnoseReplyDisplay(messageId, pageId, communityId) to diagnose.');
})();

