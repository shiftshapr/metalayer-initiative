// Meta-Layer Initiative API Configuration
const METALAYER_API_URL = 'http://216.238.91.120:3003';

// Avatar Background Color Configuration
const AVATAR_BG_CONFIG = {
  // Default background color for user's profile avatar when transparent
  defaultBgColor: null, // Will be set dynamically based on user's name
  
  // User's custom background color
  customBgColor: null,
  
  // Get the current background color
  getBgColor() {
    if (this.customBgColor) {
      return this.customBgColor;
    }
    
    // If no custom color, use the same color system as message avatars
    // For now, return the blue color that matches the message avatars
    // The actual user-specific color will be set when the avatar is created
    return '#45B7D1'; // Blue color that matches message avatars
  },
  
  // Set custom background color
  setBgColor(color) {
    this.customBgColor = color;
  },
  
  // Reset to default background color
  resetToDefault() {
    this.customBgColor = null;
  }
};

// API client for Meta-Layer Initiative
class MetaLayerAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get current user info to send in headers
    const result = await chrome.storage.local.get(['googleUser']);
    const user = result.googleUser;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(user && {
          'X-User-Email': user.email,
          'X-User-Name': user.name || user.user_metadata?.full_name,
          'X-User-Avatar': user.user_metadata?.avatar_url || user.picture
        }),
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
    // Get current user to filter communities by membership
    const result = await chrome.storage.local.get(['googleUser']);
    const userId = result.googleUser?.email || result.googleUser?.id;
    
    const url = userId ? `/communities?userId=${encodeURIComponent(userId)}` : '/communities';
    return this.request(url);
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

  async sendMessage(userId, communityId, content, uri = null, parentId = null, threadId = null, optionalContent = null) {
    // Use new Canopi 2 conversation system
    // First, resolve the page
    const pageResponse = await this.request('/v1/pages/resolve', {
      method: 'POST',
      body: JSON.stringify({ url: uri || window.location.href })
    });
    
    // If this is a reply to an existing conversation
    if (threadId) {
      // Create a post in the existing conversation
      return this.request('/v1/posts', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: threadId,
          body: content,
          parentId: parentId
        })
      });
    } else {
      // Create a new conversation
      return this.request('/v1/conversations', {
        method: 'POST',
        body: JSON.stringify({
          pageId: pageResponse.pageId,
          visibility: 'PUBLIC', // Default visibility
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''), // Use first part as title
          body: content,
          communityId: communityId
        })
      });
    }
  }

  async getChatHistory(communityId, threadId = null, uri = null) {
    // Use new Canopi 2 conversation system
    if (threadId) {
      // Get specific conversation with posts
      return this.request(`/v1/conversations/${threadId}`);
    } else if (uri) {
      // First resolve the page, then get conversations for that page
      const pageResponse = await this.request('/v1/pages/resolve', {
        method: 'POST',
        body: JSON.stringify({ url: uri })
      });
      const url = `/v1/pages/${pageResponse.pageId}/conversations${communityId ? `?communityId=${encodeURIComponent(communityId)}` : ''}`;
      return this.request(url);
    } else {
      // Get all conversations (this might need to be limited in the future)
      const url = `/v1/conversations${communityId ? `?communityId=${encodeURIComponent(communityId)}` : ''}`;
      return this.request(url);
    }
  }

  async getThreads(communityId) {
    return this.request(`/chat/threads?communityId=${communityId}`);
  }

  async editMessage(messageId, newContent) {
    // Use new Canopi 2 post system
    return this.request(`/v1/posts/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ body: newContent })
    });
  }

  async deleteMessage(messageId) {
    // Use new Canopi 2 post system
    return this.request(`/v1/posts/${messageId}`, {
      method: 'DELETE'
    });
  }

  async toggleReaction(kind, postId = null, conversationId = null, emoji = null) {
    // Use new Canopi 2 reaction system
    return this.request('/v1/reactions', {
      method: 'POST',
      body: JSON.stringify({ 
        kind, 
        postId, 
        conversationId,
        emoji 
      })
    });
  }

  async getReactions(postId = null, conversationId = null) {
    // Use new Canopi 2 reaction system
    const params = new URLSearchParams();
    if (postId) {
      params.append('targetId', postId);
      params.append('targetType', 'post');
    } else if (conversationId) {
      params.append('targetId', conversationId);
      params.append('targetType', 'conversation');
    }
    
    return this.request(`/v1/reactions?${params.toString()}`);
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
    debugContent.innerHTML += `<div>${time}: ${message}</div>`;
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
  // Reset height to auto to get the natural height
  textarea.style.height = 'auto';
  
  // Calculate the natural height needed
  const naturalHeight = textarea.scrollHeight;
  
  // Set maximum height based on viewport (leave room for context bar and other UI)
  const maxHeight = Math.min(200, window.innerHeight * 0.4); // Max 200px or 40% of viewport
  
  if (naturalHeight <= maxHeight) {
    // Content fits within max height - expand to natural height
    textarea.style.height = naturalHeight + 'px';
    textarea.style.overflowY = 'hidden';
  } else {
    // Content exceeds max height - set max height and enable scrolling
    textarea.style.height = maxHeight + 'px';
    textarea.style.overflowY = 'auto';
  }
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
    
    // Set up active communities and primary community
    if (communities.length > 0) {
      // For now, all communities are active communities
      const activeCommunities = communities.map(c => c.id);
      const primaryCommunity = communities[0].id; // First community is primary
      
      // Store active communities and primary community
      chrome.storage.local.set({ 
        activeCommunities: activeCommunities,
        primaryCommunity: primaryCommunity,
        currentCommunity: primaryCommunity, // For backward compatibility
        communities: communities // Store communities for name lookup
      });
      
      // Load combined avatars from all active communities
      await loadCombinedAvatars(activeCommunities);
      await loadChatHistory(primaryCommunity);
      
      // Update placeholder text with primary community name
      updatePlaceholderText(communities[0].name);
    }
  } catch (error) {
    console.error('Failed to load communities:', error);
    debug(`Failed to load communities: ${error.message}`);
    
    // Fallback: show default community
    updateCommunityDropdown([{ id: 'default', name: 'Main Community' }]);
  }
}

// Load avatars from multiple communities and combine them
async function loadCombinedAvatars(communityIds) {
  try {
    debug(`Loading combined avatars from communities: ${communityIds.join(', ')}`);
    
    // Load avatars from all active communities
    const avatarPromises = communityIds.map(communityId => 
      api.getAvatars(communityId).catch(err => {
        console.warn(`Failed to load avatars for community ${communityId}:`, err);
        return [];
      })
    );
    
    const avatarResponses = await Promise.all(avatarPromises);
    
    // Combine and deduplicate avatars
    const allAvatars = [];
    const seenUsers = new Set();
    
    avatarResponses.forEach((response, index) => {
      const communityId = communityIds[index];
      let avatars;
      
      // Handle different response formats
      if (response && response.active && Array.isArray(response.active)) {
        avatars = response.active;
      } else if (Array.isArray(response)) {
        avatars = response;
      } else {
        avatars = [];
      }
      
      // Add community info to each avatar and deduplicate
      avatars.forEach(avatar => {
        const userKey = `${avatar.userId || avatar.id}`;
        if (!seenUsers.has(userKey)) {
          seenUsers.add(userKey);
          allAvatars.push({
            ...avatar,
            communityId: communityId,
            communityName: avatar.communityName || `Community ${communityId}`
          });
        }
      });
    });
    
    debug(`Combined avatars from ${communityIds.length} communities:`, allAvatars);
    debug(`Total unique avatars: ${allAvatars.length}`);
    
    // Update the visible tab with combined avatar data
    updateVisibleTab(allAvatars);
  } catch (error) {
    console.error('Failed to load combined avatars:', error);
    debug(`Failed to load combined avatars: ${error.message}`);
    updateVisibleTab([]);
  }
}

// Legacy function for backward compatibility
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
      <img src="/images/community${index + 1}.png" alt="Community" data-community-fallback="true">
      <span>${community.name}</span>
      ${index === 0 ? '<span class="primary-tag">Primary</span>' : ''}
    `;
    
    // Add error handler for community image
    const communityImg = li.querySelector('img[data-community-fallback="true"]');
    if (communityImg) {
      communityImg.addEventListener('error', function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjEwIiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K';
      });
    }
    
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
  debug(`Switching primary community to: ${community.name}`);
  
  // Update the current community name in the header
  const currentCommunityName = document.getElementById('current-community-name');
  if (currentCommunityName) {
    currentCommunityName.textContent = community.name;
  }
  
  // Update the placeholder text
  updatePlaceholderText(community.name);
  
  // Close the dropdown
  const communityDropdownPanel = document.getElementById('community-dropdown-panel');
  if (communityDropdownPanel) {
    communityDropdownPanel.style.display = 'none';
  }
  
  // Get current active communities and update primary community
  chrome.storage.local.get(['activeCommunities'], (result) => {
    const activeCommunities = result.activeCommunities || [community.id];
    
    // Store updated primary community
    chrome.storage.local.get(['communities'], (result) => {
      chrome.storage.local.set({ 
        primaryCommunity: community.id,
        currentCommunity: community.id, // For backward compatibility
        communities: result.communities // Keep existing communities
      });
    });
    
    // Load chat history for the new primary community
    loadChatHistory(community.id);
    
    // Note: We don't reload avatars here because we want to show people from ALL active communities
    // The avatars are already loaded from all active communities in loadCombinedAvatars()
  });
}

