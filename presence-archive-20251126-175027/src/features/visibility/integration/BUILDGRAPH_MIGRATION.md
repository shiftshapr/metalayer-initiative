# buildGraph.js Migration Guide

**File Location**: `extension/sidepanel/buildGraph.js` (or `sidepanel/buildGraph.js`)  
**Status**: Manual update required (file in extension/ - not editable per .cursorrules)

## Quick Migration Steps

### 1. Find Old Code

Look for code like this:
```javascript
// OLD CODE - REMOVE THIS
import { VisibilityManager } from '../features/VisibilityManager.js';
const visibilityManager = new VisibilityManager(supabaseService, logger);
window.visibilityManager = visibilityManager;
```

### 2. Replace with New Code

Use the code from `buildGraphAdapter.ts` or copy from below:

```javascript
// NEW CODE - ADD THIS
import { 
  VisibilityManager,
  VisibilityRealtime,
  VisibilityStorage,
  VisibilityState,
  VisibilityUIEvents
} from '../features/visibility/index.js';

// Create services
const visibilityRealtimeService = new VisibilityRealtime({
  on: (event, handler) => {
    if (supabaseRealtimeClient?.on) {
      supabaseRealtimeClient.on(event, handler);
    }
  },
  getPageUsers: async (pageId) => {
    if (supabaseClient) {
      const { data } = await supabaseClient
        .from('presence')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_visible', true);
      return data || [];
    }
    return [];
  },
  getUserProfile: async (userEmail) => {
    if (supabaseClient) {
      const { data } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
      return data || null;
    }
    return null;
  }
});

const visibilityStorageService = new VisibilityStorage({
  userPreferencesManager: window.userPreferencesManager,
  unifiedSettingsStorage: window.unifiedSettingsStorage,
  saveSetting: window.saveSetting,
  getSetting: window.getSetting
});

const visibilityState = new VisibilityState();

// Create manager
const visibilityManager = new VisibilityManager(
  visibilityRealtimeService,
  logger,
  visibilityState
);

// Initialize
await visibilityManager.initialize(currentUserEmail);

// Create UI coordinator
const visibilityUIEvents = new VisibilityUIEvents(visibilityState, visibilityStorageService);
await visibilityUIEvents.initialize();

// DO NOT export window globals - use dependency injection
```

### 3. Remove Old Code

Remove these patterns:
- ❌ `window.visibilityManager = ...`
- ❌ `window.updateVisibleTab = ...`
- ❌ `window.currentVisibilityData = ...`
- ❌ Old VisibilityManager imports

### 4. Update Function Calls

If you have code calling:
```javascript
// OLD
window.visibilityManager.refreshVisibilityAvatars(pageId);
```

Change to:
```javascript
// NEW
await visibilityManager.refreshVisibilityAvatars(pageId);
```

### 5. Update State Access

If you have code accessing:
```javascript
// OLD
window.currentVisibilityData.active
```

Change to:
```javascript
// NEW
visibilityState.getUsers()
```

## Using the Adapter (Optional)

If you want to use the adapter helper:

```javascript
import { createVisibilityServices } from '../features/visibility/integration/buildGraphAdapter.js';

const visibility = await createVisibilityServices({
  supabaseClient,
  supabaseRealtimeClient,
  logger,
  userPreferencesManager: window.userPreferencesManager,
  unifiedSettingsStorage: window.unifiedSettingsStorage,
  saveSetting: window.saveSetting,
  getSetting: window.getSetting,
  currentUserEmail
});

await visibility.initialize();

// Use visibility.manager, visibility.state, etc.
```

## Verification Checklist

After migration, verify:

- [ ] Old imports removed
- [ ] New imports added
- [ ] Services created correctly
- [ ] Manager initialized
- [ ] UI coordinator initialized
- [ ] Window globals removed
- [ ] Function calls updated
- [ ] TypeScript compiles (if using TypeScript)
- [ ] No console errors
- [ ] Visibility tab works
- [ ] Settings work
- [ ] Modal works

## Troubleshooting

### "Cannot find module" error
- Check import path: `'../features/visibility/index.js'`
- Verify file exists: `src/features/visibility/index.ts`

### "Class not found" error
- Verify exports in `src/features/visibility/index.ts`
- Check class names: `VisibilityRealtime` (not `VisibilityRealtimeService`)

### "Window globals undefined" error
- This is expected - use dependency injection instead
- Pass dependencies to services via constructor

### "State not updating" error
- Verify `visibilityState` is passed to manager
- Check subscriptions are active
- Verify `state.setUsers()` is called

## Support

See:
- `INTEGRATION_GUIDE.md` - Full integration guide
- `QUICK_REFERENCE.md` - Quick start
- `buildGraphAdapter.ts` - Adapter code

---

**Status**: Ready for manual update  
**File**: `extension/sidepanel/buildGraph.js` or `sidepanel/buildGraph.js`


