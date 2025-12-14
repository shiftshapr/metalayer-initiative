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
  theme: 'light' as const,
  apiTimeout: 30000,
  maxRetryAttempts: 3
} as const;

// Configuration interface
export interface AppConfig {
  avatarFallbackColor?: string;
  theme?: 'light' | 'dark';
  apiTimeout?: number;
  maxRetryAttempts?: number;
}

// Simple config manager class (minimal implementation)
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig = { ...DEFAULT_CONFIG };

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value;
  }

  getAll(): AppConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();
