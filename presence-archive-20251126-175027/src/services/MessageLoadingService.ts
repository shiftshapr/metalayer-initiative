/**
 * MESSAGE LOADING SERVICE - Tab-Aware Message Loading
 * 
 * Centralized service that enforces visibility tab separation.
 * Makes it impossible to load messages on visibility tab.
 * 
 * Integration Layer Fix: All code should use this service instead of
 * calling loadChatHistory() directly.
 */

import { getActiveSidepanelTab } from '../utils/getActiveSidepanelTab.js';
import { Logger } from '../utils/Logger.js';

type LoadChatHistoryFn = (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;

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
      Logger.debug('MessageLoadingService: Using loadChatHistory from options', null, 'messages');
    } else if (typeof window !== 'undefined' && typeof (window as unknown as { loadChatHistory?: LoadChatHistoryFn }).loadChatHistory === 'function') {
      this.loadChatHistoryFn = (window as unknown as { loadChatHistory: LoadChatHistoryFn }).loadChatHistory.bind(window);
      Logger.debug('MessageLoadingService: Using loadChatHistory from window', null, 'messages');
    } else {
      // REFACTOR: Lazy-load from window when actually called (loadChatHistory might not be on window yet)
      // This allows MessageLoadingService to be created before MessagesModule exports to window
      this.loadChatHistoryFn = async (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => {
        // Try to get loadChatHistory from window at call time
        if (typeof window !== 'undefined') {
          const win = window as unknown as { loadChatHistory?: LoadChatHistoryFn };
          if (typeof win.loadChatHistory === 'function') {
            Logger.debug('MessageLoadingService: Found loadChatHistory on window at call time', { pageIdOrRawUrl }, 'messages');
            return win.loadChatHistory(pageIdOrRawUrl, activeCommunities);
          }
        }
        Logger.warn('MessageLoadingService: loadChatHistory not available on window', { pageIdOrRawUrl }, 'messages');
      };
      Logger.debug('MessageLoadingService: Using lazy-load fallback (will check window at call time)', null, 'messages');
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
  async loadMessages(
    pageIdOrRawUrl?: string | null,
    activeCommunities?: string[]
  ): Promise<void> {
    // ROOT CAUSE FIX: Wait for TabManager to be ready if it's not available yet
    // This prevents race condition where MessageLoadingService is called before TabManager initializes
    let activeTab = getActiveSidepanelTab();
    
    // If tabContextManager is not available, wait for it (max 1 second)
    if (!activeTab && typeof window !== 'undefined') {
      const win = window as Window & { tabContextManager?: { getActiveTab?: () => string | null } };
      if (!win.tabContextManager) {
        Logger.debug('📥 MessageLoadingService: TabManager not ready, waiting...', { pageIdOrRawUrl }, 'messages');
        await new Promise<void>((resolve) => {
          let resolved = false;
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              Logger.warn('⚠️ MessageLoadingService: Timeout waiting for TabManager, proceeding with null tab', null, 'messages');
              resolve();
            }
          }, 1000);
          
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
            document.addEventListener('tabManager:initialized', handler, { once: true });
          } else {
            clearTimeout(timeout);
            resolve();
          }
          
          // Check again immediately in case event already fired
          if (win.tabContextManager) {
            handler();
          }
        });
        
        activeTab = getActiveSidepanelTab();
      }
    }
    
    Logger.debug(
      `📥 MessageLoadingService.loadMessages() called`,
      { pageIdOrRawUrl, activeTab, activeCommunities },
      'messages'
    );
    
    // RED-LINE: ONLY load messages on discuss-tab, NEVER on visibility-tab
    // REFACTOR: If activeTab is null (TabManager not ready), allow loading (initial load scenario)
    if (activeTab === 'discuss-tab' || activeTab === null) {
      // Allowed: discuss-tab or initial load (no tab active)
      Logger.debug(
        `✅ MessageLoadingService: Active tab is '${activeTab}' - ALLOWING message load`,
        { pageIdOrRawUrl, loadChatHistoryFnAvailable: typeof this.loadChatHistoryFn === 'function' },
        'messages'
      );
      
      // REFACTOR: Verify loadChatHistoryFn is available before calling
      if (typeof this.loadChatHistoryFn !== 'function') {
        Logger.error(
          '❌ MessageLoadingService: loadChatHistoryFn is not a function',
          { pageIdOrRawUrl, loadChatHistoryFn: this.loadChatHistoryFn },
          'messages'
        );
        return;
      }
      
      try {
        await this.loadChatHistoryFn(pageIdOrRawUrl, activeCommunities);
        Logger.debug(
          `✅ MessageLoadingService: loadChatHistoryFn completed`,
          { pageIdOrRawUrl },
          'messages'
        );
      } catch (error: unknown) {
        Logger.error(
          '❌ MessageLoadingService: Error calling loadChatHistoryFn',
          { error, pageIdOrRawUrl },
          'messages'
        );
        throw error;
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
   * Add a message to the chat
   */
  async addMessage(_message: unknown, _container?: HTMLElement | null): Promise<void> {
    // Implementation would add message to container
    // This is a placeholder for the interface
    // Message addition logic would go here
  }

  /**
   * Check if messages can be loaded for current tab
   * 
   * @returns true if messages can be loaded, false otherwise
   */
  canLoadMessages(): boolean {
    const activeTab = getActiveSidepanelTab();
    return activeTab === 'discuss-tab' || activeTab === null;
  }

  /**
   * Get the current active tab
   * 
   * @returns Active tab ID or null
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
export function initializeMessageLoadingService(options: MessageLoadingServiceOptions): MessageLoadingService {
  messageLoadingServiceInstance = new MessageLoadingService(options);
  return messageLoadingServiceInstance;
}

/**
 * Get the service instance
 */
export function getMessageLoadingService(): MessageLoadingService {
  if (!messageLoadingServiceInstance) {
    throw new Error('MessageLoadingService not initialized. Call initializeMessageLoadingService() first.');
  }
  return messageLoadingServiceInstance;
}
