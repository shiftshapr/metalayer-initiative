# Canopi Presence Extension - Architecture Guidelines

## Overview

This document establishes architectural patterns and guidelines for the Canopi presence extension codebase.

## Core Principles

1. **Modular Design**: Each module should have a single, well-defined responsibility
2. **Dependency Injection**: Use DependencyContainer instead of window property access
3. **Type Safety**: Leverage TypeScript for type safety, avoid `any` types
4. **ES6 Modules**: Use ES6 import/export, avoid CommonJS patterns
5. **Testability**: Design for testability with dependency injection

## Module Structure

### Preferred Pattern: Class-Based Modules

```typescript
import { getDependencies } from '../core/DependencyContainer.js';
import type { MetaLayerAPI } from '../services/APIService.js';
import type { StateManager } from '../types/index.js';

export class MyModule {
  private api: MetaLayerAPI | null;
  private stateManager: StateManager;

  constructor(dependencies?: { api?: MetaLayerAPI | null; stateManager?: StateManager }) {
    if (dependencies) {
      this.api = dependencies.api ?? null;
      this.stateManager = dependencies.stateManager ?? getDependencies().stateManager;
    } else {
      const deps = getDependencies();
      this.api = deps.api;
      this.stateManager = deps.stateManager;
    }
  }

  async doSomething(): Promise<void> {
    if (!this.api) {
      throw new Error('API not available');
    }
    // Use this.api and this.stateManager
  }
}

// Singleton instance
export const myModuleInstance = new MyModule();
export default MyModule;
```

### Alternative Pattern: Function-Based Modules

For simpler modules, function-based approach is acceptable:

```typescript
import { getAPI, getStateManager } from '../core/DependencyContainer.js';

export async function doSomething(): Promise<void> {
  const api = getAPI();
  const stateManager = getStateManager();
  
  if (!api) {
    throw new Error('API not available');
  }
  // Use api and stateManager
}
```

## Dependency Injection

### Use DependencyContainer

**❌ Bad** (Direct window access):
```typescript
const api = window.api;
const state = window.stateManager.getState('key');
```

**✅ Good** (Dependency injection):
```typescript
import { getAPI, getStateManager } from '../core/DependencyContainer.js';

const api = getAPI();
const stateManager = getStateManager();
const state = stateManager.getState('key');
```

### Initialization

DependencyContainer should be initialized at application startup:

```typescript
import { initializeDependencies } from './core/DependencyContainer.js';

await initializeDependencies();
```

## State Management

### Use StateManager

**Standard Pattern**:
```typescript
import { getStateManager } from '../core/DependencyContainer.js';

const stateManager = getStateManager();
const value = stateManager.getState('key');
stateManager.setState('key', newValue);
```

**Avoid**:
- Direct window property access for state
- Multiple state management patterns in the same module
- Mixing StateManager with window.state or localStorage directly

## File Size Guidelines

- **Target**: < 1000 lines per file
- **Warning**: 1000-1500 lines (consider splitting)
- **Critical**: > 1500 lines (must split)

### Splitting Large Files

When a file exceeds 1500 lines, split into focused modules:

1. **Core Logic Module**: Main business logic
2. **UIManager Module**: UI rendering and updates
3. **StorageManager Module**: Storage operations
4. **IntegrationManager Module**: External integrations

## Message Loading

### Use MessageLoadingService

**❌ Bad** (Direct function calls):
```typescript
await loadChatHistory(pageId);
```

**✅ Good** (Use service):
```typescript
import { getMessageLoadingService } from '../services/MessageLoadingService.js';

const messageService = getMessageLoadingService();
await messageService.loadMessages(pageId);
```

## Error Handling

### Standard Pattern

```typescript
try {
  await someOperation();
} catch (error: unknown) {
  Logger.error('Operation failed', { 
    error, 
    context: 'someOperation' 
  });
  
  if (error instanceof Error) {
    throw new Error(`Operation failed: ${error.message}`);
  }
  throw new Error('Operation failed: Unknown error');
}
```

## Logging

### Use Logger Utility

**❌ Bad**:
```typescript
console.log('Debug message', data);
```

**✅ Good**:
```typescript
import { Logger } from '../utils/Logger.js';

Logger.debug('Debug message', data);  // Development only
Logger.info('Info message', data);    // Production-safe
Logger.error('Error message', data);  // Always logged
```

## Testing

### Dependency Injection for Testing

```typescript
// In tests, inject mock dependencies
const mockAPI = createMockAPI();
const mockStateManager = createMockStateManager();

const module = new MyModule({
  api: mockAPI,
  stateManager: mockStateManager
});
```

## Migration Guide

### From Window Access to Dependency Injection

1. **Identify window dependencies**:
   ```typescript
   const api = window.api;
   ```

2. **Replace with DependencyContainer**:
   ```typescript
   import { getAPI } from '../core/DependencyContainer.js';
   const api = getAPI();
   ```

3. **Update constructor/initialization**:
   ```typescript
   constructor() {
     const deps = getDependencies();
     this.api = deps.api;
   }
   ```

4. **Test thoroughly** before removing window access

## Code Review Checklist

- [ ] File size < 1500 lines
- [ ] No direct window property access
- [ ] Uses DependencyContainer
- [ ] Proper error handling
- [ ] Uses Logger instead of console.log
- [ ] Type-safe (no `any` types)
- [ ] ES6 modules (no CommonJS)
- [ ] Single responsibility
- [ ] Testable design

## Examples

See these files for reference implementations:
- `src/core/DependencyContainer.ts` - Dependency injection
- `src/core/StateManager.ts` - State management
- `src/services/MessageLoadingService.ts` - Service pattern






