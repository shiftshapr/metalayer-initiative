import { MessageLoader } from '../components/MessageLoader.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { stateManagerInstance, setActiveCommunitiesState } from '../core/StateManager.js';
import { ensureMessageContent, formatAuthorName, formatUserHandle } from '../utils/Fallbacks.js';
import { initializeMessageSystemIntegration } from './MessageSystemIntegration.js';
import { UnifiedMessageDisplay } from '../components/UnifiedMessageDisplay.js';
import { UnifiedMessageRenderer } from '../utils/UnifiedMessageRenderer.js';
// REMOVED: VisibilityModule and UserResolutionService don't exist
// Using direct state checks and DOM queries instead
import { normalizeUrl } from '../utils/UrlNormalization.js';
import { convertUrlsToLinksSafely } from '../utils/HtmlSanitizer.js';
import { handleModuleError } from '../utils/ErrorHandlingPolicy.js';
import { Logger } from '../utils/Logger.js';
// Removed: BackendHealthService import - messages load from Supabase, not API backend
// Backend health check should not block Supabase operations
// Module-level state (ES6 module pattern - no window globals)
let isLoadingChatHistory = false;
let isInitialMessageLoad = false;
let initialMessageLoadComplete = false;
// Helper to get window functions (set by other modules)
// Returns unknown to force type checking at call sites
const getWindowFunction = (name) => {
    if (typeof window === 'undefined')
        return undefined;
    return window[name];
};
// Helper to get API instance (TypeScript migration - use module import)
import { apiServiceInstance } from '../services/APIService.js';
const getApi = () => {
    // TypeScript migration: Use module import instead of window.api
    return apiServiceInstance;
};
const handleMessagesModuleError = (error, policy) => {
    return handleModuleError(error, {
        ...policy,
        component: 'MessagesModule',
        severity: policy.severity ?? 'recoverable'
    });
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
const toCommunityIdArray = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }
    const unique = new Set();
    value.forEach(item => {
        if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed.length > 0) {
                unique.add(trimmed);
            }
        }
    });
    return Array.from(unique);
};
const getActiveCommunities = () => {
    const uiCommunities = toCommunityIdArray(stateManagerInstance.getState('ui.activeCommunities'));
    if (uiCommunities.length > 0) {
        return uiCommunities;
    }
    const legacyCommunities = toCommunityIdArray(stateManagerInstance.getState('activeCommunities'));
    if (legacyCommunities.length > 0) {
        return legacyCommunities;
    }
    if (typeof window !== 'undefined') {
        if (Array.isArray(window.activeCommunities) && window.activeCommunities.length > 0) {
            return toCommunityIdArray(window.activeCommunities);
        }
        if (typeof window.getState === 'function') {
            const windowState = window.getState('ui.activeCommunities');
            const fallback = toCommunityIdArray(windowState);
            if (fallback.length > 0) {
                return fallback;
            }
        }
    }
    return [];
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
// REMOVED: Visibility functions moved to VisibilityModule
// Use visibilityModuleInstance.getCurrentVisibilityData() instead
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
            Logger.warn('⚠️ initializeNewMessageSystem: Supabase client not available', null, 'messages');
            return;
        }
        if (!messageLoaderInstance) {
            messageLoaderInstance = new MessageLoader();
            Logger.debug('✅ initializeNewMessageSystem: MessageLoader instance created', null, 'messages');
        }
        // ROOT CAUSE FIX: Track if we're in initial load to prevent duplicate processing
        // Note: Variables removed - will be re-added when needed for duplicate processing prevention
        // Initialize integration
        messageSystemIntegration = await initializeMessageSystemIntegration({
            supabaseClient: supabase,
            messageLoader: messageLoaderInstance,
            onMessageUpdate: (messages) => {
                // ROOT CAUSE FIX: During initial load, skip onMessageUpdate callback
                // Messages will be rendered via loadChatHistory's render() call
                // BUT: Always process NEW messages (replies/quotes) even during initial load
                const isInitialLoad = isInitialMessageLoad && !initialMessageLoadComplete;
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
                        Logger.debug('🔍 onMessageUpdate: Skipping during initial load', { messageCount: messages.length }, 'messages');
                        return;
                    }
                    // If initial load BUT has new messages, process them (replies/quotes from real-time)
                    if (isInitialLoad && hasNewMessages) {
                        Logger.debug('🔍 onMessageUpdate: Initial load but new messages detected, processing them', { newCount: messages.filter(m => !existingIds.has(m.id)).length }, 'messages');
                    }
                }
                else if (isInitialLoad) {
                    Logger.debug('🔍 onMessageUpdate: Skipping during initial load (container not ready)', null, 'messages');
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
                    Logger.debug('🔍 onMessageUpdate: Adding new messages', { newCount: newMessages.length, totalCount: messages.length, existingCount: existingIds.size }, 'messages');
                    // Add new messages via addMessageToChat (which has duplicate checks)
                    newMessages.forEach(msg => {
                        const addMessageFn = getWindowFunction('addMessageToChat');
                        if (addMessageFn && typeof addMessageFn === 'function') {
                            addMessageFn(msg);
                        }
                    });
                }
                else {
                    Logger.debug('🔍 onMessageUpdate: All messages already in DOM, skipping update', { messageCount: messages.length }, 'messages');
                }
            },
            onError: (error) => {
                Logger.error('❌ MessageSystemIntegration error', error, 'messages');
                const showNotification = getWindowFunction('showNotification');
                if (showNotification && typeof showNotification === 'function') {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    showNotification(`Error loading messages: ${errorMessage}`);
                }
            },
            showNotification: getWindowFunction('showNotification') || ((msg) => Logger.debug('📢', { msg }, 'messages'))
        });
        // Create UnifiedMessageDisplay instance
        unifiedMessageDisplay = new UnifiedMessageDisplay();
        Logger.info('New message system initialized', null, 'messages');
    }
    catch (error) {
        handleModuleError(error, {
            component: 'MessagesModule',
            operation: 'initializeMessageSystem',
            severity: 'fatal',
            rethrow: true
        });
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
    const authorObj = authorSource && typeof authorSource === 'object' ? authorSource : null;
    return {
        id: authorObj?.id || authorId || 'unknown-user',
        name: formatAuthorName(authorObj),
        handle: formatUserHandle(authorObj),
        email: authorObj?.email,
        avatarUrl: authorObj?.avatarUrl,
        auraColor: authorObj?.auraColor || AVATAR_FALLBACK_COLOR
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
    try {
        const isReply = !!message.parentId;
        const isFocusMode = isFocusModeContainer(chatContainer);
        // ROOT CAUSE FIX: Calculate permissions and format time properly
        const currentUser = getCurrentUser();
        // UUID ONLY - no email matching
        const isOwner = currentUser && (currentUser.id === message.authorId ||
            currentUser.id === message.author?.id);
        const messageTime = new Date(message.createdAt || '');
        const diffHours = (Date.now() - messageTime.getTime()) / (1000 * 60 * 60);
        const canEdit = Boolean(isOwner && diffHours < 1); // Can edit within 1 hour
        const canDelete = Boolean(isOwner); // User can only delete their own messages
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
            Logger.error('❌ renderMessageElement: formattedTime is not a string!', { type: typeof formattedTime, value: formattedTime }, 'messages');
        }
        // Use UnifiedMessageRenderer directly (imported, no window dependency)
        if (UnifiedMessageRenderer && typeof UnifiedMessageRenderer.generateMessageHTML === 'function') {
            // ROOT CAUSE FIX: UnifiedMessageRenderer should import getMessageActionMenu directly
            // No window assignment needed - ES6 module pattern
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
                    if (communities && typeof communities === 'object' && message.communityId && typeof message.communityId === 'string') {
                        const communitiesRecord = communities;
                        const community = communitiesRecord[message.communityId];
                        if (community && typeof community === 'object' && 'name' in community) {
                            communityName = typeof community.name === 'string' ? community.name : '';
                        }
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
                Logger.warn('⚠️ renderMessageElement: Message missing icons or info', { messageId: message.id, hasIcons: !!hasIcons, hasInfo: !!hasInfo }, 'messages');
                Logger.debug('🔍 renderMessageElement: Generated HTML', { length: html.length, preview: html.substring(0, 200) }, 'messages');
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
        if (createUnifiedMessageElementFn && typeof createUnifiedMessageElementFn === 'function') {
            const polymorphic = createUnifiedMessageElementFn(message);
            const element = (polymorphic instanceof Promise ? await polymorphic : polymorphic);
            element.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
            return element;
        }
        const fallback = await createUnifiedMessageElement(message);
        fallback.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
        return fallback;
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'renderMessageElement',
            severity: 'recoverable',
            fallbackValue: null,
            context: { messageId: message.id }
        });
        return null;
    }
};
// REMOVED: getNormalizeUrl - no longer needed since we accept pageId directly, not rawUrl
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
    Logger.debug('⚠️ resolveActiveCommunitiesWithRetry: No communities found after retries, using Public Square UUID', { publicSquareUUID }, 'messages');
    // Set it in stateManager for future calls
    setActiveCommunitiesState([publicSquareUUID]);
    stateManagerInstance.setState('ui.primaryCommunity', publicSquareUUID);
    return [publicSquareUUID];
};
// REMOVED: CanopiModule class and backward compatibility code
// All functionality is now in standalone functions below
// Standalone functions - Full implementations
/**
 * Update message in chat
 * COMP METHOD: Matches original implementation with full DOM updates
 */
