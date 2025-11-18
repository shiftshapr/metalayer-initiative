import UrlNormalization from '../../utils/UrlNormalization.js';
import type { ModuleGraph, NormalizedUrlData, SidepanelController, VisibilityRefreshFn } from '../types.js';
import type { RealtimeController } from './RealtimeController.js';

interface TabControllerOptions {
  graph: ModuleGraph;
  realtimeController: RealtimeController;
  loadChatHistory: (rawUrl?: string | null, activeCommunities?: string[]) => Promise<void>;
  refreshVisibility: VisibilityRefreshFn;
}

type ChromeTabs = typeof chrome.tabs;

type TabChangeInfo = {
  status?: string;
  url?: string;
};

const normalizer = new UrlNormalization();

export class TabController implements SidepanelController {
  private readonly onUpdated = this.handleTabUpdated.bind(this);
  private readonly onActivated = this.handleTabActivated.bind(this);
  private initialized = false;

  constructor(private readonly options: TabControllerOptions) {}

  async initialize(): Promise<void> {
    const tabsApi = this.getTabsApi();
    if (!tabsApi) {
      this.options.graph.logger.warn?.('TAB_CTRL_INIT', { reason: 'CHROME_TABS_UNAVAILABLE' });
      return;
    }

    tabsApi.onUpdated.addListener(this.onUpdated);
    tabsApi.onActivated.addListener(this.onActivated);
    this.initialized = true;

    await this.captureActiveTab();
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

  private async handleTabUpdated(tabId: number, changeInfo: TabChangeInfo, tab: chrome.tabs.Tab): Promise<void> {
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
    } catch (error) {
      this.options.graph.logger.warn?.('TAB_CTRL_ACTIVATED', { error });
    }
  }

  private async captureActiveTab(): Promise<void> {
    try {
      const [tab] = await this.queryTabs({ active: true, currentWindow: true });
      if (tab?.url) {
        await this.processUrl(tab.url);
      }
    } catch (error) {
      this.options.graph.logger.warn?.('TAB_CTRL_CAPTURE', { error });
    }
  }

  private async processUrl(rawUrl: string): Promise<void> {
    const normalized = this.normalizeUrl(rawUrl);
    await this.persistCurrentUrl(normalized);
    await this.options.loadChatHistory(normalized.rawUrl);
    await this.options.refreshVisibility(normalized.pageId);
    await this.options.realtimeController.handlePageChange(normalized);
  }

  private normalizeUrl(rawUrl: string): NormalizedUrlData {
    try {
      const result = normalizer.normalizeUrl(rawUrl);
      return {
        rawUrl,
        normalizedUrl: result.normalizedUrl ?? rawUrl,
        pageId: result.pageId ?? rawUrl,
        canonicalUrl: result.normalizedUrl ?? rawUrl
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
    await this.options.graph.stateManager.setState('currentUrlData', urlData);
    if (typeof window !== 'undefined') {
      (window as any).currentUrlData = urlData;
    }
  }

  private async queryTabs(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    const tabsApi = this.getTabsApi();
    if (!tabsApi) return [];
    return new Promise(resolve => tabsApi.query(queryInfo, resolve));
  }
}

