const METALAYER_API_URL = 'http://216.238.91.120:3002';
const AGENT_API_URL = 'http://localhost:3001/api/agent';
const PEOPLE_API_URL = 'http://localhost:3001/people';
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

// People Management API
class PeopleAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUserId || '1', // Add authentication header
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
      console.error('People API request failed:', error);
      throw error;
    }
  }

  async getUsers(search = '', status = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return this.request(`/users?${params.toString()}`);
  }

  async getFriends() {
    return this.request('/friends');
  }

  async getFriendRequests(type = 'all') {
    return this.request(`/friend-requests?type=${type}`);
  }

  async sendFriendRequest(toUserId) {
    return this.request('/friend-request', {
      method: 'POST',
      body: JSON.stringify({ toUserId })
    });
  }

  async acceptFriendRequest(requestId) {
    return this.request('/friend-request/accept', {
      method: 'POST',
      body: JSON.stringify({ requestId })
    });
  }

  async declineFriendRequest(requestId) {
    return this.request('/friend-request/decline', {
      method: 'POST',
      body: JSON.stringify({ requestId })
    });
  }

  async removeFriend(friendId) {
    return this.request(`/friends/${friendId}`, {
      method: 'DELETE'
    });
  }

  async blockUser(blockedUserId) {
    return this.request('/block', {
      method: 'POST',
      body: JSON.stringify({ blockedUserId })
    });
  }

  async unblockUser(blockedUserId) {
    return this.request(`/block/${blockedUserId}`, {
      method: 'DELETE'
    });
  }

  async getBlockedUsers() {
    return this.request('/blocked');
  }

  async getUserProfile(userId, currentUserId = null) {
    const params = currentUserId ? `?currentUserId=${currentUserId}` : '';
    return this.request(`/profile/${userId}${params}`);
  }
}

// Initialize People API
const peopleAPI = new PeopleAPI(PEOPLE_API_URL);

// Authentication Functions
async function getCurrentUser() {
  try {
    const response = await peopleAPI.request('/me', {
      headers: {
        'x-user-id': '1' // For demo purposes - in production this would come from auth token
      }
    });
    if (response.success) {
      currentUser = response.user;
      currentUserId = response.user.id;
      return response.user;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    // Fallback to demo user for development
    currentUserId = '1';
    currentUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: '/images/avatar-j.png',
      status: 'online'
    };
    return currentUser;
  }
}

// People Management Variables
let currentUserId = null; // Will be set from authentication
let currentUser = null;
let currentPeopleTab = 'friends';
let friendsList = [];
let friendRequests = [];
let blockedUsers = [];

// People Management Functions
async function loadFriends() {
  try {
    const response = await peopleAPI.getFriends();
    if (response.success) {
      friendsList = response.friends;
      renderFriendsList();
    }
  } catch (error) {
    console.error('Error loading friends:', error);
    showPeopleError('Failed to load friends');
  }
}

async function loadFriendRequests() {
  try {
    const response = await peopleAPI.getFriendRequests();
    if (response.success) {
      friendRequests = response.requests;
      renderFriendRequests();
    }
  } catch (error) {
    console.error('Error loading friend requests:', error);
    showPeopleError('Failed to load friend requests');
  }
}

async function loadBlockedUsers() {
  try {
    const response = await peopleAPI.getBlockedUsers();
    if (response.success) {
      blockedUsers = response.blockedUsers;
      renderBlockedUsers();
    }
  } catch (error) {
    console.error('Error loading blocked users:', error);
    showPeopleError('Failed to load blocked users');
  }
}