function getAvatarColor(name) {
  // Generate a consistent color based on the name (for message avatars)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Global function to set custom avatar color for the current user
function setCustomAvatarColor(color) {
  if (!color || !color.startsWith('#')) {
    console.error('❌ Invalid color. Please provide a hex color (e.g., #45B7D1)');
    return;
  }
  
  // Store the custom color
  chrome.storage.local.set({ customAvatarColor: color }, () => {
    console.log('✅ Custom avatar color set to:', color);
    // Refresh the profile avatar
    refreshUserAvatar();
  });
}

// Global function to reset to default avatar color
function resetCustomAvatarColor() {
  chrome.storage.local.remove(['customAvatarColor'], () => {
    console.log('✅ Avatar color reset to default');
    // Refresh the profile avatar
    refreshUserAvatar();
  });
}

// Get the avatar color for the current user (custom or default)
function getCurrentUserAvatarColor() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customAvatarColor'], (result) => {
      if (result.customAvatarColor) {
        resolve(result.customAvatarColor);
      } else {
        // Use the same color system as message avatars
        const currentUser = getCurrentUser();
        if (currentUser) {
          const name = currentUser.user_metadata?.full_name || currentUser.email || 'User';
          resolve(getAvatarColor(name));
        } else {
          resolve('#45B7D1'); // Default blue
        }
      }
    });
  });
}

function getUserAvatarBgColor() {
  // Get the user's custom background color for their profile avatar
  return AVATAR_BG_CONFIG.getBgColor();
}

// User Avatar Background Color Management Functions
async function setUserAvatarBgColor(color) {
  // Validate color is a valid hex color
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexColorRegex.test(color)) {
    console.error(`Invalid color format: ${color}. Must be a valid hex color (e.g., #FF6B6B)`);
    return false;
  }
  
  AVATAR_BG_CONFIG.setBgColor(color);
  console.log('✅ User avatar background color updated:', color);
  
  // Save to chrome storage for persistence
  chrome.storage.local.set({ userAvatarBgColor: color });
  
  // Save to database
  try {
    const result = await chrome.storage.local.get(['googleUser']);
    if (result.googleUser && result.googleUser.email) {
      // Generate the same UUID that the server uses
      const serverUserId = await generateUUIDFromEmail(result.googleUser.email);
      console.log('🔍 Saving aura color for user:', { email: result.googleUser.email, serverUserId });
      
      const response = await fetch(`${METALAYER_API_URL}/v1/users/${serverUserId}/aura-color`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': result.googleUser.email,
          'x-user-name': result.googleUser.user_metadata?.full_name || result.googleUser.email,
          'x-user-avatar': result.googleUser.user_metadata?.avatar_url || ''
        },
        body: JSON.stringify({ auraColor: color })
      });
      
      if (response.ok) {
        console.log('✅ Aura color saved to database');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save aura color to database:', response.status, errorText);
      }
    } else {
      console.error('❌ No user data found for saving aura color');
    }
  } catch (error) {
    console.error('❌ Error saving aura color to database:', error);
  }
  
  // Refresh only the profile avatar
  refreshUserAvatar();
  
  return true;
}

function resetUserAvatarBgColor() {
  AVATAR_BG_CONFIG.resetToDefault();
  console.log('✅ User avatar background color reset to default');
  
  // Remove from chrome storage
  chrome.storage.local.remove(['userAvatarBgColor']);
  
  // Refresh only the profile avatar
  refreshUserAvatar();
}

function getCurrentUserAvatarBgColor() {
  return AVATAR_BG_CONFIG.getBgColor();
}

function refreshUserAvatar() {
  // Refresh only the profile avatar
  const result = chrome.storage.local.get(['googleUser']);
  result.then(({ googleUser }) => {
    if (googleUser) {
      updateUI(googleUser);
    }
  });
}

async function loadUserAvatarBgConfig() {
  try {
    const result = await chrome.storage.local.get(['userAvatarBgColor']);
    if (result.userAvatarBgColor) {
      AVATAR_BG_CONFIG.setBgColor(result.userAvatarBgColor);
      console.log('✅ Loaded custom user avatar background color:', result.userAvatarBgColor);
    } else {
      console.log('✅ Using default user avatar background color');
    }
  } catch (error) {
    console.error('❌ Error loading user avatar background color config:', error);
  }
}

// Global functions for user avatar background color configuration (accessible from browser console)
window.setUserAvatarBgColor = setUserAvatarBgColor;
window.resetUserAvatarBgColor = resetUserAvatarBgColor;
window.getCurrentUserAvatarBgColor = getCurrentUserAvatarBgColor;

