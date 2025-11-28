/**
 * BUILD MODULE GRAPH - Dependency Injection Container
 *
 * Creates and initializes all services for the sidepanel.
 * Returns a module graph with all initialized components.
 *
 * Migrated from JavaScript to TypeScript for type safety.
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { EventBus } from '../core/EventBus.js';
import { authManagerInstance } from '../features/AuthManager.js';
import { CommunitiesModule } from '../features/CommunitiesModule.js';
import { Logger } from '../utils/Logger.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import uiManagerInstance from '../features/UIManager.js';
import { MessageLoadingService } from '../services/MessageLoadingService.js';
import { loadChatHistory } from '../features/MessagesModule.js';
import { VisibilityManager, VisibilityRealtime, VisibilityStorage, VisibilityState, VisibilityUIEvents, VisibilitySettings } from '../features/visibility/index.js';
import { getVisibilityStorageDependencies } from './windowInjections.js';
/**
 * Build the module graph - creates and initializes all services
 *
 * @returns ModuleGraph with all initialized components
 */
export async function buildModuleGraph() {
    const logger = new Logger();
    const eventBus = new EventBus();
    const communitiesModule = new CommunitiesModule();
    const lifecycleManager = typeof window !== 'undefined'
        ? window.lifecycleManager ?? null
        : null;
    // Create visibility services
    // Get Supabase client - ensure service is initialized first
    await supabaseServiceInstance.initialize();
    const supabaseClient = supabaseServiceInstance.getClient();
    const visibilityRealtimeService = new VisibilityRealtime({
        on: (_event, handler) => {
            // Connect to Supabase realtime if available
            // Note: Realtime subscription will be handled by VisibilityManager
            // This is a placeholder - actual realtime setup happens in VisibilityManager.initialize()
            if (supabaseClient?.channel && typeof supabaseClient.channel === 'function') {
                const channel = supabaseClient.channel('presence');
                channel.on('presence', { event: '*' }, (payload) => {
                    const p = payload;
                    handler('presence', p.newPresences?.[0] || payload, p.oldPresences?.[0] || null);
                    // 'event' parameter is intentionally unused - handler signature requires it
                });
                // Note: channel.subscribe() is called implicitly
                channel.subscribe();
            }
        },
        getPageUsers: async (pageId) => {
            if (supabaseClient) {
                try {
                    const supabase = supabaseClient;
                    // ROOT CAUSE FIX: Two-step query approach - avoids AppUser relation syntax issues
                    // Step 1: Query user_presence (user_id/UUID is always present)
                    const { data: presenceData, error: presenceError } = await supabase
                        .from('user_presence')
                        .select('user_id, page_id, last_seen, is_active')
                        .eq('page_id', pageId)
                        .eq('is_active', true);
                    if (presenceError) {
                        logger.warn?.('VISIBILITY_REALTIME', {
                            message: 'Failed to query user_presence',
                            error: presenceError.message
                        });
                        return [];
                    }
                    if (!presenceData || presenceData.length === 0) {
                        return [];
                    }
                    // Step 2: Batch fetch AppUser data using user_ids (UUIDs are always present)
                    const presenceRecords = presenceData;
                    const userIds = presenceRecords
                        .map((r) => r.user_id)
                        .filter((id) => !!id);
                    if (userIds.length === 0) {
                        return [];
                    }
                    // Fetch AppUser data for all user_ids at once
                    const { data: appUserData, error: appUserError } = await supabase
                        .from('AppUser')
                        .select('id, email, name, handle, avatarUrl, auraColor')
                        .in('id', userIds);
                    if (appUserError) {
                        logger.warn?.('VISIBILITY_REALTIME', {
                            message: 'Failed to fetch AppUser data',
                            error: appUserError.message
                        });
                        // Continue without AppUser data - users will show as "Unknown" but at least they'll be visible
                    }
                    // Create a map of user_id -> AppUser data for quick lookup
                    const appUserRecords = (appUserData || []);
                    const appUserMap = new Map();
                    appUserRecords.forEach((u) => {
                        if (u.id) {
                            appUserMap.set(u.id, u);
                        }
                    });
                    // Combine presence data with AppUser data
                    const combinedData = presenceRecords.map((presence) => ({
                        ...presence,
                        AppUser: appUserMap.get(presence.user_id || '') || null
                    }));
                    logger.debug?.('VISIBILITY_REALTIME', {
                        queryResult: combinedData.length,
                        pageId,
                        userIdsFound: userIds.length,
                        appUsersFound: appUserMap.size
                    });
                    // Transform to VisibilityUser format
                    return combinedData.map((record) => {
                        const r = record;
                        // ROOT CAUSE FIX: user_id (UUID) is always present - use it to get email if AppUser relation failed
                        const appUser = r.AppUser;
                        const email = appUser?.email;
                        // If AppUser relation data is missing, we still have user_id (UUID)
                        // fetchUserAvatars will look up email using user_id
                        return {
                            id: r.user_id || '',
                            userId: r.user_id || '', // UUID is always present
                            email: email || '', // May be empty if relation failed - will be looked up using user_id
                            name: appUser?.name,
                            handle: appUser?.handle,
                            avatarUrl: appUser?.avatar_url,
                            auraColor: appUser?.aura_color,
                            pageId: r.page_id || pageId, // camelCase - standardized per .cursorrules
                            lastSeen: r.last_seen || undefined,
                            isActive: r.is_active || false
                        };
                    }).filter((user) => {
                        // Filter out users without email or id - they can't be displayed
                        // fetchUserAvatars will try to look up email using user_id
                        return !!(user.email || user.id);
                    });
                }
                catch (error) {
                    logger.warn?.('VISIBILITY_REALTIME', { error: error instanceof Error ? error.message : String(error) });
                    return [];
                }
            }
            return [];
        },
        getUserProfile: async (userId) => {
            // UUID ONLY - no email lookups
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                Logger.warn('⚠️ BUILD_GRAPH: getUserProfile called with invalid UUID', { userId }, 'visibility');
                return null;
            }
            if (supabaseClient) {
                try {
                    const supabase = supabaseClient;
                    // UUID ONLY - query by id only
                    const { data, error } = await supabase
                        .from('AppUser')
                        .select('id, email, name, handle, avatarUrl, auraColor')
                        .eq('id', userId)
                        .single();
                    if (error) {
                        logger.warn?.('VISIBILITY_REALTIME', {
                            message: 'Failed to fetch user profile',
                            userId: userId,
                            error: error.message
                        });
                        return null;
                    }
                    if (!data) {
                        return null;
                    }
                    // Transform to match User interface
                    const userData = data;
                    return {
                        id: userData.id,
                        email: userData.email,
                        name: userData.name,
                        handle: userData.handle,
                        avatarUrl: userData.avatar_url,
                        avatar_url: userData.avatar_url,
                        auraColor: userData.aura_color,
                        aura_color: userData.aura_color
                    };
                }
                catch (error) {
                    logger.warn?.('VISIBILITY_REALTIME', {
                        message: 'Exception fetching user profile',
                        userId: userId,
                        error: error instanceof Error ? error.message : String(error)
                    });
                    return null;
                }
            }
            return null;
        }
    });
    // Create visibility storage service with proper typing
    const storageOptions = typeof window !== 'undefined'
        ? getVisibilityStorageDependencies()
        : {};
    const visibilityStorageService = new VisibilityStorage(storageOptions);
    const visibilityState = new VisibilityState();
    // Create manager
    const visibilityManager = new VisibilityManager(visibilityRealtimeService, logger, visibilityState);
    // REFACTOR PHASE 1: Single Initialization Point
    // VisibilityManager is created here but NOT initialized
    // Initialization happens ONLY in BootController.handleUserChange()
    // This prevents race conditions and ensures single source of truth
    logger.debug?.('VISIBILITY_INIT', {
        message: 'VisibilityManager instance created - will be initialized by BootController when user is available'
    });
    // Create UI coordinator
    const visibilityUIEvents = new VisibilityUIEvents(visibilityState, visibilityStorageService);
    await visibilityUIEvents.initialize();
    // Create VisibilitySettings component for Settings tab
    const visibilitySettings = new VisibilitySettings(visibilityStorageService);
    // Initialize immediately (component will handle re-initialization if needed)
    // Settings tab will trigger ensureEventListeners() when opened
    // Create MessageLoadingService - enforces tab-aware message loading
    // This service makes it impossible to load messages on visibility tab
    // REFACTOR: Import loadChatHistory directly instead of relying on window
    // This ensures MessageLoadingService always has the function, even if window.loadChatHistory isn't set yet
    let messageLoadingService = null;
    try {
        messageLoadingService = new MessageLoadingService({
            loadChatHistory: loadChatHistory
        });
        logger.debug?.('MESSAGE_LOADING_SERVICE', {
            created: true,
            loadChatHistoryProvided: true
        });
    }
    catch (error) {
        logger.error?.('MESSAGE_LOADING_SERVICE', {
            error,
            message: 'Failed to create MessageLoadingService'
        });
    }
    // ES6 Modules only - no window globals
    // All components are returned from buildModuleGraph() for explicit dependency injection
    return {
        stateManager: stateManagerInstance,
        eventBus,
        authManager: authManagerInstance,
        visibilityManager,
        visibilityState,
        visibilityUIEvents,
        visibilitySettings,
        messageLoadingService,
        communitiesModule,
        supabaseService: supabaseServiceInstance,
        logger,
        lifecycleManager,
        uiManager: uiManagerInstance
    };
}
//# sourceMappingURL=buildGraph.js.map