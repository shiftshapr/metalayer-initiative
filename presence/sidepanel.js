// Meta-Layer Initiative API Configuration
const METALAYER_API_URL = 'http://localhost:3002';

// API client for Meta-Layer Initiative
class MetaLayerAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getCommunities() {
    return this.request('/communities');
  }

  async getAvatars(communityId) {
    return this.request(`/avatars/active?communityId=${communityId}`);
  }

  async login() {
    return this.request('/auth/login', { method: 'POST' });
  }

  async getMe() {
    return this.request('/auth/me');
  }
}

// Initialize API client
const api = new MetaLayerAPI(METALAYER_API_URL);

// Initialize Loosely Coupled Auth Manager
const authManager = new AuthManager(); 

// === DEBUGGING: Check API connection ===
console.log('Meta-Layer Initiative API initialized');
console.log('API URL:', METALAYER_API_URL);
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

document.addEventListener('DOMContentLoaded', async () => {
  debug("DOMContentLoaded event fired.");
  console.log("DOMContentLoaded event fired.");

  // === Register Auth Providers ===
  authManager.registerProvider('supabase', new SupabaseAuthProvider());
  authManager.registerProvider('metalayer', new MetalayerAuthProvider());
  
  // === Initialize Auth Manager ===
  const authReady = await authManager.initialize();
  if (authReady) {
    console.log('Auth Manager ready');
    debug('Auth Manager ready');
    
    // Set up auth state listener
    authManager.onAuthStateChange((event, data) => {
      debug(`Auth state changed: ${event} - ${data ? 'User found' : 'No user'}`);
      updateUI(data?.user ?? null);
    });
    
    // Check initial auth state
    const user = await authManager.getCurrentUser();
    updateUI(user);
  } else {
    console.log('Auth system failed to initialize');
    debug('Auth system failed to initialize');
  }
  
  // Load communities and initialize the interface
  loadCommunities();
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
  const googleLoginBtn = document.getElementById('google-login-btn');
  const magicLinkBtn = document.getElementById('magic-link-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const magicLinkModal = document.getElementById('magic-link-modal');
  const closeMagicLinkModal = document.getElementById('close-magic-link-modal');
  const sendMagicLinkBtn = document.getElementById('send-magic-link');
  const magicLinkEmail = document.getElementById('magic-link-email');

  // Attach auth listeners
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => signInWithGoogle());
  }
  if (magicLinkBtn) {
    magicLinkBtn.addEventListener('click', () => {
      magicLinkModal.style.display = 'block';
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => signOut());
  }
  if (closeMagicLinkModal) {
    closeMagicLinkModal.addEventListener('click', () => {
      magicLinkModal.style.display = 'none';
    });
  }
  if (sendMagicLinkBtn) {
    sendMagicLinkBtn.addEventListener('click', () => sendMagicLink());
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
  try {
    debug('Attempting Google sign-in...');
    await authManager.signIn('google');
    debug('Google sign-in successful');
  } catch (error) {
    console.error('Google sign-in failed:', error);
    debug(`Google sign-in error: ${error.message}`);
  }
}

async function sendMagicLink() {
  try {
    const email = document.getElementById('magic-link-email').value;
    if (!email) {
      document.getElementById('magic-link-status').textContent = 'Please enter an email address';
      return;
    }

    document.getElementById('magic-link-status').textContent = 'Sending magic link...';
    debug(`Attempting magic link sign-in for: ${email}`);
    
    await authManager.signIn('magic_link', email);
    
    document.getElementById('magic-link-status').textContent = 'Magic link sent! Check your email.';
    document.getElementById('magic-link-modal').style.display = 'none';
    debug('Magic link sent successfully');
  } catch (error) {
    console.error('Magic link sign-in failed:', error);
    document.getElementById('magic-link-status').textContent = `Error: ${error.message}`;
    debug(`Magic link error: ${error.message}`);
  }
}

async function signOut() {
  try {
    debug('Attempting sign-out...');
    await authManager.signOut();
    debug('Sign-out successful');
  } catch (error) {
    console.error('Sign-out failed:', error);
    debug(`Sign-out error: ${error.message}`);
  }
} 