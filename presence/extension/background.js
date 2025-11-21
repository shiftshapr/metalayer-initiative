// Service worker is automatically registered by Chrome in Manifest V3

// Background service worker for the Collaborative Sidebar extension
console.log("Background service worker started.");

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId, buttonIndex) => {
  console.log('🔔 BACKGROUND: Notification clicked:', notificationId, buttonIndex);
  
  // Forward to sidepanel if it's open
  chrome.runtime.sendMessage({
    type: 'NOTIFICATION_CLICKED',
    notificationId: notificationId,
    buttonIndex: buttonIndex
  }).catch(err => {
    console.log('🔔 BACKGROUND: No sidepanel to forward notification click to');
  });
});

// Handle messages from content scripts and sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request, 'from:', sender);
  
  // Handle different message types
  if (request.type === 'NOTIFICATION_CLICKED') {
    console.log('🔔 BACKGROUND: Forwarding notification click to all tabs');
    // Forward to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, request).catch(() => {
          // Ignore errors for tabs that don't have the content script
        });
      });
    });
  }

  
  // Handle shared message - open tab with sidebar
  if (request.type === 'OPEN_SHARED_MESSAGE') {
    console.log('🔗 BACKGROUND: Opening shared message:', request.messageId, 'URL:', request.url);
    
    // CRITICAL FIX: Handle async operation properly
    (async () => {
      // CRITICAL FIX: If URL is provided and contains a hash, extract the page URL
      // Otherwise, fetch message data to get the page URL
      let targetUrl = request.url;
      let messageId = request.messageId;
      
      // If URL contains hash with message, extract the base URL
      if (targetUrl && targetUrl.includes('#message=')) {
        try {
          const urlObj = new URL(targetUrl);
          messageId = urlObj.hash.match(/message=([^&]+)/)?.[1] || messageId;
          // Use the base URL (without hash) - this should be the page URL
          urlObj.hash = '';
          targetUrl = urlObj.toString();
          console.log('🔗 BACKGROUND: Extracted page URL from hash:', targetUrl);
        } catch (e) {
          console.warn('🔗 BACKGROUND: Could not parse URL, using as-is:', e);
        }
      }
      
      // If we still don't have a valid page URL, try to fetch from API
      if (!targetUrl || targetUrl.includes('api.themetalayer.org') || targetUrl.includes('share-message')) {
        console.log('🔗 BACKGROUND: Fetching message data to get page URL...');
        try {
          // Try to get API base URL from storage or use default
          const apiBase = 'https://api.themetalayer.org';
          const response = await fetch(`${apiBase}/v1/posts/${messageId}`);
          
          if (response.ok) {
            const messageData = await response.json();
            const pageUrl = messageData.conversation?.page?.url || 
                           messageData.pageUrl || 
                           'https://www.google.com'; // Fallback
            
            // Remove hash if present and add message hash
            const urlObj = new URL(pageUrl);
            urlObj.hash = '';
            targetUrl = `${urlObj.toString()}#message=${messageId}&conversation=${messageData.conversationId || ''}`;
            console.log('🔗 BACKGROUND: Got page URL from API:', targetUrl);
          } else {
            console.warn('🔗 BACKGROUND: Could not fetch message data, using fallback');
            // Fallback to google.com if we can't get the page URL
            targetUrl = `https://www.google.com/#message=${messageId}`;
          }
        } catch (fetchError) {
          console.error('🔗 BACKGROUND: Error fetching message data:', fetchError);
          // Fallback to google.com
          targetUrl = `https://www.google.com/#message=${messageId}`;
        }
      }
      
      console.log('🔗 BACKGROUND: Opening tab with URL:', targetUrl);
      
      // Open the URL in a new tab
      chrome.tabs.create({ url: targetUrl }, (tab) => {
        console.log('✅ BACKGROUND: Opened tab:', tab.id);
        
        // Wait for tab to load, then open sidebar
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            
            // Small delay to ensure page is fully loaded
            setTimeout(() => {
              // Open sidebar
              chrome.sidePanel.open({ tabId: tab.id }).then(() => {
                console.log('✅ BACKGROUND: Sidebar opened for shared message');
                
                // Send message to sidebar to scroll to and highlight the message
                setTimeout(() => {
                  chrome.runtime.sendMessage({
                    type: 'HIGHLIGHT_SHARED_MESSAGE',
                    messageId: messageId,
                    tabId: tab.id
                  }).catch(err => {
                    console.log('🔗 BACKGROUND: Could not send highlight message (sidebar may not be ready):', err.message);
                  });
                }, 1000); // Give sidebar time to initialize
                
                sendResponse({ success: true, url: targetUrl });
              }).catch((error) => {
                console.error('❌ BACKGROUND: Failed to open sidebar:', error);
                sendResponse({ success: false, error: error.message });
              });
            }, 500);
          }
        });
      });
    })();
    
    return true; // Keep channel open for async response
  }
  
  // Handle message highlighting from background
  if (request.type === 'HIGHLIGHT_SHARED_MESSAGE') {
    // This will be handled by the sidepanel
    console.log('🔗 BACKGROUND: Received highlight request for message:', request.messageId);
  }

  // Handle extension detection ping
  if (request.type === 'PING') {
    console.log('🔍 BACKGROUND: Received PING, responding');
    sendResponse({ success: true, extensionId: chrome.runtime.id });
    return true;
  }
  
  // CRITICAL FIX: Echo back TAB_UPDATED, TAB_CHANGED, TAB_CLOSED messages
  // When tests send these messages, they come FROM the sidepanel TO the background
  // But the sidepanel's onMessage listener only receives messages FROM the background
  // So we need to echo the message back to the sidepanel
  if (request.type === 'TAB_UPDATED' || request.type === 'TAB_CHANGED' || request.type === 'TAB_CLOSED') {
    console.log(`🔄 BACKGROUND: Received ${request.type} message, echoing back to sidepanel`);
    
    // Echo the message back to all extension contexts (including the sidepanel)
    // This allows the test to trigger the same flow as a real tab change
    setTimeout(() => {
      chrome.runtime.sendMessage(request).catch(err => {
        console.log(`🔍 BACKGROUND: Could not echo ${request.type} to sidepanel:`, err.message);
      });
    }, 10); // Small delay to ensure the original sender's listener doesn't catch its own message
  }
  
  // Always send a response to prevent "message port closed" errors
  sendResponse({ success: true });
  return true; // Keep the message channel open for async response
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Collaborative Sidebar extension installed.');
  } else if (details.reason === 'update') {
    console.log('Collaborative Sidebar extension updated.');
  }
});

