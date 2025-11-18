import { AvatarUtils } from '../utils/AvatarUtils.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { updateVisibleTab as updateVisibleTabService } from './VisibilityManager.js';
import { initializePeopleTab } from './PeopleModule.js';
import autoResize from '../ui/autoResize.js';
import attachTabNavigation from '../ui/tabNavigation.js';
import { createDiagnosticsController } from '../ui/diagnostics.js';
import { sendLegacyMessage, reloadLegacyChatHistory } from '../ui/messagingBridge.js';
import { Logger } from '../utils/Logger.js';
import { getCurrentUser } from '../core/UserModule.js';
const DEFAULT_MAX_TEXTAREA_HEIGHT = 120;
const createFallbackAvatar = (user) => {
    const displayName = user?.name || user?.email || 'User';
    const initial = displayName.charAt(0).toUpperCase();
    return `
    <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
      ${initial}
    </div>
  `;
};
export class UIManager {
    constructor(deps) {
        this.deps = deps;
        this.eventListeners = new Map();
        this.uiCallbacks = [];
        this.document = deps.env.document;
        this.window = deps.env.window;
        this.avatarUtils = deps.avatarUtils;
        this.logger = deps.logger;
        this.visibility = deps.visibility;
        this.navigation = deps.navigation;
        this.messaging = deps.messaging;
        this.apiClient = deps.apiClient;
        this.theme = deps.theme;
        this.getCurrentUserFn = deps.getCurrentUser;
        this.config = deps.config;
        this.uiState = {
            activeTab: 'visibility',
            isVisible: false,
            isLoading: false,
            hasError: false
        };
        if (this.document) {
            this.initializeUI();
        }
    }
    initializeUI() {
        this.logger.debug?.('Initializing UI components');
        this.setupTabNavigation();
        this.setupEventListeners();
        this.initializeModals();
        this.updateUIState();
        this.initializeCOMPMethodFixes();
    }
    setupTabNavigation() {
        if (!this.document)
            return;
        attachTabNavigation({
            document: this.document,
            logger: this.logger,
            handlers: {
                onAgentTab: () => this.navigation?.initializeAgentTab?.(),
                onPeopleTab: () => this.navigation?.initializePeopleTab?.()
            },
            addListener: (element, event, handler) => this.addEventListener(element, event, handler)
        });
        const tabs = Array.from(this.document.querySelectorAll('.tab-button'));
        tabs.forEach(tab => {
            this.addEventListener(tab, 'click', (event) => {
                const target = event.currentTarget;
                const tabId = target?.dataset?.tab;
                if (tabId) {
                    this.switchTab(tabId);
                }
            });
        });
    }
    setupEventListeners() {
        if (!this.document)
            return;
        this.document.addEventListener('visibilityUpdated', (event) => {
            const detail = event.detail;
            void this.updateVisibilityDisplay(detail);
        });
        this.document.addEventListener('profileUpdated', (event) => {
            const detail = event.detail;
            this.handleProfileUpdate(detail);
        });
        this.document.addEventListener('errorOccurred', (event) => {
            const detail = event.detail;
            this.handleError(detail);
        });
    }
    initializeModals() {
        if (!this.document)
            return;
        if (!this.document.getElementById('auth-prompt-modal')) {
            this.createAuthPromptModal();
        }
        if (!this.document.getElementById('error-modal')) {
            this.createErrorModal();
        }
    }
    initializeCOMPMethodFixes() {
        this.logger.debug?.('Applying COMP method UI fixes');
        this.fixMessageUIElements();
        this.fixVisibleTab();
        this.fixProfileMenu();
        this.fixMessageInput();
    }
    fixMessageUIElements() {
        if (!this.document)
            return;
        const messages = this.document.querySelectorAll('.message');
        messages.forEach(message => {
            const messageEl = message;
            const avatar = messageEl.querySelector('.message-avatar img');
            if (avatar && avatar.src.includes('gravatar.com') && avatar.dataset.avatarFallback === 'true') {
                const currentUser = this.getCurrentUser();
                if (currentUser?.avatarUrl) {
                    avatar.src = currentUser.avatarUrl;
                }
            }
            const authorName = messageEl.querySelector('.message-author');
            if (authorName && !authorName.textContent?.trim()) {
                const userId = messageEl.dataset.userId;
                authorName.textContent = userId || 'User';
            }
            const community = messageEl.querySelector('.message-community');
            if (community && !community.textContent?.trim()) {
                community.textContent = 'Metalayer';
            }
            if (!messageEl.querySelector('.message-menu')) {
                const menuButton = this.document.createElement('button');
                menuButton.className = 'message-menu';
                menuButton.innerHTML = '⋮';
                menuButton.title = 'Message options';
                messageEl.appendChild(menuButton);
            }
            if (!messageEl.querySelector('.message-reactions')) {
                const reactionsDiv = this.document.createElement('div');
                reactionsDiv.className = 'message-reactions';
                reactionsDiv.innerHTML = `
          <button class="reaction-btn" data-emoji="👍">👍</button>
          <button class="reaction-btn" data-emoji="❤️">❤️</button>
          <button class="reaction-btn" data-emoji="😂">😂</button>
          <button class="reaction-btn" data-emoji="😮">😮</button>
        `;
                messageEl.appendChild(reactionsDiv);
            }
            if (!messageEl.querySelector('.message-replies')) {
                const repliesDiv = this.document.createElement('div');
                repliesDiv.className = 'message-replies';
                repliesDiv.innerHTML = '<button class="reply-btn">Reply</button>';
                messageEl.appendChild(repliesDiv);
            }
        });
    }
    fixVisibleTab() {
        const currentUser = this.getCurrentUser();
        if (currentUser?.email) {
            const avatarData = {
                email: currentUser.email,
                name: currentUser.name || currentUser.email,
                avatarUrl: currentUser.avatarUrl,
                status: 'active',
                isCurrentUser: true
            };
            void this.visibility.updateVisibleTab([avatarData]);
        }
        else {
            void this.visibility.updateVisibleTab([]);
            this.fixVisibleTabFallback();
        }
    }
    fixVisibleTabFallback() {
        if (!this.document)
            return;
        const visibleTab = this.document.querySelector('#visible-tab');
        if (!visibleTab)
            return;
        const currentUser = this.getCurrentUser();
        if (currentUser?.email) {
            visibleTab.innerHTML = `
        <div class="profile-item">
          <div class="profile-avatar">
            <img src="${currentUser.avatarUrl ?? ''}" alt="${currentUser.name || currentUser.email}">
          </div>
          <div class="profile-info">
            <div class="profile-name">${currentUser.name || currentUser.email}</div>
            <div class="profile-status">Active</div>
          </div>
        </div>
      `;
        }
        else {
            visibleTab.innerHTML = '<div class="no-users">No active users on this page</div>';
        }
    }
    fixProfileMenu() {
        if (!this.document)
            return;
        const profileMenu = this.document.querySelector('.profile-menu');
        if (profileMenu) {
            return;
        }
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return;
        }
        const menuDiv = this.document.createElement('div');
        menuDiv.className = 'profile-menu';
        const userName = currentUser.name || currentUser.email || 'User';
        const userId = currentUser.id || currentUser.email || 'user-123';
        const userAvatar = currentUser.avatarUrl || '';
        menuDiv.innerHTML = `
      <div class="profile-menu-header">
        <div class="profile-avatar">
          <img src="${userAvatar}" alt="${userName}">
        </div>
        <div class="profile-info">
          <div class="profile-name">${userName}</div>
          <div class="profile-id">${userId}</div>
        </div>
      </div>
      <div class="profile-menu-actions">
        <button class="profile-action">Settings</button>
        <button class="profile-action">Help</button>
        <button class="profile-action">Sign Out</button>
      </div>
    `;
        const profileButton = this.document.querySelector('.profile-button');
        if (profileButton) {
            profileButton.appendChild(menuDiv);
            return;
        }
        const userInfoDiv = this.document.querySelector('#user-info');
        userInfoDiv?.appendChild(menuDiv);
    }
    fixMessageInput() {
        if (!this.document)
            return;
        const messageInput = this.document.querySelector('#messageInput, #chat-textarea');
        if (!messageInput)
            return;
        if (messageInput.dataset.replyingTo) {
            messageInput.dataset.replyingTo = '';
        }
        if (messageInput.dataset.editingMessageId) {
            messageInput.dataset.editingMessageId = '';
        }
        messageInput.placeholder = 'Type a message...';
        messageInput.disabled = false;
    }
    switchTab(tabId) {
        if (!this.document)
            return;
        this.logger.debug?.(`Switching to tab: ${tabId}`);
        const tabButtons = this.document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            const el = button;
            el.classList.toggle('active', el.dataset.tab === tabId);
        });
        const tabContents = this.document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            const el = content;
            el.style.display = el.id === `${tabId}-tab` ? 'block' : 'none';
        });
        this.uiState.activeTab = tabId;
        this.updateUIState();
        this.document.dispatchEvent(new CustomEvent('tabChanged', {
            detail: { tabId, previousTab: this.uiState.activeTab }
        }));
    }
    async updateVisibilityDisplay(visibilityData) {
        if (!this.document)
            return;
        const visibilityTab = this.document.getElementById('visibility-tab');
        if (!visibilityTab)
            return;
        const userCountElement = this.document.getElementById('user-count');
        if (userCountElement) {
            userCountElement.textContent = String(visibilityData?.users?.length ?? 0);
        }
        await this.updateUserList(visibilityData?.users || []);
    }
    async updateUserList(users) {
        if (!this.document)
            return;
        const userListContainer = this.document.getElementById('user-list');
        if (!userListContainer)
            return;
        if (users.length === 0) {
            userListContainer.innerHTML = '<p class="no-users">No other users currently visible</p>';
            return;
        }
        const userListHTML = await Promise.all(users.map(user => this.createUserListItem(user)));
        userListContainer.innerHTML = userListHTML.join('');
    }
    async createUserListItem(user) {
        const avatarHTML = await this.createUserAvatar(user);
        const statusClass = user.isActive ? 'online' : 'offline';
        const lastSeen = this.formatLastSeen(user.lastSeen);
        return `
      <div class="user-item ${statusClass}" data-user-id="${user.id ?? ''}">
        <div class="user-avatar">${avatarHTML}</div>
        <div class="user-info">
          <div class="user-name">${user.name || user.email || 'User'}</div>
          <div class="user-status">${user.isActive ? 'Online' : `Last seen ${lastSeen}`}</div>
        </div>
      </div>
    `;
    }
    async createUserAvatar(user) {
        try {
            return await this.avatarUtils.createUnifiedAvatar(user, 'visibility', {
                showAura: true,
                size: 24
            });
        }
        catch (error) {
            this.logger.warn?.('Falling back to basic avatar rendering', error);
        }
        const auraColor = user.auraColor || this.config.avatarFallbackColor;
        const avatarUrl = user.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user=s96-c';
        const altText = user.name || 'User';
        return `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; top: -1px; left: -1px; width: 26px; height: 26px; border-radius: 50%; background-color: ${auraColor}; z-index: 1;"></div>
        <img src="${avatarUrl}" 
             alt="${altText}" 
             style="position: relative; z-index: 2; width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid ${auraColor};">
      </div>
    `;
    }
    formatLastSeen(timestamp) {
        if (!timestamp)
            return 'unknown';
        const now = new Date();
        const lastSeen = new Date(timestamp);
        const diffMs = now.getTime() - lastSeen.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1)
            return 'just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
            return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
    handleProfileUpdate(profileData) {
        this.logger.debug?.('Handling profile update', profileData);
        if (!this.document)
            return;
        const userMenu = this.document.getElementById('user-menu');
        if (userMenu) {
            const userNameElement = userMenu.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = profileData.name || profileData.email || '';
            }
        }
    }
    handleError(errorData) {
        this.logger.error?.('Handling error', errorData);
        this.showError(errorData.message || 'An error occurred', errorData.details);
    }
    showError(message, details = null) {
        if (!this.document)
            return;
        const errorModal = this.document.getElementById('error-modal');
        if (!errorModal)
            return;
        const messageElement = errorModal.querySelector('.error-message');
        const detailsElement = errorModal.querySelector('.error-details');
        if (messageElement) {
            messageElement.textContent = message;
        }
        if (detailsElement) {
            if (details) {
                detailsElement.textContent = JSON.stringify(details, null, 2);
                detailsElement.style.display = 'block';
            }
            else {
                detailsElement.style.display = 'none';
            }
        }
        errorModal.style.display = 'flex';
    }
    createErrorModal() {
        if (!this.document)
            return;
        const modal = this.document.createElement('div');
        modal.id = 'error-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Error</h3>
        </div>
        <div class="modal-body">
          <p class="error-message">An error occurred</p>
          <pre class="error-details" style="display: none; font-size: 0.8em; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; max-height: 200px;"></pre>
          <button id="error-modal-close" class="close-button">Close</button>
        </div>
      </div>
    `;
        this.document.body?.appendChild(modal);
        const closeBtn = modal.querySelector('#error-modal-close');
        closeBtn?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    createAuthPromptModal() {
        if (!this.document)
            return;
        const modal = this.document.createElement('div');
        modal.id = 'auth-prompt-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Sign In Required</h3>
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
        this.document.body?.appendChild(modal);
    }
    updateUIState() {
        this.logger.debug?.('Updating UI state', this.uiState);
        this.uiCallbacks.forEach(callback => {
            try {
                callback({ ...this.uiState });
            }
            catch (error) {
                this.logger.error?.('UI callback error', error);
            }
        });
    }
    showLoading(message = 'Loading...') {
        if (!this.document)
            return;
        this.uiState.isLoading = true;
        this.updateUIState();
        const loadingElement = this.document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.textContent = message;
            loadingElement.style.display = 'block';
        }
    }
    hideLoading() {
        if (!this.document)
            return;
        this.uiState.isLoading = false;
        this.updateUIState();
        const loadingElement = this.document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    onUIStateChange(callback) {
        this.uiCallbacks.push(callback);
        return () => {
            this.uiCallbacks = this.uiCallbacks.filter(cb => cb !== callback);
        };
    }
    getUIState() {
        return { ...this.uiState };
    }
    setupMessageInputEventListeners() {
        if (!this.document)
            return;
        const chatInput = this.document.getElementById('chat-textarea');
        if (!chatInput) {
            this.logger.warn?.('MESSAGE_INPUT: chat-textarea not found');
            return;
        }
        this.addEventListener(chatInput, 'input', () => autoResize(chatInput, { maxHeight: DEFAULT_MAX_TEXTAREA_HEIGHT }));
        this.addEventListener(window, 'resize', () => autoResize(chatInput, { maxHeight: DEFAULT_MAX_TEXTAREA_HEIGHT }));
        this.addEventListener(chatInput, 'keydown', (event) => {
            const keyEvent = event;
            if (keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
                keyEvent.preventDefault();
                void this.sendChatMessage();
            }
        });
    }
    async sendChatMessage() {
        if (!this.document)
            return;
        const chatInput = this.document.getElementById('chat-textarea');
        if (!chatInput)
            return;
        const content = chatInput.value?.trim();
        if (!content) {
            this.logger.warn?.('SEND_CHAT_MESSAGE: No message content');
            return;
        }
        if (chatInput.dataset.editingMessageId) {
            this.logger.info?.('SEND_CHAT_MESSAGE: In edit mode, skipping send');
            return;
        }
        try {
            const result = await this.messaging.sendMessage(content);
            if (result?.success && result.data) {
                if (this.messaging.addMessageToChat) {
                    await this.messaging.addMessageToChat(result.data);
                }
                else if (this.messaging.loadChatHistory) {
                    await this.messaging.loadChatHistory();
                }
            }
            else {
                this.logger.warn?.('SEND_CHAT_MESSAGE: Message send failed or returned no data');
            }
        }
        catch (error) {
            this.logger.error?.('SEND_CHAT_MESSAGE: Failed to send message', error);
        }
        finally {
            chatInput.value = '';
            autoResize(chatInput, { maxHeight: DEFAULT_MAX_TEXTAREA_HEIGHT });
        }
    }
    cleanup() {
        this.eventListeners.forEach((listeners, target) => {
            listeners.forEach(({ event, handler }) => {
                target.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();
        this.uiCallbacks = [];
    }
    async initializeTheme() {
        let savedTheme = 'light';
        const currentUser = this.getCurrentUser();
        if (currentUser?.id && this.apiClient) {
            try {
                const response = await this.apiClient.request('/v1/users/preferences', {
                    method: 'GET',
                    headers: { 'X-User-Id': currentUser.id }
                });
                if (response?.preferences?.theme) {
                    savedTheme = response.preferences.theme;
                }
            }
            catch (error) {
                this.logger.warn?.('THEME: Failed to load from API, falling back to default', error);
            }
        }
        await this.setTheme(savedTheme);
    }
    async setTheme(theme) {
        if (!this.document)
            return;
        const currentUser = this.getCurrentUser();
        const body = this.document.body;
        const themeIcon = this.document.getElementById('theme-icon');
        const themeText = this.document.getElementById('theme-text');
        if (theme === 'dark') {
            body?.setAttribute('data-theme', 'dark');
            this.document.documentElement?.setAttribute('data-theme', 'dark');
            if (themeIcon)
                themeIcon.textContent = '☀️';
            if (themeText)
                themeText.textContent = 'Light mode';
        }
        else {
            body?.setAttribute('data-theme', 'light');
            this.document.documentElement?.setAttribute('data-theme', 'light');
            if (themeIcon)
                themeIcon.textContent = '🌙';
            if (themeText)
                themeText.textContent = 'Dark mode';
        }
        if (this.theme?.updateThemeEverywhere) {
            await this.theme.updateThemeEverywhere(theme);
        }
        else if (currentUser?.id && this.apiClient) {
            try {
                await this.apiClient.request('/v1/users/update-preferences', {
                    method: 'POST',
                    body: JSON.stringify({
                        userId: currentUser.id,
                        preferences: { theme }
                    })
                });
            }
            catch (error) {
                this.logger.error?.('THEME: Error saving theme preference', error);
            }
        }
    }
    async toggleTheme() {
        const currentTheme = this.document?.body.getAttribute('data-theme') || await this.theme?.getCurrentUserTheme?.() || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        if (this.theme?.updateThemeEverywhere) {
            await this.theme.updateThemeEverywhere(newTheme);
        }
        else {
            await this.setTheme(newTheme);
        }
    }
    runUpdateVisualHierarchyDiagnostic() {
        this.logger.debug?.('🔄 UI: updateVisualHierarchy diagnostic invoked');
    }
    runDebugHierarchyDiagnostic() {
        this.logger.debug?.('🔍 UI: debugHierarchy diagnostic invoked');
    }
    runForceRefreshCSSDiagnostic() {
        this.logger.debug?.('🔄 UI: forceRefreshCSS diagnostic invoked');
    }
    getCurrentUser() {
        return this.getCurrentUserFn?.() ?? null;
    }
    addEventListener(target, event, handler) {
        if (!target) {
            this.logger.warn?.(`UIManager: Cannot add event listener ${event} to null target`);
            return;
        }
        target.addEventListener(event, handler);
        const listeners = this.eventListeners.get(target) ?? [];
        listeners.push({ event, handler });
        this.eventListeners.set(target, listeners);
    }
}
function createDefaultDependencies() {
    const envWindow = (typeof window !== 'undefined' ? window : undefined);
    const envDocument = typeof document !== 'undefined' ? document : undefined;
    const messaging = {
        sendMessage: async (content) => {
            try {
                const result = await sendLegacyMessage(content);
                return result;
            }
            catch (error) {
                Logger.error('SEND_CHAT_MESSAGE: sendLegacyMessage failed', error);
                return { success: false };
            }
        },
        addMessageToChat: envWindow?.addMessageToChat,
        loadChatHistory: () => reloadLegacyChatHistory()
    };
    const navigation = {
        initializeAgentTab: envWindow?.initializeAgentTab,
        initializePeopleTab
    };
    const visibility = {
        updateVisibleTab: updateVisibleTabService
    };
    const theme = {
        updateThemeEverywhere: envWindow?.updateThemeEverywhere,
        getCurrentUserTheme: envWindow?.getCurrentUserTheme
    };
    return {
        env: { document: envDocument, window: envWindow },
        avatarUtils: AvatarUtils,
        config: { avatarFallbackColor: AVATAR_FALLBACK_COLOR },
        visibility,
        navigation,
        messaging,
        logger: Logger,
        getCurrentUser,
        apiClient: envWindow?.api,
        theme
    };
}
const uiManagerInstance = new UIManager(createDefaultDependencies());
const diagnosticsController = createDiagnosticsController({
    updateVisualHierarchy: () => uiManagerInstance.runUpdateVisualHierarchyDiagnostic(),
    debugHierarchy: () => uiManagerInstance.runDebugHierarchyDiagnostic(),
    forceRefreshCSS: () => uiManagerInstance.runForceRefreshCSSDiagnostic()
}, Logger);
export const updateVisualHierarchy = () => diagnosticsController.updateVisualHierarchy();
export const debugHierarchy = () => diagnosticsController.debugHierarchy();
export const forceRefreshCSS = () => diagnosticsController.forceRefreshCSS();
export const setupTabNavigation = () => uiManagerInstance.setupTabNavigation();
export const setupMessageInputEventListeners = () => uiManagerInstance.setupMessageInputEventListeners();
export const initializeTheme = () => uiManagerInstance.initializeTheme();
export const setTheme = (theme) => uiManagerInstance.setTheme(theme);
export const toggleTheme = () => uiManagerInstance.toggleTheme();
export default uiManagerInstance;
if (typeof window !== 'undefined') {
    const win = window;
    win.UIManager = UIManager;
    win.uiManager = uiManagerInstance;
    win.updateVisualHierarchy = updateVisualHierarchy;
    win.debugHierarchy = debugHierarchy;
    win.forceRefreshCSS = forceRefreshCSS;
    win.autoResize = (textarea) => autoResize(textarea);
    win.setupTabNavigation = setupTabNavigation;
    win.setupMessageInputEventListeners = setupMessageInputEventListeners;
    win.initializeTheme = initializeTheme;
    win.setTheme = setTheme;
    win.toggleTheme = toggleTheme;
}
//# sourceMappingURL=UIManager.js.map