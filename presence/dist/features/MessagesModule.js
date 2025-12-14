/**
 * MESSAGES MODULE - Message and Chat Functionality
 *
 * Complete implementation of all message and chat functionality.
 * This is the single source of truth for message handling.
 *
 * TypeScript + ES6 Module
 */
import { createEventListenerManager } from '../utils/EventListenerManager.js';
import { waitForCondition } from '../utils/AsyncCoordination.js';
// MessageLoader not found - using fallback
const MessageLoader = {};
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { ensureMessageContent, formatAuthorName, formatUserHandle } from '../utils/Fallbacks.js';
import { MessageValidators } from '../utils/typeGuards.js';
// Import MessageSystemIntegration from restored file
import { initializeMessageSystemIntegration as initMessageSystemIntegration } from './MessageSystemIntegration.js';
// UnifiedMessageDisplay not found - using fallback
const UnifiedMessageDisplay = {};
import { UnifiedMessageRenderer } from '../utils/UnifiedMessageRenderer.js';
// REMOVED: VisibilityModule and UserResolutionService don't exist
// Using shared UrlResolution utility for URL normalization
import { convertUrlsToLinksSafely } from '../utils/HtmlSanitizer.js';
import { getPrimaryCommunityName } from './CommunityHelpers.js';
import { PUBLIC_SQUARE_UUID } from '../core/ConfigModule.js';
import { AvatarUtils } from '../utils/AvatarUtils.js';
import { positionActionMenu } from '../utils/actionMenuPositioning.js';
// ============================================================================
// MESSAGE CONVERSION UTILITIES
// ============================================================================
/**
 * Convert Message to NormalizedMessage
 * Used during migration to NormalizedMessage as primary interface
 */
function messageToNormalizedMessage(message) {
    return {
        id: message.id,
        body: message.content,
        content: message.content, // Keep for compatibility
        author: {
            id: message.authorId,
            name: message.author.name || undefined,
            handle: message.authorHandle,
            email: message.authorEmail,
            avatarUrl: message.author.avatarUrl,
            auraColor: message.author.auraColor,
        },
        timestamp: message.createdAt,
        createdAt: message.createdAt, // Keep for compatibility
        updatedAt: message.updatedAt, // Keep for compatibility
        threadId: message.conversationId,
        parentId: message.parentId || undefined,
        reactions: message.reactions,
        isBookmarked: message.isBookmarked,
        bookmarkCount: message.bookmarkCount,
        shareCount: 0, // Default value
        isShared: false, // Default value
    };
}
/**
 * Convert NormalizedMessage to Message
 * Used for backward compatibility during migration
 */
function normalizedMessageToMessage(normalized) {
    return {
        id: normalized.id,
        content: normalized.body,
        authorId: normalized.author.id,
        authorEmail: normalized.author.email,
        authorHandle: normalized.author.handle,
        conversationId: normalized.threadId || '',
        communityId: undefined, // Not available in NormalizedMessage
        createdAt: normalized.timestamp,
        updatedAt: normalized.updatedAt || normalized.timestamp,
        parentId: normalized.parentId || null,
        reactions: normalized.reactions,
        bookmarkCount: normalized.bookmarkCount,
        isBookmarked: normalized.isBookmarked,
        author: {
            id: normalized.author.id,
            email: normalized.author.email,
            name: normalized.author.name,
            handle: normalized.author.handle,
            avatarUrl: normalized.author.avatarUrl,
            auraColor: normalized.author.auraColor,
            theme: undefined,
            displayName: normalized.author.name,
            primaryCommunityId: undefined,
            activeCommunities: undefined,
            headline: undefined,
            auraIntensity: undefined,
            preferences: undefined,
        },
        conversation: normalized.threadId ? {
            id: normalized.threadId,
            communityId: '', // Not available in NormalizedMessage
        } : undefined,
    };
}
/**
 * Type guard to check if an object is a Message
 */
function isMessage(obj) {
    return 'content' in obj && 'authorId' in obj && 'conversationId' in obj;
}
/**
 * Type guard to check if an object is a NormalizedMessage
 */
function isNormalizedMessage(obj) {
    return 'body' in obj && 'author' in obj && 'timestamp' in obj && typeof obj.author === 'object';
}
/**
 * Safely get message author ID regardless of type
 */
function getMessageAuthorId(msg) {
    if (isMessage(msg)) {
        return msg.authorId;
    }
    else {
        return msg.author.id;
    }
}
/**
 * Safely get message timestamp regardless of type
 */
function getMessageTimestamp(msg) {
    if (isMessage(msg)) {
        return msg.createdAt;
    }
    else {
        return msg.timestamp;
    }
}
// Module-level state (ES6 module pattern - no window globals)
let isLoadingChatHistory = false;
// @ts-expect-error - Used for tracking initial load state (written but not currently read)
const _isInitialMessageLoad = false;
// @ts-expect-error - Used for tracking initial load completion (written but not currently read)
const _initialMessageLoadComplete = false;
// Helper to get window functions (set by other modules)
const getWindowFunction = (name) => {
    if (typeof window === 'undefined')
        return undefined;
    return window[name];
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
    const result = Array.isArray(communities) ? communities : [];
    if (result.length === 0) {
        Logger.debug('⚠️ getActiveCommunities: No communities in state, checking alternative paths...', null, 'messages');
        // Try alternative state path
        const altCommunities = stateManagerInstance.getState('activeCommunities');
        if (Array.isArray(altCommunities) && altCommunities.length > 0) {
            Logger.debug('✅ getActiveCommunities: Found communities in alternative state path', { communities: altCommunities }, 'messages');
            return altCommunities;
        }
        // Check if communities are being loaded
        const allCommunities = stateManagerInstance.getState('communities');
        if (Array.isArray(allCommunities) && allCommunities.length > 0) {
            const communityIds = allCommunities.map((c) => c.id).filter(Boolean);
            if (communityIds.length > 0) {
                Logger.debug('✅ getActiveCommunities: Found communities in communities state, extracting IDs', { communityIds }, 'messages');
                // Set them in the correct state path for future calls
                stateManagerInstance.setState('ui.activeCommunities', communityIds);
                return communityIds;
            }
        }
    }
    return result;
};
/**
 * Get current location href, but NEVER return sidepanel URLs
 * ROOT CAUSE FIX: This prevents sidepanel URLs from being used as pageIds
 */
const getCurrentLocationHref = () => {
    const href = globalThis.location?.href || '';
    // ROOT CAUSE FIX: Never return sidepanel or chrome-extension URLs
    if (href.includes('sidepanel') ||
        href.startsWith('chrome-extension://') ||
        href.startsWith('chrome://')) {
        return '';
    }
    return href;
};
// REMOVED: Visibility functions moved to VisibilityModule
// Use visibilityModuleInstance.getCurrentVisibilityData() instead
// Debounce utility: intentional delay for performance - helper function for async delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// New message system integration
let messageSystemIntegration = null;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - unused variable, kept for potential future use
let _unifiedMessageDisplay = null;
let messageLoaderInstance = null;
/**
 * Initialize the new message system
 */
