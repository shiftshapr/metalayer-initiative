# Error Handling Guide - Canopi Application

## Overview

This guide documents the standardized error handling strategy for the Canopi application. All error handling should follow these patterns for consistency, maintainability, and better debugging.

## Principles

1. **Never silently fail** - All errors must be logged
2. **Type all errors** - Use `catch (error: unknown)` and type-check
3. **Use Logger utility** - Never use `console.log/error/warn` directly
4. **Provide context** - Include operation, component, and relevant data
5. **Handle appropriately** - Log, notify user, or rethrow based on severity

## Error Types

### Base Error: CanopiError

All custom errors extend `CanopiError`:

```typescript
import { CanopiError } from '../utils/ErrorTypes.js';

throw new CanopiError('Something went wrong', 'ERROR_CODE', { context: 'data' });
```

### Specialized Error Types

- **APIError** - API request failures
- **AuthenticationError** - Auth failures
- **AuthorizationError** - Permission issues
- **StorageError** - Storage operation failures
- **NetworkError** - Network connectivity issues
- **ValidationError** - Input/data validation failures
- **ConfigurationError** - Configuration issues
- **StateError** - State management errors

## Error Handling Patterns

### Pattern 1: Basic Try-Catch with Logging

```typescript
import { Logger } from '../utils/Logger.js';
import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';

try {
  await someOperation();
} catch (error: unknown) {
  const context: ErrorContext = {
    operation: 'someOperation',
    component: 'MyComponent'
  };
  handleError(error, {
    log: true,
    context
  });
}
```

### Pattern 2: Async Function with Error Handling

```typescript
import { withErrorHandling, type ErrorContext } from '../utils/ErrorHandler.js';

async function loadData(userId: string): Promise<Data | undefined> {
  const context: ErrorContext = {
    operation: 'loadData',
    component: 'DataLoader',
    userId
  };
  
  return await handleAsyncError(
    async () => {
      const response = await api.get(`/data/${userId}`);
      return response.data;
    },
    {
      log: true,
      context,
      showUserNotification: true,
      userMessage: 'Failed to load data'
    }
  );
}
```

### Pattern 3: Error Boundary for Critical Operations

```typescript
import { errorBoundary } from '../utils/ErrorHandler.js';

async function criticalOperation(): Promise<Result> {
  return await errorBoundary(
    async () => {
      // Critical operation that must not fail silently
      return await performCriticalWork();
    },
    async (error) => {
      // Custom error handler
      Logger.error('Critical operation failed', { error });
      // Return fallback or rethrow
      throw error;
    }
  );
}
```

### Pattern 4: API Error Handling

```typescript
import { handleAPIError, type ErrorContext } from '../utils/ErrorHandler.js';

try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return await response.json();
} catch (error: unknown) {
  const context: ErrorContext = {
    operation: 'fetchData',
    component: 'APIService',
    endpoint: '/api/endpoint'
  };
  
  const apiError = handleAPIError(error, '/api/endpoint', 'GET', context);
  // Handle or rethrow as needed
  throw apiError;
}
```

### Pattern 5: Storage Error Handling

```typescript
import { handleStorageError, type ErrorContext } from '../utils/ErrorHandler.js';

try {
  await chrome.storage.local.set({ key: value });
} catch (error: unknown) {
  const context: ErrorContext = {
    operation: 'saveToStorage',
    component: 'StorageService',
    key: 'key'
  };
  
  handleStorageError(error, 'chrome.storage.local', 'key', context);
  // Storage errors are often non-critical, may not need to rethrow
}
```

### Pattern 6: Safe Async Wrapper (Never Throws)

```typescript
import { safeAsync } from '../utils/ErrorHandler.js';

const safeLoadData = safeAsync(
  async () => {
    return await loadData();
  },
  null, // Default value if error occurs
  { operation: 'loadData', component: 'DataLoader' }
);

// This will never throw, returns null on error
const data = await safeLoadData();
```

## When to Use Each Pattern

| Pattern | Use Case | Example |
|---------|----------|---------|
| Basic Try-Catch | Simple error logging | Loading user preferences |
| Async with Error Handling | Operations that can fail gracefully | Loading data, saving settings |
| Error Boundary | Critical operations | Authentication, payment processing |
| API Error Handling | All API calls | Fetching messages, updating profile |
| Storage Error Handling | Storage operations | Saving preferences, caching data |
| Safe Async Wrapper | Non-critical operations | Loading optional data, background sync |

## Error Severity Levels

- **Critical**: System-breaking errors that require immediate attention
  - Use `logLevel: 'error'`, `reportToService: true`
  - Example: Authentication failures, payment errors

- **High**: Errors that affect functionality but have fallbacks
  - Use `logLevel: 'error'`, `showUserNotification: true`
  - Example: API failures, data loading errors

- **Medium**: Errors that are logged but don't affect core functionality
  - Use `logLevel: 'warn'`
  - Example: Storage failures, optional feature errors

- **Low**: Informational errors or expected failures
  - Use `logLevel: 'info'` or `'debug'`
  - Example: Cache misses, optional API calls

## Migration Checklist

When updating existing code:

- [ ] Replace `catch (error)` with `catch (error: unknown)`
- [ ] Replace `console.log/error/warn` with `Logger` utility
- [ ] Add error context (operation, component)
- [ ] Use appropriate error type (APIError, StorageError, etc.)
- [ ] Remove silent failures (empty catch blocks)
- [ ] Add user notifications for user-facing errors
- [ ] Test error scenarios

## Anti-Patterns to Avoid

❌ **Silent Failures**
```typescript
// BAD
try {
  await operation();
} catch (error) {
  // Nothing happens
}
```

✅ **Good**
```typescript
try {
  await operation();
} catch (error: unknown) {
  handleError(error, {
    log: true,
    context: { operation: 'operation' }
  });
}
```

❌ **Untyped Errors**
```typescript
// BAD
catch (error) {
  console.log(error);
}
```

✅ **Good**
```typescript
catch (error: unknown) {
  handleError(error, {
    log: true,
    context: { operation: 'operation' }
  });
}
```

❌ **Direct Console Usage**
```typescript
// BAD
catch (error) {
  console.error('Error:', error);
}
```

✅ **Good**
```typescript
catch (error: unknown) {
  Logger.error('Operation failed', { error }, 'component');
}
```

## Examples

See the following files for reference implementations:
- `src/utils/ErrorHandler.ts` - Error handling utilities
- `src/utils/ErrorTypes.ts` - Error type definitions
- `src/features/ProfileManager.ts` - Example usage (to be updated)






