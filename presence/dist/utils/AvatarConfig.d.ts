/**
 * AVATAR CONFIG - TypeScript Version
 * Unified avatar display function - SAME implementation for ALL contexts
 * This function creates identical visual appearance regardless of context
 */
import type { User } from '../types/index.js';
type AvatarSize = 'small' | 'medium' | 'large';
type AvatarContext = 'default' | 'message' | 'profile' | 'visibility' | 'notification';
interface AvatarOptions {
    context?: AvatarContext;
    showAura?: boolean;
    size?: AvatarSize;
    clickable?: boolean;
    showName?: boolean;
    namePosition?: 'below' | 'above' | 'right' | 'left';
}
/**
 * Create unified avatar HTML
 */
export declare function createUnifiedAvatar(user: User | null, options?: AvatarOptions): string;
/**
 * Get user initial from name or email
 */
export declare function getUserInitial(name: string): string;
/**
 * Handle avatar click events
 */
export declare function handleAvatarClick(event: Event): void;
declare const _default: {
    createUnifiedAvatar: typeof createUnifiedAvatar;
    getUserInitial: typeof getUserInitial;
    handleAvatarClick: typeof handleAvatarClick;
};
export default _default;
//# sourceMappingURL=AvatarConfig.d.ts.map