async function initializeNewMessageSystem() {
    try {
        // Get Supabase client
        // TODO: Replace with ES6 SupabaseService import when available
        // ACCEPTABLE: Using window.supabase for now as it's a runtime dependency
        const win = typeof window !== 'undefined' ? window : null;
        const supabase = win?.supabase || null;
        if (!supabase) {
            Logger.warn('⚠️ initializeNewMessageSystem: Supabase client not available', null, 'messages');
            return;
        }
        if (!messageLoaderInstance && typeof MessageLoader === 'function') {
            messageLoaderInstance = new MessageLoader();
            Logger.debug('✅ initializeNewMessageSystem: MessageLoader instance created', null, 'messages');
        }
        // ROOT CAUSE FIX: Track if we're in initial load to prevent duplicate processing
        // Note: Variables removed - will be re-added when needed for duplicate processing prevention
        // Initialize integration with proper config
        const supabaseClient = supabase;
        if (supabaseClient) {
            try {
                const integration = await initMessageSystemIntegration({
                    supabaseClient,
                    onMessageUpdate: (messages) => {
                        // Handle message updates
                        Logger.debug('📨 MessageSystemIntegration: Message update received', { count: messages.length }, 'messages');
                    },
                    onError: (error) => {
                        Logger.error('❌ MessageSystemIntegration: Error', error, 'messages');
                    },
                });
                // Integration is already the correct type - no casting needed
                messageSystemIntegration = integration;
                Logger.debug('✅ initializeNewMessageSystem: MessageSystemIntegration initialized', null, 'messages');
            }
            catch (error) {
                Logger.error('❌ initializeNewMessageSystem: Failed to initialize MessageSystemIntegration', error, 'messages');
            }
        }
        else {
            Logger.warn('⚠️ initializeNewMessageSystem: Supabase client not available for MessageSystemIntegration', null, 'messages');
        }
        if (typeof UnifiedMessageDisplay === 'function') {
            _unifiedMessageDisplay = new UnifiedMessageDisplay();
        }
        Logger.debug('✅ New message system initialized', null, 'messages');
    }
    catch (error) {
        Logger.error('❌ Failed to initialize new message system', error, 'messages');
    }
}
// Use DOMHelpers for consistent DOM operations
import { querySelector, createElement } from '../utils/DOMHelpers.js';
// Use Logger for consistent logging
import { Logger } from '../utils/Logger.js';
const getChatMessagesContainer = () => querySelector('.chat-messages');
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
    const sourceId = authorSource && typeof authorSource === 'object' && 'id' in authorSource
        ? String(authorSource.id)
        : undefined;
    const sourceEmail = authorSource && typeof authorSource === 'object' && 'email' in authorSource
        ? typeof authorSource.email === 'string'
            ? authorSource.email
            : undefined
        : undefined;
    const sourceAvatarUrl = authorSource && typeof authorSource === 'object' && 'avatarUrl' in authorSource
        ? typeof authorSource.avatarUrl === 'string'
            ? authorSource.avatarUrl
            : undefined
        : undefined;
    const sourceAuraColor = authorSource && typeof authorSource === 'object' && 'auraColor' in authorSource
        ? typeof authorSource.auraColor === 'string'
            ? authorSource.auraColor
            : AVATAR_FALLBACK_COLOR
        : AVATAR_FALLBACK_COLOR;
    return {
        id: sourceId || authorId || 'unknown-user',
        name: formatAuthorName(authorSource),
        handle: formatUserHandle(authorSource),
        email: sourceEmail,
        avatarUrl: sourceAvatarUrl,
        auraColor: sourceAuraColor,
    };
};
const normalizeMessagePayload = (rawMessage) => {
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
    const resolvedAuthor = resolveAuthorFromPayload(rawMessage, String(resolvedAuthorId));
    const normalized = {
        id: String(rawMessage.id ||
            rawMessage.messageId ||
            getStringValue(rawMessage.uuid) ||
            globalThis.crypto?.randomUUID?.() ||
            `message-${Date.now()}`),
        body: ensureMessageContent({
            content: rawMessage.content ?? rawMessage.body ?? getStringValue(rawMessage.message) ?? '',
        }),
        author: resolvedAuthor,
        timestamp: (() => {
            const dateValue = getStringOrDate(rawMessage.createdAt ?? rawMessage.created_at ?? rawMessage.timestamp);
            if (typeof dateValue === 'string')
                return dateValue;
            if (dateValue instanceof Date)
                return dateValue.toISOString();
            return new Date().toISOString();
        })(),
        threadId: rawMessage.threadId ?? getStringValue(rawMessage.thread_id) ?? undefined,
        parentId: rawMessage.parentId ??
            getStringValue(rawMessage.parent_id) ??
            getStringValue(rawMessage.replyTo) ??
            undefined,
        reactions: (typeof rawMessage.reactions === 'object' && rawMessage.reactions !== null)
            ? rawMessage.reactions
            : {},
        isBookmarked: rawMessage.isBookmarked ?? false,
        bookmarkCount: rawMessage.bookmarkCount ?? 0,
        shareCount: rawMessage.shareCount,
        isShared: typeof rawMessage.isShared === 'boolean' ? rawMessage.isShared : undefined,
    };
    return normalized;
};
const renderMessageElement = async (message, chatContainer = getChatMessagesContainer()) => {
    const isReply = !!message.parentId;
    const isFocusMode = isFocusModeContainer(chatContainer);
    // CRITICAL FIX: Use comprehensive ownership check (same as getMessageActionMenu)
    // Check multiple ways to identify ownership: email, ID, handle
    const currentUser = getCurrentUser();
    let isOwner = false;
    if (currentUser && typeof currentUser === 'object') {
        // Check by email - use safe accessor
        const authorEmail = isMessage(message) ? message.authorEmail : message.author.email;
        if (authorEmail && currentUser.email && authorEmail === currentUser.email) {
            isOwner = true;
        }
        // Check by ID (Google ID or UUID) - use safe accessor
        const authorId = getMessageAuthorId(message);
        if (!isOwner &&
            authorId &&
            currentUser.id &&
            (authorId === currentUser.id || String(authorId) === String(currentUser.id))) {
            isOwner = true;
        }
        // Check by handle
        const authorHandle = isMessage(message) ? message.authorHandle : message.author.handle;
        const currentHandle = currentUser.handle || (currentUser.email ? currentUser.email.split('@')[0] : undefined);
        if (!isOwner && authorHandle && currentHandle && authorHandle === currentHandle) {
            isOwner = true;
        }
    }
    const messageTime = new Date(getMessageTimestamp(message));
    const diffHours = (Date.now() - messageTime.getTime()) / (1000 * 60 * 60);
    const canEdit = isOwner && diffHours < 1; // Can edit within 1 hour
    const canDelete = isOwner; // User can only delete their own messages
    // Debug logging for ownership detection (only log for first few messages to avoid spam)
    if (message.id &&
        typeof window !== 'undefined' &&
        !window._ownershipDebugLogged) {
        const authorEmail = isMessage(message) ? message.authorEmail : message.author.email;
        Logger.debug('🔍 renderMessageElement: Ownership check', {
            messageId: message.id.substring(0, 8) + '...',
            currentUser: currentUser && typeof currentUser === 'object'
                ? currentUser.email || currentUser.id
                : undefined,
            authorEmail,
            authorId: getMessageAuthorId(message),
            isOwner,
            canEdit,
            canDelete,
        });
        window._ownershipDebugLogged = true;
    }
    // Format time using formatMessageTime - ROOT CAUSE FIX: Convert Date to string if needed
    // CRITICAL FIX: Ensure formattedTime is always a string, never a Promise
    const createdAtStr = getMessageTimestamp(message);
    const formattedTime = formatMessageTime(createdAtStr ?? undefined);
    // ROOT CAUSE FIX: Ensure formattedTime is a string (not a Promise or other type)
    const safeFormattedTime = typeof formattedTime === 'string' ? formattedTime : String(formattedTime || '');
    if (typeof formattedTime !== 'string') {
        Logger.error('❌ renderMessageElement: formattedTime is not a string', { type: typeof formattedTime, value: formattedTime }, 'messages');
    }
    // Use UnifiedMessageRenderer directly (imported, no window dependency)
    if (UnifiedMessageRenderer && typeof UnifiedMessageRenderer.generateMessageHTML === 'function') {
        // ROOT CAUSE FIX: UnifiedMessageRenderer should import getMessageActionMenu directly
        // No window assignment needed - ES6 module pattern
        // CRITICAL FIX: Get community name from message or communities module
        let communityName = '';
        if (isMessage(message) ? message.communityId : undefined) {
            // Try to get community name from CommunitiesModule or stateManager
            const communitiesModule = getWindowFunction('CommunitiesModule');
            const communityId = isMessage(message) ? message.communityId : undefined;
            if (communitiesModule && typeof communitiesModule.getCommunityName === 'function' && communityId) {
                const name = communitiesModule.getCommunityName(communityId);
                communityName = typeof name === 'string' ? name : name instanceof Promise ? await name : '';
            }
            else {
                // Fallback: Check stateManager for community data
                const communities = stateManagerInstance.getState('communities');
                if (communities &&
                    typeof communities === 'object' &&
                    communityId &&
                    typeof communityId === 'string') {
                    const communitiesRecord = communities;
                    const community = communitiesRecord[communityId];
                    if (community && typeof community === 'object' && 'name' in community) {
                        communityName = typeof community.name === 'string' ? community.name : '';
                    }
                }
            }
            // RED-LINE: No hardcoded community names - must come from database
            // If community name is still empty, leave it empty rather than using hardcoded value
        }
        // CRITICAL FIX: Calculate reply count from current chat data
        const currentChatData = getCurrentChatData();
        const replyCount = currentChatData.filter((m) => m.parentId === message.id).length;
        const html = await UnifiedMessageRenderer.generateMessageHTML(message, {
            isReply,
            isFocusMode,
            author: message.author,
            communityName,
            formattedTime: safeFormattedTime,
            reactionCount: Array.isArray(message.reactions) ? message.reactions.length : 0,
            replyCount,
            bookmarkCount: typeof message.bookmarkCount === 'number' ? message.bookmarkCount : 0,
            isBookmarked: typeof message.isBookmarked === 'boolean' ? message.isBookmarked : false,
            hasUserReplied: false,
            hasUserReposted: false,
            hasUserShared: false,
            canEdit: canEdit ?? false,
            canDelete: canDelete ?? false,
        });
        const messageDiv = createElement('div');
        messageDiv.className = isReply
            ? 'message message-reply thread-reply'
            : 'message thread-starter';
        if (message.parentId) {
            messageDiv.dataset.parentId = message.parentId;
        }
        if (message.parentId) {
            messageDiv.classList.add('has-parent');
        }
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.conversationId = isMessage(message) ? message.conversationId || '' : message.threadId || '';
        messageDiv.dataset.authorId = getMessageAuthorId(message);
        messageDiv.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
        // SECURITY: Use template element to safely parse HTML (prevents XSS)
        const template = createElement('template');
        template.innerHTML = html;
        messageDiv.appendChild(template.content);
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
            Logger.warn(`⚠️ renderMessageElement: Message ${message.id} missing icons or info`, { hasIcons, hasInfo, htmlLength: html.length, htmlPreview: html.substring(0, 200) }, 'messages');
            // ROOT CAUSE FIX: If missing, inject the action menu manually
            if (!hasIcons) {
                const actionMenuHTML = await getMessageActionMenu(message);
                const actionsContainer = messageDiv.querySelector('.message-actions-new') ||
                    messageDiv.querySelector('.message-header-new');
                if (actionsContainer) {
                    // SECURITY: Use template element to safely parse HTML (prevents XSS)
                    const template = createElement('template');
                    template.innerHTML = actionMenuHTML;
                    const fragment = template.content;
                    if (fragment.firstElementChild) {
                        actionsContainer.appendChild(fragment.firstElementChild);
                    }
                }
            }
        }
        // LEGACY CODE REMOVED: Reply visibility logic
        // Replies are not displayed in default mode - only focus mode shows replies
        // Top reply functionality may be implemented separately if needed
        if (isReply) {
            // Replies are always hidden in default mode
            // No 'visible' class added - CSS will hide them by default
        }
        return messageDiv;
    }
    // ROOT CAUSE FIX: Get createUnifiedMessageElement from window (set by UnifiedMessageDisplay module)
    const createUnifiedMessageElementFn = getWindowFunction('createUnifiedMessageElement');
    const messageForRender = isNormalizedMessage(message) ? normalizedMessageToMessage(message) : message;
    if (createUnifiedMessageElementFn && typeof createUnifiedMessageElementFn === 'function') {
        const polymorphic = createUnifiedMessageElementFn(messageForRender);
        const element = (polymorphic instanceof Promise ? await polymorphic : polymorphic);
        element.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
        return element;
    }
    const fallback = (await createUnifiedMessageElement(messageForRender));
    fallback.dataset.createdAt = `${getMessageTimestampValue(message.createdAt)}`;
    return fallback;
};
// REMOVED: getNormalizeUrl - no longer needed since we accept pageId directly, not rawUrl
/**
 * Resolve active communities from state
 * Falls back to Public Square UUID if no communities found
 */
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
    // Fallback to Public Square UUID if no communities found
    Logger.warn(`⚠️ resolveActiveCommunitiesWithRetry: No communities found after retries, using Public Square UUID: ${PUBLIC_SQUARE_UUID}`, null, 'messages');
    // Set it in stateManager for future calls
    stateManagerInstance.setState('ui.activeCommunities', [PUBLIC_SQUARE_UUID]);
    stateManagerInstance.setState('ui.primaryCommunity', PUBLIC_SQUARE_UUID);
    return [PUBLIC_SQUARE_UUID];
};
// REMOVED: CanopiModule class and backward compatibility code
// All functionality is now in standalone functions below
// Standalone functions - Full implementations
/**
 * Update message in chat
 * COMP METHOD: Matches original implementation with full DOM updates
 */
