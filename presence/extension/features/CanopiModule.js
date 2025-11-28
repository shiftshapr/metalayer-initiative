/**
 * CANOPI MODULE - Messages and Chat
 * TypeScript + ES6 Module
 * Handles all message and chat functionality
 */
import { MessageLoader } from '../components/MessageLoader.js';
import '../utils/MESSAGE_FETCH_DIAGNOSTIC.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { Logger } from '../utils/Logger.js';
import { ensureMessageContent, formatAuthorName, formatUserHandle } from '../utils/Fallbacks.js';
import { initializeMessageSystemIntegration } from './MessageSystemIntegration.js';
import { UnifiedMessageDisplay } from '../components/UnifiedMessageDisplay.js';
import { UnifiedMessageRenderer } from '../utils/UnifiedMessageRenderer.js';
// Helper to get window functions (set by other modules)
const getWindowFunction = (name) => {
    if (typeof window === 'undefined')
        return undefined;
    const win = window;
    return win[name];
};
// Helper to get API instance
const getApi = () => {
    const win = window;
    return win.api || null;
};
const getCurrentUser = () => stateManagerInstance.getState('currentUser');
const getCurrentChatData = () => {
    const data = stateManagerInstance.getState('chat.data');
    return Array.isArray(data) ? data : [];
};
const setCurrentChatData = (messages) => {
    stateManagerInstance.setState('chat.data', messages);
};
const getCurrentUrlData = () => {
    const urlData = stateManagerInstance.getState('currentUrlData');
    return urlData && typeof urlData === 'object' ? urlData : undefined;
};
const getActiveCommunities = () => {
    const communities = stateManagerInstance.getState('ui.activeCommunities');
    return Array.isArray(communities) ? communities : [];
};
/**
 * Get current location href, but NEVER return sidepanel URLs
 * ROOT CAUSE FIX: This prevents sidepanel URLs from being used as pageIds
 */
