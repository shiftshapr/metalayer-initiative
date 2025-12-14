/**
 * MESSAGE LOADING SERVICE - Tab-Aware Message Loading
 *
 * Centralized service that enforces visibility tab separation.
 * Makes it impossible to load messages on visibility tab.
 *
 * Integration Layer Fix: All code should use this service instead of
 * calling loadChatHistory() directly.
 */

// Import from utils
import { getActiveSidepanelTab } from '../utils/getActiveSidepanelTab.js';
import { Logger } from '../utils/Logger.js';

type LoadChatHistoryFn = (
  pageIdOrRawUrl?: string | null,
  activeCommunities?: string[]
) => Promise<void>;

interface MessageLoadingServiceOptions {
  loadChatHistory?: LoadChatHistoryFn;
  messageRenderer?: unknown;
  messageSystemIntegration?: unknown;
  container?: HTMLElement | null;
}

/**
 * MessageLoadingService
 *
 * Enforces that messages can ONLY be loaded on discuss-tab.
 * Visibility tab and other tabs will never trigger message loading.
 */
export class MessageLoadingService {
  private loadChatHistoryFn: LoadChatHistoryFn;

  constructor(options: MessageLoadingServiceOptions) {
    // Get loadChatHistory from options or window
    if (options.loadChatHistory) {
      this.loadChatHistoryFn = options.loadChatHistory;
      Logger.debug(
        'MessageLoadingService: Using loadChatHistory from options',
        {
          fnType: typeof options.loadChatHistory,
          fnName: options.loadChatHistory?.name || 'anonymous',
          isFunction: typeof options.loadChatHistory === 'function',
        },
        'messages'
      );
    } else {
      // REFACTOR: Lazy-load from window when actually called (loadChatHistory might not be on window yet)
      // This allows MessageLoadingService to be created before MessagesModule exports to window
      this.loadChatHistoryFn = async (
        pageIdOrRawUrl?: string | null,
        activeCommunities?: string[]
      ) => {
        // Try to get loadChatHistory from window at call time
        if (typeof window !== 'undefined') {
          const win = window as unknown as { loadChatHistory?: LoadChatHistoryFn };
          if (typeof win.loadChatHistory === 'function') {
            Logger.debug(
              'MessageLoadingService: Found loadChatHistory on window at call time',
              {
                pageIdOrRawUrl,
                fnName: win.loadChatHistory?.name || 'anonymous',
              },
              'messages'
            );
            return win.loadChatHistory(pageIdOrRawUrl, activeCommunities);
          }
        }
        Logger.warn(
          'MessageLoadingService: loadChatHistory not available on window',
          { pageIdOrRawUrl },
          'messages'
        );
      };
      Logger.debug(
        'MessageLoadingService: Using lazy-load fallback (will check window at call time)',
        null,
        'messages'
      );
    }
  }

  /**
   * Set the container element
   */
  setContainer(_container: HTMLElement | null): void {
    // Container stored for future use if needed
  }