function renderFriendsList() {
  const container = document.getElementById('friends-list');
  if (!container) return;

  if (friendsList.length === 0) {
    container.innerHTML = `
      <div class="people-empty-state">
        <div class="empty-illustration">👥</div>
        <h3>No friends yet</h3>
        <p>Start building your network by sending friend requests to people you know!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = friendsList.map(friend => `
    <div class="people-item" data-user-id="${friend.id}">
      <div class="people-avatar">
        ${friend.avatar ? `<img src="${friend.avatar}" alt="${friend.name}">` : friend.name.charAt(0)}
      </div>
      <div class="people-info">
        <div class="people-name">${friend.name}</div>
        <div class="people-status">
          <span class="status-indicator ${friend.status}"></span>
          ${friend.status.charAt(0).toUpperCase() + friend.status.slice(1)}
        </div>
      </div>
      <div class="people-actions">
        <button class="people-action-btn secondary" onclick="messageFriend('${friend.id}')">Message</button>
        <button class="people-action-btn danger" onclick="removeFriend('${friend.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

function renderFriendRequests() {
  const container = document.getElementById('requests-list');
  if (!container) return;

  if (friendRequests.length === 0) {
    container.innerHTML = `
      <div class="people-empty-state">
        <div class="empty-illustration">📨</div>
        <h3>No friend requests</h3>
        <p>You don't have any pending friend requests at the moment.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = friendRequests.map(request => `
    <div class="people-item friend-request-item" data-request-id="${request.id}">
      <div class="people-avatar">
        ${request.fromUser.avatar ? `<img src="${request.fromUser.avatar}" alt="${request.fromUser.name}">` : request.fromUser.name.charAt(0)}
      </div>
      <div class="people-info">
        <div class="people-name">${request.fromUser.name}</div>
        <div class="people-status">Sent you a friend request</div>
      </div>
      <div class="people-actions">
        <button class="people-action-btn success" onclick="acceptFriendRequest('${request.id}')">Accept</button>
        <button class="people-action-btn secondary" onclick="declineFriendRequest('${request.id}')">Decline</button>
      </div>
    </div>
  `).join('');
}

function renderBlockedUsers() {
  const container = document.getElementById('blocked-list');
  if (!container) return;

  if (blockedUsers.length === 0) {
    container.innerHTML = `
      <div class="people-empty-state">
        <div class="empty-illustration">🚫</div>
        <h3>No blocked users</h3>
        <p>You haven't blocked anyone yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = blockedUsers.map(user => `
    <div class="people-item blocked-user-item" data-user-id="${user.id}">
      <div class="people-avatar">
        ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0)}
      </div>
      <div class="people-info">
        <div class="people-name">${user.name}</div>
        <div class="people-status">Blocked</div>
      </div>
      <div class="people-actions">
        <button class="people-action-btn secondary" onclick="unblockUser('${user.id}')">Unblock</button>
      </div>
    </div>
  `).join('');
}

// People Action Functions
async function sendFriendRequest(userId) {
  try {
    const response = await peopleAPI.sendFriendRequest(userId);
    if (response.success) {
      showPeopleSuccess('Friend request sent!');
      loadFriendRequests(); // Refresh requests
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    showPeopleError('Failed to send friend request');
  }
}

async function acceptFriendRequest(requestId) {
  try {
    const response = await peopleAPI.acceptFriendRequest(requestId);
    if (response.success) {
      showPeopleSuccess('Friend request accepted!');
      loadFriends(); // Refresh friends list
      loadFriendRequests(); // Refresh requests
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
    showPeopleError('Failed to accept friend request');
  }
}

async function declineFriendRequest(requestId) {
  try {
    const response = await peopleAPI.declineFriendRequest(requestId);
    if (response.success) {
      showPeopleSuccess('Friend request declined');
      loadFriendRequests(); // Refresh requests
    }
  } catch (error) {
    console.error('Error declining friend request:', error);
    showPeopleError('Failed to decline friend request');
  }
}

async function removeFriend(friendId) {
  if (confirm('Are you sure you want to remove this friend?')) {
    try {
      const response = await peopleAPI.removeFriend(friendId);
      if (response.success) {
        showPeopleSuccess('Friend removed');
        loadFriends(); // Refresh friends list
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      showPeopleError('Failed to remove friend');
    }
  }
}

async function blockUser(userId) {
  if (confirm('Are you sure you want to block this user?')) {
    try {
      const response = await peopleAPI.blockUser(userId);
      if (response.success) {
        showPeopleSuccess('User blocked');
        loadBlockedUsers(); // Refresh blocked users
        loadFriends(); // Refresh friends list
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      showPeopleError('Failed to block user');
    }
  }
}

async function unblockUser(userId) {
  try {
    const response = await peopleAPI.unblockUser(userId);
    if (response.success) {
      showPeopleSuccess('User unblocked');
      loadBlockedUsers(); // Refresh blocked users
    }
  } catch (error) {
    console.error('Error unblocking user:', error);
    showPeopleError('Failed to unblock user');
  }
}

function messageFriend(friendId) {
  // Placeholder for messaging functionality
  showPeopleSuccess('Messaging feature coming soon!');
}

// People Tab Navigation
function switchPeopleTab(tabName) {
  // Update navigation buttons
  document.querySelectorAll('.people-nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-people-tab="${tabName}"]`).classList.add('active');

  // Update content
  document.querySelectorAll('.people-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`people-${tabName}`).classList.add('active');

  currentPeopleTab = tabName;

  // Load appropriate data
  switch (tabName) {
    case 'friends':
      loadFriends();
      break;
    case 'requests':
      loadFriendRequests();
      break;
    case 'blocked':
      loadBlockedUsers();
      break;
  }
}

// People Search
function setupPeopleSearch() {
  const searchInput = document.getElementById('people-search');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value;
        if (currentPeopleTab === 'friends') {
          // Filter friends locally for now
          const filteredFriends = friendsList.filter(friend => 
            friend.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          renderFilteredFriends(filteredFriends);
        }
      }, 300);
    });
  }
}

