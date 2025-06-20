// Supabase Credentials (Replace with your actual credentials)
const SUPABASE_URL = 'https://bvshfzikwwjasluumfkr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2c2hmemlrd3dqYXNsdXVtZmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDU3NjUsImV4cCI6MjA1OTcyMTc2NX0.YuBpfklO3IxI-yFwFBP_2GIlSO-IGYia6CwpRyRd7VA';

// Declare Supabase variable globally but initialize later
let supabase = null; 

// === DEBUGGING: Check how Supabase lib is loaded ===
console.log('Checking Supabase library presence...');
console.log('typeof supabase object:', typeof window.supabase);
console.log('typeof createClient function:', typeof window.createClient);
if (typeof window.supabase === 'object' && window.supabase !== null) {
  console.log('supabase object keys:', Object.keys(window.supabase));
  console.log('typeof supabase.createClient:', typeof window.supabase.createClient);
}
// === END DEBUGGING ===

// Debug function (moved from HTML)
function debug(message) {
  const debugPanel = document.getElementById('debug');
  if (debugPanel) { // Check if panel exists
    const time = new Date().toLocaleTimeString();
    debugPanel.innerHTML += `<div>[${time}] ${message}</div>`;
  }
  console.log(message); // Always log to console
}

// JavaScript for the Collaborative Sidebar