function updateMessageInChat(updatedMessage) {
    Logger.debug('🔄 UPDATE_MESSAGE: Updating message in chat', { messageId: updatedMessage.id }, 'messages');
    const chatMessages = getChatMessagesContainer();
    if (!chatMessages) {
        Logger.error('❌ UPDATE_MESSAGE: No chat-messages element found', null, 'messages');
        return;
    }
    // Find the existing message element
    const messageElement = chatMessages.querySelector(`[data-message-id="${updatedMessage.id}"]`);
    if (!messageElement) {
        Logger.debug('⚠️ UPDATE_MESSAGE: Message not found in DOM, adding as new message', { messageId: updatedMessage.id }, 'messages');
        // ROOT CAUSE FIX: Get addMessageToChat from window (set by MessagesModule exports)
        const addMessageToChatFn = getWindowFunction('addMessageToChat');
        if (addMessageToChatFn && typeof addMessageToChatFn === 'function') {
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
    Logger.debug('✅ UPDATE_MESSAGE: Message updated successfully', { messageId: updatedMessage.id }, 'messages');
}
/**
 * Remove message from chat
 * COMP METHOD: Matches original implementation with full DOM removal
 */
function removeMessageFromChat(deletedMessage) {
    Logger.debug('🗑️ REMOVE_MESSAGE: Removing message from chat', { messageId: deletedMessage.id }, 'messages');
    const chatMessages = getChatMessagesContainer();
    if (!chatMessages) {
        Logger.error('❌ REMOVE_MESSAGE: No chat-messages element found', null, 'messages');
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
            Logger.warn('⚠️ REMOVE_MESSAGE: Message has replies, marking as deleted instead of removing', 'messages');
        }
        else {
            // No replies - safe to remove
            messageElement.remove();
            Logger.debug('✅ REMOVE_MESSAGE: Message removed from DOM', null, 'messages');
        }
    }
    else {
        Logger.warn('⚠️ REMOVE_MESSAGE: Message element not found in DOM', null, 'messages');
    }
    // Update cached chat data
    const chatData = getCurrentChatData();
    if (chatData.length) {
        const updatedChatData = chatData.filter(m => m.id !== deletedMessage.id);
        setCurrentChatData(updatedChatData);
    }
    Logger.debug('✅ REMOVE_MESSAGE: Message removed from chat data', null, 'messages');
}
/**
 * Add or update a single message in the chat container
 */
async function addMessageToChat(rawMessage) {
    Logger.debug('🔍 ADD_MESSAGE: Called with rawMessage', { rawMessage }, 'messages');
    const chatMessages = getChatMessagesContainer();
    if (!chatMessages) {
        Logger.warn('⚠️ ADD_MESSAGE: Chat messages container not found', null, 'messages');
        return;
    }
    try {
        const message = normalizeMessagePayload(rawMessage);
        Logger.debug('🔍 ADD_MESSAGE: Normalized message', { id: message.id, contentPreview: message.content?.substring(0, 50) }, 'messages');
        // CRITICAL FIX: Check for duplicate, but only check actual message elements (not buttons)
        const existingMessages = Array.from(chatMessages.querySelectorAll('.message, [data-message-id]')).filter(el => {
            return el.classList.contains('message') ||
                el.querySelector('.message-content-wrapper') !== null ||
                (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
        });
        const existingElement = existingMessages.find(el => el.getAttribute('data-message-id') === message.id);
        if (existingElement) {
            Logger.debug(`⚠️ addMessageToChat: Message ${message.id} already exists in DOM, skipping duplicate`, { messageId: message.id }, 'messages');
            return; // Don't add duplicate
        }
        // CRITICAL FIX: Check state but allow updates for existing messages (replies/quotes might update parent)
        const currentChatData = getCurrentChatData();
        const existingMessageIndex = currentChatData.findIndex(m => m.id === message.id);
        if (existingMessageIndex >= 0) {
            // Message exists in state - check if it's actually in DOM
            const existingInDOM = existingMessages.some(el => el.getAttribute('data-message-id') === message.id);
            if (existingInDOM) {
                Logger.debug(`⚠️ addMessageToChat: Message ${message.id} already exists in DOM and state, skipping duplicate`, { messageId: message.id }, 'messages');
                return; // Don't add duplicate
            }
            else {
                Logger.debug(`🔍 addMessageToChat: Message ${message.id} in state but not in DOM, will add to DOM`, { messageId: message.id }, 'messages');
                // Continue to add to DOM even though it's in state (might be a different container)
            }
        }
        const messageElement = await renderMessageElement(message, chatMessages);
        Logger.debug('✅ ADD_MESSAGE: Rendered message element for', { messageId: message.id }, 'messages');
        if (messageElement && chatMessages) {
            chatMessages.appendChild(messageElement);
        }
        Logger.debug('✅ ADD_MESSAGE: Appended message to DOM', { messageId: message.id }, 'messages');
        // ROOT CAUSE FIX: Get addMessageActionListeners from window
        if (messageElement) {
            const addMessageActionListenersFn = getWindowFunction('addMessageActionListeners');
            if (addMessageActionListenersFn && typeof addMessageActionListenersFn === 'function') {
                addMessageActionListenersFn(messageElement, message);
                Logger.debug('✅ ADD_MESSAGE: Attached action listeners for', { messageId: message.id }, 'messages');
            }
        }
        else {
            Logger.warn('⚠️ ADD_MESSAGE: addMessageActionListeners not available', null, 'messages');
        }
        // ROOT CAUSE FIX: Get loadMessageReactions from window
        const loadMessageReactionsFn = getWindowFunction('loadMessageReactions');
        if (loadMessageReactionsFn) {
            try {
                await loadMessageReactionsFn(message.id);
            }
            catch (reactionError) {
                handleMessagesModuleError(reactionError, {
                    operation: 'loadMessageReactions',
                    logLevel: 'warn',
                    severity: 'recoverable',
                    context: { messageId: message.id }
                });
            }
        }
        // Update state with new message
        const chatData = getCurrentChatData();
        const existingIndex = chatData.findIndex(m => m.id === message.id);
        if (existingIndex >= 0) {
            const updated = [...chatData];
            updated[existingIndex] = message;
            setCurrentChatData(updated);
            Logger.debug('✅ ADD_MESSAGE: Updated existing message in state', { messageId: message.id }, 'messages');
        }
        else {
            setCurrentChatData([...chatData, message]);
            Logger.debug('✅ ADD_MESSAGE: Added new message to state', { messageId: message.id, totalMessages: chatData.length + 1 }, 'messages');
        }
    }
    catch (error) {
        const messageId = 'id' in rawMessage ? rawMessage.id : undefined;
        handleMessagesModuleError(error, {
            operation: 'addMessageToChat',
            logLevel: 'error',
            severity: 'recoverable',
            context: { messageId }
        });
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
    // Try to get from visibility state (if available)
    const visibilityData = stateManagerInstance.getState('visibility.data');
    if (visibilityData && Array.isArray(visibilityData)) {
        const user = visibilityData.find((u) => u.id === userId);
        if (user) {
            return user.name || user.email?.split('@')[0] || 'Unknown User';
        }
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
function convertUrlsToLinks(text) {
    // SECURITY FIX: Use sanitized version to prevent XSS attacks
    return convertUrlsToLinksSafely(text);
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
    // UUID ONLY - no email matching
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id)
        return false;
    const authorId = message.authorId || (message.author && message.author.id);
    return currentUser.id === authorId && messageTime.getTime() > oneHourAgo.getTime();
}
/**
 * Create unified message element
 * Uses UnifiedMessageRenderer for consistent rendering
 */
async function createUnifiedMessageElement(message) {
    try {
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
                    if (communities && typeof communities === 'object' && message.communityId && typeof message.communityId === 'string') {
                        const community = communities[message.communityId];
                        if (community && typeof community === 'object' && 'name' in community) {
                            communityName = typeof community.name === 'string' ? community.name : '';
                        }
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
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'createUnifiedMessageElement',
            severity: 'recoverable',
            fallbackValue: null,
            context: { messageId: message.id }
        });
        // Return basic fallback on error
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.setAttribute('data-message-id', message.id);
        messageDiv.innerHTML = `<div class="message-content">${ensureMessageContent(message)}</div>`;
        return messageDiv;
    }
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
        ].filter((el) => el !== null);
        for (const container of chatContainers) {
            messageDiv = container.querySelector(`[data-message-id="${messageId}"]`);
            if (messageDiv)
                break;
        }
    }
    if (!messageDiv) {
        Logger.warn(`⚠️ updateReactionDisplay: Message element not found for ${messageId}. Searched in all containers.`, null, 'messages');
        // ROOT CAUSE FIX: Log available message IDs for debugging
        const allMessages = document.querySelectorAll('[data-message-id]');
        const availableIds = Array.from(allMessages).slice(0, 5).map(el => el.getAttribute('data-message-id'));
        Logger.debug(`🔍 updateReactionDisplay: Available message IDs (first 5):`, availableIds, 'messages');
        return;
    }
    // Find reaction button
    const reactionButton = messageDiv.querySelector('.reaction-btn');
    if (!reactionButton)
        return;
    // Update reaction count
    const countElement = reactionButton.querySelector('.icon-count');
    const reactionCount = Array.isArray(reactions) ? reactions.length : 0;
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
        Logger.warn('⚠️ loadMessageReactions: No messageId provided', null, 'messages');
        return;
    }
    try {
        // First try to get reactions from stored reactions data if available
        let reactions = [];
        // Use API to fetch reactions (TypeScript migration - use module import)
        const api = getApi();
        // TypeScript: getReactions may not be in MetaLayerAPI type, but exists at runtime
        const apiWithReactions = api;
        if (apiWithReactions && typeof apiWithReactions.getReactions === 'function') {
            const response = await apiWithReactions.getReactions(messageId);
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
            if (!windowSupabase || typeof windowSupabase.from !== 'function')
                return;
            const { data: supabaseReactions, error } = await windowSupabase
                .from('reactions')
                .select('*')
                .eq('message_id', messageId);
            if (error) {
                Logger.error('❌ loadMessageReactions: Error fetching reactions:', error, 'messages');
                return;
            }
            reactions = Array.isArray(supabaseReactions) ? supabaseReactions : [];
        }
        else {
            Logger.warn('⚠️ loadMessageReactions: No API or Supabase client available', null, 'messages');
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
        handleMessagesModuleError(error, {
            operation: 'loadMessageReactions',
            logLevel: 'error',
            severity: 'recoverable'
        });
    }
}
/**
 * Add message action listeners (reply, reaction, bookmark, etc.)
 */
function addMessageActionListeners(messageDiv, message) {
    if (!messageDiv || !message) {
        Logger.warn('⚠️ addMessageActionListeners: Invalid parameters', null, 'messages');
        return;
    }
    const messageId = message.id;
    // Reply button
    const replyButton = messageDiv.querySelector('.inline-reply-btn');
    if (replyButton) {
        replyButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                // Use UnifiedMessageModal for replies
                await handleReplyToMessage(message);
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'replyButtonClick',
                    severity: 'recoverable',
                    context: { messageId: message.id }
                });
            }
        });
    }
    // Quote button (if it exists)
    const quoteButton = messageDiv.querySelector('.quote-btn, [data-action="quote"]');
    if (quoteButton) {
        quoteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await handleQuoteMessage(message);
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'quoteButtonClick',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
            }
        });
    }
    // Reaction button - CRITICAL FIX: Directly call handleReaction
    const reactionButton = messageDiv.querySelector('.reaction-btn');
    if (reactionButton) {
        reactionButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            try {
                Logger.debug('❤️ REACTION_BUTTON: Clicked for message:', messageId, 'messages');
                // COMP METHOD: Check if reaction picker/modal exists
                const win = window;
                if (win.showReactionPicker && typeof win.showReactionPicker === 'function') {
                    Logger.debug('✅ REACTION_BUTTON: Using reaction picker modal', null, 'messages');
                    win.showReactionPicker(messageId, message, reactionButton);
                }
                else {
                    Logger.debug('⚠️ REACTION_BUTTON: No reaction picker, using direct toggle', 'messages');
                    // CRITICAL FIX: Directly call handleReaction
                    await handleReaction(message);
                }
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'reactionButtonClick',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
            }
        });
    }
    // Bookmark button - CRITICAL FIX: Directly call handleBookmarkMessage
    const bookmarkButton = messageDiv.querySelector('.bookmark-btn');
    if (bookmarkButton) {
        bookmarkButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            try {
                Logger.debug('🔖 Bookmark clicked for message:', messageId, 'messages');
                await handleBookmarkMessage(message);
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'bookmarkButtonClick',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
            }
        });
    }
    // Repost button - CRITICAL FIX: Add missing click handler
    const repostButton = messageDiv.querySelector('.repost-btn');
    if (repostButton) {
        repostButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const handleRepostClick = window.handleRepostClick;
                if (typeof handleRepostClick === 'function') {
                    await handleRepostClick(message);
                }
                else {
                    Logger.debug('🔄 Repost clicked for message', { messageId }, 'messages');
                    // Fallback: implement basic repost
                    await handleRepostMessage(message);
                }
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'repostButtonClick',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
            }
        });
    }
    // Share button
    const shareButton = messageDiv.querySelector('.share-btn');
    if (shareButton) {
        shareButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const handleShareClick = window.handleShareClick;
                if (typeof handleShareClick === 'function') {
                    await handleShareClick(message);
                }
                else {
                    Logger.debug('📤 Share clicked for message', { messageId }, 'messages');
                    // Fallback: use existing handleShareMessage
                    await handleShareMessage(message);
                }
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'shareButtonClick',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
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
                if (target && !messageDiv.contains(target) && !dropdownForClose.contains(target)) {
                    dropdownForClose.style.display = 'none';
                }
            };
            // Use capture phase to catch clicks before they bubble
            document.addEventListener('click', closeDropdownHandler, true);
            // Store handler for cleanup if needed (using WeakMap would be better, but keeping simple for now)
            // Note: _closeDropdownHandler removed - cleanup would need WeakMap pattern
        }
    }
    // Edit button - CRITICAL FIX: Directly call handleEditMessage
    const editButton = messageDiv.querySelector('.edit-btn');
    if (editButton) {
        editButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            try {
                // Close dropdown
                const dropdown = messageDiv.querySelector('.action-dropdown');
                if (dropdown) {
                    dropdown.style.display = 'none';
                }
                Logger.debug('✏️ Edit clicked for message', { messageId }, 'messages');
                await handleEditMessage(message);
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'editButtonClick',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
            }
        });
    }
    // Delete button - CRITICAL FIX: Directly call handleDeleteMessage
    const deleteButton = messageDiv.querySelector('.delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            try {
                // Close dropdown
                const dropdown = messageDiv.querySelector('.action-dropdown');
                if (dropdown) {
                    dropdown.style.display = 'none';
                }
                Logger.debug('🗑️ Delete clicked for message:', messageId, 'messages');
                await handleDeleteMessage(message);
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'deleteButtonClick',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
            }
        });
    }
}
/**
 * Handle message focus
 * Accepts message object or messageId string
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
            Logger.warn('⚠️ handleMessageFocus: Message not found:', messageId, 'messages');
            return;
        }
        // Use focus mode (required)
        if (!messageSystemIntegration || !unifiedMessageDisplay) {
            Logger.error('❌ handleMessageFocus: New message system not initialized', null, 'messages');
            throw new Error('Message system not initialized. Call initializeNewMessageSystem() first.');
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
                Logger.debug('🎯 FOCUS: Message focused (no parent)', null, 'messages');
            }
            return;
        }
        // Load focus mode
        Logger.debug('🎯 handleMessageFocus: Using focus mode system', null, 'messages');
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
        const messagesWithCommunityId = messages.map((msg) => ({
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
                    authorId: msg.author?.id || '',
                    communityId: communityId,
                    parentId: msg.parentId || null,
                    author: msg.author,
                    createdAt: msg.createdAt,
                    updatedAt: msg.updatedAt
                };
                handleMessageFocus(message);
            },
            onReplyClick: async (msg) => {
                try {
                    if (!msg.author)
                        return;
                    const message = {
                        id: msg.id,
                        content: msg.content,
                        authorId: msg.author?.id || '',
                        communityId: communityId,
                        parentId: msg.parentId || null,
                        author: msg.author,
                        createdAt: msg.createdAt,
                        updatedAt: msg.updatedAt
                    };
                    await handleReplyToMessage(message);
                }
                catch (error) {
                    handleMessagesModuleError(error, {
                        operation: 'onReplyClick',
                        logLevel: 'error',
                        severity: 'recoverable',
                        context: { messageId: msg?.id }
                    });
                }
            },
            onFocusClick: (msg) => {
                if (!msg.author)
                    return;
                const message = {
                    id: msg.id,
                    content: msg.content,
                    authorId: msg.author?.id || '',
                    communityId: communityId,
                    parentId: msg.parentId || null,
                    author: msg.author,
                    createdAt: msg.createdAt,
                    updatedAt: msg.updatedAt
                };
                handleMessageFocus(message);
            }
        });
        Logger.debug('🎯 FOCUS: Message focused using focus mode', null, 'messages');
    }
    catch (error) {
        const messageId = typeof messageOrId === 'string' ? messageOrId : messageOrId?.id;
        handleMessagesModuleError(error, {
            operation: 'handleMessageFocus',
            logLevel: 'error',
            severity: 'recoverable',
            context: { messageId }
        });
    }
}
/**
 * Load chat history - accepts pageId (preferred) or rawUrl (will normalize)
 * Pattern: Prefer pageId (normalized), but can accept rawUrl and normalize internally
 * CRITICAL: This function must be exported to window for tab change handlers
 *
 * @param {string} pageIdOrRawUrl - Normalized page ID (e.g., "google_com_") OR raw URL (e.g., "https://google.com")
 *                                   If pageId, uses directly. If rawUrl, normalizes to get pageId.
 *                                   If not provided, uses currentUrlData.pageId
 * @param {string[]} activeCommunities - Active community IDs. If not provided, uses current active communities
 */