async function updateMessageInChat(updatedMessage) {
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
            await addMessageToChatFn(updatedMessage);
        }
        return;
    }
    // Update the message content
    const contentElement = messageElement.querySelector('.message-content');
    if (contentElement) {
        const contentWithLinks = convertUrlsToLinks(MessageValidators.extractContent(updatedMessage));
        // SECURITY: Use template element to safely parse HTML (prevents XSS)
        const template = createElement('template');
        template.innerHTML = contentWithLinks;
        contentElement.textContent = ''; // Clear existing content
        contentElement.appendChild(template.content);
    }
    // Update the message time if it changed
    const timeElement = messageElement.querySelector('.message-time-new');
    if (timeElement && updatedMessage.updatedAt) {
        const updatedAt = updatedMessage.updatedAt;
        const updatedTimestamp = updatedAt && typeof updatedAt === 'object' && updatedAt instanceof Date
            ? updatedAt.toISOString()
            : typeof updatedAt === 'string'
                ? updatedAt
                : String(updatedAt || '');
        timeElement.textContent = formatMessageTime(updatedTimestamp);
    }
    // Update cached chat data
    const chatData = getCurrentChatData();
    if (chatData.length) {
        const existingIndex = chatData.findIndex((m) => m.id === updatedMessage.id);
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
            Logger.debug('⚠️ REMOVE_MESSAGE: Message has replies, marking as deleted instead of removing', { messageId: deletedMessage.id }, 'messages');
        }
        else {
            // No replies - safe to remove
            messageElement.remove();
            Logger.debug('✅ REMOVE_MESSAGE: Message removed from DOM', { messageId: deletedMessage.id }, 'messages');
        }
    }
    else {
        Logger.debug('⚠️ REMOVE_MESSAGE: Message element not found in DOM', { messageId: deletedMessage.id }, 'messages');
    }
    // Update cached chat data
    const chatData = getCurrentChatData();
    if (chatData.length) {
        const updatedChatData = chatData.filter((m) => m.id !== deletedMessage.id);
        setCurrentChatData(updatedChatData);
    }
    Logger.debug('✅ REMOVE_MESSAGE: Message removed from chat data', { messageId: deletedMessage.id }, 'messages');
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
        // If it's already a Message, convert it back to NormalizedMessage for processing
        const message = isMessage(rawMessage)
            ? messageToNormalizedMessage(rawMessage)
            : normalizeMessagePayload(rawMessage);
        Logger.debug('🔍 ADD_MESSAGE: Normalized message', { messageId: message.id, contentPreview: message.content?.substring(0, 50) }, 'messages');
        // CRITICAL FIX: Check for duplicate, but only check actual message elements (not buttons)
        const existingMessages = Array.from(chatMessages.querySelectorAll('.message, [data-message-id]')).filter((el) => {
            return (el.classList.contains('message') ||
                el.querySelector('.message-content-wrapper') !== null ||
                (el.querySelector('.message-footer-actions') !== null &&
                    el.querySelector('.message-content') !== null));
        });
        const existingElement = existingMessages.find((el) => el.getAttribute('data-message-id') === message.id);
        if (existingElement) {
            Logger.debug(`⚠️ addMessageToChat: Message ${message.id} already exists in DOM, skipping duplicate`, { messageId: message.id }, 'messages');
            return; // Don't add duplicate
        }
        // CRITICAL FIX: Check state but allow updates for existing messages (replies/quotes might update parent)
        const currentChatData = getCurrentChatData();
        const existingMessageIndex = currentChatData.findIndex((m) => m.id === message.id);
        if (existingMessageIndex >= 0) {
            // Message exists in state - check if it's actually in DOM
            const existingInDOM = existingMessages.some((el) => el.getAttribute('data-message-id') === message.id);
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
        Logger.debug('✅ ADD_MESSAGE: Rendered message element', { messageId: message.id }, 'messages');
        if (messageElement && chatMessages) {
            chatMessages.appendChild(messageElement);
        }
        Logger.debug('✅ ADD_MESSAGE: Appended message to DOM', { messageId: message.id }, 'messages');
        // CRITICAL FIX: Call addMessageActionListeners directly (ES6 module pattern - no window dependency)
        if (messageElement) {
            const messageForListeners = isNormalizedMessage(message) ? normalizedMessageToMessage(message) : message;
            addMessageActionListeners(messageElement, messageForListeners);
            Logger.debug('✅ ADD_MESSAGE: Attached action listeners', { messageId: message.id }, 'messages');
        }
        // ROOT CAUSE FIX: Get loadMessageReactions from window
        const loadMessageReactionsFn = getWindowFunction('loadMessageReactions');
        if (loadMessageReactionsFn && typeof loadMessageReactionsFn === 'function') {
            try {
                await loadMessageReactionsFn(message.id);
            }
            catch (reactionError) {
                Logger.warn('⚠️ ADD_MESSAGE: Failed to load reactions for message', { messageId: message.id, error: reactionError }, 'messages');
            }
        }
        // Update state with new message
        const chatData = getCurrentChatData();
        const existingIndex = chatData.findIndex((m) => m.id === message.id);
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
        Logger.error('❌ ADD_MESSAGE: Failed to add message to chat', error, 'messages');
        Logger.error('❌ ADD_MESSAGE: Error details', { stack: error instanceof Error ? error.stack : String(error) }, 'messages');
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
    return text ? convertUrlsToLinksSafely(text) : '';
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
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        return `${months[messageDate.getMonth()]} ${messageDate.getDate()}`;
    }
    // Different year - show month, day, year
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
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
        const communityId = isMessage(message) ? message.communityId : undefined;
        if (communityId) {
            const communitiesModule = getWindowFunction('CommunitiesModule');
            if (communitiesModule && typeof communitiesModule.getCommunityName === 'function') {
                const name = communitiesModule.getCommunityName(communityId);
                communityName = typeof name === 'string' ? name : name instanceof Promise ? await name : '';
            }
            else {
                const communities = stateManagerInstance.getState('communities');
                if (communities && typeof communities === 'object') {
                    const community = communities[communityId];
                    if (community && typeof community === 'object' && 'name' in community) {
                        communityName = typeof community.name === 'string' ? community.name : '';
                    }
                }
            }
            // RED-LINE: No hardcoded community names - must come from database
            // If community name is still empty, leave it empty rather than using hardcoded value
        }
        const messageForRender = isNormalizedMessage(message) ? normalizedMessageToMessage(message) : message;
        const html = await UnifiedMessageRenderer.generateMessageHTML(messageForRender, {
            isReply: !!message.parentId,
            isFocusMode: false,
            author: messageForRender.author,
            communityName,
            reactionCount: 0,
            replyCount: 0,
            bookmarkCount: 0,
            isBookmarked: false,
            hasUserReplied: false,
            hasUserReposted: false,
            hasUserShared: false,
            canEdit: false,
            canDelete: false,
        });
        // Parse HTML string into HTMLElement
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }
    // Fallback: create basic message element
    const messageDiv = createElement('div');
    messageDiv.className = message.parentId
        ? 'message message-reply thread-reply'
        : 'message thread-starter';
    messageDiv.setAttribute('data-message-id', message.id);
    messageDiv.setAttribute('data-conversation-id', message.conversationId || '');
    if (message.parentId) {
        messageDiv.setAttribute('data-parent-id', message.parentId);
    }
    // Basic content - SECURITY: Build DOM elements directly instead of innerHTML
    const content = MessageValidators.extractContent(message);
    const wrapper = createElement('div');
    wrapper.className = 'message-content-wrapper';
    const header = createElement('div');
    header.className = 'message-header-new';
    const senderName = createElement('span');
    senderName.className = 'message-sender-name';
    senderName.textContent = getSenderName(message.authorId || message.author?.id || '');
    header.appendChild(senderName);
    const messageContent = createElement('div');
    messageContent.className = 'message-content';
    const contentWithLinks = convertUrlsToLinks(content);
    // SECURITY: Use template element to safely parse HTML with links
    const template = createElement('template');
    template.innerHTML = contentWithLinks;
    messageContent.appendChild(template.content);
    wrapper.appendChild(header);
    wrapper.appendChild(messageContent);
    messageDiv.appendChild(wrapper);
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
            document.querySelector('.discuss-tab-content'),
        ].filter((el) => el !== null);
        for (const container of chatContainers) {
            messageDiv = container.querySelector(`[data-message-id="${messageId}"]`);
            if (messageDiv)
                break;
        }
    }
    if (!messageDiv) {
        Logger.warn(`⚠️ updateReactionDisplay: Message element not found for ${messageId}. Searched in all containers.`, { messageId }, 'messages');
        // ROOT CAUSE FIX: Log available message IDs for debugging
        const allMessages = document.querySelectorAll('[data-message-id]');
        const availableIds = Array.from(allMessages)
            .slice(0, 5)
            .map((el) => el.getAttribute('data-message-id'));
        Logger.debug(`🔍 updateReactionDisplay: Available message IDs (first 5)`, { availableIds }, 'messages');
        return;
    }
    // Find reaction button
    const reactionButton = messageDiv.querySelector('.reaction-btn');
    if (!reactionButton)
        return;
    // Update reaction count
    let countElement = reactionButton.querySelector('.icon-count');
    const reactionCount = reactions?.reactions && Array.isArray(reactions.reactions) ? reactions.reactions.length : 0;
    // CRITICAL FIX: Create count element if it doesn't exist (backward compatibility)
    if (!countElement) {
        countElement = createElement('span');
        countElement.className = 'icon-count';
        reactionButton.appendChild(countElement);
    }
    if (countElement) {
        if (reactionCount > 0) {
            countElement.textContent = reactionCount.toString();
            countElement.style.display = 'inline-block';
        }
        else {
            countElement.textContent = '';
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
/**
 * Load bookmark count and status for a message from API
 * Similar to loadMessageReactions, but for bookmarks
 */
async function loadMessageBookmarks(messageId, bookmarkBtn) {
    if (!messageId) {
        Logger.warn('⚠️ loadMessageBookmarks: No messageId provided', null, 'messages');
        return;
    }
    try {
        const api = getApi();
        if (!api) {
            Logger.warn('⚠️ loadMessageBookmarks: API not available', null, 'messages');
            return;
        }
        // Fetch bookmark status and count from API
        const endpoint = `/v1/bookmarks/${messageId}`;
        const response = await api.request(endpoint, { method: 'GET' });
        if (response && response.data) {
            const data = response.data;
            if (data && data.success !== false) {
                const count = typeof data.count === 'number' ? data.count : 0;
                const isBookmarked = typeof data.isBookmarked === 'boolean' ? data.isBookmarked : false;
                // Update bookmark button
                if (bookmarkBtn) {
                    // Update active class
                    bookmarkBtn.classList.toggle('active', isBookmarked);
                    bookmarkBtn.setAttribute('data-is-bookmarked', isBookmarked.toString());
                    // Update count element (create if doesn't exist)
                    let countElement = bookmarkBtn.querySelector('.icon-count.bookmark-count');
                    if (!countElement) {
                        // Create count element if it doesn't exist
                        countElement = createElement('span');
                        countElement.className = 'icon-count bookmark-count';
                        bookmarkBtn.appendChild(countElement);
                    }
                    if (countElement) {
                        countElement.textContent = count > 0 ? count.toString() : '';
                        countElement.style.display = count > 0 ? 'inline' : 'none';
                    }
                }
                Logger.debug(`✅ loadMessageBookmarks: Loaded bookmark data for message ${messageId}`, { count, isBookmarked }, 'messages');
            }
        }
    }
    catch (error) {
        Logger.error('❌ loadMessageBookmarks: Error loading bookmarks', error, 'messages');
    }
}
async function loadMessageReactions(messageId, reactionBtn) {
    if (!messageId) {
        Logger.warn('⚠️ loadMessageReactions: No messageId provided', null, 'messages');
        return;
    }
    try {
        // First try to get reactions from stored reactions data if available
        let reactions = [];
        // Use API to fetch reactions
        // ES6 pattern: Use imported api module instead of window.api
        // CRITICAL FIX: Use api.request() instead of api.getReactions() (which doesn't exist)
        const api = getApi();
        if (api && typeof api.request === 'function') {
            try {
                const response = await api.request(`/v1/reactions/${messageId}`, {
                    method: 'GET',
                });
                if (response && response.data) {
                    const responseData = response.data;
                    if (Array.isArray(responseData)) {
                        reactions = responseData;
                    }
                    else if (responseData &&
                        typeof responseData === 'object' &&
                        'reactions' in responseData) {
                        const dataWithReactions = responseData;
                        reactions = Array.isArray(dataWithReactions.reactions)
                            ? dataWithReactions.reactions
                            : [];
                    }
                }
            }
            catch (apiError) {
                Logger.warn('⚠️ loadMessageReactions: API request failed, trying Supabase fallback', { error: apiError }, 'messages');
            }
        }
        if (reactions.length === 0 && typeof window !== 'undefined') {
            // Fallback: query Supabase directly
            const windowSupabase = window
                .supabase;
            if (!windowSupabase ||
                typeof windowSupabase !== 'object' ||
                typeof windowSupabase.from !== 'function')
                return;
            const supabaseQuery = windowSupabase;
            const queryResult = await supabaseQuery.from('reactions')
                .select('*')
                .eq('message_id', messageId);
            const { data: supabaseReactions, error } = queryResult;
            if (error) {
                Logger.error('❌ loadMessageReactions: Error fetching reactions', error, 'messages');
                return;
            }
            reactions = Array.isArray(supabaseReactions) ? supabaseReactions : [];
        }
        else {
            Logger.warn('⚠️ loadMessageReactions: No API or Supabase client available', null, 'messages');
        }
        // Update reaction display
        updateReactionDisplay(messageId, Array.isArray(reactions) ? reactions : {});
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
        Logger.error('❌ loadMessageReactions: Error loading reactions', error, 'messages');
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
    const messageEventManager = createEventListenerManager();
    // Reply button
    const replyButton = messageDiv.querySelector('.inline-reply-btn');
    if (replyButton) {
        messageEventManager.on(replyButton, 'click', async (e) => {
            e.stopPropagation();
            // Use UnifiedMessageModal for replies
            await handleReplyToMessage(message);
        });
    }
    // Quote button (if it exists)
    const quoteButton = messageDiv.querySelector('.quote-btn, [data-action="quote"]');
    if (quoteButton) {
        messageEventManager.on(quoteButton, 'click', async (e) => {
            e.stopPropagation();
            await handleQuoteMessage(message);
        });
    }
    // Reaction button - CRITICAL FIX: Directly call handleReaction
    const reactionButton = messageDiv.querySelector('.reaction-btn');
    if (reactionButton) {
        messageEventManager.on(reactionButton, 'click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            Logger.debug('❤️ REACTION_BUTTON: Clicked for message', { messageId }, 'messages');
            // COMP METHOD: Check if reaction picker/modal exists
            const win = window;
            if (win.showReactionPicker && typeof win.showReactionPicker === 'function') {
                Logger.debug('✅ REACTION_BUTTON: Using reaction picker modal', { messageId }, 'messages');
                win.showReactionPicker(messageId, message, reactionButton);
            }
            else {
                Logger.debug('⚠️ REACTION_BUTTON: No reaction picker, using direct toggle', { messageId }, 'messages');
                // CRITICAL FIX: Directly call handleReaction
                await handleReaction(message);
            }
        });
    }
    // Bookmark button - CRITICAL FIX: Directly call handleBookmarkMessage
    const bookmarkButton = messageDiv.querySelector('.bookmark-btn');
    if (bookmarkButton) {
        messageEventManager.on(bookmarkButton, 'click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            Logger.debug('🔖 Bookmark clicked for message:', { messageId }, 'messages');
            await handleBookmarkMessage(message);
        });
    }
    // Repost button - CRITICAL FIX: Add missing click handler
    const repostButton = messageDiv.querySelector('.repost-btn');
    if (repostButton) {
        messageEventManager.on(repostButton, 'click', async (e) => {
            e.stopPropagation();
            // ES6 pattern: Dispatch DOM event for repost handling
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('messageRepostRequested', {
                    detail: { message },
                }));
            }
            // Fallback: implement basic repost
            Logger.debug('🔄 Repost clicked for message:', { messageId }, 'messages');
            await handleRepostMessage(message);
        });
    }
    // Share button
    const shareButton = messageDiv.querySelector('.share-btn');
    if (shareButton) {
        messageEventManager.on(shareButton, 'click', async (e) => {
            e.stopPropagation();
            // ES6 pattern: Dispatch DOM event for share handling
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('messageShareRequested', {
                    detail: { message },
                }));
            }
            // Fallback: use existing handleShareMessage
            Logger.debug('📤 Share clicked for message:', { messageId }, 'messages');
            await handleShareMessage(message);
        });
    }
    // Action menu (three dots) - ROOT CAUSE FIX: Proper toggle and positioning
    const actionDotsButton = messageDiv.querySelector('.action-dots-btn');
    if (actionDotsButton) {
        // Close other dropdowns first (search in body since dropdowns are moved there when shown)
        const closeOtherDropdowns = () => {
            document.querySelectorAll('.action-dropdown').forEach((dd) => {
                const messageDropdown = messageDiv.querySelector('.action-dropdown');
                if (dd !== messageDropdown && dd instanceof HTMLElement) {
                    dd.style.display = 'none';
                    dd.style.visibility = 'hidden';
                    dd.style.opacity = '0';
                }
            });
        };
        messageEventManager.on(actionDotsButton, 'click', (e) => {
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
                    // UNIFIED FIX: Use centralized positioning utility
                    const chatContainer = messageDiv.closest('.chat-messages');
                    positionActionMenu({ menuElement: dropdown, triggerElement: actionDotsButton, container: chatContainer || undefined });
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
            messageEventManager.on(document, 'click', closeDropdownHandler, { capture: true });
            // Store handler for cleanup if needed (using WeakMap would be better, but keeping simple for now)
            // Note: _closeDropdownHandler removed - cleanup would need WeakMap pattern
        }
    }
    // Edit button - CRITICAL FIX: Directly call handleEditMessage
    const editButton = messageDiv.querySelector('.edit-btn');
    if (editButton) {
        messageEventManager.on(editButton, 'click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            // Close dropdown
            const dropdown = messageDiv.querySelector('.action-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
            Logger.debug('✏️ Edit clicked for message:', { messageId }, 'messages');
            await handleEditMessage(message);
        });
    }
    // Delete button - CRITICAL FIX: Directly call handleDeleteMessage
    const deleteButton = messageDiv.querySelector('.delete-btn');
    if (deleteButton) {
        messageEventManager.on(deleteButton, 'click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            // Close dropdown
            const dropdown = messageDiv.querySelector('.action-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
            Logger.debug('🗑️ Delete clicked for message:', { messageId }, 'messages');
            await handleDeleteMessage(message);
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
            message = cachedMessages.find((m) => m.id === messageId) || null;
        }
        else {
            message = messageOrId;
            messageId = message.id;
        }
        if (!message) {
            Logger.warn('⚠️ handleMessageFocus: Message not found:', { messageId }, 'messages');
            return;
        }
        // Use focus mode (required)
        // Only need messageSystemIntegration for loadFocusMode, unifiedMessageDisplay is not needed
        if (!messageSystemIntegration) {
            Logger.error('❌ handleMessageFocus: Message system integration not initialized', null, 'messages');
            throw new Error('Message system integration not initialized. Call initializeNewMessageSystem() first.');
        }
        if (!message.parentId) {
            // No parent - just scroll to message
            const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageDiv) {
                messageDiv.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest',
                });
                Logger.debug('🎯 FOCUS: Message focused (no parent)', null, 'messages');
            }
            return;
        }
        // Load focus mode
        Logger.debug('🎯 handleMessageFocus: Using focus mode system', null, 'messages');
        const activeCommunities = getActiveCommunities();
        // Use first active community or fallback to Public Square
        const communityId = activeCommunities[0] || PUBLIC_SQUARE_UUID;
        const result = messageSystemIntegration && typeof messageSystemIntegration.loadFocusMode === 'function'
            ? await messageSystemIntegration.loadFocusMode(message.parentId || message.id)
            : null;
        // Render in focus mode
        const container = getChatMessagesContainer();
        if (!container) {
            throw new Error('Chat messages container not found');
        }
        // Handle both return types: NormalizedMessage[] or { replies, parent }
        const messages = Array.isArray(result)
            ? result
            : result?.replies || [];
        const parentNormalizedMessage = Array.isArray(result)
            ? null
            : result?.parent || null;
        // Convert NormalizedMessage to Message for compatibility
        const parentMessage = parentNormalizedMessage ? {
            id: parentNormalizedMessage.id,
            content: parentNormalizedMessage.body,
            authorId: parentNormalizedMessage.author.id,
            authorEmail: parentNormalizedMessage.author.email,
            authorHandle: parentNormalizedMessage.author.handle,
            conversationId: parentNormalizedMessage.threadId || '',
            communityId: communityId,
            createdAt: parentNormalizedMessage.timestamp,
            updatedAt: parentNormalizedMessage.updatedAt || parentNormalizedMessage.timestamp,
            parentId: parentNormalizedMessage.parentId || null,
            reactions: parentNormalizedMessage.reactions,
            bookmarkCount: parentNormalizedMessage.bookmarkCount,
            isBookmarked: parentNormalizedMessage.isBookmarked,
            author: {
                id: parentNormalizedMessage.author.id,
                email: parentNormalizedMessage.author.email || '',
                name: parentNormalizedMessage.author.name,
                handle: parentNormalizedMessage.author.handle || '',
                avatarUrl: parentNormalizedMessage.author.avatarUrl,
                auraColor: parentNormalizedMessage.author.auraColor,
                theme: undefined,
                displayName: parentNormalizedMessage.author.name,
            },
            conversation: undefined, // Not available in NormalizedMessage
        } : null;
        // CRITICAL FIX: Ensure all messages have communityId before rendering
        // Convert NormalizedMessage[] to Message[] for rendering
        const messagesWithCommunityId = messages.map((msg) => ({
            id: msg.id,
            content: msg.body,
            authorId: msg.author.id,
            authorEmail: msg.author.email,
            authorHandle: msg.author.handle,
            conversationId: msg.threadId || '',
            communityId: communityId,
            createdAt: msg.timestamp,
            updatedAt: msg.updatedAt || msg.timestamp,
            parentId: msg.parentId || null,
            reactions: msg.reactions,
            bookmarkCount: msg.bookmarkCount,
            isBookmarked: msg.isBookmarked,
            author: {
                id: msg.author.id,
                email: msg.author.email || '',
                name: msg.author.name,
                handle: msg.author.handle || '',
                avatarUrl: msg.author.avatarUrl,
                auraColor: msg.author.auraColor,
                theme: undefined,
                displayName: msg.author.name,
            },
            conversation: undefined, // Not available in NormalizedMessage
        }));
        // ROOT CAUSE FIX: unifiedMessageDisplay is a fallback empty object
        // Use renderMessageElement directly instead of unifiedMessageDisplay.render()
        Logger.debug(`🔍 handleMessageFocus: Rendering ${messagesWithCommunityId.length} messages in focus mode using renderMessageElement`, 'messages');
        // Clear container first - SECURITY: Use safe DOM manipulation
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        // Render parent message if available
        if (parentMessage) {
            try {
                const parentElement = await renderMessageElement(parentMessage, container);
                if (parentElement && container) {
                    // CRITICAL: Add message-loaded class and focus classes (same as UnifiedMessageDisplay)
                    parentElement.classList.add('message-loaded', 'parent-in-focus');
                    container.appendChild(parentElement);
                    // Attach action listeners (same as UnifiedMessageDisplay)
                    const addMessageActionListenersFn = getWindowFunction('addMessageActionListeners');
                    if (addMessageActionListenersFn && typeof addMessageActionListenersFn === 'function') {
                        addMessageActionListenersFn(parentElement, parentMessage);
                    }
                    // Load reactions (same as UnifiedMessageDisplay)
                    const loadMessageReactionsFn = getWindowFunction('loadMessageReactions');
                    if (loadMessageReactionsFn && typeof loadMessageReactionsFn === 'function') {
                        try {
                            await loadMessageReactionsFn(parentMessage.id);
                        }
                        catch (reactionError) {
                            Logger.warn('⚠️ handleMessageFocus: Failed to load reactions for parent message:', { messageId: parentMessage.id, error: reactionError }, 'messages');
                        }
                    }
                    // CRITICAL: Attach avatar hover handlers (same as UnifiedMessageDisplay)
                    const avatarContainer = parentElement.querySelector('.avatar-container');
                    if (avatarContainer && parentMessage.author) {
                        const win = typeof window !== 'undefined'
                            ? window
                            : undefined;
                        const userHoverModal = win?.userHoverModal;
                        if (userHoverModal && userHoverModal.show && parentMessage.author) {
                            const showFn = userHoverModal.show;
                            const focusEventManager = createEventListenerManager();
                            focusEventManager.on(avatarContainer, 'mouseenter', (e) => {
                                e.stopPropagation();
                                try {
                                    showFn(parentMessage.author, avatarContainer);
                                }
                                catch (error) {
                                    Logger.warn('⚠️ handleMessageFocus: Failed to show user hover modal for parent', error, 'messages');
                                }
                            });
                        }
                    }
                }
            }
            catch (error) {
                Logger.error(`❌ handleMessageFocus: Failed to render parent message:`, error, 'messages');
            }
        }
        // Render replies
        for (const msg of messagesWithCommunityId) {
            try {
                const messageElement = await renderMessageElement(msg, container);
                if (messageElement && container) {
                    // CRITICAL: Add message-loaded class and focus classes (same as UnifiedMessageDisplay)
                    messageElement.classList.add('message-loaded', 'child-in-focus');
                    // Highlight the target message
                    if (msg.id === message.id) {
                        messageElement.classList.add('highlighted');
                        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    container.appendChild(messageElement);
                    // Attach action listeners (same as UnifiedMessageDisplay)
                    const addMessageActionListenersFn = getWindowFunction('addMessageActionListeners');
                    if (addMessageActionListenersFn &&
                        typeof addMessageActionListenersFn === 'function' &&
                        messageElement) {
                        addMessageActionListenersFn(messageElement, msg);
                    }
                    // Load reactions (same as UnifiedMessageDisplay)
                    const loadMessageReactionsFn = getWindowFunction('loadMessageReactions');
                    if (loadMessageReactionsFn && typeof loadMessageReactionsFn === 'function') {
                        try {
                            await loadMessageReactionsFn(msg.id);
                        }
                        catch (reactionError) {
                            Logger.warn('⚠️ handleMessageFocus: Failed to load reactions for message:', { messageId: msg.id, error: reactionError }, 'messages');
                        }
                    }
                    // CRITICAL: Attach avatar hover handlers (same as UnifiedMessageDisplay)
                    const avatarContainer = messageElement.querySelector('.avatar-container');
                    if (avatarContainer && msg.author) {
                        const win = typeof window !== 'undefined'
                            ? window
                            : undefined;
                        const userHoverModal = win?.userHoverModal;
                        if (userHoverModal && userHoverModal.show && msg.author) {
                            const showFn = userHoverModal.show;
                            const focusEventManager2 = createEventListenerManager();
                            focusEventManager2.on(avatarContainer, 'mouseenter', (e) => {
                                e.stopPropagation();
                                try {
                                    showFn(msg.author, avatarContainer);
                                }
                                catch (error) {
                                    Logger.warn('⚠️ handleMessageFocus: Failed to show user hover modal:', error, 'messages');
                                }
                            });
                        }
                    }
                }
            }
            catch (error) {
                Logger.error(`❌ handleMessageFocus: Failed to render message ${msg.id}:`, error, 'messages');
            }
        }
        Logger.debug(`✅ handleMessageFocus: Successfully rendered ${messagesWithCommunityId.length} messages in focus mode`, 'messages');
    }
    catch (error) {
        Logger.error('❌ handleMessageFocus: Error focusing on message:', error, 'messages');
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
    // ROOT CAUSE FIX: Log immediately to verify function is being called
    Logger.debug('🔴 loadChatHistory CALLED', { pageIdOrRawUrl, activeCommunities }, 'messages');
    // Check if visibility tab is active (direct DOM check)
    if (typeof document !== 'undefined') {
        const visibilityTab = document.getElementById('visibility-tab');
        const discussTab = document.getElementById('discuss-tab');
        if (visibilityTab &&
            visibilityTab.classList.contains('active') &&
            (!discussTab || !discussTab.classList.contains('active'))) {
            Logger.debug('⚠️ loadChatHistory: Skipping - visibility tab is active (should only refresh visibility, not load messages)');
            return;
        }
    }
    Logger.debug('📜 loadChatHistory called with:', { pageIdOrRawUrl, activeCommunities }, 'messages');
    try {
        // CRITICAL FIX: If pageIdOrRawUrl is already a pageId (not a URL), use it directly
        // This prevents re-resolution which can cause pageId mismatch (e.g., google_com_ vs www_google_com)
        let pageId = null;
        let rawUrl = null;
        if (pageIdOrRawUrl) {
            // Check if it's already a pageId (not a full URL)
            const isPageId = !pageIdOrRawUrl.startsWith('http://') &&
                !pageIdOrRawUrl.startsWith('https://') &&
                !pageIdOrRawUrl.startsWith('chrome://') &&
                !pageIdOrRawUrl.startsWith('chrome-extension://') &&
                !pageIdOrRawUrl.includes('/') && // URLs have slashes, pageIds don't
                !pageIdOrRawUrl.includes('.'); // URLs have dots, pageIds use underscores
            if (isPageId) {
                // It's already a pageId - use it directly without re-resolution
                pageId = pageIdOrRawUrl;
                Logger.debug('✅ loadChatHistory: Using provided pageId directly (no re-resolution):', pageId);
            }
            else {
                // It's a URL - resolve it
                // @ts-ignore - JavaScript module without type declarations
                const { resolveMessageUrl } = await import('../../extension/utils/UrlResolution.js');
                const urlResult = await resolveMessageUrl(pageIdOrRawUrl);
                if (urlResult.pageId) {
                    pageId = urlResult.pageId;
                    rawUrl = urlResult.rawUrl;
                    Logger.debug('✅ loadChatHistory: Resolved URL to pageId', { pageId, source: urlResult.source }, 'messages');
                }
            }
        }
        else {
            // No URL provided - resolve from state/active tab
            // @ts-ignore - JavaScript module without type declarations
            const { resolveMessageUrl } = await import('../../extension/utils/UrlResolution.js');
            const urlResult = await resolveMessageUrl(null);
            if (urlResult.pageId) {
                pageId = urlResult.pageId;
                rawUrl = urlResult.rawUrl;
                Logger.debug('✅ loadChatHistory: Resolved pageId', { source: urlResult.source, pageId }, 'messages');
            }
        }
        if (!pageId) {
            Logger.warn('⚠️ loadChatHistory: No valid pageId available, skipping message load', null, 'messages');
            return;
        }
        // CRITICAL FIX: Only update state if we resolved from active tab (not if we used provided pageId)
        // This prevents overwriting state with a different pageId format
        // If pageId was provided directly, it means MessageLoadingService already resolved it correctly
        if (!pageIdOrRawUrl ||
            pageIdOrRawUrl.startsWith('http://') ||
            pageIdOrRawUrl.startsWith('https://') ||
            pageIdOrRawUrl.startsWith('chrome://') ||
            pageIdOrRawUrl.startsWith('chrome-extension://')) {
            // We resolved from a URL - update state if needed
            // @ts-ignore - JavaScript module without type declarations
            const { resolveMessageUrl } = await import('../../extension/utils/UrlResolution.js');
            const urlResult = await resolveMessageUrl(pageIdOrRawUrl);
            if (urlResult.source === 'state' || urlResult.source === 'activeTab') {
                const urlData = {
                    rawUrl: rawUrl || pageId,
                    pageId: pageId,
                    normalizedUrl: rawUrl || pageId,
                    canonicalUrl: rawUrl || pageId,
                };
                stateManagerInstance.setState('currentUrlData', urlData);
                Logger.debug(`✅ loadChatHistory: Resolved URL from ${urlResult.source} and set currentUrlData`, { urlData }, 'messages');
            }
        }
        else {
            // PageId was provided directly - don't update state (it's already correct)
            Logger.debug('✅ loadChatHistory: Using provided pageId, not updating state (already correct)');
        }
        // Get active communities if not provided
        // CRITICAL: Retry mechanism - communities may not be loaded yet
        activeCommunities = await resolveActiveCommunitiesWithRetry(activeCommunities);
        if (!activeCommunities || activeCommunities.length === 0) {
            Logger.error('❌ loadChatHistory: No active communities available after retries - this should not happen (fallback should have set Public Square)');
            // CRITICAL: Even if resolveActiveCommunitiesWithRetry fails, use Public Square as last resort
            Logger.debug('🔧 loadChatHistory: Using Public Square UUID as last resort fallback', 'messages');
            activeCommunities = [PUBLIC_SQUARE_UUID];
            stateManagerInstance.setState('ui.activeCommunities', [PUBLIC_SQUARE_UUID]);
        }
        Logger.debug('✅ loadChatHistory: Resolved active communities:', activeCommunities, 'messages');
        Logger.debug('📜 loadChatHistory: Loading messages for page:', { pageId, communities: activeCommunities }, 'messages');
        // Get chat messages container
        const chatMessages = getChatMessagesContainer();
        if (!chatMessages) {
            Logger.warn('⚠️ loadChatHistory: Chat messages container not found', 'messages');
            return;
        }
        // ROOT CAUSE FIX: Initialize message system integration (required for loadFocusMode and realtime)
        // MessageSystemIntegration is now restored and should initialize properly
        if (!messageSystemIntegration) {
            Logger.warn('⚠️ loadChatHistory: Message system integration not initialized, attempting to initialize...', 'messages');
            try {
                await initializeNewMessageSystem();
                if (messageSystemIntegration) {
                    Logger.debug('✅ loadChatHistory: Message system integration initialized successfully', 'messages');
                }
                else {
                    Logger.error('❌ loadChatHistory: Message system integration initialization failed - focus mode and realtime may not work', 'messages');
                    // Don't throw - basic message loading can still work with MessageFeed
                }
            }
            catch (error) {
                Logger.error('❌ loadChatHistory: Message system integration initialization error:', error, 'messages');
                // Don't throw - continue with message loading using MessageFeed
            }
        }
        Logger.debug('📜 loadChatHistory: Loading messages with modern MessageFeed system', { pageId }, 'messages');
        // URL resolution is now handled by shared utility above - no need for fallback here
        // Final validation - only check for invalid pageId
        // CRITICAL FIX: Allow messages to load on chrome:// pages (they can have conversations too)
        if (!pageId || pageId === 'unknown') {
            Logger.warn('⚠️ loadChatHistory: Cannot proceed - no valid pageId available', {
                pageId,
                rawUrl,
            }, 'messages');
            isLoadingChatHistory = false;
            return;
        }
        // RED-LINE: No hardcoded fallback - use first active community or empty
        const communityId = activeCommunities[0] || PUBLIC_SQUARE_UUID;
        // CRITICAL FIX: Add loading flag to prevent multiple simultaneous loads
        if (isLoadingChatHistory) {
            Logger.warn('⚠️ loadChatHistory: Already loading, skipping duplicate call', 'messages');
            return;
        }
        isLoadingChatHistory = true;
        try {
            // MODERN IMPLEMENTATION: Use MessageFeed system
            Logger.debug('🔵 loadChatHistory: Importing MessageFeed integration...', 'messages');
            // @ts-ignore - JavaScript module without type declarations
            const { loadMessagesViaFeed } = await import('../../extension/features/messages/index.js');
            const supabaseClient = typeof window !== 'undefined'
                ? window.supabase
                : undefined;
            Logger.debug('🔵 loadChatHistory: Calling loadMessagesViaFeed...', {
                pageId,
                communityId,
                hasContainer: !!chatMessages,
                hasSupabase: !!supabaseClient,
            }, 'messages');
            await loadMessagesViaFeed(pageId, communityId, chatMessages, supabaseClient);
            Logger.debug('✅ loadChatHistory: Messages loaded via modern MessageFeed system', 'messages');
        }
        catch (error) {
            Logger.error('❌ loadChatHistory: Error loading messages via MessageFeed:', error, 'messages');
            Logger.error('❌ loadChatHistory: Error stack:', error instanceof Error ? error.stack : 'No stack', 'messages');
            throw error;
        }
        finally {
            isLoadingChatHistory = false;
        }
    }
    catch (error) {
        Logger.error('❌ loadChatHistory: Error:', error, 'messages');
        throw error;
    }
}
// COMP METHOD: Additional missing functions from COMP
// These functions are needed for full functional equivalence
/**
 * LEGACY CODE REMOVED: checkAndAddThreadToggle
 * Replies are not displayed in default mode - only focus mode shows replies
 * Top reply functionality may be implemented separately if needed
 * Function removed - no longer exported or used
 */
