// Explicitly register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/background.js')
    .then(registration => {
      console.log('Service worker registered:', registration);
    })
    .catch(error => {
      console.error('Service worker registration failed:', error);
    });
}

// Background service worker for the Collaborative Sidebar extension
console.log("Background service worker started.");

chrome.runtime.onInstalled.addListener(() => {
  console.log('Collaborative Sidebar extension installed/updated.');
  chrome.storage.sync.set({ sidebarMode: 'overlay' });
});

// Listen for messages from content scripts AND sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message, "from:", sender);

  if (message.type === 'TEST_MESSAGE') {
    console.log("Received TEST_MESSAGE from sidepanel.");
    sendResponse({ success: true, message: 'Background script is working!' });
    return true;
  }

  if (message.type === 'GOOGLE_AUTH_REQUEST') {
    console.log("Received GOOGLE_AUTH_REQUEST from sidepanel.");
    
    (async () => {
      try {
        // Use Chrome's built-in identity API for Google OAuth
        console.log("Starting Google OAuth flow...");
        console.log("Chrome identity API available:", typeof chrome.identity);
        console.log("Chrome identity getAuthToken available:", typeof chrome.identity.getAuthToken);
        
        // REAL OAuth2 - Use Chrome's built-in identity API with new client ID
        console.log("Starting REAL Google OAuth2 with Chrome identity API...");
        

        // Use Chrome's built-in OAuth with the new client ID
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            console.error("Chrome identity failed:", chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          
          if (!token) {
            console.error("No token received from Google OAuth");
            sendResponse({ success: false, error: 'No authentication token received' });
            return;
          }
          
          console.log("Google OAuth token received:", token);
          
          // Get user info from Google
          fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`)
            .then(response => response.json())
            .then(userInfo => {
              console.log("Real Google user info:", userInfo);
              
              chrome.storage.local.set({
                googleUser: userInfo
              }, () => {
                console.log("Real Google user stored:", userInfo);
                sendResponse({ 
                  success: true, 
                  user: {
                    id: userInfo.id,
                    email: userInfo.email,
                    user_metadata: {
                      full_name: userInfo.name,
                      avatar_url: userInfo.picture
                    }
                  }
                });
              });
            })
            .catch(error => {
              console.error("Error fetching user info:", error);
              sendResponse({ success: false, error: 'Failed to fetch user information' });
            });
        });

      } catch (e) {
        console.error("Error during Google OAuth process:", e);
        sendResponse({ success: false, error: e.message || 'Unknown OAuth error' });
      }
    })();

    return true; // Indicate asynchronous response
  }

  // Handle sidebar toggle
  if (message.action === "toggleSidebar") {
    console.log("Received toggleSidebar message from content script");
    (async () => {
      const tabId = sender.tab?.id;
      if (tabId) {
        try {
          await chrome.sidePanel.open({ tabId });
          console.log("Side panel opened/focused for tab:", tabId);
        } catch (error) {
          console.error("Error handling side panel toggle:", error);
          try {
            const currentWindow = await chrome.windows.getLastFocused({ populate: false });
            if (currentWindow?.id) {
              await chrome.sidePanel.open({ windowId: currentWindow.id });
              console.log("Side panel opened for window:", currentWindow.id);
            }
          } catch (winError) {
            console.error("Error opening side panel on window:", winError);
          }
        }
      } else {
        console.error("Could not get tab ID from sender.");
      }
    })();
    return false;
  }

  return false;
});