async function loadChatHistory(pageIdOrRawUrl, activeCommunities) {
    // REFACTOR: Removed tab detection from loadChatHistory()
    // MessageLoadingService is the single gatekeeper for tab-based message loading
    // This function should just load messages - tab checks happen at the service layer
    // ROOT CAUSE FIX: Messages load from Supabase, not API backend
    // Backend health check should NOT block Supabase operations
    // Removed backend health check - messages work independently of API backend status
    Logger.debug('📜 loadChatHistory: Starting message load', { pageIdOrRawUrl }, 'messages');
    try {
        const candidate = pageIdOrRawUrl ?? '';
        let pageId = candidate;
        let rawUrl = null;
        // CRITICAL FIX: Determine if pageIdOrRawUrl is a pageId or rawUrl
        // pageId format: "google_com_" (no http/https, no slashes, underscores)
        // rawUrl format: "https://google.com" (has protocol)
        const isRawUrl = !!candidate && (candidate.startsWith('http://') ||
            candidate.startsWith('https://') ||
            candidate.includes('://'));
        if (isRawUrl) {
            // It's a rawUrl - normalize it to get pageId
            // ES6 MODULE: Use normalizeUrl from UrlNormalization.ts
            rawUrl = candidate;
            Logger.debug('📜 loadChatHistory: Received rawUrl, normalizing to get pageId', { rawUrl }, 'messages');
            try {
                const result = await normalizeUrl(rawUrl);
                if (result && result.pageId) {
                    pageId = result.pageId;
                    // CRITICAL FIX: Save to state for future calls
                    const urlData = {
                        rawUrl: rawUrl,
                        pageId: result.pageId ?? rawUrl,
                        normalizedUrl: result.normalizedUrl ?? rawUrl,
                        canonicalUrl: result.canonicalUrl ?? result.normalizedUrl ?? rawUrl
                    };
                    stateManagerInstance.setState('currentUrlData', urlData);
                    Logger.debug('✅ loadChatHistory: Normalized URL and set currentUrlData in state', urlData, 'messages');
                }
                else {
                    Logger.error('❌ loadChatHistory: normalizeUrl returned invalid result', result, 'messages');
                    return;
                }
            }
            catch (error) {
                Logger.error('❌ loadChatHistory: Failed to normalize URL', { rawUrl, error }, 'messages');
                return;
            }
        }
        else if (!pageId) {
            // No pageId provided - try to get from currentUrlData
            const urlData = getCurrentUrlData();
            const urlDataPageId = urlData?.pageId;
            if (urlDataPageId && typeof urlDataPageId === 'string') {
                pageId = urlDataPageId;
            }
            if (!pageId) {
                // CRITICAL FIX: Try to get from active tab and normalize
                Logger.warn('⚠️ loadChatHistory: No pageId provided and currentUrlData has no pageId, trying to get from active tab', 'messages');
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                    try {
                        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                        if (tabs && tabs.length > 0 && tabs[0] && tabs[0].url) {
                            const tabUrl = tabs[0].url;
                            if (tabUrl && !tabUrl.startsWith('chrome://') && !tabUrl.startsWith('chrome-extension://') && !tabUrl.includes('sidepanel')) {
                                // ES6 MODULE: Use normalizeUrl from UrlNormalization.ts
                                try {
                                    const result = await normalizeUrl(tabUrl);
                                    if (result && result.pageId) {
                                        pageId = result.pageId;
                                        // CRITICAL FIX: Save to state for future calls
                                        const urlData = {
                                            rawUrl: tabUrl,
                                            pageId: result.pageId ?? tabUrl,
                                            normalizedUrl: result.normalizedUrl ?? tabUrl,
                                            canonicalUrl: result.canonicalUrl ?? result.normalizedUrl ?? tabUrl
                                        };
                                        stateManagerInstance.setState('currentUrlData', urlData);
                                        Logger.debug('✅ loadChatHistory: Set currentUrlData in state:', urlData, 'messages');
                                    }
                                }
                                catch (error) {
                                    handleMessagesModuleError(error, {
                                        operation: 'normalizeTabUrl',
                                        logLevel: 'error',
                                        severity: 'recoverable'
                                    });
                                }
                            }
                        }
                    }
                    catch (error) {
                        handleMessagesModuleError(error, {
                            operation: 'getActiveTabUrl',
                            logLevel: 'warn',
                            severity: 'recoverable'
                        });
                    }
                }
                if (!pageId) {
                    Logger.warn('⚠️ loadChatHistory: No pageId available', null, 'messages');
                    return;
                }
            }
        }
        // ROOT CAUSE FIX: Validate that pageId is not a sidepanel pageId
        if (pageId.includes('_sidepanel_html') || pageId.includes('sidepanel') || pageId.startsWith('chrome-extension://') || pageId.startsWith('chrome://')) {
            Logger.error('❌ loadChatHistory: Invalid pageId (sidepanel or chrome URL):', pageId, 'messages');
            return;
        }
        // Get active communities if not provided
        // CRITICAL: Retry mechanism - communities may not be loaded yet
        activeCommunities = await resolveActiveCommunitiesWithRetry(activeCommunities);
        // ROOT CAUSE FIX: Ensure activeCommunities is never empty - always have at least Public Square UUID
        // This prevents messages from being blocked due to empty communities
        if (!activeCommunities || activeCommunities.length === 0) {
            Logger.warn('⚠️ loadChatHistory: No active communities after resolution, using Public Square UUID fallback', null, 'messages');
            activeCommunities = [publicSquareUUID];
            // CRITICAL: Set it in state so future calls can find it
            setActiveCommunitiesState(activeCommunities);
            stateManagerInstance.setState('ui.primaryCommunity', publicSquareUUID);
        }
        // REFACTOR: Log active communities after resolution
        Logger.debug('📜 loadChatHistory: Active communities after resolution', { activeCommunities }, 'messages');
        Logger.debug('📜 loadChatHistory: Loading messages for page', { pageId, activeCommunities }, 'messages');
        // REFACTOR: Container check moved to after message system initialization
        // ROOT CAUSE FIX: Auto-initialize message system if not initialized
        if (!messageSystemIntegration || !unifiedMessageDisplay) {
            Logger.warn('⚠️ loadChatHistory: New message system not initialized, initializing now...', 'messages');
            try {
                await initializeNewMessageSystem();
                if (!messageSystemIntegration || !unifiedMessageDisplay) {
                    Logger.error('❌ loadChatHistory: Failed to initialize message system', null, 'messages');
                    throw new Error('Message system initialization failed');
                }
                Logger.debug('✅ loadChatHistory: Message system initialized successfully', null, 'messages');
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'initializeMessageSystemInLoadChatHistory',
                    logLevel: 'error',
                    severity: 'fatal'
                });
            }
        }
        if (!messageSystemIntegration || !unifiedMessageDisplay) {
            handleMessagesModuleError(new Error('Message system unavailable after initialization'), {
                operation: 'loadChatHistory.initialize',
                logLevel: 'error',
                severity: 'fatal'
            });
            return;
        }
        Logger.debug('📜 loadChatHistory: Loading messages with new message system', null, 'messages');
        const communityId = activeCommunities[0] || publicSquareUUID;
        // REFACTOR: Verify container exists before proceeding
        const chatMessages = getChatMessagesContainer();
        if (!chatMessages) {
            Logger.error('❌ loadChatHistory: Chat messages container not found - cannot load messages', null, 'messages');
            isLoadingChatHistory = false;
            return;
        }
        Logger.debug('✅ loadChatHistory: Chat messages container found', { containerId: chatMessages.id || 'no-id', className: chatMessages.className }, 'messages');
        // CRITICAL FIX: Add loading flag to prevent multiple simultaneous loads
        if (isLoadingChatHistory) {
            Logger.warn('⚠️ loadChatHistory: Already loading, skipping duplicate call', 'messages');
            return;
        }
        isLoadingChatHistory = true;
        // ROOT CAUSE FIX: Mark as initial load to prevent onMessageUpdate from adding messages
        isInitialMessageLoad = true;
        initialMessageLoadComplete = false;
        // CRITICAL FIX: Clear container FIRST before any loading
        const allChatContainers = document.querySelectorAll('.chat-messages');
        let totalCleared = 0;
        allChatContainers.forEach(cont => {
            const messageElements = Array.from(cont.querySelectorAll('[data-message-id], .message'));
            messageElements.forEach(el => {
                const isMessageElement = el.classList.contains('message') ||
                    (el.hasAttribute('data-message-id') && !el.closest('.message'));
                if (isMessageElement) {
                    el.remove();
                    totalCleared++;
                }
            });
        });
        Logger.debug(`🔍 loadChatHistory: Cleared ${totalCleared} message elements from all containers before loading`, null, 'messages');
        // REFACTOR: Don't clear state - might have valid messages that need rendering
        // Only clear if we're doing a fresh load (no messages in state)
        const existingStateMessages = stateManagerInstance ? stateManagerInstance.getState('chat.data') : null;
        if (!existingStateMessages || !Array.isArray(existingStateMessages) || existingStateMessages.length === 0) {
            if (stateManagerInstance) {
                stateManagerInstance.setState('chat.data', []);
                Logger.debug('🔍 loadChatHistory: Cleared state chat.data (was empty)', null, 'messages');
            }
        }
        else {
            Logger.debug(`🔍 loadChatHistory: State has ${existingStateMessages.length} existing messages, keeping them`, null, 'messages');
        }
        // ROOT CAUSE FIX: Use actual pageId from currentUrlData (not normalizedUrl)
        // pageId is the normalized identifier (e.g., "google_com_"), normalizedUrl is human-readable (e.g., "google.com/")
        // Messages are stored with pageId, so we must use pageId for queries
        Logger.debug('📜 loadChatHistory: Using pageId:', pageId, 'messages');
        const messages = await messageSystemIntegration.loadDefaultView(pageId, {
            limit: 10,
            communityId
        });
        // REFACTOR: Sort messages by createdAt ascending (oldest first) for correct display order
        // API may return messages in various orders, so we ensure consistent chronological order
        const sortedMessages = [...messages].sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aTime - bTime; // Ascending: oldest first
        });
        Logger.debug(`📜 loadChatHistory: loadDefaultView returned ${messages.length} messages, sorted to ${sortedMessages.length}`, { pageId, communityId, messageIds: sortedMessages.map((m) => m.id) }, 'messages');
        // REFACTOR: If no messages returned, log and check database
        if (messages.length === 0) {
            Logger.warn('⚠️ loadChatHistory: No messages returned from loadDefaultView', { pageId, communityId }, 'messages');
            // Don't return early - might need to render empty state or retry
        }
        // ROOT CAUSE FIX: Mark initial load as complete AFTER getting messages but BEFORE rendering
        // This prevents onMessageUpdate from interfering
        // BUT: Only mark complete if we actually have messages to render
        if (messages.length > 0) {
            initialMessageLoadComplete = true;
        }
        // CRITICAL FIX: Check STATE first (single source of truth), not DOM
        // Diagnostic found state is clean but DOM might have duplicates
        // State should be the authority
        const stateManager = stateManagerInstance;
        let stateMessageIds = new Set();
        if (stateManager) {
            const chatData = stateManager.getState('chat.data');
            if (Array.isArray(chatData)) {
                stateMessageIds = new Set(chatData.map((m) => m.id));
                Logger.debug(`🔍 loadChatHistory: State has ${chatData.length} messages (${stateMessageIds.size} unique, null, 'messages')`);
            }
        }
        // REFACTOR: Always render messages, even if they're in state
        // State might have messages but DOM might be empty (e.g., after tab switch, page reload)
        // Check DOM to see if messages are actually displayed
        const domMessageElements = chatMessages ? Array.from(chatMessages.querySelectorAll('[data-message-id], .message')) : [];
        const domMessageIds = new Set(domMessageElements.map(el => {
            const msgId = el.getAttribute('data-message-id');
            return msgId || (el.classList.contains('message') ? 'unknown' : null);
        }).filter((id) => id !== null && id !== 'unknown'));
        // Filter messages - if already in state AND DOM, skip (already loaded and displayed)
        const newMessages = messages.filter((msg) => !stateMessageIds.has(msg.id) && !domMessageIds.has(msg.id));
        // REFACTOR: If messages exist but aren't in DOM, render them (state might be stale)
        if (newMessages.length === 0 && messages.length > 0 && domMessageIds.size === 0) {
            // Messages in state but not in DOM - force render
            Logger.debug(`⚠️ loadChatHistory: Messages in state but not in DOM, forcing render of ${messages.length} messages`, 'messages');
            const messagesWithCommunityId = messages.map((msg) => ({
                ...msg,
                communityId: msg.communityId || communityId
            }));
            await unifiedMessageDisplay.render(messagesWithCommunityId, chatMessages, {
                focusContext: 'default',
                onMessageClick: (message) => {
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
                    handleMessageFocus(msg);
                },
                onFocusClick: (message) => {
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
                    handleMessageFocus(msg);
                },
                onReplyClick: async (message) => {
                    try {
                        await handleReplyToMessage(message);
                    }
                    catch (error) {
                        Logger.error('❌ loadChatHistory: Error handling reply click', error, 'messages');
                    }
                }
            });
            // Update state with all messages
            if (stateManagerInstance) {
                stateManagerInstance.setState('chat.data', messagesWithCommunityId);
            }
            isInitialMessageLoad = false;
            isLoadingChatHistory = false;
            Logger.debug('✅ loadChatHistory: Successfully rendered messages from state to DOM', null, 'messages');
            return;
        }
        else if (newMessages.length === 0 && messages.length > 0) {
            Logger.debug(`⚠️ loadChatHistory: All ${messages.length} messages already in state and DOM, skipping render call`, 'messages');
            isInitialMessageLoad = false;
            isLoadingChatHistory = false;
            return;
        }
        else if (newMessages.length > 0) {
            // CRITICAL FIX: Ensure all messages have communityId before rendering
            // Use newMessages (filtered by state) not all messages
            const messagesWithCommunityId = newMessages.map((msg) => ({
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
                    try {
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
                    catch (error) {
                        handleMessagesModuleError(error, {
                            operation: 'onReplyClick',
                            logLevel: 'error',
                            severity: 'recoverable',
                            context: { messageId: message?.id }
                        });
                    }
                }
            });
        }
        // ROOT CAUSE FIX: Mark initial load as complete after rendering
        isInitialMessageLoad = false;
        isLoadingChatHistory = false; // CRITICAL FIX: Clear loading flag
        Logger.debug('✅ loadChatHistory: Successfully loaded messages and cleared loading flag', null, 'messages');
        // Store messages in cache
        // Remove duplicates before storing
        const seenIds = new Set();
        const cachedMessages = messages
            .filter((msg) => {
            if (!msg.author || !msg.author.id)
                return false;
            if (seenIds.has(msg.id)) {
                Logger.warn(`⚠️ loadChatHistory: Duplicate message ID in API response: ${msg.id}`, null, 'messages');
                return false;
            }
            seenIds.add(msg.id);
            return true;
        })
            .map((msg) => ({
            id: msg.id,
            content: msg.content,
            authorId: msg.author?.id || '',
            communityId: communityId,
            parentId: msg.parentId || null,
            author: msg.author,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
        }));
        setCurrentChatData(cachedMessages);
        Logger.debug(`✅ loadChatHistory: Successfully loaded ${cachedMessages.length} unique messages`, null, 'messages');
        // Hide backend banner on successful load
        stateManagerInstance.setState('ui.backendBanner', { visible: false });
    }
    catch (error) {
        handleModuleError(error, {
            component: 'MessagesModule',
            operation: 'loadChatHistory',
            severity: 'fatal',
            rethrow: true,
            context: {
                pageIdOrRawUrl
            }
        });
    }
}
let loadHistoryBindingApplied = false;
const ensureLoadChatHistoryBinding = () => {
    if (typeof window === 'undefined') {
        return;
    }
    const win = window;
    const alreadyBound = typeof win.loadChatHistory === 'function';
    win.loadChatHistory = loadChatHistory;
    if (!loadHistoryBindingApplied && !alreadyBound) {
        window.dispatchEvent(new CustomEvent('canopimodule-loaded'));
    }
    loadHistoryBindingApplied = true;
};
ensureLoadChatHistoryBinding();
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
                        const toggleThreadRepliesFn = getWindowFunction('toggleThreadReplies');
                        if (toggleThreadRepliesFn && typeof toggleThreadRepliesFn === 'function') {
                            toggleThreadRepliesFn(conversationId, messageElement);
                        }
                    });
                }
            }
        }
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'checkAndAddThreadToggle',
            logLevel: 'error',
            severity: 'recoverable',
            context: { conversationId }
        });
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
        // UUID ONLY - no email or handle matching
        if (currentUser && typeof currentUser === 'object' && currentUser.id) {
            const authorId = message.authorId || (message.author && typeof message.author === 'object' && 'id' in message.author ? message.author.id : undefined);
            if (authorId && currentUser.id === authorId) {
                isOwner = true;
            }
        }
        finalCanEdit = isOwner && diffHours < 1; // Can edit within 1 hour
        finalCanDelete = isOwner; // User can only delete their own messages
        const authorEmail = message.authorEmail || (message.author && typeof message.author === 'object' && 'email' in message.author ? message.author.email : undefined);
        const authorId = message.authorId || (message.author && typeof message.author === 'object' && 'id' in message.author ? message.author.id : undefined);
        Logger.debug('🔍 getMessageActionMenu: Ownership check', {
            messageId: message.id,
            currentUser: currentUser && typeof currentUser === 'object' ? (currentUser.email || currentUser.id, null, 'messages') : undefined,
            authorEmail,
            authorId,
            isOwner,
            finalCanEdit,
            finalCanDelete
        });
    }
    // Get current theme for background color
    const currentTheme = document.body.getAttribute('data-theme') ||
        document.documentElement.getAttribute('data-theme') ||
        'light';
    // ROOT CAUSE FIX: Ensure background is never transparent - use explicit color values
    // dropdownBg is already set to var(--surface-primary) with fallback, so it should never be transparent
    // But add explicit fallback just in case
    const safeDropdownBg = currentTheme === 'dark' ? '#1f1f1f' : '#ffffff';
    const safeDropdownColor = currentTheme === 'dark' ? '#ffffff' : '#000000';
    return `
    <div class="message-actions-menu" style="opacity: 1 !important; display: inline-block !important; visibility: visible !important; position: relative !important; background: var(--surface-primary);">
      <button class="action-dots-btn" data-message-id="${message.id}" title="Message actions" style="opacity: 1 !important; display: block !important; visibility: visible !important; background: none !important; border: none !important; padding: 0 !important; margin: 0 !important;">
        ${typeof window !== 'undefined' && window.XIcons?.more ? window.XIcons.more({ width: 20, height: 20 }) : '<span class="action-dots" style="opacity: 1 !important; display: inline-block !important; visibility: visible !important; font-size: 16px !important; color: var(--text-secondary) !important; background: none !important;">⋯</span>'}
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
        Logger.error('❌ handleReplyToMessage: No pageId available', null, 'messages');
        return;
    }
    // CRITICAL FIX: Sanitize message ID to remove any ::UUID suffix
    const sanitizeId = (id) => {
        if (!id || typeof id !== 'string')
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
    const openReplyModalFn = getWindowFunction('openReplyModal');
    if (!openReplyModalFn || typeof openReplyModalFn !== 'function') {
        Logger.error('❌ handleReplyToMessage: UnifiedMessageModal not available', null, 'messages');
        return;
    }
    try {
        await openReplyModalFn(sanitizedMessage, pageId);
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleReplyToMessage',
            logLevel: 'error',
            severity: 'recoverable',
            showUserNotification: true,
            userMessage: 'Failed to open reply modal. Please try again.',
            context: { messageId: message?.id }
        });
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
        Logger.error('❌ handleQuoteMessage: No pageId available', null, 'messages');
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
    const openQuoteModalFn = getWindowFunction('openQuoteModal');
    if (!win.openQuoteModal || typeof openQuoteModalFn !== 'function') {
        Logger.error('❌ handleQuoteMessage: UnifiedMessageModal not available', null, 'messages');
        // CRITICAL FIX: Try alternative - use openMessageModal directly
        const unifiedMessageModal = getWindowFunction('unifiedMessageModal');
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
                handleMessagesModuleError(error, {
                    operation: 'handleQuoteMessage',
                    logLevel: 'error',
                    severity: 'recoverable',
                    showUserNotification: true,
                    userMessage: 'Failed to open quote modal. Please try again.',
                    context: { messageId: message?.id }
                });
            }
        }
        else {
            Logger.error('❌ handleQuoteMessage: Neither openQuoteModal nor unifiedMessageModal available', null, 'messages');
        }
        return;
    }
    try {
        await openQuoteModalFn(sanitizedMessage, pageId);
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleQuoteMessage',
            logLevel: 'error',
            severity: 'recoverable',
            showUserNotification: true,
            userMessage: 'Failed to open quote modal. Please try again.',
            context: { messageId: message?.id }
        });
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
            Logger.error('❌ handleDeleteMessage: Invalid message ID format (expected UUID):', message.id, 'messages');
            return;
        }
        // Use robustIntegration for deletion
        const robustIntegration = getWindowFunction('robustIntegration');
        if (robustIntegration?.isInitialized && robustIntegration.deleteMessage && typeof robustIntegration.deleteMessage === 'function') {
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
        handleMessagesModuleError(error, {
            operation: 'handleDeleteMessage',
            logLevel: 'error',
            severity: 'recoverable',
            context: { messageId: message?.id }
        });
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
        Logger.error('❌ handleEditMessage: Chat textarea not found', null, 'messages');
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
    if (sendButton && sendButton instanceof HTMLElement) {
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
        if (sendButton && sendButton instanceof HTMLElement && sendButton.dataset.editing === 'true') {
            saveEdit();
        }
    };
    // Save the edit
    const saveEdit = async () => {
        const newContent = chatTextarea.value.trim();
        if (newContent && newContent !== message.content) {
            try {
                // Use robust integration
                const robustIntegration = getWindowFunction('robustIntegration');
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
                handleMessagesModuleError(error, {
                    operation: 'handleEditMessage',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
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
        if (sendButton && sendButton instanceof HTMLElement) {
            sendButton.textContent = 'Send';
            delete sendButton.dataset.editing;
        }
        // Remove event listeners
        chatTextarea.removeEventListener('keydown', handleKeyDown);
        if (sendButton && sendButton instanceof HTMLElement) {
            sendButton.removeEventListener('click', handleButtonClick);
        }
    };
    // Add event listeners
    chatTextarea.addEventListener('keydown', handleKeyDown);
    if (sendButton && sendButton instanceof HTMLElement) {
        sendButton.addEventListener('click', handleButtonClick);
    }
}
function normalizeSendMessageInput(input, fallbackParentId, fallbackConversationId) {
    const basePayload = typeof input === 'string'
        ? { content: input, parentId: fallbackParentId, conversationId: fallbackConversationId }
        : {
            content: input?.content ?? '',
            parentId: input?.parentId ?? fallbackParentId,
            conversationId: input?.conversationId ?? fallbackConversationId
        };
    const trimmedContent = (basePayload.content ?? '').trim();
    if (!trimmedContent) {
        Logger.warn('❌ SUPABASE_MESSAGE: normalizeSendMessageInput received empty content', null, 'messages');
        return null;
    }
    return {
        content: trimmedContent,
        parentId: basePayload.parentId ?? null,
        conversationId: basePayload.conversationId ?? null
    };
}
/**
 * Send message via Supabase
 * COMP METHOD: Matches original implementation
 */
async function sendMessageViaSupabase(input, parentId = null, conversationId = null) {
    const normalizedPayload = normalizeSendMessageInput(input, parentId, conversationId);
    if (!normalizedPayload) {
        return null;
    }
    const { content, parentId: normalizedParentId, conversationId: normalizedConversationId } = normalizedPayload;
    Logger.debug('🔥🔥🔥 SEND_MESSAGE_VIA_SUPABASE: ENTRY POINT', null, 'messages');
    Logger.debug('📡 SUPABASE_MESSAGE: Starting real-time message broadcast...', null, 'messages');
    Logger.debug('📡 SUPABASE_MESSAGE: Content:', content, 'messages');
    // Use robust integration system if available
    const robustIntegration = getWindowFunction('robustIntegration');
    if (robustIntegration && robustIntegration.isInitialized && robustIntegration.sendMessage) {
        Logger.debug('📡 SUPABASE_MESSAGE: Using robust integration system...', null, 'messages');
        try {
            const messageData = await robustIntegration.sendMessage(content, normalizedParentId, normalizedConversationId);
            if (messageData) {
                Logger.debug('📡 SUPABASE_MESSAGE: ✅ Robust integration message sent successfully', null, 'messages');
                return messageData;
            }
            else {
                Logger.debug('📡 SUPABASE_MESSAGE: ❌ Robust integration message failed', null, 'messages');
                return null;
            }
        }
        catch (error) {
            handleMessagesModuleError(error, {
                operation: 'sendMessageViaSupabase',
                logLevel: 'error',
                severity: 'recoverable',
                fallbackValue: null
            });
            return null;
        }
    }
    // No fallback - robust integration is required
    Logger.error('❌ SUPABASE_MESSAGE: Robust integration not available', null, 'messages');
    return null;
}
/**
 * Get sender avatar HTML
 * COMP METHOD: Matches original implementation
 */
async function getSenderAvatar(author) {
    try {
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
            });
            return avatarHTML;
        }
        // Fallback to initials
        return getSenderInitial(displayName);
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'getSenderAvatar',
            severity: 'recoverable'
        });
        // Return fallback on error
        const displayName = formatAuthorName(author);
        return getSenderInitial(displayName);
    }
}
/**
 * Handle repost message
 * Creates a repost of the message
 */
async function handleRepostMessage(message) {
    Logger.debug(`🔄 REPOST: Reposting message ${message.id}`, null, 'messages');
    try {
        const urlData = getCurrentUrlData();
        const pageId = urlData?.pageId || getCurrentLocationHref();
        const communityId = message.communityId || getActiveCommunities()[0];
        if (!pageId || !communityId) {
            Logger.error('❌ handleRepostMessage: Missing pageId or communityId', null, 'messages');
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
            Logger.error('❌ handleRepostMessage: UnifiedMessageModal not available', null, 'messages');
            const showNotification = getWindowFunction('showNotification');
            if (showNotification && typeof showNotification === 'function') {
                showNotification('Repost functionality not available');
            }
        }
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleRepostMessage',
            logLevel: 'error',
            severity: 'recoverable',
            showUserNotification: true,
            userMessage: 'Failed to repost message',
            context: { messageId: message?.id }
        });
    }
}
/**
 * Handle bookmark message
 * Toggles bookmark status
 */
async function handleBookmarkMessage(message) {
    Logger.debug(`🔖 BOOKMARK: Toggling bookmark for message ${message.id}`, null, 'messages');
    try {
        const api = getApi();
        if (!api) {
            Logger.error('❌ handleBookmarkMessage: API not available', null, 'messages');
            return;
        }
        const currentUser = getCurrentUser();
        if (!currentUser) {
            Logger.error('❌ handleBookmarkMessage: User not authenticated', null, 'messages');
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
        const responseData = response.data;
        if (responseData && responseData.success) {
            const newBookmarkStatus = responseData?.isBookmarked ?? !isBookmarked;
            const action = responseData?.action || (newBookmarkStatus ? 'added' : 'removed');
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
                        if (bookmarkCount && responseData && responseData.count !== undefined) {
                            const count = responseData.count;
                            bookmarkCount.textContent = count > 0 ? count.toString() : '';
                            bookmarkCount.style.display = count > 0 ? 'inline' : 'none';
                        }
                    }
                }
            });
            const showNotification = getWindowFunction('showNotification');
            if (showNotification && typeof showNotification === 'function') {
                showNotification(newBookmarkStatus ? 'Message bookmarked' : 'Bookmark removed');
            }
            Logger.debug(`✅ BOOKMARK: ${action === 'added' ? 'Added' : 'Removed'} bookmark for message ${message.id}`, null, 'messages');
        }
        else {
            throw new Error(response.error || 'Failed to toggle bookmark');
        }
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleBookmarkMessage',
            logLevel: 'error',
            severity: 'recoverable',
            showUserNotification: true,
            userMessage: 'Failed to toggle bookmark',
            context: { messageId: message?.id }
        });
    }
}
/**
 * Handle share message
 * COMP METHOD: Matches original implementation
 */
async function handleShareMessage(message, shareType = 'link') {
    Logger.debug(`🔗 SHARE: Sharing message ${message.id} with type: ${shareType}`, null, 'messages');
    const messageUrl = `https://app.themetalayer.org/message/${message.id}`;
    try {
        if (shareType === 'link') {
            await navigator.clipboard.writeText(messageUrl);
            // COMP METHOD: Show toast notification using NotificationManager's showToastNotification
            // Try notificationManager first, then fallback to simple toast
            const notificationManager = getWindowFunction('notificationManager');
            if (notificationManager && typeof notificationManager.showToastNotification === 'function') {
                notificationManager.showToastNotification('Message link copied to clipboard!');
            }
            else {
                const showNotification = getWindowFunction('showNotification');
                if (showNotification && typeof showNotification === 'function') {
                    showNotification('Message link copied to clipboard!');
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
            }
            Logger.debug('✅ SHARE: Message link copied:', messageUrl, 'messages');
        }
        else if (shareType === 'twitter') {
            const authorHandle = message.author?.handle || formatAuthorName(message.author, 'Metalayer');
            const safeContent = ensureMessageContent(message);
            const tweetText = `Check out this message from @${authorHandle}: "${safeContent}" ${messageUrl}`;
            globalThis.open?.(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
            Logger.debug('✅ SHARE: Opening Twitter share dialog', null, 'messages');
        }
        else {
            Logger.warn('⚠️ SHARE: Unknown share type:', shareType, 'messages');
        }
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleShareMessage',
            logLevel: 'error',
            severity: 'recoverable',
            showUserNotification: true,
            userMessage: 'Failed to share message',
            context: { messageId: message?.id }
        });
    }
}
/**
 * Handle start thread
 * Uses UnifiedMessageModal for replies
 */
