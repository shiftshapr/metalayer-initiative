import { getSidepanelWindow, getSettingContracts } from '../../../sidepanel/windowInjections.js';
import { Logger } from '../../../utils/Logger.js';
import { handleError } from '../../../utils/ErrorHandler.js';
const PROFILE_SETTING_CONFIG = {
    displayName: {
        preferenceKey: 'displayName',
        chromeKey: 'displayName',
        unifiedKey: 'displayName',
        windowProperty: 'displayName'
    },
    headline: {
        preferenceKey: 'headline',
        chromeKey: 'settingsHeadline',
        unifiedKey: 'headline',
        windowProperty: 'headline'
    }
};
const STORAGE_OPTIONS = { batch: false };
const LOG_SCOPE = 'profile-settings';
let helpersInitialized = false;
let helpersReady = false;
const noopChannel = {
    read: async () => {
        Logger.warn('PROFILE_SETTING_CHANNEL: Skipping read outside browser context', null, LOG_SCOPE);
        return '';
    },
    save: async () => {
        Logger.warn('PROFILE_SETTING_CHANNEL: Skipping save outside browser context', null, LOG_SCOPE);
    },
    delete: async () => {
        Logger.warn('PROFILE_SETTING_CHANNEL: Skipping delete outside browser context', null, LOG_SCOPE);
    }
};
function ensureCurrentUser(win) {
    if (!win.currentUser || typeof win.currentUser !== 'object') {
        win.currentUser = {};
    }
    return win.currentUser;
}
export function initializeProfileSettingHelpers() {
    if (helpersInitialized) {
        return helpersReady;
    }
    helpersInitialized = true;
    if (typeof window === 'undefined') {
        Logger.warn('PROFILE_SETTING_HELPERS: Initialization skipped outside browser context', null, LOG_SCOPE);
        helpersReady = false;
        return helpersReady;
    }
    Logger.debug('PROFILE_SETTING_HELPERS: Helper utilities initialized', null, LOG_SCOPE);
    helpersReady = true;
    return helpersReady;
}
export function createProfileSettingChannel(setting) {
    const helpersAvailable = initializeProfileSettingHelpers();
    if (!helpersAvailable) {
        return noopChannel;
    }
    const config = PROFILE_SETTING_CONFIG[setting];
    const windowRef = getSidepanelWindow();
    const currentUser = ensureCurrentUser(windowRef);
    const updateWindowState = (value) => {
        if (!config.windowProperty) {
            return;
        }
        currentUser[config.windowProperty] = value ?? undefined;
        if (config.windowProperty === 'displayName' && value) {
            currentUser.name = value;
        }
    };
    const read = async () => {
        try {
            const { userPreferencesManager, unifiedSettingsStorage, getSetting } = getSettingContracts();
            if (userPreferencesManager?.isInitialized) {
                const pref = await userPreferencesManager.getPreference(config.preferenceKey);
                if (typeof pref === 'string') {
                    return pref;
                }
            }
            if (unifiedSettingsStorage?.getSetting) {
                const unifiedValue = await unifiedSettingsStorage.getSetting(config.unifiedKey, null, {
                    apiKey: config.preferenceKey
                });
                if (typeof unifiedValue === 'string') {
                    return unifiedValue;
                }
            }
            if (getSetting) {
                const fallbackValue = await getSetting(config.unifiedKey, null, {
                    apiKey: config.preferenceKey
                });
                if (typeof fallbackValue === 'string') {
                    return fallbackValue;
                }
            }
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                const storage = await chrome.storage.local.get([config.chromeKey]);
                const storedValue = storage[config.chromeKey];
                if (typeof storedValue === 'string') {
                    return storedValue;
                }
            }
            return '';
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'read',
                    component: 'ProfileSettingChannel',
                    setting
                }
            });
            return '';
        }
    };
    const save = async (value) => {
        try {
            const { userPreferencesManager, saveSetting } = getSettingContracts();
            if (userPreferencesManager?.isInitialized) {
                if (value === null) {
                    await userPreferencesManager.savePreference(config.preferenceKey, '', STORAGE_OPTIONS);
                }
                else {
                    await userPreferencesManager.savePreference(config.preferenceKey, value, STORAGE_OPTIONS);
                }
                updateWindowState(value);
                return;
            }
            if (saveSetting) {
                await saveSetting(config.unifiedKey, value, { apiKey: config.preferenceKey });
                updateWindowState(value);
                return;
            }
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                if (value) {
                    await chrome.storage.local.set({ [config.chromeKey]: value });
                }
                else {
                    await chrome.storage.local.remove([config.chromeKey]);
                }
                updateWindowState(value);
                return;
            }
            Logger.warn('PROFILE_SETTING_CHANNEL: No storage provider available for', config.unifiedKey, LOG_SCOPE);
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'save',
                    component: 'ProfileSettingChannel',
                    setting
                }
            });
        }
    };
    const remove = async () => {
        try {
            await save(null);
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'remove',
                    component: 'ProfileSettingChannel',
                    setting
                }
            });
        }
    };
    const channel = {
        read,
        save,
        delete: remove
    };
    return channel;
}
export const profileSettingHelpersApi = {
    initializeProfileSettingHelpers,
    createProfileSettingChannel
};
export default profileSettingHelpersApi;
//# sourceMappingURL=profileSettingChannel.js.map