document.addEventListener('DOMContentLoaded', () => {
  debug("DOMContentLoaded event fired.");
  console.log("DOMContentLoaded event fired.");

  // === Initialize Supabase Client HERE ===
  console.log('Attempting to initialize Supabase...');
  debug('Attempting to initialize Supabase...');
  try {
    // Check if the global `supabase` object exists AND has `createClient` (from local file)
    if (typeof window.supabase === 'object' && window.supabase !== null && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized (Method 1).');
        debug('Supabase client initialized (Method 1).');
    } else if (typeof window.createClient === 'function') { 
        // Or if createClient is directly available globally (less common)
        supabase = window.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized (Method 2).');
        debug('Supabase client initialized (Method 2).');
    } else {
        throw new Error('Supabase library not loaded correctly or createClient not found.');
    }
  } catch (error) {
    console.error('Error initializing Supabase inside DOMContentLoaded:', error);
    debug(`Error initializing Supabase inside DOMContentLoaded: ${error.message}`);
    // supabase remains null if initialization fails
  }
  // === END Initialization ===

  // --- Now proceed with the rest of the setup ---
  debug("Document loaded (from JS)");
  console.log("Sidebar JS Loaded");

  // Add debug listeners (moved from HTML)
  document.querySelectorAll('.main-nav-tab').forEach(tab => {
    debug(`Found main tab: ${tab.textContent}`);
    tab.addEventListener('click', () => {
      debug(`Main tab clicked: ${tab.textContent}`);
    });
  });

  document.querySelectorAll('.sub-nav-tab').forEach(tab => {
    debug(`Found sub tab: ${tab.textContent}`);
    tab.addEventListener('click', () => {
      debug(`Sub tab clicked: ${tab.textContent}`);
    });
  });

  // --- Element References ---
  const mainTabs = document.querySelectorAll('.main-nav-tab');
  const mainTabContents = document.querySelectorAll('.main-tab-content');
  
  const communityDropdownTrigger = document.querySelector('.community-dropdown-trigger');
  const communityDropdownPanel = document.getElementById('community-dropdown-panel');
  const closeCommunityDropdownButton = document.getElementById('close-community-dropdown');
  const closeSidebarButton = document.getElementById('close-sidebar-btn');

  const modal = document.getElementById('mini-profile-modal');
  const closeModalButton = modal?.querySelector('.close-button');

  // --- Main Tab Switching Logic ---
  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTabId = tab.getAttribute('data-tab');
      console.log(`Switching to main tab: ${targetTabId}`);

      // Deactivate all main tabs and content
      mainTabs.forEach(t => t.classList.remove('active'));
      mainTabContents.forEach(c => c.classList.remove('active'));

      // Activate the clicked tab and its corresponding content
      tab.classList.add('active');
      const targetTabContent = document.getElementById(targetTabId);
      if (targetTabContent) {
        targetTabContent.classList.add('active');
        console.log(`Activated content: #${targetTabId}`);
      } else {
        console.error(`Content for main tab #${targetTabId} not found!`);
      }
    });
  });

  // --- Sub-Tab Switching Logic ---
  // Get all sub-tab buttons and add click listeners to them directly
  document.querySelectorAll('.sub-nav-tab').forEach(subTab => {
    subTab.addEventListener('click', () => {
      const targetSubTabId = subTab.getAttribute('data-subtab');
      console.log(`Switching to sub-tab: ${targetSubTabId}`);

      // Find the parent tab content
      const parentMainContent = subTab.closest('.main-tab-content');
      if (!parentMainContent) {
        console.error("Could not find parent main content for sub-tab.");
        return;
      }

      // Deactivate all sub-tabs in this tab group
      const subTabGroup = subTab.closest('.sidebar-nav-sub');
      subTabGroup.querySelectorAll('.sub-nav-tab').forEach(st => {
        st.classList.remove('active');
      });
      
      // Deactivate all content panels in this tab content
      parentMainContent.querySelectorAll('.sub-tab-content').forEach(stc => {
        stc.classList.remove('active');
      });

      // Activate this sub-tab and its content
      subTab.classList.add('active');
      const targetSubContent = document.getElementById(targetSubTabId);
      if (targetSubContent) {
        targetSubContent.classList.add('active');
        console.log(`Activated sub-content: #${targetSubTabId}`);
      } else {
        console.error(`Sub-content #${targetSubTabId} not found!`);
      }
    });
  });

  // --- Community Dropdown Logic ---
  if (communityDropdownTrigger) {
    communityDropdownTrigger.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent click from immediately closing dropdown
      if (communityDropdownPanel) {
        // Toggle visibility
        if (communityDropdownPanel.style.display === 'block') {
          communityDropdownPanel.style.display = 'none';
          console.log("Community dropdown hidden");
        } else {
          communityDropdownPanel.style.display = 'block';
          console.log("Community dropdown shown");
        }
      }
    });
  }

  if (closeCommunityDropdownButton && communityDropdownPanel) {
    closeCommunityDropdownButton.addEventListener('click', () => {
      communityDropdownPanel.style.display = 'none';
      console.log("Community dropdown closed via button");
    });
  }

  // Close dropdown if clicking outside
  document.addEventListener('click', (event) => {
    if (communityDropdownPanel && communityDropdownPanel.style.display === 'block') {
      if (!communityDropdownPanel.contains(event.target) && 
          !communityDropdownTrigger.contains(event.target)) {
        communityDropdownPanel.style.display = 'none';
        console.log("Community dropdown closed via outside click");
      }
    }
  });

  // --- Sidebar Close Button ---
  if (closeSidebarButton) {
    closeSidebarButton.addEventListener('click', () => {
      console.log("Close sidebar button clicked");
      // For Chrome side panel, we can't close it from within the panel itself
      // You would need to send a message to background.js
    });
  }

  // --- Mini Profile Modal Logic ---
  if (modal && closeModalButton) {
    // Function to open the modal
    function openModal(name, status) {
      const modalName = document.getElementById('modal-name');
      const modalStatus = document.getElementById('modal-status');
      if (modalName) modalName.textContent = name || 'N/A';
      if (modalStatus) modalStatus.textContent = status || 'Unknown';
      modal.style.display = 'flex';
      console.log(`Modal opened for ${name}`);
    }

    // Function to close the modal
    function closeModal() {
      modal.style.display = 'none';
      console.log("Modal closed");
    }

    closeModalButton.addEventListener('click', closeModal);

    // Close modal if clicked outside the content area
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Temporary: Add click listeners to list items to open modal
    document.querySelectorAll('.item-list li').forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't open modal if clicking on a button
        if (e.target.closest('button')) {
          return;
        }
        
        const nameElement = item.querySelector('.item-name');
        const statusElement = item.querySelector('.item-status, .item-last-message');
        const name = nameElement ? nameElement.textContent : 'Unknown User';
        const status = statusElement ? statusElement.textContent : 'Status unavailable';
        
        // Don't open modal for friend requests
        if (item.closest('.request-list')) return;
        
        openModal(name, status);
      });
    });
  }

  // Get auth elements
  const loginBtn = document.getElementById('google-login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // Attach auth listeners
  if (loginBtn) {
    loginBtn.addEventListener('click', signInWithGoogle);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', signOut);
  }

  // Check initial auth state *only if supabase initialized*
  if (supabase) {
      console.log("Supabase client exists, checking initial session...");
      debug("Supabase client exists, checking initial session...");
      supabase.auth.getSession().then(({ data: { session } }) => {
        debug(`Initial session check: ${session ? 'User found' : 'No user'}`);
        updateUI(session?.user ?? null);
      }).catch(error => {
        console.error('Error getting initial session:', error);
        debug(`Error getting initial session: ${error.message}`);
        updateUI(null);
      });

      // Listen for auth changes *only if supabase initialized*
      supabase.auth.onAuthStateChange((_event, session) => {
        debug(`Auth state changed: ${_event} - ${session ? 'User found' : 'No user'}`);
        updateUI(session?.user ?? null);
      });
      updateUI(null); // Initial UI state before session check completes
  } else {
      console.error("Supabase client failed to initialize. Auth features disabled.");
      debug("Supabase client failed to initialize. Auth features disabled.");
      updateUI(null); // Ensure UI reflects logged-out state
  }

  console.log("Sidebar setup complete");
  debug("Sidebar setup complete (from JS)");
});

