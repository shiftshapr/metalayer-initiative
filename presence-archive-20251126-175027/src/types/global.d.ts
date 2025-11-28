/**
 * Global Type Definitions
 * Extends Window interface with application-specific properties
 */

import type { User, Message, SupabaseClient, ApiResponse, StateManager } from './index.js';
import type { SupabaseRealtimeClientBridge } from './realtime.js';
import type { BaseManagerWindowAPI, ManagerWindowAPI } from './window-utils.js';
type AuraChangePayload = import('../features/RealtimeManager.js').AuraChangePayload;

type AgentModuleConstructor = typeof import('../features/AgentModule.js')['AgentModule'];
type InitializeAgentTabFn = typeof import('../features/AgentModule.js')['initializeAgentTab'];

type DisplayNameManagerConstructor = typeof import('../features/DisplayNameManager.js')['DisplayNameManager'];
type SettingsHeadlineManagerConstructor = typeof import('../features/SettingsHeadlineManager.js')['SettingsHeadlineManager'];
type CursorVisualSettingsManagerConstructor = typeof import('../features/CursorVisualSettingsManager.js')['CursorVisualSettingsManager'];
type CursorVisualSettingsManagerInstance = InstanceType<CursorVisualSettingsManagerConstructor>;
type ProfileManagerConstructor = typeof import('../features/ProfileManager.js')['ProfileManager'];
type UIManagerConstructor = typeof import('../features/UIManager.js')['UIManager'];
type NotificationManagerConstructor = typeof import('../features/NotificationManager.js')['NotificationManager'];
type RealtimeManagerConstructor = typeof import('../features/RealtimeManager.js')['RealtimeManager'];

// Modal and renderer types
type UnifiedMessageModalClass = typeof import('../components/UnifiedMessageModal.js')['UnifiedMessageModal'];
type UnifiedMessageModalInstance = InstanceType<UnifiedMessageModalClass>;
type UnifiedMessageModalOptions = import('../components/UnifiedMessageModal.js').MessageModalOptions;
type UnifiedMessageRendererClass = typeof import('../utils/UnifiedMessageRenderer.js')['UnifiedMessageRenderer'];
type UserHoverModalClass = typeof import('../features/UserHoverModal.js')['UserHoverModal'];
type UserHoverModalInstance = InstanceType<UserHoverModalClass>;

// Window API types for managers - using shared utilities
type DisplayNameManagerWindowAPI = ManagerWindowAPI<{
  updateCharCount?: () => void;
}>;

type SettingsHeadlineManagerWindowAPI = ManagerWindowAPI<{
  updateCharCount?: () => void;
}>;

interface WindowYouTubeService {
  processYouTubeVideo?: (videoData: {
    videoId: string;
    title: string;
    description?: string;
    [key: string]: unknown;
  }) => Promise<{
    transcript?: string;
    summary?: string;
    keyPoints?: string[];
    questions?: string[];
  } | null>;
  [key: string]: unknown;
}