async function handleStartThread(message) {
    try {
        Logger.debug(`🧵 THREAD: Starting new thread from message: ${message.id}`, null, 'messages');
        const uiManager = getWindowFunction('uiManager');
        if (uiManager && typeof uiManager.switchTab === 'function') {
            uiManager.switchTab('discuss-tab');
        }
        // Use UnifiedMessageModal for reply
        await handleReplyToMessage(message);
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleStartThread',
            logLevel: 'error',
            severity: 'recoverable',
            context: { messageId: message?.id }
        });
    }
}
/**
 * Handle copy link
 * COMP METHOD: Matches original implementation
 */
async function handleCopyLink(message) {
    Logger.debug(`🔗 COPY_LINK: Copying link for message: ${message.id}`, null, 'messages');
    const messageUrl = `https://app.themetalayer.org/message/${message.id}`;
    try {
        await navigator.clipboard.writeText(messageUrl);
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Message link copied to clipboard!');
        }
        Logger.debug('✅ COPY_LINK: Message link copied:', messageUrl, 'messages');
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleCopyLink',
            logLevel: 'error',
            severity: 'recoverable',
            showUserNotification: true,
            userMessage: 'Failed to copy link',
            context: { messageId: message?.id }
        });
    }
}
/**
 * Focus on message
 * COMP METHOD: Matches original implementation
 */
