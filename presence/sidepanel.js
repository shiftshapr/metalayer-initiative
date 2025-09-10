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

  async sendMessage(userId, communityId, content) {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ userId, communityId, content })
    });
  }

  async getChatHistory(communityId) {
    return this.request(`/chat/history?communityId=${communityId}`);
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
    
    // Load avatars and chat history for the first community
    if (communities.length > 0) {
      await loadAvatars(communities[0].id);
      await loadChatHistory(communities[0].id);
      // Store current community
      chrome.storage.local.set({ currentCommunity: communities[0].id });
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
  
  // Load chat history for the new community
  loadChatHistory(community.id);
  
  // Store current community
  chrome.storage.local.set({ currentCommunity: community.id });
}

function getAvatarColor(name) {
  // Generate a consistent color based on the name
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function addMessageToChat(message) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  
  // Remove placeholder text if it exists
  const placeholder = chatMessages.querySelector('p[style*="text-align: center"]');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.innerHTML = `
    <div class="message-content">${message.content}</div>
    <div class="message-time">${new Date(message.created_at).toLocaleTimeString()}</div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function loadChatHistory(communityId) {
  try {
    const response = await api.getChatHistory(communityId);
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    // Clear existing messages
    chatMessages.innerHTML = '';
    
    if (response.messages && response.messages.length > 0) {
      response.messages.forEach(message => {
        addMessageToChat(message);
      });
    } else {
      chatMessages.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Chat history appears here.</p>';
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
    debug(`Failed to load chat history: ${error.message}`);
  }
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
      
      // Update UI with current user
      updateUI(user);
    } else {
      console.log('Auth system failed to initialize');
    }
  } catch (error) {
    console.error('Auth initialization failed:', error.message);
    
    // Don't fall back to offline mode - force real auth
    console.log('Forcing real authentication - no offline fallback');
    // Don't clear UI here - let the auth state listener handle it
  }
  
  // Load communities and initialize the interface
  try {
    console.log('Loading communities...');
    loadCommunities();
    console.log('Communities loaded successfully');
  } catch (error) {
    console.error('Error loading communities:', error);
  }
  
  // UI will be updated by auth state listener
  console.log('UI will be updated by auth state listener');
  
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

  // --- Chat Input Authentication ---
  const chatInput = document.getElementById('chat-textarea');
  const chatSendButton = document.querySelector('.chat-input-area button');
  
  // Add auto-resize functionality to textarea
  if (chatInput) {
    chatInput.addEventListener('input', function() {
      autoResize(this);
    });
  }
  
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
      requireAuth('send messages', async () => {
        const message = chatInput?.value;
        if (message) {
          debug(`Sending message: ${message}`);
          console.log('Sending message:', message);
          
          try {
            // Get current user and community
            const result = await chrome.storage.local.get(['googleUser', 'currentCommunity']);
            const user = result.googleUser;
            const communityId = result.currentCommunity || 'comm-001';
            
            if (user && user.id) {
              const response = await api.sendMessage(user.id, communityId, message);
              debug(`Message sent successfully: ${response.msg?.id}`);
              console.log('Message sent:', response);
              
              // Add message to chat display
              addMessageToChat(response.msg);
            } else {
              debug('No user found for sending message');
            }
          } catch (error) {
            debug(`Failed to send message: ${error.message}`);
            console.error('Failed to send message:', error);
          }
          
          chatInput.value = '';
        }
      });
    });
  }

  // --- Agent Input Authentication ---
  const agentInput = document.getElementById('agent-input');
  const agentSendButton = document.getElementById('agent-send-btn');
  
  if (agentInput) {
    agentInput.addEventListener('focus', () => {
      if (!requireAuth('interact with AI agents', () => {
        agentInput.focus();
      })) {
        agentInput.blur();
      }
    });
  }
  
  if (agentSendButton) {
    agentSendButton.addEventListener('click', () => {
      console.log('Agent send button clicked');
      requireAuth('interact with AI agents', () => {
        const message = agentInput?.value;
        if (message) {
          debug(`Sending to agent: ${message}`);
          console.log('Sending to agent:', message);
          // TODO: Implement actual agent interaction
          agentInput.value = '';
        }
      });
    });
  }

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

  // Initial UI state will be set by auth manager

  // Make functions globally accessible for onclick handlers
  window.requireAuth = requireAuth;
  window.addFriend = addFriend;
  window.openUserProfile = openUserProfile;

  console.log("Sidebar setup complete");
  debug("Sidebar setup complete (from JS)");
});