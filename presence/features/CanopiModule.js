/**
 * CANOPI MODULE - Messages and Chat
 * TypeScript + ES6 Module
 * Handles all message and chat functionality
 */
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { Logger } from '../utils/Logger.js';
import { ensureMessageContent, formatAuthorName, formatUserHandle } from '../utils/Fallbacks.js';
import { initializeMessageSystemIntegration } from './MessageSystemIntegration.js';
import { UnifiedMessageDisplay } from '../components/UnifiedMessageDisplay.js';
const legacyContext = globalThis;
const getCurrentUser = () => stateManagerInstance.getState('currentUser');
const getCurrentChatData = () => stateManagerInstance.getState('chat.data') || [];
const setCurrentChatData = (messages) => {
    stateManagerInstance.setState('chat.data', messages);
};
const getCurrentUrlData = () => stateManagerInstance.getState('currentUrlData');
const getActiveCommunities = () => stateManagerInstance.getState('ui.activeCommunities') || [];
const getCurrentLocationHref = () => globalThis.location?.href || '';
const getCurrentVisibilityData = () => stateManagerInstance.getState('currentVisibilityData');
const getCurrentVisibilityDataUnfiltered = () => stateManagerInstance.getState('currentVisibilityDataUnfiltered');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// New message system integration
let messageSystemIntegration = null;
let unifiedMessageDisplay = null;
/**
 * Initialize the new message system
 */
async function initializeNewMessageSystem() {
    try {
        // Get Supabase client
        const supabase = typeof window !== 'undefined'
            ? window.supabase
            : null;
        if (!supabase) {
            console.warn('⚠️ initializeNewMessageSystem: Supabase client not available');
            return;
        }
        // Initialize integration
        messageSystemIntegration = await initializeMessageSystemIntegration({
            supabaseClient: supabase,
            onMessageUpdate: (messages) => {
                // Update UI when messages change
                const container = getChatMessagesContainer();
                if (container && unifiedMessageDisplay) {
                    unifiedMessageDisplay.render(messages, container, {
                        focusContext: 'default'
                    });
                }
            },
            onError: (error) => {
                console.error('❌ MessageSystemIntegration error:', error);
                if (legacyContext.showNotification) {
                    legacyContext.showNotification(`Error loading messages: ${error.message}`);
                }
            },
            showNotification: legacyContext.showNotification
        });
        // Create UnifiedMessageDisplay instance
        unifiedMessageDisplay = new UnifiedMessageDisplay();
        console.log('✅ New message system initialized');
    }
    catch (error) {
        console.error('❌ Failed to initialize new message system:', error);
    }
}
const getChatMessagesContainer = () => document.querySelector('.chat-messages');
const isFocusModeContainer = (container) => {
    if (!container)
        return false;
    return (container.classList.contains('focus-messages-container') ||
        container.getAttribute('data-focus-mode') === 'true');
};
const getMessageTimestampValue = (value) => {
    if (value instanceof Date) {
        return value.getTime();
    }
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }
    return Date.now();
};
const resolveAuthorFromPayload = (rawMessage, authorId) => {
    const authorSource = (rawMessage.author ??
        rawMessage.AppUser ??
        rawMessage.user ??
        getCurrentUser());
    return {
        id: authorSource?.id || authorId,
        name: formatAuthorName(authorSource),
        handle: formatUserHandle(authorSource),
        email: authorSource?.email,
        avatarUrl: authorSource?.avatarUrl ?? undefined,
        auraColor: authorSource?.auraColor || AVATAR_FALLBACK_COLOR
    };
};
const normalizeMessagePayload = (rawMessage) => {
    const urlData = getCurrentUrlData();
    const fallbackCommunities = getActiveCommunities();
    // Type-safe access to AppUser property
    const appUser = rawMessage.AppUser;
    const resolvedAuthorId = rawMessage.authorId ||
        rawMessage.author?.id ||
        rawMessage.userId ||
        (typeof rawMessage.user_id === 'string' ? rawMessage.user_id : undefined) ||
        appUser?.id ||
        getCurrentUser()?.id ||
        'unknown-user';
    // Type-safe access to string properties
    const getStringValue = (value) => {
        return typeof value === 'string' ? value : undefined;
    };
    const getStringOrDate = (value) => {
        if (value instanceof Date)
            return value;
        if (typeof value === 'string')
            return value;
        return new Date().toISOString();
    };
    const normalized = {
        id: String(rawMessage.id ||
            rawMessage.messageId ||
            getStringValue(rawMessage.uuid) ||
            globalThis.crypto?.randomUUID?.() ||
            `message-${Date.now()}`),
        content: ensureMessageContent({
            content: (rawMessage.content ?? rawMessage.body ?? getStringValue(rawMessage.message) ?? '')
        }),
        parentId: rawMessage.parentId ?? getStringValue(rawMessage.parent_id) ?? getStringValue(rawMessage.replyTo) ?? null,
        authorId: String(resolvedAuthorId),
        author: resolveAuthorFromPayload(rawMessage, String(resolvedAuthorId)),
        communityId: String(rawMessage.communityId ||
            getStringValue(rawMessage.community_id) ||
            fallbackCommunities[0] ||
            'comm-001'),
        conversationId: rawMessage.conversationId ??
            getStringValue(rawMessage.conversation_id) ??
            rawMessage.threadId ??
            getStringValue(rawMessage.thread_id) ??
            undefined,
        pageId: rawMessage.pageId ?? getStringValue(rawMessage.page_id) ?? urlData?.pageId,
        rawUrl: rawMessage.rawUrl ?? urlData?.rawUrl ?? null,
        normalizedUrl: rawMessage.normalizedUrl ?? urlData?.normalizedUrl ?? null,
        createdAt: getStringOrDate(rawMessage.createdAt ??
            rawMessage.created_at ??
            rawMessage.timestamp),
        updatedAt: getStringOrDate(rawMessage.updatedAt ??
            rawMessage.updated_at ??
            rawMessage.modified_at ??
            rawMessage.createdAt ??
            rawMessage.created_at),
        reactions: Array.isArray(rawMessage.reactions) ? rawMessage.reactions : [],
        optionalContent: getStringValue(rawMessage.optionalContent) ?? getStringValue(rawMessage.optional_content) ?? null,
        uri: rawMessage.uri ?? getStringValue(rawMessage.url) ?? getStringValue(rawMessage.messageUrl) ?? null,
        threadId: rawMessage.threadId ?? getStringValue(rawMessage.thread_id) ?? undefined,
        deletedAt: rawMessage.deletedAt ? getStringOrDate(rawMessage.deletedAt) : (getStringValue(rawMessage.deleted_at) ? getStringOrDate(rawMessage.deleted_at) : null),
        isBookmarked: rawMessage.isBookmarked,
        bookmarkCount: rawMessage.bookmarkCount,
        shareCount: rawMessage.shareCount,
        isShared: rawMessage.isShared
    };
    return normalized;
};
const renderMessageElement = async (message, chatContainer = getChatMessagesContainer()) => {
    const isReply = !!message.parentId;
    const isFocusMode = isFocusModeContainer(chatContainer);
    const renderer = legacyContext.UnifiedMessageRenderer;
    if (renderer && typeof renderer.generateMessageHTML === 'function') {
        const html = await renderer.generateMessageHTML(message, {
            isReply,
            isFocusMode,
            author: message.author,
            communityName: '',
            formattedTime: message.createdAt && typeof renderer.formatMessageTime === 'function'
                ? renderer.formatMessageTime(message.createdAt)
                : '',
            reactionCount: message.reactions?.length ?? 0,
            replyCount: 0,
            bookmarkCount: message.bookmarkCount ?? 0,
            isBookmarked: message.isBookmarked ?? false,
            hasUserReplied: false,
            hasUserReposted: false,
            hasUserShared: false,
            canEdit: false,
            canDelete: false
        });
        const messageDiv = document.createElement('div');
        messageDiv.className = isReply ? 'message message-reply thread-reply' : 'message thread-starter';
        if (message.parentId) {
            messageDiv.dataset.parentId = message.parentId;
        }
        if (message.parentId) {
            messageDiv.classList.add('has-parent');
        }
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.conversationId = message.conversationId || '';
        messageDiv.dataset.authorId = message.authorId || message.author?.id || '';
        messageDiv.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
        messageDiv.innerHTML = html;
        const contentWrapper = messageDiv.querySelector('.message-content-wrapper');
        if (contentWrapper) {
            contentWrapper.style.setProperty('min-height', '1px', 'important');
            contentWrapper.style.setProperty('display', 'flex', 'important');
            contentWrapper.style.setProperty('flex-direction', 'column', 'important');
        }
        // Reply visibility logic matches legacy implementation
        if (isReply) {
            const conversationId = message.conversationId || '';
            const threadToggle = document.querySelector(`[data-thread-id="${conversationId}"]`);
            if (threadToggle && threadToggle.dataset.expanded === 'true') {
                messageDiv.classList.add('visible');
            }
            else if (typeof window !== 'undefined' && window.focusedMessage) {
                messageDiv.classList.add('visible');
            }
        }
        return messageDiv;
    }
    if (legacyContext.createUnifiedMessageElement) {
        const polymorphic = legacyContext.createUnifiedMessageElement(message);
        const element = polymorphic instanceof Promise ? await polymorphic : polymorphic;
        element.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
        return element;
    }
    const fallback = await createUnifiedMessageElement(message);
    fallback.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
    return fallback;
};
const getLegacyNormalizeUrl = () => legacyContext.normalizeUrl;
const resolveActiveCommunitiesWithRetry = async (initial) => {
    if (initial && initial.length > 0) {
        return initial;
    }
    for (let attempt = 0; attempt < 25; attempt++) {
        const stateCommunities = getActiveCommunities();
        if (stateCommunities.length > 0) {
            return stateCommunities;
        }
        const legacyCommunities = legacyContext.activeCommunities || [];
        if (legacyCommunities.length > 0) {
            return legacyCommunities;
        }
        await delay(200);
    }
    return [];
};
class CanopiModule {
    constructor() {
        this.logLevel = 'INFO';
        this.isInitialized = false;
        this.logger = new Logger();
    }
    /**
     * Initialize Canopi module
     */
    async initialize() {
        if (this.isInitialized) {
            this.log('WARN', 'CanopiModule already initialized');
            return;
        }
        this.log('INFO', 'Initializing CanopiModule...');
        try {
            // Initialize new message system
            await initializeNewMessageSystem();
            this.isInitialized = true;
            this.log('INFO', 'CanopiModule initialized successfully');
        }
        catch (error) {
            this.log('ERROR', 'Failed to initialize CanopiModule:', error);
            throw error;
        }
    }
    /**
     * Logging utility
     */
    log(level, message, ...args) {
        if (this.logLevel === 'SILENT')
            return;
        const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, SILENT: 4 };
        if (levels[level] <= levels[this.logLevel]) {
            console.log(`[CanopiModule] [${level}] ${message}`, ...args);
        }
    }
    /**
     * Log computed styles for debugging
     */
    logComputedStyles(element, label) {
        if (!element) {
            this.log('WARN', `Cannot log styles for null element: ${label}`);
            return;
        }
        const computed = getComputedStyle(element);
        console.log(`📊 Styles for ${label}:`, {
            display: computed.display,
            position: computed.position,
            margin: computed.margin,
            padding: computed.padding
        });
    }
    /**
     * Set log level
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * Get initialization status
     */
    getIsInitialized() {
        return this.isInitialized;
    }
}
// Standalone functions - Full implementations
/**
 * Update message in chat
 * COMP METHOD: Matches original implementation with full DOM updates
 */
