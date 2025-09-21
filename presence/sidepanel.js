// Meta-Layer Initiative API Configuration
const METALAYER_API_URL = 'http://216.238.91.120:3002';

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
  const debugContent = document.getElementById('debug-content');
  if (debugContent) {
    const time = new Date().toLocaleTimeString();
    debugContent.innerHTML += `<div>[${time}] ${message}</div>`;
    debugContent.scrollTop = debugContent.scrollHeight;
  }
  console.log(message); // Always log to console
}

function toggleDebugPanel() {
  const debugContent = document.getElementById('debug-content');
  const debugToggle = document.getElementById('debug-toggle');
  
  if (debugContent && debugToggle) {
    if (debugContent.style.display === 'none') {
      debugContent.style.display = 'block';
      debugToggle.textContent = '▲';
    } else {
      debugContent.style.display = 'none';
      debugToggle.textContent = '▼';
    }
  }
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
}

// --- Authentication Check Functions ---
async function requireAuth(action, callback) {
  try {
    // Check storage directly instead of relying on auth manager cache
    const result = await chrome.storage.local.get(['googleUser', 'supabaseUser', 'metalayerUser']);
    const currentUser = result.googleUser || result.supabaseUser || result.metalayerUser;
    
    console.log('requireAuth called for:', action, 'currentUser:', currentUser);
    debug(`requireAuth called for: ${action}, currentUser: ${currentUser ? 'exists' : 'null'}`);
    
    if (!currentUser) {
      console.log('No user found, showing auth prompt');
      showAuthPrompt(action);
      return false;
    }
    console.log('User found, executing callback');
    if (callback) callback();
    return true;
  } catch (error) {
    console.log('Error checking auth, showing auth prompt');
    showAuthPrompt(action);
    return false;
  }
}

function showAuthPrompt(action) {
  console.log('showAuthPrompt called for:', action);
  const authPrompt = document.getElementById('auth-prompt-modal');
  if (!authPrompt) {
    console.log('Creating auth prompt modal');
    createAuthPromptModal();
  }
  
  const actionText = document.getElementById('auth-prompt-action');
  if (actionText) {
    actionText.textContent = action;
  }
  
  // Show which auth provider is available
  const providerName = authManager.currentProvider?.name || 'unknown';
  const providerInfo = document.getElementById('auth-prompt-provider');
  if (providerInfo) {
    providerInfo.textContent = `Using ${providerName} authentication`;
  }
  
  const modal = document.getElementById('auth-prompt-modal');
  if (modal) {
    modal.style.display = 'block';
    console.log('Auth prompt modal displayed');
  } else {
    console.error('Auth prompt modal not found!');
  }
  debug(`Auth required for: ${action} (provider: ${providerName})`);
}

function createAuthPromptModal() {
  const modal = document.createElement('div');
  modal.id = 'auth-prompt-modal';
  modal.className = 'modal';
  modal.style.display = 'none';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Authentication Required</h3>
        <button id="close-auth-prompt" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <p>You need to sign in to <span id="auth-prompt-action">perform this action</span>.</p>
        <p class="provider-info" id="auth-prompt-provider" style="font-size: 0.9em; color: #666; margin: 10px 0;"></p>
        <div class="auth-prompt-buttons">
          <button id="auth-prompt-google" class="auth-button google">Sign in with Google</button>
          <button id="auth-prompt-magic" class="auth-button magic">Sign in with Magic Link</button>
        </div>
        <button id="auth-prompt-cancel" class="cancel-button">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('close-auth-prompt').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('auth-prompt-cancel').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('auth-prompt-google').addEventListener('click', () => {
    modal.style.display = 'none';
    signInWithGoogle();
  });
  
  document.getElementById('auth-prompt-magic').addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('magic-link-modal').style.display = 'block';
  });
  
  // Close modal if clicked outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// --- Community Management Functions ---
async function loadCommunities() {
  try {
    debug('Loading communities...');
    const response = await api.getCommunities();
    const communities = response.communities || response; // Handle both formats
    debug(`Loaded ${communities.length} communities`);
    
    // Update community dropdown
    updateCommunityDropdown(communities);
    
    // Load avatars for the first community
    if (communities.length > 0) {
      await loadAvatars(communities[0].id);
    }
  } catch (error) {
    console.error('Failed to load communities:', error);
    debug(`Failed to load communities: ${error.message}`);
    
    // Fallback: show default community
    updateCommunityDropdown([{ id: 'default', name: 'Main Community' }]);
  }
}

async function loadAvatars(communityId) {
  try {
    debug(`Loading avatars for community ${communityId}...`);
    const response = await api.getAvatars(communityId);
    debug(`Raw API response:`, response);
    
    // Handle different response formats
    let avatars;
    if (response && response.active && Array.isArray(response.active)) {
      avatars = response.active;
    } else if (Array.isArray(response)) {
      avatars = response;
    } else {
      avatars = [];
    }
    
    debug(`Processed avatars:`, avatars);
    debug(`Loaded ${avatars.length} avatars`);
    
    // Update the visible tab with avatar data
    updateVisibleTab(avatars);
  } catch (error) {
    console.error('Failed to load avatars:', error);
    debug(`Failed to load avatars: ${error.message}`);
  }
}

