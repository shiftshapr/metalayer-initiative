/**
 * STATUS DOT HELPER - TypeScript Version
 *
 * Isolated helper for 4-state status dot system
 * Zero dependencies on existing code - safe to add
 */
export class StatusDotHelper {
    /**
     * Get status dot color for a user based on availability
     */
    static getStatusDotColor(user) {
        // Feature flag check - if disabled, return null (no status dot)
        if (typeof window !== 'undefined' && window.ENABLE_4STATE_STATUS === false) {
            return null;
        }
        if (!user) {
            return null;
        }
        // ROOT CAUSE FIX: Prioritize explicit availability over is_active
        // Get availability from user object (camelCase only - RED-LINE compliance)
        const availability = user.availability || user.status;
        // If availability is explicitly set, use it (even if is_active is false)
        // This allows users to set BUSY/AWAY even when active
        if (availability) {
            switch (availability) {
                case 'AVAILABLE':
                    return this.getAvailableColor();
                case 'BUSY':
                    return this.getBusyColor();
                case 'AWAY':
                    return this.getAwayColor();
                case 'OFFLINE':
                    return this.getOfflineColor();
                default:
                    // Unknown availability value, fall through to is_active check
                    break;
            }
        }
        // If no explicit availability, fall back to is_active check
        // If user is not active, show offline (gray)
        if (!user.isActive) {
            return this.getOfflineColor();
        }
        // Default to available (green) for active users without explicit availability
        return this.getAvailableColor();
    }
    /**
     * Get available color (green)
     * Uses CSS variable if available, falls back to hex
     */
    static getAvailableColor() {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const root = document.documentElement;
            const color = getComputedStyle(root).getPropertyValue('--status-available').trim();
            if (color)
                return color;
        }
        return '#22c55e'; // Green fallback
    }
    /**
     * Get busy color (yellow)
     */
    static getBusyColor() {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const root = document.documentElement;
            const color = getComputedStyle(root).getPropertyValue('--status-busy').trim();
            if (color)
                return color;
        }
        return '#eab308'; // Yellow fallback
    }
    /**
     * Get away color (red)
     */
    static getAwayColor() {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const root = document.documentElement;
            const color = getComputedStyle(root).getPropertyValue('--status-away').trim();
            if (color)
                return color;
        }
        return '#ef4444'; // Red fallback
    }
    /**
     * Get offline color (gray)
     */
    static getOfflineColor() {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const root = document.documentElement;
            const color = getComputedStyle(root).getPropertyValue('--status-offline').trim();
            if (color)
                return color;
        }
        return '#6b7280'; // Gray fallback
    }
    /**
     * Generate status dot HTML
     */
    static getStatusDotHTML(user, options = {}) {
        const color = this.getStatusDotColor(user);
        // If feature disabled or no color, return empty string
        if (!color || !user) {
            return '';
        }
        const size = options.size || 8;
        const borderColor = options.borderColor || 'white';
        const borderWidth = options.borderWidth || 2;
        // ROOT CAUSE FIX: Get availability from user object, with proper fallback
        const availability = user.availability || user.status || (user.isActive ? 'AVAILABLE' : 'OFFLINE');
        const userId = user.id || 'unknown';
        return `<div 
      class="status-dot" 
      style="position: absolute; bottom: -2px; right: -2px; width: ${size}px; height: ${size}px; border-radius: 50%; background-color: ${color}; border: ${borderWidth}px solid ${borderColor}; z-index: 3;" 
      data-availability="${availability}"
      data-user-id="${userId}"
      title="${availability}"
    ></div>`;
    }
    /**
     * Check if 4-state status is enabled
     */
    static isEnabled() {
        return typeof window !== 'undefined' && window.ENABLE_4STATE_STATUS !== false;
    }
}
// Export removed - use ES6 imports instead of window.StatusDotHelper
export default StatusDotHelper;
//# sourceMappingURL=StatusDotHelper.js.map