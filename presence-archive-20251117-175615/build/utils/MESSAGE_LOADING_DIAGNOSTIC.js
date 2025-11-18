/**
 * MESSAGE LOADING DIAGNOSTIC
 * 
 * Diagnoses why messages are not loading/displaying
 */

(function() {
  'use strict';

  console.log('🔍 MESSAGE_LOADING_DIAGNOSTIC: Starting diagnostic...');

  async function runDiagnostic() {
    const results = {
      timestamp: new Date().toISOString(),
      pageInfo: {},
      communities: {},
      apiCalls: {},
      databaseCheck: {},
      domState: {},
      errors: []
    };

    try {
      // 1. Page Information
      const urlData = window.currentUrlData || {};
      results.pageInfo = {
        rawUrl: window.location.href,
        normalizedUrl: urlData.normalizedUrl,
        pageId: urlData.pageId,
        hasUrlData: !!window.currentUrlData
      };
      console.log('📄 PAGE INFO:', results.pageInfo);

      // 2. Communities
      const activeCommunities = window.activeCommunities || [];
      const communities = window.communities || [];
      results.communities = {
        activeCommunities,
        activeCount: activeCommunities.length,
        allCommunities: communities.map(c => ({ id: c.id, name: c.name })),
        hasCommunities: communities.length > 0
      };
      console.log('👥 COMMUNITIES:', results.communities);

      // 3. API Calls
      if (window.api && typeof window.api.getChatHistory === 'function') {
        console.log('🔍 Testing API.getChatHistory calls...');
        const apiResults = [];
        
        for (const communityId of activeCommunities) {
          try {
            console.log(`🔍 Calling API.getChatHistory for community: ${communityId}`);
            const startTime = performance.now();
            const response = await window.api.getChatHistory(communityId, null, urlData.normalizedUrl);
            const duration = performance.now() - startTime;
            
            apiResults.push({
              communityId,
              success: true,
              duration: `${duration.toFixed(2)}ms`,
              response: {
                hasConversations: !!response.conversations,
                conversationCount: response.conversations?.length || 0,
                conversations: response.conversations?.map(c => ({
                  id: c.id,
                  postCount: c.posts?.length || 0,
                  hasPosts: !!(c.posts && c.posts.length > 0)
                })) || []
              }
            });
            console.log(`✅ API call for ${communityId}:`, apiResults[apiResults.length - 1]);
          } catch (error) {
            apiResults.push({
              communityId,
              success: false,
              error: {
                name: error.name,
                message: error.message,
                stack: error.stack
              }
            });
            console.error(`❌ API call failed for ${communityId}:`, error);
            results.errors.push(`API call failed for ${communityId}: ${error.message}`);
          }
        }
        
        results.apiCalls = {
          tested: true,
          results: apiResults,
          totalCalls: apiResults.length,
          successfulCalls: apiResults.filter(r => r.success).length,
          failedCalls: apiResults.filter(r => !r.success).length
        };
      } else {
        results.apiCalls = {
          tested: false,
          reason: 'window.api.getChatHistory not available'
        };
        console.warn('⚠️ API not available');
      }

      // 4. Database Check (via Supabase)
      if (window.supabase) {
        console.log('🔍 Checking database directly...');
        try {
          const dbResults = [];
          
          for (const communityId of activeCommunities) {
            const normalizedPageId = urlData.pageId || urlData.normalizedUrl?.replace(/[^a-zA-Z0-9]/g, '_');
            
            // Query for messages on this page
            const { data: messages, error } = await window.supabase
              .from('messages')
              .select('*')
              .eq('community_id', communityId)
              .eq('page_id', normalizedPageId)
              .is('deleted_at', null)
              .order('created_at', { ascending: false })
              .limit(50);
            
            if (error) {
              dbResults.push({
                communityId,
                success: false,
                error: error.message
              });
              console.error(`❌ Database query failed for ${communityId}:`, error);
              results.errors.push(`Database query failed for ${communityId}: ${error.message}`);
            } else {
              dbResults.push({
                communityId,
                success: true,
                messageCount: messages?.length || 0,
                messages: messages?.map(m => ({
                  id: m.id,
                  body: m.body?.substring(0, 50) + '...',
                  parent_id: m.parent_id,
                  created_at: m.created_at,
                  page_id: m.page_id
                })) || []
              });
              console.log(`✅ Database check for ${communityId}: Found ${messages?.length || 0} messages`);
            }
          }
          
          results.databaseCheck = {
            tested: true,
            results: dbResults,
            totalQueries: dbResults.length,
            successfulQueries: dbResults.filter(r => r.success).length
          };
        } catch (error) {
          results.databaseCheck = {
            tested: false,
            error: error.message
          };
          console.error('❌ Database check failed:', error);
          results.errors.push(`Database check failed: ${error.message}`);
        }
      } else {
        results.databaseCheck = {
          tested: false,
          reason: 'window.supabase not available'
        };
        console.warn('⚠️ Supabase not available');
      }

      // 5. DOM State
      const chatMessages = document.querySelector('.chat-messages');
      const messages = chatMessages?.querySelectorAll('.message') || [];
      const emptyState = chatMessages?.querySelector('.empty-state-message');
      const loadingOverlay = chatMessages?.querySelector('.chat-loading-overlay');
      
      results.domState = {
        chatMessagesExists: !!chatMessages,
        messageCount: messages.length,
        messageIds: Array.from(messages).map(m => m.getAttribute('data-message-id')),
        hasEmptyState: !!emptyState,
        hasLoadingOverlay: !!loadingOverlay,
        focusMode: chatMessages?.dataset.focusMode === 'true',
        isVisible: chatMessages ? window.getComputedStyle(chatMessages).visibility !== 'hidden' : false,
        opacity: chatMessages ? window.getComputedStyle(chatMessages).opacity : null
      };
      console.log('🏗️ DOM STATE:', results.domState);

      // 6. Summary
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('📊 MESSAGE LOADING DIAGNOSTIC SUMMARY');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('Page:', results.pageInfo.normalizedUrl || results.pageInfo.rawUrl);
      console.log('Active Communities:', results.communities.activeCount);
      console.log('API Calls:', results.apiCalls.tested ? `${results.apiCalls.successfulCalls}/${results.apiCalls.totalCalls} successful` : 'Not tested');
      console.log('Database Messages:', results.databaseCheck.tested ? results.databaseCheck.results.reduce((sum, r) => sum + (r.messageCount || 0), 0) : 'Not tested');
      console.log('DOM Messages:', results.domState.messageCount);
      console.log('Errors:', results.errors.length);
      
      if (results.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        results.errors.forEach(err => console.error('  -', err));
      }
      
      // Root Cause Analysis
      console.log('\n🔍 ROOT CAUSE ANALYSIS:');
      
      if (results.apiCalls.tested) {
        const totalConversations = results.apiCalls.results.reduce((sum, r) => {
          return sum + (r.success ? (r.response?.conversationCount || 0) : 0);
        }, 0);
        
        if (totalConversations === 0) {
          console.log('❌ ROOT CAUSE: API returning 0 conversations');
          console.log('   - Check if messages exist in database');
          console.log('   - Verify page_id matching logic');
          console.log('   - Check community_id filtering');
        } else {
          console.log(`✅ API returning ${totalConversations} conversations`);
        }
      }
      
      if (results.databaseCheck.tested) {
        const totalDbMessages = results.databaseCheck.results.reduce((sum, r) => {
          return sum + (r.success ? (r.messageCount || 0) : 0);
        }, 0);
        
        if (totalDbMessages === 0) {
          console.log('❌ ROOT CAUSE: No messages found in database for this page');
          console.log('   - Page ID:', results.pageInfo.pageId);
          console.log('   - Normalized URL:', results.pageInfo.normalizedUrl);
          console.log('   - Check if messages exist with matching page_id');
        } else {
          console.log(`✅ Database has ${totalDbMessages} messages`);
          if (results.domState.messageCount === 0) {
            console.log('❌ ROOT CAUSE: Messages exist in DB but not in DOM');
            console.log('   - Check addMessageToChat function');
            console.log('   - Check filtering logic');
            console.log('   - Check focus mode filtering');
          }
        }
      }
      
      console.log('═══════════════════════════════════════════════════════════\n');

      return results;
    } catch (error) {
      console.error('❌ DIAGNOSTIC ERROR:', error);
      results.errors.push(`Diagnostic failed: ${error.message}`);
      return results;
    }
  }

  // Export
  window.messageLoadingDiagnostic = {
    run: runDiagnostic
  };

  // Auto-run after a delay
  setTimeout(() => {
    console.log('🔍 MESSAGE_LOADING_DIAGNOSTIC: Auto-running diagnostic...');
    runDiagnostic();
  }, 3000);

  console.log('✅ MESSAGE_LOADING_DIAGNOSTIC: Ready. Call messageLoadingDiagnostic.run()');
})();

