/**
 * ContextMenuConfig - Configuration for unified context menu
 * Provides Park cursor and other application-specific menu options
 */
import type { ContextMenuOption } from './UnifiedContextMenu.js';
export interface ContextMenuProvider {
    getOptions(context: Record<string, unknown>): ContextMenuOption[];
}
/**
 * Auto-detect menu type from context and return appropriate options
 * More flexible - derives options from context data rather than requiring explicit type
 */
export declare function getContextMenuOptionsFromContext(context: Record<string, unknown>): ContextMenuOption[];
/**
 * Get context menu options for message elements
 * ROOT CAUSE FIX: Hide park/unpark menu if cursor is in sidebar
 */
export declare function getMessageContextMenuOptions(context: Record<string, unknown>): ContextMenuOption[];
/**
 * Get context menu options for avatar elements
 * ROOT CAUSE FIX: Hide park/unpark menu if cursor is in sidebar
 */
export declare function getAvatarContextMenuOptions(context: Record<string, unknown>): ContextMenuOption[];
/**
 * Get context menu options for text selection
 * ROOT CAUSE FIX: Hide park/unpark menu if cursor is in sidebar
 */
export declare function getTextSelectionContextMenuOptions(context: Record<string, unknown>): ContextMenuOption[];
/**
 * Get context menu options for page/application
 * ROOT CAUSE FIX: Hide park/unpark menu if cursor is in sidebar
 */
export declare function getPageContextMenuOptions(context: Record<string, unknown>): ContextMenuOption[];
//# sourceMappingURL=ContextMenuConfig.d.ts.map