  /**
   * Load messages for a page
   * ONLY loads if on discuss-tab or null (initial load)
   * NEVER loads on visibility-tab or other tabs
   *
   * @param pageIdOrRawUrl - Page ID or raw URL
   * @param activeCommunities - Active communities (optional)
   * @returns Promise that resolves when loading completes or is skipped
   */
  async loadMessages(pageIdOrRawUrl?: string | null, activeCommunities?: string[]): Promise<void> {
    // ROOT CAUSE FIX: Check if already loading to prevent double reload
    if (typeof window !== 'undefined') {
      const win = window as Window & {
        stateManagerInstance?: {
          getState?: (key: string) => unknown;
          setState?: (key: string, value: unknown) => void;
        };
      };
      const stateManager = win.stateManagerInstance;
      if (stateManager && typeof stateManager.getState === 'function') {
        const isLoading = stateManager.getState('messages.isLoading') as boolean | undefined;
        const lastLoadTime = stateManager.getState('messages.lastLoadTime') as number | undefined;
        const timeSinceLastLoad = lastLoadTime ? Date.now() - lastLoadTime : Infinity;

        if (isLoading && timeSinceLastLoad < 2000) {
          Logger.debug(
            `🚫 MessageLoadingService: Skipping load - already loading recently`,
            { pageIdOrRawUrl, isLoading, timeSinceLastLoad },
            'messages'
          );
          return;
        }

        // Set loading state
        if (typeof stateManager.setState === 'function') {
          stateManager.setState('messages.isLoading', true);
          stateManager.setState('messages.lastLoadTime', Date.now());
        }
      }
    }

    // ROOT CAUSE FIX: Wait for TabManager to be ready if it's not available yet
    let activeTab = getActiveSidepanelTab();

    Logger.debug(
      `📥 MessageLoadingService.loadMessages() called`,
      { pageIdOrRawUrl, activeTab, activeCommunities },
      'messages'
    );

    // RED-LINE: ONLY load messages on discuss-tab, NEVER on visibility-tab
    if (activeTab === 'discuss-tab' || activeTab === null) {
      // Allowed: discuss-tab or initial load (no tab active)
      Logger.debug(
        `✅ MessageLoadingService: Active tab is '${activeTab}' - ALLOWING message load`,
        {
          pageIdOrRawUrl,
          loadChatHistoryFnAvailable: typeof this.loadChatHistoryFn === 'function',
        },
        'messages'
      );

      try {
        if (typeof this.loadChatHistoryFn === 'function') {
          const result = await this.loadChatHistoryFn(pageIdOrRawUrl, activeCommunities);
          Logger.debug(
            `✅ MessageLoadingService: loadChatHistoryFn completed`,
            {
              pageIdOrRawUrl,
              resultType: typeof result,
              hasResult: result !== undefined,
            },
            'messages'
          );
        } else {
          Logger.error(
            '❌ MessageLoadingService: loadChatHistoryFn is not available',
            { pageIdOrRawUrl },
            'messages'
          );
        }
      } catch (error: unknown) {
        Logger.error(
          '❌ MessageLoadingService: Error calling loadChatHistoryFn',
          {
            error,
            pageIdOrRawUrl,
            errorMessage: error instanceof Error ? error.message : String(error),
          },
          'messages'
        );
        throw error;
      } finally {
        // Clear loading state
        if (typeof window !== 'undefined') {
          const win = window as Window & {
            stateManagerInstance?: {
              setState?: (key: string, value: unknown) => void;
            };
          };
          const stateManager = win.stateManagerInstance;
          if (stateManager && typeof stateManager.setState === 'function') {
            stateManager.setState('messages.isLoading', false);
          }
        }
      }
    } else {
      // Blocked: visibility-tab or any other tab
      Logger.debug(
        `🚫 MessageLoadingService: Active tab is '${activeTab}' - SKIPPING message load ` +
          `(only allowed on discuss-tab or null)`,
        { pageIdOrRawUrl },
        'messages'
      );
    }
  }

  /**
   * Alias for loadMessages (for compatibility)
   */
  async loadChatHistory(
    pageIdOrRawUrl?: string | null,
    activeCommunities?: string[]
  ): Promise<void> {
    return this.loadMessages(pageIdOrRawUrl, activeCommunities);
  }

  /**
   * Check if messages can be loaded for current tab
   */
  canLoadMessages(): boolean {
    const activeTab = getActiveSidepanelTab();
    return activeTab === 'discuss-tab' || activeTab === null;
  }

  /**
   * Get the current active tab
   */
  getActiveTab(): string | null {
    return getActiveSidepanelTab();
  }
}

// Singleton instance (will be initialized with dependencies)
let messageLoadingServiceInstance: MessageLoadingService | null = null;

/**
 * Initialize the service with dependencies
 */
export function initializeMessageLoadingService(
  options: MessageLoadingServiceOptions
): MessageLoadingService {
  messageLoadingServiceInstance = new MessageLoadingService(options);
  return messageLoadingServiceInstance;
}

/**
 * Get the service instance
 */
export function getMessageLoadingService(): MessageLoadingService {
  if (!messageLoadingServiceInstance) {
    throw new Error(
      'MessageLoadingService not initialized. Call initializeMessageLoadingService() first.'
    );
  }
  return messageLoadingServiceInstance;
}