function updateCommunityDropdown(communities) {
  const communityList = document.querySelector('.community-list');
  if (!communityList) return;
  
  // Clear existing communities
  communityList.innerHTML = '';
  
  // Add communities to the list
  communities.forEach((community, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="/images/community${index + 1}.png" alt="Community" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjEwIiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K'">
      <span>${community.name}</span>
      ${index === 0 ? '<span class="primary-tag">Primary</span>' : ''}
    `;
    
    // Add click handler to switch communities
    li.addEventListener('click', () => {
      switchCommunity(community);
    });
    
    communityList.appendChild(li);
  });
}

function updateVisibleTab(avatars) {
  const visibleTab = document.getElementById('canopi-visible');
  if (!visibleTab) return;
  
  // Create a simple list of visible users
  visibleTab.innerHTML = `
    <div class="visible-users">
      <h3>Visible Users (${avatars.length})</h3>
      <ul class="item-list">
        ${avatars.map((avatar, index) => `
          <li class="user-item" data-user-id="${avatar.userId}" data-user-name="${avatar.name}" data-index="${index}">
            <div class="avatar-container">
              <div class="avatar-placeholder" style="background-color: ${getAvatarColor(avatar.name)}">
                ${avatar.name.charAt(0).toUpperCase()}
              </div>
              <div class="status-dot-overlay online"></div>
            </div>
            <div class="item-details">
              <div class="item-name">${avatar.name}</div>
              <div class="item-status">Online</div>
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  
  // Add event listeners to user items
  const userItems = visibleTab.querySelectorAll('.user-item');
  userItems.forEach(item => {
    item.addEventListener('click', () => {
      const userId = item.dataset.userId;
      const userName = item.dataset.userName;
      requireAuth('view user profiles', () => openUserProfile(userId, userName));
    });
  });
}

function openUserProfile(userId, userName) {
  debug(`Opening profile for: ${userName} (${userId})`);
  // TODO: Implement user profile modal
}

function switchCommunity(community) {
  debug(`Switching to community: ${community.name}`);
  
  // Update the current community name in the header
  const currentCommunityName = document.getElementById('current-community-name');
  if (currentCommunityName) {
    currentCommunityName.textContent = community.name;
  }
  
  // Close the dropdown
  const communityDropdownPanel = document.getElementById('community-dropdown-panel');
  if (communityDropdownPanel) {
    communityDropdownPanel.style.display = 'none';
  }
  
  // Load avatars for the new community
  loadAvatars(community.id);
}

function getAvatarColor(name) {
  // Generate a consistent color based on the name
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// --- UI Update Function ---
function updateUI(user) {
  const userInfoDiv = document.getElementById('user-info');
  const userMenuName = document.getElementById('user-menu-name');
  const userAvatarImg = document.getElementById('user-avatar');

  if (user) {
    // User is logged in - show user info
    if (userInfoDiv) userInfoDiv.style.display = 'flex';
    if (userMenuName) userMenuName.textContent = user.user_metadata?.full_name || user.email;
    if (userAvatarImg) {
      userAvatarImg.src = user.user_metadata?.avatar_url || '/images/avatar-placeholder.png';
      userAvatarImg.alt = user.user_metadata?.full_name || user.email;
    }
    debug(`User logged in: ${userMenuName?.textContent}`);
    console.log('UI updated: User authenticated, showing user info');
  } else {
    // User is logged out - hide user info
    if (userInfoDiv) userInfoDiv.style.display = 'none';
    debug('User logged out or not logged in.');
    console.log('UI updated: User not authenticated, hiding user info');
  }
}

// --- Auth Functions ---
async function signInWithGoogle() {
  try {
    debug('Attempting Google sign-in...');
    const result = await authManager.signIn('google');
    debug('Google sign-in successful:', result);
    
    // Update UI with the authenticated user
    if (result && result.user) {
      updateUI(result.user);
      debug(`User authenticated: ${result.user.email}`);
    }
  } catch (error) {
    console.error('Google sign-in failed:', error);
    debug(`Google sign-in error: ${error.message}`);
    
    // Show error to user
    const statusElement = document.getElementById('magic-link-status');
    if (statusElement) {
      statusElement.textContent = `Sign-in failed: ${error.message}`;
      statusElement.style.color = 'red';
    }
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
    
    const result = await authManager.signIn('magic_link', email);
    
    if (result && result.user) {
      document.getElementById('magic-link-status').textContent = 'Magic link sent! Check your email.';
      updateUI(result.user);
      debug(`Magic link successful: ${result.user.email}`);
    } else {
      document.getElementById('magic-link-status').textContent = 'Magic link sent! Check your email.';
    }
    document.getElementById('magic-link-modal').style.display = 'none';
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

// JavaScript for the Collaborative Sidebar

document.addEventListener('DOMContentLoaded', async () => {
  debug("DOMContentLoaded event fired.");
  console.log("DOMContentLoaded event fired.");

  // === Register Auth Providers ===
  authManager.registerProvider('supabase', new SupabaseAuthProvider());
  authManager.registerProvider('metalayer', new MetalayerAuthProvider());
  authManager.registerProvider('offline', new OfflineAuthProvider());
  
  // === Initialize Auth Manager ===
  console.log('Starting auth manager initialization...');
  
  // Try to initialize with timeout
  try {
    const authReady = await Promise.race([
      authManager.initialize(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth initialization timeout')), 3000)
      )
    ]);
    
    console.log('Auth manager initialization result:', authReady);
    
    if (authReady) {
      console.log('Auth Manager ready');
      console.log('Current provider:', authManager.currentProvider?.name);
      
      // Set up auth state listener
      authManager.onAuthStateChange((event, data) => {
        console.log('Auth state changed:', event, data);
        updateUI(data?.user ?? null);
      });
      
      // Check initial auth state
      const user = await authManager.getCurrentUser();
      console.log('Initial user:', user);
      
      // Force real authentication - clear any stored users
      if (user) {
        console.log('Found stored user, clearing and requiring real auth');
        try {
          await authManager.signOut();
        } catch (error) {
          console.log('Sign out failed, clearing storage manually');
        }
        // Always clear storage manually to ensure clean state
        await chrome.storage.local.clear();
        // Force auth manager to clear its cache
        authManager.currentUser = null;
        updateUI(null);
      } else {
        updateUI(null);
      }
    } else {
      console.log('Auth system failed to initialize');
    }
  } catch (error) {
    console.error('Auth initialization failed:', error.message);
    
    // Don't fall back to offline mode - force real auth
    console.log('Forcing real authentication - no offline fallback');
    updateUI(null);
  }
  
  // Load communities and initialize the interface
  try {
    console.log('Loading communities...');
    loadCommunities();
    console.log('Communities loaded successfully');
  } catch (error) {
    console.error('Error loading communities:', error);
  }
  
  // Ensure UI is updated regardless of auth status
  console.log('Updating UI...');
  updateUI(null);
  
  console.log('=== END Initialization ===');

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
  
  const communityDropdownTrigger = document.getElementById('community-options-btn');
  const communityDropdownPanel = document.getElementById('community-dropdown-panel');
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
        
        // Special handling for agent tab
        if (targetTabId === 'agent-tab') {
          console.log("Agent tab activated! Initializing agent...");
          initializeAgentTab();
        } else {
          // Clean up agent functions when switching away from agent tab
          if (window.testAgent) {
            delete window.testAgent;
            delete window.askAgent;
            console.log("Agent functions cleaned up");
          }
        }
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
      console.log('Community dropdown clicked');
      event.stopPropagation(); // Prevent click from immediately closing dropdown
      
      // Require authentication to access community selector
      if (!requireAuth('access community settings', () => {
        console.log('Auth passed, toggling community dropdown');
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
      })) {
        console.log('Auth failed for community dropdown');
        return; // Stop execution if not authenticated
      }
    });
  }

  // Note: closeCommunityDropdownButton is not defined in the current HTML structure
  // This code is kept for future use if the button is added

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

  // --- Community Selection Logic ---
  const communityItems = document.querySelectorAll('.community-item');
  communityItems.forEach(item => {
    const checkmark = item.querySelector('.community-checkmark');
    checkmark.addEventListener('click', (event) => {
      event.stopPropagation();
      
      const isCurrentlyActive = checkmark.classList.contains('active');
      
      if (isCurrentlyActive) {
        // If currently active, uncheck it
        checkmark.classList.remove('active');
        const communityName = item.querySelector('.community-name').textContent;
        console.log(`Unchecked community: ${communityName}`);
      } else {
        // If not active, check it and uncheck others
        // Remove active class from all checkmarks
        communityItems.forEach(ci => {
          ci.querySelector('.community-checkmark').classList.remove('active');
        });
        
        // Add active class to clicked checkmark
        checkmark.classList.add('active');
        
        // Get community name and update header
        const communityName = item.querySelector('.community-name').textContent;
        console.log(`Selected community: ${communityName}`);
      }
      
      // Close dropdown after selection
      communityDropdownPanel.style.display = 'none';
    });
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

  // Get auth elements (auth buttons removed, only logout remains)
  const logoutBtn = document.getElementById('logout-btn');
  const userAvatar = document.getElementById('user-avatar');
  const userMenu = document.getElementById('user-menu');
  const magicLinkModal = document.getElementById('magic-link-modal');
  const closeMagicLinkModal = document.getElementById('close-magic-link-modal');
  const sendMagicLinkBtn = document.getElementById('send-magic-link');
  const magicLinkEmail = document.getElementById('magic-link-email');

  // Attach auth listeners (auth buttons removed, only avatar menu remains)
  if (userAvatar) {
    userAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userMenu) {
        userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
      }
    });
  }
  
  // Close user menu when clicking outside
  document.addEventListener('click', (e) => {
    if (userMenu && !userMenu.contains(e.target) && !userAvatar.contains(e.target)) {
      userMenu.style.display = 'none';
    }
  });
  
  // Test background script communication
  const testBackgroundBtn = document.getElementById('test-background-btn');
  if (testBackgroundBtn) {
    testBackgroundBtn.addEventListener('click', () => {
      console.log('Test background button clicked');
      chrome.runtime.sendMessage({ type: 'TEST_MESSAGE' }, (response) => {
        console.log('Test response from background:', response);
        if (chrome.runtime.lastError) {
          console.error('Test error:', chrome.runtime.lastError);
        }
      });
    });
  }
  // Magic Link button removed from HTML, so no event listener needed
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      debug('Logout button clicked');
      signOut();
      // Close the user menu after logout
      if (userMenu) userMenu.style.display = 'none';
    });
  }
  if (closeMagicLinkModal) {
    closeMagicLinkModal.addEventListener('click', () => {
      magicLinkModal.style.display = 'none';
    });
  }
  if (sendMagicLinkBtn) {
    sendMagicLinkBtn.addEventListener('click', () => sendMagicLink());
  }

// --- Canopi Chat Functionality ---
let canopiWebSocket = null;
let currentUser = null;
let isConnected = false;

function initializeCanopiChat() {
  console.log("Initializing Canopi chat...");
  
  const chatMessages = document.getElementById('canopi-chat-messages');
  const messageInput = document.getElementById('canopi-message-input');
  const sendButton = document.getElementById('canopi-send-btn');
  const replyCancelBtn = document.getElementById('reply-cancel-btn');
  
  if (!chatMessages || !messageInput || !sendButton) {
    console.log("Canopi chat elements not found, skipping initialization");
    return;
  }
  
  // Initialize user (you can customize this)
  currentUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: 'You',
    avatar: 'Y'
  };
  
  // Connect to WebSocket
  connectWebSocket();
  
  // Add sample messages for demonstration (only if not connected)
  if (!isConnected) {
    addSampleMessages();
  }
  
  // Set up send button
  sendButton.addEventListener('click', sendCanopiMessage);
  
  // Set up Enter key for sending
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCanopiMessage();
    }
  });
  
  // Set up reply cancel button
  if (replyCancelBtn) {
    replyCancelBtn.addEventListener('click', cancelReply);
  }
  
  console.log("Canopi chat initialized successfully");
}

function connectWebSocket() {
  try {
    // Try MetaLayer backend first, then fallback servers
    const wsUrls = [
      'ws://localhost:3001/ws', // Your MetaLayer backend (local)
      'ws://216.238.91.120:3001/ws', // Your MetaLayer backend (remote)
      'wss://echo.websocket.org' // Fallback echo server
    ];
    
    let currentUrlIndex = 0;
    
    function tryConnect() {
      if (currentUrlIndex >= wsUrls.length) {
        console.log('All WebSocket servers failed, using local simulation mode');
        isConnected = true;
        updateConnectionStatus(true, 'Local Mode');
        sendSystemMessage(`${currentUser.name} joined the chat (Local Mode)`);
        return;
      }
      
      const wsUrl = wsUrls[currentUrlIndex];
      console.log(`Attempting to connect to: ${wsUrl}`);
      
      canopiWebSocket = new WebSocket(wsUrl);
      
      canopiWebSocket.onopen = function(event) {
        console.log(`WebSocket connected to: ${wsUrl}`);
        isConnected = true;
        updateConnectionStatus(true, 'Connected');
        
        // Send user join message
        sendSystemMessage(`${currentUser.name} joined the chat`);
      };
      
      canopiWebSocket.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (e) {
          // Handle echo server responses
          if (event.data && event.data !== '') {
            handleEchoMessage(event.data);
          }
        }
      };
      
      canopiWebSocket.onclose = function(event) {
        console.log(`WebSocket disconnected from: ${wsUrl}`);
        isConnected = false;
        updateConnectionStatus(false, 'Disconnected');
        
        // Try next server or reconnect after 3 seconds
        currentUrlIndex++;
        setTimeout(() => {
          if (!isConnected) {
            console.log('Attempting to reconnect...');
            tryConnect();
          }
        }, 3000);
      };
      
      canopiWebSocket.onerror = function(error) {
        console.error(`WebSocket error with ${wsUrl}:`, error);
        isConnected = false;
        updateConnectionStatus(false, 'Connection Error');
        
        // Try next server
        currentUrlIndex++;
        setTimeout(() => {
          if (!isConnected) {
            tryConnect();
          }
        }, 1000);
      };
    }
    
    tryConnect();
    
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
    isConnected = false;
    updateConnectionStatus(false, 'Failed to Connect');
  }
}

function updateConnectionStatus(connected, statusText = null) {
  const chatMessages = document.getElementById('canopi-chat-messages');
  if (!chatMessages) return;
  
  // Remove existing status messages
  const existingStatus = chatMessages.querySelector('.connection-status');
  if (existingStatus) {
    existingStatus.remove();
  }
  
  if (connected) {
    const statusDiv = document.createElement('div');
    statusDiv.className = statusText === 'Local Mode' ? 
      'connection-status local-mode' : 
      'connection-status connected';
    const statusMessage = statusText === 'Local Mode' ? 
      '🟡 Local Mode - Chat works offline' : 
      '🟢 Connected to Canopi chat';
    statusDiv.innerHTML = statusMessage;
    chatMessages.appendChild(statusDiv);
  } else {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'connection-status disconnected';
    let disconnectMessage = '🔴 Disconnected - trying to reconnect...';
    
    if (statusText === 'Connection Error') {
      disconnectMessage = '🔴 Connection Error - trying alternative servers...';
    } else if (statusText === 'Failed to Connect') {
      disconnectMessage = '🔴 Failed to Connect - using local mode...';
    }
    
    statusDiv.innerHTML = disconnectMessage;
    chatMessages.appendChild(statusDiv);
  }
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleIncomingMessage(data) {
  if (data.type === 'connection') {
    console.log('Connected to MetaLayer WebSocket:', data.message);
    return;
  }
  
  if (data.type === 'message' && data.sender !== currentUser.id) {
    addChatMessage(
      data.senderName || 'Other User',
      data.senderAvatar || 'O',
      data.message,
      new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      false,
      data.replyTo || null
    );
  }
}

function handleEchoMessage(message) {
  // Handle echo server responses (for demo purposes)
  if (message && message !== '') {
    addChatMessage(
      'Echo Server',
      'E',
      message,
      new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      false
    );
  }
}

function sendSystemMessage(message) {
  const chatMessages = document.getElementById('canopi-chat-messages');
  if (!chatMessages) return;
  
  const systemDiv = document.createElement('div');
  systemDiv.className = 'system-message';
  systemDiv.textContent = message;
  chatMessages.appendChild(systemDiv);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
  
  function addSampleMessages() {
    const chatMessages = document.getElementById('canopi-chat-messages');
    if (!chatMessages) return;
    
    // Add date separator
    const dateSeparator = document.createElement('div');
    dateSeparator.className = 'date-separator';
    const dateSpan = document.createElement('span');
    dateSpan.textContent = 'July 22, 2025';
    dateSeparator.appendChild(dateSpan);
    chatMessages.appendChild(dateSeparator);
    
    // Add sample messages
    addChatMessage('Daveed Benjamin', 'DB', 'Hi Alex', '1:13 PM', false);
    addChatMessage('Alex Gleason', 'AG', 'greetings!', '1:14 PM', false);
    
    // Add another date separator
    const dateSeparator2 = document.createElement('div');
    dateSeparator2.className = 'date-separator';
    const dateSpan2 = document.createElement('span');
    dateSpan2.textContent = 'August 29, 2025';
    dateSeparator2.appendChild(dateSpan2);
    chatMessages.appendChild(dateSeparator2);
    
    addChatMessage('Daveed Benjamin', 'DB', 'Good connecting Alex!', '2:55 PM', false);
    addChatMessage('Daveed Benjamin', 'DB', 'Hi Lorelei! The Canopi is simply the entry point. As you will see in the book, the meta-layer is expansive.', '9:07 PM', false);
  }
  
  function addChatMessage(sender, avatarText, message, time, isOwnMessage = false, replyTo = null) {
    const chatMessages = document.getElementById('canopi-chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isOwnMessage ? 'own-message' : ''}`;
    messageDiv.setAttribute('data-message-id', Date.now() + Math.random());
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = avatarText;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Add click event for reply functionality
    content.addEventListener('click', () => {
      if (!isOwnMessage) { // Don't allow replying to your own messages
        startReply(sender, message, messageDiv.getAttribute('data-message-id'));
      }
    });
    
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const senderName = document.createElement('span');
    senderName.className = 'message-sender';
    senderName.textContent = sender;
    
    const messageTime = document.createElement('span');
    messageTime.className = 'message-time';
    messageTime.textContent = time;
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = message;
    
    header.appendChild(senderName);
    header.appendChild(messageTime);
    content.appendChild(header);
    
    // Add reply preview if this is a reply
    if (replyTo) {
      const replyDiv = document.createElement('div');
      replyDiv.className = 'message-reply';
      
      const replySender = document.createElement('div');
      replySender.className = 'message-reply-sender';
      replySender.textContent = `Replying to ${replyTo.sender}`;
      
      const replyText = document.createElement('div');
      replyText.className = 'message-reply-text';
      replyText.textContent = replyTo.message;
      
      replyDiv.appendChild(replySender);
      replyDiv.appendChild(replyText);
      content.appendChild(replyDiv);
    }
    
    content.appendChild(text);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Global variable to track current reply
  let currentReply = null;
  
  function startReply(sender, message, messageId) {
    console.log('Starting reply to:', sender, message);
    
    const replyIndicator = document.getElementById('reply-indicator');
    const replySender = document.getElementById('reply-sender');
    const replyPreview = document.getElementById('reply-preview');
    const messageInput = document.getElementById('canopi-message-input');
    
    if (!replyIndicator || !replySender || !replyPreview || !messageInput) return;
    
    // Store reply information
    currentReply = {
      sender: sender,
      message: message,
      messageId: messageId
    };
    
    // Update reply indicator
    replySender.textContent = `Replying to ${sender}`;
    replyPreview.textContent = message.length > 50 ? message.substring(0, 50) + '...' : message;
    
    // Show reply indicator
    replyIndicator.style.display = 'flex';
    
    // Focus input
    messageInput.focus();
    messageInput.placeholder = `Reply to ${sender}...`;
  }
  
  function cancelReply() {
    console.log('Cancelling reply');
    
    const replyIndicator = document.getElementById('reply-indicator');
    const messageInput = document.getElementById('canopi-message-input');
    
    if (replyIndicator) {
      replyIndicator.style.display = 'none';
    }
    
    if (messageInput) {
      messageInput.placeholder = 'Send message in Overweb';
    }
    
    // Clear reply data
    currentReply = null;
  }
  
  function sendCanopiMessage() {
    const messageInput = document.getElementById('canopi-message-input');
    const sendButton = document.getElementById('canopi-send-btn');
    
    if (!messageInput || !sendButton) return;
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Disable input while sending
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Add message to chat immediately (optimistic UI)
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addChatMessage(currentUser.name, currentUser.avatar, message, currentTime, true, currentReply);
    
    // Clear input and reply
    messageInput.value = '';
    cancelReply();
    
    // Send via WebSocket
    if (canopiWebSocket && isConnected) {
      const messageData = {
        type: 'message',
        sender: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        message: message,
        timestamp: Date.now(),
        replyTo: currentReply
      };
      
      canopiWebSocket.send(JSON.stringify(messageData));
      console.log('Message sent via WebSocket:', messageData);
    } else {
      // Local mode: simulate echo response
      setTimeout(() => {
        handleEchoMessage(message);
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      console.log('Message sent in local mode:', message);
      
    }
    
    // Re-enable input
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
    
    console.log('Canopi message sent:', message, currentReply ? 'as reply' : '');
  }
  
  initializeCanopiChat();
  
  // Add debug panel toggle functionality
  const debugHeader = document.getElementById('debug-header');
  if (debugHeader) {
    debugHeader.addEventListener('click', toggleDebugPanel);
  }
  
  if (chatInput) {
    chatInput.addEventListener('focus', () => {
      if (!requireAuth('send messages', () => {
        chatInput.focus();
      })) {
        chatInput.blur();
      }
    });
  }
  
  if (chatSendButton) {
    chatSendButton.addEventListener('click', () => {
      console.log('Chat send button clicked');
      requireAuth('send messages', () => {
        const message = chatInput?.value;
        if (message) {
          debug(`Sending message: ${message}`);
          console.log('Sending message:', message);
          // TODO: Implement actual message sending
          chatInput.value = '';
        }
      });
    });
  }

  // --- Agent Input Authentication and DeepSeek Integration ---
  // Element references will be created inside DOMContentLoaded event
  
  // Agent API configuration (now uses server endpoint)
  const AGENT_API_URL = 'http://localhost:3001/api/agent';
  
  // Agent conversation history
  let agentConversationHistory = [];
  let pageContentCache = null;
  let pageSummaryCache = null;
  
  // Cache management
  const CACHE_KEY_PREFIX = 'agent_cache_';
  const CACHE_EXPIRY_DAYS = 7;
  
  // Old initializeAgent function removed - using initializeAgentTab instead
  
  
  async function callDeepSeekAPI(userMessage) {
    const response = await fetch(AGENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        pageContent: pageContentCache
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  }
  
  // Duplicate addMessageToAgentOutput function removed - using the one in initializeAgentTab
  
  // Cache management functions
  async function loadCachedData() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab.url;
      const cacheKey = CACHE_KEY_PREFIX + btoa(url).replace(/[^a-zA-Z0-9]/g, '');
      
      const result = await chrome.storage.local.get([cacheKey]);
      const cachedData = result[cacheKey];
      
      if (cachedData && !isCacheExpired(cachedData.timestamp)) {
        pageContentCache = cachedData.content;
        pageSummaryCache = cachedData.summary;
        agentConversationHistory = cachedData.conversation || [];
        
        debug(`Loaded cached data for ${url}`);
        
        // Restore conversation history in UI
        if (agentConversationHistory.length > 0) {
          restoreConversationHistory();
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
      debug(`Error loading cached data: ${error.message}`);
    }
  }
  
  async function saveCachedData() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab.url;
      const cacheKey = CACHE_KEY_PREFIX + btoa(url).replace(/[^a-zA-Z0-9]/g, '');
      
      const cacheData = {
        url: url,
        content: pageContentCache,
        summary: pageSummaryCache,
        conversation: agentConversationHistory,
        timestamp: Date.now()
      };
      
      await chrome.storage.local.set({ [cacheKey]: cacheData });
      debug(`Saved cached data for ${url}`);
    } catch (error) {
      console.error('Error saving cached data:', error);
      debug(`Error saving cached data: ${error.message}`);
    }
  }
  
  function isCacheExpired(timestamp) {
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    return (now - timestamp) > expiryTime;
  }
  
  function restoreConversationHistory() {
    if (!agentOutput || agentConversationHistory.length === 0) return;
    
    // Clear welcome message
    const welcomeDiv = agentOutput.querySelector('.agent-welcome');
    if (welcomeDiv) {
      welcomeDiv.style.display = 'none';
    }
    
    // Restore messages
    agentConversationHistory.forEach(message => {
      addMessageToAgentOutput(message.content, message.role === 'user' ? 'user' : 'assistant');
    });
  }
  
  // Enhanced page content loading with caching
  async function loadPageContent() {
    try {
      // Check if we already have cached content
      if (pageContentCache) {
        debug('Using cached page content');
        if (!pageSummaryCache) {
          generatePageSummary();
        }
        return;
      }
      
      // Get current page content from content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Send message to content script to extract page content
      console.log("Sending message to content script for tab:", tab.id);
      chrome.tabs.sendMessage(tab.id, { action: 'extractPageContent' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting page content:', chrome.runtime.lastError);
          console.log("This might mean the content script isn't injected on this page");
          return;
        }
        
        console.log("Content script response:", response);
        
        if (response && response.content) {
          pageContentCache = response.content;
          debug(`Page content loaded: ${response.content.length} characters`);
          
          // Generate initial summary if not cached
          if (!pageSummaryCache) {
            generatePageSummary();
          }
          
          // Save to cache
          saveCachedData();
        } else if (response && response.error) {
          console.error('Content script error:', response.error);
        } else {
          console.log('No content received from content script');
        }
      });
    } catch (error) {
      console.error('Error loading page content:', error);
      debug(`Error loading page content: ${error.message}`);
    }
  }
  
  // Enhanced summary generation with caching
  async function generatePageSummary() {
    if (!pageContentCache) return;
    
    try {
      const summary = await callDeepSeekAPI(`Please summarize this web page content:\n\n${pageContentCache.substring(0, 4000)}`);
      
      pageSummaryCache = summary;
      debug('Page summary generated');
      
      // Update agent output with summary
      if (agentOutput) {
        const welcomeDiv = agentOutput.querySelector('.agent-welcome');
        if (welcomeDiv) {
          const summaryDiv = document.createElement('div');
          summaryDiv.className = 'page-summary';
          summaryDiv.innerHTML = `
            <h4>📄 Page Summary</h4>
            <p>${summary}</p>
          `;
          welcomeDiv.appendChild(summaryDiv);
        }
      }
      
      // Save to cache
      saveCachedData();
    } catch (error) {
      console.error('Error generating page summary:', error);
      debug(`Error generating page summary: ${error.message}`);
    }
  }
  
  // Old sendAgentMessage function removed - using the one in initializeAgentTab

  // Old clearConversation function removed - using the one in initializeAgentTab
  
  // Old refreshPageContent function removed - using the one in initializeAgentTab

  // --- Add Friend Functionality ---
  function addFriend(userId, userName) {
    requireAuth('add friends', () => {
      debug(`Adding friend: ${userName} (${userId})`);
      // TODO: Implement actual friend adding
    });
  }

  // --- Update People Tab with Add Friend Buttons ---
  function updatePeopleTabWithAuth() {
    const peopleTab = document.getElementById('people-tab');
    if (!peopleTab) return;
    
    peopleTab.innerHTML = `
      <ul class="item-list">
        <li>
          <div class="avatar-container">
            <div class="avatar-placeholder" style="background-color: #FF6B6B">A</div>
            <div class="status-dot-overlay online"></div>
          </div>
          <div class="item-details">
            <div class="item-name">Alice Johnson</div>
            <div class="item-status">Online</div>
          </div>
          <button class="add-friend-btn" data-user-id="user1" data-user-name="Alice Johnson">+ Add</button>
        </li>
        <li>
          <div class="avatar-container">
            <div class="avatar-placeholder" style="background-color: #4ECDC4">B</div>
            <div class="status-dot-overlay away"></div>
          </div>
          <div class="item-details">
            <div class="item-name">Bob Smith</div>
            <div class="item-status">Away</div>
          </div>
          <button class="add-friend-btn" data-user-id="user2" data-user-name="Bob Smith">+ Add</button>
        </li>
      </ul>
    `;
    
    // Add event listeners to add friend buttons
    const addFriendBtns = peopleTab.querySelectorAll('.add-friend-btn');
    addFriendBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId;
        const userName = btn.dataset.userName;
        addFriend(userId, userName);
      });
    });
  }

  // Update people tab
  updatePeopleTabWithAuth();

  // Initial UI state
  updateUI(null);

  // Make functions globally accessible for onclick handlers
  window.requireAuth = requireAuth;
  window.addFriend = addFriend;
  window.openUserProfile = openUserProfile;
  
  // Agent helper functions
  function formatMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML first to prevent XSS
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Convert markdown to HTML
    html = html
      // Headers (### Header -> <h3>Header</h3>)
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Bold (**text** -> <strong>text</strong>)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Italic (*text* -> <em>text</em>)
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Bullet points (- item -> <li>item</li>)
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      
      // Line breaks
      .replace(/\n/g, '<br>')
      
      // Wrap consecutive <li> elements in <ul>
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/<\/ul><br><ul>/g, '');
    
    return html;
  }
  
  function addMessageToAgentOutput(message, sender) {
    const agentOutput = document.getElementById('agent-output');
    if (!agentOutput) return;
    
    // Remove welcome message if it exists
    const welcomeDiv = agentOutput.querySelector('.agent-welcome');
    if (welcomeDiv && sender === 'user') {
      welcomeDiv.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `agent-message ${sender}`;
    
    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    messageHeader.innerHTML = `
      <span class="sender">${sender === 'user' ? 'You' : '🤖 Agent'}</span>
      <span class="timestamp">${new Date().toLocaleTimeString()}</span>
    `;
    
    // Create message content with markdown formatting
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = formatMarkdown(message); // Convert markdown to HTML
    
    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(messageContent);
    
    agentOutput.appendChild(messageDiv);
    // Ensure smooth scrolling to bottom
    setTimeout(() => {
      agentOutput.scrollTo({
        top: agentOutput.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  }
  
  // testAgent function will be defined when Agent tab is activated
  
  // Call DeepSeek API for real AI responses
  async function callDeepSeekForResponse(message) {
    try {
      console.log("Calling DeepSeek API for message:", message);
      
      // Prepare context for DeepSeek
      const systemPrompt = `You are a helpful AI assistant that can analyze and discuss web page content. 
      
Current page content: ${pageContentCache ? pageContentCache.substring(0, 3000) : 'No page content available'}
${pageSummaryCache ? `Page summary: ${pageSummaryCache}` : ''}

Please provide helpful, accurate responses based on the page content when relevant. If the user asks about something not related to the page, you can still help with general questions.`;
      
      const response = await callDeepSeekAPI(message);
      
      // Add assistant response to conversation
      addMessageToAgentOutput(response, 'assistant');
      
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      addMessageToAgentOutput('Sorry, I encountered an error. Please try again.', 'assistant');
    }
  }
  
  // Initialize agent tab when it's activated
  function initializeAgentTab() {
    console.log("=== INITIALIZING AGENT TAB ===");
    
    // Get agent element references
    const agentInput = document.getElementById('agent-input');
    const agentSendButton = document.getElementById('agent-send-btn');
    const agentOutput = document.getElementById('agent-output');
    const clearConversationBtn = document.getElementById('clear-conversation-btn');
    const refreshPageContentBtn = document.getElementById('refresh-page-content-btn');
    
    console.log("Agent elements found:", {
      agentInput: !!agentInput,
      agentSendButton: !!agentSendButton,
      agentOutput: !!agentOutput,
      clearConversationBtn: !!clearConversationBtn,
      refreshPageContentBtn: !!refreshPageContentBtn
    });
    
    // Initialize agent output if not already done
    if (agentOutput && !agentOutput.querySelector('.agent-welcome')) {
      console.log("Setting up agent output...");
      agentOutput.innerHTML = `
        <div class="agent-welcome">
          <h4>🤖 AI Agent Ready</h4>
          <p>I can help you understand and discuss the content on this page. Ask me anything!</p>
          <div class="agent-suggestions">
            <button class="suggestion-btn" data-question="What is this page about?">What is this page about?</button>
            <button class="suggestion-btn" data-question="Summarize the main points">Summarize the main points</button>
            <button class="suggestion-btn" data-question="What are the key takeaways?">What are the key takeaways?</button>
            <button class="suggestion-btn" data-question="Explain this in simple terms">Explain this in simple terms</button>
            <button class="suggestion-btn" data-question="What questions should I ask about this?">What questions should I ask?</button>
          </div>
        </div>
      `;
      
      // Add event listeners to suggestion buttons
      const suggestionButtons = agentOutput.querySelectorAll('.suggestion-btn');
      suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
          const question = button.getAttribute('data-question');
          console.log("Suggestion button clicked:", question);
          testAgent(question);
        });
      });
      console.log("Agent welcome message set up!");
    }
    
    // Set up send button if not already done
    if (agentSendButton && !agentSendButton.hasAttribute('data-initialized')) {
      console.log("Setting up send button...");
      agentSendButton.setAttribute('data-initialized', 'true');
      agentSendButton.addEventListener('click', () => {
        console.log("Send button clicked!");
        const message = agentInput?.value?.trim();
        if (message) {
          console.log("Sending message:", message);
          addMessageToAgentOutput(message, 'user');
          agentInput.value = '';
          // Call DeepSeek API for real AI response
          callDeepSeekForResponse(message);
        }
      });
    }
    
    // Set up input field if not already done
    if (agentInput && !agentInput.hasAttribute('data-initialized')) {
      agentInput.setAttribute('data-initialized', 'true');
      agentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          agentSendButton?.click();
        }
      });
    }
    
    // Define agent functions only when Agent tab is active
    window.testAgent = function(question) {
      console.log("Test agent called with:", question);
      const agentInput = document.getElementById('agent-input');
      if (agentInput) {
        agentInput.value = question;
        document.getElementById('agent-send-btn')?.click();
      }
    };
    
    window.askAgent = function(question) {
      console.log("Ask agent called with:", question);
      const agentInput = document.getElementById('agent-input');
      if (agentInput) {
        agentInput.value = question;
        document.getElementById('agent-send-btn')?.click();
      }
    };
    
    console.log("=== AGENT TAB INITIALIZATION COMPLETE ===");
  }

  // Agent functionality will be initialized only when the Agent tab is activated
  console.log("Agent functionality ready - will initialize when Agent tab is clicked");

  console.log("Sidebar setup complete");
  debug("Sidebar setup complete (from JS)");
});