function updateMessageInChat(updatedMessage) {
    console.log('🔄 UPDATE_MESSAGE: Updating message in chat:', updatedMessage.id);
    const chatMessages = getChatMessagesContainer();
    if (!chatMessages) {
        console.error('❌ UPDATE_MESSAGE: No chat-messages element found');
        return;
    }
    // Find the existing message element
    const messageElement = chatMessages.querySelector(`[data-message-id="${updatedMessage.id}"]`);
    if (!messageElement) {
        console.log('⚠️ UPDATE_MESSAGE: Message not found in DOM, adding as new message');
        if (legacyContext.addMessageToChat) {
            legacyContext.addMessageToChat(updatedMessage);
        }
        return;
    }
    // Update the message content
    const contentElement = messageElement.querySelector('.message-content');
    if (contentElement) {
        const contentWithLinks = convertUrlsToLinks(ensureMessageContent(updatedMessage));
        contentElement.innerHTML = contentWithLinks;
    }
    // Update the message time if it changed
    const timeElement = messageElement.querySelector('.message-time-new');
    if (timeElement && updatedMessage.updatedAt) {
        const updatedTimestamp = typeof updatedMessage.updatedAt === 'string'
            ? updatedMessage.updatedAt
            : updatedMessage.updatedAt?.toISOString();
        timeElement.textContent = formatMessageTime(updatedTimestamp);
    }
    // Update cached chat data
    const chatData = getCurrentChatData();
    if (chatData.length) {
        const existingIndex = chatData.findIndex(m => m.id === updatedMessage.id);
        if (existingIndex >= 0) {
            const updatedChatData = [...chatData];
            updatedChatData[existingIndex] = updatedMessage;
            setCurrentChatData(updatedChatData);
        }
    }
    console.log('✅ UPDATE_MESSAGE: Message updated successfully');
}
/**
 * Remove message from chat
 * COMP METHOD: Matches original implementation with full DOM removal
 */
function removeMessageFromChat(deletedMessage) {
    console.log('🗑️ REMOVE_MESSAGE: Removing message from chat:', deletedMessage.id);
    const chatMessages = getChatMessagesContainer();
    if (!chatMessages) {
        console.error('❌ REMOVE_MESSAGE: No chat-messages element found');
        return;
    }
    // Find and remove the message element
    const messageElement = chatMessages.querySelector(`[data-message-id="${deletedMessage.id}"]`);
    if (messageElement) {
        // Check if message has replies - if so, mark as deleted instead of removing
        const hasReplies = messageElement.querySelector('.thread-reply[data-parent-id="' + deletedMessage.id + ']');
        if (hasReplies) {
            // Mark as deleted but keep in DOM for thread context
            messageElement.classList.add('deleted');
            const contentElement = messageElement.querySelector('.message-content');
            if (contentElement) {
                contentElement.textContent = '[Deleted]';
                contentElement.style.opacity = '0.5';
                contentElement.style.fontStyle = 'italic';
            }
            console.log('⚠️ REMOVE_MESSAGE: Message has replies, marking as deleted instead of removing');
        }
        else {
            // No replies - safe to remove
            messageElement.remove();
            console.log('✅ REMOVE_MESSAGE: Message removed from DOM');
        }
    }
    else {
        console.log('⚠️ REMOVE_MESSAGE: Message element not found in DOM');
    }
    // Update cached chat data
    const chatData = getCurrentChatData();
    if (chatData.length) {
        const updatedChatData = chatData.filter(m => m.id !== deletedMessage.id);
        setCurrentChatData(updatedChatData);
    }
    console.log('✅ REMOVE_MESSAGE: Message removed from chat data');
}
/**
 * Add or update a single message in the chat container
 */