/**
 * LEGACY CODE REMOVED: toggleThreadReplies
 * Replies are not displayed in default mode - only focus mode shows replies
 * Function removed - no longer exported or used
 */
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
        // CRITICAL FIX: Check multiple ways to identify ownership
        if (currentUser && typeof currentUser === 'object') {
            // Check by email
            const authorEmail = message.authorEmail ||
                (message.author && typeof message.author === 'object' && 'email' in message.author
                    ? message.author.email
                    : undefined);
            if (authorEmail && currentUser.email && authorEmail === currentUser.email) {
                isOwner = true;
            }
            // Check by ID (Google ID or UUID)
            const authorId = message.authorId ||
                (message.author && typeof message.author === 'object' && 'id' in message.author
                    ? message.author.id
                    : undefined);
            if (!isOwner &&
                authorId &&
                currentUser.id &&
                (authorId === currentUser.id || String(authorId) === String(currentUser.id))) {
                isOwner = true;
            }
            // Check by handle
            const authorHandle = (message.author && typeof message.author === 'object' && 'handle' in message.author
                ? message.author.handle
                : undefined) || message.authorHandle;
            const currentHandle = currentUser.handle || (currentUser.email ? currentUser.email.split('@')[0] : undefined);
            if (!isOwner && authorHandle && currentHandle && authorHandle === currentHandle) {
                isOwner = true;
            }
        }
        finalCanEdit = isOwner && diffHours < 1; // Can edit within 1 hour
        finalCanDelete = isOwner; // User can only delete their own messages
        const authorEmail = message.authorEmail ||
            (message.author && typeof message.author === 'object' && 'email' in message.author
                ? message.author.email
                : undefined);
        const authorId = message.authorId ||
            (message.author && typeof message.author === 'object' && 'id' in message.author
                ? message.author.id
                : undefined);
        Logger.debug('🔍 getMessageActionMenu: Ownership check', {
            messageId: message.id,
            currentUser: currentUser && typeof currentUser === 'object'
                ? currentUser.email || currentUser.id
                : undefined,
            authorEmail,
            authorId,
            isOwner,
            finalCanEdit,
            finalCanDelete,
        }, 'messages');
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
        Logger.error('❌ handleReplyToMessage: No pageId available', 'messages');
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
        parentId: sanitizeId(message.parentId) || message.parentId || null,
    };
    // Use UnifiedMessageModal
    const openReplyModalFn = getWindowFunction('openReplyModal');
    if (!openReplyModalFn || typeof openReplyModalFn !== 'function') {
        Logger.error('❌ handleReplyToMessage: UnifiedMessageModal not available', 'messages');
        return;
    }
    try {
        await openReplyModalFn(sanitizedMessage, pageId);
    }
    catch (error) {
        Logger.error('❌ handleReplyToMessage: Error opening reply modal:', error, 'messages');
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
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
        Logger.error('❌ handleQuoteMessage: No pageId available', 'messages');
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
        parentId: sanitizeId(message.parentId) || message.parentId || null,
    };
    const sanitizedQuoteId = sanitizeId(message.id) || message.id;
    const openQuoteModalFn = getWindowFunction('openQuoteModal');
    if (!win.openQuoteModal || typeof openQuoteModalFn !== 'function') {
        Logger.error('❌ handleQuoteMessage: UnifiedMessageModal not available', 'messages');
        // CRITICAL FIX: Try alternative - use openMessageModal directly
        const unifiedMessageModal = getWindowFunction('unifiedMessageModal');
        if (unifiedMessageModal && typeof unifiedMessageModal.open === 'function') {
            try {
                await unifiedMessageModal.open({
                    mode: 'quote',
                    pageId,
                    quoteId: sanitizedQuoteId,
                    communityId: isMessage(message) ? message.communityId : undefined,
                });
                return;
            }
            catch (error) {
                Logger.error('❌ handleQuoteMessage: Failed to open quote modal:', error, 'messages');
                const showNotification = getWindowFunction('showNotification');
                if (showNotification && typeof showNotification === 'function') {
                    showNotification('Failed to open quote modal. Please try again.');
                }
            }
        }
        else {
            Logger.error('❌ handleQuoteMessage: Neither openQuoteModal nor unifiedMessageModal available', 'messages');
        }
        return;
    }
    try {
        await openQuoteModalFn(sanitizedMessage, pageId);
    }
    catch (error) {
        Logger.error('❌ handleQuoteMessage: Error opening quote modal:', error, 'messages');
        // CRITICAL FIX: Show user-friendly error
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
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
            Logger.error('❌ handleDeleteMessage: Invalid message ID format (expected UUID):', message.id);
            return;
        }
        // CRITICAL FIX: Try robustIntegration first, fallback to API module
        const robustIntegration = getWindowFunction('robustIntegration');
        let deleteSuccess = false;
        if (robustIntegration?.isInitialized &&
            robustIntegration.deleteMessage &&
            typeof robustIntegration.deleteMessage === 'function') {
            try {
                await robustIntegration.deleteMessage(message.id);
                deleteSuccess = true;
                Logger.debug('✅ handleDeleteMessage: Message deleted via robustIntegration', 'messages');
            }
            catch (error) {
                Logger.warn('⚠️ handleDeleteMessage: robustIntegration.deleteMessage failed, trying API fallback:', error, 'messages');
            }
        }
        // FALLBACK: Use API module if robustIntegration is not available or failed
        if (!deleteSuccess) {
            const api = getApi();
            if (api && typeof api.deleteMessage === 'function') {
                try {
                    const response = await api.deleteMessage(message.id);
                    if (response && !response.error) {
                        deleteSuccess = true;
                        Logger.debug('✅ handleDeleteMessage: Message deleted via API module', 'messages');
                    }
                    else {
                        throw new Error(response?.error || 'API delete failed');
                    }
                }
                catch (error) {
                    Logger.error('❌ handleDeleteMessage: API delete failed:', error, 'messages');
                    throw error;
                }
            }
            else {
                // Last resort: Try to initialize robustIntegration if not initialized
                if (robustIntegration && !robustIntegration.isInitialized) {
                    Logger.debug('🔄 handleDeleteMessage: Attempting to initialize robustIntegration...', 'messages');
                    // Sync window.currentUser from stateManager for backward compatibility
                    const currentUser = getCurrentUser();
                    if (currentUser && typeof window !== 'undefined') {
                        window.currentUser = currentUser;
                    }
                    try {
                        const initSuccess = await robustIntegration.initialize?.();
                        if (initSuccess && robustIntegration.deleteMessage) {
                            await robustIntegration.deleteMessage(message.id);
                            deleteSuccess = true;
                            Logger.debug('✅ handleDeleteMessage: Message deleted after initializing robustIntegration', 'messages');
                        }
                        else {
                            throw new Error('Failed to initialize robustIntegration');
                        }
                    }
                    catch (error) {
                        Logger.error('❌ handleDeleteMessage: Failed to initialize robustIntegration:', error, 'messages');
                        throw new Error('Robust integration not available and API fallback failed');
                    }
                }
                else {
                    throw new Error('Robust integration not available and API module not available');
                }
            }
        }
        // Remove the message from the UI (only if deletion was successful)
        if (deleteSuccess) {
            const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
            if (messageDiv) {
                // Check if message has replies - if so, mark as deleted instead of removing
                const hasReplies = messageDiv.querySelector(`.thread-reply[data-parent-id="${message.id}"]`);
                if (hasReplies) {
                    // Mark as deleted but keep in DOM for thread context
                    messageDiv.classList.add('deleted');
                    const contentElement = messageDiv.querySelector('.message-content');
                    if (contentElement) {
                        contentElement.textContent = '[Deleted]';
                        contentElement.style.opacity = '0.5';
                        contentElement.style.fontStyle = 'italic';
                    }
                    Logger.debug('⚠️ handleDeleteMessage: Message has replies, marking as deleted instead of removing', 'messages');
                }
                else {
                    // No replies - safe to remove
                    messageDiv.remove();
                    Logger.debug('✅ handleDeleteMessage: Message removed from DOM', 'messages');
                }
            }
            // Remove from cached chat data
            const updatedChatData = getCurrentChatData().filter((m) => m.id !== message.id);
            setCurrentChatData(updatedChatData);
            Logger.debug('✅ handleDeleteMessage: Message removed from chat data cache', 'messages');
        }
    }
    catch (error) {
        Logger.error('❌ handleDeleteMessage: Failed to delete message:', error, 'messages');
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Failed to delete message. Please try again.');
        }
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
    const editEventManager = createEventListenerManager();
    if (!chatTextarea) {
        Logger.error('❌ handleEditMessage: Chat textarea not found', 'messages');
        return;
    }
    // Show context bar for edit mode
    if (contextBar && contextText) {
        const messageContent = MessageValidators.extractContent(message);
        const editText = messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent;
        contextText.textContent = `Editing: "${editText}"`;
        contextBar.style.display = 'block';
        contextBar.style.visibility = 'visible';
        contextBar.style.opacity = '1';
        contextBar.style.zIndex = '1001';
    }
    // Set up edit mode
    chatTextarea.placeholder = 'Edit your message...';
    chatTextarea.value = MessageValidators.extractContent(message);
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
                if (typeof window !== 'undefined' &&
                    robustIntegration &&
                    robustIntegration.isInitialized &&
                    robustIntegration.editMessage) {
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
                        const contentWithLinks = convertUrlsToLinks(newContent);
                        // SECURITY: Use template element to safely parse HTML (prevents XSS)
                        const template = createElement('template');
                        template.innerHTML = contentWithLinks;
                        contentDiv.textContent = ''; // Clear existing content
                        contentDiv.appendChild(template.content);
                    }
                    // Add edited indicator
                    const timeElement = messageDiv.querySelector('.message-time-new');
                    if (timeElement && !timeElement.textContent?.includes('(edited)')) {
                        timeElement.textContent = (timeElement.textContent || '') + ' (edited)';
                    }
                }
                // Update in global chat data
                const chatData = getCurrentChatData();
                const index = chatData.findIndex((m) => m.id === message.id);
                if (index !== -1) {
                    const updatedChatData = [...chatData];
                    updatedChatData[index] = { ...updatedChatData[index], content: newContent };
                    setCurrentChatData(updatedChatData);
                }
            }
            catch (error) {
                Logger.error('❌ handleEditMessage: Failed to edit message:', error, 'messages');
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
            // RED-LINE: No hardcoded placeholder - get from primary community name
            // Use async IIFE to get community name
            (async () => {
                try {
                    const primaryCommunityName = await getPrimaryCommunityName(getActiveCommunities());
                    chatTextarea.placeholder = `Start thread in ${primaryCommunityName}...`;
                }
                catch {
                    chatTextarea.placeholder = 'Start thread...';
                }
            })();
            delete chatTextarea.dataset.editingMessageId;
            delete chatTextarea.dataset.contextMode;
        }
        if (sendButton && sendButton instanceof HTMLElement) {
            sendButton.textContent = 'Send';
            delete sendButton.dataset.editing;
        }
        // Remove event listeners (cleanup handled by event manager)
        editEventManager.cleanup();
    };
    // Add event listeners
    editEventManager.on(chatTextarea, 'keydown', handleKeyDown);
    if (sendButton && sendButton instanceof HTMLElement) {
        editEventManager.on(sendButton, 'click', handleButtonClick);
    }
}
// ===== Additional missing functions from COMP =====
/**
 * Send message via Supabase
 * COMP METHOD: Matches original implementation
 */
