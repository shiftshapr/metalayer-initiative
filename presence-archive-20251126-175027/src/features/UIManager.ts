import { User, Message, ApiResponse } from '../types/index.js';
import { AvatarUtils } from '../utils/AvatarUtils.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
// updateVisibleTab removed - use VisibilityTab component from visibility/ui/
// import { VisibilityTab } from './visibility/ui/VisibilityTab.js';
import { initializePeopleTab } from './PeopleModule.js';
import autoResize from '../ui/autoResize.js';
import attachTabNavigation from '../ui/tabNavigation.js';
import { createDiagnosticsController } from '../ui/diagnostics.js';
import { Logger, type LogData } from '../utils/Logger.js';
import { getCurrentUser } from '../core/UserModule.js';
const DEFAULT_MAX_TEXTAREA_HEIGHT = 120;

export type UIState = {
  activeTab: string;
  isVisible: boolean;
  isLoading: boolean;
  hasError: boolean;
};

export type VisibleUser = {
  email?: string;
  name?: string;
  avatarUrl?: string;
  status?: string;
  isCurrentUser?: boolean;
  lastSeen?: string | Date;
  id?: string;
  auraColor?: string;
  isActive?: boolean;
};

interface MessageSendResult {
  success?: boolean;
  data?: Message;
}

interface MessagingService {
  sendMessage: (content: string, metadata?: Record<string, unknown>) => Promise<MessageSendResult | null>;
  addMessageToChat?: (message: Message) => Promise<void> | void;
  loadChatHistory?: () => Promise<void>;
}

interface NavigationService {
  initializeAgentTab?: () => void | Promise<void>;
  initializePeopleTab?: () => void | Promise<void>;
}

interface VisibilityService {
  updateVisibleTab: (users: VisibleUser[] | User[]) => Promise<void>;
}

interface ThemeService {
  updateThemeEverywhere?: (theme: string) => Promise<void>;
  getCurrentUserTheme?: () => Promise<string>;
}

interface ApiClient {
  request: <T = unknown>(url: string, options?: RequestInit & { headers?: Record<string, string> }) => Promise<ApiResponse<T>>;
}

interface UIEnvironment {
  document?: Document;
  window?: UIManagerWindow;
}

interface Config {
  avatarFallbackColor: string;
}

interface UIManagerDependencies {
  env: UIEnvironment;
  avatarUtils: typeof AvatarUtils;
  config: Config;
  visibility: VisibilityService;
  navigation?: NavigationService;
  messaging: MessagingService;
  logger: typeof Logger;
  getCurrentUser: () => User | null;
  apiClient?: ApiClient;
  theme?: ThemeService;
}

interface TrackedListener {
  event: string;
  handler: EventListener;
}

type VisibilityEventDetail = {
  users?: VisibleUser[];
};

type UIManagerWindow = Window & {
  uiManager?: UIManager;
  UIManager?: typeof UIManager;
  initializeUIManager?: () => UIManager | null;
  addMessageToChat?: (message: Message) => Promise<void> | void;
  initializeAgentTab?: () => void | Promise<void>;
  initializePeopleTab?: () => void | Promise<void>;
  updateThemeEverywhere?: (theme: string) => Promise<void>;
  getCurrentUserTheme?: () => Promise<string>;
  setupTabNavigation?: () => void;
  setupMessageInputEventListeners?: () => void;
  initializeTheme?: () => Promise<void>;
  setTheme?: (theme: string) => Promise<void>;
  toggleTheme?: () => Promise<void>;
  autoResize?: (textarea: HTMLTextAreaElement | null) => void;
  api?: ApiClient;
};

