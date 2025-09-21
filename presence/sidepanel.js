// Meta-Layer Initiative API Configuration
const METALAYER_API_URL = 'http://216.238.91.120:3002';
const AGENT_API_URL = 'http://localhost:3001/api/agent';

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
    if (userInfoDiv) userInfoDiv.style.display = 'flex';
    if (userAvatar) {
      userAvatar.src = user.avatar_url || user.picture || '/images/avatar-placeholder.png';
      userAvatar.alt = user.name || 'User Avatar';
    }
    if (userName) userName.textContent = user.name || user.email || 'User';
  } else {
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
let currentUser = null;
let currentCommunity = null;
let pageContentCache = '';
let currentReply = null;

// WebSocket for real-time chat
let canopiWebSocket = null;
let isConnected = false;

// --- Agent Functions ---
async function testAgent(message) {
  console.log('testAgent called with:', message);
  if (!message.trim()) return;
  
  // Add user message to output
  addMessageToAgentOutput('You', message, true);
  
  // Show loading
  const loadingId = addMessageToAgentOutput('Agent', 'Thinking...', false, true);
  
  try {
    const response = await callDeepSeekAPI(message);
    removeLoadingMessage(loadingId);
    addMessageToAgentOutput('Agent', response, false);
  } catch (error) {
    removeLoadingMessage(loadingId);
    addMessageToAgentOutput('Agent', `Error: ${error.message}`, false);
  }
}

async function callDeepSeekAPI(userMessage) {
  const response = await fetch(AGENT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: userMessage
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.response;
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
    console.log('Loading page content...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      chrome.tabs.sendMessage(tab.id, { action: 'extractPageContent' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Error getting page content:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.content) {
          console.log('Page content loaded:', response.content.length, 'characters');
        } else if (response && response.error) {
          console.log('Error extracting content:', response.error);
        }
      });
    } else {
      console.log('Cannot extract content from this page type');
    }
  } catch (error) {
    console.log('Error loading page content:', error);
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

// --- Canopi Chat Functions ---
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
  
  // Initialize user
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
    const wsUrls = [
      'ws://localhost:3001/ws',
      'ws://216.238.91.120:3001/ws',
      'wss://echo.websocket.org'
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
        sendSystemMessage(`${currentUser.name} joined the chat`);
      };
      
      canopiWebSocket.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (e) {
          if (event.data && event.data !== '') {
            handleEchoMessage(event.data);
          }
        }
      };
      
      canopiWebSocket.onclose = function(event) {
        console.log(`WebSocket disconnected from: ${wsUrl}`);
        isConnected = false;
        updateConnectionStatus(false, 'Disconnected');
        
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

function updateConnectionStatus(connected, mode) {
  const chatMessages = document.getElementById('canopi-chat-messages');
  if (!chatMessages) return;
  
  // Remove existing status
  const existingStatus = chatMessages.querySelector('.connection-status');
  if (existingStatus) {
    existingStatus.remove();
  }
  
  const statusDiv = document.createElement('div');
  statusDiv.className = `connection-status ${connected ? (mode === 'Local Mode' ? 'local-mode' : 'connected') : 'disconnected'}`;
  statusDiv.textContent = connected ? `🟢 ${mode}` : '🔴 Disconnected - trying to reconnect...';
  
  chatMessages.appendChild(statusDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleIncomingMessage(data) {
  if (data.type === 'message' && data.sender !== currentUser.id) {
    addChatMessage(
      data.senderName || 'Unknown User',
      (data.senderAvatar || 'U').charAt(0).toUpperCase(),
      data.message,
      new Date(data.timestamp),
      false,
      data.replyTo
    );
  }
}

function handleEchoMessage(message) {
  if (message && message !== '') {
    addChatMessage(
      'Echo Server',
      'E',
      `Echo: ${message}`,
      new Date(),
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
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSampleMessages() {
  const chatMessages = document.getElementById('canopi-chat-messages');
  if (!chatMessages) return;
  
  // Add date separator
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const dateSeparator = document.createElement('div');
  dateSeparator.className = 'date-separator';
  dateSeparator.innerHTML = `<span>${dateStr}</span>`;
  chatMessages.appendChild(dateSeparator);
  
  // Add sample messages
  const sampleMessages = [
    { sender: 'Alice', avatar: 'A', message: 'Hey everyone! How\'s the project going?', time: new Date(Date.now() - 3600000) },
    { sender: 'Bob', avatar: 'B', message: 'Great! Just finished the new feature. What do you think?', time: new Date(Date.now() - 3000000) },
    { sender: 'You', avatar: 'Y', message: 'Looks amazing! The UI is really clean.', time: new Date(Date.now() - 2400000), isOwn: true },
    { sender: 'Alice', avatar: 'A', message: 'Thanks! I spent a lot of time on the design.', time: new Date(Date.now() - 1800000) },
    { sender: 'Bob', avatar: 'B', message: 'Should we add more animations?', time: new Date(Date.now() - 1200000) },
    { sender: 'You', avatar: 'Y', message: 'That would be nice! Subtle ones though.', time: new Date(Date.now() - 600000), isOwn: true }
  ];
  
  sampleMessages.forEach(msg => {
    addChatMessage(msg.sender, msg.avatar, msg.message, msg.time, msg.isOwn);
  });
}

function addChatMessage(sender, avatarText, message, time, isOwnMessage = false, replyTo = null) {
  const chatMessages = document.getElementById('canopi-chat-messages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${isOwnMessage ? 'own-message' : ''}`;
  messageDiv.setAttribute('data-message-id', Date.now() + Math.random());
  
  const timeStr = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  let replyHtml = '';
  if (replyTo) {
    replyHtml = `
      <div class="message-reply">
        <div class="message-reply-sender">${replyTo.sender}</div>
        <div class="message-reply-text">${replyTo.message}</div>
              </div>
    `;
  }
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatarText}</div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">${sender}</span>
        <span class="message-time">${timeStr}</span>
            </div>
      ${replyHtml}
      <div class="message-text">${message}</div>
    </div>
  `;
  
  // Add click handler for replies
  const content = messageDiv.querySelector('.message-content');
  if (content && !isOwnMessage) {
    content.addEventListener('click', () => {
      startReply(sender, message, messageDiv.getAttribute('data-message-id'));
    });
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
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
  
  // Add message to chat
  addChatMessage(
    currentUser.name,
    currentUser.avatar,
    message,
    new Date(),
    true,
    currentReply
  );
  
  // Send via WebSocket if connected
  if (isConnected && canopiWebSocket && canopiWebSocket.readyState === WebSocket.OPEN) {
    const messageData = {
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
  
  // Clear input and reset reply
  messageInput.value = '';
  cancelReply();
  
  // Re-enable input
  messageInput.disabled = false;
  sendButton.disabled = false;
  messageInput.focus();
  
  console.log('Canopi message sent:', message, currentReply ? 'as reply' : '');
}

function startReply(sender, message, messageId) {
  currentReply = {
    sender: sender,
    message: message,
    messageId: messageId
  };
  
  const replyIndicator = document.getElementById('reply-indicator');
  const replySender = document.getElementById('reply-sender');
  const replyPreview = document.getElementById('reply-preview');
  const messageInput = document.getElementById('canopi-message-input');
  
  if (replyIndicator && replySender && replyPreview && messageInput) {
    replySender.textContent = `Replying to ${sender}`;
    replyPreview.textContent = message.length > 50 ? message.substring(0, 50) + '...' : message;
    replyIndicator.style.display = 'flex';
    messageInput.placeholder = `Reply to ${sender}...`;
    messageInput.focus();
  }
}

function cancelReply() {
  currentReply = null;
  
  const replyIndicator = document.getElementById('reply-indicator');
  const messageInput = document.getElementById('canopi-message-input');
  
  if (replyIndicator && messageInput) {
    replyIndicator.style.display = 'none';
    messageInput.placeholder = 'Send message in Overweb';
  }
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

// --- Initialize Sidebar ---
function initializeSidebar() {
  console.log('Found main tab: Canopi');
  console.log('Found main tab: Rooms');
  console.log('Found main tab: People');
  console.log('Found main tab: Agent');
  console.log('Found sub tab: Live Chat');
  console.log('Found sub tab: Visible');
  
  // Initialize main tabs
  const mainTabs = document.querySelectorAll('.main-nav-tab');
  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      console.log('Main tab clicked:', tabId);
      switchToMainTab(tabId);
    });
  });
  
  // Initialize sub tabs
  const subTabs = document.querySelectorAll('.sub-nav-tab');
  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const subTabId = tab.getAttribute('data-subtab');
      console.log('Sub tab clicked:', subTabId);
      switchToSubTab(subTabId);
    });
  });
  
  // Initialize Canopi chat
  initializeCanopiChat();
  
  console.log('Sidebar setup complete');
}

// --- Main Initialization ---
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
      console.log('Auth system failed to initialize, continuing in local mode');
      updateUI(null);
    }
  } catch (error) {
    console.log('Auth initialization failed, continuing in local mode:', error.message);
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
  
  // Initialize sidebar functionality
  initializeSidebar();

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
  const subTabs = document.querySelectorAll('.sub-nav-tab');
  const chatInput = document.getElementById('chat-textarea');
  const chatSendButton = document.querySelector('.chat-input-area button');
  
  // --- Main Tab Event Listeners ---
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
  
  // --- Chat Input Event Listeners ---
  if (chatInput) {
    chatInput.addEventListener('input', () => autoResize(chatInput));
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (chatSendButton) {
          chatSendButton.click();
        }
      }
    });
  }
  
  if (chatSendButton) {
    chatSendButton.addEventListener('click', () => {
      if (chatInput && chatInput.value.trim()) {
        debug(`Sending message: ${chatInput.value}`);
        // TODO: Implement actual message sending
        chatInput.value = '';
        autoResize(chatInput);
      }
    });
  }
  
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
  
  // --- Agent initialization is handled by initializeAgentTab() function ---
  
  // --- Page content loading is handled by initializeAgentTab() function ---
  
  // --- Initialize Canopi Chat ---
  initializeCanopiChat();
  
  // --- Final Setup ---
  debug('Sidebar setup complete');
  console.log('Sidebar setup complete');
});