declare global {
  interface Window {
    // User and authentication
    currentUser?: User;
    signInWithGoogle?: () => Promise<unknown>;
    signOut?: () => void;
    requireAuth?: (action: string, callback: () => void) => void;
    sendMagicLink?: (email: string) => Promise<unknown>;
    showAuthPrompt?: (action: string) => void;
    logout?: () => void;
    RealGoogleAuth?: {
      initialize: () => Promise<boolean>;
      signInWithGoogle: () => Promise<unknown>;
      signInWithMagicLink: (email: string) => Promise<unknown>;
      [key: string]: unknown;
    };
    
    // State management
    activeCommunities?: string[];
    setState?: (key: string, value: unknown, persist?: boolean) => void;
    getState?: (key: string) => unknown;
    stateManagerInstance?: StateManager;
    
    // UI and navigation
    updateUI?: (user?: User) => void | Promise<void>;
    // updateVisibleTab removed - use VisibilityTab component from visibility/ui/
    loadFocusMode?: () => void;
    loadDefaultView?: () => void;
    markInitializationComplete?: () => void;
    
    // Avatar and display
    AVATAR_FALLBACK_COLOR?: string;
    refreshUserAvatar?: () => void;
    resetCustomAvatarColor?: () => void;
    
    // API and services
    api?: {
      request: <T = unknown>(endpoint: string, options?: { method?: string; body?: string | Record<string, unknown>; headers?: Record<string, string> }) => Promise<{ data?: T; error?: unknown } | ApiResponse<T>>;
      getChatHistory?: (communityId: string, conversationId: string | null, uri: string) => Promise<unknown>;
      getReactions?: (messageId: string) => Promise<unknown>;
      [key: string]: unknown;
    };
    supabase?: SupabaseClient;
    
    // Realtime
    supabaseRealtimeClient?: SupabaseRealtimeClientBridge;
    testRealtimeAfterAuth?: (pageId: string) => Promise<boolean>;
    
    // Visibility and presence
    currentVisibilityData?: { active?: Array<Record<string, unknown>>; [key: string]: unknown } | Array<Record<string, unknown>>;
    currentVisibilityDataUnfiltered?: {
      active?: Array<Record<string, unknown>>;
      [key: string]: unknown;
    };
    
    // Chat and messages
    currentChatData?: Message[] | Record<string, Message[]>;
    currentUrlData?: {
      pageId?: string;
      rawUrl?: string;
      normalizedUrl?: string;
    };
    loadChatHistory?: (communityIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    sendMessageViaSupabase?: (message: Partial<Message>) => Promise<Message | null>;
    handleDeleteMessage?: (messageId: string) => Promise<boolean>;
    addMessageToChat?: (message: Partial<Message>) => void;
    createUnifiedMessageElement?: (message: Message) => HTMLElement | Promise<HTMLElement>;
    CommunitiesModule?: {
      getCommunityName?: (communityId: string) => string | Promise<string>;
      [key: string]: unknown;
    };
    displayNameManager?: DisplayNameManagerWindowAPI;
    DisplayNameManager?: DisplayNameManagerConstructor;
    reactionsService?: {
      toggleReaction?: (messageId: string) => Promise<void>;
      loadReactions?: (messageId: string) => Promise<void>;
      [key: string]: unknown;
    };
    bookmarkService?: {
      toggleBookmark?: (messageId: string) => Promise<void>;
      [key: string]: unknown;
    };
    replyService?: {
      replyToMessage?: (message: Message) => Promise<void>;
      [key: string]: unknown;
    };
    repostService?: {
      repostMessage?: (message: Message) => Promise<void>;
      [key: string]: unknown;
    };
    shareService?: {
      shareMessage?: (message: Message) => Promise<void>;
      [key: string]: unknown;
    };
    editService?: {
      editMessage?: (messageId: string, newContent: string) => Promise<void>;
      [key: string]: unknown;
    };
    deleteService?: {
      deleteMessage?: (messageId: string) => Promise<void>;
      [key: string]: unknown;
    };
    handleReplyToMessage?: (message: Message) => Promise<void>;
    repostMessage?: (message: Message) => Promise<void>;
    shareMessage?: (message: Message) => Promise<void>;
    removeMessageFromChat?: (messageId: string) => void;
    addMessageActionListeners?: (messageDiv: HTMLElement, message: Message) => void;
    
    // Utilities
    StatusDotHelper?: {
      getStatusDotColor?: (status: string) => string;
      [key: string]: unknown;
    };
    XIcons?: {
      more?: (opts: { width: number; height: number }) => string;
      [key: string]: unknown;
    };
    ENABLE_4STATE_STATUS?: boolean;
    AvatarUtils?: {
      createUnifiedAvatar?: (user: User, context: string, options: { size?: number; showAura?: boolean; showStatus?: boolean }) => Promise<string>;
      [key: string]: unknown;
    };
    
    // Preferences and settings
    userPreferencesManager?: {
      initialize: (userId: string) => Promise<boolean>;
      getPreference: (key: string) => Promise<string | number | boolean | null>;
      savePreference: (key: string, value: string | number | boolean, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<boolean>;
      savePreferences: (preferences: Record<string, string | number | boolean>, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<Record<string, boolean>>;
      isInitialized: boolean;
      [key: string]: unknown;
    };
    unifiedSettingsStorage?: {
      getSetting: (key: string, defaultValue?: unknown, options?: Record<string, unknown>) => Promise<unknown>;
    };
    getSetting?: (key: string, defaultValue?: unknown, options?: Record<string, unknown>) => Promise<unknown>;
    saveSetting?: (key: string, value: unknown, options?: Record<string, unknown>) => Promise<void>;
    UserPreferencesManager?: {
      new (): {
        initialize: (userId: string) => Promise<boolean>;
        getPreference: (key: string) => Promise<string | number | boolean | null>;
        savePreference: (key: string, value: string | number | boolean, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<boolean>;
        savePreferences: (preferences: Record<string, string | number | boolean>, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<Record<string, boolean>>;
        isInitialized: boolean;
        [key: string]: unknown;
      };
    };
    
    // Navigation
    navigationManager?: {
      navigateToUrl?: (url: string) => void;
      [key: string]: unknown;
    };
    NavigationManager?: {
      new (): {
        navigateToUrl: (url: string) => void;
        [key: string]: unknown;
      };
    };
    
    // Provenance
    provenanceService?: {
      getProvenanceUrl?: (messageId: string, baseUrl: string) => string;
      [key: string]: unknown;
    };
    provenanceDiagnostic?: unknown;
    provenanceVerifier?: unknown;
    provenanceLinkInjector?: {
      initialize?: () => Promise<void>;
      injectForMessage?: (messageId: string, messageElement?: HTMLElement | null) => void;
      setBaseUrl?: (url: string) => void;
      cleanup?: () => void;
      [key: string]: unknown;
    };
    
    // Theme tracking
    themeChangeTracker?: {
      startTracking: () => void;
      stopTracking: () => void;
      [key: string]: unknown;
    };
    
    // Build tracking
    buildTracker?: {
      getBuildNumber: () => number;
      getBuildInfo: () => { buildNumber: number; timestamp: string; gitCommit?: string; gitBranch?: string; version?: string } | null;
      isLoaded: () => boolean;
      getBuildString: () => string;
      [key: string]: unknown;
    };
    __BUILD_INFO__?: {
      buildNumber: number;
      timestamp: string;
      gitCommit?: string;
      gitBranch?: string;
      version?: string;
      firstBuild?: string;
      lastBuild?: string;
    };
    
    // Cursor parking
    cursorParkManager?: {
      parkCursor: (x: number, y: number, context?: Record<string, unknown>) => Promise<string | null>;
      unparkCursor: (cursorId?: string) => Promise<void>;
      toggleParkCursor: (x: number, y: number, context?: Record<string, unknown>) => Promise<boolean>;
      isParked: () => boolean;
      [key: string]: unknown;
    };
    parkCursor?: (x: number, y: number, context?: Record<string, unknown>) => Promise<string | null>;
    unparkCursor?: (cursorId?: string) => Promise<void>;
    toggleParkCursor?: (x: number, y: number, context?: Record<string, unknown>) => Promise<boolean>;
    isCursorParked?: () => boolean;
    
    settingsHeadlineManager?: SettingsHeadlineManagerWindowAPI;
    SettingsHeadlineManager?: SettingsHeadlineManagerConstructor;
    cursorVisualSettingsManager?: CursorVisualSettingsManagerInstance;
    CursorVisualSettingsManager?: CursorVisualSettingsManagerConstructor;
    visibilitySettingsManager?: {
      updateThemeStatus?: () => void;
      ensureEventListeners?: () => Promise<void>;
      [key: string]: unknown;
    };
    
    // Additional managers
    profileManager?: InstanceType<ProfileManagerConstructor>;
    ProfileManager?: ProfileManagerConstructor;
    uiManager?: InstanceType<UIManagerConstructor>;
    UIManager?: UIManagerConstructor;
    notificationManager?: InstanceType<NotificationManagerConstructor>;
    NotificationManager?: NotificationManagerConstructor;
    realtimeManager?: InstanceType<RealtimeManagerConstructor>;
    RealtimeManager?: RealtimeManagerConstructor;

    // Message modals
    unifiedMessageModal?: UnifiedMessageModalInstance;
    UnifiedMessageModal?: UnifiedMessageModalClass;
    openReplyModal?: (message: Message | { id: string; communityId?: string }, pageId: string) => Promise<void>;
    openQuoteModal?: (message: Message | { id: string; communityId?: string }, pageId: string) => Promise<void>;
    openMessageModal?: (options: UnifiedMessageModalOptions) => Promise<void>;
    UnifiedMessageRenderer?: UnifiedMessageRendererClass;
    userHoverModal?: UserHoverModalInstance;
    UserHoverModal?: UserHoverModalClass;
    
    // User utilities
    getCurrentUser?: () => User | null;
    
    // Other
    completeOTPVerification?: (supabase: SupabaseClient, otpCode: string) => Promise<{ success?: boolean; user?: User; session?: { expiresAt?: number; [key: string]: unknown } } | unknown>;
    eventReceived?: unknown;
    status?: string;
    toLowerCase?: string;
    
    // Supabase and realtime
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    SupabaseRealtimeClient?: {
      prototype?: {
        getPageUsers?: (pageId: string) => Promise<unknown[]>;
        supabase?: SupabaseClient;
      };
    };
    
    // Message action services (window fallbacks) - duplicates removed, see above
    
    // API configuration
    API_URL?: string;
    API_BASE_URL?: string;
    apiBaseURL?: string;
    METALAYER_API_URL?: string;
    configManager?: {
      get?: (key: string) => string | undefined;
      [key: string]: unknown;
    };
    youtubeService?: WindowYouTubeService;
    debugAgentTab?: () => void;
    debugAgent?: () => void;
    AgentModule?: AgentModuleConstructor;
    initializeAgentTab?: InitializeAgentTabFn;
    config?: {
      API_URL?: string;
      [key: string]: unknown;
    };
    
    // Real Google Auth
    realGoogleAuth?: {
      getCurrentUser: () => Promise<User | null>;
      initialize: () => Promise<boolean>;
      initialized?: boolean;
      [key: string]: unknown;
    };
    
    // Notification
    showNotification?: (message: string, options?: Record<string, unknown>) => void;
    
    // Sidepanel module graph (temporary, for migration)
    __CANOPI_MODULE_GRAPH__?: unknown;
    __CANOPI_SIDEPANEL_READY__?: boolean;
    __DISABLE_LEGACY_SIDEPANEL__?: boolean;
    
    // Tab context manager
    tabContextManager?: {
      getActiveTab?: () => string | null;
      getTabContainer?: (tabId: string) => HTMLElement | null;
      [key: string]: unknown;
    };
    
    // URL normalization
    normalizeUrl?: (url: string) => Promise<{ normalizedUrl?: string; pageId?: string }>;
    
    // Auto-resize utility
    autoResize?: (element: HTMLTextAreaElement) => void;
    
    // Visibility functions
    setVisibilityStatus?: (visible: boolean) => Promise<void>;
    navigateToVisibilityTab?: () => void;
    
    // Lifecycle manager
    lifecycleManager?: {
      register: (name: string, hooks: { init?: () => boolean; destroy?: () => boolean; initialize?: () => boolean }, options?: { dependencies?: string[]; autoInitialize?: boolean }) => void;
      [key: string]: unknown;
    };
    
    // Additional application-specific properties
    authModule?: unknown;
    authenticateWithSupabase?: (user: User) => Promise<void>;
    clickOutsideListenerAdded?: boolean;
    completeOTPForRealtime?: (otpCode: string) => Promise<boolean>;
    createAuthPromptModal?: (action: string) => void;
    
    // Diagnostic Framework (grouped for better organization)
    diagnosticFramework?: {
      // Core diagnostic functions
      diagnoseAll?: () => Promise<unknown>;
      diagnoseIssue?: (issue: string) => Promise<unknown>;
      diagnoseFocusModeReplies?: () => Promise<unknown>;
      diagnoseReplyDisplay?: () => Promise<unknown>;
      
      // Diagnostic getters
      getDiagnosticResults?: () => unknown;
      getFocusModeReplyDiagnostic?: () => Promise<unknown>;
      getLoadingReplyDiagnostic?: () => Promise<unknown>;
      getReplyDisplayDiagnostic?: () => Promise<unknown>;
      
      // Diagnostic runners
      runComprehensiveFormattingDiagnostic?: () => Promise<unknown>;
      runMessageDisplayDiagnostic?: () => Promise<unknown>;
      runMessageFetchDiagnostic?: () => Promise<unknown>;
      runRootCauseDiagnostic?: () => Promise<unknown>;
      
      // Diagnostic results
      comprehensiveDiagnosticResults?: unknown;
      
      // Allow additional diagnostic properties
      [key: string]: unknown;
    };
    eventBus?: {
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      emit?: (event: string, ...args: unknown[]) => void;
      off?: (event: string, handler: (...args: unknown[]) => void) => void;
      [key: string]: unknown;
    };
    focusedMessage?: Message | null;
    getCurrentPageUri?: () => string | null;
    getCurrentUserAvatarBgColor?: () => string;
    getCurrentUserAvatarColor?: () => Promise<string>;
    getCurrentUserEmail?: () => Promise<string | null>;
    getCurrentUserId?: () => Promise<string | null>;
    getMessageActionsMenu?: (message: Message) => HTMLElement | null;
    getPreference?: (key: string) => Promise<string | number | boolean | null>;
    getUserAvatarBgColor?: () => string;
    handleAuraChange?: (payload: AuraChangePayload) => void;
    handleRepostClick?: (message: Message) => Promise<void>;
    handleShareClick?: (message: Message) => Promise<void>;
    initializePresenceTracking?: () => Promise<boolean>;
    initializeRealGoogleAuth?: () => void;
    monitoringService?: {
      start?: () => void;
      stop?: () => void;
      [key: string]: unknown;
    };
    normalizeCurrentUrl?: () => Promise<{ normalizedUrl?: string; pageId?: string }>;
    performLogout?: () => Promise<void>;
    presenceTrackingActive?: boolean;
    refreshAllMessageAvatars?: () => Promise<void>;
    refreshVisibilityAvatars?: () => Promise<void>;
    savePreference?: (key: string, value: string | number | boolean, options?: { skipDatabase?: boolean; batch?: boolean }) => Promise<boolean>;
    showColorPickerModal?: () => void;
    stateManager?: StateManager;
    subscriptionManager?: {
      subscribe?: (channel: string, callback: (data: unknown) => void) => void;
      unsubscribe?: (channel: string) => void;
      [key: string]: unknown;
    };
    supabaseUser?: User;
    updateVisibleTab?: () => void;
    userPref?: {
      get?: (key: string) => Promise<unknown>;
      set?: (key: string, value: unknown) => Promise<void>;
      [key: string]: unknown;
    };
    visibilityModalHandler?: {
      open?: () => void;
      close?: () => void;
      [key: string]: unknown;
    };
    
    // Additional properties that may be accessed but not always defined
    isCursorParked?: () => boolean;
    
    // Dynamic properties
    [key: string]: unknown;
  }
}

export {};