async function addMessageToChat(rawMessage) {
    const chatMessages = getChatMessagesContainer();
    if (!chatMessages) {
        console.warn('⚠️ ADD_MESSAGE: Chat messages container not found');
        return;
    }
    try {
        const message = normalizeMessagePayload(rawMessage);
        const existingElement = chatMessages.querySelector(`[data-message-id="${message.id}"]`);
        const messageElement = await renderMessageElement(message, chatMessages);
        if (existingElement) {
            existingElement.replaceWith(messageElement);
        }
        else {
            chatMessages.appendChild(messageElement);
        }
        if (legacyContext.addMessageActionListeners) {
            legacyContext.addMessageActionListeners(messageElement, message);
        }
        if (legacyContext.loadMessageReactions) {
            try {
                await legacyContext.loadMessageReactions(message.id);
            }
            catch (reactionError) {
                console.warn('⚠️ ADD_MESSAGE: Failed to load reactions for message:', message.id, reactionError);
            }
        }
        const chatData = getCurrentChatData();
        const existingIndex = chatData.findIndex(m => m.id === message.id);
        if (existingIndex >= 0) {
            const updated = [...chatData];
            updated[existingIndex] = message;
            setCurrentChatData(updated);
        }
        else {
            setCurrentChatData([...chatData, message]);
        }
    }
    catch (error) {
        console.error('❌ ADD_MESSAGE: Failed to add message to chat:', error);
    }
}
/**
 * Get sender name from user ID
 */
function getSenderName(userId) {
    if (!userId)
        return 'Unknown User';
    // Try to get from cached messages
    const cachedMessage = getCurrentChatData().find((m) => m.authorId === userId || m.author?.id === userId);
    if (cachedMessage?.author) {
        return cachedMessage.author.name || cachedMessage.author.handle || 'Unknown User';
    }
    // Try to get from current user
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
        return currentUser.name || currentUser.email?.split('@')[0] || 'Unknown User';
    }
    // Try to get from visibility data
    const visibilityData = stateManagerInstance.getState('currentVisibilityData');
    const activeUsers = Array.isArray(visibilityData)
        ? visibilityData
        : (visibilityData && typeof visibilityData === 'object' && 'active' in visibilityData && Array.isArray(visibilityData.active))
            ? (visibilityData.active)
            : [];
    const user = activeUsers.find((u) => u.id === userId);
    if (user) {
        return user.name || user.email?.split('@')[0] || 'Unknown User';
    }
    return 'Unknown User';
}
/**
 * Get sender initial from name
 * COMP METHOD: Matches original implementation
 */
function getSenderInitial(name) {
    return (name || 'U').charAt(0).toUpperCase();
}
/**
 * Convert URLs to links in text
 * Uses the same implementation as UnifiedMessageRenderer for consistency
 */
function convertUrlsToLinks(text) {
    if (!text)
        return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}
/**
 * Format message time display
 * COMP METHOD: Matches original implementation
 */
function formatMessageTime(createdAt) {
    if (!createdAt)
        return 'Unknown';
    const messageDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
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
/**
 * Check if user can edit message
 * COMP METHOD: Matches original implementation
 */
function canUserEditMessage(message) {
    // Check if current user is the author and message is less than 1 hour old
    const messageTime = new Date(message.createdAt || '');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const currentUserEmail = getCurrentUser()?.email ?? null;
    const authorEmail = message.authorEmail || (message.author && message.author.email);
    return authorEmail === currentUserEmail && messageTime.getTime() > oneHourAgo.getTime();
}
/**
 * Create unified message element
 * Uses UnifiedMessageRenderer for consistent rendering
 */
async function createUnifiedMessageElement(message) {
    // Use UnifiedMessageRenderer if available (the working implementation)
    if (legacyContext.UnifiedMessageRenderer &&
        typeof legacyContext.UnifiedMessageRenderer.renderMessage === 'function') {
        const UnifiedMessageRenderer = legacyContext.UnifiedMessageRenderer;
        return await UnifiedMessageRenderer.renderMessage(message, {
            isReply: !!message.parentId,
            isFocusMode: false,
            author: message.author,
            communityName: '',
            reactionCount: 0,
            replyCount: 0,
            bookmarkCount: 0,
            isBookmarked: false,
            hasUserReplied: false,
            hasUserReposted: false,
            hasUserShared: false,
            canEdit: false,
            canDelete: false
        });
    }
    // Fallback: create basic message element
    const messageDiv = document.createElement('div');
    messageDiv.className = message.parentId ? 'message message-reply thread-reply' : 'message thread-starter';
    messageDiv.setAttribute('data-message-id', message.id);
    messageDiv.setAttribute('data-conversation-id', message.conversationId || '');
    if (message.parentId) {
        messageDiv.setAttribute('data-parent-id', message.parentId);
    }
    // Basic content
    const content = ensureMessageContent(message);
    messageDiv.innerHTML = `
    <div class="message-content-wrapper">
      <div class="message-header-new">
        <span class="message-sender-name">${getSenderName(message.authorId || message.author?.id || '')}</span>
      </div>
      <div class="message-content">${convertUrlsToLinks(content)}</div>
    </div>
  `;
    return messageDiv;
}
/**
 * Update reaction display for a message
 */
function updateReactionDisplay(messageId, reactions) {
    const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageDiv) {
        console.warn(`⚠️ updateReactionDisplay: Message element not found for ${messageId}`);
        return;
    }
    // Find reaction button
    const reactionButton = messageDiv.querySelector('.reaction-btn');
    if (!reactionButton)
        return;
    // Update reaction count
    const countElement = reactionButton.querySelector('.icon-count');
    const reactionCount = reactions?.length || 0;
    if (countElement) {
        if (reactionCount > 0) {
            countElement.textContent = reactionCount.toString();
            countElement.style.display = 'inline-block';
        }
        else {
            countElement.style.display = 'none';
        }
    }
    // Update button title
    reactionButton.setAttribute('title', reactionCount > 0
        ? `${reactionCount} reaction${reactionCount !== 1 ? 's' : ''}`
        : 'Add reaction');
}
/**
 * Load message reactions from API
 * COMP METHOD: Matches original implementation - accepts messageId and optional reactionBtn
 */
