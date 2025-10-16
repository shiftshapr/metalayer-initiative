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