// Color Picker Modal Functions
function showColorPickerModal() {
  console.log('🎨 Opening color picker modal...');
  // Create modal HTML
  const modalHTML = `
    <div class="color-picker-modal" id="color-picker-modal">
      <div class="color-picker-content">
        <div class="color-picker-header">
          <h3 class="color-picker-title">Change Aura Color</h3>
          <button class="color-picker-close" id="color-picker-close">&times;</button>
        </div>
        <div class="color-picker-input-group">
          <label class="color-picker-label" for="color-input">Hex Color (without #):</label>
          <input type="text" class="color-picker-input" id="color-input" placeholder="45B7D1" maxlength="6">
        </div>
        <div class="color-picker-preview">
          <div class="color-picker-preview-circle" id="color-preview-circle">D</div>
          <div class="color-picker-preview-text" id="color-preview-text">Preview</div>
        </div>
        <div class="color-picker-buttons">
          <button class="color-picker-btn" id="color-picker-reset">Reset to Default</button>
          <button class="color-picker-btn primary" id="color-picker-save">Save Color</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modal = document.getElementById('color-picker-modal');
  const colorInput = document.getElementById('color-input');
  const previewCircle = document.getElementById('color-preview-circle');
  const previewText = document.getElementById('color-preview-text');
  const closeBtn = document.getElementById('color-picker-close');
  const resetBtn = document.getElementById('color-picker-reset');
  const saveBtn = document.getElementById('color-picker-save');
  
  // Get current color and set initial values
  const currentColor = getCurrentUserAvatarBgColor();
  const currentHex = currentColor.replace('#', '');
  colorInput.value = currentHex;
  updatePreview(currentHex);
  
  // Event listeners
  colorInput.addEventListener('input', (e) => {
    const hex = e.target.value.replace('#', '');
    updatePreview(hex);
  });
  
  closeBtn.addEventListener('click', closeColorPickerModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeColorPickerModal();
  });
  
  resetBtn.addEventListener('click', () => {
    // Get the dynamic default color (based on user's name)
    // Get user from chrome storage
    chrome.storage.local.get(['googleUser']).then(({ googleUser }) => {
      let defaultColor = '#45B7D1'; // Fallback
      if (googleUser) {
        const name = googleUser.user_metadata?.full_name || googleUser.email || 'User';
        defaultColor = getAvatarColor(name);
      }
      const defaultHex = defaultColor.replace('#', '');
      colorInput.value = defaultHex;
      updatePreview(defaultHex);
    });
  });
  
  saveBtn.addEventListener('click', async () => {
    const hex = colorInput.value.replace('#', '');
    if (isValidHex(hex)) {
      await setUserAvatarBgColor('#' + hex);
      closeColorPickerModal();
    } else {
      alert('Please enter a valid 6-digit hex color (e.g., 45B7D1)');
    }
  });
  
  // Focus the input
  colorInput.focus();
  colorInput.select();
  
  function updatePreview(hex) {
    console.log('🔍 Updating preview with hex:', hex);
    if (isValidHex(hex)) {
      const color = '#' + hex;
      previewCircle.style.backgroundColor = color;
      previewText.textContent = color;
      console.log('✅ Preview updated to color:', color);
    } else {
      previewCircle.style.backgroundColor = '#cccccc';
      previewText.textContent = 'Invalid color';
      console.log('❌ Invalid hex color:', hex);
    }
  }
  
  function isValidHex(hex) {
    return /^[A-Fa-f0-9]{6}$/.test(hex);
  }
}

function closeColorPickerModal() {
  const modal = document.getElementById('color-picker-modal');
  if (modal) {
    modal.remove();
  }
}

// Add click handler to aura button
function addAuraButtonClickHandler() {
  const auraBtn = document.getElementById('aura-btn');
  console.log('🔍 Setting up aura button click handler, found button:', auraBtn);
  if (auraBtn) {
    auraBtn.addEventListener('click', (e) => {
      console.log('🎨 Aura button clicked!');
      e.stopPropagation(); // Prevent menu from closing
      showColorPickerModal();
    });
  } else {
    console.error('❌ Aura button not found!');
  }
}

// Global functions for custom avatar color configuration (accessible from browser console)
window.setCustomAvatarColor = setCustomAvatarColor;
window.resetCustomAvatarColor = resetCustomAvatarColor;
window.getCurrentUserAvatarColor = getCurrentUserAvatarColor;

// Global function for debugging visual hierarchy (accessible from browser console)
window.updateVisualHierarchy = updateMessageVisualHierarchy;
window.debugHierarchy = () => {
  console.log('🔧 DEBUG: Manually triggering visual hierarchy update');
  updateMessageVisualHierarchy();
};

window.forceRefreshCSS = () => {
  console.log('🔧 DEBUG: Force refreshing CSS');
  const link = document.querySelector('link[href*="sidepanel.css"]');
  if (link) {
    const href = link.href;
    link.href = href + '?v=' + Date.now();
    console.log('✅ CSS refreshed');
  } else {
    console.log('❌ CSS link not found');
  }
};

    // Function to update visual hierarchy of messages - TOP-line approach with vertical lines
    function updateMessageVisualHierarchy() {
      const chatMessages = document.querySelector('.chat-messages');
      if (!chatMessages) return;
      
      const allMessages = chatMessages.querySelectorAll('.message');
      const conversationGroups = {};
      
      console.log('🔍 DEBUG: Updating message visual hierarchy, found', allMessages.length, 'messages');
      console.log('🔍 LINE DEBUG: Using TOP-line approach with vertical lines!');
      
      // Group messages by conversation
      allMessages.forEach(message => {
        const conversationId = message.dataset.conversationId;
        if (!conversationGroups[conversationId]) {
          conversationGroups[conversationId] = [];
        }
        conversationGroups[conversationId].push(message);
      });
      
      // Update visual hierarchy for each conversation
      Object.values(conversationGroups).forEach(messages => {
        const threadStarter = messages.find(msg => !msg.classList.contains('message-reply'));
        const replies = messages.filter(msg => msg.classList.contains('message-reply') && msg.classList.contains('visible'));
        
        if (threadStarter && replies.length > 0) {
          // Add has-replies class to thread starter for vertical line
          threadStarter.classList.add('has-replies');
          console.log('🔍 LINE DEBUG: Thread starter', threadStarter.dataset.messageId, 'gets vertical line (has-replies class)');
          
          // Calculate vertical line height
          setTimeout(() => {
            updateVerticalLineHeight(threadStarter, replies);
          }, 10);
        } else if (threadStarter) {
          threadStarter.classList.remove('has-replies');
          console.log('🔍 LINE DEBUG: Thread starter without replies', threadStarter.dataset.messageId, 'gets no vertical line');
        }
        
        // Remove any old inline styles that might interfere
        allMessages.forEach(msg => {
          msg.style.borderBottom = '';
          msg.style.setProperty('--short-line-width', '');
          msg.style.setProperty('--reply-line-width', '');
        });
      });
    }

// Function to calculate and set the height of the vertical line
function updateVerticalLineHeight(threadStarter, replies) {
  if (!threadStarter || replies.length === 0) return;
  
  const lastReply = replies[replies.length - 1];
  if (!lastReply) return;
  
  // Get the position of the thread starter and last reply
  const threadStarterRect = threadStarter.getBoundingClientRect();
  const lastReplyRect = lastReply.getBoundingClientRect();
  
  // Calculate the height from bottom of avatar (32px from top) to last reply bottom
  const avatarBottom = threadStarterRect.top + 32; // 32px is avatar height
  const height = lastReplyRect.bottom - avatarBottom;
  
  console.log('🔍 Vertical line calculation:', {
    threadStarterTop: threadStarterRect.top,
    avatarBottom: avatarBottom,
    lastReplyBottom: lastReplyRect.bottom,
    height
  });
  
  // Set the height on the thread starter's ::after pseudo-element
  threadStarter.style.setProperty('--vertical-line-height', `${height}px`);
}

async function getPrimaryCommunityName() {
  try {
    const result = await chrome.storage.local.get(['primaryCommunity', 'communities']);
    const primaryCommunityId = result.primaryCommunity;
    const communities = result.communities;
    
    if (primaryCommunityId && communities) {
      const primaryCommunity = communities.find(c => c.id === primaryCommunityId);
      return primaryCommunity ? primaryCommunity.name : '';
    }
    return '';
  } catch (error) {
    console.error('Failed to get primary community name:', error);
    return '';
  }
}


async function addMessageToChat(message) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  // Remove placeholder text if it exists
  const placeholder = chatMessages.querySelector('p[style*="text-align: center"]');
  if (placeholder) {
    placeholder.remove();
  }

  // Get the community name from the conversation's communityId
  let communityName = '';
  if (message.conversation && message.conversation.communityId) {
    // Get community name from the communityId
    const result = await chrome.storage.local.get(['communities']);
    const communities = result.communities || [];
    const community = communities.find(c => c.id === message.conversation.communityId);
    communityName = community ? community.name : '';
  }
  
  // Fallback to current primary community if no community found
  if (!communityName) {
    communityName = await getPrimaryCommunityName();
  }
  
  // Create message element
  const messageDiv = document.createElement('div');
  
  // Determine message type and add appropriate classes
  if (message.isReply) {
    messageDiv.className = 'message message-reply thread-reply';
  } else {
    // This is a thread starter
    messageDiv.className = 'message thread-starter';
    
    // Check if this thread has replies
    if (message.hasReplies) {
      messageDiv.classList.add('has-replies');
    }
  }
  
  messageDiv.dataset.messageId = message.id;
  messageDiv.dataset.conversationId = message.conversationId;
  
  // Store reactions data for reactions loading (avoid circular reference)
  if (message.conversation && message.conversation.reactions) {
    // Filter reactions to only include those for this specific message
    const messageReactions = message.conversation.reactions.filter(reaction => 
      reaction.postId === message.id
    );
    console.log(`💾 Storing reactions data for message ${message.id}:`, messageReactions);
    messageDiv.dataset.reactions = JSON.stringify(messageReactions);
    console.log(`✅ Reactions data stored on element:`, messageDiv.dataset.reactions);
  } else {
    console.log(`❌ No reactions data to store for message ${message.id}. Conversation:`, message.conversation);
    // For new posts, ensure they start with no reactions
    messageDiv.dataset.reactions = JSON.stringify([]);
  }
  
  // If this is a reply, check if thread is expanded and add visible class
  if (message.isReply) {
    const threadToggle = document.querySelector(`[data-thread-id="${message.conversationId}"]`);
    if (threadToggle && threadToggle.dataset.expanded === 'true') {
      messageDiv.classList.add('visible');
    } else if (window.focusedMessage) {
      // If we're in focus mode, show all replies
      messageDiv.classList.add('visible');
    } else {
      // For replies, keep them collapsed by default (no visible class)
      // They will only be shown when the thread is expanded
      console.log('Reply added, keeping collapsed by default');
    }
  }
  
  // Convert URLs to clickable links
  const contentWithLinks = convertUrlsToLinks(message.body || message.content);
  
  // Get sender info - use author from Canopi 2 structure
  const author = message.author || { name: 'Unknown User', handle: 'unknown' };
  const senderName = author.name || author.handle || 'Unknown User';
  
  // Add reaction and reply buttons with counts
  const reactionCount = message.reactionCount || 0;
  const replyCount = message.replyCount || 0;
  const hasUnseenReplies = message.hasUnseenReplies || false;
  
  const reactionButton = `<button class="reaction-btn" data-message-id="${message.id}" title="Add reaction">🔘<span class="icon-count">${reactionCount > 0 ? reactionCount : ''}</span></button>`;
  const replyButton = `<button class="inline-reply-btn" data-message-id="${message.id}" title="Reply to message">💬</button>`;
  
  // Add thread toggle for first post in thread that has replies
  let threadToggleButton = '';
  if (message.hasReplies) {
    threadToggleButton = `<button class="thread-toggle-btn" data-thread-id="${message.conversationId}" title="Show thread replies" data-expanded="false">📂<span class="icon-count ${hasUnseenReplies ? 'unseen' : ''}">${replyCount}</span></button>`;
  }
  
  // Check if message is deleted
  if (message.deletedAt) {
    // Only show deleted messages if they have replies
    if (!message.hasReplies) {
      console.log('Skipping deleted message without replies in addMessageToChat:', message.id);
      return;
    }
    
    // For deleted messages, use the same structure as regular messages
    // but with "This message was deleted" as content
    
    // Use the same message structure as regular messages
    messageDiv.innerHTML = `
      <div class="message-avatar">${getSenderAvatar(author)}</div>
      <div class="message-content-wrapper">
        <div class="message-header-new">
          <span class="message-sender-name">${senderName}${communityName ? ` • ${communityName}` : ''}</span>
          <span class="message-time-new">${formatMessageTime(message.createdAt)}</span>
          <div class="message-actions-new" style="opacity: 1 !important; display: flex !important; visibility: visible !important;">
            ${await getMessageActionMenu(message)}
          </div>
        </div>
        <div class="message-content">This message was deleted</div>
        <div class="message-footer">
          ${reactionButton}
          ${replyButton}
          ${threadToggleButton}
        </div>
      </div>
    `;
    
    messageDiv.classList.add('deleted');
    chatMessages.appendChild(messageDiv);
    
    // Add event listeners for deleted message
    addMessageActionListeners(messageDiv, message);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }
  
  // Check if user can edit/delete (within 1 hour and is the author)
  const canEdit = canUserEditMessage(message);
  const editDeleteButtons = canEdit ? `
    <div class="message-actions">
      <button class="message-action-btn edit-btn" data-message-id="${message.id}" title="Edit message">
        ✏️
      </button>
      <button class="message-action-btn delete-btn" data-message-id="${message.id}" title="Delete message">
        🗑️
      </button>
    </div>
  ` : '';
  
  
          messageDiv.innerHTML = `
            <div class="message-avatar">${getSenderAvatar(author)}</div>
            <div class="message-content-wrapper">
              <div class="message-header-new">
                <span class="message-sender-name">${senderName}${communityName ? ` • ${communityName}` : ''}</span>
                <span class="message-time-new">${formatMessageTime(message.createdAt)}</span>
                <div class="message-actions-new" style="opacity: 1 !important; display: flex !important; visibility: visible !important;">
                  ${await getMessageActionMenu(message)}
                </div>
              </div>
              <div class="message-content">${contentWithLinks}</div>
              ${message.optionalContent ? `<div class="message-anchor">📍 ${message.optionalContent}</div>` : ''}
              <div class="message-footer">
                ${reactionButton}
                ${replyButton}
                ${threadToggleButton}
              </div>
            </div>
          `;
  
  // Add event listeners for action buttons
  addMessageActionListeners(messageDiv, message);
  
  
  
  // Add thread toggle listener
  if (threadToggleButton) {
    const toggleBtn = messageDiv.querySelector('.thread-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // For replies, focus the message instead of toggling
        if (message.isReply) {
          handleMessageFocus(message);
        } else {
          toggleThreadReplies(message.conversationId, messageDiv);
        }
      });
    }
  }
  
  chatMessages.appendChild(messageDiv);
  
  // Add avatar error handlers for CSP compliance
  const avatarImg = messageDiv.querySelector('img[data-avatar-fallback="true"]');
  if (avatarImg) {
    avatarImg.addEventListener('error', function() {
      this.style.display = 'none';
      const fallbackDiv = this.nextElementSibling;
      if (fallbackDiv) {
        fallbackDiv.style.display = 'flex';
      }
    });
  }
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Update visual hierarchy after adding message
  setTimeout(() => {
    updateMessageVisualHierarchy();
  }, 10);
}

// Check if a conversation has replies and add thread toggle if needed
async function checkAndAddThreadToggle(messageElement, conversationId) {
  try {
    // Get conversations for the current page to find replies
    const currentUri = window.location.href;
    const response = await api.getChatHistory(currentUri);
    
    // Filter for replies to this specific conversation
    const replies = response.conversations?.flatMap(conv => 
      conv.posts?.filter(post => post.parentId && post.conversationId === conversationId) || []
    ) || [];
    
    // Only add thread toggle if there are replies
    if (replies.length > 0) {
      const footer = messageElement.querySelector('.message-footer');
      if (footer) {
        const threadToggleButton = `<button class="thread-toggle-btn" data-thread-id="${conversationId}" title="Toggle thread replies">📂</button>`;
        footer.insertAdjacentHTML('afterbegin', threadToggleButton);
        
        // Add event listener for the new toggle button
        const toggleBtn = messageElement.querySelector('.thread-toggle-btn');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleThreadReplies(conversationId, messageElement);
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to check for thread replies:', error);
  }
}

// Generate UUID from email (same as server)
async function generateUUIDFromEmail(email) {
  // Use Web Crypto API to match server's SHA-256 behavior
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format as UUID (same as server)
  const uuid = [
    hashHex.substring(0, 8),
    hashHex.substring(8, 12),
    hashHex.substring(12, 16),
    hashHex.substring(16, 20),
    hashHex.substring(20, 32)
  ].join('-');
  return uuid;
}

function convertUrlsToLinks(text) {
  // URL regex pattern
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function getSenderName(userId) {
  // For now, return a formatted version of the userId
  // Later this could be enhanced to fetch real user names from the API
  if (userId === 'test-user') return 'Test User';
  if (userId === 'test-user-2') return 'Test User 2';
  if (userId.startsWith('116467399993975200419')) return 'Dave Room';
  return `User ${userId.substring(0, 8)}...`;
}

function getSenderInitial(name) {
  return (name || 'U').charAt(0).toUpperCase();
}

function getSenderAvatar(author) {
  if (!author) return getSenderInitial('Unknown');
  
  console.log('🔍 Avatar debug for author:', author);
  console.log('🔍 Avatar URL:', author.avatarUrl);
  
  // If there's an avatarUrl, use it
  if (author.avatarUrl && author.avatarUrl !== 'null' && author.avatarUrl !== '') {
    console.log('✅ Using avatar URL:', author.avatarUrl);
    return `<img src="${author.avatarUrl}" alt="${author.name || author.handle || 'User'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" data-avatar-fallback="true">
      <div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${getAvatarColor(author.name || author.handle || 'Unknown')}; display: none; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${(author.name || author.handle || 'Unknown').charAt(0).toUpperCase()}</div>`;
  }
  
  // Fallback to initial with colored background
  const name = author.name || author.handle || 'Unknown';
  const initial = name.charAt(0).toUpperCase();
  const color = getAvatarColor(name);
  console.log('⚠️ No avatar URL, using fallback:', { name, initial, color });
  return `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${initial}</div>`;
}

function formatMessageTime(createdAt) {
  const messageDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Same day - show hours since posted
  if (diffDays === 0) {
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'now' : `${diffMins}m`;
    }
    return `${diffHours}h`;
  }
  
  // Same year - show month and day
  if (messageDate.getFullYear() === now.getFullYear()) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[messageDate.getMonth()]} ${messageDate.getDate()}`;
  }
  
  // Different year - show month, day, year
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[messageDate.getMonth()]} ${messageDate.getDate()}, ${messageDate.getFullYear()}`;
}

async function getMessageActionMenu(message) {
  const now = new Date();
  const messageDate = new Date(message.createdAt);
  const diffMs = now - messageDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // Get current user to check ownership
  const result = await chrome.storage.local.get(['googleUser']);
  const currentUser = result.googleUser;
  
  // Generate the same UUID that the server uses for comparison
  let isOwner = false;
  if (currentUser) {
    const serverUserId = await generateUUIDFromEmail(currentUser.email);
    isOwner = (message.authorId === serverUserId);
  }
  
  // Check if user can edit/delete (only if they own the message)
  const canEdit = isOwner && diffHours < 1; // Can edit within 1 hour
  const canDelete = isOwner; // User can only delete their own messages
  const silentEdit = diffMinutes <= 5; // Silent edit within 5 minutes
  
  return `
    <div class="message-actions-menu" style="opacity: 1 !important; display: inline-block !important; visibility: visible !important; position: relative !important;">
      <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions" style="opacity: 1 !important; display: block !important; visibility: visible !important; background: none !important; border: none !important; padding: 0 !important; margin: 0 !important;">
        <span class="action-dots" style="opacity: 1 !important; display: inline-block !important; visibility: visible !important; font-size: 16px !important; color: var(--text-secondary) !important; background: none !important;">⋯</span>
      </button>
      <div class="action-dropdown" style="display: none;">
        ${canEdit ? `<button class="action-item edit-btn" data-message-id="${message.id}">✏️ Edit</button>` : ''}
        ${canDelete ? `<button class="action-item delete-btn" data-message-id="${message.id}">🗑️ Delete</button>` : ''}
        <button class="action-item copy-link-btn" data-message-id="${message.id}">🔗 Copy link</button>
        <button class="action-item block-btn" data-message-id="${message.id}" style="display:none;">🚫 Block user</button>
      </div>
    </div>
  `;
}

function canUserEditMessage(message) {
  // Check if current user is the author and message is less than 1 hour old
  const messageTime = new Date(message.createdAt);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // For now, we'll check against stored user ID
  // In a real implementation, this would check against the authenticated user
  const result = chrome.storage.local.get(['googleUser']);
  const currentUserId = result.googleUser?.id;
  
  return message.authorId === currentUserId && messageTime > oneHourAgo;
}

function addMessageActionListeners(messageDiv, message) {
  // Action dots button
  const dotsBtn = messageDiv.querySelector('.action-dots-btn');
  const dropdown = messageDiv.querySelector('.action-dropdown');
  
  if (dotsBtn && dropdown) {
    // Toggle dropdown on dots click
    dotsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns first
      document.querySelectorAll('.action-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
      });
      // Toggle this dropdown
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
      
      // Position the dropdown if showing
      if (!isVisible) {
        const rect = dotsBtn.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.left = `${rect.right - 140}px`; // Align to right edge
        dropdown.style.top = `${rect.bottom + 5}px`; // Below the button
        dropdown.style.zIndex = '10000';
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!messageDiv.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }
  
  // Edit button
  const editBtn = messageDiv.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleEditMessage(message);
    });
  }
  
  // Delete button
  const deleteBtn = messageDiv.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleDeleteMessage(message);
    });
  }
  
  // Copy link button
  const copyLinkBtn = messageDiv.querySelector('.copy-link-btn');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      dropdown.style.display = 'none';
      handleCopyLink(message);
    });
  }
  
  // Reaction button
  const reactionBtn = messageDiv.querySelector('.reaction-btn');
  if (reactionBtn) {
    reactionBtn.addEventListener('click', () => handleReaction(message));
    
    // Load existing reactions for this message
    loadMessageReactions(message.id, reactionBtn);
  }
  
  // Reply button
  const replyBtn = messageDiv.querySelector('.inline-reply-btn');
  if (replyBtn) {
    replyBtn.addEventListener('click', () => handleReplyToMessage(message));
  }
  
  // Message body click for focus
  const messageContent = messageDiv.querySelector('.message-content');
  if (messageContent) {
    messageContent.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons/links
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      handleMessageFocus(message);
    });
    messageContent.style.cursor = 'pointer';
  }
  
  // Thread button removed - every post is automatically a thread
}

async function handleEditMessage(message) {
  const chatTextarea = document.getElementById('chat-textarea');
  const contextBar = document.getElementById('context-bar');
  const contextText = document.getElementById('context-text');
  const sendButton = document.querySelector('.chat-input-area button, #chat-send-btn');
  
  if (!chatTextarea) {
    console.error('Chat textarea not found');
    return;
  }
  
  // Store original state
  const originalPlaceholder = chatTextarea.placeholder;
  const originalValue = chatTextarea.value;
  const originalButtonText = sendButton ? sendButton.textContent : '';
  
  // Show context bar for edit mode
  if (contextBar && contextText) {
    const messageContent = message.body || message.content || '';
    const editText = messageContent.length > 50 
      ? messageContent.substring(0, 50) + '...' 
      : messageContent;
    contextText.textContent = `Editing: "${editText}"`;
    contextBar.style.display = 'block';
    contextBar.style.visibility = 'visible';
    contextBar.style.opacity = '1';
    contextBar.style.zIndex = '1001';
    
    // Apply theme-aware styling
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    if (isDarkMode) {
      contextBar.style.background = 'var(--background-secondary)';
      contextBar.style.borderBottom = '1px solid var(--border-color)';
      contextBar.style.color = 'var(--text-primary)';
      contextText.style.color = 'var(--text-primary)';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = 'var(--text-primary)';
    } else {
      contextBar.style.background = 'var(--background-secondary)';
      contextBar.style.borderBottom = '1px solid var(--border-color)';
      contextBar.style.color = 'var(--text-primary)';
      contextText.style.color = 'var(--text-primary)';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = 'var(--text-primary)';
    }
    
    console.log('Context bar should be visible for edit mode');
  } else {
    console.error('❌ Context bar elements not found:', { contextBar, contextText });
  }
  
  // Set up edit mode
  chatTextarea.placeholder = 'Edit your message...';
  chatTextarea.value = message.body || message.content || '';
  chatTextarea.dataset.editingMessageId = message.id;
  
  // Apply theme-aware styling for edit mode
  const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
  if (isDarkMode) {
    chatTextarea.style.backgroundColor = 'var(--background-secondary)';
    chatTextarea.style.borderColor = 'var(--border-color)';
    chatTextarea.style.color = 'var(--text-primary)';
  } else {
    chatTextarea.style.backgroundColor = 'var(--background-secondary)';
    chatTextarea.style.borderColor = 'var(--border-color)';
    chatTextarea.style.color = 'var(--text-primary)';
  }
  chatTextarea.dataset.contextMode = 'edit';
  chatTextarea.focus();
  
  // Update send button to show "Update" or "Save"
  if (sendButton) {
    sendButton.textContent = 'Update';
    sendButton.dataset.editing = 'true';
  }
  
  // Add visual indicator
  chatTextarea.style.borderColor = 'var(--border-color)';
  chatTextarea.style.backgroundColor = 'var(--background-secondary)';
  
  // Handle save on Enter key
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  };
  
  // Handle save on button click
  const handleButtonClick = () => {
    if (sendButton && sendButton.dataset.editing === 'true') {
      saveEdit();
    }
  };
  
  // Save the edit
  const saveEdit = async () => {
    const newContent = chatTextarea.value.trim();
    if (newContent && newContent !== (message.body || message.content)) {
      try {
        const response = await api.editMessage(message.id, newContent);
        if (response && response.body) {
          // Update the message in the UI
          const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
          if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            contentDiv.innerHTML = convertUrlsToLinks(response.body);
            // Add edited indicator
            const timeElement = messageDiv.querySelector('.message-time-new');
            if (timeElement && !timeElement.textContent.includes('(edited)')) {
              timeElement.textContent += ' (edited)';
            }
          }
          showNotification('Message updated successfully');
        }
      } catch (error) {
        console.error('Failed to edit message:', error);
        showNotification('Failed to edit message');
      }
    }
    cancelEdit();
  };
  
  // Cancel the edit
  const cancelEdit = () => {
    // Use the centralized clearContext function
    clearContext();
    
    // Remove event listeners
    chatTextarea.removeEventListener('keydown', handleKeyDown);
    if (sendButton) {
      sendButton.removeEventListener('click', handleButtonClick);
    }
  };
  
  // Add event listeners
  chatTextarea.addEventListener('keydown', handleKeyDown);
  if (sendButton) {
    sendButton.addEventListener('click', handleButtonClick);
  }
}

async function handleDeleteMessage(message) {
  if (confirm('Are you sure you want to delete this message?')) {
    try {
      const response = await api.deleteMessage(message.id);
      // Server returns { message: 'Post deleted', id } on success
      if (response.message && response.message.includes('deleted')) {
        // Remove the message from the UI
        const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageDiv) {
          messageDiv.remove();
        }
        showNotification('Message deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      showNotification('Failed to delete message');
    }
  }
}

async function handleCopyLink(message) {
  try {
    // Create shareable URL for the message
    const baseUrl = window.location.origin + window.location.pathname;
    const messageUrl = `${baseUrl}#message=${message.id}&conversation=${message.conversationId}`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(messageUrl);
    
    // Show feedback
    const copyBtn = document.querySelector(`[data-message-id="${message.id}"].copy-link-btn`);
    if (copyBtn) {
      const originalText = copyBtn.title;
      copyBtn.title = 'Copied!';
      setTimeout(() => {
        copyBtn.title = originalText;
      }, 2000);
    }
    
    debug('Message link copied to clipboard');
  } catch (error) {
    console.error('Failed to copy link:', error);
    debug('Failed to copy link: ' + error.message);
  }
}

