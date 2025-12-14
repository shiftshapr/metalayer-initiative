/**
 * ConfigManager.ts - Configuration management utilities
 *
 * Provides configuration constants and utilities for the application.
 */
// Avatar fallback color for when no aura color is available
export const AVATAR_FALLBACK_COLOR = '#ffffff';
// Default configuration values
export const DEFAULT_CONFIG = {
    avatarFallbackColor: '#ffffff',
    theme: 'light',
    apiTimeout: 30000,
    maxRetryAttempts: 3
};
// Simple config manager class (minimal implementation)
export class ConfigManager {
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    get(key) {
        return this.config[key];
    }
    set(key, value) {
        this.config[key] = value;
    }
    getAll() {
        return { ...this.config };
    }
}
// Export singleton instance
export const configManager = ConfigManager.getInstance();
