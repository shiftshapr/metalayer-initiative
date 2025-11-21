/**
 * AGENT MODULE - AI Agent Functionality
 * Handles all AI agent and automation functionality
 */
class AgentModule {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
    }
    /**
     * Initialize AgentModule
     */
    async initialize() {
        if (this.isInitialized) {
            this.log('WARN', 'AgentModule already initialized');
            return;
        }
        this.log('INFO', 'Initializing AgentModule...');
        try {
            // TODO: Initialize agent and AI systems here
            this.isInitialized = true;
            this.log('INFO', 'AgentModule initialized successfully');
        }
        catch (error) {
            this.log('ERROR', 'Failed to initialize AgentModule:', error);
            throw error;
        }
    }
    /**
     * Logging utility
     */
    log(level, message, ...args) {
        if (this.logLevel === 'SILENT')
            return;
        const levels = { SILENT: -1, ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
        if (levels[level] <= levels[this.logLevel]) {
            console.log(`[AgentModule] [${level}] ${message}`, ...args);
        }
    }
}
// ===== AGENT AND AI FUNCTIONS =====
// Define AGENT_API_URL using config system or fallback
const getAgentApiUrl = () => {
    if (typeof window !== 'undefined') {
        const configManager = window.configManager;
        if (configManager && typeof configManager.get === 'function') {
            const apiUrl = configManager.get('apiUrl');
            if (apiUrl)
                return `${apiUrl}/api/agent`;
        }
    }
    if (typeof window !== 'undefined' && window.METALAYER_API_URL) {
        return `${window.METALAYER_API_URL}/api/agent`;
    }
    return 'http://216.238.91.120:3002/api/agent';
};
const AGENT_API_URL = getAgentApiUrl();
let pageContentCache = null;
let contentHash = null;
let cachedChunks = [];
// --- Agent Functions ---
async function testAgent(message) {
    console.log("🤖 testAgent called with message:", message);
    if (!message.trim())
        return;
    // Add user message to output
    addMessageToAgentOutput('You', message, true);
    // Show loading
    const loadingId = addMessageToAgentOutput('Agent', 'Thinking...', false, true);
    console.log("🤖 Loading message added with ID:", loadingId);
    try {
        // Check if we have page content, if not try to load it
        if (!pageContentCache) {
            await loadPageContent();
            // Wait a bit for content to load
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        // Debug: Log page content cache
        console.log('🔍 Page content cache:', pageContentCache);
        console.log('🔍 Is YouTube:', pageContentCache?.isYouTube);
        console.log('🔍 Video data:', pageContentCache?.videoData);
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 Page title:', document.title);
        // Check if this is a YouTube video and handle accordingly
        if (pageContentCache && pageContentCache.isYouTube && pageContentCache.videoData) {
            console.log('🎥 Processing YouTube video request...');
            const videoData = pageContentCache.videoData;
            // Ensure required fields are present
            if (videoData.videoId && videoData.title) {
                const response = await handleYouTubeVideoRequest(message, videoData);
                removeLoadingMessage(loadingId);
                addMessageToAgentOutput('Agent', response, false);
            }
            else {
                console.warn('⚠️ AgentModule: Missing required videoData fields (videoId or title)');
                removeLoadingMessage(loadingId);
                addMessageToAgentOutput('Agent', 'Error: Missing video information', false);
            }
        }
        else {
            // Fallback: Check if we're on a YouTube page even if content script didn't detect it
            const isYouTubeFallback = window.location.hostname.includes('youtube.com') && window.location.pathname.includes('/watch');
            if (isYouTubeFallback) {
                console.log('🎥 YouTube fallback detection - processing as YouTube video...');
                const videoId = new URLSearchParams(window.location.search).get('v');
                if (videoId) {
                    const fallbackVideoData = {
                        videoId: videoId,
                        title: document.title.replace(' - YouTube', ''),
                        description: 'YouTube video',
                        channel: { name: 'YouTube' },
                        duration: 'Unknown',
                        views: 'Unknown',
                        likes: 'Unknown',
                        publishedDate: 'Unknown',
                        tags: []
                    };
                    const response = await handleYouTubeVideoRequest(message, fallbackVideoData);
                    removeLoadingMessage(loadingId);
                    addMessageToAgentOutput('Agent', response, false);
                    return;
                }
            }
            console.log('📄 Processing regular page content...');
            // Regular page content processing
            const response = await callDeepSeekAPI(message);
            removeLoadingMessage(loadingId);
            addMessageToAgentOutput('Agent', response, false);
        }
    }
    catch (error) {
        removeLoadingMessage(loadingId);
        const errorMessage = error instanceof Error ? error.message : String(error);
        addMessageToAgentOutput('Agent', `Error: ${errorMessage}`, false);
    }
}
// Handle YouTube video requests
async function handleYouTubeVideoRequest(message, videoData) {
    try {
        console.log('🎥 Processing YouTube video:', videoData.title);
        // First, try to get transcript and process the video
        const youtubeService = window.youtubeService;
        const processedVideo = (youtubeService && youtubeService.processYouTubeVideo) ? await youtubeService.processYouTubeVideo(videoData) : null;
        // Create context for AI with video information
        const context = {
            videoTitle: videoData.title,
            videoDescription: videoData.description,
            channelName: videoData.channel?.name,
            duration: videoData.duration,
            views: videoData.views,
            transcript: processedVideo?.transcript,
            summary: processedVideo?.summary,
            keyPoints: processedVideo?.keyPoints,
            questions: processedVideo?.questions,
            userQuestion: message,
            timestamp: new Date().toISOString()
        };
        // Debug: Log what we're sending to the AI
        console.log('🤖 Sending to AI agent:', {
            message: message,
            context: context,
            type: 'youtube_analysis',
            hasTranscript: !!context.transcript,
            transcriptLength: context.transcript?.length || 0
        });
        // Send to AI agent with YouTube context
        const response = await fetch(AGENT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                context: context,
                type: 'youtube_analysis',
                videoData: videoData
            })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.response;
    }
    catch (error) {
        console.error('❌ Error processing YouTube video:', error);
        // Fallback response if transcription fails
        return `I detected this is a YouTube video: "${videoData.title}" by ${videoData.channel?.name || 'Unknown Channel'}.

However, I'm having trouble accessing the video transcript at the moment. This could be because:
- The video doesn't have captions available
- The transcription service is temporarily unavailable
- The video is private or restricted

You can still ask me general questions about the video based on the title and description, or try refreshing the page and asking again.`;
    }
}
async function callDeepSeekAPI(userMessage) {
    console.log("🤖 callDeepSeekAPI called with message:", userMessage);
    // Find relevant content chunks using RAG
    const relevantChunks = findRelevantChunks(userMessage);
    console.log("🤖 Found relevant chunks:", relevantChunks.length);
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
            full: limitContentSize(pageContentCache.content?.full || '', 2000),
            chunks: (pageContentCache.content?.chunks || []).slice(0, 3) // Only send top 3 chunks
        },
        metadata: pageContentCache.metadata
    };
    console.log("🤖 Making fetch request to:", AGENT_API_URL);
    console.log("🤖 Request payload:", {
        message: userMessage,
        context: context,
        pageContent: limitedPageContent
    });
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
    console.log("🤖 API response status:", response.status, response.statusText);
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
    if (!content)
        return '';
    if (content.length <= maxLength)
        return content;
    return content.substring(0, maxLength) + '...';
}
function addMessageToAgentOutput(sender, message, isUser = false, isLoading = false) {
    const agentOutput = document.getElementById('agent-output');
    if (!agentOutput)
        return null;
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
            }
            catch (injectError) {
                const error = injectError;
                console.log('Content script injection failed (may already be loaded):', error.message);
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
                            cachedChunks = response.content.content?.chunks || [];
                            // Update agent welcome message with page info
                            updateAgentWelcomeWithPageInfo(response.content);
                        }
                    }
                    else {
                        console.log('No content received, using fallback');
                        setFallbackPageContent(tab);
                    }
                });
            }, 500);
        }
        else {
            // For chrome:// pages or extension pages, set fallback content
            console.log('Using fallback content for:', tab?.url);
            setFallbackPageContent(tab);
        }
    }
    catch (error) {
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
    cachedChunks = fallbackContent.content?.chunks || [];
    // Update agent welcome message
    updateAgentWelcomeWithPageInfo(fallbackContent);
}
function updateAgentWelcomeWithPageInfo(pageData) {
    const agentOutput = document.getElementById('agent-output');
    if (!agentOutput)
        return;
    // Update welcome message with page-specific info
    const welcomeElement = agentOutput.querySelector('.agent-welcome');
    if (welcomeElement) {
        const isFallback = pageData.contentHash && pageData.contentHash.startsWith('fallback-');
        const isYouTube = pageData.isYouTube && pageData.videoData;
        if (isYouTube && pageData.videoData) {
            // YouTube-specific welcome message
            welcomeElement.innerHTML = `
        <h4>🎥 YouTube Video Detected!</h4>
        <p>I can analyze this YouTube video and provide summaries, key points, and answer questions about its content.</p>
        <div class="youtube-info">
          <strong>📺 ${pageData.videoData.title}</strong>
          <p><strong>Channel:</strong> ${pageData.videoData.channel?.name || 'Unknown'}</p>
          <p><strong>Duration:</strong> ${pageData.videoData.duration || 'Unknown'}</p>
          <p><strong>Views:</strong> ${pageData.videoData.views || 'Unknown'}</p>
        </div>
        <div class="agent-suggestions">
          <button class="suggestion-btn youtube-btn" data-question="Summarize this video">📝 Summarize this video</button>
          <button class="suggestion-btn youtube-btn" data-question="What are the key points in this video?">🔑 Key points</button>
          <button class="suggestion-btn youtube-btn" data-question="What questions should I ask about this video?">❓ Generate questions</button>
          <button class="suggestion-btn youtube-btn" data-question="Explain the main concepts in this video">💡 Main concepts</button>
          <button class="suggestion-btn youtube-btn" data-question="What is this video about?">🎯 What's this about?</button>
        </div>
      `;
        }
        else {
            // Regular page welcome message
            welcomeElement.innerHTML = `
        <h4>🤖 AI Agent Ready</h4>
        <p>I can help you understand and discuss the content on this page. Ask me anything!</p>
        <div class="page-info">
          <strong>📄 ${pageData.title}</strong>
          <p>${(pageData.content?.full || '').substring(0, 200)}...</p>
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
        }
        // Re-add event listeners to suggestion buttons
        const suggestionButtons = agentOutput.querySelectorAll('.suggestion-btn');
        suggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.getAttribute('data-question');
                console.log("Suggestion button clicked:", question);
                if (question) {
                    testAgent(question);
                }
            });
        });
    }
}
function initializeAgentTab() {
    console.log("=== INITIALIZING AGENT TAB ===");
    console.log("Current URL:", window.location.href);
    console.log("Document ready state:", document.readyState);
    // Load page content for the agent
    console.log("📄 Loading page content...");
    loadPageContent();
    // Get agent element references
    console.log("Getting agent element references...");
    const agentInput = document.getElementById('agent-input');
    const agentSendButton = document.getElementById('agent-send-btn');
    const agentOutput = document.getElementById('agent-output');
    const agentClearButton = document.getElementById('agent-clear-btn');
    const agentRefreshButton = document.getElementById('agent-refresh-btn');
    console.log("Agent elements found:", {
        agentInput: !!agentInput,
        agentSendButton: !!agentSendButton,
        agentOutput: !!agentOutput,
        agentClearButton: !!agentClearButton,
        agentRefreshButton: !!agentRefreshButton
    });
    // Check if elements exist
    if (!agentInput)
        console.error("❌ agent-input element not found!");
    if (!agentSendButton)
        console.error("❌ agent-send-btn element not found!");
    if (!agentOutput)
        console.error("❌ agent-output element not found!");
    if (!agentClearButton)
        console.error("❌ agent-clear-btn element not found!");
    if (!agentRefreshButton)
        console.error("❌ agent-refresh-btn element not found!");
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
                if (question) {
                    testAgent(question);
                }
            });
        });
        console.log("Agent welcome message set up!");
    }
    // Set up send button if not already done
    if (agentSendButton && !agentSendButton.hasAttribute('data-initialized')) {
        console.log("🔘 Setting up send button...");
        agentSendButton.addEventListener('click', () => {
            console.log('🔘 Send button clicked!');
            const message = agentInput.value.trim();
            if (message) {
                console.log('📤 Sending message:', message);
                testAgent(message);
                agentInput.value = '';
            }
            else {
                console.log('⚠️ No message to send');
            }
        });
        agentSendButton.setAttribute('data-initialized', 'true');
        console.log("Send button event listener attached");
    }
    else if (agentSendButton) {
        console.log("ℹ️ Send button already initialized");
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
                        if (question) {
                            testAgent(question);
                        }
                    });
                });
            }
            agentClearButton.setAttribute('data-initialized', 'true');
        });
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
// Debug function for testing agent functionality
function debugAgentTab() {
    console.log("DEBUG: Agent Tab Status");
    console.log("Current tab:", document.querySelector('.main-nav-tab.active')?.getAttribute('data-tab'), 'general');
    console.log("Agent tab element:", document.getElementById('agent-tab'), 'general');
    console.log("Agent tab visible:", document.getElementById('agent-tab')?.classList.contains('active'), 'general');
    console.log("Agent input:", document.getElementById('agent-input'), 'general');
    console.log("Agent output:", document.getElementById('agent-output'), 'general');
    console.log("Agent send button:", document.getElementById('agent-send-btn'), 'general');
    console.log("YouTube service:", typeof window.youtubeService, 'general');
    console.log("AGENT_API_URL:", AGENT_API_URL, 'general');
    // Test if we can manually initialize
    try {
        console.log("🧪 Testing manual initialization...");
        initializeAgentTab();
        console.log("Manual initialization successful");
    }
    catch (error) {
        console.error("❌ Manual initialization failed:", error);
    }
}
// Make debug function globally available
window.debugAgentTab = debugAgentTab;
// Alternative simple debug function
window.debugAgent = function () {
    console.log("Simple Agent Debug:");
    console.log("Agent tab element:", document.getElementById('agent-tab'));
    console.log("Agent input:", document.getElementById('agent-input'));
    console.log("Agent output:", document.getElementById('agent-output'));
    console.log("Current active tab:", document.querySelector('.main-nav-tab.active')?.getAttribute('data-tab'));
    console.log("Agent tab visible:", document.getElementById('agent-tab')?.classList.contains('active'));
    // Try to manually switch to agent tab
    const agentTab = document.querySelector('[data-tab="agent-tab"]');
    if (agentTab) {
        console.log("Found agent tab button, clicking...");
        agentTab.click();
    }
    else {
        console.error("❌ Agent tab button not found!");
    }
};
// Export for global access
window.AgentModule = AgentModule;
window.initializeAgentTab = initializeAgentTab;
export { AgentModule, initializeAgentTab, testAgent };