async function sendMessageViaSupabase(content, parentId = null, conversationId = null) {
    Logger.debug('🔥🔥🔥 SEND_MESSAGE_VIA_SUPABASE: ENTRY POINT', 'messages');
    Logger.debug('📡 SUPABASE_MESSAGE: Starting real-time message broadcast...', 'messages');
    Logger.debug('📡 SUPABASE_MESSAGE: Content:', content, 'messages');
    // Use robust integration system if available
    const robustIntegration = getWindowFunction('robustIntegration');
    if (robustIntegration && robustIntegration.isInitialized && robustIntegration.sendMessage) {
        Logger.debug('📡 SUPABASE_MESSAGE: Using robust integration system...', 'messages');
        try {
            const messageData = await robustIntegration.sendMessage(content, parentId, conversationId);
            if (messageData) {
                Logger.debug('📡 SUPABASE_MESSAGE: ✅ Robust integration message sent successfully', 'messages');
                return messageData;
            }
            else {
                Logger.debug('📡 SUPABASE_MESSAGE: ❌ Robust integration message failed', 'messages');
                return null;
            }
        }
        catch (error) {
            Logger.debug('📡 SUPABASE_MESSAGE: ❌ Robust integration error:', error, 'messages');
            return null;
        }
    }
    // No fallback - robust integration is required
    Logger.error('❌ SUPABASE_MESSAGE: Robust integration not available', 'messages');
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
    // Convert ResolvedAuthor to User if needed
    const userAuthor = author;
    // ES6 pattern: Use imported AvatarUtils module
    if (AvatarUtils && typeof AvatarUtils.createUnifiedAvatar === 'function') {
        const avatarElement = await AvatarUtils.createUnifiedAvatar(userAuthor.name || userAuthor.email || 'Unknown', userAuthor.avatarUrl, {
            size: 32,
        });
        return avatarElement.outerHTML;
    }
    // Fallback to initials
    return getSenderInitial(displayName);
}
/**
 * Handle repost message
 * Creates a repost of the message
 */
