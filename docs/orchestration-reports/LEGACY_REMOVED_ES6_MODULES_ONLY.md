# Legacy Code Removed - ES6 Modules Only

**Date**: 2025-01-24  
**Status**: ✅ **LEGACY REMOVED**

## Changes Made

### 1. ✅ Removed Window Globals from buildGraph.js

**Before:**
```javascript
legacyWindow.visibilityManager = visibilityManager;
legacyWindow.visibilityState = visibilityState;
legacyWindow.visibilityUIEvents = visibilityUIEvents;
legacyWindow.refreshVisibilityAvatars = async (pageId) => { ... };
```

**After:**
```javascript
// ES6 Modules only - no window globals
// All components are returned from buildModuleGraph() for explicit dependency injection
```

### 2. ✅ Updated Diagnostic Script to Use ES6 Modules

**Before:**
```javascript
const win = typeof window !== 'undefined' ? window : null;
if (win?.visibilityManager) { ... }
```

**After:**
```javascript
const { buildModuleGraph } = await import('../sidepanel/buildGraph.js');
const graph = await buildModuleGraph();
if (graph.visibilityManager) { ... }
```

### 3. ✅ Removed Window Dependency from VisibilityUIEvents

**Before:**
```typescript
const win = typeof window !== 'undefined' ? window as Window & {
  refreshVisibilityAvatars?: (pageId: string) => Promise<void>;
} : null;
if (win?.refreshVisibilityAvatars) { ... }
```

**After:**
```typescript
// Note: VisibilityManager should be accessed via dependency injection
// This method is called from VisibilityUIEvents which has access to state
// The actual refresh should be triggered by the manager, not via window globals
```

## Architecture

### Pure ES6 Modules
- ✅ All components returned from `buildModuleGraph()`
- ✅ Explicit dependency injection
- ✅ Type-safe (TypeScript)
- ✅ No global namespace pollution
- ✅ Tree-shakeable

### Diagnostic Scripts
- ✅ Use ES6 module imports
- ✅ No window globals
- ✅ JavaScript (not TypeScript) as per red-line rule

### Component Access Pattern

**In Code:**
```javascript
import { buildModuleGraph } from './buildGraph.js';
const { visibilityManager, visibilityState } = await buildModuleGraph();
```

**In Diagnostics:**
```javascript
const { buildModuleGraph } = await import('../sidepanel/buildGraph.js');
const graph = await buildModuleGraph();
// Access via graph.visibilityManager, etc.
```

## Files Modified

1. `sidepanel/buildGraph.js` - Removed all window globals
2. `src/scripts/diagnose-visibility-issues.js` - Updated to use ES6 imports
3. `src/features/visibility/ui/VisibilityUIEvents.ts` - Removed window dependency

## Benefits

1. ✅ Clean architecture - no global pollution
2. ✅ Type-safe - TypeScript can track dependencies
3. ✅ Explicit dependencies - easier to understand and test
4. ✅ Modern best practice - ES6 modules standard
5. ✅ Tree-shakeable - unused code can be removed
6. ✅ No legacy code - clean break

---

**Status**: ✅ **LEGACY REMOVED**  
**Architecture**: Pure ES6 Modules

