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

// Import Supabase using the static import suitable for service workers
try {
  importScripts('lib/supabase.min.js'); 
  console.log('Supabase library imported successfully in background.');
} catch (e) {
  console.error('Error importing Supabase library in background:', e);
}

const SUPABASE_URL = 'https://bvshfzikwwjasluumfkr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c2hmemlrd3dqYXNsdXVtZmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDU3NjUsImV4cCI6MjA1OTcyMTc2NX0.YuBpfklO3IxI-yFwFBP_2GIlSO-IGYia6CwpRyRd7VA';

let backgroundSupabase = null;
try {
  if (typeof supabase !== 'undefined' && supabase.createClient) { 
    backgroundSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Background Supabase client initialized.');
  } else {
    throw new Error('Supabase library not loaded correctly or createClient not found in background.');
  }
} catch (error) {
  console.error('Error initializing Background Supabase:', error);
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Collaborative Sidebar extension installed/updated.');
  chrome.storage.sync.set({ sidebarMode: 'overlay' });
});

// Listen for messages from content scripts AND sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message, "from:", sender);

  if (message.type === 'LOGIN_REQUEST') {
    console.log("Received LOGIN_REQUEST from sidepanel.");
    if (!backgroundSupabase) {
      console.error("Background Supabase client not initialized. Cannot handle login.");
      sendResponse({ success: false, error: 'Supabase client not ready' });
      return false;
    }

    (async () => {
      try {
        // 1. Construct Google OAuth URL manually
        const redirectUri = chrome.identity.getRedirectURL();
        const clientId = '323445937864-mn658sdkavg5100akt3ep379loc3eeb7.apps.googleusercontent.com'; // Replace with your actual client ID
        const scope = 'openid email profile'; // Add other scopes as needed
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;

        console.log("Google Auth URL:", googleAuthUrl);

        // 2. Launch Chrome Web Auth Flow
        console.log("Launching Chrome Web Auth Flow...");
        chrome.identity.launchWebAuthFlow(
          { url: googleAuthUrl, interactive: true },
          async (responseUrl) => {
            console.log("launchWebAuthFlow callback called");

            if (chrome.runtime.lastError) {
              console.error("launchWebAuthFlow Error:", chrome.runtime.lastError.message);
              sendResponse({ success: false, error: `Auth flow error: ${chrome.runtime.lastError.message}` });
              return;
            }

            if (!responseUrl) {
              console.error("Auth flow cancelled or failed: No response URL.");
              sendResponse({ success: false, error: 'Authentication flow cancelled or failed.' });
              return;
            }

            console.log("Auth flow succeeded. Response URL:", responseUrl);

            // 3. Extract Authorization Code
            const urlParams = new URLSearchParams(new URL(responseUrl).search);
            const code = urlParams.get('code');

            if (!code) {
              console.error("Could not extract authorization code from response URL.");
              sendResponse({ success: false, error: 'Failed to parse authorization code from auth response.' });
              return;
            }

            console.log("Extracted authorization code:", code);

           // 4. Exchange Code for Session using Supabase
            console.log("Exchanging code for session with Supabase...");

            // Use a proxy to bypass origin validation
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Replace with your own proxy server

            const tokenEndpoint = SUPABASE_URL + '/auth/v1/token?grant_type=authorization_code';
            const requestData = {
              code: code,
              grant_type: 'authorization_code',
              redirect_to: redirectUri,
            };

            console.log("Sending request to token endpoint:", tokenEndpoint);
            console.log("Request data:", JSON.stringify(requestData));


            try {
              const response = await fetch(proxyUrl + tokenEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': SUPABASE_ANON_KEY, // Supabase anon key
                },
                body: JSON.stringify(requestData),
              });

              if (!response.ok) {
                console.error("Error exchanging code for session:", response.status, response.statusText, await response.text());
                sendResponse({ success: false, error: `Supabase session error: ${response.statusText}` });
                return;
              }

              const data = await response.json();

              console.log("Response from token endpoint:", JSON.stringify(data));

              if (data.error) {
                console.error("Error exchanging code for session:", data.error);
                sendResponse({ success: false, error: `Supabase session error: ${data.error_description || data.message}` });
                return;
              }

              console.log("Supabase session exchanged successfully!");
              sendResponse({ success: true });

            } catch (e) {
              console.error("Error during proxy request:", e);
              sendResponse({ success: false, error: e.message || 'Unknown login error' });
            }


      }
        );
      } catch (e) {
        console.error("Error during login process:", e);
        sendResponse({ success: false, error: e.message || 'Unknown login error' });
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

// Auth state change listener (optional but good for debugging)
if (backgroundSupabase) {
  backgroundSupabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed in background:', event, session?.user?.email);
    // ... (rest of the listener)
  });
}

console.log("Background service worker started.");