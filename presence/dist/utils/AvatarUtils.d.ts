/**
 * AVATAR UTILITIES - TypeScript Version
 * Centralized avatar management system
 */
import type { User } from '../types/index.js';
export interface AvatarOptions {
    size?: number;
    showAura?: boolean;
    showStatus?: boolean;
    allowGenericOnDeleted?: boolean;
}
export interface AvatarData {
    avatarUrl: string | null;
    source: string;
    userName: string;
    userHandle: string;
}
declare class AvatarUtils {
    /**
     * Get avatar URL for a user
     */
    static getAvatarUrl(user: User, context?: string): Promise<AvatarData>;
    /**
     * Convert hex color to rgba with opacity
     */
    private static hexToRgba;
    /**
     * Get aura intensity from user object or preferences
     */
    private static getAuraIntensity;
    /**
     * Create unified avatar HTML
     */
    static createUnifiedAvatar(user: User, context?: string, options?: AvatarOptions): Promise<string>;
}
export { AvatarUtils };
export default AvatarUtils;
//# sourceMappingURL=AvatarUtils.d.ts.map