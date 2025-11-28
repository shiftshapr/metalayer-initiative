# buildGraph.js Explanation

## What is buildGraph?

`buildGraph.js` is the **dependency injection container** for the sidepanel. It's responsible for:

1. **Creating all service instances** (VisibilityManager, StateManager, etc.)
2. **Wiring dependencies** between components
3. **Initializing services** in the correct order
4. **Returning a module graph** with all initialized components

Think of it as the "factory" that builds and connects all the pieces of the application.

## Current File Structure

### ❌ **PROBLEM: No TypeScript Source**

Currently, `buildGraph.js` exists as:
- **Source**: `sidepanel/buildGraph.js` (JavaScript, hand-authored)
- **Compiled**: `dist/sidepanel/buildGraph.js` (copied from source)
- **Extension**: `extension/sidepanel/buildGraph.js` (copied from dist/)

**There is NO TypeScript source** (`src/sidepanel/buildGraph.ts` doesn't exist)

### Current Location
```
sidepanel/buildGraph.js  ← Hand-authored JavaScript (source)
  ↓ (copied during build)
dist/sidepanel/buildGraph.js
  ↓ (synced to extension)
extension/sidepanel/buildGraph.js
```

## How to Edit It (Current State)

### ⚠️ **SPECIAL CASE: Hand-Authored JavaScript**

Because there's no TypeScript source, `sidepanel/buildGraph.js` is currently:
- ✅ **Directly editable** (it's the source file)
- ⚠️ **Not in `src/`** (violates normal workflow)
- ⚠️ **Should be migrated to TypeScript**

### Current Workflow:
1. Edit `sidepanel/buildGraph.js` directly
2. Build copies it to `dist/`
3. Sync script copies it to `extension/`

## What It Does

```javascript
export async function buildModuleGraph() {
  // 1. Create core services
  const logger = new Logger();
  const eventBus = new EventBus();
  
  // 2. Create visibility services
  const visibilityRealtimeService = new VisibilityRealtime({...});
  const visibilityStorageService = new VisibilityStorage({...});
  const visibilityState = new VisibilityState();
  const visibilityManager = new VisibilityManager(...);
  
  // 3. Initialize services
  await visibilityManager.initialize(currentUserEmail);
  await visibilityUIEvents.initialize();
  
  // 4. Return module graph (dependency injection container)
  return {
    visibilityManager,
    visibilityState,
    visibilityUIEvents,
    messageLoadingService,
    // ... other services
  };
}
```

## How It's Used

```typescript
// In Sidepanel.ts
import { buildModuleGraph } from './buildGraph.js';

const graph = await buildModuleGraph();
// graph.visibilityManager
// graph.visibilityState
// graph.messageLoadingService
// etc.
```

## Migration to TypeScript (Recommended)

### ✅ **SHOULD BE**: TypeScript Source

The proper structure should be:

```
src/sidepanel/buildGraph.ts  ← TypeScript source (EDIT THIS)
  ↓ (TypeScript compilation)
dist/sidepanel/buildGraph.js
  ↓ (sync to extension)
extension/sidepanel/buildGraph.js
```

### Benefits of TypeScript:
1. ✅ Type safety for module graph
2. ✅ Better IDE support
3. ✅ Catches errors at compile time
4. ✅ Consistent with rest of codebase

## How to Edit (Current vs Recommended)

### Current (Hand-Authored JS):
```bash
# Edit directly
vim sidepanel/buildGraph.js

# Build (copies to dist/)
npx tsc

# Sync (copies to extension/)
bash scripts/sync-extension-from-dist.sh
```

### Recommended (TypeScript):
```bash
# Edit TypeScript source
vim src/sidepanel/buildGraph.ts

# Build (compiles TypeScript → dist/)
npx tsc

# Sync (copies to extension/)
bash scripts/sync-extension-from-dist.sh
```

## Summary

| Aspect | Current State | Recommended State |
|--------|--------------|-------------------|
| **File Type** | JavaScript (`.js`) | TypeScript (`.ts`) |
| **Location** | `sidepanel/buildGraph.js` | `src/sidepanel/buildGraph.ts` |
| **Editable?** | ✅ Yes (directly) | ✅ Yes (TypeScript source) |
| **Type Safety** | ❌ No | ✅ Yes |
| **Consistent?** | ❌ No (not in `src/`) | ✅ Yes (in `src/`) |

## Action Items

1. ⏳ **Migrate to TypeScript**: Create `src/sidepanel/buildGraph.ts`
2. ⏳ **Add types**: Define interface for module graph return type
3. ⏳ **Update imports**: Change `Sidepanel.ts` to import from TypeScript source
4. ⏳ **Remove old file**: Delete `sidepanel/buildGraph.js` after migration

---

**Current Status**: Hand-authored JavaScript, directly editable  
**Recommended**: Migrate to TypeScript source in `src/sidepanel/`