async function handleMessageFocus(message) {
  try {
    debug(`Focusing on message: ${message.id}`);
    
    // Clear the current chat display
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    // Store current state for navigation
    window.focusedMessage = message;
    window.previousView = message.parentId ? 'thread' : 'all';
    
    // Clear messages
    chatMessages.innerHTML = '';
    
    // Get conversation title for the header
    let conversationTitle = 'Thread';
    try {
      const conversationResponse = await api.getChatHistory(null, message.conversationId);
      if (conversationResponse && conversationResponse.title) {
        conversationTitle = conversationResponse.title;
      }
    } catch (error) {
      console.log('Could not get conversation title, using default');
    }
    
    // Add back navigation
    const backNav = document.createElement('div');
    backNav.className = 'navigation-header';
    
    if (message.parentId) {
      // This is a reply - back goes to the thread
      backNav.innerHTML = `
        <button class="back-btn" data-action="back">&lt;</button>
        <span class="focus-title">thread</span>
      `;
    } else {
      // This is a thread - back goes to all threads
      backNav.innerHTML = `
        <button class="back-btn" data-action="back">&lt;</button>
      `;
    }
    
    // Add event listener for back button
    const backBtn = backNav.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', handleBackNavigation);
    }
    
    chatMessages.appendChild(backNav);
    
    // Get the full conversation data first
    const response = await api.getChatHistory(null, message.conversationId);
    
    // Calculate reply count for the focused message
    let replyCount = 0;
    if (response && response.posts) {
      const replies = response.posts.filter(post => post.parentId === message.id && !post.deletedAt);
      replyCount = replies.length;
    }
    
    // Show the focused message (as a thread, not a reply) with correct reply count and conversation data
    const focusedMsg = { 
      ...message, 
      isReply: false, 
      hasReplies: replyCount > 0, 
      replyCount: replyCount,
      conversation: response // Include the full conversation data
    };
    await addMessageToChat(focusedMsg);
    
    // Load and show replies to this message (expanded by default)
    await loadMessageReplies(message.id, message.conversationId);
    
  } catch (error) {
    console.error('Failed to focus on message:', error);
    debug('Failed to focus on message: ' + error.message);
  }
}

