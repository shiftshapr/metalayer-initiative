# Visibility Module - Refactored Architecture

This directory contains the refactored visibility module following the architecture defined in `VISIBILITY_MODULE_REFACTOR_PLAN.md`.

## Directory Structure

```
visibility/
├── core/              # Core business logic and types
│   ├── VisibilityTypes.ts      # Type definitions
│   ├── VisibilityState.ts      # State management
│   └── VisibilityManager.ts    # Business logic (Phase 2)
├── ui/                # UI components (Phase 3)
├── services/          # Service abstractions (Phase 2)
│   ├── VisibilityRealtime.ts   # Realtime service
│   └── VisibilityStorage.ts   # Storage service
├── utils/             # Shared utility functions
│   ├── pageIdResolver.ts       # Page ID resolution
│   └── visibilityHelpers.ts   # Helper functions
└── index.ts           # Main export point
```

## Phase 1: Foundation ✅

### Completed
- ✅ Type definitions (`VisibilityTypes.ts`)
- ✅ State management (`VisibilityState.ts`)
- ✅ Page ID resolver (`pageIdResolver.ts`)
- ✅ Helper functions (`visibilityHelpers.ts`)

### Usage

```typescript
import { 
  VisibilityState, 
  visibilityStateInstance,
  resolveCurrentPageId,
  normalizeVisibilityUsers 
} from './features/visibility/index.js';

// Use state management
const state = visibilityStateInstance;
state.subscribe((currentState) => {
  console.log('Users updated:', currentState.getUsers());
});

// Resolve page ID
const { pageId, source } = resolveCurrentPageId('visibility-tab');

// Normalize users
const normalized = normalizeVisibilityUsers(rawUsers);
```

## Migration Status

### Phase 1: Foundation ✅
- [x] Type definitions
- [x] State management
- [x] Utility functions

### Phase 2: Core Logic Separation ✅
- [x] Refactor VisibilityManager (`core/VisibilityManager.ts`)
- [x] Create VisibilityStorage service (`services/VisibilityStorage.ts`)
- [x] Create VisibilityRealtime service (`services/VisibilityRealtime.ts`)

### Phase 3: UI Component Extraction ✅
- [x] Create VisibilityTab component (`ui/VisibilityTab.ts`)
- [x] Create VisibilitySettings component (`ui/VisibilitySettings.ts`)
- [x] Create VisibilityModal component (`ui/VisibilityModal.ts`)

### Phase 4: Event Handler Consolidation ✅
- [x] Create VisibilityUIEvents coordinator (`ui/VisibilityUIEvents.ts`)
- [x] Consolidate tab navigation
- [x] Integrate all UI components

### Phase 5: Integration & Cleanup ⏳
- [x] Integration guide created (`INTEGRATION_GUIDE.md`)
- [ ] Update buildGraph.js (requires manual update - file in extension/)
- [ ] Remove legacy code (after full migration)

## Migration Status

**NO BACKWARD COMPATIBILITY** - Clean break:
- ✅ Legacy files removed
- ✅ All code uses new architecture
- ✅ Direct dependency injection
- ⏳ Integration points need updating

## Testing

Unit tests should be added for:
- State management (subscription, updates)
- Page ID resolution (all sources)
- Helper functions (normalization, filtering)

## Phase 2: Core Logic Separation ✅

### Completed
- ✅ Refactored VisibilityManager (business logic only, no UI)
- ✅ VisibilityRealtime (abstracts Supabase)
- ✅ VisibilityStorage (abstracts storage layers)
- ✅ Dependency injection implemented
- ✅ Uses VisibilityState instead of window globals

### Usage (Phase 2)

```typescript
import { 
  VisibilityManager,
  VisibilityRealtime,
  VisibilityStorage,
  VisibilityState
} from './features/visibility/index.js';

// Create services
const realtime = new VisibilityRealtime(supabaseClient);
const storage = new VisibilityStorage({
  userPreferencesManager,
  unifiedSettingsStorage,
  saveSetting,
  getSetting
});
const state = new VisibilityState();

// Create manager with dependency injection
const manager = new VisibilityManager(realtime, logger, state);

// Initialize
await manager.initialize(currentUserEmail);

// Refresh visibility (returns users, UI layer handles rendering)
const users = await manager.refreshVisibilityAvatars(pageId);

// UI layer subscribes to state changes
state.subscribe((currentState) => {
  renderUsers(currentState.getUsers());
});
```

## Notes

- ✅ Dependency injection implemented (Phase 2)
- ✅ Service abstractions enable testing
- ✅ State management via VisibilityState (reactive subscriptions)
- All exports are ES6 modules (`.js` extensions in imports)

