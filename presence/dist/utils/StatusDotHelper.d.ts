/**
 * STATUS DOT HELPER - TypeScript Version
 *
 * Isolated helper for 4-state status dot system
 * Zero dependencies on existing code - safe to add
 */
import type { User } from '../types/index.js';
interface StatusDotOptions {
    size?: number;
    borderColor?: string;
    borderWidth?: number;
}
export declare class StatusDotHelper {
    /**
     * Get status dot color for a user based on availability
     */
    static getStatusDotColor(user: User | null): string | null;
    /**
     * Get available color (green)
     * Uses CSS variable if available, falls back to hex
     */
    static getAvailableColor(): string;
    /**
     * Get busy color (yellow)
     */
    static getBusyColor(): string;
    /**
     * Get away color (red)
     */
    static getAwayColor(): string;
    /**
     * Get offline color (gray)
     */
    static getOfflineColor(): string;
    /**
     * Generate status dot HTML
     */
    static getStatusDotHTML(user: User | null, options?: StatusDotOptions): string;
    /**
     * Check if 4-state status is enabled
     */
    static isEnabled(): boolean;
}
export default StatusDotHelper;
//# sourceMappingURL=StatusDotHelper.d.ts.map