export class UIManager {
  private readonly document?: Document;
  private readonly avatarUtils: typeof AvatarUtils;
  private readonly logger: typeof Logger;
  private readonly visibility: VisibilityService;
  private readonly navigation?: NavigationService;
  private readonly messaging: MessagingService;
  private readonly apiClient?: ApiClient;
  private readonly theme?: ThemeService;
  private readonly getCurrentUserFn: () => User | null;
  private readonly config: Config;
  private readonly eventListeners = new Map<EventTarget, TrackedListener[]>();
  private uiState: UIState;
  private uiCallbacks: Array<(state: UIState) => void> = [];

  constructor(deps: UIManagerDependencies) {
    this.document = deps.env.document;
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

  initializeUI(): void {
    this.logger.debug?.('Initializing UI components');
    this.setupTabNavigation();
    this.setupEventListeners();
    this.initializeModals();
    this.updateUIState();
    this.initializeCOMPMethodFixes();
  }

  setupTabNavigation(): void {
    if (!this.document) return;

    attachTabNavigation({
      document: this.document,
      logger: this.logger,
      handlers: {
        onAgentTab: async () => {
          await this.navigation?.initializeAgentTab?.();
        },
        onPeopleTab: async () => {
          await this.navigation?.initializePeopleTab?.();
        },
        onSettingsTab: async () => {
          // Initialize VisibilitySettings when Settings tab opens
          const win = typeof window !== 'undefined' ? window as Window & {
            __CANOPI_MODULE_GRAPH__?: {
              visibilitySettings?: {
                initialize: () => Promise<void>;
                ensureEventListeners: () => Promise<void>;
              };
            };
          } : null;
          
          if (win?.__CANOPI_MODULE_GRAPH__?.visibilitySettings) {
            try {
              await win.__CANOPI_MODULE_GRAPH__.visibilitySettings.initialize();
              this.logger.debug?.('✅ UI_MANAGER: VisibilitySettings initialized');
            } catch (error: unknown) {
              this.logger.warn?.('⚠️ UI_MANAGER: VisibilitySettings initialization failed', error as unknown as LogData);
              // Try ensureEventListeners as fallback
              if (win.__CANOPI_MODULE_GRAPH__.visibilitySettings.ensureEventListeners) {
                await win.__CANOPI_MODULE_GRAPH__.visibilitySettings.ensureEventListeners();
              }
            }
          }
        }
      },
      addListener: (element, event, handler) => this.addEventListener(element, event, handler)
    });

    const tabs = Array.from(this.document.querySelectorAll('.tab-button'));
    tabs.forEach(tab => {
      this.addEventListener(tab, 'click', (event: Event) => {
        const target = event.currentTarget as HTMLElement;
        const tabId = target?.dataset?.tab;
        if (tabId) {
          this.switchTab(tabId);
        }
      });
    });
  }

  private setupEventListeners(): void {
    if (!this.document) return;

    this.document.addEventListener('visibilityUpdated', (event: Event) => {
      const detail = (event as CustomEvent<VisibilityEventDetail>).detail;
      void this.updateVisibilityDisplay(detail);
    });

    this.document.addEventListener('profileUpdated', (event: Event) => {
      const detail = (event as CustomEvent<User>).detail;
      this.handleProfileUpdate(detail);
    });

    this.document.addEventListener('errorOccurred', (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; details?: unknown }>).detail;
      this.handleError(detail);
    });
  }

  private initializeModals(): void {
    if (!this.document) return;

    if (!this.document.getElementById('auth-prompt-modal')) {
      this.createAuthPromptModal();
    }
    if (!this.document.getElementById('error-modal')) {
      this.createErrorModal();
    }
  }

  private initializeCOMPMethodFixes(): void {
    this.logger.debug?.('Applying COMP method UI fixes');
    this.fixMessageUIElements();
    this.fixVisibleTab();
    this.fixProfileMenu();
    this.fixMessageInput();
  }

  private fixMessageUIElements(): void {
    if (!this.document) return;

    const messages = this.document.querySelectorAll('.message');
    messages.forEach(message => {
      const messageEl = message as HTMLElement;
      const avatar = messageEl.querySelector('.message-avatar img') as HTMLImageElement | null;
      if (avatar && avatar.src.includes('gravatar.com') && avatar.dataset.avatarFallback === 'true') {
        const currentUser = this.getCurrentUser();
        if (currentUser?.avatarUrl) {
          avatar.src = currentUser.avatarUrl;
        }
      }

      const authorName = messageEl.querySelector('.message-author') as HTMLElement | null;
      if (authorName && !authorName.textContent?.trim()) {
        const userId = messageEl.dataset.userId;
        authorName.textContent = userId || 'User';
      }

      const community = messageEl.querySelector('.message-community') as HTMLElement | null;
      if (community && !community.textContent?.trim()) {
        community.textContent = 'Metalayer';
      }

      if (!messageEl.querySelector('.message-menu')) {
        const menuButton = this.document!.createElement('button');
        menuButton.className = 'message-menu';
        menuButton.innerHTML = '⋮';
        menuButton.title = 'Message options';
        messageEl.appendChild(menuButton);
      }

      if (!messageEl.querySelector('.message-reactions')) {
        const reactionsDiv = this.document!.createElement('div');
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
        const repliesDiv = this.document!.createElement('div');
        repliesDiv.className = 'message-replies';
        repliesDiv.innerHTML = '<button class="reply-btn">Reply</button>';
        messageEl.appendChild(repliesDiv);
      }
    });
  }

  private fixVisibleTab(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser?.email) {
      const avatarData: VisibleUser = {
        email: currentUser.email,
        name: currentUser.name || currentUser.email,
        avatarUrl: currentUser.avatarUrl,
        status: 'active',
        isCurrentUser: true
      };
      void this.visibility.updateVisibleTab([avatarData]);
    } else {
      void this.visibility.updateVisibleTab([]);
      this.fixVisibleTabFallback();
    }
  }

  private fixVisibleTabFallback(): void {
    if (!this.document) return;
    const visibleTab = this.document.querySelector('#visible-tab');
    if (!visibleTab) return;

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
    } else {
      visibleTab.innerHTML = '<div class="no-users">No active users on this page</div>';
    }
  }

  private fixProfileMenu(): void {
    if (!this.document) return;
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

  private fixMessageInput(): void {
    if (!this.document) return;
    const messageInput = this.document.querySelector('#messageInput, #chat-textarea') as HTMLTextAreaElement | null;
    if (!messageInput) return;

    if (messageInput.dataset.replyingTo) {
      messageInput.dataset.replyingTo = '';
    }
    if (messageInput.dataset.editingMessageId) {
      messageInput.dataset.editingMessageId = '';
    }
    messageInput.placeholder = 'Type a message...';
    messageInput.disabled = false;
  }

  switchTab(tabId: string): void {
    if (!this.document) return;
    this.logger.debug?.(`Switching to tab: ${tabId}`);

    // ROOT CAUSE FIX: Use class-based tab switching (harmonize with tabNavigation.ts)
    const tabButtons = this.document.querySelectorAll('.tab-button, .main-nav-tab');
    tabButtons.forEach(button => {
      const el = button as HTMLElement;
      el.classList.toggle('active', el.dataset.tab === tabId || el.getAttribute('data-tab') === tabId);
    });

    // ROOT CAUSE FIX: Use class-based content switching instead of inline styles
    // Match tabNavigation.ts pattern: use 'active' class instead of display style
    const tabContents = this.document.querySelectorAll('.tab-content, .main-tab-content, .sub-tab-content');
    tabContents.forEach(content => {
      const el = content as HTMLElement;
      const contentId = el.id;
      // Check if this content matches the target tab (supports both 'discuss-tab' and 'discuss' formats)
      const matchesTab = contentId === `${tabId}-tab` || 
                        contentId === tabId || 
                        (contentId.endsWith('-tab') && contentId.replace('-tab', '') === tabId);
      
      if (matchesTab) {
        el.classList.add('active');
        // ROOT CAUSE FIX: Remove inline display style to let CSS handle it
        el.style.display = '';
      } else {
        el.classList.remove('active');
        // ROOT CAUSE FIX: Remove inline display style to let CSS handle it
        el.style.display = '';
      }
    });

    this.uiState.activeTab = tabId;
    this.updateUIState();

    this.document.dispatchEvent(new CustomEvent('tabChanged', {
      detail: { tabId, previousTab: this.uiState.activeTab }
    }));
  }

  private async updateVisibilityDisplay(visibilityData?: VisibilityEventDetail): Promise<void> {
    if (!this.document) return;

    const visibilityTab = this.document.getElementById('visibility-tab');
    if (!visibilityTab) return;

    const userCountElement = this.document.getElementById('user-count');
    if (userCountElement) {
      userCountElement.textContent = String(visibilityData?.users?.length ?? 0);
    }

    await this.updateUserList(visibilityData?.users || []);
  }

  private async updateUserList(users: VisibleUser[]): Promise<void> {
    if (!this.document) return;
    const userListContainer = this.document.getElementById('user-list');
    if (!userListContainer) return;

    if (users.length === 0) {
      userListContainer.innerHTML = '<p class="no-users">No other users currently visible</p>';
      return;
    }

    const userListHTML = await Promise.all(users.map(user => this.createUserListItem(user)));
    userListContainer.innerHTML = userListHTML.join('');
  }

  private async createUserListItem(user: VisibleUser): Promise<string> {
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

  private async createUserAvatar(user: VisibleUser): Promise<string> {
    try {
      return await this.avatarUtils.createUnifiedAvatar(user as User, 'visibility', {
        showAura: true,
        size: 24
      });
    } catch (error: unknown) {
      this.logger.warn?.('Falling back to basic avatar rendering', error as unknown as LogData);
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

  private formatLastSeen(timestamp?: string | Date): string {
    if (!timestamp) return 'unknown';
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  private handleProfileUpdate(profileData: User): void {
    this.logger.debug?.('Handling profile update', profileData);
    if (!this.document) return;

    const userMenu = this.document.getElementById('user-menu');
    if (userMenu) {
      const userNameElement = userMenu.querySelector('.user-name');
      if (userNameElement) {
        userNameElement.textContent = profileData.name || profileData.email || '';
      }
    }
  }

  private handleError(errorData: { message?: string; details?: unknown }): void {
    this.logger.error?.('Handling error', errorData);
    this.showError(errorData.message || 'An error occurred', errorData.details);
  }

  private showError(message: string, details: unknown = null): void {
    if (!this.document) return;
    const errorModal = this.document.getElementById('error-modal');
    if (!errorModal) return;

    const messageElement = errorModal.querySelector('.error-message');
    const detailsElement = errorModal.querySelector('.error-details') as HTMLElement | null;

    if (messageElement) {
      messageElement.textContent = message;
    }

    if (detailsElement) {
      if (details) {
        detailsElement.textContent = JSON.stringify(details, null, 2);
        detailsElement.style.display = 'block';
      } else {
        detailsElement.style.display = 'none';
      }
    }

    (errorModal as HTMLElement).style.display = 'flex';
  }

  private createErrorModal(): void {
    if (!this.document) return;
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
      (modal as HTMLElement).style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        (modal as HTMLElement).style.display = 'none';
      }
    });
  }

  private createAuthPromptModal(): void {
    if (!this.document) return;
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

  updateUIState(): void {
    this.logger.debug?.('Updating UI state', this.uiState);
    this.uiCallbacks.forEach(callback => {
      try {
        callback({ ...this.uiState });
      } catch (error: unknown) {
        this.logger.error?.('UI callback error', error as unknown as LogData);
      }
    });
  }

  showLoading(message = 'Loading...'): void {
    if (!this.document) return;
    this.uiState.isLoading = true;
    this.updateUIState();

    const loadingElement = this.document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.textContent = message;
      loadingElement.style.display = 'block';
    }
  }

  hideLoading(): void {
    if (!this.document) return;
    this.uiState.isLoading = false;
    this.updateUIState();

    const loadingElement = this.document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  onUIStateChange(callback: (state: UIState) => void): () => void {
    this.uiCallbacks.push(callback);
    return () => {
      this.uiCallbacks = this.uiCallbacks.filter(cb => cb !== callback);
    };
  }

  getUIState(): UIState {
    return { ...this.uiState };
  }

  setupMessageInputEventListeners(): void {
    if (!this.document) return;
    const chatInput = this.document.getElementById('chat-textarea') as HTMLTextAreaElement | null;
    if (!chatInput) {
      this.logger.warn?.('MESSAGE_INPUT: chat-textarea not found');
      return;
    }

    this.addEventListener(chatInput, 'input', () => autoResize(chatInput, { maxHeight: DEFAULT_MAX_TEXTAREA_HEIGHT }));
    this.addEventListener(window, 'resize', () => autoResize(chatInput, { maxHeight: DEFAULT_MAX_TEXTAREA_HEIGHT }));

    this.addEventListener(chatInput, 'keydown', (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      if (keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
        keyEvent.preventDefault();
        void this.sendChatMessage();
      }
    });
  }

  async sendChatMessage(): Promise<void> {
    if (!this.document) return;
    const chatInput = this.document.getElementById('chat-textarea') as HTMLTextAreaElement | null;
    if (!chatInput) return;

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
        } else if (this.messaging.loadChatHistory) {
          await this.messaging.loadChatHistory();
        }
      } else {
        this.logger.warn?.('SEND_CHAT_MESSAGE: Message send failed or returned no data');
      }
    } catch (error: unknown) {
      this.logger.error?.('SEND_CHAT_MESSAGE: Failed to send message', error as unknown as LogData);
    } finally {
      chatInput.value = '';
      autoResize(chatInput, { maxHeight: DEFAULT_MAX_TEXTAREA_HEIGHT });
    }
  }

  cleanup(): void {
    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler }) => {
        target.removeEventListener(event, handler);
      });
    });

    this.eventListeners.clear();
    this.uiCallbacks = [];
  }

  async initializeTheme(): Promise<void> {
    let savedTheme = 'light';
    const currentUser = this.getCurrentUser();

    if (currentUser?.id && this.apiClient) {
      try {
        type PreferencesPayload = { preferences?: { theme?: string } };
        const response = await this.apiClient.request<PreferencesPayload>('/v1/users/preferences', {
          method: 'GET',
          headers: { 'X-User-Id': currentUser.id }
        });
        const themeFromApi = response?.data?.preferences?.theme;
        if (themeFromApi) {
          savedTheme = themeFromApi;
        }
      } catch (error: unknown) {
        this.logger.warn?.('THEME: Failed to load from API, falling back to default', error as unknown as LogData);
      }
    }

    // During initialization, don't save to database - just apply the theme
    // Only save when user explicitly changes the theme
    await this.setTheme(savedTheme, false);
  }

  async setTheme(theme: string, saveToDatabase: boolean = true): Promise<void> {
    if (!this.document) return;
    const currentUser = this.getCurrentUser();
    const body = this.document.body;
    const themeIcon = this.document.getElementById('theme-icon');
    const themeText = this.document.getElementById('theme-text');

    // Check if theme is already set to this value
    const currentTheme = body?.getAttribute('data-theme') || this.document.documentElement?.getAttribute('data-theme') || 'light';
    const themeChanged = currentTheme !== theme;

    if (theme === 'dark') {
      body?.setAttribute('data-theme', 'dark');
      this.document.documentElement?.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.textContent = '☀️';
      if (themeText) themeText.textContent = 'Light mode';
    } else {
      body?.setAttribute('data-theme', 'light');
      this.document.documentElement?.setAttribute('data-theme', 'light');
      if (themeIcon) themeIcon.textContent = '🌙';
      if (themeText) themeText.textContent = 'Dark mode';
    }

    // Only save to database if:
    // 1. saveToDatabase is true (explicit save requested)
    // 2. Theme actually changed (not just initialization with same value)
    if (saveToDatabase && themeChanged) {
      if (this.theme?.updateThemeEverywhere) {
        await this.theme.updateThemeEverywhere(theme);
      } else if (currentUser?.id && this.apiClient) {
        try {
          await this.apiClient.request('/v1/users/update-preferences', {
            method: 'POST',
            body: JSON.stringify({
              userId: currentUser.id,
              preferences: { theme }
            })
          });
        } catch (error: unknown) {
          this.logger.error?.('THEME: Error saving theme preference', error as unknown as LogData);
        }
      }
    }
  }

  async toggleTheme(): Promise<void> {
    const currentTheme = this.document?.body.getAttribute('data-theme') || await this.theme?.getCurrentUserTheme?.() || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (this.theme?.updateThemeEverywhere) {
      await this.theme.updateThemeEverywhere(newTheme);
    } else {
      await this.setTheme(newTheme);
    }
  }

  runUpdateVisualHierarchyDiagnostic(): void {
    this.logger.debug?.('🔄 UI: updateVisualHierarchy diagnostic invoked');
  }

  runDebugHierarchyDiagnostic(): void {
    this.logger.debug?.('🔍 UI: debugHierarchy diagnostic invoked');
  }

  runForceRefreshCSSDiagnostic(): void {
    this.logger.debug?.('🔄 UI: forceRefreshCSS diagnostic invoked');
  }

  private getCurrentUser(): User | null {
    return this.getCurrentUserFn?.() ?? null;
  }

  private addEventListener(target: EventTarget | null | undefined, event: string, handler: EventListener): void {
    if (!target) {
      this.logger.warn?.(`UIManager: Cannot add event listener ${event} to null target`);
      return;
    }

    target.addEventListener(event, handler);
    const listeners = this.eventListeners.get(target) ?? [];
    listeners.push({ event, handler });
    this.eventListeners.set(target, listeners);
  }}

