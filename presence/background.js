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

console.log('Background service worker initialized successfully.');