async function loadMessageReactions(messageId, reactionBtn) {
    if (!messageId) {
        console.warn('⚠️ loadMessageReactions: No messageId provided');
        return;
    }
    try {
        // First try to get reactions from stored reactions data if available
        let reactions = [];
        // Use API to fetch reactions
        const windowApi = typeof window !== 'undefined' ? window.api : undefined;
        if (windowApi && typeof windowApi.getReactions === 'function') {
            const response = await windowApi.getReactions(messageId);
            if (response && response.data) {
                reactions = Array.isArray(response.data) ? response.data : [];
            }
        }
        else if (typeof window !== 'undefined') {
            // Fallback: query Supabase directly
            const windowSupabase = window.supabase;
            if (!windowSupabase)
                return;
            const { data: supabaseReactions, error } = await windowSupabase
                .from('reactions')
                .select('*')
                .eq('message_id', messageId);
            if (error) {
                console.error('❌ loadMessageReactions: Error fetching reactions:', error);
                return;
            }
            reactions = supabaseReactions || [];
        }
        else {
            console.warn('⚠️ loadMessageReactions: No API or Supabase client available');
        }
        // Update reaction display
        updateReactionDisplay(messageId, reactions);
        // If reactionBtn provided, update it directly (COMP METHOD)
        if (reactionBtn) {
            const countElement = reactionBtn.querySelector('.icon-count');
            const reactionCount = reactions.length;
            if (countElement) {
                if (reactionCount > 0) {
                    countElement.textContent = reactionCount.toString();
                    countElement.style.display = 'inline-block';
                }
                else {
                    countElement.style.display = 'none';
                }
            }
        }
    }
    catch (error) {
        console.error('❌ loadMessageReactions: Error loading reactions:', error);
    }
}
/**
 * Add message action listeners (reply, reaction, bookmark, etc.)
 */
function addMessageActionListeners(messageDiv, message) {
    if (!messageDiv || !message) {
        console.warn('⚠️ addMessageActionListeners: Invalid parameters');
        return;
    }
    const messageId = message.id;
    // Reply button
    const replyButton = messageDiv.querySelector('.inline-reply-btn');
    if (replyButton) {
        replyButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const handleReplyClick = window.handleReplyClick;
            if (typeof handleReplyClick === 'function') {
                handleReplyClick(messageId, message);
            }
            else {
                console.log('📝 Reply clicked for message:', messageId);
                // Fallback: focus on reply input
                const chatTextarea = document.getElementById('chat-textarea');
                if (chatTextarea) {
                    chatTextarea.focus();
                    // Set context for reply
                    const setReplyContext = window.setReplyContext;
                    if (typeof setReplyContext === 'function') {
                        setReplyContext(messageId, message);
                    }
                }
            }
        });
    }
    // Reaction button
    const reactionButton = messageDiv.querySelector('.reaction-btn');
    if (reactionButton) {
        reactionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const handleReactionClick = window.handleReactionClick;
            if (typeof handleReactionClick === 'function') {
                handleReactionClick(messageId, message);
            }
            else {
                console.log('❤️ Reaction clicked for message:', messageId);
                // Fallback: show reaction picker or add default reaction
            }
        });
    }
    // Bookmark button
    const bookmarkButton = messageDiv.querySelector('.bookmark-btn');
    if (bookmarkButton) {
        bookmarkButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const handleBookmarkClick = window.handleBookmarkClick;
            if (typeof handleBookmarkClick === 'function') {
                handleBookmarkClick(messageId, message);
            }
            else {
                console.log('🔖 Bookmark clicked for message:', messageId);
            }
        });
    }
    // Share button
    const shareButton = messageDiv.querySelector('.share-btn');
    if (shareButton) {
        shareButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const handleShareClick = window.handleShareClick;
            if (typeof handleShareClick === 'function') {
                handleShareClick(messageId, message);
            }
            else {
                console.log('📤 Share clicked for message:', messageId);
            }
        });
    }
    // Action menu (three dots)
    const actionDotsButton = messageDiv.querySelector('.action-dots-btn');
    if (actionDotsButton) {
        actionDotsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Toggle dropdown
            const dropdown = messageDiv.querySelector('.action-dropdown');
            if (dropdown) {
                const isVisible = dropdown.style.display !== 'none';
                dropdown.style.display = isVisible ? 'none' : 'block';
            }
        });
    }
    // Edit button
    const editButton = messageDiv.querySelector('.edit-btn');
    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const handleEditClick = window.handleEditClick;
            if (typeof handleEditClick === 'function') {
                handleEditClick(messageId, message);
            }
            else {
                console.log('✏️ Edit clicked for message:', messageId);
            }
        });
    }
    // Delete button
    const deleteButton = messageDiv.querySelector('.delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const handleDeleteClick = window.handleDeleteClick;
            if (typeof handleDeleteClick === 'function') {
                handleDeleteClick(messageId, message);
            }
            else {
                console.log('🗑️ Delete clicked for message:', messageId);
            }
        });
    }
}
/**
 * Handle message focus
 * COMP METHOD: Matches original implementation - accepts message object or messageId string for backward compatibility
 */
async function handleMessageFocus(messageOrId) {
    try {
        let message = null;
        let messageId;
        // Handle both message object and messageId string (COMP compatibility)
        if (typeof messageOrId === 'string') {
            messageId = messageOrId;
            const cachedMessages = getCurrentChatData();
            message = cachedMessages.find(m => m.id === messageId) || null;
        }
        else {
            message = messageOrId;
            messageId = message.id;
        }
        if (!message) {
            console.warn('⚠️ handleMessageFocus: Message not found:', messageId);
            return;
        }
        // Use focus mode (required)
        if (!messageSystemIntegration || !unifiedMessageDisplay) {
            console.error('❌ handleMessageFocus: New message system not initialized');
            throw new Error('Message system not initialized. Call CanopiModule.initialize() first.');
        }
        if (!message.parentId) {
            // No parent - just scroll to message
            const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageDiv) {
                messageDiv.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
                console.log('🎯 FOCUS: Message focused (no parent)');
            }
            return;
        }
        // Load focus mode
        console.log('🎯 handleMessageFocus: Using focus mode system');
        const urlData = getCurrentUrlData();
        const pageId = urlData?.pageId || '';
        const activeCommunities = getActiveCommunities();
        const communityId = activeCommunities[0] || 'comm-001';
        const result = await messageSystemIntegration.loadFocusMode(pageId, message.parentId, { communityId });
        // Render in focus mode
        const container = getChatMessagesContainer();
        if (!container) {
            throw new Error('Chat messages container not found');
        }
        await unifiedMessageDisplay.render(result.replies, container, {
            focusContext: 'child',
            parentMessage: result.parent,
            highlightMessageId: message.id,
            onMessageClick: (msg) => {
                if (!msg.author)
                    return;
                const legacyMessage = {
                    id: msg.id,
                    content: msg.content,
                    authorId: msg.author.id,
                    communityId: communityId,
                    parentId: msg.parentId || null,
                    author: msg.author,
                    createdAt: msg.createdAt,
                    updatedAt: msg.updatedAt
                };
                handleMessageFocus(legacyMessage);
            },
            onReplyClick: (msg) => {
                if (!msg.author || !legacyContext.setReplyContext)
                    return;
                const legacyMessage = {
                    id: msg.id,
                    content: msg.content,
                    authorId: msg.author.id,
                    communityId: communityId,
                    parentId: msg.parentId || null,
                    author: msg.author,
                    createdAt: msg.createdAt,
                    updatedAt: msg.updatedAt
                };
                legacyContext.setReplyContext(msg.id, legacyMessage);
            },
            onFocusClick: (msg) => {
                if (!msg.author)
                    return;
                const legacyMessage = {
                    id: msg.id,
                    content: msg.content,
                    authorId: msg.author.id,
                    communityId: communityId,
                    parentId: msg.parentId || null,
                    author: msg.author,
                    createdAt: msg.createdAt,
                    updatedAt: msg.updatedAt
                };
                handleMessageFocus(legacyMessage);
            }
        });
        console.log('🎯 FOCUS: Message focused using focus mode');
    }
    catch (error) {
        console.error('❌ handleMessageFocus: Error focusing on message:', error);
    }
}
/**
 * Load chat history for a page
 * COMP METHOD: Matches original signature - accepts communityId (optional) for backward compatibility
 * Also supports new signature with rawUrl and activeCommunities
 * CRITICAL: This function must be exported to window for tab change handlers
 */
