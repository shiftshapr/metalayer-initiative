import type { ModuleGraph } from './types.js';
import type { DisplayNameManager } from '../features/DisplayNameManager.js';
import type { SettingsHeadlineManager } from '../features/SettingsHeadlineManager.js';
import type { VisibilityStorageDependencies } from '../features/visibility/services/VisibilityStorage.js';
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
export declare function getSidepanelWindow(): SidepanelWindow;
export declare function getSettingContracts(): SettingContracts;
export declare function getVisibilityStorageDependencies(): VisibilityStorageDependencies;
export declare function exposeModuleGraph(graph: ModuleGraph): void;
export declare function registerManager<K extends keyof ManagerRegistry>(key: K, instance: ManagerRegistry[K]): ManagerRegistry[K];
export declare function ensureManager<K extends keyof ManagerRegistry>(key: K, factory: () => ManagerRegistry[K]): ManagerRegistry[K];
/**
 * Wait for UserPreferencesManager to be ready
 * Returns a promise that resolves when UserPreferencesManager is available and initialized
 * Pure promise-based solution using event listeners (no polling)
 */
export declare function waitForPreferencesManager(timeoutMs?: number): Promise<typeof window.userPreferencesManager | null>;
export {};
//# sourceMappingURL=windowInjections.d.ts.map