async function focusOnMessage(message) {
    try {
        Logger.debug(`🎯 FOCUS_ON_MESSAGE: Focusing on message: ${message.id}`, null, 'messages');
        const handleMessageFocus = getWindowFunction('handleMessageFocus');
        if (handleMessageFocus && typeof handleMessageFocus === 'function') {
            await handleMessageFocus(message);
        }
        else {
            Logger.warn('⚠️ FOCUS_ON_MESSAGE: handleMessageFocus not available, falling back to basic scroll', 'messages');
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
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'focusOnMessage',
            logLevel: 'error',
            severity: 'recoverable',
            context: { messageId: message?.id }
        });
    }
}
/**
 * Parse message URL
 * COMP METHOD: Matches original implementation
 */
function parseMessageUrl(url) {
    const messageIdMatch = url.match(/\/message\/([a-f0-9-]+)/i);
    const conversationIdMatch = url.match(/\/conversation\/([a-f0-9-]+)/i);
    const messageId = messageIdMatch?.[1];
    const conversationId = conversationIdMatch?.[1];
    return {
        messageId: messageId || undefined,
        parentId: conversationId || undefined,
        isValid: !!(messageIdMatch || conversationIdMatch)
    };
}
/**
 * Handle incoming message URL
 * COMP METHOD: Matches original implementation
 */