async function loadChatHistory(communityIdOrRawUrl, activeCommunitiesOrUndefined) {
    // COMP METHOD: Handle both old signature (communityId) and new signature (rawUrl, activeCommunities)
    let rawUrl;
    let activeCommunities;
    // If first param is a UUID (community ID), use old signature
    const isCommunityId = communityIdOrRawUrl && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityIdOrRawUrl);
    if (isCommunityId) {
        // Old signature: loadChatHistory(communityId)
        const communityId = communityIdOrRawUrl;
        activeCommunities = [communityId];
        console.log('📜 loadChatHistory: Using old signature with communityId:', communityId);
    }
    else {
        // New signature: loadChatHistory(rawUrl?, activeCommunities?)
        rawUrl = communityIdOrRawUrl;
        activeCommunities = activeCommunitiesOrUndefined;
    }
    console.log('📜 loadChatHistory called with:', { rawUrl, activeCommunities });
    try {
        // Get current URL data if not provided
        if (!rawUrl) {
            const urlData = getCurrentUrlData();
            rawUrl = urlData?.rawUrl || getCurrentLocationHref();
        }
        if (!rawUrl) {
            console.warn('⚠️ loadChatHistory: No URL provided');
            return;
        }
        // Get active communities if not provided
        // CRITICAL: Retry mechanism - communities may not be loaded yet
        activeCommunities = await resolveActiveCommunitiesWithRetry(activeCommunities);
        if (!activeCommunities || activeCommunities.length === 0) {
            console.warn('⚠️ loadChatHistory: No active communities available after retries');
            return;
        }
        // Normalize URL
        let pageId;
        let normalizedUrlData = getCurrentUrlData();
        if (normalizedUrlData?.pageId) {
            pageId = normalizedUrlData.pageId;
        }
        else {
            const normalizer = getLegacyNormalizeUrl();
            if (normalizer) {
                normalizedUrlData = await normalizer(rawUrl);
                pageId = normalizedUrlData?.pageId || rawUrl;
            }
            else {
                pageId = rawUrl.replace(/https?:\/\//, '').replace(/\//g, '_').replace(/\./g, '_');
            }
        }
        console.log('📜 loadChatHistory: Loading messages for page:', pageId, 'communities:', activeCommunities);
        // Get chat messages container
        const chatMessages = getChatMessagesContainer();
        if (!chatMessages) {
            console.warn('⚠️ loadChatHistory: Chat messages container not found');
            return;
        }
        // Use new message system (required)
        if (!messageSystemIntegration || !unifiedMessageDisplay) {
            console.error('❌ loadChatHistory: New message system not initialized');
            throw new Error('Message system not initialized. Call CanopiModule.initialize() first.');
        }
        console.log('📜 loadChatHistory: Loading messages with new message system');
        const communityId = activeCommunities[0] || 'comm-001';
        const messages = await messageSystemIntegration.loadDefaultView(pageId, {
            limit: 10,
            communityId
        });
        // Render using UnifiedMessageDisplay
        await unifiedMessageDisplay.render(messages, chatMessages, {
            focusContext: 'default',
            onMessageClick: (message) => {
                if (!message.author)
                    return;
                // Convert MessageStoreMessage to Message for handleMessageFocus
                const legacyMessage = {
                    id: message.id,
                    content: message.content,
                    authorId: message.author.id,
                    communityId: communityId,
                    parentId: message.parentId || null,
                    author: message.author,
                    createdAt: message.createdAt,
                    updatedAt: message.updatedAt
                };
                handleMessageFocus(legacyMessage);
            },
            onReplyClick: (message) => {
                if (!message.author || !legacyContext.setReplyContext)
                    return;
                const legacyMessage = {
                    id: message.id,
                    content: message.content,
                    authorId: message.author.id,
                    communityId: communityId,
                    parentId: message.parentId || null,
                    author: message.author,
                    createdAt: message.createdAt,
                    updatedAt: message.updatedAt
                };
                legacyContext.setReplyContext(message.id, legacyMessage);
            },
            onFocusClick: (message) => {
                if (!message.author)
                    return;
                const legacyMessage = {
                    id: message.id,
                    content: message.content,
                    authorId: message.author.id,
                    communityId: communityId,
                    parentId: message.parentId || null,
                    author: message.author,
                    createdAt: message.createdAt,
                    updatedAt: message.updatedAt
                };
                handleMessageFocus(legacyMessage);
            }
        });
        // Store messages in cache (convert to legacy format for compatibility with existing code)
        const legacyMessages = messages.filter((msg) => msg.author).map((msg) => ({
            id: msg.id,
            content: msg.content,
            authorId: msg.author.id,
            communityId: communityId,
            parentId: msg.parentId || null,
            author: msg.author,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
        }));
        setCurrentChatData(legacyMessages);
        console.log('✅ loadChatHistory: Successfully loaded messages');
    }
    catch (error) {
        console.error('❌ loadChatHistory: Error:', error);
        throw error;
    }
}
// COMP METHOD: Additional missing functions from COMP
// These functions are needed for full functional equivalence
/**
 * Check and add thread toggle button
 * COMP METHOD: Matches original implementation
 */
async function checkAndAddThreadToggle(messageElement, conversationId) {
    try {
        // Check for existing replies in the DOM
        const existingReplies = document.querySelectorAll(`[data-conversation-id="${conversationId}"] .message[data-parent-id]`);
        const replies = Array.from(existingReplies);
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
                        const toggleThreadReplies = window.toggleThreadReplies;
                        if (typeof window !== 'undefined' && toggleThreadReplies) {
                            toggleThreadReplies(conversationId, messageElement);
                        }
                    });
                }
            }
        }
    }
    catch (error) {
        console.error('❌ checkAndAddThreadToggle: Failed to check for thread replies:', error);
    }
}
/**
 * Toggle thread replies visibility
 * COMP METHOD: Matches original implementation
 */
async function toggleThreadReplies(threadId, messageElement) {
    const toggleBtn = messageElement.querySelector(`[data-thread-id="${threadId}"]`);
    if (!toggleBtn)
        return;
    const isExpanded = toggleBtn.dataset.expanded === 'true';
    const replies = messageElement.parentElement?.querySelectorAll(`[data-conversation-id="${threadId}"][data-parent-id]`) || [];
    replies.forEach((reply) => {
        const replyEl = reply;
        if (isExpanded) {
            replyEl.classList.remove('visible');
            replyEl.style.display = 'none';
        }
        else {
            replyEl.classList.add('visible');
            replyEl.style.display = 'flex';
        }
    });
    toggleBtn.dataset.expanded = isExpanded ? 'false' : 'true';
}
/**
 * Get message action menu HTML
 * COMP METHOD: Matches original implementation
 */
