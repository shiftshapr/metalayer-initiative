// @ts-ignore - TypeScript module resolution issue
import type { ModuleGraph } from '../types/index';
import { createEventListenerManager } from '../../utils/EventListenerManager.js';
// @ts-ignore - JavaScript module without type declarations
import { getActiveSidepanelTab } from '../../../extension/utils/getActiveSidepanelTab.js';
// ROOT CAUSE FIX: Import LoadingGifManager for coordinated loading gif management
import { getLoadingGifManager } from '../../features/TabManager/LoadingGifManager.js';

// Chrome extension types
declare const chrome: {
  tabs: {
    query: (queryInfo: any, callback: (tabs: any[]) => void) => void;
  };
  runtime: {
    lastError?: { message: string };
  };
};
interface User {
  id?: string;
  email?: string;
  name?: string;
  handle?: string;
  avatarUrl?: string;
  auraColor?: string;
  userId?: string;
  [key: string]: unknown;
}

interface BootControllerOptions {
  realtimeController: {
    startForCurrentPage: () => void;
    handleAuthenticatedUser: (user: User) => Promise<void>;
    [key: string]: unknown;
  };
  loadChatHistory: (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  refreshVisibility: (pageId: string | null) => Promise<void>;
  initializeTheme: () => Promise<void>;
  setupTabNavigation: () => void;
  setupMessageInputEventListeners: () => void;
  messageLoadingService?: {
    loadMessages: (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  };
  [key: string]: unknown;
}

// RED-LINE: No hardcoded community - communities must come from database

export class BootController {
  private graph: ModuleGraph;
  private options: BootControllerOptions;
  // ROOT CAUSE FIX: Add LoadingGifManager for coordinated loading state management
  private loadingGifManager: ReturnType<typeof getLoadingGifManager>;

  constructor(graph: ModuleGraph, options: BootControllerOptions) {
    this.graph = graph;
    this.options = options;
    // ROOT CAUSE FIX: Initialize LoadingGifManager for coordinated loading gif management
    this.loadingGifManager = getLoadingGifManager(this.graph.logger);
  }

  async initialize(): Promise<void> {
    await this.initializeState();
    this.registerLifecycle();
    await this.initializeAuthFlow();
    this.setupEventBridges();
    await this.safeInitializeTheme();
    await this.checkAndLoadVisibilityTab();

    // ROOT CAUSE FIX: Direct message loading trigger - simple and reliable
    // Wait for TabController to finish, then ensure messages load
    // CRITICAL FIX: Prevent double reload by checking if messages are already loading
    if (typeof document !== 'undefined' && typeof chrome !== 'undefined' && chrome.tabs) {
      // Use waitForEvent to wait for TabController to complete, then check
      const triggerMessageLoad = async (): Promise<void> => {
        try {
          // OPTIMIZATION: Reduced delay from 2500ms to 500ms for faster initialization
          // TabController should initialize quickly, 500ms provides buffer without excessive wait
          await new Promise((resolve) => setTimeout(resolve, 500));

          const currentUrlData = this.graph.stateManager.getState('currentUrlData') as {
            rawUrl?: string;
          } | null;
          const messagesInDom = document.querySelector('.chat-messages')?.children.length || 0;

          // COORDINATED FIX: Check multiple sources for loading state to prevent double reload
          const isLoading = this.graph.stateManager.getState('messages.isLoading') as
            | boolean
            | undefined;
          const lastLoadTime = this.graph.stateManager.getState('messages.lastLoadTime') as
            | number
            | undefined;
          const timeSinceLastLoad = lastLoadTime ? Date.now() - lastLoadTime : Infinity;

          // Check if TabManager already loaded the discuss tab
          const win = typeof window !== 'undefined' ? window : null;
          const tabManager = (
            win as Window & {
              tabContextManager?: {
                isTabLoaded?: (tabId: string) => boolean;
              };
            }
          )?.tabContextManager;
          const discussTabLoaded = tabManager?.isTabLoaded?.('discuss-tab') || false;

          // If messages were loaded in the last 3 seconds OR discuss tab was already loaded, skip
          if (isLoading || (lastLoadTime && timeSinceLastLoad < 3000) || discussTabLoaded) {
            this.graph.logger?.debug?.('BOOT_CTRL_SKIP_LOAD', {
              isLoading,
              timeSinceLastLoad,
              discussTabLoaded,
              message:
                'Messages already loading, recently loaded, or discuss tab pre-loaded, skipping to prevent double reload',
            });
            return;
          }

          this.graph.logger?.debug?.('BOOT_CTRL_MESSAGE_CHECK', {
            hasUrlData: !!currentUrlData?.rawUrl,
            messagesInDom,
            isLoading,
            timeSinceLastLoad,
            hasMessageService: !!this.options.messageLoadingService,
            hasLoadChatHistory: !!this.options.loadChatHistory,
          });

          // If no URL captured and no messages, trigger manual capture
          if (!currentUrlData?.rawUrl && messagesInDom === 0) {
            this.graph.logger?.warn?.('BOOT_CTRL_FALLBACK_NEEDED', {
              message: 'TabController did not capture URL, triggering fallback',
            });

            try {
              const tabs = await new Promise<any[]>((resolve, reject) => {
                chrome.tabs.query({ active: true, currentWindow: true }, (result: any[]) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(result);
                  }
                });
              });
              if (tabs && tabs.length > 0 && tabs[0]?.url) {
                const tabUrl = tabs[0].url;
                // Only process non-chrome URLs
                if (
                  tabUrl &&
                  !tabUrl.startsWith('chrome://') &&
                  !tabUrl.startsWith('chrome-extension://')
                ) {
                  this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_URL_CAPTURE', { tabUrl });

                  // ROOT CAUSE FIX: Set loading state before calling to prevent double reload
                  this.graph.stateManager.setState('messages.isLoading', true);
                  this.graph.stateManager.setState('messages.lastLoadTime', Date.now());

                  // Trigger message loading via service if available
                  if (this.options.messageLoadingService) {
                    this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_CALLING_SERVICE', { tabUrl });
                    try {
                      await this.options.messageLoadingService.loadMessages(tabUrl);
                      this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_SERVICE_COMPLETE', { tabUrl });
                    } finally {
                      this.graph.stateManager.setState('messages.isLoading', false);
                    }
                  } else if (this.options.loadChatHistory) {
                    // CRITICAL FIX: Only load messages if discuss tab is active
                    const activeTab = getActiveSidepanelTab();
                    if (activeTab === 'discuss-tab' || activeTab === null) {
                      this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_CALLING_LOADCHAT', {
                        tabUrl,
                        activeTab,
                      });
                      try {
                        await this.options.loadChatHistory(tabUrl);
                        this.graph.logger?.debug?.('BOOT_CTRL_FALLBACK_LOADCHAT_COMPLETE', {
                          tabUrl,
                        });
                      } finally {
                        this.graph.stateManager.setState('messages.isLoading', false);
                      }
                    } else {
                      this.graph.stateManager.setState('messages.isLoading', false);
                    }
                  } else {
                    this.graph.stateManager.setState('messages.isLoading', false);
                  }
                }
              }
            } catch (error: unknown) {
              this.graph.logger?.error?.('BOOT_CTRL_FALLBACK_URL_CAPTURE_ERROR', {
                error,
                errorMessage: error instanceof Error ? error.message : String(error),
              });
            }
          } else if (currentUrlData?.rawUrl && messagesInDom === 0) {
            // URL captured but no messages - try loading
            this.graph.logger?.warn?.('BOOT_CTRL_URL_BUT_NO_MESSAGES', {
              url: currentUrlData.rawUrl,
              message: 'URL captured but no messages in DOM, triggering load',
            });

            // ROOT CAUSE FIX: Set loading state before calling to prevent double reload
            this.graph.stateManager.setState('messages.isLoading', true);
            this.graph.stateManager.setState('messages.lastLoadTime', Date.now());

            try {
              if (this.options.messageLoadingService) {
                await this.options.messageLoadingService.loadMessages(currentUrlData.rawUrl);
              } else if (this.options.loadChatHistory) {
                // CRITICAL FIX: Only load messages if discuss tab is active
                const activeTab = getActiveSidepanelTab();
                if (activeTab === 'discuss-tab' || activeTab === null) {
                  await this.options.loadChatHistory(currentUrlData.rawUrl);
                }
              }
            } finally {
              this.graph.stateManager.setState('messages.isLoading', false);
            }
          }
        } catch (error: unknown) {
          this.graph.logger?.error?.('BOOT_CTRL_FALLBACK_CHECK_ERROR', {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
          });
        }
      };