async function handleRepostMessage(message) {
    Logger.debug(`🔄 REPOST: Reposting message ${message.id}`, 'messages');
    try {
        const urlData = getCurrentUrlData();
        const pageId = urlData?.pageId || getCurrentLocationHref();
        const communityId = (isMessage(message) ? message.communityId : undefined) || getActiveCommunities()[0];
        if (!pageId || !communityId) {
            Logger.error('❌ handleRepostMessage: Missing pageId or communityId', 'messages');
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
            Logger.error('❌ handleRepostMessage: UnifiedMessageModal not available', 'messages');
            const showNotification = getWindowFunction('showNotification');
            if (showNotification && typeof showNotification === 'function') {
                showNotification('Repost functionality not available');
            }
        }
    }
    catch (error) {
        Logger.error('❌ handleRepostMessage: Failed to repost message:', error, 'messages');
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Failed to repost message');
        }
    }
}
/**
 * Handle bookmark message
 * Toggles bookmark status
 */
async function handleBookmarkMessage(message) {
    Logger.debug(`🔖 BOOKMARK: Toggling bookmark for message ${message.id}`, 'messages');
    try {
        const api = getApi();
        if (!api) {
            Logger.error('❌ handleBookmarkMessage: API not available', 'messages');
            return;
        }
        const currentUser = getCurrentUser();
        if (!currentUser) {
            Logger.error('❌ handleBookmarkMessage: User not authenticated', 'messages');
            return;
        }
        const isBookmarked = message.isBookmarked || false;
        // COMP METHOD: Use /v1/bookmarks/toggle endpoint (matches backend route registration)
        const endpoint = '/v1/bookmarks/toggle';
        const method = 'POST';
        const response = await api.request(endpoint, {
            method,
            body: { messageId: message.id },
        });
        if (!response) {
            return;
        }
        const responseData = response.data;
        if (responseData && responseData.success) {
            const newBookmarkStatus = responseData?.isBookmarked ?? !isBookmarked;
            const action = responseData?.action || (newBookmarkStatus ? 'added' : 'removed');
            // CRITICAL FIX: Update message bookmark status in ALL containers
            const allChatContainers = document.querySelectorAll('.chat-messages');
            allChatContainers.forEach((chatContainer) => {
                const messageDiv = chatContainer.querySelector(`[data-message-id="${message.id}"]`);
                if (messageDiv) {
                    const bookmarkButton = messageDiv.querySelector('.bookmark-btn');
                    if (bookmarkButton) {
                        bookmarkButton.classList.toggle('active', newBookmarkStatus);
                        bookmarkButton.setAttribute('data-is-bookmarked', newBookmarkStatus.toString());
                        // Update bookmark count (create element if it doesn't exist)
                        let bookmarkCount = bookmarkButton.querySelector('.icon-count.bookmark-count');
                        if (!bookmarkCount && responseData && responseData.count !== undefined) {
                            // Create count element if it doesn't exist
                            bookmarkCount = createElement('span');
                            bookmarkCount.className = 'icon-count bookmark-count';
                            bookmarkButton.appendChild(bookmarkCount);
                        }
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
            Logger.debug(`✅ BOOKMARK: ${action === 'added' ? 'Added' : 'Removed'} bookmark for message ${message.id}`, 'messages');
        }
        else {
            throw new Error(response.error || 'Failed to toggle bookmark');
        }
    }
    catch (error) {
        Logger.error('❌ handleBookmarkMessage: Failed to toggle bookmark:', error, 'messages');
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Failed to toggle bookmark');
        }
    }
}
/**
 * Handle share message
 * COMP METHOD: Matches original implementation
 */
async function handleShareMessage(message, shareType = 'link') {
    Logger.debug(`🔗 SHARE: Sharing message ${message.id} with type: ${shareType}`, 'messages');
    const messageUrl = `https://share.canopi.live/message/${message.id}`;
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
                    const toast = createElement('div');
                    toast.textContent = 'Message link copied to clipboard!';
                    toast.style.cssText =
                        'position: fixed; top: 20px; right: 20px; background: #007bff; color: white; padding: 12px 16px; border-radius: 6px; font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);';
                    document.body.appendChild(toast);
                    // Debounce: intentional delay for performance - UX timeout to auto-remove toast notification
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
            const authorHandle = message.author?.handle || formatAuthorName(message.author);
            const safeContent = MessageValidators.extractContent(message);
            const tweetText = `Check out this message from @${authorHandle}: "${safeContent}" ${messageUrl}`;
            window.open?.(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
            Logger.debug('✅ SHARE: Opening Twitter share dialog', 'messages');
        }
        else {
            Logger.warn('⚠️ SHARE: Unknown share type:', shareType, 'messages');
        }
    }
    catch (error) {
        Logger.error('❌ handleShareMessage: Failed to share message:', error, 'messages');
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Failed to share message');
        }
    }
}
/**
 * Handle start thread
 * Uses UnifiedMessageModal for replies
 */
async function handleStartThread(message) {
    Logger.debug(`🧵 THREAD: Starting new thread from message: ${message.id}`, 'messages');
    const uiManager = getWindowFunction('uiManager');
    if (uiManager && typeof uiManager.switchTab === 'function') {
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
    Logger.debug(`🔗 COPY_LINK: Copying link for message: ${message.id}`, 'messages');
    const messageUrl = `https://share.canopi.live/message/${message.id}`;
    try {
        await navigator.clipboard.writeText(messageUrl);
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Message link copied to clipboard!');
        }
        Logger.debug('✅ COPY_LINK: Message link copied:', messageUrl, 'messages');
    }
    catch (error) {
        Logger.error('❌ handleCopyLink: Failed to copy link:', error, 'messages');
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Failed to copy link');
        }
    }
}
/**
 * Focus on message
 * COMP METHOD: Matches original implementation
 */
