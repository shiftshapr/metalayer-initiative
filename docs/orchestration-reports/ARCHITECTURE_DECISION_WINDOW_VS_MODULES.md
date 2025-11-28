# Architecture Decision: Window Globals vs ES6 Modules

**Date**: 2025-01-24  
**Decision Type**: PM/TS Architecture Review  
**Status**: ⚠️ **CONFLICT IDENTIFIED**

## Current Situation

We just added window globals for visibility components:
```javascript
legacyWindow.visibilityManager = visibilityManager;
legacyWindow.visibilityState = visibilityState;
legacyWindow.visibilityUIEvents = visibilityUIEvents;
```

**But** the Integration Guide explicitly states:
> "NO BACKWARD COMPATIBILITY - Clean break  
> Do not export window globals - use dependency injection instead"

## Analysis

### Window Globals (Current Fix)
**Pros:**
- ✅ Easy access for diagnostic scripts
- ✅ Browser console debugging
- ✅ Quick to implement

**Cons:**
- ❌ Pollutes global namespace
- ❌ Not type-safe
- ❌ Harder to track dependencies
- ❌ Goes against refactor goals
- ❌ Violates Integration Guide principles
- ❌ Not tree-shakeable

### ES6 Modules (Recommended)
**Pros:**
- ✅ Type-safe (TypeScript)
- ✅ Explicit dependencies
- ✅ Better encapsulation
- ✅ Modern best practice
- ✅ Tree-shakeable
- ✅ Aligns with refactor goals
- ✅ Matches Integration Guide

**Cons:**
- ⚠️ Diagnostic scripts need import
- ⚠️ Slightly more verbose

## Recommendation: **Hybrid Approach**

### Primary Interface: ES6 Modules
Components should be returned from `buildModuleGraph()` and accessed via module imports:

```javascript
// buildGraph.js
export async function buildModuleGraph() {
  // ... create components ...
  return {
    visibilityManager,
    visibilityState,
    visibilityUIEvents,
    // ... other modules
  };
}

// Usage in other modules
import { buildModuleGraph } from './buildGraph.js';
const { visibilityManager } = await buildModuleGraph();
```

### Diagnostic/Debugging: Conditional Window Exposure
Only expose to window in development or when explicitly needed:

```javascript
// buildGraph.js
const legacyWindow = typeof window !== 'undefined' ? window : null;
if (legacyWindow) {
  // Only expose in development or for diagnostics
  if (process.env.NODE_ENV === 'development' || window.__ENABLE_VISIBILITY_DEBUG__) {
    legacyWindow.visibilityManager = visibilityManager;
    legacyWindow.visibilityState = visibilityState;
    legacyWindow.visibilityUIEvents = visibilityUIEvents;
  }
  
  // Keep refreshVisibilityAvatars for legacy compatibility
  legacyWindow.refreshVisibilityAvatars = async (pageId) => {
    // ... existing code ...
  };
}
```

### Diagnostic Scripts: Use ES6 Modules
Update diagnostic scripts to import modules:

```javascript
// diagnose-visibility-issues.js
async function runVisibilityDiagnostic() {
  // Try ES6 module import first
  try {
    const { buildModuleGraph } = await import('../sidepanel/buildGraph.js');
    const { visibilityManager, visibilityState } = await buildModuleGraph();
    // Use imported modules
  } catch (error) {
    // Fallback to window globals if available
    if (window.visibilityManager) {
      // Use window globals
    }
  }
}
```

## Decision

**Recommended Approach**: **ES6 Modules Primary + Conditional Window Exposure**

1. **Primary Interface**: Return from `buildModuleGraph()` - use ES6 modules
2. **Diagnostic Access**: Conditional window exposure (dev mode only)
3. **Legacy Compatibility**: Keep `refreshVisibilityAvatars` wrapper (temporary)

## Implementation Plan

1. ✅ Keep ES6 module exports (already done)
2. ⏳ Make window exposure conditional (dev mode only)
3. ⏳ Update diagnostic script to use ES6 imports
4. ⏳ Document the pattern for future modules

## Alternative: Full ES6 Modules

If we want to be strict about no window globals:

1. Remove window exposure entirely
2. Update diagnostic scripts to import from `buildGraph.js`
3. Use `buildModuleGraph()` return value for all access

**Trade-off**: Diagnostic scripts become slightly more complex, but architecture is cleaner.

---

**Status**: ⚠️ **RECOMMENDATION PROVIDED**  
**Next**: Implement hybrid approach or go full ES6 modules