      // Trigger check after TabController should have completed
      triggerMessageLoad().catch((error) => {
        this.graph.logger?.error?.('BOOT_CTRL_FALLBACK_TRIGGER_ERROR', { error });
      });
    }

    // OVERRIDE: Simple message loading logic - only load on appropriate pages
    // Check if we're on a page where messages can actually load
    const currentUrl = window.location.href;
    const canLoadMessages = !currentUrl.startsWith('chrome://') &&
                           !currentUrl.startsWith('chrome-extension://') &&
                           !currentUrl.startsWith('about:') &&
                           !currentUrl.startsWith('file://');

    if (canLoadMessages) {
      const activeTab = getActiveSidepanelTab();
      if (activeTab === 'discuss-tab') {
        const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
        if (chatMessages) {
          const existingMessages = chatMessages.children.length;

          // Only show loading if we have a URL to load from and no messages exist
          const currentUrlData = this.graph.stateManager.getState('currentUrlData') as {
            rawUrl?: string;
          } | null;

          if (currentUrlData?.rawUrl && existingMessages === 0) {
            // Show loading gif
            chatMessages.innerHTML = `
              <div class="loading-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: var(--text-secondary);
              ">
                <div class="loading-spinner" style="
                  width: 40px;
                  height: 40px;
                  border: 3px solid var(--border-color);
                  border-top: 3px solid var(--accent-color);
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  margin-bottom: 16px;
                "></div>
                <div>Loading messages...</div>
              </div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            `;

            // Load messages
            try {
              this.graph.stateManager.setState('messages.isLoading', true);
              this.graph.stateManager.setState('messages.lastLoadTime', Date.now());

              if (this.options.loadChatHistory) {
                await this.options.loadChatHistory(currentUrlData.rawUrl);
                this.graph.logger?.debug?.('BOOT_CTRL_MESSAGES_LOADED', { url: currentUrlData.rawUrl });
              }
            } catch (error) {
              this.graph.logger?.error?.('BOOT_CTRL_MESSAGE_LOAD_ERROR', error);
              // ROOT CAUSE FIX: Use LoadingGifManager for error handling
              this.loadingGifManager.hideImmediate();
            } finally {
              this.graph.stateManager.setState('messages.isLoading', false);
              // ROOT CAUSE FIX: Use LoadingGifManager for completion
              this.loadingGifManager.hide();
            }
          }
        }
      }
    } else {
      this.graph.logger?.debug?.('BOOT_CTRL_SKIP_MESSAGE_LOADING', {
        url: currentUrl,
        reason: 'Messages cannot be loaded on this page type'
      });
    }
  }

  async initializeState(): Promise<void> {
    try {
      const isInitialized = (await this.graph.stateManager.getState('extension.isInitialized')) as
        | boolean
        | undefined;
      if (isInitialized) {
        return;
      }
      await this.graph.stateManager.initialize({
        userAvatarBgColor:
          (window as Window & { AVATAR_FALLBACK_COLOR?: string }).AVATAR_FALLBACK_COLOR ??
          '#7C3AED',
        googleUser: null,
        supabaseUser: null,
        metalayerUser: null,
        activeCommunities: [],
        primaryCommunity: null,
        currentCommunity: null,
        communities: [],
        theme: 'auto',
        debugMode: false,
        customAvatarColor: null,
        lastMessageId: null,
        lastLoadedUri: null,
        currentUri: null,
        presenceData: null,
        chatData: [],
        currentUrlData: null,
        extension: {
          isInitialized: true,
        },
      });
    } catch (error: unknown) {
      this.graph.logger?.error?.('STATE_INIT', { error });
    }
  }

  registerLifecycle(): void {
    const lifecycle = this.graph.lifecycleManager;
    if (!lifecycle || typeof lifecycle.register !== 'function') {
      return;
    }
    lifecycle.register(
      'sidepanel',
      {
        init: () => true,
        destroy: () => true,
      },
      {
        dependencies: ['StateManager'],
        autoInitialize: true,
      }
    );
    lifecycle.register(
      'chat',
      {
        initialize: () => true,
        destroy: () => true,
      },
      {
        dependencies: ['sidepanel'],
        autoInitialize: true,
      }
    );
  }

  async initializeAuthFlow(): Promise<void> {
    // ROOT CAUSE FIX: Initialize real Google auth at startup
    // ES6 pattern: Use imported function instead of window
    // TODO: Import initializeRealGoogleAuth from AuthModule instead of window
    // ACCEPTABLE: Optional check for backward compatibility during migration
    const win =
      typeof window !== 'undefined'
        ? (window as Window & { initializeRealGoogleAuth?: () => void })
        : null;
    if (win && typeof win.initializeRealGoogleAuth === 'function') {
      try {
        this.graph.logger?.debug?.('BOOT_CTRL_INIT_REAL_GOOGLE_AUTH', {
          message: 'Initializing real Google auth',
        });
        win.initializeRealGoogleAuth();
      } catch (error) {
        this.graph.logger?.error?.('BOOT_CTRL_AUTH_INIT_ERROR', {
          error,
          message: 'Failed to initialize real Google auth',
        });
      }
    }
    // ROOT CAUSE FIX: Intercept setState for currentUser to catch any direct sets
    // This is a safety net until real-google-auth.js is fixed to use window.handleUserChange()
    this.interceptCurrentUserSetState();

    if (!this.graph.authManager) {
      this.graph.logger?.warn?.('AUTH_INIT', { message: 'AuthManager not available' });
      return;
    }

    try {
      if (typeof this.graph.authManager.initialize === 'function') {
        await this.graph.authManager.initialize();
      }
    } catch (error: unknown) {
      this.graph.logger?.error?.('AUTH_INIT', { error });
    }

    // CRITICAL: AuthManager should ONLY trigger onAuthStateChange
    // BootController.handleUserChange() is the ONLY place that sets currentUser in state
    // This ensures UUID conversion always happens
    if (typeof this.graph.authManager.onAuthStateChange === 'function') {
      this.graph.authManager.onAuthStateChange(async (user: User | null) => {
        await this.handleUserChange(user);
      });
    }

    // Handle initial user if available
    if (typeof this.graph.authManager.getCurrentUser === 'function') {
      const initialUser = this.graph.authManager.getCurrentUser();
      if (initialUser && typeof initialUser === 'object' && 'id' in initialUser) {
        await this.handleUserChange(initialUser as User);
      }
    }
  }

  /**
   * ROOT CAUSE FIX: Intercept setState('currentUser', ...) to catch direct sets
   * This is a TEMPORARY safety net until real-google-auth.js is fixed
   * TODO: Remove this once real-google-auth.js uses window.handleUserChange()
   */
  private interceptCurrentUserSetState(): void {
    const originalSetState = this.graph.stateManager.setState.bind(this.graph.stateManager);
    const self = this;

    this.graph.stateManager.setState = async function (key: string, value: unknown): Promise<void> {
      // If setting currentUser, ensure UUID is used
      if (key === 'currentUser') {
        const user = value as User | null;

        if (user && user.email) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const isUUID = user.id && uuidRegex.test(user.id);

          // If user.id is Google ID, redirect to handleUserChange() instead
          if (!isUUID) {
            self.graph.logger?.warn?.('AUTH_UUID_FIX', {
              message:
                'CRITICAL: Intercepted direct setState("currentUser") with Google ID - redirecting to handleUserChange()',
              googleId: user.id,
              email: user.email,
              fix: 'real-google-auth.js should use window.handleUserChange() instead',
              stackTrace: new Error().stack?.split('\n').slice(0, 5).join('\n'),
            });

            // Redirect to proper flow - this will do UUID lookup and set correctly
            await self.handleUserChange(user);
            return; // Don't call original setState - handleUserChange() already set it
          }
        }
      }

      // For all other keys, or if currentUser already has UUID, proceed normally
      return originalSetState(key, value);
    };
  }

  async handleUserChange(user: User | null): Promise<void> {
    // CRITICAL: Log entry to verify this function is being called
    this.graph.logger?.info?.('AUTH_UUID_FIX', {
      message: 'handleUserChange() called',
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
    });

    if (!user) {
      await this.graph.stateManager.setState('currentUser', null);
      return;
    }

    // CRITICAL: NEVER use Google ID - user.id MUST ALWAYS be AppUser UUID
    // If user.id is not a UUID (e.g., Google ID), look up AppUser UUID immediately
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = user.id && uuidRegex.test(user.id);

    this.graph.logger?.info?.('AUTH_UUID_FIX', {
      message: 'UUID validation check',
      userId: user.id,
      isUUID: isUUID,
      hasEmail: !!user.email,
      hasSupabaseService: !!this.graph.supabaseService,
    });

    // If user.id is Google ID or invalid, look up AppUser UUID from email
    if (!isUUID && user.email) {
      if (!this.graph.supabaseService) {
        this.graph.logger?.error?.('AUTH_UUID_FIX', {
          message: 'CRITICAL: supabaseService not available - cannot lookup AppUser UUID',
          email: user.email,
          userId: user.id,
        });
        return; // Cannot proceed without supabaseService
      }

      try {
        const client = this.graph.supabaseService.getClient();
        if (!client) {
          this.graph.logger?.error?.('AUTH_UUID_FIX', {
            message: 'CRITICAL: Supabase client not available - cannot lookup AppUser UUID',
            email: user.email,
            userId: user.id,
          });
          return; // Cannot proceed without client
        }

        // Type guard for Supabase client
        if (typeof client !== 'object' || client === null || !('from' in client)) {
          this.graph.logger?.error?.('AUTH_UUID_FIX', {
            message: 'CRITICAL: Invalid Supabase client - missing from method',
            email: user.email,
            userId: user.id,
          });
          return; // Cannot proceed without valid client
        }

        this.graph.logger?.info?.('AUTH_UUID_FIX', {
          message: 'Looking up AppUser UUID from email',
          email: user.email,
          googleId: user.id,
        });

        // EXCEPTION: Email lookup for UUID conversion (not matching)
        // This is the ONLY legitimate use of email in database queries:
        // - User has Google ID (not UUID) and we need to find their AppUser UUID
        // - This is a one-time lookup during authentication, not ongoing matching
        // - After this lookup, all operations use UUID only

        // SECURITY FIX: Use proper type interface instead of 'any' for better type safety
        // Define minimal interface for Supabase client methods we use
        interface SupabaseQueryBuilder {
          from(table: string): {
            select(columns: string): {
              eq(
                column: string,
                value: unknown
              ): {
                single(): Promise<{
                  data: { id: string } | null;
                  error: { message: string; code?: string; details?: string } | null;
                }>;
              };
            };
          };
        }

        // Type guard ensures client has 'from' method, so we can safely cast to our interface
        const supabaseClient = client as SupabaseQueryBuilder;
        const { data, error } = await supabaseClient
          .from('AppUser')
          .select('id')
          .eq('email', user.email) // EXCEPTION: Email lookup for UUID conversion only
          .single();

        if (error) {
          this.graph.logger?.error?.('AUTH_UUID_FIX', {
            message: 'CRITICAL: Database query error looking up AppUser UUID',
            email: user.email,
            error: error.message,
            errorCode: error.code,
            errorDetails: error.details,
            currentUserId: user.id,
          });
          return; // Don't set user with invalid ID
        }

        if (!data || !data.id) {
          this.graph.logger?.error?.('AUTH_UUID_FIX', {
            message: 'CRITICAL: AppUser not found in database for email',
            email: user.email,
            currentUserId: user.id,
            dataReturned: !!data,
          });
          return; // Don't set user with invalid ID
        }

        // CRITICAL: Replace Google ID with AppUser UUID immediately
        // Store Google ID in separate field if needed, but NEVER use it for matching
        const googleId = user.id; // Preserve Google ID if needed
        user.id = data.id as string; // ALWAYS use AppUser UUID
        if (googleId && !user.googleId) {
          (user as User & { googleId?: string }).googleId = googleId;
        }

        this.graph.logger?.info?.('AUTH_UUID_FIX', {
          message: '✅ Replaced Google ID with AppUser UUID - user.id is now UUID',
          email: user.email,
          appUserUUID: user.id,
          googleId: googleId,
        });
      } catch (error: unknown) {
        this.graph.logger?.error?.('AUTH_UUID_FIX', {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          message: 'CRITICAL: Exception looking up AppUser UUID',
          email: user.email,
          userId: user.id,
        });
        // Don't set user with invalid ID
        return;
      }
    }

    // CRITICAL: Verify user.id is UUID before proceeding
    if (!user.id || !uuidRegex.test(user.id)) {
      this.graph.logger?.error?.('AUTH_UUID_FIX', {
        message: 'CRITICAL: user.id is not a valid UUID - cannot proceed',
        userId: user.id,
        email: user.email,
        afterLookup: true,
      });
      return; // Don't set user with invalid ID
    }

    // Now user.id is guaranteed to be AppUser UUID - set in state
    this.graph.logger?.info?.('AUTH_UUID_FIX', {
      message: 'Setting currentUser in state with AppUser UUID',
      appUserUUID: user.id,
      email: user.email,
    });

    await this.graph.stateManager.setState('currentUser', user);

    // CRITICAL: Verify the user was set correctly
    const verifyUser = (await this.graph.stateManager.getState('currentUser')) as User | null;
    if (verifyUser?.id !== user.id) {
      this.graph.logger?.error?.('AUTH_UUID_FIX', {
        message: 'CRITICAL: User ID mismatch after setting in state',
        expectedUUID: user.id,
        actualId: verifyUser?.id,
        email: user.email,
      });
    }

    // REFACTOR PHASE 1: Single Initialization Point
    // This is the ONLY place where VisibilityManager.initialize() is called
    // user.id is now guaranteed to be AppUser UUID (not Google ID)
    if (this.graph.visibilityManager) {
      const status = this.graph.visibilityManager.getStatus();

      // Only initialize if not already active (initialization guard in VisibilityManager also prevents double-init)
      if (!status.isActive) {
        // user.id is now guaranteed to be AppUser UUID (checked above)
        if (!user.id) {
          this.graph.logger?.error?.('VISIBILITY_INIT', {
            message: 'CRITICAL: user.id is missing after UUID lookup',
            userEmail: user.email,
          });
          return; // Cannot initialize without UUID
        }

        try {
          // This is the ONLY initialization call in the entire codebase
          // user.id is AppUser UUID (never Google ID)
          await this.graph.visibilityManager.initialize(user.id);
          this.graph.logger?.info?.('VISIBILITY_INIT', {
            message: 'VisibilityManager initialized successfully (single initialization point)',
            appUserUUID: user.id,
            userEmail: user.email,
          });
        } catch (error: unknown) {
          this.graph.logger?.error?.('VISIBILITY_INIT', {
            error,
            message: 'Failed to initialize VisibilityManager in handleUserChange',
            appUserUUID: user.id,
            userEmail: user.email,
          });
          // Don't throw - let the system continue, but VisibilityManager won't work
        }
      } else {
        // Already initialized - this is fine, just log for debugging
        this.graph.logger?.debug?.('VISIBILITY_INIT', {
          message: 'VisibilityManager already initialized',
          currentUserId: status.currentUserId,
        });
      }
    }

    // ROOT CAUSE FIX: Ensure communities are initialized before loading messages
    await this.ensureCommunitiesInitialized();

    // ROOT CAUSE FIX: Load messages after user is authenticated and communities are ready
    // Use MessageLoadingService if available, otherwise fallback to direct loadChatHistory
    try {
      // ROOT CAUSE FIX: Load messages after user is authenticated and communities are ready
      // Get current URL from state or active tab, but don't block if URL isn't available yet
      // TabController will handle URL processing and message loading when URL is available
      let currentUrl: string | null = null;
      const currentUrlData = this.graph.stateManager.getState('currentUrlData') as {
        rawUrl?: string;
      } | null;
      if (currentUrlData?.rawUrl) {
        currentUrl = currentUrlData.rawUrl;
      } else if (typeof chrome !== 'undefined' && chrome.tabs) {
        try {
          const tabs = await new Promise<any[]>((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (result: any[]) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(result);
              }
            });
          });
          if (tabs && tabs.length > 0 && tabs[0]?.url) {
            const tabUrl = tabs[0].url;
            // Only use non-chrome URLs
            if (
              tabUrl &&
              !tabUrl.startsWith('chrome://') &&
              !tabUrl.startsWith('chrome-extension://')
            ) {
              currentUrl = tabUrl;
            }
          }
        } catch (error: unknown) {
          this.graph.logger?.warn?.('BOOT_CTRL_GET_TAB_URL', { error });
        }
      }

      // ROOT CAUSE FIX: Only load messages if we have a URL
      // If no URL yet, TabController will handle it when URL is processed
      if (currentUrl && this.options.messageLoadingService) {
        this.graph.logger?.debug?.('BOOT_CTRL_LOAD_MESSAGES', { currentUrl, hasService: true });
        try {
          await this.options.messageLoadingService.loadMessages(currentUrl);
        } catch (error: unknown) {
          this.graph.logger?.error?.('BOOT_CTRL_LOAD_MESSAGES_ERROR', { error, currentUrl });
        }
      } else if (currentUrl && this.options.loadChatHistory) {
        // Fallback: direct call with tab check
        const win = typeof window !== 'undefined' ? window : null;
        const getActiveTabFn = (win as Window & { getActiveSidepanelTab?: () => string | null })
          ?.getActiveSidepanelTab;
        const getActiveTab =
          getActiveTabFn ||
          (() => {
            const activeTab = document.querySelector('.main-nav-tab.active');
            return activeTab?.getAttribute('data-tab') || null;
          });
        const activeTab = typeof getActiveTab === 'function' ? getActiveTab() : null;
        if (activeTab === 'discuss-tab' || activeTab === null) {
          this.graph.logger?.debug?.('BOOT_CTRL_LOAD_MESSAGES_FALLBACK', { currentUrl, activeTab });
          try {
            await this.options.loadChatHistory(currentUrl);
          } catch (error: unknown) {
            this.graph.logger?.error?.('BOOT_CTRL_LOAD_MESSAGES_FALLBACK_ERROR', {
              error,
              currentUrl,
            });
          }
        }
      } else {
        this.graph.logger?.debug?.('BOOT_CTRL_NO_URL_YET', {
          hasCurrentUrlData: !!currentUrlData,
          willBeHandledByTabController: true,
        });
      }
    } catch (error: unknown) {
      this.graph.logger?.error?.('BOOT_CTRL_LOAD_MESSAGES_ERROR', { error });
    }

    const bootWin = window as Window & {
      updateUI?: (user: User) => Promise<void> | void;
    };
    if (bootWin.updateUI) {
      await bootWin.updateUI(user);
    }
  }

  async ensureCommunitiesInitialized(): Promise<void> {
    try {
      // Import and initialize CommunitiesModule
      const { communitiesModule } = await import('../../features/CommunitiesModule.js');

      // Initialize the communities module (loads communities and updates UI)
      await communitiesModule.initialize();

      this.graph.logger?.info?.('COMMUNITIES_INIT', {
        message: 'CommunitiesModule initialized successfully'
      });
    } catch (error: unknown) {
      this.graph.logger?.warn?.('COMMUNITIES_INIT', { error });
    }
  }

  /**
   * Check if visibility tab was the previous tab and load it on startup
   * CRITICAL FIX: Only loads visibility if it was the last active tab
   */
  private async checkAndLoadVisibilityTab(): Promise<void> {
    try {
      // Wait for TabManager to be ready
      await this._waitForTabManager();

      // Get TabManager state
      const win = typeof window !== 'undefined' ? window : null;
      const tabContextManager = (
        win as Window & {
          tabContextManager?: {
            getState?: () => { currentTab?: string | null; previousTab?: string | null };
          };
        }
      )?.tabContextManager;

      if (!tabContextManager || typeof tabContextManager.getState !== 'function') {
        this.graph.logger?.debug?.('BOOT_CTRL_VISIBILITY_CHECK', {
          message: 'TabManager not available yet',
        });
        return;
      }

      const tabState = tabContextManager.getState();
      const previousTab = tabState.previousTab;
      const currentTab = tabState.currentTab;

      // Only load visibility if it was the previous tab (user had it open last time)
      if (previousTab === 'visibility-tab' || currentTab === 'visibility-tab') {
        this.graph.logger?.debug?.('BOOT_CTRL_VISIBILITY_CHECK', {
          previousTab,
          currentTab,
          shouldLoad: true,
        });

        // Get current pageId
        const currentUrlData = this.graph.stateManager.getState('currentUrlData') as {
          pageId?: string;
        } | null;
        const pageId = currentUrlData?.pageId || null;

        if (pageId && this.options.refreshVisibility) {
          this.graph.logger?.debug?.('BOOT_CTRL_LOADING_VISIBILITY', { pageId });
          try {
            await this.options.refreshVisibility(pageId);
            this.graph.logger?.debug?.('BOOT_CTRL_VISIBILITY_LOADED', { pageId });
          } catch (error: unknown) {
            this.graph.logger?.error?.('BOOT_CTRL_VISIBILITY_LOAD_ERROR', { error, pageId });
          }
        } else {
          this.graph.logger?.warn?.('BOOT_CTRL_VISIBILITY_NO_PAGEID', {
            hasPageId: !!pageId,
            hasRefreshFunction: !!this.options.refreshVisibility,
          });
        }
      } else {
        this.graph.logger?.debug?.('BOOT_CTRL_VISIBILITY_CHECK', {
          previousTab,
          currentTab,
          shouldLoad: false,
          message: 'Visibility tab was not the previous tab, skipping load',
        });
      }
    } catch (error: unknown) {
      this.graph.logger?.error?.('BOOT_CTRL_VISIBILITY_CHECK_ERROR', { error });
    }
  }

  /**
   * Handle tab content requests with coordination to prevent double loading
   */
  async handleTabContentRequest(tabId: string, options: { operation?: string; skipThemeChanges?: boolean } = {}): Promise<void> {
    try {
      const win = typeof window !== 'undefined' ? window : null;
      const tabManager = (
        win as Window & {
          tabContextManager?: {
            performTabOperation?: (tabId: string, options: any) => Promise<void>;
          };
        }
      )?.tabContextManager;

      if (tabManager?.performTabOperation) {
        this.graph.logger?.debug?.('BOOT_CTRL_TAB_CONTENT_REQUEST', {
          tabId,
          operation: options.operation || 'switch',
          coordinated: true
        });

        await tabManager.performTabOperation(tabId, {
          operation: options.operation || 'switch',
          skipThemeChanges: options.skipThemeChanges || false
        });
      } else {
        this.graph.logger?.warn?.('BOOT_CTRL_TAB_CONTENT_REQUEST_FALLBACK', {
          tabId,
          message: 'TabManager coordination not available, operation not performed'
        });
      }
    } catch (error: unknown) {
      this.graph.logger?.error?.('BOOT_CTRL_TAB_CONTENT_REQUEST_ERROR', { error, tabId });
    }
  }

  /**
   * Wait for TabManager to initialize
   * Ensures tab state is set before message loading
   */
  private async _waitForTabManager(): Promise<void> {
    return new Promise((resolve) => {
      // Check if already initialized
      const win = typeof window !== 'undefined' ? window : null;
      if (win && 'tabContextManager' in win) {
        const tabManager = (
          win as Window & { tabContextManager?: { getActiveTab?: () => string | null } }
        ).tabContextManager;
        if (tabManager?.getActiveTab) {
          // TabManager is ready
          resolve();
          return;
        }
      }

      // Wait for initialization event (max 2 seconds)
      let resolved = false;
      // Legitimate timeout fallback for TabManager wait - not a race condition workaround
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.graph.logger?.warn?.('TAB_MANAGER_WAIT', {
            message: 'Timeout waiting for TabManager, proceeding anyway',
          });
          resolve();
        }
      }, 2000);

      const handler = (): void => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          if (typeof document !== 'undefined') {
            document.removeEventListener('tabManager:initialized', handler);
          }
          resolve();
        }
      };

      if (typeof document !== 'undefined') {
        const eventManager = createEventListenerManager();
        eventManager.once(document, 'tabManager:initialized', handler);
      } else {
        // No document, resolve immediately
        clearTimeout(timeout);
        resolve();
      }
    });
  }

  setupEventBridges(): void {
    if (this.graph.eventBus && typeof this.graph.eventBus.on === 'function') {
      this.graph.eventBus.on('avatar:colorChanged', async (payload: unknown) => {
        const typedPayload = payload as { color?: string } | null;
        if (!typedPayload?.color) {
          return;
        }
        await this.graph.stateManager.setState(
          'avatars.user.customColor',
          typedPayload.color,
          true
        );
      });
    }
  }

  async handlePendingContent(): Promise<void> {
    try {
      const messageContent = (await this.graph.stateManager.getState('pendingMessageContent')) as
        | string
        | null
        | undefined;
      const visibilityContent = (await this.graph.stateManager.getState(
        'pendingVisibilityContent'
      )) as string | null | undefined;
      if (messageContent) {
        const textarea = document.getElementById('chat-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
          textarea.value = `Commenting on: \"${messageContent}\"`;
          textarea.focus();
          const autoResize = (
            window as Window & { autoResize?: (element: HTMLTextAreaElement) => void }
          ).autoResize;
          autoResize?.(textarea);
        }
        await this.graph.stateManager.setState('pendingMessageContent', null);
        await this.graph.stateManager.setState('pendingMessageUri', null);
      }
      if (visibilityContent) {
        const showNotification = (
          window as Window & { showNotification?: (message: string) => void }
        ).showNotification;
        showNotification?.('Visibility anchoring feature coming soon!');
        await this.graph.stateManager.setState('pendingVisibilityContent', null);
        await this.graph.stateManager.setState('pendingVisibilityUri', null);
      }
    } catch (error: unknown) {
      this.graph.logger?.warn?.('PENDING_CONTENT', { error });
    }
  }

  async migrateFromChromeStorage(): Promise<void> {
    try {
      const keys = [
        'userAvatarBgColor',
        'googleUser',
        'supabaseUser',
        'metalayerUser',
        'activeCommunities',
        'primaryCommunity',
        'currentCommunity',
        'communities',
        'theme',
        'debugMode',
        'customAvatarColor',
        'pendingMessageContent',
        'pendingMessageUri',
        'pendingVisibilityContent',
        'pendingVisibilityUri',
      ];
      for (const key of keys) {
        const value = await this.graph.stateManager.getState(key);
        if (value !== undefined) {
          await this.graph.stateManager.setState(key, value);
        }
      }
    } catch (error: unknown) {
      this.graph.logger?.error?.('MIGRATION', { error });
    }
  }

  async safeInitializeTheme(): Promise<void> {
    try {
      await this.options.initializeTheme();
    } catch (error: unknown) {
      this.graph.logger?.warn?.('THEME_INIT', { error });
    }
  }

  /**
   * Get the currently active sidepanel tab
   * @returns Tab ID string or null if not found
   * @deprecated Use getActiveSidepanelTab from utils/getActiveSidepanelTab.js instead
   */
  // @ts-ignore - Unused method kept for potential future use
   
  private _getActiveSidepanelTab(): string | null {
    // Implementation kept for potential future use
    if (typeof document === 'undefined') {
      return null;
    }

    // Check tabContextManager first
    const win = typeof window !== 'undefined' ? window : null;
    const tabContextManager = (
      win as Window & { tabContextManager?: { getActiveTab?: () => string | null } }
    )?.tabContextManager;
    if (tabContextManager?.getActiveTab) {
      const activeTab = tabContextManager.getActiveTab();
      if (activeTab) {
        return activeTab;
      }
    }

    // Fallback: check DOM for active tab
    const activeTab = document.querySelector('.main-nav-tab.active');
    const tabId = activeTab?.getAttribute('data-tab');
    return tabId || null;
  }
}