async function getMessageActionMenu(message) {
    const now = new Date();
    const messageDate = new Date(message.createdAt || '');
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    // Get current user to check ownership
    const currentUser = getCurrentUser();
    // Use email for user identification
    let isOwner = false;
    if (currentUser && currentUser.email) {
        const authorEmail = message.authorEmail || (message.author && message.author.email);
        isOwner = (authorEmail === currentUser.email);
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
        <button class="action-item share-navigate-btn" data-message-id="${message.id}">🧭 Go to message</button>
        <button class="action-item share-focus-btn" data-message-id="${message.id}">🎯 Focus here</button>
        <button class="action-item share-notify-btn" data-message-id="${message.id}">📌 Reference</button>
        <button class="action-item block-btn" data-message-id="${message.id}" style="display:none;">🚫 Block user</button>
      </div>
    </div>
  `;
}
/**
 * Handle reply to message
 * COMP METHOD: Matches original implementation
 */
function handleReplyToMessage(message) {
    const chatInput = document.getElementById('chat-textarea');
    const contextBar = document.getElementById('context-bar');
    const contextText = document.getElementById('context-text');
    if (chatInput && contextBar && contextText) {
        // Show the actual message content instead of user name
        const messageContent = ensureMessageContent(message);
        const replyText = messageContent.length > 50
            ? messageContent.substring(0, 50) + '...'
            : messageContent;
        // Show context bar
        contextText.textContent = `Replying to: "${replyText}"`;
        contextBar.style.display = 'block';
        contextBar.style.visibility = 'visible';
        contextBar.style.opacity = '1';
        contextBar.style.zIndex = '1001';
        // Store the parent message ID and conversation ID for when the reply is sent
        chatInput.dataset.replyTo = message.id;
        chatInput.dataset.replyToConversation = message.conversationId || '';
        chatInput.dataset.contextMode = 'reply';
        // Clear input and focus
        chatInput.value = '';
        chatInput.placeholder = 'Type your reply...';
        chatInput.focus();
    }
}
/**
 * Handle delete message
 * COMP METHOD: Matches original implementation
 */
async function handleDeleteMessage(message) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    try {
        // Check if this is a UUID (Supabase) or legacy post ID (backend API)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.id);
        if (isUUID) {
            // Use robust integration if available, fallback to legacy
            if (legacyContext.robustIntegration?.isInitialized && legacyContext.robustIntegration.deleteMessage) {
                await legacyContext.robustIntegration.deleteMessage(message.id);
            }
            else if (legacyContext.supabaseRealtimeClient?.deleteMessage) {
                await legacyContext.supabaseRealtimeClient.deleteMessage(message.id);
            }
        }
        else if (legacyContext.api?.deleteMessage) {
            // Use API for legacy post IDs
            await legacyContext.api.deleteMessage(message.id);
        }
        // Remove the message from the UI
        const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageDiv) {
            messageDiv.remove();
        }
        // Remove from cached chat data
        const updatedChatData = getCurrentChatData().filter(m => m.id !== message.id);
        setCurrentChatData(updatedChatData);
    }
    catch (error) {
        console.error('❌ handleDeleteMessage: Failed to delete message:', error);
    }
}
/**
 * Handle edit message
 * COMP METHOD: Matches original implementation
 */
async function handleEditMessage(message) {
    const chatTextarea = document.getElementById('chat-textarea');
    const contextBar = document.getElementById('context-bar');
    const contextText = document.getElementById('context-text');
    const sendButton = document.querySelector('.chat-input-area button, #chat-send-btn');
    if (!chatTextarea) {
        console.error('❌ handleEditMessage: Chat textarea not found');
        return;
    }
    // Show context bar for edit mode
    if (contextBar && contextText) {
        const messageContent = ensureMessageContent(message);
        const editText = messageContent.length > 50
            ? messageContent.substring(0, 50) + '...'
            : messageContent;
        contextText.textContent = `Editing: "${editText}"`;
        contextBar.style.display = 'block';
        contextBar.style.visibility = 'visible';
        contextBar.style.opacity = '1';
        contextBar.style.zIndex = '1001';
    }
    // Set up edit mode
    chatTextarea.placeholder = 'Edit your message...';
    chatTextarea.value = ensureMessageContent(message);
    chatTextarea.dataset.editingMessageId = message.id;
    chatTextarea.dataset.contextMode = 'edit';
    chatTextarea.focus();
    // Update send button to show "Update"
    if (sendButton) {
        sendButton.textContent = 'Update';
        sendButton.dataset.editing = 'true';
    }
    // Handle save on Enter key
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            saveEdit();
        }
        else if (event.key === 'Escape') {
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
        if (newContent && newContent !== message.content) {
            try {
                // Use robust integration if available, fallback to legacy
                const robustIntegration = window.robustIntegration;
                if (typeof window !== 'undefined' && robustIntegration && robustIntegration.isInitialized) {
                    await robustIntegration.editMessage(message.id, newContent);
                }
                else {
                    // Fallback to legacy system
                    const client = typeof window !== 'undefined' ? (window.supabaseRealtimeClient) : null;
                    if (client && typeof client.editMessage === 'function') {
                        await client.editMessage(message.id, newContent);
                    }
                }
                // Update the message in the UI
                const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
                if (messageDiv) {
                    const contentDiv = messageDiv.querySelector('.message-content');
                    if (contentDiv) {
                        contentDiv.innerHTML = convertUrlsToLinks(newContent);
                    }
                    // Add edited indicator
                    const timeElement = messageDiv.querySelector('.message-time-new');
                    if (timeElement && !timeElement.textContent?.includes('(edited)')) {
                        timeElement.textContent = (timeElement.textContent || '') + ' (edited)';
                    }
                }
                // Update in global chat data
                const chatData = getCurrentChatData();
                const index = chatData.findIndex(m => m.id === message.id);
                if (index !== -1) {
                    const updatedChatData = [...chatData];
                    updatedChatData[index] = { ...updatedChatData[index], content: newContent };
                    setCurrentChatData(updatedChatData);
                }
            }
            catch (error) {
                console.error('❌ handleEditMessage: Failed to edit message:', error);
            }
        }
        cancelEdit();
    };
    // Cancel the edit
    const cancelEdit = () => {
        // Clear context
        if (contextBar) {
            contextBar.style.display = 'none';
        }
        if (chatTextarea) {
            chatTextarea.value = '';
            chatTextarea.placeholder = 'Start thread in Public Square';
            delete chatTextarea.dataset.editingMessageId;
            delete chatTextarea.dataset.contextMode;
        }
        if (sendButton) {
            sendButton.textContent = 'Send';
            delete sendButton.dataset.editing;
        }
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
// ===== Additional missing functions from COMP =====
/**
 * Send message via Supabase
 * COMP METHOD: Matches original implementation
 */
async function sendMessageViaSupabase(content, parentId = null, conversationId = null) {
    console.log('🔥🔥🔥 SEND_MESSAGE_VIA_SUPABASE: ENTRY POINT');
    console.log('📡 SUPABASE_MESSAGE: Starting real-time message broadcast...');
    console.log('📡 SUPABASE_MESSAGE: Content:', content);
    // Use robust integration system if available
    const robustIntegration = window.robustIntegration;
    if (typeof window !== 'undefined' && robustIntegration && robustIntegration.isInitialized) {
        console.log('📡 SUPABASE_MESSAGE: Using robust integration system...');
        try {
            const messageData = await robustIntegration.sendMessage(content, parentId, conversationId);
            if (messageData) {
                console.log('📡 SUPABASE_MESSAGE: ✅ Robust integration message sent successfully');
                return messageData;
            }
            else {
                console.log('📡 SUPABASE_MESSAGE: ❌ Robust integration message failed');
                return null;
            }
        }
        catch (error) {
            console.log('📡 SUPABASE_MESSAGE: ❌ Robust integration error:', error);
            return null;
        }
    }
    // Fallback to legacy system
    console.log('📡 SUPABASE_MESSAGE: Using legacy system...');
    const client = typeof window !== 'undefined' ? (window.supabaseRealtimeClient) : null;
    if (client && typeof client.sendMessage === 'function') {
        console.log('✅ SUPABASE_MESSAGE: Client is available');
        try {
            const messageData = await client.sendMessage(content, parentId, conversationId);
            console.log('💬 SUPABASE: ✅ Message sent via real-time');
            return messageData;
        }
        catch (error) {
            console.log('💬 SUPABASE: ❌ Error sending via Supabase real-time:', error);
            return null;
        }
    }
    else {
        console.log('❌ SUPABASE_MESSAGE: Client is NOT available');
        return null;
    }
}
/**
 * Get sender avatar HTML
 * COMP METHOD: Matches original implementation
 */
async function getSenderAvatar(author) {
    const displayName = formatAuthorName(author);
    if (!author)
        return getSenderInitial(displayName);
    // Use unified avatar system for consistency
    const AvatarUtils = window.AvatarUtils;
    if (typeof window !== 'undefined' && AvatarUtils && typeof AvatarUtils.createUnifiedAvatar === 'function') {
        const avatarHTML = await AvatarUtils.createUnifiedAvatar(author, 'message', {
            size: 32,
            showStatus: true,
            showAura: true,
            context: 'message',
            statusColor: '#22c55e'
        });
        return avatarHTML;
    }
    // Fallback to initials
    return getSenderInitial(displayName);
}
/**
 * Handle share message
 * COMP METHOD: Matches original implementation
 */
async function handleShareMessage(message, shareType = 'link') {
    console.log(`🔗 SHARE: Sharing message ${message.id} with type: ${shareType}`);
    const messageUrl = `https://app.themetalayer.org/message/${message.id}`;
    try {
        if (shareType === 'link') {
            await navigator.clipboard.writeText(messageUrl);
            const showNotification = window.showNotification;
            if (typeof window !== 'undefined' && showNotification) {
                showNotification('Message link copied to clipboard!');
            }
            console.log('✅ SHARE: Message link copied:', messageUrl);
        }
        else if (shareType === 'twitter') {
            const authorHandle = message.author?.handle || formatAuthorName(message.author, 'Metalayer');
            const safeContent = ensureMessageContent(message);
            const tweetText = `Check out this message from @${authorHandle}: "${safeContent}" ${messageUrl}`;
            globalThis.open?.(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
            console.log('✅ SHARE: Opening Twitter share dialog');
        }
        else {
            console.warn('⚠️ SHARE: Unknown share type:', shareType);
        }
    }
    catch (error) {
        console.error('❌ handleShareMessage: Failed to share message:', error);
        const showNotification = window.showNotification;
        if (typeof window !== 'undefined' && showNotification) {
            showNotification('Failed to share message');
        }
    }
}
/**
 * Handle start thread
 * COMP METHOD: Matches original implementation
 */
function handleStartThread(message) {
    console.log(`🧵 THREAD: Starting new thread from message: ${message.id}`);
    const uiManager = window.uiManager;
    if (typeof window !== 'undefined' && uiManager && typeof uiManager.switchTab === 'function') {
        uiManager.switchTab('discuss-tab');
    }
    const chatInput = document.getElementById('chat-textarea');
    if (chatInput) {
        chatInput.focus();
        chatInput.placeholder = `Replying to thread by ${formatAuthorName(message.author)}...`;
        chatInput.dataset.replyTo = message.id;
        chatInput.dataset.replyToConversation = message.conversationId || '';
        chatInput.dataset.contextMode = 'reply';
    }
    const setReplyContext = window.setReplyContext;
    if (typeof window !== 'undefined' && setReplyContext) {
        setReplyContext(message.id, message);
    }
}
/**
 * Handle copy link
 * COMP METHOD: Matches original implementation
 */
async function handleCopyLink(message) {
    console.log(`🔗 COPY_LINK: Copying link for message: ${message.id}`);
    const messageUrl = `https://app.themetalayer.org/message/${message.id}`;
    try {
        await navigator.clipboard.writeText(messageUrl);
        const showNotification = window.showNotification;
        if (typeof window !== 'undefined' && showNotification) {
            showNotification('Message link copied to clipboard!');
        }
        console.log('✅ COPY_LINK: Message link copied:', messageUrl);
    }
    catch (error) {
        console.error('❌ handleCopyLink: Failed to copy link:', error);
        const showNotification = window.showNotification;
        if (typeof window !== 'undefined' && showNotification) {
            showNotification('Failed to copy link');
        }
    }
}
/**
 * Focus on message
 * COMP METHOD: Matches original implementation
 */
async function focusOnMessage(message) {
    console.log(`🎯 FOCUS_ON_MESSAGE: Focusing on message: ${message.id}`);
    const handleMessageFocus = window.handleMessageFocus;
    if (typeof window !== 'undefined' && handleMessageFocus) {
        await handleMessageFocus(message);
    }
    else {
        console.warn('⚠️ FOCUS_ON_MESSAGE: handleMessageFocus not available, falling back to basic scroll');
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
            setTimeout(() => {
                messageElement.style.backgroundColor = '';
            }, 3000);
        }
    }
}
/**
 * Parse message URL
 * COMP METHOD: Matches original implementation
 */
function parseMessageUrl(url) {
    const messageIdMatch = url.match(/\/message\/([a-f0-9-]+)/i);
    const conversationIdMatch = url.match(/\/conversation\/([a-f0-9-]+)/i);
    return {
        messageId: messageIdMatch ? messageIdMatch[1] : null,
        conversationId: conversationIdMatch ? conversationIdMatch[1] : null,
        isValid: !!(messageIdMatch || conversationIdMatch)
    };
}
/**
 * Handle incoming message URL
 * COMP METHOD: Matches original implementation
 */
async function handleIncomingMessageUrl() {
    console.log('🔗 INCOMING_URL: Checking for incoming message URL...');
    const currentUrl = getCurrentLocationHref();
    const messageData = parseMessageUrl(currentUrl);
    if (messageData.isValid && messageData.messageId) {
        console.log(`🔗 INCOMING_URL: Found messageId in URL: ${messageData.messageId}`);
        // Wait for messages to load
        setTimeout(async () => {
            const messageElement = document.querySelector(`[data-message-id="${messageData.messageId}"]`);
            if (messageElement) {
                await focusOnMessage({ id: messageData.messageId });
            }
            else {
                console.warn('🔗 INCOMING_URL: Message not found in current view:', messageData.messageId);
            }
        }, 2000);
    }
    else {
        console.log('🔗 INCOMING_URL: No message or conversation ID found in URL.');
    }
}
/**
 * Handle back navigation
 * COMP METHOD: Matches original implementation
 */
async function handleBackNavigation() {
    console.log('🔙 BACK_NAV: Starting back navigation');
    const winWithFocus = window;
    if (typeof window !== 'undefined' && winWithFocus.focusedMessage && winWithFocus.previousView) {
        const focusedMessage = winWithFocus.focusedMessage;
        const previousView = winWithFocus.previousView;
        const messageId = typeof focusedMessage === 'string' ? focusedMessage : focusedMessage.id;
        console.log('🔙 BACK_NAV: Navigating back from', previousView, 'for message', messageId);
        // Clear focus state
        delete winWithFocus.focusedMessage;
        delete winWithFocus.previousView;
        if (previousView === 'thread') {
            // This was a reply - go back to the thread view
            await loadChatHistory();
        }
        else if (previousView === 'focus') {
            // This was a focus mode - go back to normal chat view
            await loadChatHistory();
        }
    }
    else {
        console.log('🔙 BACK_NAV: No focused message or previous view, performing default back action');
        await loadChatHistory();
    }
}
/**
 * Handle reaction
 * COMP METHOD: Matches original implementation
 */
async function handleReaction(message) {
    console.log(`❤️ REACTION: Handling reaction for message: ${message.id}`);
    const reactionsIntegration = window.reactionsIntegration;
    if (typeof window !== 'undefined' && reactionsIntegration && reactionsIntegration.reactionsManager) {
        await reactionsIntegration.reactionsManager.addReaction(message.id, '👍');
    }
    else {
        console.warn('⚠️ REACTION: Reactions integration not available');
    }
}
/**
 * Setup message input event listeners
 * COMP METHOD: Matches original implementation
 */
function setupMessageInputEventListeners() {
    console.log('💬 MESSAGE_INPUT: Setting up message input event listeners...');
    const chatTextarea = document.getElementById('chat-textarea');
    const sendButton = document.querySelector('.chat-input-area button, #chat-send-btn');
    const cancelContextButton = document.getElementById('cancel-context');
    if (!chatTextarea) {
        console.error('❌ MESSAGE_INPUT: Chat textarea not found');
        return;
    }
    // Auto-resize textarea
    const autoResize = (el) => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };
    chatTextarea.addEventListener('input', () => autoResize(chatTextarea));
    chatTextarea.addEventListener('resize', () => autoResize(chatTextarea));
    // Send message on Enter
    chatTextarea.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            await sendChatMessage();
        }
    });
    // Send message on button click
    if (sendButton) {
        sendButton.addEventListener('click', async () => {
            await sendChatMessage();
        });
    }
    // Cancel context (reply/edit mode)
    if (cancelContextButton) {
        cancelContextButton.addEventListener('click', () => {
            const clearContext = window.clearContext;
            if (typeof window !== 'undefined' && clearContext) {
                clearContext();
            }
        });
    }
    console.log('✅ MESSAGE_INPUT: Message input event listeners added');
}
/**
 * Send chat message
 * COMP METHOD: Matches original implementation
 */