function createDefaultDependencies(): UIManagerDependencies {
  const envWindow = (typeof window !== 'undefined' ? (window as unknown as UIManagerWindow) : undefined);
  const envDocument = typeof document !== 'undefined' ? document : undefined;

  const messaging: MessagingService = {
    sendMessage: async (content: string, _metadata?: Record<string, unknown>) => {
      try {
        if (envWindow?.sendMessageViaSupabase) {
          const data = await envWindow.sendMessageViaSupabase({ content });
          return data ? { success: true, data } as MessageSendResult : { success: false } as MessageSendResult;
        }
        return { success: false } as MessageSendResult;
      } catch (error: unknown) {
        Logger.error('SEND_CHAT_MESSAGE: sendMessageViaSupabase failed', error as unknown as LogData);
        return { success: false } as MessageSendResult;
      }
    },
    addMessageToChat: envWindow?.addMessageToChat,
    loadChatHistory: async () => {
      if (envWindow?.loadChatHistory) {
        await envWindow.loadChatHistory();
      }
    }
  };

  const navigation: NavigationService = {
    initializeAgentTab: envWindow?.initializeAgentTab,
    initializePeopleTab
  };

  const visibility: VisibilityService = {
    updateVisibleTab: async (users: VisibleUser[] | User[]) => {
      // NOTE: updateVisibleTab is deprecated - use VisibilityTab component instead
      // This is a temporary stub for UIManager compatibility
      // TODO: Update UIManager to use VisibilityTab component directly
      Logger.warn('⚠️ UIManager: updateVisibleTab is deprecated. Use VisibilityTab component from visibility/ui/', null, 'general');
      
      // Try to use VisibilityState if available
      const win = envWindow as Window & {
        visibilityState?: { setUsers: (users: unknown[]) => void };
      };
      
      if (win?.visibilityState?.setUsers) {
        const visibilityUsers = Array.isArray(users) ? users.map(u => {
          if (u && typeof u === 'object') {
            const id = 'id' in u ? (u as { id?: string }).id : ('userId' in u ? (u as { userId?: string }).userId : undefined);
            return {
              id: id || String(u) || '',
              email: 'email' in u ? (u as { email?: string }).email : undefined,
              name: 'name' in u ? (u as { name?: string }).name : undefined,
              isActive: 'isActive' in u ? (u as { isActive?: boolean }).isActive : undefined,
              ...u
            };
          }
          return { id: String(u || ''), ...(typeof u === 'object' && u !== null ? u : {}) };
        }) : [];
        win.visibilityState.setUsers(visibilityUsers);
      }
    }
  };

  const theme: ThemeService = {
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

let uiManagerInstance: UIManager | null = null;
let diagnosticsController: ReturnType<typeof createDiagnosticsController> | null = null;
let windowBindingsRegistered = false;

const getUIManagerInstance = (): UIManager => {
  if (!uiManagerInstance) {
    uiManagerInstance = new UIManager(createDefaultDependencies());
  }
  return uiManagerInstance;
};

const ensureDiagnosticsController = () => {
  if (!diagnosticsController) {
    const instance = getUIManagerInstance();
    diagnosticsController = createDiagnosticsController({
      updateVisualHierarchy: () => instance.runUpdateVisualHierarchyDiagnostic(),
      debugHierarchy: () => instance.runDebugHierarchyDiagnostic(),
      forceRefreshCSS: () => instance.runForceRefreshCSSDiagnostic()
    }, Logger);
  }

  return diagnosticsController;
};

const registerWindowBindings = (instance: UIManager): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const win = window as unknown as UIManagerWindow;
  Object.assign(win, {
    UIManager,
    uiManager: instance,
    initializeUIManager,
    updateVisualHierarchy,
    debugHierarchy,
    forceRefreshCSS,
    autoResize: (textarea: HTMLTextAreaElement | null) => autoResize(textarea),
    setupTabNavigation,
    setupMessageInputEventListeners,
    initializeTheme,
    setTheme,
    toggleTheme
  });

  windowBindingsRegistered = true;
};

const updateVisualHierarchy = (): void => ensureDiagnosticsController().updateVisualHierarchy();
const debugHierarchy = (): void => ensureDiagnosticsController().debugHierarchy();
const forceRefreshCSS = (): void => ensureDiagnosticsController().forceRefreshCSS();
const setupTabNavigation = (): void => getUIManagerInstance().setupTabNavigation();
const setupMessageInputEventListeners = (): void => getUIManagerInstance().setupMessageInputEventListeners();
const initializeTheme = (): Promise<void> => getUIManagerInstance().initializeTheme();
const setTheme = (theme: string): Promise<void> => getUIManagerInstance().setTheme(theme);
const toggleTheme = (): Promise<void> => getUIManagerInstance().toggleTheme();

const initializeUIManager = (): UIManager | null => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    Logger.debug('ℹ️ UIManager: Skipping bootstrap (no DOM available)', null, 'presence');
    return null;
  }

  const instance = getUIManagerInstance();

  if (!windowBindingsRegistered) {
    registerWindowBindings(instance);
  }

  return instance;
};

const uiManagerApi = {
  initializeUIManager,
  getUIManagerInstance,
  updateVisualHierarchy,
  debugHierarchy,
  forceRefreshCSS,
  setupTabNavigation,
  setupMessageInputEventListeners,
  initializeTheme,
  setTheme,
  toggleTheme
};

export {
  initializeUIManager,
  getUIManagerInstance,
  updateVisualHierarchy,
  debugHierarchy,
  forceRefreshCSS,
  setupTabNavigation,
  setupMessageInputEventListeners,
  initializeTheme,
  setTheme,
  toggleTheme
};

export default uiManagerApi;

initializeUIManager();
