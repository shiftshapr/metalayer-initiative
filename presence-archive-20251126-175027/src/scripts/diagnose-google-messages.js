/**
 * Diagnostic Script: No Messages on google.com
 * 
 * This script diagnoses why messages are not displaying on google.com.
 * 
 * Usage: Run in browser console while on google.com
 */

(async function() {
  console.log('🔍 DIAGNOSTIC: No Messages on google.com');
  console.log('=========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    currentUrl: null,
    normalizedUrl: null,
    pageId: null,
    currentUrlData: null,
    messagesLoaded: null,
    issues: []
  };

  // 1. Check current URL
  console.log('1. Checking Current URL...');
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].url) {
        results.currentUrl = tabs[0].url;
        console.log('   Current URL:', results.currentUrl);
        
        // 2. Check normalized URL and pageId
        console.log('\n2. Checking Normalized URL and PageId...');
        if (window.normalizeUrl) {
          window.normalizeUrl(results.currentUrl).then(async (result) => {
            results.normalizedUrl = result.normalizedUrl;
            results.pageId = result.pageId;
            console.log('   Normalized URL:', results.normalizedUrl);
            console.log('   PageId:', results.pageId);
            
            // 3. Check currentUrlData in state
            console.log('\n3. Checking currentUrlData in State...');
            try {
              const stateManager = window.stateManager || (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.stateManager);
              if (stateManager && typeof stateManager.getState === 'function') {
                try {
                  // Use getAll() to get full state, handle both sync and async versions
                  let state;
                  if (stateManager.getAll) {
                    // getAll() is async, await it
                    state = await stateManager.getAll();
                  } else if (stateManager.getState) {
                    // getState() now handles undefined path and returns full state (sync)
                    state = stateManager.getState();
                  } else {
                    throw new Error('StateManager has neither getAll() nor getState() method');
                  }
                  if (state && state.currentUrlData) {
                    results.currentUrlData = state.currentUrlData;
                    console.log('   currentUrlData:', results.currentUrlData);
                    
                    // Check for mismatch
                    if (results.currentUrlData.pageId !== results.pageId) {
                      results.issues.push('PageId mismatch: State has "' + results.currentUrlData.pageId + '" but normalized is "' + results.pageId + '"');
                      console.log('   ❌ MISMATCH: State pageId="' + results.currentUrlData.pageId + '", Normalized="' + results.pageId + '"');
                    }
                  } else {
                    console.log('   ⚠️ State exists but currentUrlData is missing');
                  }
                } catch (stateError) {
                  console.log('   ❌ Error calling getState():', stateError.message);
                  results.issues.push('Error accessing state: ' + stateError.message);
                }
              } else {
                console.log('   ⚠️ stateManager not found or getState is not a function');
              }
            } catch (error) {
              console.log('   ❌ Error accessing stateManager:', error.message);
              results.issues.push('Error accessing stateManager: ' + error.message);
            }
            
            // 4. Check if messages are loaded
            console.log('\n4. Checking Messages...');
            const chatMessages = document.querySelector('.chat-messages');
            const messageElements = chatMessages?.querySelectorAll('[data-message-id], .message');
            results.messagesLoaded = {
              containerExists: !!chatMessages,
              messageCount: messageElements?.length || 0,
              hasMessages: (messageElements?.length || 0) > 0
            };
            console.log('   Messages:', results.messagesLoaded);
            
            if (!results.messagesLoaded.hasMessages) {
              results.issues.push('No messages found in chat container');
            }
            
            // 5. Check active communities
            console.log('\n5. Checking Active Communities...');
            var activeCommunities = null;
            try {
              var stateManager = window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.stateManager;
              if (stateManager && typeof stateManager.getState === 'function') {
                activeCommunities = stateManager.getState('ui.activeCommunities');
              } else if (typeof window.getState === 'function') {
                activeCommunities = window.getState('ui.activeCommunities');
              } else if (Array.isArray(window.activeCommunities)) {
                activeCommunities = window.activeCommunities;
              }
            } catch (e) {
              console.log('   ⚠️ Error getting active communities:', e);
            }
            results.activeCommunities = activeCommunities;
            console.log('   Active Communities:', activeCommunities);
            if (!activeCommunities || (Array.isArray(activeCommunities) && activeCommunities.length === 0)) {
              results.issues.push('No active communities found - messages require at least one active community');
              console.log('   ❌ No active communities found');
            } else {
              console.log('   ✅ Active communities found:', Array.isArray(activeCommunities) ? activeCommunities.length : 'unknown');
            }
            
            // 6. Check if loadChatHistory was called
            console.log('\n6. Checking loadChatHistory Calls...');
            const loadChatHistory = window.loadChatHistory;
            if (loadChatHistory) {
              console.log('   ✅ loadChatHistory function exists');
              
              // 7. Try to manually call loadChatHistory
              console.log('\n7. Attempting to manually call loadChatHistory...');
              try {
                // loadChatHistory expects rawUrl, not pageId
                await loadChatHistory(results.currentUrl);
                console.log('   ✅ loadChatHistory called successfully');
                
                // Wait a bit for messages to load
                await new Promise(function(resolve) { setTimeout(resolve, 1000); });
                
                // Check messages again
                const chatMessagesAfter = document.querySelector('.chat-messages');
                const messageElementsAfter = chatMessagesAfter ? chatMessagesAfter.querySelectorAll('[data-message-id], .message') : null;
                const messageCountAfter = messageElementsAfter ? messageElementsAfter.length : 0;
                
                console.log('   Messages after loadChatHistory call:', messageCountAfter);
                if (messageCountAfter > 0) {
                  console.log('   ✅ Messages loaded successfully');
                } else {
                  results.issues.push('loadChatHistory called but no messages appeared');
                  console.log('   ❌ loadChatHistory called but no messages appeared');
                }
              } catch (loadError) {
                results.issues.push('Error calling loadChatHistory: ' + loadError.message);
                console.log('   ❌ Error calling loadChatHistory:', loadError);
              }
            } else {
              results.issues.push('loadChatHistory function not found on window');
              console.log('   ❌ loadChatHistory function not found');
            }
            
            // 8. Final check after waiting for automatic load
            console.log('\n8. Waiting for automatic message load (if any)...');
            await new Promise(function(resolve) { setTimeout(resolve, 2000); });
            
            var finalChatMessages = document.querySelector('.chat-messages');
            var finalMessageElements = finalChatMessages ? finalChatMessages.querySelectorAll('[data-message-id], .message') : null;
            var finalMessageCount = finalMessageElements ? finalMessageElements.length : 0;
            
            results.finalCheck = {
              messageCount: finalMessageCount,
              hasMessages: finalMessageCount > 0,
              timestamp: new Date().toISOString()
            };
            
            console.log('   Final message count after waiting:', finalMessageCount);
            if (finalMessageCount > 0) {
              console.log('   ✅ Messages loaded automatically');
              // Remove "No messages found" issue if messages are now present
              var noMessagesIndex = results.issues.indexOf('No messages found in chat container');
              if (noMessagesIndex !== -1) {
                results.issues.splice(noMessagesIndex, 1);
              }
            } else {
              console.log('   ⚠️ No messages loaded automatically');
              if (results.issues.indexOf('No messages found in chat container') === -1) {
                results.issues.push('No messages found in chat container after automatic load');
              }
            }
            
            // Summary
            console.log('\n=========================================');
            console.log('📊 DIAGNOSTIC SUMMARY');
            console.log('=========================================');
            console.log('Issues Found:', results.issues.length);
            for (var i = 0; i < results.issues.length; i++) {
              console.log('  ' + (i + 1) + '. ' + results.issues[i]);
            }
            
            console.log('\n✅ Expected State:');
            console.log('  - pageId should be normalized correctly (e.g., "google_com" or "google_com_")');
            console.log('  - currentUrlData.pageId should match normalized pageId');
            console.log('  - Messages should be loaded for the pageId');
            console.log('  - Active communities should be initialized');
            
            console.log('\n📋 Full Results:', JSON.stringify(results, null, 2));
          }).catch((error) => {
            console.error('   ❌ Error normalizing URL:', error);
            results.issues.push(`Error normalizing URL: ${error.message}`);
          });
        } else {
          results.issues.push('normalizeUrl function not available');
          console.log('   ❌ normalizeUrl function not found');
        }
      }
    });
  } else {
    results.issues.push('Chrome tabs API not available');
    console.log('   ❌ Chrome tabs API not available');
  }
  
  return results;
})();

