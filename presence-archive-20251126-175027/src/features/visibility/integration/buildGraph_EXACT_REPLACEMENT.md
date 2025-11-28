# buildGraph.js - Exact Replacement Guide

**File**: `sidepanel/buildGraph.js`  
**Status**: Manual update required

## Current Code (Lines to Replace)

### Line 8 - Import Statement
**FIND**:
```javascript
import { VisibilityManager } from '../features/VisibilityManager.js';
```

**REPLACE WITH**:
```javascript
import { 
  VisibilityManager,
  VisibilityRealtime,
  VisibilityStorage,
  VisibilityState,
  VisibilityUIEvents
} from '../features/visibility/index.js';
```

### Lines 16-19 - Manager Creation
**FIND**:
```javascript
    const visibilityManager = new VisibilityManager(supabaseServiceInstance, logger);
    const legacyWindow = typeof window !== 'undefined' ? window : null;
    if (legacyWindow) {
        legacyWindow.visibilityManager = visibilityManager;
```

**REPLACE WITH**:
```javascript
    // Create visibility services
    const visibilityRealtimeService = new VisibilityRealtime({
        on: (event, handler) => {
            if (supabaseServiceInstance?.realtime?.on) {
                supabaseServiceInstance.realtime.on(event, handler);
            }
        },
        getPageUsers: async (pageId) => {
            if (supabaseServiceInstance?.client) {
                const { data, error } = await supabaseServiceInstance.client
                    .from('presence')
                    .select('*')
                    .eq('page_id', pageId)
                    .eq('is_visible', true);
                if (error) throw error;
                return data || [];
            }
            return [];
        },
        getUserProfile: async (userEmail) => {
            if (supabaseServiceInstance?.client) {
                const { data, error } = await supabaseServiceInstance.client
                    .from('users')
                    .select('*')
                    .eq('email', userEmail)
                    .single();
                if (error) throw error;
                return data || null;
            }
            return null;
        }
    });

    const visibilityStorageService = new VisibilityStorage({
        userPreferencesManager: typeof window !== 'undefined' ? window.userPreferencesManager : undefined,
        unifiedSettingsStorage: typeof window !== 'undefined' ? window.unifiedSettingsStorage : undefined,
        saveSetting: typeof window !== 'undefined' ? window.saveSetting : undefined,
        getSetting: typeof window !== 'undefined' ? window.getSetting : undefined
    });

    const visibilityState = new VisibilityState();

    // Create manager
    const visibilityManager = new VisibilityManager(
        visibilityRealtimeService,
        logger,
        visibilityState
    );

    // Initialize manager (get current user email)
    const currentUser = await stateManagerInstance.getState('currentUser');
    const currentUserEmail = currentUser?.email || null;
    if (currentUserEmail) {
        await visibilityManager.initialize(currentUserEmail);
    }

    // Create UI coordinator
    const visibilityUIEvents = new VisibilityUIEvents(visibilityState, visibilityStorageService);
    await visibilityUIEvents.initialize();

    const legacyWindow = typeof window !== 'undefined' ? window : null;
    if (legacyWindow) {
        // NO BACKWARD COMPATIBILITY - Do not export window globals
        // Remove: legacyWindow.visibilityManager = visibilityManager;
```

### Lines 20-34 - refreshVisibilityAvatars Wrapper
**FIND**:
```javascript
        legacyWindow.refreshVisibilityAvatars = async (pageId) => {
            try {
                const currentUrlData = await stateManagerInstance.getState('currentUrlData');
                const fallbackPageId = currentUrlData?.pageId ?? null;
                const targetPageId = pageId ?? fallbackPageId;
                if (!targetPageId) {
                    logger.warn?.('VISIBILITY_REFRESH', { message: 'No pageId available for refresh' });
                    return;
                }
                await visibilityManager.refreshVisibilityAvatars(targetPageId);
            }
            catch (error) {
                logger.warn?.('VISIBILITY_REFRESH', { error });
            }
        };
```

**REPLACE WITH** (Optional - can be removed if not needed):
```javascript
        // Optional: Keep refreshVisibilityAvatars wrapper for backward compatibility during transition
        // Remove this after all code is migrated to use visibilityManager directly
        legacyWindow.refreshVisibilityAvatars = async (pageId) => {
            try {
                const currentUrlData = await stateManagerInstance.getState('currentUrlData');
                const fallbackPageId = currentUrlData?.pageId ?? null;
                const targetPageId = pageId ?? fallbackPageId;
                if (!targetPageId) {
                    logger.warn?.('VISIBILITY_REFRESH', { message: 'No pageId available for refresh' });
                    return;
                }
                await visibilityManager.refreshVisibilityAvatars(targetPageId);
            }
            catch (error) {
                logger.warn?.('VISIBILITY_REFRESH', { error });
            }
        };
```

