import type { ModuleGraph } from '../types.js';
import { waitForCondition } from '../../utils/AsyncCoordination.js';

interface NormalizedUrlData {
  pageId?: string;
  rawUrl?: string;
  normalizedUrl?: string;
  canonicalUrl?: string;
}

type VisibilityRefreshFn = (pageId?: string) => Promise<void>;

interface SidepanelController {
  initialize: () => Promise<void>;
  dispose: () => void;
}

interface RealtimeController {
  handlePageChange?: (data: NormalizedUrlData) => Promise<void>;
  [key: string]: unknown;
}

interface TabControllerOptions {
  graph: ModuleGraph;
  realtimeController: RealtimeController;
  loadChatHistory: (rawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  refreshVisibility: VisibilityRefreshFn;
  messageLoadingService?: {
    loadMessages: (pageIdOrRawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  };
}

type ChromeTabs = typeof chrome.tabs;

type TabChangeInfo = {
  status?: string;
  url?: string;
};

export class TabController implements SidepanelController {
  private readonly onUpdated = this.handleTabUpdated.bind(this);
  private readonly onActivated = this.handleTabActivated.bind(this);
  private initialized = false;

  constructor(private readonly options: TabControllerOptions) {}

  async initialize(): Promise<void> {
    if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
      this.options.graph.logger.debug('TAB_CTRL_INIT_START', { 
        hasMessageService: !!this.options.messageLoadingService,
        hasLoadChatHistory: !!this.options.loadChatHistory
      });
    }
    
    const tabsApi = this.getTabsApi();
    if (!tabsApi) {
      if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
        this.options.graph.logger.warn('TAB_CTRL_INIT', { reason: 'CHROME_TABS_UNAVAILABLE' });
      }
      return;
    }

    tabsApi.onUpdated.addListener(this.onUpdated);
    tabsApi.onActivated.addListener(this.onActivated);
    this.initialized = true;

    // CRITICAL FIX: Capture active tab IMMEDIATELY to set currentUrlData as soon as possible
    // This ensures pageId is available for message loading
    // ROOT CAUSE FIX: When sidepanel is active, find the most recent web page tab
    try {
      const activeTabs = await this.queryTabs({ active: true, currentWindow: true });
      let tabUrl: string | null = null;
      
      if (activeTabs && activeTabs.length > 0 && activeTabs[0]?.url) {
        const activeTabUrl = activeTabs[0].url;
        // If active tab is a web page (not chrome:// or chrome-extension://), use it
        if (activeTabUrl && !activeTabUrl.startsWith('chrome://') && !activeTabUrl.startsWith('chrome-extension://')) {
          tabUrl = activeTabUrl;
        } else {
          // ROOT CAUSE FIX: Active tab is sidepanel/chrome page - find the most recent web page tab
          if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
            this.options.graph.logger.debug('TAB_CTRL_INIT_FINDING_WEB_TAB', { 
              message: 'Active tab is sidepanel/chrome, finding web page tab',
              activeTabUrl: activeTabUrl?.substring(0, 50)
            });
          }
          
          // Query all tabs in current window, find the most recent web page
          const allTabs = await this.queryTabs({ currentWindow: true });
          if (allTabs && allTabs.length > 0) {
            // Find the most recent web page tab (not chrome:// or chrome-extension://)
            // Sort by lastAccessed (most recent first) and find first valid web page
            const webPageTabs = allTabs
              .filter(tab => tab.url && 
                !tab.url.startsWith('chrome://') && 
                !tab.url.startsWith('chrome-extension://') &&
                tab.lastAccessed !== undefined)
              .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
            
            if (webPageTabs.length > 0 && webPageTabs[0]) {
              tabUrl = webPageTabs[0].url || null;
              if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                this.options.graph.logger.debug('TAB_CTRL_INIT_FOUND_WEB_TAB', { 
                  tabUrl: tabUrl?.substring(0, 50),
                  tabId: webPageTabs[0]?.id
                });
              }
            }
          }
        }
      }
      