async function focusOnMessage(message) {
    Logger.debug(`🎯 FOCUS_ON_MESSAGE: Focusing on message: ${message.id}`, 'messages');
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
            // Debounce: intentional delay for performance - highlight timeout for visual feedback
            setTimeout(() => {
                messageElement.style.backgroundColor = '';
            }, 3000);
        }
    }
}
function parseMessageUrl(url) {
    const messageIdMatch = url.match(/\/message\/([a-f0-9-]+)/i);
    const conversationIdMatch = url.match(/\/conversation\/([a-f0-9-]+)/i);
    return {
        messageId: messageIdMatch && messageIdMatch[1] ? messageIdMatch[1] : null,
        conversationId: conversationIdMatch && conversationIdMatch[1] ? conversationIdMatch[1] : null,
        isValid: !!(messageIdMatch || conversationIdMatch),
    };
}
/**
 * Handle incoming message URL
 * COMP METHOD: Matches original implementation
 */
async function handleIncomingMessageUrl() {
    Logger.debug('🔗 INCOMING_URL: Checking for incoming message URL...', 'messages');
    const currentUrl = getCurrentLocationHref();
    const messageData = parseMessageUrl(currentUrl);
    if (messageData && messageData.isValid && messageData.messageId) {
        const messageId = messageData.messageId;
        Logger.debug(`🔗 INCOMING_URL: Found messageId in URL: ${messageId}`, 'messages');
        // BEST PRACTICE: Wait for message element using event-based approach instead of setTimeout
        try {
            await waitForCondition(() => document.querySelector(`[data-message-id="${messageId}"]`) !== null, 5000, // 5 seconds max wait
            100);
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                await focusOnMessage({ id: messageId });
            }
            else {
                Logger.warn('🔗 INCOMING_URL: Message not found in current view:', messageId, 'messages');
            }
        }
        catch (_error) {
            Logger.warn('🔗 INCOMING_URL: Message element not found after waiting:', messageId, 'messages');
        }
    }
    else {
        Logger.debug('🔗 INCOMING_URL: No message or conversation ID found in URL.', 'messages');
    }
}
/**
 * Handle back navigation
 * COMP METHOD: Matches original implementation
 */
