# Visibility Module Integration Guide

**Phase 5: Integration & Cleanup**

## New Architecture Overview

The visibility module has been refactored into a clean, modular architecture:

```
src/features/visibility/
├── core/
│   ├── VisibilityTypes.ts      # Type definitions
│   ├── VisibilityState.ts       # State management
│   └── VisibilityManager.ts    # Business logic
├── services/
│   ├── VisibilityRealtime.ts   # Realtime service
│   └── VisibilityStorage.ts    # Storage service
├── ui/
│   ├── VisibilityTab.ts        # Tab component
│   ├── VisibilitySettings.ts   # Settings component
│   ├── VisibilityModal.ts       # Modal component
│   └── VisibilityUIEvents.ts   # Event coordinator
└── utils/
    ├── pageIdResolver.ts       # Page ID resolution
    └── visibilityHelpers.ts     # Helper functions
```

## Integration Steps

### 1. Update buildGraph.js

**Location**: `sidepanel/buildGraph.js` (or `extension/sidepanel/buildGraph.js`)

**Changes Needed**:

```javascript
// OLD (legacy):
import { VisibilityManager } from '../features/VisibilityManager.js';
const visibilityManager = new VisibilityManager(supabaseService, logger);
window.visibilityManager = visibilityManager;

// NEW (refactored):
import { 
  VisibilityManager,
  VisibilityRealtime,
  VisibilityStorage,
  VisibilityState,
  VisibilityUIEvents
} from '../features/visibility/index.js';

// Create services
const realtimeService = new VisibilityRealtime(supabaseRealtimeClient);
const storageService = new VisibilityStorage({
  userPreferencesManager: window.userPreferencesManager,
  unifiedSettingsStorage: window.unifiedSettingsStorage,
  saveSetting: window.saveSetting,
  getSetting: window.getSetting
});
const state = new VisibilityState();

// Create manager
const visibilityManager = new VisibilityManager(realtimeService, logger, state);
await visibilityManager.initialize(currentUserEmail);

// Create UI coordinator
const uiEvents = new VisibilityUIEvents(state, storageService);
await uiEvents.initialize();

// NO BACKWARD COMPATIBILITY - Clean break
// Do not export window globals - use dependency injection instead
```

### 3. Update Component Initialization

**Old Pattern**:
```javascript
// Legacy - multiple initializations
visibilityTabHandler.initialize();
visibilityUIModule.initialize();
visibilityModalHandler.initialize();
visibilitySettingsManager.initialize();
```

**New Pattern**:
```javascript
// New - single coordinator
const uiEvents = new VisibilityUIEvents(state, storageService);
await uiEvents.initialize();
```

### 4. Migration Checklist

- [ ] Update buildGraph.js to use new architecture
- [ ] Replace window.visibilityManager usage with dependency injection
- [ ] Replace window.currentVisibilityData with VisibilityState subscriptions
- [ ] Update diagnostic scripts to use new API
- [ ] Update global.d.ts type definitions
- [ ] Test all visibility features
- ✅ Legacy files removed (2,973 lines deleted)

## API Changes

### VisibilityManager

**Before**:
```typescript
const manager = new VisibilityManager(supabaseService, logger);
await manager.refreshVisibilityAvatars(pageId); // Updates UI directly
```

**After**:
```typescript
const manager = new VisibilityManager(realtimeService, logger, state);
const users = await manager.refreshVisibilityAvatars(pageId); // Returns users, UI subscribes to state
```

### State Management

**Before**:
```typescript
window.currentVisibilityData = { active: users };
```

**After**:
```typescript
state.setUsers(users); // UI components subscribe to state changes
```

### UI Components

**Before** (REMOVED):
```typescript
updateVisibleTab(users); // Global function - NO LONGER EXISTS
```

**After**:
```typescript
const visibilityTab = new VisibilityTab(state);
await visibilityTab.initialize(); // Subscribes to state automatically

// Or use VisibilityUIEvents coordinator:
const uiEvents = new VisibilityUIEvents(state, storageService);
await uiEvents.initialize(); // Initializes all UI components
```

## Migration Strategy

**NO BACKWARD COMPATIBILITY** - Clean break approach:
- Legacy files have been removed
- All code must use new architecture
- No window globals for compatibility
- Direct dependency injection required

## Testing

After integration:
1. Test visibility tab rendering
2. Test search functionality
3. Test Go Invisible button
4. Test settings persistence
5. Test modal display
6. Test tab navigation
7. Test state subscriptions

## Migration Notes

**Important**: This is a clean break - no backward compatibility:
- Legacy files removed
- All imports must be updated
- No window globals for compatibility
- Direct integration required

---

**Status**: Ready for integration  
**Next**: Update buildGraph.js and test