      // Set currentUrlData if we found a valid web page URL
      if (tabUrl) {
        const normalized = await this.normalizeUrl(tabUrl);
        await this.persistCurrentUrl(normalized);
        
        if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
          this.options.graph.logger.debug('TAB_CTRL_INIT_IMMEDIATE_URL', { 
            pageId: normalized.pageId,
            rawUrl: normalized.rawUrl 
          });
        }
      } else {
        if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
          this.options.graph.logger.warn('TAB_CTRL_INIT_NO_WEB_TAB', { 
            message: 'No valid web page tab found to set pageId'
          });
        }
      }
    } catch (error) {
      if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
        this.options.graph.logger.warn('TAB_CTRL_INIT_IMMEDIATE_URL_ERROR', { error });
      }
    }

    if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
      this.options.graph.logger.debug('TAB_CTRL_INIT', { message: 'Waiting for TabManager...' });
    }
    
    // BEST PRACTICE: Wait for dependencies using events/promises, not setTimeout delays
    // Wait for TabManager to be initialized before processing URLs
    await this.waitForTabManager();
    
    if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
      this.options.graph.logger.debug('TAB_CTRL_INIT', { message: 'TabManager ready, waiting for communities...' });
    }
    
    // Wait for communities to be ready (BootController should have initialized them)
    await this.ensureCommunitiesReady();
    
    if (this.options.graph?.logger && typeof this.options.graph.logger.debug === 'function') {
      this.options.graph.logger.debug('TAB_CTRL_INIT', { message: 'Communities ready, capturing active tab...' });
    }
    
    // Now safe to capture active tab and process URL (this will trigger message loading)
    await this.captureActiveTab();
    
    if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
      this.options.graph.logger.debug('TAB_CTRL_INIT_COMPLETE', { message: 'TabController initialization complete' });
    }
  }
  
  /**
   * Wait for TabManager to be initialized using event-based coordination
   * BEST PRACTICE: Use events instead of setTimeout delays
   */
  private async waitForTabManager(): Promise<void> {
    // Check if already initialized
    const win = typeof window !== 'undefined' ? window : null;
    if (win && 'tabContextManager' in win) {
      const tabManager = (win as Window & { tabContextManager?: { getActiveTab?: () => string | null } }).tabContextManager;
      if (tabManager?.getActiveTab) {
        // TabManager is ready
        if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
          this.options.graph.logger.debug('TAB_CTRL_TAB_MANAGER_READY', { immediate: true });
        }
        return;
      }
    }

    // Wait for initialization event (max 5 seconds timeout)
    return new Promise<void>((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
            this.options.graph.logger.warn('TAB_CTRL_TAB_MANAGER_TIMEOUT', { 
              message: 'Timeout waiting for TabManager, proceeding anyway' 
            });
          }
          resolve();
        }
      }, 5000);

      const handler = (): void => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          if (typeof document !== 'undefined') {
            document.removeEventListener('tabManager:initialized', handler);
          }
          if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
            this.options.graph.logger.debug('TAB_CTRL_TAB_MANAGER_READY', { fromEvent: true });
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
    });
  }

  dispose(): void {
    if (!this.initialized) return;
    const tabsApi = this.getTabsApi();
    if (!tabsApi) return;
    tabsApi.onUpdated.removeListener(this.onUpdated);
    tabsApi.onActivated.removeListener(this.onActivated);
    this.initialized = false;
  }

  private getTabsApi(): ChromeTabs | null {
    return typeof chrome !== 'undefined' && chrome.tabs ? chrome.tabs : null;
  }

  private async handleTabUpdated(_tabId: number, changeInfo: TabChangeInfo, tab: chrome.tabs.Tab): Promise<void> {
    if (changeInfo.status !== 'complete' || !tab?.url) {
      return;
    }
    await this.processUrl(tab.url);
  }

  private async handleTabActivated(): Promise<void> {
    try {
      const [tab] = await this.queryTabs({ active: true, currentWindow: true });
      if (tab?.url) {
        await this.processUrl(tab.url);
      }
    } catch (error: unknown) {
      if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
        this.options.graph.logger.warn('TAB_CTRL_ACTIVATED', { error });
      }
    }
  }

  private async captureActiveTab(): Promise<void> {
    try {
      if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
        this.options.graph.logger.debug('TAB_CTRL_CAPTURE_START', { message: 'Starting captureActiveTab' });
      }
      
      const tabsApi = this.getTabsApi();
      if (!tabsApi) {
        if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
          this.options.graph.logger.warn('TAB_CTRL_CAPTURE', { 
            message: 'chrome.tabs API not available, cannot capture tab'
          });
        }
        return;
      }
      
      if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
        this.options.graph.logger.debug('TAB_CTRL_CAPTURE', { message: 'Querying for active tab...' });
      }
      
      // Query for active tab immediately - chrome.tabs should be available if we got here
      const [activeTab] = await this.queryTabs({ active: true, currentWindow: true });
      
      let tabUrl: string | null = null;
      
      if (activeTab?.url) {
        // If active tab is a web page (not chrome:// or chrome-extension://), use it
        if (!activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('chrome-extension://')) {
          tabUrl = activeTab.url;
        } else {
          // ROOT CAUSE FIX: Active tab is sidepanel/chrome page - find the most recent web page tab
          if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
            this.options.graph.logger.debug('TAB_CTRL_CAPTURE_FINDING_WEB_TAB', { 
              message: 'Active tab is sidepanel/chrome, finding web page tab',
              activeTabUrl: activeTab.url?.substring(0, 50)
            });
          }
          
          // Query all tabs in current window, find the most recent web page
          const allTabs = await this.queryTabs({ currentWindow: true });
          if (allTabs && allTabs.length > 0) {
            // Find the most recent web page tab (not chrome:// or chrome-extension://)
            // Sort by lastAccessed (most recent first) and find first valid web page
            const webPageTabs = allTabs
              .filter(tab => tab.url && 
                !tab.url.startsWith('chrome://') && 
                !tab.url.startsWith('chrome-extension://') &&
                tab.lastAccessed !== undefined)
              .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
            
            if (webPageTabs.length > 0 && webPageTabs[0]) {
              tabUrl = webPageTabs[0].url || null;
              if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
                this.options.graph.logger.debug('TAB_CTRL_CAPTURE_FOUND_WEB_TAB', { 
                  tabUrl: tabUrl?.substring(0, 50),
                  tabId: webPageTabs[0]?.id
                });
              }
            }
          }
        }
      }
      
      if (!tabUrl) {
        if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
          this.options.graph.logger.warn('TAB_CTRL_CAPTURE', { 
            message: 'No valid web page tab found',
            activeTabId: activeTab?.id,
            activeTabUrl: activeTab?.url?.substring(0, 50)
          });
        }
        return;
      }
      
      if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
        this.options.graph.logger.debug('TAB_CTRL_CAPTURE', { 
          message: 'Processing URL', 
          url: tabUrl.substring(0, 50)
        });
      }
      
      // Process URL immediately
      await this.processUrl(tabUrl);
    } catch (error: unknown) {
      if (this.options.graph.logger && typeof this.options.graph.logger.error === 'function') {
        this.options.graph.logger.error('TAB_CTRL_CAPTURE', { 
          error, 
          message: 'Failed to capture active tab',
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }
  }

  private async processUrl(rawUrl: string): Promise<void> {
    if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
      this.options.graph.logger.debug('TAB_CTRL_PROCESS_URL', { rawUrl });
    }
    
    // ROOT CAUSE FIX: Skip chrome:// and chrome-extension:// URLs - they're not valid pages for messages
    if (rawUrl.startsWith('chrome://') || rawUrl.startsWith('chrome-extension://')) {
      if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
        this.options.graph.logger.debug('TAB_CTRL_SKIP_CHROME_URL', { rawUrl });
      }
      return;
    }
    
    const normalized = await this.normalizeUrl(rawUrl);
    await this.persistCurrentUrl(normalized);
    
    if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
      this.options.graph.logger.debug('TAB_CTRL_URL_NORMALIZED', { normalized });
    }
    
    // ROOT CAUSE FIX: Ensure communities are initialized before loading messages
    // This prevents race condition where TabController processes URL before BootController initializes communities
    await this.ensureCommunitiesReady();
    
    // ROOT CAUSE FIX: Always trigger message loading when URL is processed
    // This ensures messages load automatically on page navigation
    if (this.options.messageLoadingService) {
      // Service enforces tab checks automatically
      if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
        this.options.graph.logger.debug('TAB_CTRL_CALLING_MESSAGE_SERVICE', { 
          rawUrl: normalized.rawUrl, 
          pageId: normalized.pageId,
          serviceAvailable: !!this.options.messageLoadingService,
          hasLoadMessages: typeof this.options.messageLoadingService.loadMessages === 'function'
        });
      }
      try {
        await this.options.messageLoadingService.loadMessages(normalized.rawUrl);
        if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
          this.options.graph.logger.debug('TAB_CTRL_MESSAGE_SERVICE_CALLED', { 
            rawUrl: normalized.rawUrl,
            message: 'MessageLoadingService.loadMessages() completed'
          });
        }
      } catch (error: unknown) {
        if (this.options.graph.logger && typeof this.options.graph.logger.error === 'function') {
          this.options.graph.logger.error('TAB_CTRL_MESSAGE_LOAD_ERROR', { 
            error, 
            rawUrl: normalized.rawUrl,
            errorMessage: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
        }
      }
    } else {
      // Fallback: manual guard (for backward compatibility during migration)
      const activeSidepanelTab = this.getActiveSidepanelTab();
      if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
        this.options.graph.logger.debug('TAB_CTRL_FALLBACK_LOAD', { activeSidepanelTab, rawUrl: normalized.rawUrl });
      }
      if (activeSidepanelTab === 'discuss-tab' || activeSidepanelTab === null) {
        try {
          await this.options.loadChatHistory(normalized.rawUrl);
        } catch (error: unknown) {
          if (this.options.graph.logger && typeof this.options.graph.logger.error === 'function') {
            this.options.graph.logger.error('TAB_CTRL_FALLBACK_LOAD_ERROR', { error, rawUrl: normalized.rawUrl });
          }
        }
      }
    }
    
    if (normalized.pageId) {
      await this.options.refreshVisibility(normalized.pageId);
    }
    if (this.options.realtimeController.handlePageChange && typeof this.options.realtimeController.handlePageChange === 'function') {
      await this.options.realtimeController.handlePageChange(normalized);
    }
  }
  
  /**
   * Ensure communities are initialized before processing URLs
   * Prevents race condition where TabController processes URL before communities are ready
   * BEST PRACTICE: Uses waitForCondition instead of setTimeout delays
   */
  private async ensureCommunitiesReady(): Promise<void> {
    try {
      // Check if communities module exists and initialize if needed
      if (this.options.graph.communitiesModule && typeof this.options.graph.communitiesModule.initialize === 'function') {
        await this.options.graph.communitiesModule.initialize();
      }
      
      // Wait for active communities to be available in state (with timeout)
      // BEST PRACTICE: Use waitForCondition instead of setTimeout loop
      try {
        await waitForCondition(
          () => {
            const activeCommunities = this.options.graph.stateManager.getState('ui.activeCommunities') as string[] | null;
            return activeCommunities !== null && Array.isArray(activeCommunities) && activeCommunities.length > 0;
          },
          { timeout: 1000, interval: 100 } // 1 second timeout, check every 100ms
        );
        // Communities are ready
        if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
          this.options.graph.logger.debug('TAB_CTRL_COMMUNITIES', { message: 'Communities ready' });
        }
      } catch (timeoutError: unknown) {
        // RED-LINE: If still no communities after timeout, that's okay - communities must come from database
        if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
          this.options.graph.logger.debug('TAB_CTRL_COMMUNITIES', { message: 'No active communities found after timeout, proceeding with fallback' });
        }
      }
    } catch (error: unknown) {
      // Don't block URL processing if community check fails
      if (this.options.graph.logger && typeof this.options.graph.logger.warn === 'function') {
        this.options.graph.logger.warn('TAB_CTRL_COMMUNITIES', { error });
      }
    }
  }
  
  /**
   * Get the currently active sidepanel tab
   * @returns Tab ID string or null if not found
   * @deprecated Use getActiveSidepanelTab from utils/getActiveSidepanelTab.js instead
   */
  private getActiveSidepanelTab(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }
    
    // Check tabContextManager first
    const win = typeof window !== 'undefined' ? window : null;
    const tabContextManager = (win as Window & { tabContextManager?: { getActiveTab?: () => string | null } })?.tabContextManager;
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

  private async normalizeUrl(rawUrl: string): Promise<NormalizedUrlData> {
    try {
      const win = window as Window & { normalizeUrl?: (url: string) => Promise<{ normalizedUrl?: string; pageId?: string }> };
      if (win.normalizeUrl && typeof win.normalizeUrl === 'function') {
        const result = await win.normalizeUrl(rawUrl);
        return {
          rawUrl,
          normalizedUrl: result.normalizedUrl ?? rawUrl,
          pageId: result.pageId ?? rawUrl,
          canonicalUrl: result.normalizedUrl ?? rawUrl
        };
      }
      // Fallback if normalizeUrl not available
      return {
        rawUrl,
        normalizedUrl: rawUrl,
        pageId: rawUrl.replace(/[^a-zA-Z0-9]/g, '_')
      };
    } catch {
      return {
        rawUrl,
        normalizedUrl: rawUrl,
        pageId: rawUrl.replace(/[^a-zA-Z0-9]/g, '_')
      };
    }
  }

  private async persistCurrentUrl(urlData: NormalizedUrlData): Promise<void> {
    // Set currentUrlData in stateManager
    this.options.graph.stateManager.setState('currentUrlData', urlData);
    
    if (this.options.graph.logger && typeof this.options.graph.logger.debug === 'function') {
      this.options.graph.logger.debug('TAB_CTRL_URL_PERSISTED', { 
        pageId: urlData.pageId,
        rawUrl: urlData.rawUrl,
        normalizedUrl: urlData.normalizedUrl
      });
    }
  }

  private async queryTabs(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    const tabsApi = this.getTabsApi();
    if (!tabsApi) return [];
    return new Promise(resolve => tabsApi.query(queryInfo, resolve));
  }
}