// Optional: Handle action clicks (for extensions with browser_action or page_action)
if (chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked on tab:', tab.id);
    // You can open the sidepanel or perform other actions here
  });
} else {
  console.log('chrome.action.onClicked not available');
}

// CRITICAL FIX: Monitor tab changes to trigger presence updates
// When user switches to a different tab, notify sidepanel to leave old page
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('🔄 BACKGROUND: Tab activated:', activeInfo.tabId);
  
  // Send message to sidepanel to handle tab change
  try {
    await chrome.runtime.sendMessage({
      type: 'TAB_CHANGED',
      tabId: activeInfo.tabId,
      windowId: activeInfo.windowId
    });
    console.log('✅ BACKGROUND: Sent TAB_CHANGED message to sidepanel');
  } catch (error) {
    console.log('🔍 BACKGROUND: Sidepanel not open or error sending TAB_CHANGED:', error.message);
  }
});

// CRITICAL FIX: Monitor tab URL updates to trigger presence updates
// When user navigates to a new URL in the same tab, notify sidepanel to leave old page
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only act on URL changes (ignore other updates like loading state, favicon, etc.)
  if (changeInfo.url) {
    console.log('🔄 BACKGROUND: Tab URL updated:', tabId, changeInfo.url);
    
    // Send message to sidepanel to handle URL change
    try {
      await chrome.runtime.sendMessage({
        type: 'TAB_UPDATED',
        tabId: tabId,
        url: changeInfo.url
      });
      console.log('✅ BACKGROUND: Sent TAB_UPDATED message to sidepanel');
    } catch (error) {
      console.log('🔍 BACKGROUND: Sidepanel not open or error sending TAB_UPDATED:', error.message);
    }
  }
});

// CRITICAL FIX: Monitor tab closure to trigger presence cleanup
// When user closes a tab, notify sidepanel to leave that page
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  console.log('🔄 BACKGROUND: Tab closed:', tabId, 'Window closing:', removeInfo.isWindowClosing);
  
  // Send message to sidepanel to handle tab closure
  try {
    await chrome.runtime.sendMessage({
      type: 'TAB_CLOSED',
      tabId: tabId,
      isWindowClosing: removeInfo.isWindowClosing
    });
    console.log('✅ BACKGROUND: Sent TAB_CLOSED message to sidepanel');
  } catch (error) {
    console.log('🔍 BACKGROUND: Sidepanel not open or error sending TAB_CLOSED:', error.message);
  }
});

console.log('Background service worker initialized successfully.');