function renderFilteredFriends(filteredFriends) {
  const container = document.getElementById('friends-list');
  if (!container) return;

  if (filteredFriends.length === 0) {
    container.innerHTML = `
      <div class="people-empty-state">
        <div class="empty-illustration">🔍</div>
        <h3>No friends found</h3>
        <p>Try adjusting your search terms.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredFriends.map(friend => `
    <div class="people-item" data-user-id="${friend.id}">
      <div class="people-avatar">
        ${friend.avatar ? `<img src="${friend.avatar}" alt="${friend.name}">` : friend.name.charAt(0)}
      </div>
      <div class="people-info">
        <div class="people-name">${friend.name}</div>
        <div class="people-status">
          <span class="status-indicator ${friend.status}"></span>
          ${friend.status.charAt(0).toUpperCase() + friend.status.slice(1)}
        </div>
      </div>
      <div class="people-actions">
        <button class="people-action-btn secondary" onclick="messageFriend('${friend.id}')">Message</button>
        <button class="people-action-btn danger" onclick="removeFriend('${friend.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

// Notification Functions
function showPeopleSuccess(message) {
  // Simple success notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 1000;
    font-size: 0.9em;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showPeopleError(message) {
  // Simple error notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 1000;
    font-size: 0.9em;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize Loosely Coupled Auth Manager
const authManager = new AuthManager();

// Authentication Flow Setup
function setupAuthenticationFlow() {
  console.log('🔧 Setting up authentication flow...');
  
  // Listen for authentication state changes
  if (authManager && authManager.onAuthStateChange) {
    authManager.onAuthStateChange((event, data) => {
      console.log('🔄 Auth state changed:', event, data);
      handleAuthStateChange(event, data);
    });
  }
  
  // Check for authentication callback in URL parameters
  checkAuthCallback();
  
  // Set up periodic session check
  setInterval(checkSessionStatus, 30000); // Check every 30 seconds
  
  console.log('✅ Authentication flow setup complete');
}

// Handle authentication state changes
function handleAuthStateChange(event, data) {
  console.log('🔄 Handling auth state change:', event, data);
  
  switch (event) {
    case 'signin':
      console.log('✅ User signed in:', data.user);
      updateUI(data.user);
      break;
    case 'signout':
      console.log('❌ User signed out');
      updateUI(null);
      break;
    case 'error':
      console.error('❌ Auth error:', data.error);
      updateUI(null);
      break;
    default:
      console.log('🔄 Unknown auth event:', event);
  }
}

// Check for authentication callback
function checkAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('auth_token');
  const authError = urlParams.get('auth_error');
  
  if (authToken) {
    console.log('🔑 Auth token found, processing...');
    processAuthToken(authToken);
  } else if (authError) {
    console.error('❌ Auth error in callback:', authError);
    showAuthError(authError);
  }
}

// Process authentication token
async function processAuthToken(token) {
  try {
    console.log('🔑 Processing auth token...');
    
    // Store the token
    await chrome.storage.local.set({ authToken: token });
    
    // Try to get user info with the token
    const user = await authManager.getCurrentUser();
    if (user) {
      console.log('✅ User authenticated successfully:', user);
      updateUI(user);
    } else {
      console.log('⚠️ Token received but user not found');
      updateUI(null);
    }
  } catch (error) {
    console.error('❌ Error processing auth token:', error);
    updateUI(null);
  }
}

// Check session status periodically
async function checkSessionStatus() {
  try {
    const user = await authManager.getCurrentUser();
    if (user) {
      console.log('✅ Session valid, user authenticated');
      updateUI(user);
    } else {
      console.log('❌ No valid session');
      updateUI(null);
    }
  } catch (error) {
    console.error('❌ Session check failed:', error);
    updateUI(null);
  }
}


// Show authentication error
function showAuthError(error) {
  console.error('❌ Authentication error:', error);
  // You could show a toast notification or error message here
  alert(`Authentication failed: ${error}`);
}

// Discord feature commented out - not needed for now
// setupDiscordButton();

// Setup Authentication Flow
setupAuthenticationFlow(); 

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
    
    if (currentUser) {
    console.log('User found, executing callback');
      debug('User found, executing callback');
      callback();
    return true;
    } else {
      console.log('User not authenticated, showing auth modal');
      debug('User not authenticated, showing auth modal');
      // Show auth modal or redirect to login
      return false;
    }
  } catch (error) {
    console.error('Error in requireAuth:', error);
    debug(`Error in requireAuth: ${error.message}`);
    return false;
  }
}

// --- UI Update Functions ---
function updateUI(user = null) {
  console.log('UI updated:', user ? 'User authenticated, showing user info' : 'User not authenticated, hiding user info');
  debug(`UI updated: ${user ? 'User authenticated, showing user info' : 'User not authenticated, hiding user info'}`);
  
  const userInfoDiv = document.getElementById('user-info');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-menu-name');
  
  if (user) {
    // User is authenticated - show normal interface
    if (userInfoDiv) userInfoDiv.style.display = 'flex';
    if (userAvatar) {
      userAvatar.src = user.avatar_url || user.picture || '/images/avatar-placeholder.png';
      userAvatar.alt = user.name || 'User Avatar';
    }
    if (userName) userName.textContent = user.name || user.email || 'User';
  } else {
    // User is not authenticated - hide user info
    if (userInfoDiv) userInfoDiv.style.display = 'none';
  }
}

// --- Community Functions ---
async function loadCommunities() {
  try {
    console.log('Loading communities...');
    debug('Loading communities...');
    const communities = await api.getCommunities();
    console.log('Communities loaded successfully');
    debug('Communities loaded successfully');
    updateUI();
  } catch (error) {
    console.log('Remote server unavailable, using local mode');
    debug('Remote server unavailable, using local mode');
    // Don't show error to user, just continue with local functionality
    updateUI();
  }
}

// --- Global Variables ---
let currentCommunity = null;

// Content caching and RAG system
let pageContentCache = null;
let contentHash = null;
let cachedChunks = [];

// --- Agent Functions ---
async function testAgent(message) {
  if (!message.trim()) return;
  
  // Add user message to output
  addMessageToAgentOutput('You', message, true);
  
  // Show loading
  const loadingId = addMessageToAgentOutput('Agent', 'Thinking...', false, true);
  
  try {
    // Check if we have page content, if not try to load it
    if (!pageContentCache) {
      await loadPageContent();
      
      // Wait a bit for content to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const response = await callDeepSeekAPI(message);
    removeLoadingMessage(loadingId);
    addMessageToAgentOutput('Agent', response, false);
  } catch (error) {
    removeLoadingMessage(loadingId);
    addMessageToAgentOutput('Agent', `Error: ${error.message}`, false);
  }
}

async function callDeepSeekAPI(userMessage) {
  // Find relevant content chunks using RAG
  const relevantChunks = findRelevantChunks(userMessage);
  
  // Prepare context for the AI
  const context = {
    pageTitle: pageContentCache?.title || 'Current Page',
    pageUrl: pageContentCache?.url || '',
    relevantContent: relevantChunks,
    userQuestion: userMessage,
    timestamp: new Date().toISOString()
  };
  
  // If no page content is available, provide a helpful message
  if (!pageContentCache) {
    return `I'm unable to access the current page content to determine what it's about. The system indicates that no page content is available for me to analyze.

You might want to:
- Refresh the page to see if content loads
- Check if there are any loading errors
- Navigate to a different page
- Or you could tell me what page you're viewing and I can try to help based on that information

Is there a specific topic or question I can assist you with directly?`;
  }
  
  // Create a limited version of page content to avoid payload size issues
  const limitedPageContent = {
    title: pageContentCache.title,
    url: pageContentCache.url,
    content: {
      full: limitContentSize(pageContentCache.content.full, 2000),
      chunks: pageContentCache.content.chunks.slice(0, 3) // Only send top 3 chunks
    },
    metadata: pageContentCache.metadata
  };

  const response = await fetch(AGENT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: userMessage,
      context: context,
      pageContent: limitedPageContent
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.response;
}

function findRelevantChunks(userMessage) {
  if (!cachedChunks || cachedChunks.length === 0) {
    return [];
  }
  
  // Simple keyword-based relevance scoring
  const messageWords = userMessage.toLowerCase().split(/\s+/);
  const relevantChunks = [];
  
  cachedChunks.forEach((chunk, index) => {
    const chunkText = chunk.toLowerCase();
    let relevanceScore = 0;
    
    // Count keyword matches
    messageWords.forEach(word => {
      if (word.length > 2) { // Ignore short words
        const matches = (chunkText.match(new RegExp(word, 'g')) || []).length;
        relevanceScore += matches;
      }
    });
    
    // Boost score for chunks with question words
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
    questionWords.forEach(qWord => {
      if (chunkText.includes(qWord) && messageWords.includes(qWord)) {
        relevanceScore += 2;
      }
    });
    
    if (relevanceScore > 0) {
      relevantChunks.push({
        chunk: chunk,
        score: relevanceScore,
        index: index
      });
    }
  });
  
  // Sort by relevance score and return top 3-5 chunks
  return relevantChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.chunk);
}

// Helper function to limit content size for API calls
function limitContentSize(content, maxLength = 2000) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

function addMessageToAgentOutput(sender, message, isUser = false, isLoading = false) {
  const agentOutput = document.getElementById('agent-output');
  if (!agentOutput) return null;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `agent-message ${isUser ? 'user-message' : ''}`;
  
  if (isLoading) {
    messageDiv.className += ' agent-loading';
    messageDiv.id = 'loading-' + Date.now();
  }
  
  const timestamp = new Date().toLocaleTimeString();
  
  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="sender">${sender}</span>
      <span class="timestamp">${timestamp}</span>
      </div>
    <div class="message-content">${formatMarkdown(message)}</div>
  `;
  
  agentOutput.appendChild(messageDiv);
  agentOutput.scrollTop = agentOutput.scrollHeight;
  
  return messageDiv.id;
}

function removeLoadingMessage(loadingId) {
  if (loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
      loadingElement.remove();
    }
  }
}

function formatMarkdown(text) {
  return text
    .replace(/### (.*$)/gim, '<h3>$1</h3>')
    .replace(/## (.*$)/gim, '<h2>$1</h2>')
    .replace(/# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
}

async function loadPageContent() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Loading page content for tab:', tab?.url);
    
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      // Try to inject content script if it's not already loaded
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('Content script injected successfully');
      } catch (injectError) {
        console.log('Content script injection failed (may already be loaded):', injectError.message);
      }
      
      // Wait a bit for content script to load
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: 'extractPageContent' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error getting page content:', chrome.runtime.lastError);
            // Set a fallback page content for pages where content script can't run
            setFallbackPageContent(tab);
            return;
          }
          
          if (response && response.content) {
            console.log('Page content loaded successfully:', response.content.title);
            // Check if content has changed (different hash)
            const newHash = response.content.contentHash;
            if (contentHash !== newHash) {
              contentHash = newHash;
              pageContentCache = response.content;
              cachedChunks = response.content.content.chunks || [];
              
              // Update agent welcome message with page info
              updateAgentWelcomeWithPageInfo(response.content);
            }
          } else {
            console.log('No content received, using fallback');
            setFallbackPageContent(tab);
          }
        });
      }, 500);
    } else {
      // For chrome:// pages or extension pages, set fallback content
      console.log('Using fallback content for:', tab?.url);
      setFallbackPageContent(tab);
    }
  } catch (error) {
    console.log('Error loading page content:', error);
    setFallbackPageContent(null);
  }
}

function setFallbackPageContent(tab) {
  const fallbackContent = {
    title: tab ? tab.title : 'Current Page',
    url: tab ? tab.url : 'unknown',
    content: {
      full: tab ? `This page is titled "${tab.title}" and is located at ${tab.url}. The page content is not available for detailed analysis, but I can still help you with general questions about the page or assist with other topics.` : 'Page content is not available for analysis.',
      chunks: tab ? [`Page title: ${tab.title}`, `Page URL: ${tab.url}`, 'Content analysis limited'] : ['Page content not available']
    },
    metadata: {
      description: 'Page content analysis is limited'
    },
    contentHash: 'fallback-' + Date.now()
  };
  
  pageContentCache = fallbackContent;
  cachedChunks = fallbackContent.content.chunks;
  
  // Update agent welcome message
  updateAgentWelcomeWithPageInfo(fallbackContent);
}

function updateAgentWelcomeWithPageInfo(pageData) {
  const agentOutput = document.getElementById('agent-output');
  if (!agentOutput) return;
  
  // Update welcome message with page-specific info
  const welcomeElement = agentOutput.querySelector('.agent-welcome');
  if (welcomeElement) {
    const isFallback = pageData.contentHash && pageData.contentHash.startsWith('fallback-');
    
    welcomeElement.innerHTML = `
      <h4>🤖 AI Agent Ready</h4>
      <p>I can help you understand and discuss the content on this page. Ask me anything!</p>
      <div class="page-info">
        <strong>📄 ${pageData.title}</strong>
        <p>${pageData.content.full.substring(0, 200)}...</p>
        ${isFallback ? '<p style="color: #ffc107; font-size: 0.9em;">⚠️ Page content analysis is limited on this page.</p>' : ''}
      </div>
      <div class="agent-suggestions">
        <button class="suggestion-btn" data-question="What is this page about?">What is this page about?</button>
        <button class="suggestion-btn" data-question="Summarize the main points">Summarize the main points</button>
        <button class="suggestion-btn" data-question="What are the key takeaways?">What are the key takeaways?</button>
        <button class="suggestion-btn" data-question="Explain this in simple terms">Explain this in simple terms</button>
        <button class="suggestion-btn" data-question="What questions should I ask about this?">What questions should I ask?</button>
      </div>
    `;
    
    // Re-add event listeners to suggestion buttons
    const suggestionButtons = agentOutput.querySelectorAll('.suggestion-btn');
    suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        console.log("Suggestion button clicked:", question);
        testAgent(question);
      });
    });
  }
}

function initializeAgentTab() {
  console.log("=== INITIALIZING AGENT TAB ===");
  
  // Load page content for the agent
  loadPageContent();
  
  // Get agent element references
  const agentInput = document.getElementById('agent-input');
  const agentSendButton = document.getElementById('agent-send-btn');
  const agentOutput = document.getElementById('agent-output');
  const agentClearButton = document.getElementById('agent-clear-btn');
  const agentRefreshButton = document.getElementById('agent-refresh-btn');
  
  console.log("Agent elements found:", {
    agentInput: !!agentInput,
    agentSendButton: !!agentSendButton,
    agentOutput: !!agentOutput
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
    agentSendButton.addEventListener('click', () => {
      console.log('Send button clicked!');
      const message = agentInput.value.trim();
      if (message) {
        console.log('Sending message:', message);
        testAgent(message);
        agentInput.value = '';
      }
    });
    agentSendButton.setAttribute('data-initialized', 'true');
  }
  
  // Set up input field if not already done
  if (agentInput && !agentInput.hasAttribute('data-initialized')) {
    agentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = agentInput.value.trim();
        if (message) {
          testAgent(message);
          agentInput.value = '';
        }
      }
    });
    agentInput.setAttribute('data-initialized', 'true');
  }
  
  // Set up Clear button
  if (agentClearButton && !agentClearButton.hasAttribute('data-initialized')) {
    agentClearButton.addEventListener('click', () => {
      console.log('Clear button clicked!');
      if (agentOutput) {
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
  
        // Re-add event listeners to suggestion buttons
        const suggestionButtons = agentOutput.querySelectorAll('.suggestion-btn');
        suggestionButtons.forEach(button => {
          button.addEventListener('click', () => {
            const question = button.getAttribute('data-question');
            testAgent(question);
    });
  });
      }
    });
    agentClearButton.setAttribute('data-initialized', 'true');
  }
  
  // Set up Refresh button
  if (agentRefreshButton && !agentRefreshButton.hasAttribute('data-initialized')) {
    agentRefreshButton.addEventListener('click', () => {
      console.log('Refresh button clicked!');
      // Reload page content
      loadPageContent();
      // Show a brief message
      if (agentOutput) {
        const refreshMessage = document.createElement('div');
        refreshMessage.className = 'agent-message';
        refreshMessage.innerHTML = `
          <div class="message-header">
            <span class="sender">Agent</span>
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="message-content">Page content refreshed! I now have the latest information from this page.</div>
        `;
        agentOutput.appendChild(refreshMessage);
        agentOutput.scrollTop = agentOutput.scrollHeight;
      }
    });
    agentRefreshButton.setAttribute('data-initialized', 'true');
  }
  
  // Load page content
  loadPageContent();
  
  console.log('=== AGENT TAB INITIALIZATION COMPLETE ===');
}




// --- Tab Switching Functions ---
function switchToMainTab(tabId) {
  console.log('Switching to main tab:', tabId);
  
  // Hide all main tab contents
  const allMainTabs = document.querySelectorAll('.main-tab-content');
  allMainTabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.classList.add('active');
    console.log('Activated content:', '#' + tabId);
    
    // Initialize specific tab functionality
    if (tabId === 'agent-tab') {
      console.log('Agent tab activated! Initializing agent...');
      initializeAgentTab();
    } else if (tabId === 'people-tab') {
      console.log('People tab activated! Loading people data...');
      initializePeopleTab();
    }
  }
  
  // Update active tab styling
  const allMainNavTabs = document.querySelectorAll('.main-nav-tab');
  allMainNavTabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  const activeMainTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeMainTab) {
    activeMainTab.classList.add('active');
  }
}

function switchToSubTab(subTabId) {
  console.log('Switching to sub tab:', subTabId);
  
  // Hide all sub tab contents
  const allSubTabs = document.querySelectorAll('.sub-tab-content');
  allSubTabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected sub tab
  const selectedSubTab = document.getElementById(subTabId);
  if (selectedSubTab) {
    selectedSubTab.classList.add('active');
  }
  
  // Update active sub tab styling
  const allSubNavTabs = document.querySelectorAll('.sub-nav-tab');
  allSubNavTabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  const activeSubTab = document.querySelector(`[data-subtab="${subTabId}"]`);
  if (activeSubTab) {
    activeSubTab.classList.add('active');
  }
}

function initializeSidebar() {
  const mainTabs = document.querySelectorAll('.main-nav-tab');
  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchToMainTab(tabId);
    });
  });
  
  const subTabs = document.querySelectorAll('.sub-nav-tab');
  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const subTabId = tab.getAttribute('data-subtab');
      switchToSubTab(subTabId);
    });
  });
  
}
document.addEventListener('DOMContentLoaded', async () => {

  authManager.registerProvider('supabase', new SupabaseAuthProvider());
  authManager.registerProvider('metalayer', new MetalayerAuthProvider());
  authManager.registerProvider('offline', new OfflineAuthProvider());
  
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
      console.log('Auth system failed to initialize, continuing in local mode');
      updateUI(null);
    }
  } catch (error) {
    console.log('Auth initialization failed, continuing in local mode:', error.message);
    updateUI(null);
  }
  
  // Load communities and initialize the interface
  try {
    loadCommunities();
  } catch (error) {
    console.error('Error loading communities:', error);
  }
  
  updateUI(null);
});
  
document.addEventListener('DOMContentLoaded', () => {

  initializeSidebar();


  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      debug(`Main tab clicked: ${tabId}`);

      // Remove active class from all main tabs
      mainTabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all main tab contents
      document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Show selected tab content
      const selectedContent = document.getElementById(tabId);
      if (selectedContent) {
        selectedContent.classList.add('active');
        debug(`Activated content: #${tabId}`);
      }
    });
  });

  // --- Sub Tab Event Listeners ---
  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const subTabId = tab.getAttribute('data-subtab');
      debug(`Sub tab clicked: ${subTabId}`);
      
      // Remove active class from all sub tabs
      subTabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all sub tab contents
      document.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Show selected sub tab content
      const selectedSubContent = document.getElementById(subTabId);
      if (selectedSubContent) {
        selectedSubContent.classList.add('active');
        debug(`Activated sub content: #${subTabId}`);
      }
    });
  });
  
  
  // --- Community Dropdown ---
  const communityOptionsBtn = document.getElementById('community-options-btn');
  const communityDropdownPanel = document.getElementById('community-dropdown-panel');
  
  if (communityOptionsBtn && communityDropdownPanel) {
    communityOptionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = communityDropdownPanel.style.display !== 'none';
      communityDropdownPanel.style.display = isVisible ? 'none' : 'block';
      communityOptionsBtn.textContent = isVisible ? '▼' : '▲';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      communityDropdownPanel.style.display = 'none';
      communityOptionsBtn.textContent = '▼';
    });
  }
  
  // --- User Menu ---
  const userAvatar = document.getElementById('user-avatar');
  const userMenu = document.getElementById('user-menu');

  if (userAvatar && userMenu) {
    userAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = userMenu.style.display !== 'none';
      userMenu.style.display = isVisible ? 'none' : 'block';
    });
  
  // Close user menu when clicking outside
    document.addEventListener('click', () => {
      userMenu.style.display = 'none';
    });
  }
  
  // --- Logout Button ---
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await authManager.signOut();
        updateUI(null);
        debug('User logged out');
      } catch (error) {
        console.error('Logout failed:', error);
        debug(`Logout failed: ${error.message}`);
      }
    });
  }
  
  // --- Close Sidebar Button ---
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
      // This would typically close the sidepanel
      debug('Close sidebar button clicked');
    });
  }
  
  // --- Mini Profile Modal ---
  const miniProfileModal = document.getElementById('mini-profile-modal');
  const closeModalBtn = miniProfileModal?.querySelector('.close-button');
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      miniProfileModal.style.display = 'none';
    });
  }
  
  // --- Debug Panel Toggle ---
  const debugHeader = document.getElementById('debug-header');
  if (debugHeader) {
    debugHeader.addEventListener('click', toggleDebugPanel);
  }
  
  // --- Agent functionality is handled by initializeAgentTab() function ---
  
  // --- People Tab Event Listeners ---
  const peopleNavBtns = document.querySelectorAll('.people-nav-btn');
  peopleNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-people-tab');
      switchPeopleTab(tabName);
      });
    });

  // Setup people search
  setupPeopleSearch();
  
  // Discord feature commented out - not needed for now
  // setupDiscordButton();
});