async function handleIncomingMessageUrl() {
    try {
        Logger.debug('🔗 INCOMING_URL: Checking for incoming message URL...', null, 'messages');
        const currentUrl = getCurrentLocationHref();
        const messageData = parseMessageUrl(currentUrl);
        if (messageData && messageData.isValid && messageData.messageId) {
            const messageId = messageData.messageId;
            Logger.debug(`🔗 INCOMING_URL: Found messageId in URL: ${messageId}`, null, 'messages');
            // Wait for messages to load
            // BEST PRACTICE: Use waitForCondition instead of setTimeout
            try {
                const { waitForCondition } = await import('../utils/AsyncCoordination.js');
                await waitForCondition(() => {
                    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                    return messageElement !== null;
                }, { timeout: 5000, interval: 200 } // 5 second timeout, check every 200ms
                );
                const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageElement) {
                    await focusOnMessage({ id: messageId });
                }
                else {
                    Logger.warn('🔗 INCOMING_URL: Message not found in current view:', messageId, 'messages');
                }
            }
            catch (error) {
                // Timeout or other error - message might not be loaded yet
                if (error instanceof Error && error.message.includes('Timeout')) {
                    Logger.warn('🔗 INCOMING_URL: Timeout waiting for message to load:', messageId, 'messages');
                }
                else {
                    handleMessagesModuleError(error, {
                        operation: 'handleIncomingMessageUrl.waitForCondition',
                        logLevel: 'error',
                        severity: 'recoverable',
                        context: { messageId }
                    });
                }
            }
        }
        else {
            Logger.debug('🔗 INCOMING_URL: No message or conversation ID found in URL.', null, 'messages');
        }
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleIncomingMessageUrl',
            logLevel: 'error',
            severity: 'recoverable'
        });
    }
}
/**
 * Handle back navigation
 * COMP METHOD: Matches original implementation
 */