async function loadMessageReplies(messageId, conversationId) {
  try {
    // Get the full conversation to find replies to this specific message
    const response = await api.getChatHistory(null, conversationId);
    
    if (response && response.posts) {
      const replies = response.posts.filter(post => post.parentId === messageId);
      
      // Sort replies by creation time
      replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Add each reply (they will be visible since we're in focus mode)
      for (const reply of replies) {
        // Check if this reply has its own replies (nested replies)
        const nestedReplies = response.posts.filter(post => post.parentId === reply.id);
        
        const replyMsg = { 
          ...reply, 
          conversationId, 
          isReply: true, 
          hasReplies: nestedReplies.length > 0 // Show thread toggle if it has nested replies
        };
        await addMessageToChat(replyMsg);
      }
    }
  } catch (error) {
    console.error('Failed to load message replies:', error);
  }
}

async function handleBackNavigation() {
  if (window.focusedMessage && window.previousView) {
    // Store the current state before clearing
    const focusedMessage = window.focusedMessage;
    const previousView = window.previousView;
    
    // Clear focus state
    delete window.focusedMessage;
    delete window.previousView;
    
    if (previousView === 'thread') {
      // This was a reply - go back to the thread view
      // We need to find the parent message and focus on it
      try {
        // Get the conversation to find the parent message
        const response = await api.getChatHistory(null, focusedMessage.conversationId);
        if (response && response.conversations && response.conversations.length > 0) {
          const conversation = response.conversations[0];
          const parentMessage = conversation.posts.find(post => post.id === focusedMessage.parentId);
          if (parentMessage) {
            // Add conversation context to the parent message
            parentMessage.conversationId = conversation.id;
            parentMessage.conversationTitle = conversation.title;
            
            // Calculate proper counts for the parent message
            const directReplies = conversation.posts.filter(p => p.parentId === parentMessage.id);
            parentMessage.hasReplies = directReplies.filter(r => !r.deletedAt).length > 0;
            parentMessage.replyCount = directReplies.filter(r => !r.deletedAt).length;
            // Calculate reaction count for this specific message
            const parentReactions = conversation.reactions ? conversation.reactions.filter(r => r.postId === parentMessage.id) : [];
            parentMessage.reactionCount = parentReactions.length;
            
            // Focus on the parent message (which should be a thread)
            await handleMessageFocus(parentMessage);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to navigate back to parent thread:', error);
      }
    }
    
    // Fallback: go back to all threads view
    await loadChatHistory();
  }
}

// Theme management functions
function initializeTheme() {
  // Load saved theme from storage or default to light
  chrome.storage.local.get(['theme'], (result) => {
    const savedTheme = result.theme || 'light';
    setTheme(savedTheme);
  });
}

function setTheme(theme) {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  
  if (theme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = 'Light mode';
  } else {
    body.setAttribute('data-theme', 'light');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeText) themeText.textContent = 'Dark mode';
  }
  
  // Save theme preference
  chrome.storage.local.set({ theme: theme });
  debug(`Theme set to: ${theme}`);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

async function loadMessageReactions(messageId, reactionBtn) {
  try {
    console.log(`🔍 Loading reactions for message ${messageId}`);
    
    // First try to get reactions from the stored reactions data if available
    let reactions = [];
    // Find the parent message div (not the button itself)
    const messageDiv = reactionBtn.closest('.message');
    if (messageDiv) {
      console.log(`🔍 Message div found:`, messageDiv);
      console.log(`🔍 Message div dataset:`, messageDiv.dataset);
      const reactionsData = messageDiv.dataset.reactions;
      console.log(`📊 Stored reactions data:`, reactionsData);
      if (reactionsData) {
        reactions = JSON.parse(reactionsData);
        console.log(`✅ Parsed reactions from stored data:`, reactions);
      }
    } else {
      console.log(`❌ No message div found for reaction button`);
    }
    
    // Fallback to API call if no conversation data
    if (reactions.length === 0) {
      console.log(`🔄 No stored reactions, calling API for message ${messageId}`);
      reactions = await api.getReactions(messageId);
      console.log(`📡 API returned reactions:`, reactions);
    }
    
    const countSpan = reactionBtn.querySelector('.icon-count');
    
    if (reactions && reactions.length > 0) {
      console.log(`📊 Found ${reactions.length} reactions`);
      
      // Update count
      if (countSpan) {
        countSpan.textContent = reactions.length;
        countSpan.style.display = 'inline';
        console.log(`📊 Updated count to: ${reactions.length}`);
      }
      
      // Check if current user has reacted
      const result = await chrome.storage.local.get(['googleUser']);
      const currentUser = result.googleUser;
      console.log(`👤 Current user:`, currentUser);
      
      if (currentUser) {
        // Generate the same UUID that the server uses
        const serverUserId = await generateUUIDFromEmail(currentUser.email);
        console.log(`🆔 Generated server user ID: ${serverUserId}`);
        
        // Find user reaction by ID or email (fallback for existing data)
        console.log(`🔍 User ID matching debug:`);
        console.log(`   Generated server user ID: ${serverUserId}`);
        console.log(`   Current user ID: ${currentUser.id}`);
        console.log(`   Current user email: ${currentUser.email}`);
        console.log(`   All reaction user IDs:`, reactions.map(r => r.userId));
        
        const userReaction = reactions.find(r => 
          r.userId === serverUserId || 
          r.userId === currentUser.id || 
          r.user.email === currentUser.email
        );
        
        console.log(`🔍 Looking for user reaction. Found:`, userReaction);
        console.log(`🔍 All reactions:`, reactions.map(r => ({ userId: r.userId, emoji: r.emoji, kind: r.kind })));
        
        if (userReaction) {
          // Show the actual emoji from the database
          const emoji = userReaction.emoji || '👍';
          console.log(`✅ Setting reaction button to emoji: ${emoji}`);
          // Update the emoji but preserve the count span
          const countSpan = reactionBtn.querySelector('.icon-count');
          const countText = countSpan ? countSpan.textContent : '';
          reactionBtn.innerHTML = `${emoji}${countText ? `<span class="icon-count">${countText}</span>` : ''}`;
          reactionBtn.dataset.reaction = emoji;
        } else {
          console.log(`❌ No user reaction found`);
        }
      } else {
        console.log(`❌ No current user found`);
      }
    } else {
      console.log(`📊 No reactions found, setting default state`);
      // No reactions, hide count and set default state
      if (countSpan) {
        countSpan.textContent = '';
        countSpan.style.display = 'none';
      }
      reactionBtn.textContent = '🔘';
      delete reactionBtn.dataset.reaction;
    }
  } catch (error) {
    console.error('Failed to load reactions for message:', messageId, error);
  }
}

async function handleReaction(message) {
  const reactions = ['👍', '❓', '🔁', '🔗', '⚠️', '🙅'];
  
  // Find the reaction button that was clicked
  const reactionBtn = document.querySelector(`[data-message-id="${message.id}"].reaction-btn`);
  if (!reactionBtn) return;
  
  // Create reaction modal
  const modal = document.createElement('div');
  modal.className = 'reaction-modal';
  modal.innerHTML = `
    <div class="reaction-options">
      ${reactions.map(reaction => `<button class="reaction-option" data-reaction="${reaction}">${reaction}</button>`).join('')}
    </div>
  `;
  
  // Position modal above the reaction button
  const rect = reactionBtn.getBoundingClientRect();
  modal.style.position = 'fixed';
  modal.style.left = `${rect.left}px`;
  modal.style.bottom = `${window.innerHeight - rect.top + 10}px`;
  modal.style.zIndex = '10000';
  
  // Add modal to page
  document.body.appendChild(modal);
  
  // Add click handlers for reaction options
  modal.querySelectorAll('.reaction-option').forEach(option => {
    option.addEventListener('click', async (e) => {
      const selectedReaction = e.target.dataset.reaction;
      
      // Update the reaction button with the selected reaction
      reactionBtn.textContent = selectedReaction;
      reactionBtn.dataset.reaction = selectedReaction;
      
      // Remove modal
      document.body.removeChild(modal);
      
      try {
        // Map emoji to semantically meaningful reaction kind (original mapping)
        const reactionMap = {
          '👍': 'AGREE',     // Thumbs up = agree
          '❓': 'QUESTION',  // Question mark = question
          '🔁': 'CLARIFY',      // Repeat = clarify
          '🔗': 'CITE',      // Link = cite
          '⚠️': 'FLAG',      // Warning = flag
          '🙅': 'DISAGREE'   // No gesture = disagree
        };
        
        const kind = reactionMap[selectedReaction] || 'AGREE';
        
        // Store the actual emoji clicked for later retrieval
        reactionBtn.dataset.selectedEmoji = selectedReaction;
        
        // Toggle reaction via API (store both kind and emoji)
        console.log(`🔄 Toggling reaction: kind=${kind}, messageId=${message.id}, conversationId=${message.conversationId}, emoji=${selectedReaction}`);
        const response = await api.toggleReaction(kind, message.id, message.conversationId, selectedReaction);
        console.log(`✅ Reaction toggled for message ${message.id}:`, response);
        
        // Update reaction count if available
        const countSpan = reactionBtn.querySelector('.icon-count');
        if (countSpan) {
          // Get current reactions to update count
          const reactions = await api.getReactions(message.id);
          const count = reactions.length;
          
          if (count > 0) {
            countSpan.textContent = count;
            countSpan.style.display = 'inline';
          } else {
            countSpan.textContent = '';
            countSpan.style.display = 'none';
          }
        }
      } catch (error) {
        console.error('Failed to add reaction:', error);
        // Revert the button if API call failed
        reactionBtn.textContent = '🔘';
        delete reactionBtn.dataset.reaction;
      }
    });
  });
  
  // Close modal when clicking outside
  const closeModal = (e) => {
    if (!modal.contains(e.target)) {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
      document.removeEventListener('click', closeModal);
    }
  };
  
  // Add click outside listener after a small delay to prevent immediate closure
  setTimeout(() => {
    document.addEventListener('click', closeModal);
  }, 100);
}

function handleReplyToMessage(message) {
  const chatInput = document.getElementById('chat-textarea');
  const contextBar = document.getElementById('context-bar');
  const contextText = document.getElementById('context-text');
  
  if (chatInput && contextBar && contextText) {
    // Show the actual message content instead of user name
    const messageContent = message.body || message.content || '';
    const replyText = messageContent.length > 50 
      ? messageContent.substring(0, 50) + '...' 
      : messageContent;
    
    // Show context bar
    contextText.textContent = `Replying to: "${replyText}"`;
    contextBar.style.display = 'block';
    contextBar.style.visibility = 'visible';
    contextBar.style.opacity = '1';
    contextBar.style.zIndex = '1001';
    
    // Apply theme-aware styling
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    if (isDarkMode) {
      contextBar.style.background = 'var(--background-secondary)';
      contextBar.style.borderBottom = '1px solid var(--border-color)';
      contextBar.style.color = 'var(--text-primary)';
      contextText.style.color = 'var(--text-primary)';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = 'var(--text-primary)';
    } else {
      contextBar.style.background = 'var(--background-secondary)';
      contextBar.style.borderBottom = '1px solid var(--border-color)';
      contextBar.style.color = 'var(--text-primary)';
      contextText.style.color = 'var(--text-primary)';
      const cancelBtn = contextBar.querySelector('#cancel-context');
      if (cancelBtn) cancelBtn.style.color = 'var(--text-primary)';
    }
    
    console.log('Context bar should be visible for reply mode');
    
    // Clear input and focus
    chatInput.value = '';
    chatInput.placeholder = 'Type your reply...';
    chatInput.focus();
    autoResize(chatInput);
    
    // Store the parent message ID and conversation ID for when the reply is sent
    chatInput.dataset.replyTo = message.id;
    chatInput.dataset.replyToConversation = message.conversationId;
    chatInput.dataset.contextMode = 'reply';
  }
}

function clearContext() {
  console.log('🧹 Clearing context...');
  const chatInput = document.getElementById('chat-textarea');
  const contextBar = document.getElementById('context-bar');
  const sendButton = document.querySelector('.chat-input-area button, #chat-send-btn');
  
  console.log('🔍 Elements found:', { chatInput: !!chatInput, contextBar: !!contextBar, sendButton: !!sendButton });
  
  if (contextBar) {
    contextBar.style.display = 'none';
    contextBar.style.visibility = 'hidden';
    contextBar.style.opacity = '0';
    
    // Reset styling to default
    contextBar.style.background = '';
    contextBar.style.borderBottom = '';
    contextBar.style.color = '';
    const contextText = contextBar.querySelector('#context-text');
    if (contextText) contextText.style.color = '';
    const cancelBtn = contextBar.querySelector('#cancel-context');
    if (cancelBtn) cancelBtn.style.color = '';
    
    console.log('✅ Context bar hidden');
  }
  
  if (chatInput) {
    // Clear all context data
    delete chatInput.dataset.replyTo;
    delete chatInput.dataset.replyToConversation;
    delete chatInput.dataset.editingMessageId;
    delete chatInput.dataset.contextMode;
    
    // Reset input to regular size
    chatInput.value = '';
    chatInput.placeholder = 'Start thread in Public Square';
    chatInput.style.borderColor = '';
    chatInput.style.backgroundColor = '';
    chatInput.style.color = '';
    
    // Reset height properly
    chatInput.style.height = 'auto';
    chatInput.style.overflowY = 'hidden';
    
    // Force a reflow to ensure the height resets
    chatInput.offsetHeight; // Force reflow
    
    // Ensure it's at natural height for empty content
    setTimeout(() => {
      if (chatInput.value === '') {
        chatInput.style.height = 'auto';
        // Let it naturally size to its content (empty = minimum height)
        console.log('✅ Chat input height reset to natural size');
      }
    }, 10);
    
    console.log('✅ Chat input reset');
  }
  
  if (sendButton) {
    sendButton.textContent = 'Send';
    delete sendButton.dataset.editing;
    console.log('✅ Send button reset');
  }
  
  console.log('🧹 Context cleared successfully');
}

function handleStartThread(message) {
  const chatInput = document.getElementById('chat-textarea');
  if (chatInput) {
    chatInput.value = `Starting thread on "${message.content.substring(0, 50)}...": `;
    chatInput.focus();
    autoResize(chatInput);
    
    // Store the thread message ID for when the thread message is sent
    chatInput.dataset.threadId = message.id;
  }
}

function updatePlaceholderText(communityName) {
  const chatTextarea = document.getElementById('chat-textarea');
  if (chatTextarea) {
    chatTextarea.placeholder = `Start thread in ${communityName}`;
  }
}

async function getCurrentPageUri() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const uri = tab && tab.url ? tab.url : null;
    console.log('Current page URI:', uri);
    debug(`Current page URI: ${uri}`);
    return uri;
  } catch (error) {
    console.error('Failed to get current page URI:', error);
    debug(`Failed to get current page URI: ${error.message}`);
    return null;
  }
}

async function handlePendingContent() {
  try {
    const result = await chrome.storage.local.get([
      'pendingMessageContent', 
      'pendingMessageUri',
      'pendingVisibilityContent',
      'pendingVisibilityUri'
    ]);

    // Handle pending message content
    if (result.pendingMessageContent) {
      const chatInput = document.getElementById('chat-textarea');
      if (chatInput) {
        // Pre-populate the message input with the selected content
        chatInput.value = `Commenting on: "${result.pendingMessageContent}"`;
        chatInput.focus();
        
        // Auto-resize the textarea
        autoResize(chatInput);
        
        // Clear the pending content
        await chrome.storage.local.remove(['pendingMessageContent', 'pendingMessageUri']);
        
        console.log('Pre-populated message input with selected content');
      }
    }

    // Handle pending visibility content
    if (result.pendingVisibilityContent) {
      // For now, we'll show a notification that visibility anchoring is not yet implemented
      // In the future, this could update the user's visibility status
      console.log('Pending visibility content:', result.pendingVisibilityContent);
      
      // Clear the pending content
      await chrome.storage.local.remove(['pendingVisibilityContent', 'pendingVisibilityUri']);
      
      // Show a temporary notification
      showNotification('Visibility anchoring feature coming soon!');
    }
  } catch (error) {
    console.error('Failed to handle pending content:', error);
  }
}

function showNotification(message) {
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #007bff;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

async function loadChatHistory(communityId = null) {
  try {
    // Get primary community if not provided
    if (!communityId) {
      const result = await chrome.storage.local.get(['primaryCommunity', 'currentCommunity']);
      communityId = result.primaryCommunity || result.currentCommunity || 'comm-001';
    }
    
    console.log('Loading chat history for community:', communityId);
    debug(`Loading chat history for community: ${communityId}`);
    
    // Get current page URI for page-specific messages
    const currentUri = await getCurrentPageUri();
    console.log('Loading chat history for URI:', currentUri);
    debug(`Loading chat history for URI: ${currentUri}`);
    
    const response = await api.getChatHistory(communityId, null, currentUri);
    console.log('Chat history response:', response);
    debug(`Chat history response: ${JSON.stringify(response)}`);
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    // Clear existing messages
    chatMessages.innerHTML = '';
    
    // Handle Canopi 2.0 API response structure
    if (response.conversations && response.conversations.length > 0) {
      // Process each conversation as a thread
      for (const conversation of response.conversations) {
        if (conversation.posts && conversation.posts.length > 0) {
          // Sort posts within each conversation by creation time
          const sortedPosts = conversation.posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          // Find the main thread post (parentId === null)
          const mainThreadPost = sortedPosts.find(p => p.parentId === null);
          if (!mainThreadPost) return; // Skip if no main thread post
          
          // Find direct replies to the main thread
          const directReplies = sortedPosts.filter(p => p.parentId === mainThreadPost.id);
          
          // Add conversation info to main thread post
          mainThreadPost.conversationId = conversation.id;
          mainThreadPost.conversationTitle = conversation.title;
          mainThreadPost.conversation = conversation; // Include full conversation data
          mainThreadPost.isReply = false;
          mainThreadPost.isFirstInThread = true;
          mainThreadPost.hasReplies = directReplies.filter(r => !r.deletedAt).length > 0; // Only count NON-DELETED replies
          mainThreadPost.replyCount = directReplies.filter(r => !r.deletedAt).length; // Count only non-deleted replies for display
          // Calculate reaction count for this specific message
          const messageReactions = conversation.reactions ? conversation.reactions.filter(r => r.postId === mainThreadPost.id) : [];
          mainThreadPost.reactionCount = messageReactions.length;
          
          // Skip deleted main thread unless it has NON-DELETED replies
          if (mainThreadPost.deletedAt && !mainThreadPost.hasReplies) {
            console.log('Skipping deleted main thread without NON-DELETED replies:', mainThreadPost.id, 'hasReplies:', mainThreadPost.hasReplies, 'totalReplies:', directReplies.length, 'nonDeletedReplies:', directReplies.filter(r => !r.deletedAt).length);
            return; // Don't add deleted main thread without non-deleted replies
          }
          
          // Debug: Log when deleted main thread has non-deleted replies
          if (mainThreadPost.deletedAt && mainThreadPost.hasReplies) {
            console.log('Deleted main thread WITH non-deleted replies:', mainThreadPost.id, 'hasReplies:', mainThreadPost.hasReplies, 'totalReplies:', directReplies.length, 'nonDeletedReplies:', directReplies.filter(r => !r.deletedAt).length);
          }
          
          // Add the main thread post to chat
          await addMessageToChat(mainThreadPost);
          
          // Add direct replies (but not nested replies)
          for (const reply of directReplies) {
            // Count nested replies for this reply (only non-deleted ones)
            const nestedReplies = sortedPosts.filter(p => p.parentId === reply.id && !p.deletedAt);
            
            reply.conversationId = conversation.id;
            reply.conversationTitle = conversation.title;
            reply.conversation = conversation; // Include full conversation data
            reply.isReply = true;
            reply.isFirstInThread = false;
            reply.hasReplies = nestedReplies.length > 0; // Show toggle if has nested replies
            reply.replyCount = nestedReplies.length;
            // Calculate reaction count for this specific reply
            const replyReactions = conversation.reactions ? conversation.reactions.filter(r => r.postId === reply.id) : [];
            reply.reactionCount = replyReactions.length;
            
            // Skip deleted replies unless they have nested replies
            if (reply.deletedAt && !reply.hasReplies) {
              console.log('Skipping deleted reply without nested replies:', reply.id);
              continue;
            }
            
            await addMessageToChat(reply);
          }
          
          // Debug logging for thread detection
          if (mainThreadPost.hasReplies) {
            console.log('Thread toggle should show for post:', mainThreadPost.id, 'in conversation:', mainThreadPost.conversationId);
          }
        }
      }
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
      const avatarUrl = user.user_metadata?.avatar_url || user.picture;
      console.log('🔍 Profile avatar debug - user object:', user);
      console.log('🔍 Profile avatar debug - avatarUrl:', avatarUrl);
      console.log('🔍 Profile avatar debug - user_metadata:', user.user_metadata);
      console.log('🔍 Profile avatar debug - picture:', user.picture);
      if (avatarUrl && avatarUrl !== 'null' && avatarUrl !== '') {
        userAvatarImg.src = avatarUrl;
        userAvatarImg.alt = user.user_metadata?.full_name || user.email;
        userAvatarImg.style.display = 'block';
        // Add error handler to fallback to colored initial if image fails to load
        userAvatarImg.onerror = function() {
          console.log('❌ Avatar image failed to load, falling back to colored initial');
          userAvatarImg.style.display = 'none';
          const name = user.user_metadata?.full_name || user.email || 'User';
          const initial = name.charAt(0).toUpperCase();
          // Use the user's custom avatar background color or fallback to message avatar color
          const customColor = getUserAvatarBgColor();
          const defaultColor = getAvatarColor(name);
          const color = customColor !== '#45B7D1' ? customColor : defaultColor; // Use custom if set, otherwise use name-based color
          const avatarDiv = document.createElement('div');
          avatarDiv.style.cssText = `width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;`;
          avatarDiv.textContent = initial;
          userAvatarImg.parentNode.insertBefore(avatarDiv, userAvatarImg);
        };
        console.log('✅ Set user avatar to:', avatarUrl);
      } else {
        // Use a colored initial instead of placeholder image
        const name = user.user_metadata?.full_name || user.email || 'User';
        const initial = name.charAt(0).toUpperCase();
        // Use the user's custom avatar background color or fallback to message avatar color
        const customColor = getUserAvatarBgColor();
        const defaultColor = getAvatarColor(name);
        const color = customColor !== '#45B7D1' ? customColor : defaultColor; // Use custom if set, otherwise use name-based color
        userAvatarImg.style.display = 'none';
        
        // Create a colored div to replace the image
        const avatarDiv = document.createElement('div');
        avatarDiv.style.cssText = `width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;`;
        avatarDiv.textContent = initial;
        userAvatarImg.parentNode.insertBefore(avatarDiv, userAvatarImg);
        console.log('No avatar URL, using colored initial with user background color:', color);
      }
    }
    debug(`User logged in: ${userMenuName?.textContent}`);
    console.log('UI updated: User authenticated, showing user info');
    
    // Add click handler to aura button after UI update
    addAuraButtonClickHandler();
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

  // === Initialize Theme ===
  initializeTheme();
  
  // === Load User Avatar Background Color Configuration ===
  await loadUserAvatarBgConfig();
  
  // Add click handler to aura button
  addAuraButtonClickHandler();
  
  // === Update Visual Hierarchy for Existing Messages ===
  setTimeout(() => {
    updateMessageVisualHierarchy();
  }, 100);
  
  // === Add Window Resize Listener for Visual Hierarchy ===
  window.addEventListener('resize', () => {
    setTimeout(() => {
      updateMessageVisualHierarchy();
    }, 100);
  });

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
      
      // Check for pending content from selection widget
      await handlePendingContent();
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
    
    // Also load chat history for the current page
    setTimeout(async () => {
      try {
        await loadChatHistory();
        console.log('Chat history loaded for current page');
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }, 1000); // Small delay to ensure communities are loaded first
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
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
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
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      debug('Theme toggle button clicked');
      toggleTheme();
    });
  }
  if (closeMagicLinkModal) {
    closeMagicLinkModal.addEventListener('click', () => {
      magicLinkModal.style.display = 'none';
    });
  }

  // Add cancel context button event listener
  const cancelContextBtn = document.getElementById('cancel-context');
  if (cancelContextBtn) {
    cancelContextBtn.addEventListener('click', clearContext);
  }
  if (sendMagicLinkBtn) {
    sendMagicLinkBtn.addEventListener('click', () => sendMagicLink());
  }

  // --- Chat Input Authentication ---
  const chatInput = document.getElementById('chat-textarea');
  
  // Add auto-resize functionality to textarea
  if (chatInput) {
    chatInput.addEventListener('input', function() {
      autoResize(this);
    });
    
    // Handle window resize to recalculate max height
    window.addEventListener('resize', function() {
      autoResize(chatInput);
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
  
  // Send button removed - using Enter key only
  
  // Add Enter key support for sending messages
  if (chatInput) {
    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
      }
    });
  }
  
  function sendChatMessage() {
    console.log('Chat send button clicked');
    requireAuth('send messages', async () => {
      // Check if we're in edit mode
      if (chatInput.dataset.editingMessageId) {
        // Handle edit mode - this will be handled by the edit function's event listeners
        return;
      }
      
      let message = chatInput?.value?.trim();
      if (message) {
        debug(`Sending message: ${message}`);
        console.log('Sending message:', message);
        
        try {
          // Get current user and primary community
          const result = await chrome.storage.local.get(['googleUser', 'primaryCommunity', 'currentCommunity']);
          const user = result.googleUser;
          const communityId = result.primaryCommunity || result.currentCommunity || 'comm-001';
          
          if (user && user.id) {
            try {
              // Get current page URI
              const currentUri = await getCurrentPageUri();
              debug(`Current page URI: ${currentUri}`);
              
              // Check if this is a message with selected content
              let optionalContent = null;
              if (message.startsWith('Commenting on: "')) {
                // Extract the selected content from the pre-populated message
                const match = message.match(/^Commenting on: "(.+)"$/);
                if (match) {
                  optionalContent = match[1];
                  // Remove the prefix from the actual message content
                  message = message.replace(/^Commenting on: ".+":\s*/, '');
                }
              }
              
              // Check if this is a reply or thread
              let parentId = null;
              let threadId = null;
              
              if (chatInput.dataset.replyTo) {
                parentId = chatInput.dataset.replyTo;
                threadId = chatInput.dataset.replyToConversation; // Use the conversation ID as thread ID
                debug(`Reply detected: parentId=${parentId}, threadId=${threadId}`);
                console.log('Reply detected:', { parentId, threadId });
                // Clear the reply data
                delete chatInput.dataset.replyTo;
                delete chatInput.dataset.replyToConversation;
                delete chatInput.dataset.contextMode;
              } else if (chatInput.dataset.threadId) {
                threadId = chatInput.dataset.threadId;
                // Remove the thread prefix from the message
                message = message.replace(/^Starting thread on ".+":\s*/, '');
                // Clear the thread data
                delete chatInput.dataset.threadId;
              }
              
              const response = await api.sendMessage(user.id, communityId, message, currentUri, parentId, threadId, optionalContent);
              debug(`Message sent successfully: ${response?.id}`);
              console.log('Message sent:', response);
              
              // Add message to chat display - handle both conversation and post responses
              let newPost = null;
              if (response && response.id) {
                // Check if this is a conversation response (new conversation) or post response (reply)
                if (response.posts && response.posts.length > 0) {
                  // This is a conversation response - get the first post
                  newPost = response.posts[0];
                  newPost.conversationId = response.id;
  } else {
                  // This is a post response - use it directly
                  newPost = response;
                }
                
                // Set proper flags for the new post
                newPost.isReply = !!newPost.parentId;
                
                // Store the original community name for this message
                const currentCommunityName = await getPrimaryCommunityName();
                newPost.originalCommunityName = currentCommunityName;
                
                // Ensure the new post has conversation data with empty reactions (new posts shouldn't inherit reactions)
                newPost.conversation = {
                  reactions: [] // New posts start with no reactions
                };
                
                console.log('Adding new post to chat:', newPost);
                console.log('New post conversation data:', newPost.conversation);
                
                await addMessageToChat(newPost);
                console.log('New post added to chat successfully');
                
                // If this was a reply, expand the thread after adding the message
                if (newPost.parentId && newPost.conversationId) {
                  // Use setTimeout to ensure DOM is updated before trying to expand
                  setTimeout(() => {
                    // First, ensure the parent message has a thread toggle
                    const parentMessage = document.querySelector(`[data-message-id="${newPost.parentId}"]`);
                    if (parentMessage) {
                      let threadToggle = parentMessage.querySelector('.thread-toggle-btn');
                      if (!threadToggle) {
                        // Create thread toggle if it doesn't exist
                        console.log('Creating thread toggle for parent message');
                        const footer = parentMessage.querySelector('.message-footer');
                        if (footer) {
                          const threadToggleHTML = `<button class="thread-toggle-btn" data-thread-id="${newPost.conversationId}" title="Show thread replies" data-expanded="false">📂<span class="icon-count">1</span></button>`;
                          footer.insertAdjacentHTML('afterbegin', threadToggleHTML);
                          threadToggle = parentMessage.querySelector('.thread-toggle-btn');
                          
                          // Add event listener for the new thread toggle
                          threadToggle.addEventListener('click', (e) => {
                            e.stopPropagation();
                            toggleThreadReplies(newPost.conversationId, parentMessage);
                          });
                        }
                      }
                    }
                    
                    // Update thread toggle count but don't auto-expand
                    const threadToggle = document.querySelector(`[data-thread-id="${newPost.conversationId}"]`);
                    console.log('Looking for thread toggle:', `[data-thread-id="${newPost.conversationId}"]`);
                    console.log('Found thread toggle:', threadToggle);
                    if (threadToggle) {
                      // Update the count on the toggle button
                      const countSpan = threadToggle.querySelector('.icon-count');
                      if (countSpan) {
                        const currentCount = parseInt(countSpan.textContent) || 0;
                        countSpan.textContent = currentCount + 1;
                      }
                      console.log('New reply added, thread toggle count updated but not auto-expanded');
                    }
                  }, 100);
                }
              } else {
                console.log('No valid post in response:', response);
                console.log('Response structure:', {
                  hasResponse: !!response,
                  hasId: !!(response && response.id),
                  responseKeys: response ? Object.keys(response) : []
                });
              }
              
              // Clear input and reset height
              chatInput.value = '';
              chatInput.style.height = 'auto';
              chatInput.style.overflowY = 'hidden';
              
              // Clear context bar and reset input styling
              const contextBar = document.getElementById('context-bar');
              if (contextBar) {
                contextBar.style.display = 'none';
              }
              chatInput.placeholder = 'Start thread in Public Square';
              chatInput.style.borderColor = '';
              chatInput.style.backgroundColor = '';
              
              // Force reset to minimum height
              setTimeout(() => {
                chatInput.style.height = '20px';
              }, 10);
            } catch (error) {
              debug(`Failed to send message: ${error.message}`);
              console.error('Failed to send message:', error);
            }
  } else {
            debug('No user found for sending message');
          }
        } catch (error) {
          debug(`Failed to send message: ${error.message}`);
          console.error('Failed to send message:', error);
        }
      }
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

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TAB_CHANGED') {
    console.log('Tab changed to:', message.tabId);
    handleTabChange(message.tabId);
    return true;
  }
  
  if (message.type === 'TAB_UPDATED') {
    console.log('Tab updated:', message.tabId, message.url);
    handleTabUpdate(message.tabId, message.url);
    return true;
  }
  
  return false;
});

// Handle tab changes
async function handleTabChange(tabId) {
  console.log('Handling tab change for tab:', tabId);
  debug(`Handling tab change for tab: ${tabId}`);
  try {
    // Get the current tab URL
    const tab = await chrome.tabs.get(tabId);
    if (tab && tab.url) {
      console.log('New tab URL:', tab.url);
      debug(`New tab URL: ${tab.url}`);
      // Reload chat history for the new page
      await loadChatHistory();
      // Update visibility list for the new page
      await loadAvatars();
    } else {
      console.log('No tab or URL found for tab:', tabId);
      debug(`No tab or URL found for tab: ${tabId}`);
    }
  } catch (error) {
    console.error('Error handling tab change:', error);
    debug(`Error handling tab change: ${error.message}`);
  }
}

// Handle tab updates (URL changes)
async function handleTabUpdate(tabId, url) {
  console.log('Handling tab update for tab:', tabId, 'URL:', url);
  debug(`Handling tab update for tab: ${tabId}, URL: ${url}`);
  try {
    // Reload chat history for the new URL
    await loadChatHistory();
    // Update visibility list for the new URL
    await loadAvatars();
  } catch (error) {
    console.error('Error handling tab update:', error);
    debug(`Error handling tab update: ${error.message}`);
  }
}

// Toggle thread replies visibility
async function toggleThreadReplies(threadId, messageElement) {
  const toggleBtn = messageElement.querySelector('.thread-toggle-btn');
  if (!toggleBtn) return;
  
  const isExpanded = toggleBtn.dataset.expanded === 'true';
  const chatMessages = document.querySelector('.chat-messages');
  
  // Find all reply messages for this thread
  const replyMessages = chatMessages.querySelectorAll(`.message-reply[data-conversation-id="${threadId}"]`);
  
  if (isExpanded) {
    // Collapse - hide reply messages
    replyMessages.forEach(reply => {
      reply.classList.remove('visible');
    });
    // Update icon but preserve count
    const countSpan = toggleBtn.querySelector('.icon-count');
    const count = countSpan ? countSpan.outerHTML : '';
    toggleBtn.innerHTML = `📂${count}`;
    toggleBtn.dataset.expanded = 'false';
    toggleBtn.title = 'Show thread replies';
  } else {
    // Expand - show reply messages
    replyMessages.forEach(reply => {
      reply.classList.add('visible');
    });
    // Update icon but preserve count
    const countSpan = toggleBtn.querySelector('.icon-count');
    const count = countSpan ? countSpan.outerHTML : '';
    toggleBtn.innerHTML = `📁${count}`;
    toggleBtn.dataset.expanded = 'true';
    toggleBtn.title = 'Hide thread replies';
  }
  
  // Update visual hierarchy after toggling thread
  setTimeout(() => {
    updateMessageVisualHierarchy();
  }, 10);
}
