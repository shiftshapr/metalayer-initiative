/**
 * Global Type Definitions
 * Extend Window interface for custom properties
 */

import { User, Message, AurasIntegration } from './index.js';
import type { NavigationManager } from '../features/NavigationManager.js';
import type { UIManager } from '../features/UIManager.js';
import type {
  DiagnosticLogEntry,
  MessageDisplayDiagnosticResult,
  ComprehensiveFormattingDiagnosticResult,
  RootCauseDiagnosticResult
} from '../utils/diagnostics/types.js';
import type { SupabaseClient } from './index.js';
import type { ApiResponse, APIRequestOptions } from './api.js';
import type { Reaction } from './index.js';

// Integration interfaces
interface RobustIntegration {
  initialize?: () => Promise<boolean>;
  isInitialized?: boolean;
  sendMessage?: (message: Message) => Promise<void>;
  [key: string]: unknown; // Allow additional dynamic properties
}

interface ReactionsIntegration {
  loadReactions?: (messageId: string) => Promise<Reaction[]>;
  addReaction?: (messageId: string, emoji: string) => Promise<void>;
  removeReaction?: (messageId: string, emoji: string) => Promise<void>;
  [key: string]: unknown; // Allow additional dynamic properties
}

declare global {
  interface Window {
    currentUser?: User | null;
    AVATAR_FALLBACK_COLOR?: string;
    AvatarUtils?: {
      createUnifiedAvatar?: (user: User) => HTMLElement;
      getAvatarColor?: (email: string) => Promise<string>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    configManager?: {
      get?: (key: string) => unknown;
      set?: (key: string, value: unknown) => void;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    supabaseRealtimeClient?: {
      getPageUsers?: (pageId: string) => Promise<User[]>;
      joinPage?: (pageId: string) => Promise<void>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    robustIntegration?: RobustIntegration;
    reactionsIntegration?: ReactionsIntegration;
    aurasIntegration?: AurasIntegration;
    supabase?: SupabaseClient; // Supabase client
    api?: {
      request: <T = unknown>(endpoint: string, options?: APIRequestOptions) => Promise<ApiResponse<T>>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    authManager?: {
      getCurrentUser: () => Promise<{ id?: string; email?: string } | null>;
      updateUserProfile: (profile: { auraColor?: string; avatarUrl?: string }) => void;
      getAuthToken?: () => Promise<string>;
      currentProvider?: { name?: string } | string;
      signIn?: (provider: string, email?: string) => Promise<{ user?: User; session?: unknown }>;
      signOut?: () => Promise<void>;
    };
    unifiedAuth?: {
      signIn?: (provider: string, email?: string) => Promise<{ user?: User; session?: unknown }>;
      signOut?: () => Promise<void>;
      getCurrentUser?: () => Promise<User | null>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    authenticateUserForRealtime?: (user: User, email?: string) => Promise<boolean>;
    testRealtimeWithUnifiedAuth?: (pageId?: string) => Promise<boolean>;
    signInWithGoogle?: (options?: { email?: string; redirectUrl?: string }) => Promise<void>;
    RealGoogleAuth?: {
      signIn?: (options?: { email?: string }) => Promise<void>;
      getCurrentUser?: () => Promise<User | null>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    testRealtimeWithAuth?: (supabase?: SupabaseClient, pageId?: string) => Promise<{ success: boolean; eventReceived?: boolean; status?: string }>;
    realGoogleAuth?: {
      getCurrentUser: () => Promise<User | null>;
    };
    completeOTPVerification?: (supabase: SupabaseClient, token: string) => Promise<{ success: boolean; user?: User; session?: unknown; error?: string }>;
    getState?: <T = unknown>(key: string) => Promise<T | null>;
    setState?: <T = unknown>(key: string, value: T) => Promise<void>;
    getAvatarColor?: (email: string) => Promise<string>;
    refreshUserAvatar?: () => void;
    updateUI?: (user?: User) => Promise<void> | void;
    addMessageToChat?: (message: Partial<Message> | Message) => Promise<void> | void;
    loadChatHistory?: (communityIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
    loadMessageReactions?: (messageId: string, reactionBtn?: HTMLElement | null) => Promise<void>;
    handleMessageFocus?: (messageOrId: Message | string) => Promise<void>;
    createUnifiedMessageElement?: (message: Message) => Promise<HTMLElement>;
    updateReactionDisplay?: (messageId: string, reactions: Reaction[]) => void;
    addMessageActionListeners?: (messageDiv: HTMLElement, message: Message) => void;
    refreshAllReactionDisplays?: () => void;
    refreshAllMessageAvatars?: () => void;
    focusedMessage?: Message | string | null;
    showNotification?: (message: string, options?: { type?: 'success' | 'error' | 'info' | 'warning'; duration?: number }) => void;
    handleReplyClick?: (messageId: string, message: Message) => void;
    setReplyContext?: (messageId: string, message: Message) => void;
    handleReactionClick?: (messageId: string, message: Message) => void;
    handleBookmarkClick?: (messageId: string, message: Message) => void;
    handleShareClick?: (messageId: string, message: Message) => void;
    handleEditClick?: (messageId: string, message: Message) => void;
    handleDeleteClick?: (messageId: string, message: Message) => void;
    toggleThreadReplies?: (conversationId: string, messageElement: HTMLElement) => void;
    clearContext?: () => void;
    previousView?: string;
    uiManager?: UIManager;
    UIManager?: typeof UIManager;
    currentChatData?: Message[] | Record<string, Message[]>;
    currentVisibilityData?: { active?: User[] } | { active?: User[] };
    currentVisibilityDataUnfiltered?: { active?: User[] };
    currentUrlData?: {
      pageId?: string;
      rawUrl?: string;
      normalizedUrl?: string;
    };
    activeCommunities?: string[];
    navigationManager?: NavigationManager;
    notificationHistory?: Array<{ message: string; timestamp: number; type?: string }>;
    logger?: {
      error?: (message: string, ...args: unknown[]) => void;
      warn?: (message: string, ...args: unknown[]) => void;
      info?: (message: string, ...args: unknown[]) => void;
      debug?: (message: string, ...args: unknown[]) => void;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    messageDiagnostic?: {
      run?: () => Promise<MessageDisplayDiagnosticResult>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    StatusDotHelper?: {
      updateStatus?: (userId: string, status: string) => void;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    runMessageDisplayDiagnostic?: () => Promise<MessageDisplayDiagnosticResult>;
    runComprehensiveFormattingDiagnostic?: () => Promise<ComprehensiveFormattingDiagnosticResult>;
    runRootCauseDiagnostic?: () => Promise<RootCauseDiagnosticResult>;
    messageDisplayDiagnosticResults?: MessageDisplayDiagnosticResult;
    formattingDiagnosticResults?: ComprehensiveFormattingDiagnosticResult;
    rootCauseDiagnosticResults?: RootCauseDiagnosticResult;
    canopiDiagnosticLog?: DiagnosticLogEntry[];
    canopiDiagnostics?: {
      runAll: () => Promise<Record<string, unknown>>;
    };
    // Provenance-related properties
    provenanceService?: {
      verify?: (data: unknown) => Promise<boolean>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    provenanceDiagnostic?: {
      run?: () => Promise<unknown>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    provenanceVerifier?: {
      verify?: (data: unknown) => Promise<boolean>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    provenanceLinkInjector?: {
      inject?: (data: unknown) => Promise<void>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    sendMessageViaSupabase?: (message: Partial<Message>) => Promise<Message | null>;
    handleDeleteMessage?: (messageId: string) => Promise<boolean>;
    updateMessageInChat?: (message: Message) => void;
    // Visibility-related properties
    setVisibilityStatus?: (status: boolean) => Promise<void>;
    updateVisibleTab?: (avatars: User[]) => Promise<void>;
    visibilityUpdateTimer?: NodeJS.Timeout;
    visibilityStatusRefreshInterval?: NodeJS.Timeout;
    tabContextManager?: {
      getTabContainer: (tabId: string) => HTMLElement | null;
    };
    getCurrentUserEmail?: () => Promise<string | null>;
    // Agent-related properties
    METALAYER_API_URL?: string;
    youtubeService?: {
      processYouTubeVideo: (videoData: { url?: string; videoId?: string; [key: string]: unknown }) => Promise<{ success: boolean; [key: string]: unknown }>;
    };
    debugAgentTab?: () => void;
    debugAgent?: () => void;
    AgentModule?: {
      initialize?: () => Promise<void>;
      [key: string]: unknown; // Allow additional dynamic properties
    };
    initializeAgentTab?: () => void;
    chrome?: {
      runtime?: {
        getURL: (path: string) => string;
      };
    };
    // Storage & Display related properties
    getCurrentUserAuraColor?: () => Promise<string>;
    updateAuraColorEverywhere?: (color: string) => Promise<boolean>;
    getCurrentUserAvailability?: () => Promise<'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE'>;
    updateAvailabilityEverywhere?: (availability: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE') => Promise<boolean>;
    getCurrentUserTheme?: () => Promise<'light' | 'dark' | 'auto'>;
    updateThemeEverywhere?: (theme: 'light' | 'dark' | 'auto') => Promise<boolean>;
    syncStorageWithDatabase?: () => Promise<void>;
    userPreferencesManager?: {
      isInitialized: boolean;
      getPreference: (key: string) => Promise<string | number | boolean | null>;
      savePreference: (key: string, value: string | number | boolean | null, options?: { batch?: boolean }) => Promise<void>;
    };
    UserPreferencesManager?: {
      new: () => {
        getPreference: (key: string) => Promise<string | number | boolean | null>;
        savePreference: (key: string, value: string | number | boolean | null) => Promise<void>;
      };
    };
    displayNameManager?: {
      initialize: () => Promise<void>;
    };
    DisplayNameManager?: {
      new: () => {
        initialize: () => Promise<void>;
      };
    };
    settingsHeadlineManager?: {
      initialize: () => Promise<void>;
    };
    SettingsHeadlineManager?: {
      new: () => {
        initialize: () => Promise<void>;
      };
    };
    [key: string]: any; // Allow dynamic properties
  }
}

export {};

