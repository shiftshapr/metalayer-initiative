/**
 * AGENT MODULE - AI Agent Functionality
 * Handles all AI agent and automation functionality
 */

import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
type LogLevel = 'SILENT' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

interface PageContentCache {
  title?: string;
  url?: string;
  content?: {
    full?: string;
    chunks?: string[];
  };
  metadata?: Record<string, unknown>;
  contentHash?: string;
  isYouTube?: boolean;
  videoData?: {
    videoId?: string;
    title?: string;
    description?: string;
    channel?: {
      name?: string;
    };
    duration?: string;
    views?: string;
    likes?: string;
    publishedDate?: string;
    tags?: string[];
  };
}

interface VideoData {
  videoId: string;
  title: string;
  description: string;
  channel?: {
    name?: string;
  };
  duration?: string;
  views?: string;
  likes?: string;
  publishedDate?: string;
  tags?: string[];
}

interface AgentContext {
  pageTitle?: string;
  pageUrl?: string;
  relevantContent?: string[];
  userQuestion?: string;
  timestamp?: string;
  videoTitle?: string;
  videoDescription?: string;
  channelName?: string;
  duration?: string;
  views?: string;
  transcript?: string;
  summary?: string;
  keyPoints?: string[];
  questions?: string[];
}

interface RelevantChunk {
  chunk: string;
  score: number;
  index: number;
}

interface ConfigManager {
  get?: (key: string) => string | undefined;
}

interface YouTubeProcessingResult {
  transcript?: string;
  summary?: string;
  keyPoints?: string[];
  questions?: string[];
}

interface YouTubeService {
  processYouTubeVideo?: (videoData: VideoData) => Promise<YouTubeProcessingResult | null>;
}

interface ExtractPageContentResponse {
  content?: PageContentCache;
}

interface ApiErrorPayload {
  error?: string;
}

function isApiErrorPayload(data: unknown): data is ApiErrorPayload {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const candidate = data as Record<string, unknown>;
  return typeof candidate.error === 'string';
}

async function getApiErrorMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (isApiErrorPayload(payload) && payload.error) {
      return payload.error;
    }
  } catch {
    // Ignore JSON parsing errors and fall back to generic messaging.
  }
  return `API error: ${response.status} ${response.statusText}`;
}

class AgentModule {
  private logLevel: LogLevel = 'INFO';
  private isInitialized: boolean = false;

