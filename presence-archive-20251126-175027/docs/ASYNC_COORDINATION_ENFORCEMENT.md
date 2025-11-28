# Async Coordination Enforcement

## Overview

This document describes the automated enforcement mechanisms to prevent `setTimeout` delays from being used for async coordination, which is an anti-pattern that leads to race conditions and unreliable code.

## Problem

Using `setTimeout` with arbitrary delays to coordinate async operations is a common anti-pattern:

```typescript
// ❌ BAD: Race condition workaround
setTimeout(async () => {
  await this.doSomething();
}, 1000); // Arbitrary delay - what if it's not ready?
```

This approach:
- Creates race conditions
- Is unreliable (timing-dependent)
- Makes code hard to debug
- Doesn't scale with different system speeds

## Solution

We've implemented a multi-layered approach to prevent this anti-pattern:

### 1. ESLint Rule

**Location**: `.eslintrc.json`

**Rule**: `no-restricted-syntax` blocks `setTimeout` with delays >= 100ms in async contexts.

**Error Message**: Points developers to `.cursorrules` for best practices.

**Example**:
```json
{
  "selector": "CallExpression[callee.name='setTimeout'][arguments.length>=2][arguments.1.value>=100]",
  "message": "ANTI-PATTERN: setTimeout delays are race condition workarounds. Use proper async coordination..."
}
```

### 2. Pre-commit Hook

**Location**: `scripts/pre-commit-check-async-coordination.sh`

**Function**: Scans staged files for `setTimeout` patterns in async contexts.

**Behavior**:
- Blocks commits with violations (delays >= 100ms)
- Warns on suspicious patterns
- Provides guidance on alternatives

**Integration**: Automatically runs in `.git/hooks/pre-commit`

### 3. Helper Utilities

**Location**: `src/utils/AsyncCoordination.ts`

**Functions**:
- `waitForEvent()` - Wait for DOM/window events
- `waitForCondition()` - Wait for conditions to become true
- `waitForDependency()` - Wait for dependencies to be ready
- `coordinateDependencies()` - Coordinate multiple dependencies

**Example Usage**:
```typescript
// ✅ GOOD: Event-based coordination
await waitForEvent('tabManager:initialized', { timeout: 5000 });

// ✅ GOOD: Condition-based coordination
await waitForCondition(
  () => window.tabContextManager?.getActiveTab !== undefined,
  { timeout: 5000, interval: 100 }
);

// ✅ GOOD: Dependency-based coordination
await waitForDependency({
  isReady: () => getActiveCommunities().length > 0
});
```

### 4. Documentation

**Location**: `.cursorrules` (Async Coordination section)

**Content**:
- Anti-pattern examples
- Best practice examples
- When setTimeout is acceptable (animations, debouncing)
- When it's not acceptable (coordination, race conditions)

## Refactored Code

### TabController.ensureCommunitiesReady()

**Before**:
```typescript
for (let attempt = 0; attempt < maxAttempts; attempt++) {
  const activeCommunities = await this.options.graph.stateManager.getState('ui.activeCommunities');
  if (activeCommunities && activeCommunities.length > 0) {
    return;
  }
  await new Promise(resolve => setTimeout(resolve, delayMs));
}
```

**After**:
```typescript
await waitForCondition(
  () => {
    const activeCommunities = this.options.graph.stateManager.getState('ui.activeCommunities') as string[] | null;
    return activeCommunities !== null && Array.isArray(activeCommunities) && activeCommunities.length > 0;
  },
  { timeout: 1000, interval: 100 }
);
```

### MessagesModule.handleIncomingMessageUrl()

**Before**:
```typescript
setTimeout(async () => {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  if (messageElement) {
    await focusOnMessage({ id: messageId } as Message);
  }
}, 2000);
```

**After**:
```typescript
await waitForCondition(
  () => document.querySelector(`[data-message-id="${messageId}"]`) !== null,
  { timeout: 5000, interval: 200 }
);
const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
if (messageElement) {
  await focusOnMessage({ id: messageId } as Message);
}
```

### MessagesModule.attachClickHandler()

**Before**:
```typescript
if (!openModal) {
  setTimeout(attachClickHandler, 500);
  return;
}
```

**After**:
```typescript
if (!openModal) {
  await waitForCondition(
    () => {
      const modal = getWindowFunction('openMessageModal');
      const unifiedModal = getWindowFunction('unifiedMessageModal');
      return modal !== null || (unifiedModal !== null && typeof unifiedModal.open === 'function');
    },
    { timeout: 5000, interval: 200 }
  );
  attachClickHandler();
  return;
}
```

## When setTimeout IS Acceptable

These uses are legitimate and won't trigger violations:

1. **Animation delays** (UI transitions)
   ```typescript
   setTimeout(() => {
     element.style.opacity = '0';
   }, 300);
   ```

2. **Debouncing/throttling** (user input)
   ```typescript
   const timeoutId = setTimeout(() => {
     performSearch(query);
   }, 300);
   ```

3. **Polling with exponential backoff** (when no event-based alternative exists)
   ```typescript
   setTimeout(check, interval);
   ```

4. **Cleanup timeouts** (not for coordination)
   ```typescript
   setTimeout(() => unsubscribe(), timeout);
   ```

## When setTimeout IS NOT Acceptable

These patterns will be blocked:

1. ❌ Waiting for module initialization
2. ❌ Coordinating async operations
3. ❌ Fixing race conditions
4. ❌ Waiting for dependencies to be ready
5. ❌ "Ensuring X happens before Y" scenarios

## Testing

To test the pre-commit hook:

```bash
# Test the hook directly
bash presence/scripts/pre-commit-check-async-coordination.sh

# Or make a test commit with a violation
# (The hook will block it)
```

## Future Improvements

1. **IDE Integration**: ESLint extension will show violations in real-time
2. **CI/CD Integration**: Add check to GitHub Actions
3. **Code Review**: Automated PR comments for violations
4. **Metrics**: Track reduction in setTimeout usage over time

## Related Files

- `.eslintrc.json` - ESLint configuration
- `scripts/pre-commit-check-async-coordination.sh` - Pre-commit hook
- `src/utils/AsyncCoordination.ts` - Helper utilities
- `.cursorrules` - Documentation and guidelines

## Summary

This enforcement system ensures that:
1. ✅ Developers are guided to proper async patterns
2. ✅ Violations are caught before commit
3. ✅ Alternatives are readily available
4. ✅ Code quality improves over time

The combination of ESLint, pre-commit hooks, helper utilities, and documentation creates a comprehensive system to prevent async coordination anti-patterns.