### Line 35 - Event Dispatch
**KEEP AS IS** (no changes needed):
```javascript
        legacyWindow.dispatchEvent?.(new CustomEvent('visibility-manager-ready', { detail: { manager: visibilityManager } }));
```

## Complete Replacement (Full Function)

If you prefer to replace the entire function, here's the complete updated `buildModuleGraph` function:

```javascript
export async function buildModuleGraph() {
    const logger = new Logger();
    const eventBus = new EventBus();
    const communitiesModule = new CommunitiesModule();
    const lifecycleManager = typeof window !== 'undefined'
        ? window.lifecycleManager ?? null
        : null;

    // Create visibility services
    const visibilityRealtimeService = new VisibilityRealtime({
        on: (event, handler) => {
            if (supabaseServiceInstance?.realtime?.on) {
                supabaseServiceInstance.realtime.on(event, handler);
            }
        },
        getPageUsers: async (pageId) => {
            if (supabaseServiceInstance?.client) {
                const { data, error } = await supabaseServiceInstance.client
                    .from('presence')
                    .select('*')
                    .eq('page_id', pageId)
                    .eq('is_visible', true);
                if (error) throw error;
                return data || [];
            }
            return [];
        },
        getUserProfile: async (userEmail) => {
            if (supabaseServiceInstance?.client) {
                const { data, error } = await supabaseServiceInstance.client
                    .from('users')
                    .select('*')
                    .eq('email', userEmail)
                    .single();
                if (error) throw error;
                return data || null;
            }
            return null;
        }
    });

    const visibilityStorageService = new VisibilityStorage({
        userPreferencesManager: typeof window !== 'undefined' ? window.userPreferencesManager : undefined,
        unifiedSettingsStorage: typeof window !== 'undefined' ? window.unifiedSettingsStorage : undefined,
        saveSetting: typeof window !== 'undefined' ? window.saveSetting : undefined,
        getSetting: typeof window !== 'undefined' ? window.getSetting : undefined
    });

    const visibilityState = new VisibilityState();

    // Create manager
    const visibilityManager = new VisibilityManager(
        visibilityRealtimeService,
        logger,
        visibilityState
    );

    // Initialize manager
    const currentUser = await stateManagerInstance.getState('currentUser');
    const currentUserEmail = currentUser?.email || null;
    if (currentUserEmail) {
        await visibilityManager.initialize(currentUserEmail);
    }

    // Create UI coordinator
    const visibilityUIEvents = new VisibilityUIEvents(visibilityState, visibilityStorageService);
    await visibilityUIEvents.initialize();

    const legacyWindow = typeof window !== 'undefined' ? window : null;
    if (legacyWindow) {
        // Optional: Keep refreshVisibilityAvatars for backward compatibility
        legacyWindow.refreshVisibilityAvatars = async (pageId) => {
            try {
                const currentUrlData = await stateManagerInstance.getState('currentUrlData');
                const fallbackPageId = currentUrlData?.pageId ?? null;
                const targetPageId = pageId ?? fallbackPageId;
                if (!targetPageId) {
                    logger.warn?.('VISIBILITY_REFRESH', { message: 'No pageId available for refresh' });
                    return;
                }
                await visibilityManager.refreshVisibilityAvatars(targetPageId);
            }
            catch (error) {
                logger.warn?.('VISIBILITY_REFRESH', { error });
            }
        };
        legacyWindow.dispatchEvent?.(new CustomEvent('visibility-manager-ready', { detail: { manager: visibilityManager } }));
    }

    return {
        stateManager: stateManagerInstance,
        eventBus,
        authManager: authManagerInstance,
        visibilityManager,
        communitiesModule,
        supabaseService: supabaseServiceInstance,
        logger,
        lifecycleManager,
        uiManager: uiManagerInstance
    };
}
```

## Important Notes

1. **Function is now async**: The function needs to be `async` because initialization is async
2. **Remove window.visibilityManager**: Do not export to window (clean break)
3. **Keep refreshVisibilityAvatars**: Optional - can be removed after full migration
4. **Current User**: Get from stateManagerInstance before initializing

## Verification

After update, verify:
- [ ] Function is `async`
- [ ] All imports correct
- [ ] Manager initialized with currentUserEmail
- [ ] UI coordinator initialized
- [ ] No `window.visibilityManager` export
- [ ] TypeScript compiles (if using TypeScript)

---

**File**: `sidepanel/buildGraph.js`  
**Status**: Ready for manual update


