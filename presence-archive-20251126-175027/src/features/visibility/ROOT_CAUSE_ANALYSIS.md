# Root Cause Analysis: Graph Access in Diagnostic Scripts

## Problem Statement

Diagnostic script cannot access `window.__CANOPI_MODULE_GRAPH__`. Fallback approaches are workarounds, not solutions.

## Root Cause Investigation

### Expected Flow (from Sidepanel.ts)
1. `buildModuleGraph()` is called (async)
2. Graph is built
3. `exposeModuleGraph(graph)` is called → sets `window.__CANOPI_MODULE_GRAPH__`
4. Controllers initialize
5. `__CANOPI_SIDEPANEL_READY__` is set to `true`

### Why Graph Might Not Be Accessible

**Root Cause 1: Timing Issue**
- Diagnostic script runs BEFORE async initialization completes
- `exposeModuleGraph()` hasn't been called yet
- **Solution**: Wait for `__CANOPI_SIDEPANEL_READY__` flag

**Root Cause 2: Initialization Error**
- Error during `buildModuleGraph()` or `exposeModuleGraph()`
- Graph never gets exposed
- **Solution**: Check for errors, don't hide them

**Root Cause 3: Script Running in Wrong Context**
- Script running before Sidepanel.ts loads
- **Solution**: Verify script runs after sidepanel initialization

## Proper Diagnostic Approach

### NO FALLBACKS - Root Cause Only

1. **Check ONE path**: `window.__CANOPI_MODULE_GRAPH__`
2. **If not found, diagnose WHY**:
   - Is `__CANOPI_SIDEPANEL_READY__` set?
   - Are there initialization errors?
   - Has Sidepanel.ts loaded?
3. **Fail clearly** if graph isn't accessible - don't hide the problem

## Implementation

Diagnostic script should:
- Wait for `__CANOPI_SIDEPANEL_READY__` if graph not found
- Check for initialization errors
- Report root cause, not try workarounds