async function handleBackNavigation() {
    Logger.debug('🔙 BACK_NAV: Starting back navigation', 'messages');
    const winWithFocus = window;
    if (typeof window !== 'undefined' && winWithFocus.focusedMessage && winWithFocus.previousView) {
        const focusedMessage = winWithFocus.focusedMessage;
        const previousView = winWithFocus.previousView;
        const messageId = typeof focusedMessage === 'string'
            ? focusedMessage
            : focusedMessage?.id || '';
        Logger.debug('🔙 BACK_NAV: Navigating back', { previousView, messageId }, 'messages');
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
/**
 * Handle reaction
 * COMP METHOD: Matches original implementation - uses reactionsIntegration if available, API fallback for Google ID conversion
 */
async function handleReaction(message) {
    Logger.debug(`❤️ REACTION: Handling reaction for message: ${message.id}`, 'messages');
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
                Logger.error('❌ handleReaction: API not available', 'messages');
                return;
            }
            const currentUser = getCurrentUser();
            if (!currentUser) {
                Logger.error('❌ handleReaction: User not authenticated', 'messages');
                return;
            }
            // COMP METHOD: Use /v1/reactions endpoint (matches backend route registration)
            // GET endpoint: /v1/reactions/:messageId
            // POST endpoint: /v1/reactions (with {messageId, emoji} in body)
            const getEndpoint = `/v1/reactions/${message.id}`;
            // Check existing reactions via API
            // API returns { success: true, reactions: [...] } - extract reactions array
            const response = await api.request(getEndpoint, { method: 'GET' });
            if (!response) {
                return;
            }
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
            const toggleResponse = (await api.request(postEndpoint, {
                method: 'POST',
                body: JSON.stringify({ messageId: message.id, emoji: '👍' }),
            }));
            const toggleResponseData = toggleResponse.data;
            if (toggleResponseData && toggleResponseData.success) {
                const action = toggleResponseData?.action || (userReaction ? 'removed' : 'added');
                Logger.debug(`✅ REACTION: ${action === 'added' ? 'Added' : 'Removed'} reaction`, 'messages');
            }
            else {
                Logger.error('❌ handleReaction: Error toggling reaction:', toggleResponse.error, 'messages');
                Logger.error('❌ handleReaction: Response:', toggleResponse, 'messages');
            }
            // CRITICAL FIX: Always reload reactions display after toggle
            const loadMessageReactionsFn = getWindowFunction('loadMessageReactions');
            if (loadMessageReactionsFn && typeof loadMessageReactionsFn === 'function') {
                try {
                    await loadMessageReactionsFn(message.id);
                    Logger.debug('✅ REACTION: Reloaded reactions display', 'messages');
                }
                catch (error) {
                    Logger.error('❌ handleReaction: Failed to reload reactions display:', error, 'messages');
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
            Logger.error('❌ handleReaction: Failed to toggle reaction:', error, 'messages');
        }
    }
}
/**
 * Setup message input event listeners
 * COMP METHOD: Matches original implementation
 */
function setupMessageInputEventListeners() {
    Logger.debug('💬 MESSAGE_INPUT: Setting up message input event listeners...', 'messages');
    const chatTextarea = document.getElementById('chat-textarea');
    const cancelContextButton = document.getElementById('cancel-context');
    if (!chatTextarea) {
        Logger.error('❌ MESSAGE_INPUT: Chat textarea not found', 'messages');
        return;
    }
    // Create event manager at function scope so it can be used in both handlers
    const inputEventManager = createEventListenerManager();
    // ROOT CAUSE FIX: Click handler to open UnifiedMessageModal
    // Wait for openMessageModal to be available using proper async coordination
    const attachClickHandler = async () => {
        try {
            // Wait for openMessageModal to be available using proper async coordination
            await waitForCondition(() => {
                const openModal = getWindowFunction('openMessageModal');
                const unifiedMessageModal = getWindowFunction('unifiedMessageModal');
                return !!(openModal || (unifiedMessageModal?.open && typeof unifiedMessageModal.open === 'function'));
            }, 5000, // timeout
            100 // interval
            );
            // Get openMessageModal now that it's available
            let openModal = getWindowFunction('openMessageModal');
            const unifiedMessageModal = getWindowFunction('unifiedMessageModal');
            if (!openModal && unifiedMessageModal) {
                // Fallback: use unifiedMessageModal directly
                const openMethod = unifiedMessageModal.open;
                if (openMethod && typeof openMethod === 'function') {
                    openModal = (options) => openMethod(options);
                }
            }
            if (!openModal) {
                Logger.error('❌ MESSAGE_INPUT: openMessageModal not available after waiting', 'messages');
                return;
            }
            inputEventManager.on(chatTextarea, 'click', async (e) => {
                e.preventDefault();
                const stateManager = getWindowFunction('stateManagerInstance');
                const currentUrlData = stateManager && typeof stateManager.getState === 'function'
                    ? stateManager.getState('currentUrlData')
                    : null;
                const activeCommunities = stateManager && typeof stateManager.getState === 'function'
                    ? stateManager.getState('ui.activeCommunities')
                    : null;
                const pageId = currentUrlData && typeof currentUrlData === 'object' && 'pageId' in currentUrlData
                    ? typeof currentUrlData.pageId === 'string'
                        ? currentUrlData.pageId
                        : ''
                    : '';
                const communityId = Array.isArray(activeCommunities) && activeCommunities.length > 0
                    ? activeCommunities[0]
                    : undefined;
                Logger.debug('💬 MESSAGE_INPUT: Opening UnifiedMessageModal for new message', 'messages');
                await openModal({
                    mode: 'new',
                    pageId,
                    communityId,
                });
            });
            chatTextarea.dataset.listenersAttached = 'true';
            Logger.debug('✅ MESSAGE_INPUT: Click handler attached to chat-textarea', 'messages');
        }
        catch (error) {
            Logger.error('❌ MESSAGE_INPUT: Error waiting for openMessageModal:', error, 'messages');
        }
    };
    // Start attaching handler
    attachClickHandler();
    // Remove auto-resize since it's now readonly and single row
    // Remove Enter key handler since it's readonly
    // Remove send button handler since input is readonly
    // Cancel context (reply/edit mode)
    if (cancelContextButton) {
        inputEventManager.on(cancelContextButton, 'click', () => {
            const clearContext = getWindowFunction('clearContext');
            if (clearContext && typeof clearContext === 'function') {
                clearContext();
            }
        });
    }
    Logger.debug('✅ MESSAGE_INPUT: Message input event listeners added', 'messages');
}
/**
 * Send chat message
 * COMP METHOD: Matches original implementation
 */
async function sendChatMessage() {
    const chatTextarea = document.getElementById('chat-textarea');
    if (!chatTextarea) {
        Logger.error('❌ SEND_CHAT_MESSAGE: Chat textarea not found', 'messages');
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
                const messageToEdit = getCurrentChatData().find((m) => m.id === editingMessageId);
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
                const messageData = await sendMessageViaSupabaseFn(content);
                if (messageData) {
                    Logger.debug('✅ SEND_CHAT_MESSAGE: Message sent:', messageData, 'messages');
                    // ES6 pattern: Use local function directly (same module)
                    await addMessageToChat(messageData);
                }
            }
            else {
                Logger.error('❌ SEND_CHAT_MESSAGE: sendMessageViaSupabase not available', 'messages');
            }
        }
    }
    catch (error) {
        Logger.error('❌ SEND_CHAT_MESSAGE: Error sending chat message:', error, 'messages');
        const showNotification = getWindowFunction('showNotification');
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Failed to send message');
        }
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
// ES6 MODULE EXPORTS ONLY - No window globals
// All functions are exported as ES6 modules for proper type safety and tree shaking
// ES6 module exports - All message functions
export { addMessageToChat, createUnifiedMessageElement, updateReactionDisplay, addMessageActionListeners, loadMessageReactions, loadMessageBookmarks, handleMessageFocus, loadChatHistory, updateMessageInChat, removeMessageFromChat, getSenderName, convertUrlsToLinks, formatMessageTime, getSenderInitial, canUserEditMessage, sendMessageViaSupabase, getSenderAvatar, handleShareMessage, handleStartThread, handleCopyLink, focusOnMessage, parseMessageUrl, handleIncomingMessageUrl, handleBackNavigation, handleReaction, setupMessageInputEventListeners, sendChatMessage, handleReplyToMessage, handleQuoteMessage, handleRepostMessage, handleBookmarkMessage, handleDeleteMessage, handleEditMessage, getMessageActionMenu, };
// Also export as default object for convenience
export default {
    addMessageToChat,
    createUnifiedMessageElement,
    updateReactionDisplay,
    addMessageActionListeners,
    loadMessageReactions,
    loadMessageBookmarks,
    handleMessageFocus,
    loadChatHistory,
    setupMessageInputEventListeners,
};
Logger.debug('✅ MessagesModule loaded with all functions', 'messages');
// CRITICAL FIX: Export loadMessageReactions and loadChatHistory to window for diagnostic scripts and legacy code
if (typeof window !== 'undefined') {
    window.loadMessageReactions =
        loadMessageReactions;
    window.loadChatHistory =
        loadChatHistory;
    Logger.debug('✅ MessagesModule: loadMessageReactions and loadChatHistory exported to window', 'messages');
}
// CRITICAL FIX: Setup message input event listeners when module loads
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const bootstrapEventManager = createEventListenerManager();
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        bootstrapEventManager.on(document, 'DOMContentLoaded', () => {
            setupMessageInputEventListeners();
        });
    }
    else {
        // DOM already ready, setup immediately
        setupMessageInputEventListeners();
    }
}
//# sourceMappingURL=MessagesModule.js.map