async function sendChatMessage() {
    const chatTextarea = document.getElementById('chat-textarea');
    if (!chatTextarea) {
        console.error('❌ SEND_CHAT_MESSAGE: Chat textarea not found');
        return;
    }
    const content = chatTextarea.value.trim();
    if (!content)
        return;
    const parentId = chatTextarea.dataset.replyTo || null;
    const conversationId = chatTextarea.dataset.replyToConversation || null;
    const editingMessageId = chatTextarea.dataset.editingMessageId || null;
    try {
        if (editingMessageId) {
            // Handle edit
            const handleEditMessage = window.handleEditMessage;
            if (typeof window !== 'undefined' && handleEditMessage) {
                const messageToEdit = getCurrentChatData().find(m => m.id === editingMessageId);
                if (messageToEdit) {
                    await handleEditMessage({ ...messageToEdit, content: content });
                }
                else {
                    console.error('❌ SEND_CHAT_MESSAGE: Message to edit not found:', editingMessageId);
                }
            }
        }
        else {
            // Handle new message or reply
            const sendMessageViaSupabase = window.sendMessageViaSupabase;
            if (typeof window !== 'undefined' && sendMessageViaSupabase) {
                const messageData = await sendMessageViaSupabase(content, parentId, conversationId);
                if (messageData) {
                    console.log('✅ SEND_CHAT_MESSAGE: Message sent:', messageData);
                    // Add message to UI immediately for responsiveness
                    const addMessageToChat = window.addMessageToChat;
                    if (typeof window !== 'undefined' && addMessageToChat) {
                        await addMessageToChat(messageData);
                    }
                }
            }
            else {
                console.error('❌ SEND_CHAT_MESSAGE: sendMessageViaSupabase not available');
            }
        }
    }
    catch (error) {
        console.error('❌ SEND_CHAT_MESSAGE: Error sending chat message:', error);
        const showNotification = window.showNotification;
        if (typeof window !== 'undefined' && showNotification) {
            showNotification('Failed to send message');
        }
    }
    finally {
        chatTextarea.value = '';
        const autoResize = window.autoResize;
        if (typeof window !== 'undefined' && autoResize) {
            autoResize(chatTextarea);
        }
        const clearContext = window.clearContext;
        if (typeof window !== 'undefined' && clearContext) {
            clearContext();
        }
    }
}
// ES6 MODULE EXPORTS ONLY - No window globals
// All functions are exported as ES6 modules for proper type safety and tree shaking
const attachLegacyIntegrations = () => {
    if (typeof window === 'undefined') {
        return;
    }
    const win = window;
    win.loadChatHistory = loadChatHistory;
    win.addMessageToChat = addMessageToChat;
    win.loadMessageReactions = loadMessageReactions;
    win.updateReactionDisplay = updateReactionDisplay;
    win.handleMessageFocus = handleMessageFocus;
    win.createUnifiedMessageElement = createUnifiedMessageElement;
    win.addMessageActionListeners = addMessageActionListeners;
};
attachLegacyIntegrations();
// ES6 module exports
export { CanopiModule, addMessageToChat, createUnifiedMessageElement, updateReactionDisplay, addMessageActionListeners, loadMessageReactions, handleMessageFocus, loadChatHistory, // CRITICAL: Export for module imports
updateMessageInChat, removeMessageFromChat, getSenderName, convertUrlsToLinks, formatMessageTime, getSenderInitial, canUserEditMessage, checkAndAddThreadToggle, toggleThreadReplies, sendMessageViaSupabase, getSenderAvatar, handleShareMessage, handleStartThread, handleCopyLink, focusOnMessage, parseMessageUrl, handleIncomingMessageUrl, handleBackNavigation, handleReaction, setupMessageInputEventListeners, sendChatMessage };
// Also export as default object for convenience
export default {
    CanopiModule,
    addMessageToChat,
    createUnifiedMessageElement,
    updateReactionDisplay,
    addMessageActionListeners,
    loadMessageReactions,
    handleMessageFocus,
    loadChatHistory
};
console.log('✅ CanopiModule TypeScript fully migrated and loaded');
