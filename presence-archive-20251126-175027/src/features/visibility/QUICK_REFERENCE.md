# Visibility Module - Quick Reference

**Quick start guide for developers**

## Basic Usage

### 1. Initialize Services

```typescript
import { 
  VisibilityManager,
  VisibilityRealtime,
  VisibilityStorage,
  VisibilityState,
  VisibilityUIEvents
} from './features/visibility/index.js';

// Create services
const realtime = new VisibilityRealtime(supabaseRealtimeClient);
const storage = new VisibilityStorage({
  userPreferencesManager: window.userPreferencesManager,
  unifiedSettingsStorage: window.unifiedSettingsStorage,
  saveSetting: window.saveSetting,
  getSetting: window.getSetting
});
const state = new VisibilityState();

// Create manager
const manager = new VisibilityManager(realtime, logger, state);
await manager.initialize(currentUserEmail);

// Create UI coordinator (handles all UI components)
const uiEvents = new VisibilityUIEvents(state, storage);
await uiEvents.initialize();
```

### 2. Refresh Visibility Data

```typescript
// Get users for a page
const users = await manager.refreshVisibilityAvatars(pageId);

// State automatically updates, UI components react via subscriptions
```

### 3. Subscribe to State Changes

```typescript
const unsubscribe = state.subscribe((currentState) => {
  const users = currentState.getUsers();
  // React to changes
});

// Cleanup
unsubscribe();
```

### 4. Access Individual Components

```typescript
// VisibilityTab (user list)
const tab = new VisibilityTab(state);
await tab.initialize();

// VisibilitySettings (settings UI)
const settings = new VisibilitySettings(storage);
await settings.initialize();

// VisibilityModal (Go Visible modal)
const modal = new VisibilityModal(storage, () => {
  // Callback after going visible
});
await modal.initialize();
```

## Common Patterns

### Get Current Users

```typescript
const users = state.getUsers();
```

### Update Visibility Setting

```typescript
await storage.saveVisibility(true);
```

### Get Page ID

```typescript
import { getCurrentPageId } from './features/visibility/index.js';
const pageId = getCurrentPageId('visibility-tab');
```

### Filter Current User

```typescript
import { filterCurrentUser } from './features/visibility/index.js';
const others = filterCurrentUser(users, currentUserEmail, currentUserId);
```

## Architecture

```
VisibilityManager (Business Logic)
    ↓ uses
VisibilityRealtime + VisibilityStorage (Services)
    ↓ updates
VisibilityState (State Management)
    ↓ subscribes to
VisibilityTab, VisibilitySettings, VisibilityModal (UI Components)
    ↓ coordinated by
VisibilityUIEvents (Event Coordinator)
```

## Key Principles

1. **Dependency Injection**: All dependencies passed via constructor
2. **State Subscriptions**: UI components subscribe to state, not direct calls
3. **Service Abstractions**: Use interfaces, not concrete implementations
4. **Component Lifecycle**: Always call `cleanup()` on destruction
5. **No Window Globals**: Use dependency injection instead

## Troubleshooting

### Component Not Rendering
- Check if `initialize()` was called
- Verify state has users: `state.getUsers().length > 0`
- Check browser console for errors

### State Not Updating
- Verify subscription is active
- Check if `state.setUsers()` was called
- Ensure manager is active: `manager.isActive === true`

### Storage Not Working
- Verify dependencies passed to `VisibilityStorage` constructor
- Check browser console for storage errors
- Verify `userPreferencesManager` is initialized

## File Structure

```
visibility/
├── core/          # Business logic
│   ├── VisibilityManager.ts
│   ├── VisibilityState.ts
│   └── VisibilityTypes.ts
├── services/      # Abstractions
│   ├── VisibilityRealtime.ts
│   └── VisibilityStorage.ts
├── ui/           # Components
│   ├── VisibilityTab.ts
│   ├── VisibilitySettings.ts
│   ├── VisibilityModal.ts
│   └── VisibilityUIEvents.ts
└── utils/        # Helpers
    ├── pageIdResolver.ts
    └── visibilityHelpers.ts
```

---

**See Also**: 
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Full integration instructions
- [README.md](./README.md) - Detailed documentation
- [BUG_PREVENTION_CHECKLIST.md](./BUG_PREVENTION_CHECKLIST.md) - Common issues