async function handleBackNavigation() {
    try {
        Logger.debug('🔙 BACK_NAV: Starting back navigation', null, 'messages');
        const winWithFocus = window;
        if (typeof window !== 'undefined' && winWithFocus.focusedMessage && winWithFocus.previousView) {
            const focusedMessage = winWithFocus.focusedMessage;
            const previousView = winWithFocus.previousView;
            const messageId = typeof focusedMessage === 'string' ? focusedMessage : focusedMessage?.id || '';
            Logger.debug('🔙 BACK_NAV: Navigating back to previous view', { previousView, messageId }, 'messages');
            // Clear focus state
            delete winWithFocus.focusedMessage;
            delete winWithFocus.previousView;
            if (previousView === 'thread') {
                // This was a reply - go back to the thread view
                await loadChatHistory(getCurrentLocationHref());
            }
            else if (previousView === 'focus') {
                // This was a focus mode - go back to normal chat view
                await loadChatHistory(getCurrentLocationHref());
            }
        }
        else {
            Logger.debug('🔙 BACK_NAV: No focused message or previous view, performing default back action', 'messages');
            await loadChatHistory(getCurrentLocationHref());
        }
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleBackNavigation',
            logLevel: 'error',
            severity: 'recoverable'
        });
    }
}
/**
 * Handle reaction
 * COMP METHOD: Matches original implementation - uses reactionsIntegration if available, API fallback for Google ID conversion
 */
