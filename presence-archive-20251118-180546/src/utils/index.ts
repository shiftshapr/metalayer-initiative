/**
 * UTILITY MODULES - Central Exports
 * Export all utility modules from a single entry point
 */

export { AvatarUtils } from './AvatarUtils.js';
export { ErrorHandler } from './ErrorHandler.js';
export { Logger } from './Logger.js';
export * from './Fallbacks.js';
export * from './diagnostics/index.js';

// Diagnostic utilities
export { runThemeAndSettingsDiagnostic } from './THEME_AND_SETTINGS_DIAGNOSTIC.js';
export { runDiagnostic as runDefaultVsFocusDiagnostic, compareWithFocusMode, getDiagnosticState } from './DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.js';
export { runMessageLoadingDiagnostic } from './MESSAGE_LOADING_DIAGNOSTIC.js';
export { runMessageVisibilityDiagnostic } from './MESSAGE_VISIBILITY_DIAGNOSTIC.js';

