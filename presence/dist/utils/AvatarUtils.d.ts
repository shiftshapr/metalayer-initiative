/**
 * AVATAR UTILITIES - TypeScript Version
 * Centralized avatar management system
 */
import { User } from '../types/index.js';
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
     * Create unified avatar HTML
     */
    static createUnifiedAvatar(user: User, context?: string, options?: AvatarOptions): Promise<string>;
}
export { AvatarUtils };
export default AvatarUtils;
//# sourceMappingURL=AvatarUtils.d.ts.map