// --- UI Update Function ---
function updateUI(user) {
  const loginBtn = document.getElementById('google-login-btn');
  const userInfoDiv = document.getElementById('user-info');
  const userNameSpan = document.getElementById('user-name');
  const userAvatarImg = document.getElementById('user-avatar');

  if (user) {
    // User is logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (userInfoDiv) userInfoDiv.style.display = 'flex';
    if (userNameSpan) userNameSpan.textContent = user.user_metadata?.full_name || user.email;
    if (userAvatarImg) userAvatarImg.src = user.user_metadata?.avatar_url || '/images/default-avatar.png'; // Use a default avatar if needed
    debug(`User logged in: ${userNameSpan.textContent}`);
  } else {
    // User is logged out
    if (loginBtn) loginBtn.style.display = 'block';
    if (userInfoDiv) userInfoDiv.style.display = 'none';
    debug('User logged out or not logged in.');
  }
}

// --- Auth Functions ---
async function signInWithGoogle() {
  debug('Requesting Google Sign-In via background script...');
  try {
    // Send message to background script (fire and forget)
    chrome.runtime.sendMessage({ type: 'LOGIN_REQUEST' });
    // REMOVED await and response handling:
    // const response = await chrome.runtime.sendMessage({ type: 'LOGIN_REQUEST' });
    // debug(`Background script responded to login request: ${JSON.stringify(response)}`);
    // if (response?.status !== 'success') {
    //    throw new Error(response?.message || 'Background script failed to initiate login.');
    // }
    debug('Login request sent to background script.');
    // onAuthStateChange listener will handle the UI update upon successful login.
  } catch (error) {
    // This catch block now only handles errors during the *sending* of the message
    console.error('Error sending login request message:', error);
    debug(`Login Request Send Error: ${error.message}`);
  }
}

async function signOut() {
  // Sign out can likely still happen here, as it doesn't need a popup
  if (!supabase) return console.error('Supabase client not initialized.');
  debug('Attempting Sign-Out...');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    debug('Sign-Out successful.');
    updateUI(null); // Update UI immediately on logout
  } catch (error) {
    console.error('Error signing out:', error);
    debug(`Sign-Out Error: ${error.message}`);
  }
} 