async function handleReaction(message) {
    try {
        Logger.debug(`❤️ REACTION: Handling reaction for message: ${message.id}`, null, 'messages');
        const reactionsIntegration = getWindowFunction('reactionsIntegration');
        if (reactionsIntegration && reactionsIntegration.reactionsManager) {
            if (reactionsIntegration.reactionsManager.addReaction) {
                await reactionsIntegration.reactionsManager.addReaction(message.id, '👍');
            }
        }
        else {
            // COMP METHOD: Fallback to API endpoint (handles Google ID to UUID conversion)
            Logger.warn('⚠️ REACTION: Reactions integration not available, using API endpoint', 'messages');
            try {
                const api = getApi();
                if (!api) {
                    Logger.error('❌ handleReaction: API not available', null, 'messages');
                    return;
                }
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    Logger.error('❌ handleReaction: User not authenticated', null, 'messages');
                    return;
                }
                // COMP METHOD: Use /v1/reactions endpoint (matches backend route registration)
                // GET endpoint: /v1/reactions/:messageId
                // POST endpoint: /v1/reactions (with {messageId, emoji} in body)
                const getEndpoint = `/v1/reactions/${message.id}`;
                // Check existing reactions via API
                // API returns { success: true, reactions: [...] } - extract reactions array
                const response = await api.request(getEndpoint, { method: 'GET' });
                const responseData = response.data;
                const existingReactions = responseData?.reactions || [];
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
                const toggleResponseData = toggleResponse.data;
                if (toggleResponseData && toggleResponseData.success) {
                    const action = toggleResponseData?.action || (userReaction ? 'removed' : 'added');
                    Logger.debug(`✅ REACTION: ${action === 'added' ? 'Added' : 'Removed'} reaction`, null, 'messages');
                }
                else {
                    Logger.error('❌ handleReaction: Error toggling reaction:', toggleResponse.error, 'messages');
                    Logger.error('❌ handleReaction: Response:', toggleResponse, 'messages');
                }
                // CRITICAL FIX: Always reload reactions display after toggle
                const loadMessageReactionsFn = getWindowFunction('loadMessageReactions');
                if (loadMessageReactionsFn) {
                    try {
                        await loadMessageReactionsFn(message.id);
                        Logger.debug('✅ REACTION: Reloaded reactions display', null, 'messages');
                    }
                    catch (error) {
                        handleMessagesModuleError(error, {
                            operation: 'reloadReactionsDisplay',
                            logLevel: 'error',
                            severity: 'recoverable',
                            context: { messageId: message.id }
                        });
                        // Fallback: Manually update reaction count based on action
                        const toggleResponseData2 = toggleResponse.data;
                        const action = toggleResponseData2?.action;
                        const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
                        if (messageDiv) {
                            const reactionButton = messageDiv.querySelector('.reaction-btn');
                            if (reactionButton) {
                                const countElement = reactionButton.querySelector('.icon-count');
                                if (countElement) {
                                    const currentCount = parseInt(countElement.textContent || '0', 10);
                                    const newCount = action === 'removed' ? Math.max(0, currentCount - 1) : currentCount + 1;
                                    countElement.textContent = newCount > 0 ? newCount.toString() : '';
                                    if (countElement instanceof HTMLElement) {
                                        countElement.style.display = newCount > 0 ? 'inline-block' : 'none';
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    Logger.warn('⚠️ handleReaction: loadMessageReactions not available, manually updating UI', 'messages');
                    const toggleResponseData3 = toggleResponse.data;
                    // Fallback: Manually update reaction count based on action
                    const action = toggleResponseData3?.action;
                    const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
                    if (messageDiv) {
                        const reactionButton = messageDiv.querySelector('.reaction-btn');
                        if (reactionButton) {
                            const countElement = reactionButton.querySelector('.icon-count');
                            if (countElement) {
                                const currentCount = parseInt(countElement.textContent || '0', 10);
                                const newCount = action === 'removed' ? Math.max(0, currentCount - 1) : currentCount + 1;
                                countElement.textContent = newCount > 0 ? newCount.toString() : '';
                                if (countElement instanceof HTMLElement) {
                                    countElement.style.display = newCount > 0 ? 'inline-block' : 'none';
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'handleReaction.fallback',
                    logLevel: 'error',
                    severity: 'recoverable',
                    context: { messageId: message?.id }
                });
            }
        }
    }
    catch (error) {
        handleMessagesModuleError(error, {
            operation: 'handleReaction',
            logLevel: 'error',
            severity: 'recoverable',
            context: { messageId: message?.id }
        });
    }
}
/**
 * Setup message input event listeners
 * COMP METHOD: Matches original implementation
 */
function setupMessageInputEventListeners() {
    Logger.debug('💬 MESSAGE_INPUT: Setting up message input event listeners...', null, 'messages');
    const chatTextarea = document.getElementById('chat-textarea');
    const cancelContextButton = document.getElementById('cancel-context');
    if (!chatTextarea) {
        Logger.error('❌ MESSAGE_INPUT: Chat textarea not found', null, 'messages');
        return;
    }
    // ROOT CAUSE FIX: Click handler to open UnifiedMessageModal
    // Wait for openMessageModal to be available (retry mechanism)
    const attachClickHandler = async () => {
        // Try to get openMessageModal, with retry
        let openModal = getWindowFunction('openMessageModal');
        const unifiedMessageModal = getWindowFunction('unifiedMessageModal');
        if (!openModal && unifiedMessageModal && typeof unifiedMessageModal.open === 'function') {
            // Fallback: use unifiedMessageModal directly
            openModal = (options) => unifiedMessageModal.open(options);
        }
        if (!openModal) {
            // Retry using waitForCondition instead of setTimeout
            // BEST PRACTICE: Use proper async coordination
            Logger.debug('💬 MESSAGE_INPUT: openMessageModal not yet available, waiting...', 'messages');
            try {
                const { waitForCondition } = await import('../utils/AsyncCoordination.js');
                await waitForCondition(() => {
                    const modal = getWindowFunction('openMessageModal');
                    const unifiedModal = getWindowFunction('unifiedMessageModal');
                    return modal !== null || (unifiedModal !== null && typeof unifiedModal.open === 'function');
                }, { timeout: 5000, interval: 200 } // 5 second timeout, check every 200ms
                );
                // Retry after condition is met
                attachClickHandler();
            }
            catch (error) {
                if (error instanceof Error && error.message.includes('Timeout')) {
                    Logger.warn('💬 MESSAGE_INPUT: Timeout waiting for openMessageModal, giving up', 'messages');
                }
                else {
                    Logger.warn('💬 MESSAGE_INPUT: Error waiting for openMessageModal:', error, 'messages');
                }
            }
            return;
        }
        chatTextarea.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const stateManager = getWindowFunction('stateManagerInstance');
                const currentUrlData = stateManager && typeof stateManager.getState === 'function' ? stateManager.getState('currentUrlData') : null;
                const activeCommunities = stateManager && typeof stateManager.getState === 'function' ? stateManager.getState('ui.activeCommunities') : null;
                const pageId = currentUrlData?.pageId || '';
                const communityId = Array.isArray(activeCommunities) && activeCommunities.length > 0 ? activeCommunities[0] : undefined;
                Logger.debug('💬 MESSAGE_INPUT: Opening UnifiedMessageModal for new message', null, 'messages');
                await openModal({
                    mode: 'new',
                    pageId,
                    communityId
                });
            }
            catch (error) {
                handleMessagesModuleError(error, {
                    operation: 'chatTextareaClick',
                    logLevel: 'error',
                    severity: 'recoverable'
                });
            }
        }, { once: false });
        chatTextarea.dataset.listenersAttached = 'true';
        Logger.debug('✅ MESSAGE_INPUT: Click handler attached to chat-textarea', null, 'messages');
    };
    // Start attaching handler
    attachClickHandler();
    // Remove auto-resize since it's now readonly and single row
    // Remove Enter key handler since it's readonly
    // Remove send button handler since input is readonly
    // Cancel context (reply/edit mode)
    if (cancelContextButton) {
        cancelContextButton.addEventListener('click', () => {
            const clearContext = getWindowFunction('clearContext');
            if (clearContext && typeof clearContext === 'function') {
                clearContext();
            }
        });
    }
    Logger.debug('✅ MESSAGE_INPUT: Message input event listeners added', null, 'messages');
}
/**
 * Send chat message
 * COMP METHOD: Matches original implementation
 */
async function sendChatMessage() {
    const chatTextarea = document.getElementById('chat-textarea');
    if (!chatTextarea) {
        Logger.error('❌ SEND_CHAT_MESSAGE: Chat textarea not found', null, 'messages');
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
            const handleEditMessageFn = getWindowFunction('handleEditMessage');
            if (handleEditMessageFn && typeof handleEditMessageFn === 'function') {
                const messageToEdit = getCurrentChatData().find(m => m.id === editingMessageId);
                if (messageToEdit) {
                    await handleEditMessageFn({ ...messageToEdit, content: content });
                }
                else {
                    Logger.error('❌ SEND_CHAT_MESSAGE: Message to edit not found:', editingMessageId, 'messages');
                }
            }
        }
        else {
            // Handle new message only (replies now use UnifiedMessageModal)
            const sendMessageViaSupabaseFn = getWindowFunction('sendMessageViaSupabase');
            if (sendMessageViaSupabaseFn && typeof sendMessageViaSupabaseFn === 'function') {
                const messageData = await sendMessageViaSupabaseFn({ content });
                if (messageData) {
                    Logger.debug('✅ SEND_CHAT_MESSAGE: Message sent:', messageData, 'messages');
                    // Add message to UI immediately for responsiveness
                    const addMessageToChat = window.addMessageToChat;
                    if (typeof window !== 'undefined' && addMessageToChat) {
                        await addMessageToChat(messageData);
                    }
                }
            }
            else {
                Logger.error('❌ SEND_CHAT_MESSAGE: sendMessageViaSupabase not available', null, 'messages');
            }
        }
    }
    catch (error) {
        const currentUrlData = stateManagerInstance.getState('currentUrlData');
        handleModuleError(error, {
            component: 'MessagesModule',
            operation: 'sendChatMessage',
            severity: 'recoverable',
            showUserNotification: true,
            userMessage: 'Failed to send message',
            context: {
                pageId: currentUrlData?.pageId
            }
        });
    }
    finally {
        chatTextarea.value = '';
        const autoResize = getWindowFunction('autoResize');
        if (autoResize && typeof autoResize === 'function') {
            autoResize(chatTextarea);
        }
        const clearContext = getWindowFunction('clearContext');
        if (clearContext && typeof clearContext === 'function') {
            clearContext();
        }
    }
}
const messagesModuleApi = {
    addMessageToChat,
    createUnifiedMessageElement,
    updateReactionDisplay,
    addMessageActionListeners,
    loadMessageReactions,
    handleMessageFocus,
    loadChatHistory,
    updateMessageInChat,
    removeMessageFromChat,
    getSenderName,
    convertUrlsToLinks,
    formatMessageTime,
    getSenderInitial,
    canUserEditMessage,
    checkAndAddThreadToggle,
    toggleThreadReplies,
    sendMessageViaSupabase,
    getSenderAvatar,
    handleShareMessage,
    handleStartThread,
    handleCopyLink,
    focusOnMessage,
    parseMessageUrl,
    handleIncomingMessageUrl,
    handleBackNavigation,
    handleReaction,
    setupMessageInputEventListeners,
    sendChatMessage,
    handleReplyToMessage,
    handleQuoteMessage,
    handleRepostMessage,
    handleBookmarkMessage,
    handleDeleteMessage,
    handleEditMessage,
    getMessageActionMenu
};
export { addMessageToChat, createUnifiedMessageElement, updateReactionDisplay, addMessageActionListeners, loadMessageReactions, handleMessageFocus, loadChatHistory, updateMessageInChat, removeMessageFromChat, getSenderName, convertUrlsToLinks, formatMessageTime, getSenderInitial, canUserEditMessage, checkAndAddThreadToggle, toggleThreadReplies, sendMessageViaSupabase, getSenderAvatar, handleShareMessage, handleStartThread, handleCopyLink, focusOnMessage, parseMessageUrl, handleIncomingMessageUrl, handleBackNavigation, handleReaction, setupMessageInputEventListeners, sendChatMessage, handleReplyToMessage, handleQuoteMessage, handleRepostMessage, handleBookmarkMessage, handleDeleteMessage, handleEditMessage, getMessageActionMenu };
export default messagesModuleApi;
Logger.debug('✅ MessagesModule loaded with all functions', null, 'messages');
let messageInputListenersInitialized = false;
export function initializeMessagesModule() {
    if (messageInputListenersInitialized) {
        return;
    }
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        Logger.debug('ℹ️ MessagesModule: Skipping input listener bootstrap (no DOM)', null, 'messages');
        return;
    }
    const runSetup = () => {
        try {
            setupMessageInputEventListeners();
        }
        catch (error) {
            handleModuleError(error, {
                component: 'MessagesModule',
                operation: 'setupMessageInputEventListeners',
                severity: 'recoverable',
                showUserNotification: false
            });
        }
    };
    messageInputListenersInitialized = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runSetup, { once: true });
    }
    else {
        runSetup();
    }
}
initializeMessagesModule();
//# sourceMappingURL=MessagesModule.js.map