// Initialize People Tab
async function initializePeopleTab() {
  try {
    // Get current user first
    await getCurrentUser();
    console.log('Current user:', currentUser);
    
    // Load friends by default
    loadFriends();
  } catch (error) {
    console.error('Error initializing people tab:', error);
    showPeopleError('Failed to initialize people tab');
  }
}

// Discord Button Setup
function setupDiscordButton() {
  console.log('🔧 Setting up Discord button...');
  
  const discordBtn = document.getElementById('discord-btn');
  console.log('🔍 Discord button found:', !!discordBtn);
  
  if (discordBtn) {
    // Remove any existing event listeners
    discordBtn.onclick = null;
    
    // Add new event listener
    discordBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🎯 Discord button clicked!');
      
      const discordUrl = 'https://discord.com/invite/wb7HAhBxKq';
      console.log('🚀 Redirecting to:', discordUrl);
      
      // Method 1: Try chrome.tabs.update
      try {
        chrome.tabs.update({ url: discordUrl }, function(tab) {
          if (chrome.runtime.lastError) {
            console.log('❌ chrome.tabs.update failed:', chrome.runtime.lastError.message);
            // Method 2: Try chrome.tabs.create
            chrome.tabs.create({ url: discordUrl }, function(newTab) {
              if (chrome.runtime.lastError) {
                console.log('❌ chrome.tabs.create failed:', chrome.runtime.lastError.message);
                // Method 3: Fallback to window.open
                window.open(discordUrl, '_blank');
              } else {
                console.log('✅ Discord opened in new tab');
              }
            });
          } else {
            console.log('✅ Discord redirected in current tab');
          }
        });
      } catch (error) {
        console.log('❌ chrome.tabs not available:', error.message);
        // Method 4: Direct window redirect
        window.location.href = discordUrl;
      }
    });
    
    console.log('✅ Discord button event listener added');
  } else {
    console.error('❌ Discord button not found!');
  }
}
