/**
 * Type declarations for VisibilitySettingsManager module
 * Used for dynamic imports to avoid @ts-ignore suppressions
 */

export interface VisibilitySettingsManager {
  isInitialized: boolean;
  ensureEventListeners(): Promise<void>;
  [key: string]: unknown;
}

export const visibilitySettingsManagerInstance: VisibilitySettingsManager;

declare const module: {
  visibilitySettingsManagerInstance?: VisibilitySettingsManager;
  default?: VisibilitySettingsManager;
  [key: string]: unknown;
};

export default VisibilitySettingsManager;


