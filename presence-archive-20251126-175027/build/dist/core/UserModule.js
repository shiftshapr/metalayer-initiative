/**
 * UserModule - User management utilities
 */
import { stateManagerInstance } from './StateManager.js';
function normalizeUser(user) {
    if (!user)
        return null;
    // Extract and normalize from Supabase user_metadata if present
    const userMetadata = user.user_metadata;
    // Boundary transform: Supabase user_metadata (snake_case) → internal camelCase fields
    const normalizedAvatarUrl = user.avatarUrl || userMetadata?.avatar_url || user.picture;
    const normalizedName = user.name || userMetadata?.full_name;
    return {
        id: user.id || user.userId || user.user_id,
        name: normalizedName || user.name,
        email: user.email,
        avatarUrl: normalizedAvatarUrl,
        handle: user.handle,
        communityId: user.communityId,
        lastSeen: user.lastSeen,
        status: user.status,
        auraColor: user.auraColor || user.aura_color,
        auraIntensity: user.auraIntensity,
        isActive: user.isActive,
        headline: user.headline,
        displayName: user.displayName || user.display_name || user.name,
        userId: user.userId || user.user_id || user.id,
        communities: user.communities,
        // Keep raw metadata for compatibility, but don't use it directly
        user_metadata: userMetadata
    };
}
export function getCurrentUser() {
    // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser) {
        return normalizeUser(currentUser);
    }
    return null;
}
export function setCurrentUser(user) {
    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
    const normalized = normalizeUser(user);
    stateManagerInstance.setState('currentUser', normalized);
}
export function isAuthenticated() {
    return getCurrentUser() !== null;
}
//# sourceMappingURL=UserModule.js.map