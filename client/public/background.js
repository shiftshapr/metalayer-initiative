// Background script for Metalayer extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Metalayer extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
});

// Google OAuth using Chrome Identity API with getAuthToken (simpler approach)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'googleSignIn') {
    chrome.identity.getAuthToken(
      { interactive: true },
      (token) => {
        if (chrome.runtime.lastError) {
          console.error('Auth error:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        
        if (token) {
          // Get user info using the token
          fetch('https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + token)
            .then(response => response.json())
            .then(userInfo => {
              console.log('User info:', userInfo);
              // Send user info to your backend
              fetch('http://localhost:3001/auth/google/token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  token: token,
                  userInfo: userInfo 
                })
              })
              .then(response => response.json())
              .then(data => {
                console.log('Backend response:', data);
                sendResponse({ success: true, user: userInfo, backendResponse: data });
              })
              .catch(error => {
                console.error('Backend error:', error);
                sendResponse({ success: false, error: error.message });
              });
            })
            .catch(error => {
              console.error('User info error:', error);
              sendResponse({ success: false, error: error.message });
            });
        } else {
          sendResponse({ success: false, error: 'No token received' });
        }
      }
    );
    
    return true; // Will respond asynchronously
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getExtensionInfo') {
    sendResponse({
      name: 'Metalayer Sidebar',
      version: '1.0.0',
      description: 'A sidebar overlay for Metalayer, providing chat, community, and agent features.'
    });
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['contentScript.js']
    }).catch(() => {
      // Script might already be injected
    });
  }
}); 