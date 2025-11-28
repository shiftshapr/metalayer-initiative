import type { ModuleGraph } from './types.js';
import type { DisplayNameManager } from '../features/DisplayNameManager.js';
import type { SettingsHeadlineManager } from '../features/SettingsHeadlineManager.js';
import type { VisibilityStorageDependencies } from '../features/visibility/services/VisibilityStorage.js';
import { Logger } from '../utils/Logger.js';
import { getActiveSidepanelTab } from '../utils/getActiveSidepanelTab.js';

export type SidepanelWindow = Window & {
  __CANOPI_MODULE_GRAPH__?: ModuleGraph;
  __CANOPI_SIDEPANEL_READY__?: boolean;
  __DISABLE_LEGACY_SIDEPANEL__?: boolean;
};

export type SettingContracts = {
  userPreferencesManager?: Window['userPreferencesManager'];
  unifiedSettingsStorage?: Window['unifiedSettingsStorage'];
  saveSetting?: Window['saveSetting'];
  getSetting?: Window['getSetting'];
};

type ManagerRegistry = {
  displayNameManager: DisplayNameManager;
  settingsHeadlineManager: SettingsHeadlineManager;
};

export function getSidepanelWindow(): SidepanelWindow {
  return window as SidepanelWindow;
}

export function getSettingContracts(): SettingContracts {
  const win = getSidepanelWindow();
  return {
    userPreferencesManager: win.userPreferencesManager,
    unifiedSettingsStorage: win.unifiedSettingsStorage,
    saveSetting: win.saveSetting,
    getSetting: win.getSetting
  };
}

export function getVisibilityStorageDependencies(): VisibilityStorageDependencies {
  const contracts = typeof window !== 'undefined' ? getSettingContracts() : {};
  return {
    userPreferencesManager: contracts.userPreferencesManager,
    unifiedSettingsStorage: contracts.unifiedSettingsStorage as VisibilityStorageDependencies['unifiedSettingsStorage'],
    saveSetting: contracts.saveSetting as VisibilityStorageDependencies['saveSetting'],
    getSetting: contracts.getSetting as VisibilityStorageDependencies['getSetting']
  };
}

export function exposeModuleGraph(graph: ModuleGraph): void {
  const win = getSidepanelWindow();
  win.__CANOPI_MODULE_GRAPH__ = graph;
  
  // ROOT CAUSE FIX: Inject getActiveSidepanelTab into window for consistent tab detection
  // This ensures loadChatHistory and other functions can reliably detect the active tab
  if (typeof window !== 'undefined') {
    (window as Window & { getActiveSidepanelTab?: () => string | null }).getActiveSidepanelTab = getActiveSidepanelTab;
  }
}

export function registerManager<K extends keyof ManagerRegistry>(key: K, instance: ManagerRegistry[K]): ManagerRegistry[K] {
  const win = getSidepanelWindow() as Record<string, unknown>;
  win[key] = instance;
  return instance;
}

export function ensureManager<K extends keyof ManagerRegistry>(key: K, factory: () => ManagerRegistry[K]): ManagerRegistry[K] {
  const win = getSidepanelWindow() as Record<string, unknown>;
  const existing = win[key] as ManagerRegistry[K] | undefined;
  if (existing) {
    return existing;
  }
  const instance = factory();
  win[key] = instance;
  return instance;
}

/**
 * Wait for UserPreferencesManager to be ready
 * Returns a promise that resolves when UserPreferencesManager is available and initialized
 * Pure promise-based solution using event listeners (no polling)
 */
export function waitForPreferencesManager(timeoutMs: number = 15000): Promise<typeof window.userPreferencesManager | null> {
  // Immediate check - if already initialized, resolve immediately
  const prefsMgr = window.userPreferencesManager;
  if (prefsMgr && prefsMgr.isInitialized) {
    return Promise.resolve(prefsMgr);
  }

  // Create timeout promise
  const timeoutPromise = new Promise<typeof window.userPreferencesManager | null>((resolve) => {
    setTimeout(() => {
      // On timeout, return whatever is available (may be null)
      const mgr = window.userPreferencesManager;
      if (mgr && mgr.isInitialized) {
        resolve(mgr);
      } else {
        Logger.warn('⚠️ waitForPreferencesManager: Timeout waiting for UserPreferencesManager initialization', null, 'general');
        resolve(null);
      }
    }, timeoutMs);
  });

  // Create event-based promise that checks isInitialized flag
  const eventPromise = new Promise<typeof window.userPreferencesManager | null>((resolve) => {
    let resolved = false;
    let eventHandler: ((e: Event) => void) | null = null;

    const checkAndResolve = (): void => {
      if (resolved) return;
      const mgr = window.userPreferencesManager;
      if (mgr && mgr.isInitialized) {
        resolved = true;
        if (eventHandler) {
          window.removeEventListener('preferenceLoaded', eventHandler);
        }
        resolve(mgr);
      }
    };

    eventHandler = (): void => {
      checkAndResolve();
    };

    // Set up event listener BEFORE checking (prevents race condition)
    window.addEventListener('preferenceLoaded', eventHandler, { once: true });

    // Check immediately after listener is set up (handles case where event already fired)
    // Use requestAnimationFrame to ensure listener is registered in current event loop
    requestAnimationFrame(() => {
      checkAndResolve();
    });
  });

  // Race between event and timeout - whichever resolves first wins
  return Promise.race([eventPromise, timeoutPromise]);
}