const getCurrentLocationHref = () => {
    const href = globalThis.location?.href || '';
    // ROOT CAUSE FIX: Never return sidepanel or chrome-extension URLs
    if (href.includes('sidepanel') || href.startsWith('chrome-extension://') || href.startsWith('chrome://')) {
        return '';
    }
    return href;
};
const getCurrentVisibilityData = () => {
    const data = stateManagerInstance.getState('currentVisibilityData');
    return data && typeof data === 'object' ? data : undefined;
};
const getCurrentVisibilityDataUnfiltered = () => {
    const data = stateManagerInstance.getState('currentVisibilityDataUnfiltered');
    return data && typeof data === 'object' ? data : undefined;
};
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// New message system integration
let messageSystemIntegration = null;
let unifiedMessageDisplay = null;
let messageLoaderInstance = null;
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
        if (!messageLoaderInstance) {
            messageLoaderInstance = new MessageLoader();
            console.log('✅ initializeNewMessageSystem: MessageLoader instance created');
        }
        // ROOT CAUSE FIX: Track if we're in initial load to prevent duplicate processing
        let isInitialLoad = true;
        let initialLoadComplete = false;
        // Initialize integration
        messageSystemIntegration = await initializeMessageSystemIntegration({
            supabaseClient: supabase,
            messageLoader: messageLoaderInstance,
            onMessageUpdate: (messages) => {
                // ROOT CAUSE FIX: During initial load, skip onMessageUpdate callback
                // Messages will be rendered via loadChatHistory's render() call
                // BUT: Always process NEW messages (replies/quotes) even during initial load
                const win = window;
                const isInitialLoad = win.isInitialMessageLoad && !win.initialMessageLoadComplete;
                // CRITICAL FIX: Check if any messages are NEW (not in DOM yet)
                const messagesContainer = getChatMessagesContainer();
                if (messagesContainer) {
                    const allChatContainers = document.querySelectorAll('.chat-messages');
                    const existingIds = new Set();
                    allChatContainers.forEach(cont => {
                        const actualMessages = Array.from(cont.querySelectorAll('.message, [data-message-id]')).filter(el => {
                            return el.classList.contains('message') ||
                                el.querySelector('.message-content-wrapper') !== null ||
                                (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
                        });
                        actualMessages.forEach(el => {
                            const id = el.getAttribute('data-message-id');
                            if (id)
                                existingIds.add(id);
                        });
                    });
                    const hasNewMessages = messages.some(msg => !existingIds.has(msg.id));
                    // If initial load AND no new messages, skip (messages will be rendered by loadChatHistory)
                    if (isInitialLoad && !hasNewMessages) {
                        console.log(`🔍 onMessageUpdate: Skipping during initial load (${messages.length} messages will be rendered via loadChatHistory)`);
                        return;
                    }
                    // If initial load BUT has new messages, process them (replies/quotes from real-time)
                    if (isInitialLoad && hasNewMessages) {
                        console.log(`🔍 onMessageUpdate: Initial load but ${messages.filter(m => !existingIds.has(m.id)).length} new messages detected, processing them`);
                    }
                }
                else if (isInitialLoad) {
                    console.log(`🔍 onMessageUpdate: Skipping during initial load (container not ready)`);
                    return;
                }
                // CRITICAL FIX: Only add NEW messages, but check ALL containers for duplicates
                const container = getChatMessagesContainer();
                if (!container)
                    return;
                // Get existing message IDs in ALL containers to prevent duplicates
                const allChatContainers = document.querySelectorAll('.chat-messages');
                const existingIds = new Set();
                allChatContainers.forEach(cont => {
                    const actualMessages = Array.from(cont.querySelectorAll('.message, [data-message-id]')).filter(el => {
                        return el.classList.contains('message') ||
                            el.querySelector('.message-content-wrapper') !== null ||
                            (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
                    });
                    actualMessages.forEach(el => {
                        const id = el.getAttribute('data-message-id');
                        if (id)
                            existingIds.add(id);
                    });
                });
                // Only process messages that aren't already in DOM
                const newMessages = messages.filter(msg => !existingIds.has(msg.id));
                if (newMessages.length > 0) {
                    console.log(`🔍 onMessageUpdate: Adding ${newMessages.length} new messages (${messages.length} total, ${existingIds.size} already in DOM)`);
                    // Add new messages via addMessageToChat (which has duplicate checks)
                    newMessages.forEach(msg => {
                        const addMessageFn = getWindowFunction('addMessageToChat');
                        if (addMessageFn) {
                            addMessageFn(msg);
                        }
                    });
                }
                else {
                    console.log(`🔍 onMessageUpdate: All ${messages.length} messages already in DOM, skipping update`);
                }
            },
            onError: (error) => {
                console.error('❌ MessageSystemIntegration error:', error);
                const showNotification = getWindowFunction('showNotification');
                if (showNotification) {
                    showNotification(`Error loading messages: ${error.message}`);
                }
            },
            showNotification: getWindowFunction('showNotification') || ((msg) => console.log('📢', msg))
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
            publicSquareUUID),
        conversationId: (() => {
            const convId = rawMessage.conversationId ?? getStringValue(rawMessage.conversation_id);
            if (typeof convId === 'string')
                return convId;
            const threadId = rawMessage.threadId ?? getStringValue(rawMessage.thread_id);
            return typeof threadId === 'string' ? threadId : undefined;
        })(),
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
        isBookmarked: typeof rawMessage.isBookmarked === 'boolean' ? rawMessage.isBookmarked : undefined,
        bookmarkCount: typeof rawMessage.bookmarkCount === 'number' ? rawMessage.bookmarkCount : undefined,
        shareCount: rawMessage.shareCount,
        isShared: rawMessage.isShared
    };
    return normalized;
};
const renderMessageElement = async (message, chatContainer = getChatMessagesContainer()) => {
    const isReply = !!message.parentId;
    const isFocusMode = isFocusModeContainer(chatContainer);
    // ROOT CAUSE FIX: Calculate permissions and format time properly
    const currentUser = getCurrentUser();
    const isOwner = currentUser && (currentUser.id === message.authorId ||
        currentUser.id === message.author?.id ||
        currentUser.email === message.authorEmail);
    const messageTime = new Date(message.createdAt || '');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const diffHours = (Date.now() - messageTime.getTime()) / (1000 * 60 * 60);
    const canEdit = isOwner && diffHours < 1; // Can edit within 1 hour
    const canDelete = isOwner; // User can only delete their own messages
    // Format time using formatMessageTime - ROOT CAUSE FIX: Convert Date to string if needed
    // CRITICAL FIX: Ensure formattedTime is always a string, never a Promise
    const createdAtStr = message.createdAt
        ? (typeof message.createdAt === 'string'
            ? message.createdAt
            : message.createdAt instanceof Date
                ? message.createdAt.toISOString()
                : String(message.createdAt))
        : null;
    const formattedTime = formatMessageTime(createdAtStr);
    // ROOT CAUSE FIX: Ensure formattedTime is a string (not a Promise or other type)
    const safeFormattedTime = typeof formattedTime === 'string' ? formattedTime : String(formattedTime || '');
    if (typeof formattedTime !== 'string') {
        console.error('❌ renderMessageElement: formattedTime is not a string! Type:', typeof formattedTime, 'Value:', formattedTime);
    }
    // Use UnifiedMessageRenderer directly (imported, no window dependency)
    if (UnifiedMessageRenderer && typeof UnifiedMessageRenderer.generateMessageHTML === 'function') {
        // ROOT CAUSE FIX: Ensure getMessageActionsMenu is available for UnifiedMessageRenderer
        // Note: UnifiedMessageRenderer will await the Promise, so we can return the Promise directly
        // CRITICAL FIX: Pass canEdit/canDelete to getMessageActionsMenu
        const win = window;
        if (!win.getMessageActionsMenu) {
            win.getMessageActionsMenu = async (msg, edit, del) => {
                // CRITICAL FIX: Pass canEdit/canDelete to getMessageActionMenu
                return await getMessageActionMenu(msg, edit, del);
            };
        }
        // CRITICAL FIX: Get community name from message or communities module
        let communityName = '';
        if (message.communityId) {
            // Try to get community name from CommunitiesModule or stateManager
            const communitiesModule = getWindowFunction('CommunitiesModule');
            if (communitiesModule && typeof communitiesModule.getCommunityName === 'function') {
                const name = communitiesModule.getCommunityName(message.communityId);
                communityName = typeof name === 'string' ? name : (name instanceof Promise ? await name : '');
            }
            else {
                // Fallback: Check stateManager for community data
                const communities = stateManagerInstance.getState('communities');
                if (communities && communities[message.communityId]) {
                    communityName = communities[message.communityId].name || '';
                }
            }
            // If still empty and it's Public Square, use that name
            if (!communityName && message.communityId === publicSquareUUID) {
                communityName = 'Public Square';
            }
        }
        // CRITICAL FIX: Calculate reply count from current chat data
        const currentChatData = getCurrentChatData();
        const replyCount = currentChatData.filter(m => m.parentId === message.id).length;
        const html = await UnifiedMessageRenderer.generateMessageHTML(message, {
            isReply,
            isFocusMode,
            author: message.author,
            communityName,
            formattedTime: safeFormattedTime,
            reactionCount: (Array.isArray(message.reactions) ? message.reactions.length : 0),
            replyCount,
            bookmarkCount: typeof message.bookmarkCount === 'number' ? message.bookmarkCount : 0,
            isBookmarked: typeof message.isBookmarked === 'boolean' ? message.isBookmarked : false,
            hasUserReplied: false,
            hasUserReposted: false,
            hasUserShared: false,
            canEdit,
            canDelete
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
        messageDiv.dataset.conversationId = (message.conversationId || '');
        messageDiv.dataset.authorId = message.authorId || message.author?.id || '';
        messageDiv.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
        messageDiv.innerHTML = html;
        const contentWrapper = messageDiv.querySelector('.message-content-wrapper');
        if (contentWrapper) {
            contentWrapper.style.setProperty('min-height', '1px', 'important');
            contentWrapper.style.setProperty('display', 'flex', 'important');
            contentWrapper.style.setProperty('flex-direction', 'column', 'important');
        }
        // ROOT CAUSE FIX: Verify icons and info are present in the generated HTML
        // Check for both old and new class names
        const hasIcons = messageDiv.querySelector('.message-actions-menu, .message-actions-new, .action-dots-btn, .reaction-btn, .reply-btn, .inline-reply-btn');
        const hasInfo = messageDiv.querySelector('.message-header, .message-header-new, .message-author, .message-time, .message-time-new, .author-name, .message-sender-name');
        if (!hasIcons || !hasInfo) {
            console.warn(`⚠️ renderMessageElement: Message ${message.id} missing icons or info. Icons: ${!!hasIcons}, Info: ${!!hasInfo}`);
            console.log('🔍 renderMessageElement: Generated HTML length:', html.length);
            console.log('🔍 renderMessageElement: HTML preview:', html.substring(0, 200));
            // ROOT CAUSE FIX: If missing, inject the action menu manually
            if (!hasIcons) {
                const actionMenuHTML = await getMessageActionMenu(message);
                const actionsContainer = messageDiv.querySelector('.message-actions-new') || messageDiv.querySelector('.message-header-new');
                if (actionsContainer) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = actionMenuHTML;
                    actionsContainer.appendChild(tempDiv.firstElementChild || tempDiv);
                }
            }
        }
        // Reply visibility logic
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
    // ROOT CAUSE FIX: Get createUnifiedMessageElement from window (set by UnifiedMessageDisplay module)
    const createUnifiedMessageElementFn = getWindowFunction('createUnifiedMessageElement');
    if (createUnifiedMessageElementFn) {
        const polymorphic = createUnifiedMessageElementFn(message);
        const element = polymorphic instanceof Promise ? await polymorphic : polymorphic;
        element.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
        return element;
    }
    const fallback = await createUnifiedMessageElement(message);
    fallback.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
    return fallback;
};
// ROOT CAUSE FIX: Get normalizeUrl from window (set by TabContextManager or other module)
const getNormalizeUrl = () => {
    return getWindowFunction('normalizeUrl');
};
/**
 * Fetch Public Square community UUID from API
 */
// Public Square community UUID
const publicSquareUUID = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4';
const resolveActiveCommunitiesWithRetry = async (initial) => {
    if (initial && initial.length > 0) {
        return initial;
    }
    for (let attempt = 0; attempt < 25; attempt++) {
        const stateCommunities = getActiveCommunities();
        if (stateCommunities.length > 0) {
            return stateCommunities;
        }
        await delay(200);
    }
    // ROOT CAUSE FIX: If no communities found after retries, use Public Square UUID
    console.log(`⚠️ resolveActiveCommunitiesWithRetry: No communities found after retries, using Public Square UUID: ${publicSquareUUID}`);
    // Set it in stateManager for future calls
    stateManagerInstance.setState('ui.activeCommunities', [publicSquareUUID]);
    stateManagerInstance.setState('ui.primaryCommunity', publicSquareUUID);
    return [publicSquareUUID];
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
        // ROOT CAUSE FIX: Get addMessageToChat from window (set by CanopiModule exports)
        const addMessageToChatFn = getWindowFunction('addMessageToChat');
        if (addMessageToChatFn) {
            addMessageToChatFn(updatedMessage);
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
    console.log('🔍 ADD_MESSAGE: Called with rawMessage:', rawMessage);
    const chatMessages = getChatMessagesContainer();
    if (!chatMessages) {
        console.warn('⚠️ ADD_MESSAGE: Chat messages container not found');
        return;
    }
    try {
        const message = normalizeMessagePayload(rawMessage);
        console.log('🔍 ADD_MESSAGE: Normalized message:', message.id, message.content?.substring(0, 50));
        // CRITICAL FIX: Check for duplicate, but only check actual message elements (not buttons)
        const existingMessages = Array.from(chatMessages.querySelectorAll('.message, [data-message-id]')).filter(el => {
            return el.classList.contains('message') ||
                el.querySelector('.message-content-wrapper') !== null ||
                (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
        });
        const existingElement = existingMessages.find(el => el.getAttribute('data-message-id') === message.id);
        if (existingElement) {
            console.log(`⚠️ addMessageToChat: Message ${message.id} already exists in DOM, skipping duplicate`);
            return; // Don't add duplicate
        }
        // CRITICAL FIX: Check state but allow updates for existing messages (replies/quotes might update parent)
        const currentChatData = getCurrentChatData();
        const existingMessageIndex = currentChatData.findIndex(m => m.id === message.id);
        if (existingMessageIndex >= 0) {
            // Message exists in state - check if it's actually in DOM
            const existingInDOM = existingMessages.some(el => el.getAttribute('data-message-id') === message.id);
            if (existingInDOM) {
                console.log(`⚠️ addMessageToChat: Message ${message.id} already exists in DOM and state, skipping duplicate`);
                return; // Don't add duplicate
            }
            else {
                console.log(`🔍 addMessageToChat: Message ${message.id} in state but not in DOM, will add to DOM`);
                // Continue to add to DOM even though it's in state (might be a different container)
            }
        }
        const messageElement = await renderMessageElement(message, chatMessages);
        console.log('✅ ADD_MESSAGE: Rendered message element for:', message.id);
        chatMessages.appendChild(messageElement);
        console.log('✅ ADD_MESSAGE: Appended message to DOM:', message.id);
        // ROOT CAUSE FIX: Get addMessageActionListeners from window
        const addMessageActionListenersFn = getWindowFunction('addMessageActionListeners');
        if (addMessageActionListenersFn) {
            addMessageActionListenersFn(messageElement, message);
            console.log('✅ ADD_MESSAGE: Attached action listeners for:', message.id);
        }
        else {
            console.warn('⚠️ ADD_MESSAGE: addMessageActionListeners not available');
        }
        // ROOT CAUSE FIX: Get loadMessageReactions from window
        const loadMessageReactionsFn = getWindowFunction('loadMessageReactions');
        if (loadMessageReactionsFn) {
            try {
                await loadMessageReactionsFn(message.id);
            }
            catch (reactionError) {
                console.warn('⚠️ ADD_MESSAGE: Failed to load reactions for message:', message.id, reactionError);
            }
        }
        // Update state with new message
        const chatData = getCurrentChatData();
        const existingIndex = chatData.findIndex(m => m.id === message.id);
        if (existingIndex >= 0) {
            const updated = [...chatData];
            updated[existingIndex] = message;
            setCurrentChatData(updated);
            console.log('✅ ADD_MESSAGE: Updated existing message in state:', message.id);
        }
        else {
            setCurrentChatData([...chatData, message]);
            console.log('✅ ADD_MESSAGE: Added new message to state:', message.id, 'Total messages:', chatData.length + 1);
        }
    }
    catch (error) {
        console.error('❌ ADD_MESSAGE: Failed to add message to chat:', error);
        console.error('❌ ADD_MESSAGE: Error details:', error instanceof Error ? error.stack : error);
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
    // Use UnifiedMessageRenderer directly (imported, no window dependency)
    if (UnifiedMessageRenderer && typeof UnifiedMessageRenderer.renderMessage === 'function') {
        // ROOT CAUSE FIX: Get community name (same logic as renderMessageElement)
        let communityName = '';
        if (message.communityId) {
            const communitiesModule = getWindowFunction('CommunitiesModule');
            if (communitiesModule && typeof communitiesModule.getCommunityName === 'function') {
                const name = communitiesModule.getCommunityName(message.communityId);
                communityName = typeof name === 'string' ? name : (name instanceof Promise ? await name : '');
            }
            else {
                const communities = stateManagerInstance.getState('communities');
                if (communities && communities[message.communityId]) {
                    communityName = communities[message.communityId].name || '';
                }
            }
            if (!communityName && message.communityId === publicSquareUUID) {
                communityName = 'Public Square';
            }
        }
        return await UnifiedMessageRenderer.renderMessage(message, {
            isReply: !!message.parentId,
            isFocusMode: false,
            author: message.author,
            communityName,
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
    messageDiv.setAttribute('data-conversation-id', (message.conversationId || ''));
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
    // ROOT CAUSE FIX: Try multiple selectors and containers to find message element
    let messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
    // If not found, try searching in chat containers
    if (!messageDiv) {
        const chatContainers = [
            document.getElementById('chat-messages'),
            document.querySelector('.chat-messages'),
            document.querySelector('[data-chat-messages]'),
            document.querySelector('#discuss-tab .main-tab-content'),
            document.querySelector('.discuss-tab-content')
        ].filter(Boolean);
        for (const container of chatContainers) {
            messageDiv = container.querySelector(`[data-message-id="${messageId}"]`);
            if (messageDiv)
                break;
        }
    }
    if (!messageDiv) {
        console.warn(`⚠️ updateReactionDisplay: Message element not found for ${messageId}. Searched in all containers.`);
        // ROOT CAUSE FIX: Log available message IDs for debugging
        const allMessages = document.querySelectorAll('[data-message-id]');
        const availableIds = Array.from(allMessages).slice(0, 5).map(el => el.getAttribute('data-message-id'));
        console.log(`🔍 updateReactionDisplay: Available message IDs (first 5):`, availableIds);
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
            if (response) {
                if (Array.isArray(response)) {
                    reactions = response;
                }
                else if (typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
                    reactions = response.data;
                }
            }
        }
        else if (typeof window !== 'undefined') {
            // Fallback: query Supabase directly
            const windowSupabase = window.supabase;
            if (!windowSupabase)
                return;
            const supabaseQuery = windowSupabase;
            const queryResult = await supabaseQuery.from('reactions').select('*').eq('message_id', messageId);
            const { data: supabaseReactions, error } = queryResult;
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
        replyButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            // Use UnifiedMessageModal for replies
            await handleReplyToMessage(message);
        });
    }
    // Quote button (if it exists)
    const quoteButton = messageDiv.querySelector('.quote-btn, [data-action="quote"]');
    if (quoteButton) {
        quoteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleQuoteMessage(message);
        });
    }
    // Reaction button - CRITICAL FIX: Directly call handleReaction
    const reactionButton = messageDiv.querySelector('.reaction-btn');
    if (reactionButton) {
        reactionButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('❤️ REACTION_BUTTON: Clicked for message:', messageId);
            // COMP METHOD: Check if reaction picker/modal exists
            const win = window;
            if (win.showReactionPicker && typeof win.showReactionPicker === 'function') {
                console.log('✅ REACTION_BUTTON: Using reaction picker modal');
                win.showReactionPicker(messageId, message, reactionButton);
            }
            else {
                console.log('⚠️ REACTION_BUTTON: No reaction picker, using direct toggle');
                // CRITICAL FIX: Directly call handleReaction
                await handleReaction(message);
            }
        });
    }
    // Bookmark button - CRITICAL FIX: Directly call handleBookmarkMessage
    const bookmarkButton = messageDiv.querySelector('.bookmark-btn');
    if (bookmarkButton) {
        bookmarkButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('🔖 Bookmark clicked for message:', messageId);
            await handleBookmarkMessage(message);
        });
    }
    // Repost button - CRITICAL FIX: Add missing click handler
    const repostButton = messageDiv.querySelector('.repost-btn');
    if (repostButton) {
        repostButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const handleRepostClick = window.handleRepostClick;
            if (typeof handleRepostClick === 'function') {
                await handleRepostClick(messageId, message);
            }
            else {
                console.log('🔄 Repost clicked for message:', messageId);
                // Fallback: implement basic repost
                await handleRepostMessage(message);
            }
        });
    }
    // Share button
    const shareButton = messageDiv.querySelector('.share-btn');
    if (shareButton) {
        shareButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const handleShareClick = window.handleShareClick;
            if (typeof handleShareClick === 'function') {
                await handleShareClick(messageId, message);
            }
            else {
                console.log('📤 Share clicked for message:', messageId);
                // Fallback: use existing handleShareMessage
                await handleShareMessage(message);
            }
        });
    }
    // Action menu (three dots) - ROOT CAUSE FIX: Proper toggle and positioning
    const actionDotsButton = messageDiv.querySelector('.action-dots-btn');
    if (actionDotsButton) {
        // Close other dropdowns first
        const closeOtherDropdowns = () => {
            document.querySelectorAll('.action-dropdown').forEach((dd) => {
                if (dd !== messageDiv.querySelector('.action-dropdown')) {
                    dd.style.display = 'none';
                }
            });
        };
        actionDotsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            closeOtherDropdowns();
            // Toggle dropdown - ROOT CAUSE FIX: Check computed style, not inline style
            const dropdown = messageDiv.querySelector('.action-dropdown');
            if (dropdown) {
                const computedStyle = window.getComputedStyle(dropdown);
                const isVisible = computedStyle.display !== 'none' && dropdown.style.display !== 'none';
                if (isVisible) {
                    dropdown.style.display = 'none';
                }
                else {
                    dropdown.style.display = 'block';
                    // ROOT CAUSE FIX: Position dropdown to stay on screen with proper viewport bounds checking
                    const buttonRect = actionDotsButton.getBoundingClientRect();
                    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                    // Ensure parent container has relative positioning
                    const actionsMenu = messageDiv.querySelector('.message-actions-menu');
                    if (actionsMenu) {
                        actionsMenu.style.position = 'relative';
                    }
                    // Reset positioning
                    dropdown.style.position = 'absolute';
                    dropdown.style.zIndex = '10000';
                    dropdown.style.right = '0';
                    dropdown.style.top = `${buttonRect.height + 5}px`;
                    dropdown.style.left = 'auto';
                    dropdown.style.bottom = 'auto';
                    // Temporarily show to measure dimensions
                    const wasVisible = dropdown.style.visibility !== 'hidden';
                    dropdown.style.visibility = 'hidden';
                    dropdown.style.display = 'block';
                    const dropdownRect = dropdown.getBoundingClientRect();
                    dropdown.style.visibility = wasVisible ? 'visible' : 'hidden';
                    // Calculate available space
                    const spaceBelow = viewportHeight - buttonRect.bottom;
                    const spaceAbove = buttonRect.top;
                    const spaceRight = viewportWidth - buttonRect.right;
                    const spaceLeft = buttonRect.left;
                    // Check if dropdown goes off bottom edge - show above if more space
                    if (dropdownRect.height > spaceBelow && spaceAbove > dropdownRect.height) {
                        dropdown.style.top = 'auto';
                        dropdown.style.bottom = `${buttonRect.height + 5}px`;
                    }
                    else if (dropdownRect.height > spaceBelow) {
                        // Doesn't fit below, try to fit in viewport
                        dropdown.style.top = `${-dropdownRect.height - 5}px`;
                    }
                    // Check if dropdown goes off right edge - ROOT CAUSE FIX: Better positioning logic
                    if (dropdownRect.width > spaceRight) {
                        // Try left side if there's more space
                        if (spaceLeft >= dropdownRect.width) {
                            dropdown.style.right = 'auto';
                            dropdown.style.left = '0';
                        }
                        else {
                            // Adjust to fit in viewport - position from right edge
                            const rightOffset = Math.max(10, viewportWidth - buttonRect.right - dropdownRect.width);
                            dropdown.style.right = `${rightOffset}px`;
                            dropdown.style.left = 'auto';
                        }
                    }
                    // Final check: ensure dropdown doesn't go off any edge
                    const finalRect = dropdown.getBoundingClientRect();
                    if (finalRect.left < 0) {
                        dropdown.style.left = '10px';
                        dropdown.style.right = 'auto';
                    }
                    if (finalRect.right > viewportWidth) {
                        dropdown.style.right = '10px';
                        dropdown.style.left = 'auto';
                    }
                    if (finalRect.top < 0) {
                        dropdown.style.top = '10px';
                        dropdown.style.bottom = 'auto';
                    }
                    if (finalRect.bottom > viewportHeight) {
                        dropdown.style.bottom = '10px';
                        dropdown.style.top = 'auto';
                    }
                }
            }
        });
        // ROOT CAUSE FIX: Close dropdown when clicking outside (use capture phase for better detection)
        const dropdownForClose = messageDiv.querySelector('.action-dropdown');
        if (dropdownForClose) {
            const closeDropdownHandler = (e) => {
                const target = e.target;
                if (!messageDiv.contains(target) && !dropdownForClose.contains(target)) {
                    dropdownForClose.style.display = 'none';
                }
            };
            // Use capture phase to catch clicks before they bubble
            document.addEventListener('click', closeDropdownHandler, true);
            // Store handler for cleanup if needed
            messageDiv._closeDropdownHandler = closeDropdownHandler;
        }
    }
    // Edit button - CRITICAL FIX: Directly call handleEditMessage
    const editButton = messageDiv.querySelector('.edit-btn');
    if (editButton) {
        editButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            // Close dropdown
            const dropdown = messageDiv.querySelector('.action-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
            console.log('✏️ Edit clicked for message:', messageId);
            await handleEditMessage(message);
        });
    }
    // Delete button - CRITICAL FIX: Directly call handleDeleteMessage
    const deleteButton = messageDiv.querySelector('.delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            // Close dropdown
            const dropdown = messageDiv.querySelector('.action-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
            console.log('🗑️ Delete clicked for message:', messageId);
            await handleDeleteMessage(message);
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
        const communityId = activeCommunities[0] || publicSquareUUID;
        const result = await messageSystemIntegration.loadFocusMode(pageId, message.parentId, { communityId });
        // Render in focus mode
        const container = getChatMessagesContainer();
        if (!container) {
            throw new Error('Chat messages container not found');
        }
        // Handle both return types: Message[] or { replies, parent }
        const messages = Array.isArray(result) ? result : result.replies || [];
        const parentMessage = Array.isArray(result) ? null : (result.parent || null);
        // CRITICAL FIX: Ensure all messages have communityId before rendering
        const messagesWithCommunityId = messages.map(msg => ({
            ...msg,
            communityId: msg.communityId || communityId
        }));
        await unifiedMessageDisplay.render(messagesWithCommunityId, container, {
            focusContext: 'child',
            parentMessage: parentMessage,
            highlightMessageId: message.id,
            onMessageClick: (msg) => {
                if (!msg.author)
                    return;
                const message = {
                    id: msg.id,
                    content: msg.content,
                    authorId: msg.author.id || '',
                    communityId: communityId,
                    parentId: msg.parentId || null,
                    author: msg.author,
                    createdAt: msg.createdAt,
                    updatedAt: msg.updatedAt
                };
                handleMessageFocus(message);
            },
            onReplyClick: async (msg) => {
                if (!msg.author)
                    return;
                const message = {
                    id: msg.id,
                    content: msg.content,
                    authorId: msg.author.id || '',
                    communityId: communityId,
                    parentId: msg.parentId || null,
                    author: msg.author,
                    createdAt: msg.createdAt,
                    updatedAt: msg.updatedAt
                };
                await handleReplyToMessage(message);
            },
            onFocusClick: (msg) => {
                if (!msg.author)
                    return;
                const message = {
                    id: msg.id,
                    content: msg.content,
                    authorId: msg.author.id || '',
                    communityId: communityId,
                    parentId: msg.parentId || null,
                    author: msg.author,
                    createdAt: msg.createdAt,
                    updatedAt: msg.updatedAt
                };
                handleMessageFocus(message);
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
    // COMP FIX: Don't load messages when visibility tab is active - visibility tab should only show visibility, not messages
    if (typeof document !== 'undefined') {
        const visibilityTab = document.getElementById('visibility-tab');
        if (visibilityTab && visibilityTab.classList.contains('active')) {
            console.log('⚠️ loadChatHistory: Skipping - visibility tab is active (should only refresh visibility, not load messages)');
            return;
        }
    }
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
        // ROOT CAUSE FIX: If rawUrl is still empty (e.g., we're in sidepanel), try to get active tab URL
        if (!rawUrl || rawUrl.includes('sidepanel') || rawUrl.startsWith('chrome-extension://') || rawUrl.startsWith('chrome://')) {
            // Try to get active tab URL as fallback
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                try {
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs && tabs.length > 0 && tabs[0].url) {
                        const tabUrl = tabs[0].url;
                        // Only use if it's a valid web page URL
                        if (tabUrl && !tabUrl.startsWith('chrome://') && !tabUrl.startsWith('chrome-extension://') && !tabUrl.includes('sidepanel')) {
                            console.log('📜 loadChatHistory: Using active tab URL as fallback:', tabUrl);
                            rawUrl = tabUrl;
                            // Update currentUrlData with the tab URL so future calls work
                            const normalizer = getNormalizeUrl();
                            if (normalizer) {
                                const normalized = await normalizer(tabUrl);
                                if (normalized) {
                                    stateManagerInstance.setState('currentUrlData', {
                                        rawUrl: tabUrl,
                                        pageId: normalized.pageId,
                                        normalizedUrl: normalized.normalizedUrl,
                                        canonicalUrl: normalized.canonicalUrl
                                    });
                                }
                            }
                        }
                    }
                }
                catch (error) {
                    console.warn('⚠️ loadChatHistory: Failed to get active tab URL:', error);
                }
            }
            // If still no valid URL, return early
            if (!rawUrl || rawUrl.includes('sidepanel') || rawUrl.startsWith('chrome-extension://') || rawUrl.startsWith('chrome://')) {
                console.warn('⚠️ loadChatHistory: No valid web page URL available (sidepanel URLs are not valid for message loading)');
                console.warn('⚠️ loadChatHistory: rawUrl was:', rawUrl);
                console.warn('⚠️ loadChatHistory: currentUrlData was:', getCurrentUrlData());
                return;
            }
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
            // ROOT CAUSE FIX: Validate that pageId is not a sidepanel pageId
            if (pageId.includes('_sidepanel_html') || pageId.includes('sidepanel')) {
                console.error('❌ loadChatHistory: currentUrlData contains sidepanel pageId:', pageId);
                console.error('❌ loadChatHistory: This should never happen - currentUrlData is corrupted');
                return;
            }
        }
        else {
            // ROOT CAUSE FIX: Get normalizeUrl from window (set by TabContextManager)
            const normalizer = getNormalizeUrl();
            if (normalizer) {
                normalizedUrlData = await normalizer(rawUrl);
                pageId = normalizedUrlData?.pageId || rawUrl;
                // ROOT CAUSE FIX: Validate normalized pageId is not a sidepanel pageId
                if (pageId.includes('_sidepanel_html') || pageId.includes('sidepanel')) {
                    console.error('❌ loadChatHistory: URL normalizer returned sidepanel pageId:', pageId);
                    console.error('❌ loadChatHistory: rawUrl was:', rawUrl);
                    return;
                }
            }
            else {
                pageId = rawUrl.replace(/https?:\/\//, '').replace(/\//g, '_').replace(/\./g, '_');
                // ROOT CAUSE FIX: Validate generated pageId is not a sidepanel pageId
                if (pageId.includes('_sidepanel_html') || pageId.includes('sidepanel')) {
                    console.error('❌ loadChatHistory: Generated pageId is sidepanel pageId:', pageId);
                    console.error('❌ loadChatHistory: rawUrl was:', rawUrl);
                    return;
                }
            }
        }
        console.log('📜 loadChatHistory: Loading messages for page:', pageId, 'communities:', activeCommunities);
        // Get chat messages container
        const chatMessages = getChatMessagesContainer();
        if (!chatMessages) {
            console.warn('⚠️ loadChatHistory: Chat messages container not found');
            return;
        }
        // ROOT CAUSE FIX: Auto-initialize message system if not initialized
        if (!messageSystemIntegration || !unifiedMessageDisplay) {
            console.warn('⚠️ loadChatHistory: New message system not initialized, initializing now...');
            try {
                await initializeNewMessageSystem();
                if (!messageSystemIntegration || !unifiedMessageDisplay) {
                    console.error('❌ loadChatHistory: Failed to initialize message system');
                    throw new Error('Message system initialization failed');
                }
                console.log('✅ loadChatHistory: Message system initialized successfully');
            }
            catch (error) {
                console.error('❌ loadChatHistory: Error initializing message system:', error);
                throw new Error(`Message system initialization failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        console.log('📜 loadChatHistory: Loading messages with new message system');
        const communityId = activeCommunities[0] || publicSquareUUID;
        // ROOT CAUSE FIX: Mark as initial load to prevent onMessageUpdate from adding messages
        const win = window;
        win.isInitialMessageLoad = true;
        win.initialMessageLoadComplete = false;
        // ROOT CAUSE FIX: Use actual pageId from currentUrlData (not normalizedUrl)
        // pageId is the normalized identifier (e.g., "google_com_"), normalizedUrl is human-readable (e.g., "google.com/")
        // Messages are stored with pageId, so we must use pageId for queries
        console.log('📜 loadChatHistory: Using pageId:', pageId, 'normalizedUrl:', normalizedUrlData?.normalizedUrl);
        const messages = await messageSystemIntegration.loadDefaultView(pageId, {
            limit: 10,
            communityId
        });
        // ROOT CAUSE FIX: Mark initial load as complete AFTER getting messages but BEFORE rendering
        // This prevents onMessageUpdate from interfering
        // BUT: Only mark complete if we actually have messages to render
        if (messages.length > 0) {
            win.initialMessageLoadComplete = true;
        }
        // CRITICAL FIX: Check ALL containers for existing messages to prevent duplicates
        const allChatContainers = document.querySelectorAll('.chat-messages');
        const existingMessageIds = new Set();
        allChatContainers.forEach(cont => {
            const actualMessages = Array.from(cont.querySelectorAll('.message, [data-message-id]')).filter(el => {
                return el.classList.contains('message') ||
                    el.querySelector('.message-content-wrapper') !== null ||
                    (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
            });
            actualMessages.forEach(el => {
                const id = el.getAttribute('data-message-id');
                if (id)
                    existingMessageIds.add(id);
            });
        });
        const newMessages = messages.filter(msg => !existingMessageIds.has(msg.id));
        if (newMessages.length === 0 && messages.length > 0) {
            console.log(`⚠️ loadChatHistory: All ${messages.length} messages already rendered, skipping render call`);
        }
        else {
            // CRITICAL FIX: Ensure all messages have communityId before rendering
            const messagesWithCommunityId = messages.map(msg => ({
                ...msg,
                communityId: msg.communityId || communityId
            }));
            // Render using UnifiedMessageDisplay
            await unifiedMessageDisplay.render(messagesWithCommunityId, chatMessages, {
                focusContext: 'default',
                onMessageClick: (message) => {
                    if (!message.author)
                        return;
                    // Convert MessageStoreMessage to Message for handleMessageFocus
                    const msg = {
                        id: message.id,
                        content: message.content,
                        authorId: message.author.id || '',
                        communityId: communityId,
                        parentId: message.parentId || null,
                        author: message.author,
                        createdAt: message.createdAt,
                        updatedAt: message.updatedAt
                    };
                    handleMessageFocus(msg);
                },
                onFocusClick: (message) => {
                    if (!message.author)
                        return;
                    // CRITICAL FIX: onFocusClick should trigger focus mode
                    const msg = {
                        id: message.id,
                        content: message.content,
                        authorId: message.author.id || '',
                        communityId: communityId,
                        parentId: message.parentId || null,
                        author: message.author,
                        createdAt: message.createdAt,
                        updatedAt: message.updatedAt
                    };
                    handleMessageFocus(msg);
                },
                onReplyClick: async (message) => {
                    if (!message.author)
                        return;
                    const msg = {
                        id: message.id,
                        content: message.content,
                        authorId: message.author.id || '',
                        communityId: communityId,
                        parentId: message.parentId || null,
                        author: message.author,
                        createdAt: message.createdAt,
                        updatedAt: message.updatedAt
                    };
                    await handleReplyToMessage(msg);
                }
            });
        }
        // ROOT CAUSE FIX: Mark initial load as complete after rendering
        const win2 = window;
        win2.isInitialMessageLoad = false;
        // Store messages in cache
        // Remove duplicates before storing
        const seenIds = new Set();
        const cachedMessages = messages
            .filter((msg) => {
            if (!msg.author || !msg.author.id)
                return false;
            if (seenIds.has(msg.id)) {
                console.warn(`⚠️ loadChatHistory: Duplicate message ID in API response: ${msg.id}`);
                return false;
            }
            seenIds.add(msg.id);
            return true;
        })
            .map((msg) => ({
            id: msg.id,
            content: msg.content,
            authorId: msg.author.id || '',
            communityId: communityId,
            parentId: msg.parentId || null,
            author: msg.author,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
        }));
        setCurrentChatData(cachedMessages);
        console.log(`✅ loadChatHistory: Successfully loaded ${cachedMessages.length} unique messages`);
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
async function getMessageActionMenu(message, canEdit, canDelete) {
    const now = new Date();
    const messageDate = new Date(message.createdAt || '');
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    // CRITICAL FIX: Use passed canEdit/canDelete if provided, otherwise calculate
    let finalCanEdit;
    let finalCanDelete;
    if (canEdit !== undefined && canDelete !== undefined) {
        // Use passed values (from UnifiedMessageRenderer)
        finalCanEdit = canEdit;
        finalCanDelete = canDelete;
    }
    else {
        // Calculate from message (fallback for direct calls)
        const currentUser = getCurrentUser();
        let isOwner = false;
        // CRITICAL FIX: Check multiple ways to identify ownership
        if (currentUser) {
            // Check by email
            const authorEmail = message.authorEmail || (message.author && message.author.email);
            if (authorEmail && currentUser.email && authorEmail === currentUser.email) {
                isOwner = true;
            }
            // Check by ID (Google ID or UUID)
            const authorId = message.authorId || (message.author && message.author.id);
            if (!isOwner && authorId && currentUser.id && (authorId === currentUser.id || String(authorId) === String(currentUser.id))) {
                isOwner = true;
            }
            // Check by handle
            const authorHandle = (message.author && message.author.handle) || message.authorHandle;
            const currentHandle = currentUser.handle || currentUser.email?.split('@')[0];
            if (!isOwner && authorHandle && currentHandle && authorHandle === currentHandle) {
                isOwner = true;
            }
        }
        finalCanEdit = isOwner && diffHours < 1; // Can edit within 1 hour
        finalCanDelete = isOwner; // User can only delete their own messages
        console.log('🔍 getMessageActionMenu: Ownership check', {
            messageId: message.id,
            currentUser: currentUser?.email || currentUser?.id,
            authorEmail: message.authorEmail || (message.author && message.author.email),
            authorId: message.authorId || (message.author && message.author.id),
            isOwner,
            finalCanEdit,
            finalCanDelete
        });
    }
    const silentEdit = diffMinutes <= 5; // Silent edit within 5 minutes
    // Get current theme for background color
    const currentTheme = document.body.getAttribute('data-theme') ||
        document.documentElement.getAttribute('data-theme') ||
        'light';
    const dropdownBg = currentTheme === 'dark'
        ? 'var(--surface-primary, #1f1f1f)'
        : 'var(--surface-primary, #ffffff)';
    const dropdownColor = currentTheme === 'dark'
        ? 'var(--text-primary, #ffffff)'
        : 'var(--text-primary, #000000)';
    // ROOT CAUSE FIX: Ensure background is never transparent - use explicit color values
    // dropdownBg is already set to var(--surface-primary) with fallback, so it should never be transparent
    // But add explicit fallback just in case
    const safeDropdownBg = currentTheme === 'dark' ? '#1f1f1f' : '#ffffff';
    const safeDropdownColor = currentTheme === 'dark' ? '#ffffff' : '#000000';
    return `
    <div class="message-actions-menu" style="opacity: 1 !important; display: inline-block !important; visibility: visible !important; position: relative !important; background: var(--surface-primary);">
      <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions" style="opacity: 1 !important; display: block !important; visibility: visible !important; background: none !important; border: none !important; padding: 0 !important; margin: 0 !important;">
        ${typeof window !== 'undefined' && window.XIcons ? window.XIcons.more({ width: 20, height: 20 }) : '<span class="action-dots" style="opacity: 1 !important; display: inline-block !important; visibility: visible !important; font-size: 16px !important; color: var(--text-secondary) !important; background: none !important;">⋯</span>'}
      </button>
      <div class="action-dropdown" style="display: none; background: ${safeDropdownBg} !important; color: ${safeDropdownColor} !important; border: 1px solid var(--border-color, ${currentTheme === 'dark' ? '#333' : '#ddd'}) !important; border-radius: 8px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;">
        ${finalCanEdit ? `<button class="action-item edit-btn" data-message-id="${message.id}">✏️ Edit</button>` : ''}
        ${finalCanDelete ? `<button class="action-item delete-btn" data-message-id="${message.id}">🗑️ Delete</button>` : ''}
        <button class="action-item flag-btn" data-message-id="${message.id}" disabled>🚩 Flag</button>
      </div>
    </div>
  `;
}
/**
 * Handle reply to message
 * Uses UnifiedMessageModal exclusively
 */
async function handleReplyToMessage(message) {
    // Get current page ID
    const urlData = getCurrentUrlData();
    const pageId = urlData?.pageId || getCurrentLocationHref();
    if (!pageId) {
        console.error('❌ handleReplyToMessage: No pageId available');
        return;
    }
    // CRITICAL FIX: Sanitize message ID to remove any ::UUID suffix
    const sanitizeId = (id) => {
        if (!id)
            return null;
        return id.replace(/::UUID$/i, '').trim();
    };
    // Create sanitized message copy
    const sanitizedMessage = {
        ...message,
        id: sanitizeId(message.id) || message.id,
        parentId: sanitizeId(message.parentId) || message.parentId || null
    };
    // Use UnifiedMessageModal
    const win = window;
    if (!win.openReplyModal || typeof win.openReplyModal !== 'function') {
        console.error('❌ handleReplyToMessage: UnifiedMessageModal not available');
        return;
    }
    try {
        await win.openReplyModal(sanitizedMessage, pageId);
    }
    catch (error) {
        console.error('❌ handleReplyToMessage: Error opening reply modal:', error);
        const showNotification = window.showNotification;
        if (typeof window !== 'undefined' && showNotification) {
            showNotification('Failed to open reply modal. Please try again.');
        }
    }
}
/**
 * Handle quote message
 * Opens UnifiedMessageModal in quote mode
 */
async function handleQuoteMessage(message) {
    // Get current page ID
    const urlData = getCurrentUrlData();
    const pageId = urlData?.pageId || getCurrentLocationHref();
    if (!pageId) {
        console.error('❌ handleQuoteMessage: No pageId available');
        return;
    }
    // Use UnifiedMessageModal
    const win = window;
    // CRITICAL FIX: Sanitize message ID to remove any ::UUID suffix
    const sanitizeId = (id) => {
        if (!id)
            return null;
        return id.replace(/::UUID$/i, '').trim();
    };
    // Create sanitized message copy
    const sanitizedMessage = {
        ...message,
        id: sanitizeId(message.id) || message.id,
        parentId: sanitizeId(message.parentId) || message.parentId || null
    };
    const sanitizedQuoteId = sanitizeId(message.id) || message.id;
    if (!win.openQuoteModal || typeof win.openQuoteModal !== 'function') {
        console.error('❌ handleQuoteMessage: UnifiedMessageModal not available');
        // CRITICAL FIX: Try alternative - use openMessageModal directly
        const unifiedMessageModal = win.unifiedMessageModal;
        if (unifiedMessageModal && typeof unifiedMessageModal.open === 'function') {
            try {
                await unifiedMessageModal.open({
                    mode: 'quote',
                    pageId,
                    quoteId: sanitizedQuoteId,
                    communityId: message.communityId
                });
                return;
            }
            catch (error) {
                console.error('❌ handleQuoteMessage: Failed to open quote modal:', error);
                const showNotification = window.showNotification;
                if (typeof window !== 'undefined' && showNotification) {
                    showNotification('Failed to open quote modal. Please try again.');
                }
            }
        }
        else {
            console.error('❌ handleQuoteMessage: Neither openQuoteModal nor unifiedMessageModal available');
        }
        return;
    }
    try {
        await win.openQuoteModal(sanitizedMessage, pageId);
    }
    catch (error) {
        console.error('❌ handleQuoteMessage: Error opening quote modal:', error);
        // CRITICAL FIX: Show user-friendly error
        const showNotification = window.showNotification;
        if (typeof window !== 'undefined' && showNotification) {
            showNotification('Failed to open quote modal. Please try again.');
        }
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
        // All message IDs should be UUIDs
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.id);
        if (!isUUID) {
            console.error('❌ handleDeleteMessage: Invalid message ID format (expected UUID):', message.id);
            return;
        }
        // Use robustIntegration for deletion
        const robustIntegration = getWindowFunction('robustIntegration');
        if (robustIntegration?.isInitialized && robustIntegration.deleteMessage) {
            await robustIntegration.deleteMessage(message.id);
        }
        else {
            throw new Error('Robust integration not available for message deletion');
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
                // Use robust integration
                const robustIntegration = window.robustIntegration;
                if (typeof window !== 'undefined' && robustIntegration && robustIntegration.isInitialized && robustIntegration.editMessage) {
                    await robustIntegration.editMessage(message.id, newContent);
                }
                else {
                    throw new Error('Robust integration not available for message editing');
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
    // No fallback - robust integration is required
    console.error('❌ SUPABASE_MESSAGE: Robust integration not available');
    return null;
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
 * Handle repost message
 * Creates a repost of the message
 */
async function handleRepostMessage(message) {
    console.log(`🔄 REPOST: Reposting message ${message.id}`);
    try {
        const urlData = getCurrentUrlData();
        const pageId = urlData?.pageId || getCurrentLocationHref();
        const communityId = message.communityId || getActiveCommunities()[0];
        if (!pageId || !communityId) {
            console.error('❌ handleRepostMessage: Missing pageId or communityId');
            return;
        }
        // Use UnifiedMessageModal to create repost
        const win = window;
        // Try repost modal first, fallback to quote modal
        if (win.openRepostModal && typeof win.openRepostModal === 'function') {
            await win.openRepostModal(message, pageId, communityId);
        }
        else if (win.openQuoteModal && typeof win.openQuoteModal === 'function') {
            // Use quote modal as repost (similar functionality)
            await win.openQuoteModal(message, pageId);
        }
        else {
            console.error('❌ handleRepostMessage: UnifiedMessageModal not available');
            const showNotification = window.showNotification;
            if (typeof window !== 'undefined' && showNotification) {
                showNotification('Repost functionality not available');
            }
        }
    }
    catch (error) {
        console.error('❌ handleRepostMessage: Failed to repost message:', error);
        const showNotification = window.showNotification;
        if (typeof window !== 'undefined' && showNotification) {
            showNotification('Failed to repost message');
        }
    }
}
/**
 * Handle bookmark message
 * Toggles bookmark status
 */
async function handleBookmarkMessage(message) {
    console.log(`🔖 BOOKMARK: Toggling bookmark for message ${message.id}`);
    try {
        const api = getApi();
        if (!api) {
            console.error('❌ handleBookmarkMessage: API not available');
            return;
        }
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.error('❌ handleBookmarkMessage: User not authenticated');
            return;
        }
        const isBookmarked = message.isBookmarked || false;
        // COMP METHOD: Use /v1/bookmarks/toggle endpoint (matches backend route registration)
        const endpoint = '/v1/bookmarks/toggle';
        const method = 'POST';
        const response = await api.request(endpoint, {
            method,
            body: { messageId: message.id }
        });
        if (response.data?.success) {
            const newBookmarkStatus = response.data.isBookmarked ?? !isBookmarked;
            const action = response.data.action || (newBookmarkStatus ? 'added' : 'removed');
            // CRITICAL FIX: Update message bookmark status in ALL containers
            const allChatContainers = document.querySelectorAll('.chat-messages');
            allChatContainers.forEach(chatContainer => {
                const messageDiv = chatContainer.querySelector(`[data-message-id="${message.id}"]`);
                if (messageDiv) {
                    const bookmarkButton = messageDiv.querySelector('.bookmark-btn');
                    if (bookmarkButton) {
                        bookmarkButton.classList.toggle('active', newBookmarkStatus);
                        bookmarkButton.setAttribute('data-is-bookmarked', newBookmarkStatus.toString());
                        // Update bookmark count if present
                        const bookmarkCount = bookmarkButton.querySelector('.icon-count');
                        if (bookmarkCount && response.data && response.data.count !== undefined) {
                            const count = response.data.count;
                            bookmarkCount.textContent = count > 0 ? count.toString() : '';
                            bookmarkCount.style.display = count > 0 ? 'inline' : 'none';
                        }
                    }
                }
            });
            const showNotification = window.showNotification;
            if (typeof window !== 'undefined' && showNotification) {
                showNotification(newBookmarkStatus ? 'Message bookmarked' : 'Bookmark removed');
            }
            console.log(`✅ BOOKMARK: ${action === 'added' ? 'Added' : 'Removed'} bookmark for message ${message.id}`);
        }
        else {
            throw new Error(response.error || 'Failed to toggle bookmark');
        }
    }
    catch (error) {
        console.error('❌ handleBookmarkMessage: Failed to toggle bookmark:', error);
        const showNotification = window.showNotification;
        if (typeof window !== 'undefined' && showNotification) {
            showNotification('Failed to toggle bookmark');
        }
    }
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
            // COMP METHOD: Show toast notification using NotificationManager's showToastNotification
            // Try notificationManager first, then fallback to simple toast
            const win = window;
            if (win.notificationManager && typeof win.notificationManager.showToastNotification === 'function') {
                win.notificationManager.showToastNotification('Message link copied to clipboard!');
            }
            else if (win.showNotification && typeof win.showNotification === 'function') {
                win.showNotification('Message link copied to clipboard!');
            }
            else {
                // COMP METHOD: Fallback - create simple toast notification
                const toast = document.createElement('div');
                toast.textContent = 'Message link copied to clipboard!';
                toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #007bff; color: white; padding: 12px 16px; border-radius: 6px; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
                document.body.appendChild(toast);
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 3000);
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
 * Uses UnifiedMessageModal for replies
 */
async function handleStartThread(message) {
    console.log(`🧵 THREAD: Starting new thread from message: ${message.id}`);
    const uiManager = window.uiManager;
    if (typeof window !== 'undefined' && uiManager && typeof uiManager.switchTab === 'function') {
        uiManager.switchTab('discuss-tab');
    }
    // Use UnifiedMessageModal for reply
    await handleReplyToMessage(message);
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
 * COMP METHOD: Matches original implementation - uses reactionsIntegration if available, API fallback for Google ID conversion
 */
async function handleReaction(message) {
    console.log(`❤️ REACTION: Handling reaction for message: ${message.id}`);
    const reactionsIntegration = window.reactionsIntegration;
    if (typeof window !== 'undefined' && reactionsIntegration && reactionsIntegration.reactionsManager) {
        await reactionsIntegration.reactionsManager.addReaction(message.id, '👍');
    }
    else {
        // COMP METHOD: Fallback to API endpoint (handles Google ID to UUID conversion)
        console.warn('⚠️ REACTION: Reactions integration not available, using API endpoint');
        try {
            const api = getApi();
            if (!api) {
                console.error('❌ handleReaction: API not available');
                return;
            }
            const currentUser = getCurrentUser();
            if (!currentUser) {
                console.error('❌ handleReaction: User not authenticated');
                return;
            }
            // COMP METHOD: Use /v1/reactions endpoint (matches backend route registration)
            // GET endpoint: /v1/reactions/:messageId
            // POST endpoint: /v1/reactions (with {messageId, emoji} in body)
            const getEndpoint = `/v1/reactions/${message.id}`;
            // Check existing reactions via API
            // API returns { success: true, reactions: [...] } - extract reactions array
            const response = await api.request(getEndpoint, { method: 'GET' });
            const existingReactions = response.data?.reactions || [];
            // CRITICAL FIX: The API returns reactions with user_id as UUID (converted from Google ID)
            // We need to check if the current user has already reacted
            // The API endpoint POST /v1/reactions will toggle: add if not exists, remove if exists
            // So we can just POST to toggle, but let's check first to show correct state
            const userReaction = Array.isArray(existingReactions)
                ? existingReactions.find((r) => {
                    // Check if this reaction is from the current user
                    // The API converts Google ID to UUID, so user_id in response is UUID
                    // But currentUser.id might be Google ID, so we can't directly match
                    // Instead, we'll check if there are any 👍 reactions (the emoji we're using)
                    // The POST endpoint will handle the actual toggle logic
                    return r.emoji === '👍';
                })
                : null;
            // CRITICAL FIX: Use POST /v1/reactions which toggles the reaction
            // If user already reacted, it removes; if not, it adds
            const postEndpoint = '/v1/reactions';
            const toggleResponse = await api.request(postEndpoint, {
                method: 'POST',
                body: { messageId: message.id, emoji: '👍' }
            });
            if (toggleResponse.data?.success) {
                const action = toggleResponse.data.action || (userReaction ? 'removed' : 'added');
                console.log(`✅ REACTION: ${action === 'added' ? 'Added' : 'Removed'} reaction`);
            }
            else {
                console.error('❌ handleReaction: Error toggling reaction:', toggleResponse.error);
                console.error('❌ handleReaction: Response:', toggleResponse);
            }
            // CRITICAL FIX: Always reload reactions display after toggle
            const loadMessageReactionsFn = getWindowFunction('loadMessageReactions');
            if (loadMessageReactionsFn) {
                try {
                    await loadMessageReactionsFn(message.id);
                    console.log('✅ REACTION: Reloaded reactions display');
                }
                catch (error) {
                    console.error('❌ handleReaction: Failed to reload reactions display:', error);
                    // Fallback: Manually update reaction count based on action
                    const action = toggleResponse.data?.action;
                    const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
                    if (messageDiv) {
                        const reactionButton = messageDiv.querySelector('.reaction-btn');
                        if (reactionButton) {
                            const countElement = reactionButton.querySelector('.icon-count');
                            if (countElement) {
                                const currentCount = parseInt(countElement.textContent || '0', 10);
                                const newCount = action === 'removed' ? Math.max(0, currentCount - 1) : currentCount + 1;
                                countElement.textContent = newCount > 0 ? newCount.toString() : '';
                                countElement.style.display = newCount > 0 ? 'inline-block' : 'none';
                            }
                        }
                    }
                }
            }
            else {
                console.warn('⚠️ handleReaction: loadMessageReactions not available, manually updating UI');
                // Fallback: Manually update reaction count based on action
                const action = toggleResponse.data?.action;
                const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
                if (messageDiv) {
                    const reactionButton = messageDiv.querySelector('.reaction-btn');
                    if (reactionButton) {
                        const countElement = reactionButton.querySelector('.icon-count');
                        if (countElement) {
                            const currentCount = parseInt(countElement.textContent || '0', 10);
                            const newCount = action === 'removed' ? Math.max(0, currentCount - 1) : currentCount + 1;
                            countElement.textContent = newCount > 0 ? newCount.toString() : '';
                            countElement.style.display = newCount > 0 ? 'inline-block' : 'none';
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('❌ handleReaction: Failed to toggle reaction:', error);
        }
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
    // ROOT CAUSE FIX: Click handler to open UnifiedMessageModal
    // Wait for openMessageModal to be available (retry mechanism)
    const attachClickHandler = async () => {
        const win = window;
        // Try to get openMessageModal, with retry
        let openModal = win.openMessageModal;
        if (!openModal && win.unifiedMessageModal && typeof win.unifiedMessageModal.open === 'function') {
            // Fallback: use unifiedMessageModal directly
            openModal = (options) => win.unifiedMessageModal.open(options);
        }
        if (!openModal) {
            // Retry after a short delay
            console.log('💬 MESSAGE_INPUT: openMessageModal not yet available, retrying...');
            setTimeout(attachClickHandler, 500);
            return;
        }
        chatTextarea.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentUrlData = win.stateManagerInstance?.getState('currentUrlData');
            const activeCommunities = win.stateManagerInstance?.getState('ui.activeCommunities');
            const pageId = currentUrlData?.pageId || '';
            const communityId = activeCommunities?.[0];
            console.log('💬 MESSAGE_INPUT: Opening UnifiedMessageModal for new message');
            await openModal({
                mode: 'new',
                pageId,
                communityId
            });
        }, { once: false });
        chatTextarea.dataset.listenersAttached = 'true';
        console.log('✅ MESSAGE_INPUT: Click handler attached to chat-textarea');
    };
    // Start attaching handler
    attachClickHandler();
    // Remove auto-resize since it's now readonly and single row
    // Remove Enter key handler since it's readonly
    // Remove send button handler since input is readonly
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
    // Only handle editing here
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
            // Handle new message only (replies now use UnifiedMessageModal)
            const sendMessageViaSupabase = window.sendMessageViaSupabase;
            if (typeof window !== 'undefined' && sendMessageViaSupabase) {
                const messageData = await sendMessageViaSupabase(content, null, null);
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
const attachWindowIntegrations = () => {
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
    win.handleReplyToMessage = handleReplyToMessage;
    win.handleQuoteMessage = handleQuoteMessage;
    win.handleRepostMessage = handleRepostMessage;
    win.handleBookmarkMessage = handleBookmarkMessage;
    win.handleShareMessage = handleShareMessage;
    win.handleReactionClick = async (messageId, message) => {
        await handleReaction(message);
    };
    win.handleBookmarkClick = async (messageId, message) => {
        await handleBookmarkMessage(message);
    };
    win.handleShareClick = async (messageId, message) => {
        await handleShareMessage(message);
    };
    win.handleRepostClick = async (messageId, message) => {
        await handleRepostMessage(message);
    };
    win.handleReplyClick = async (messageId, message) => {
        await handleReplyToMessage(message);
    };
};
attachWindowIntegrations();
// ES6 module exports
export { CanopiModule, addMessageToChat, createUnifiedMessageElement, updateReactionDisplay, addMessageActionListeners, loadMessageReactions, handleMessageFocus, loadChatHistory, // CRITICAL: Export for module imports
updateMessageInChat, removeMessageFromChat, getSenderName, convertUrlsToLinks, formatMessageTime, getSenderInitial, canUserEditMessage, checkAndAddThreadToggle, toggleThreadReplies, sendMessageViaSupabase, getSenderAvatar, handleShareMessage, handleStartThread, handleCopyLink, focusOnMessage, parseMessageUrl, handleIncomingMessageUrl, handleBackNavigation, handleReaction, setupMessageInputEventListeners, sendChatMessage, handleReplyToMessage, handleQuoteMessage, handleRepostMessage, handleBookmarkMessage };
// Also export as default object for convenience
export default {
    CanopiModule,
    addMessageToChat,
    createUnifiedMessageElement,
    updateReactionDisplay,
    addMessageActionListeners,
    loadMessageReactions,
    handleMessageFocus,
    loadChatHistory,
    setupMessageInputEventListeners
};
console.log('✅ CanopiModule TypeScript fully migrated and loaded');
// CRITICAL FIX: Setup message input event listeners when module loads
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupMessageInputEventListeners();
        });
    }
    else {
        // DOM already ready, setup immediately
        setupMessageInputEventListeners();
    }
    // Also export to window for manual initialization if needed
    const win = window;
    win.setupMessageInputEventListeners = setupMessageInputEventListeners;
}
