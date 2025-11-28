# Window Usage Analysis - Best Practices Review

## Current State

### ❌ Anti-Patterns Found

#### 1. SettingsModule - Global Dependency Lookup
```javascript
// Current (NOT best practice):
getUserPreferencesManager() {
    return window.userPreferencesManager || null;
}
```

**Problem**: Direct window access for dependencies creates:
- Tight coupling
- Hard to test
- No dependency guarantees
- Runtime errors if dependency missing

#### 2. VisibilityModule - Global Dependency Lookup
```javascript
// Current (NOT best practice):
getVisibilityManager() {
    const graph = window.graph;
    if (graph?.visibilityManager) {
        return graph.visibilityManager;
    }
    if (window.visibilityManager) {
        return window.visibilityManager;
    }
}
```

**Problem**: Same issues as above

#### 3. MessagesModule - getWindowFunction() Helper
```javascript
// Current (NOT best practice):
const getWindowFunction = (name) => {
    if (typeof window === 'undefined') return undefined;
    return window[name];
};

// Usage:
const addMessageFn = getWindowFunction('addMessageToChat');
const showNotification = getWindowFunction('showNotification');
```

**Problem**: 
- String-based dependency lookup
- No type safety
- Runtime failures
- Hard to track dependencies

## Best Practices

### ✅ Recommended: Dependency Injection

#### SettingsModule Should Be:
```javascript
export class SettingsModule {
    constructor(dependencies = {}) {
        this.userPreferencesManager = dependencies.userPreferencesManager;
        this.visibilitySettingsManager = dependencies.visibilitySettingsManager;
        this.notificationManager = dependencies.notificationManager;
    }
    
    // No window access needed
}
```

#### VisibilityModule Should Be:
```javascript
export class VisibilityModule {
    constructor(dependencies = {}) {
        this.visibilityManager = dependencies.visibilityManager;
    }
    
    // No window access needed
}
```

#### MessagesModule Should Be:
```javascript
// Use ES6 imports or dependency injection
import { showNotification } from '../utils/NotificationService.js';
import { CommunitiesModule } from './CommunitiesModule.js';

// Or via constructor:
constructor(dependencies = {}) {
    this.showNotification = dependencies.showNotification;
    this.communitiesModule = dependencies.communitiesModule;
}
```

### ✅ Recommended: ES6 Imports

Instead of:
```javascript
const supabase = window.supabase;
```

Use:
```javascript
import { supabaseClient } from '../services/SupabaseService.js';
```

### ✅ Recommended: Service Locator Pattern (if needed)

If you need dynamic lookup, use a proper service locator:
```javascript
// ServiceLocator.js
class ServiceLocator {
    constructor() {
        this.services = new Map();
    }
    
    register(name, service) {
        this.services.set(name, service);
    }
    
    get(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not registered`);
        }
        return service;
    }
}

export const serviceLocator = new ServiceLocator();
```

## Current Window Usage Categories

### ✅ Acceptable Window Usage
1. **Browser APIs**: `window.location`, `window.document`, `window.innerWidth`
2. **Module Exports**: Exporting to window for integration (temporary)
3. **Global State**: `window.currentUser` (if no better alternative)

### ❌ Unacceptable Window Usage
1. **Dependency Lookup**: `window.userPreferencesManager`
2. **String-based Function Lookup**: `getWindowFunction('showNotification')`
3. **Module Dependencies**: `window.graph`, `window.visibilityManager`

## Recommendations

### Priority 1: High Impact
1. **SettingsModule**: Use dependency injection for managers
2. **VisibilityModule**: Use dependency injection for VisibilityManager
3. **MessagesModule**: Replace `getWindowFunction()` with imports or DI

### Priority 2: Medium Impact
1. Replace `window.supabase` with proper import
2. Replace `window.api` with proper import
3. Use service locator pattern if dynamic lookup needed

### Priority 3: Low Impact
1. Keep window exports for integration (temporary)
2. Document why window access is needed where it remains

## Migration Strategy

### Phase 1: Dependency Injection
```javascript
// Before:
class SettingsModule {
    getUserPreferencesManager() {
        return window.userPreferencesManager;
    }
}

// After:
class SettingsModule {
    constructor({ userPreferencesManager }) {
        this.userPreferencesManager = userPreferencesManager;
    }
}
```

### Phase 2: ES6 Imports
```javascript
// Before:
const supabase = window.supabase;

// After:
import { supabaseClient } from '../services/SupabaseService.js';
```

### Phase 3: Service Locator (if needed)
```javascript
// Before:
const showNotification = getWindowFunction('showNotification');

// After:
import { serviceLocator } from '../core/ServiceLocator.js';
const showNotification = serviceLocator.get('showNotification');
```

## Conclusion

**Current State**: ❌ **NOT best practice**

The window usage for dependencies is an anti-pattern that should be refactored to:
1. Dependency injection (preferred)
2. ES6 imports (preferred)
3. Service locator (if dynamic lookup needed)

**However**: For browser testing, the current code will work. The refactoring can be done incrementally.