  /**
   * Initialize AgentModule
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.log('WARN', 'AgentModule already initialized');
      return;
    }

    this.log('INFO', 'Initializing AgentModule...');
    
    try {
      // TODO: Initialize agent and AI systems here
      
      this.isInitialized = true;
      this.log('INFO', 'AgentModule initialized successfully');
    } catch (error: unknown) {
      this.log('ERROR', 'Failed to initialize AgentModule:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (this.logLevel === 'SILENT') return;
    
    const levels: Record<LogLevel, number> = { SILENT: -1, ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      const data = args.length > 0 ? (args.length === 1 ? args[0] : args) : null;
      if (level === 'ERROR') {
        Logger.error(`[AgentModule] ${message}`, data, 'agent');
      } else if (level === 'WARN') {
        Logger.warn(`[AgentModule] ${message}`, data, 'agent');
      } else {
        Logger.debug(`[AgentModule] ${message}`, data, 'agent');
      }
    }
  }
}

// ===== AGENT AND AI FUNCTIONS =====

// Define AGENT_API_URL using config system or fallback
const getAgentApiUrl = (): string => {
  const agentWindow = getAgentWindow();
  if (agentWindow?.configManager?.get) {
    const apiUrl = agentWindow.configManager.get('apiUrl');
    if (apiUrl) return `${apiUrl}/api/agent`;
  }
  if (agentWindow?.METALAYER_API_URL) {
    return `${agentWindow.METALAYER_API_URL}/api/agent`;
  }
  return 'http://216.238.91.120:3002/api/agent';
};

const AGENT_API_URL = getAgentApiUrl();

let pageContentCache: PageContentCache | null = null;
let contentHash: string | null = null;
let cachedChunks: string[] = [];

// --- Agent Functions ---
async function testAgent(message: string): Promise<void> {
  Logger.debug("🤖 testAgent called with message:", message, 'agent');
  if (!message.trim()) return;
  
  // Add user message to output
  addMessageToAgentOutput('You', message, true);
  
  // Show loading
  const loadingId = addMessageToAgentOutput('Agent', 'Thinking...', false, true);
  Logger.debug("🤖 Loading message added with ID:", loadingId, 'agent');
  
  try {
    // Check if we have page content, if not try to load it
    if (!pageContentCache) {
      await loadPageContent();
      
      // Wait a bit for content to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Debug: Log page content cache
    Logger.debug('🔍 Page content cache:', pageContentCache, 'agent');
    Logger.debug('🔍 Is YouTube:', pageContentCache?.isYouTube, 'agent');
    Logger.debug('🔍 Video data:', pageContentCache?.videoData, 'agent');
    Logger.debug('🔍 Current URL:', window.location.href, 'agent');
    Logger.debug('🔍 Page title:', document.title, 'agent');
    
    // Check if this is a YouTube video and handle accordingly
    if (pageContentCache && pageContentCache.isYouTube && pageContentCache.videoData) {
      Logger.debug('🎥 Processing YouTube video request...', null, 'agent');
      const videoData = pageContentCache.videoData;
      // Ensure required fields are present
      if (videoData.videoId && videoData.title) {
        const response = await handleYouTubeVideoRequest(message, videoData as VideoData);
        removeLoadingMessage(loadingId);
        addMessageToAgentOutput('Agent', response, false);
      } else {
        Logger.warn('⚠️ AgentModule: Missing required videoData fields (videoId or title)', null, 'agent');
        removeLoadingMessage(loadingId);
        addMessageToAgentOutput('Agent', 'Error: Missing video information', false);
      }
    } else {
      // Fallback: Check if we're on a YouTube page even if content script didn't detect it
      const isYouTubeFallback = window.location.hostname.includes('youtube.com') && window.location.pathname.includes('/watch');
      if (isYouTubeFallback) {
        Logger.debug('🎥 YouTube fallback detection - processing as YouTube video...', null, 'agent');
        const videoId = new URLSearchParams(window.location.search).get('v');
        if (videoId) {
          const fallbackVideoData: VideoData = {
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
      
      Logger.debug('📄 Processing regular page content...', null, 'agent');
      // Regular page content processing
      const response = await callDeepSeekAPI(message);
      removeLoadingMessage(loadingId);
      addMessageToAgentOutput('Agent', response, false);
    }
  } catch (error: unknown) {
    removeLoadingMessage(loadingId);
    const errorMessage = error instanceof Error ? error.message : String(error);
    addMessageToAgentOutput('Agent', `Error: ${errorMessage}`, false);
  }
}

// Handle YouTube video requests
async function handleYouTubeVideoRequest(message: string, videoData: VideoData): Promise<string> {
  try {
    Logger.debug('🎥 Processing YouTube video:', videoData.title, 'agent');
    
    const agentWindow = getAgentWindow();
    // First, try to get transcript and process the video
    const youtubeService = agentWindow?.youtubeService;
    const processedVideo = youtubeService?.processYouTubeVideo
      ? await youtubeService.processYouTubeVideo(videoData)
      : null;
    
    // Create context for AI with video information
    const context: AgentContext = {
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
    Logger.debug('🤖 Sending to AI agent:', {
      message: message,
      context: context,
      type: 'youtube_analysis',
      hasTranscript: !!context.transcript,
      transcriptLength: context.transcript?.length || 0
    }, 'agent');
    
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
      const errorMessage = await getApiErrorMessage(response);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Agent'
            }
        });;
    
    // Fallback response if transcription fails
    return `I detected this is a YouTube video: "${videoData.title}" by ${videoData.channel?.name || 'Unknown Channel'}.

However, I'm having trouble accessing the video transcript at the moment. This could be because:
- The video doesn't have captions available
- The transcription service is temporarily unavailable
- The video is private or restricted

You can still ask me general questions about the video based on the title and description, or try refreshing the page and asking again.`;
  
    }
}

async function callDeepSeekAPI(userMessage: string): Promise<string> {
  Logger.debug("🤖 callDeepSeekAPI called with message:", userMessage, 'agent');
  // Find relevant content chunks using RAG
  const relevantChunks = findRelevantChunks(userMessage);
  Logger.debug("🤖 Found relevant chunks:", relevantChunks.length, 'agent');
  
  // Prepare context for the AI
  const context: AgentContext = {
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

  Logger.debug("🤖 Making fetch request to:", AGENT_API_URL, 'agent');
  Logger.debug("🤖 Request payload:", {
    message: userMessage,
    context: context,
    pageContent: limitedPageContent
  }, 'agent');
  
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
  
  Logger.debug("🤖 API response status:", { status: response.status, statusText: response.statusText }, 'agent');
  
  if (!response.ok) {
    const errorMessage = await getApiErrorMessage(response);
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  return data.response;
}

function findRelevantChunks(userMessage: string): string[] {
  if (!cachedChunks || cachedChunks.length === 0) {
    return [];
  }
  
  // Simple keyword-based relevance scoring
  const messageWords = userMessage.toLowerCase().split(/\s+/);
  const relevantChunks: RelevantChunk[] = [];
  
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
function limitContentSize(content: string, maxLength: number = 2000): string {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

function addMessageToAgentOutput(sender: string, message: string, isUser: boolean = false, isLoading: boolean = false): string | null {
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

function removeLoadingMessage(loadingId: string | null): void {
  if (loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
      loadingElement.remove();
    }
  }
}

function formatMarkdown(text: string): string {
  return text
    .replace(/### (.*$)/gim, '<h3>$1</h3>')
    .replace(/## (.*$)/gim, '<h2>$1</h2>')
    .replace(/# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
}

async function loadPageContent(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    Logger.debug('Loading page content for tab:', tab?.url, 'agent');
    
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      // Try to inject content script if it's not already loaded
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          files: ['content.js']
        });
        Logger.debug('Content script injected successfully', null, 'agent');
      } catch (injectError) {
        const error = injectError as Error;
        Logger.debug('Content script injection failed (may already be loaded):', error.message, 'agent');
      }
      
      // Wait a bit for content script to load
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id!, { action: 'extractPageContent' }, (response?: ExtractPageContentResponse) => {
          if (chrome.runtime.lastError) {
            Logger.debug('Error getting page content:', chrome.runtime.lastError, 'agent');
            // Set a fallback page content for pages where content script can't run
            setFallbackPageContent(tab);
            return;
          }
          
          if (response?.content) {
            Logger.debug('Page content loaded successfully:', response.content.title, 'agent');
            // Check if content has changed (different hash)
            const newHash = response.content.contentHash ?? null;
            if (contentHash !== newHash) {
              contentHash = newHash;
              pageContentCache = response.content;
              cachedChunks = response.content.content?.chunks || [];
              
              // Update agent welcome message with page info
              updateAgentWelcomeWithPageInfo(response.content);
            }
          } else {
            Logger.debug('No content received, using fallback', 'agent');
            setFallbackPageContent(tab);
          }
        });
      }, 500);
    } else {
      // For chrome:// pages or extension pages, set fallback content
      Logger.debug('Using fallback content for:', tab?.url, 'agent');
      setFallbackPageContent(tab ?? null);
    }
  } catch (error: unknown) {
    Logger.debug('Error loading page content:', error, 'agent');
    setFallbackPageContent(null);
  }
}

function setFallbackPageContent(tab: chrome.tabs.Tab | null): void {
  const fallbackContent: PageContentCache = {
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

function updateAgentWelcomeWithPageInfo(pageData: PageContentCache): void {
  const agentOutput = document.getElementById('agent-output');
  if (!agentOutput) return;
  
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
    } else {
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
        Logger.debug("Suggestion button clicked:", question, 'agent');
        if (question) {
          testAgent(question);
        }
      });
    });
  }
}

function initializeAgentTab(): void {
  Logger.debug("=== INITIALIZING AGENT TAB ===", null, 'agent');
  Logger.debug("Current URL:", window.location.href, 'agent');
  Logger.debug("Document ready state:", document.readyState, 'agent');
  
  // Load page content for the agent
  Logger.debug("📄 Loading page content...", null, 'agent');
  loadPageContent();
  
  // Get agent element references
  Logger.debug("Getting agent element references...", null, 'agent');
  const agentInput = document.getElementById('agent-input');
  const agentSendButton = document.getElementById('agent-send-btn');
  const agentOutput = document.getElementById('agent-output');
  const agentClearButton = document.getElementById('agent-clear-btn');
  const agentRefreshButton = document.getElementById('agent-refresh-btn');
  
  Logger.debug("Agent elements found:", {
    agentInput: !!agentInput,
    agentSendButton: !!agentSendButton,
    agentOutput: !!agentOutput,
    agentClearButton: !!agentClearButton,
    agentRefreshButton: !!agentRefreshButton
  }, 'agent');
  
  // Check if elements exist
  if (!agentInput) Logger.error("❌ agent-input element not found!", null, 'agent');
  if (!agentSendButton) Logger.error("❌ agent-send-btn element not found!", null, 'agent');
  if (!agentOutput) Logger.error("❌ agent-output element not found!", null, 'agent');
  if (!agentClearButton) Logger.error("❌ agent-clear-btn element not found!", null, 'agent');
  if (!agentRefreshButton) Logger.error("❌ agent-refresh-btn element not found!", null, 'agent');
  
  // Initialize agent output if not already done
  if (agentOutput && !agentOutput.querySelector('.agent-welcome')) {
    Logger.debug("Setting up agent output...", null, 'agent');
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
        Logger.debug("Suggestion button clicked:", question, 'agent');
        if (question) {
          testAgent(question);
        }
      });
    });
    Logger.debug("Agent welcome message set up!", null, 'agent');
  }
  
  // Set up send button if not already done
  if (agentSendButton && !agentSendButton.hasAttribute('data-initialized')) {
    Logger.debug("🔘 Setting up send button...", null, 'agent');
    agentSendButton.addEventListener('click', () => {
      Logger.debug('🔘 Send button clicked!', null, 'agent');
      const message = (agentInput as HTMLInputElement).value.trim();
      if (message) {
        Logger.debug('📤 Sending message:', message, 'agent');
        testAgent(message);
        (agentInput as HTMLInputElement).value = '';
      } else {
        Logger.debug('⚠️ No message to send', null, 'agent');
      }
    });
    agentSendButton.setAttribute('data-initialized', 'true');
    Logger.debug("Send button event listener attached", null, 'agent');
  } else if (agentSendButton) {
    Logger.debug("ℹ️ Send button already initialized", null, 'agent');
  }
  
  // Set up input field if not already done
  if (agentInput && !agentInput.hasAttribute('data-initialized')) {
    agentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = (agentInput as HTMLInputElement).value.trim();
        if (message) {
          testAgent(message);
          (agentInput as HTMLInputElement).value = '';
        }
      }
    });
    agentInput.setAttribute('data-initialized', 'true');
  }
  
  // Set up Clear button
  if (agentClearButton && !agentClearButton.hasAttribute('data-initialized')) {
    agentClearButton.addEventListener('click', () => {
      Logger.debug('Clear button clicked!', null, 'agent');
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
      Logger.debug('Refresh button clicked!', null, 'agent');
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
  
  Logger.debug('=== AGENT TAB INITIALIZATION COMPLETE ===', null, 'agent');
}

// Debug function for testing agent functionality
function debugAgentTab(): void {
  Logger.debug("DEBUG: Agent Tab Status", null, 'agent');
  Logger.debug("Current tab:", document.querySelector('.main-nav-tab.active')?.getAttribute('data-tab'), 'agent');
  Logger.debug("Agent tab element:", document.getElementById('agent-tab'), 'agent');
  Logger.debug("Agent tab visible:", document.getElementById('agent-tab')?.classList.contains('active'), 'agent');
  Logger.debug("Agent input:", document.getElementById('agent-input'), 'agent');
  Logger.debug("Agent output:", document.getElementById('agent-output'), 'agent');
  Logger.debug("Agent send button:", document.getElementById('agent-send-btn'), 'agent');
  const agentWindow = getAgentWindow();
  Logger.debug("YouTube service:", typeof agentWindow?.youtubeService, 'agent');
  Logger.debug("AGENT_API_URL:", AGENT_API_URL, 'agent');
  
  // Test if we can manually initialize
  try {
    Logger.debug("🧪 Testing manual initialization...", null, 'agent');
    initializeAgentTab();
    Logger.debug("Manual initialization successful", null, 'agent');
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'Agent'
            }
        });;
  
    }
}

// Make debug function globally available
const agentWindow = getAgentWindow();
if (agentWindow) {
  agentWindow.debugAgentTab = debugAgentTab;
}

// Alternative simple debug function
if (agentWindow) {
  agentWindow.debugAgent = function (): void {
    Logger.debug("Simple Agent Debug:", null, 'agent');
    Logger.debug("Agent tab element:", document.getElementById('agent-tab'), 'agent');
    Logger.debug("Agent input:", document.getElementById('agent-input'), 'agent');
    Logger.debug("Agent output:", document.getElementById('agent-output'), 'agent');
    Logger.debug("Current active tab:", document.querySelector('.main-nav-tab.active')?.getAttribute('data-tab'), 'agent');
    Logger.debug("Agent tab visible:", document.getElementById('agent-tab')?.classList.contains('active'), 'agent');
    
    // Try to manually switch to agent tab
    const agentTab = document.querySelector('[data-tab="agent-tab"]');
    if (agentTab) {
      Logger.debug("Found agent tab button, clicking...", 'agent');
      (agentTab as HTMLElement).click();
    } else {
      Logger.error("❌ Agent tab button not found!", null, 'agent');
    }
  };

  // Export for global access
  agentWindow.AgentModule = AgentModule;
  agentWindow.initializeAgentTab = initializeAgentTab;
}

function getAgentWindow(): AgentWindow | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window as AgentWindow;
}

type AgentWindow = Window & {
  configManager?: ConfigManager;
  METALAYER_API_URL?: string;
  youtubeService?: YouTubeService;
  debugAgentTab?: () => void;
  debugAgent?: () => void;
  AgentModule?: typeof AgentModule;
  initializeAgentTab?: () => void;
};

export { AgentModule, initializeAgentTab, testAgent };

