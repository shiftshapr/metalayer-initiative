# Dependency Injection & ES6 Imports Refactoring Plan

## Executive Summary

This plan outlines the refactoring of SettingsModule, VisibilityModule, and MessagesModule to replace window-based dependency lookup with proper dependency injection and ES6 imports.

**Goal**: Eliminate anti-patterns, improve testability, and create a more maintainable architecture.

**Timeline**: 2-3 weeks (incremental, low-risk approach)

---

## Current State Analysis

### SettingsModule Dependencies (via window)
1. `window.userPreferencesManager` - User preferences data
2. `window.visibilitySettingsManagerInstance` - Visibility settings UI
3. `window.notificationManager` - Notification settings
4. `window.currentUser` - Current user data

### VisibilityModule Dependencies (via window)
1. `window.graph.visibilityManager` - Modern architecture
2. `window.visibilityManager` - Legacy fallback
3. `window.currentVisibilityData` - Visibility data state

### MessagesModule Dependencies (via window/getWindowFunction)
1. `window.supabase` - Supabase client
2. `window.api` - API client
3. `window.showNotification` - Notification function
4. `window.CommunitiesModule` - Communities module
5. `window.addMessageToChat` - Message function (circular?)
6. `window.createUnifiedMessageElement` - Message rendering
7. `window.addMessageActionListeners` - Event listeners
8. `window.loadMessageReactions` - Reaction loading
9. `window.robustIntegration` - Integration service
10. `window.XIcons` - Icon library
11. `window.AvatarUtils` - Avatar utilities
12. `window.uiManager` - UI manager
13. `window.handleMessageFocus` - Focus handler
14. `window.focusedMessage` - Focused message state
15. Browser APIs: `window.location`, `window.document`, `window.innerWidth`, etc.

---

## Refactoring Strategy

### Phase 1: Create Service Interfaces (Week 1, Days 1-2)

**Goal**: Define clear interfaces for all dependencies

#### 1.1 Create Dependency Interfaces

```javascript
// features/interfaces/ISettingsDependencies.js
export interface ISettingsDependencies {
    userPreferencesManager: IUserPreferencesManager;
    visibilitySettingsManager: IVisibilitySettingsManager;
    notificationManager: INotificationManager;
    currentUser: IUser | null;
}

// features/interfaces/IVisibilityDependencies.js
export interface IVisibilityDependencies {
    visibilityManager: IVisibilityManager;
    stateManager: IStateManager;
}

// features/interfaces/IMessageDependencies.js
export interface IMessageDependencies {
    supabase: ISupabaseClient;
    api: IAPIClient;
    notificationService: INotificationService;
    communitiesModule: ICommunitiesModule;
    messageRenderer: IMessageRenderer;
    avatarUtils: IAvatarUtils;
    uiManager: IUIManager;
    // ... other dependencies
}
```

#### 1.2 Create Service Locator (Optional)

```javascript
// core/ServiceLocator.js
class ServiceLocator {
    constructor() {
        this.services = new Map();
    }
    
    register(name, service) {
        this.services.set(name, service);
        return this;
    }
    
    get(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service '${name}' not registered`);
        }
        return service;
    }
    
    has(name) {
        return this.services.has(name);
    }
}

export const serviceLocator = new ServiceLocator();
```

---

### Phase 2: Refactor SettingsModule (Week 1, Days 3-4)

**Goal**: Replace window lookups with dependency injection

#### 2.1 Update Constructor

```javascript
// Before:
export class SettingsModule {
    constructor() {
        this.logger = new Logger();
        this.isInitialized = false;
        this.userPreferencesManager = null;
        // ...
    }
}

// After:
export class SettingsModule {
    constructor(dependencies = {}) {
        this.logger = new Logger();
        this.isInitialized = false;
        
        // Dependency injection
        this.userPreferencesManager = dependencies.userPreferencesManager || null;
        this.visibilitySettingsManager = dependencies.visibilitySettingsManager || null;
        this.notificationManager = dependencies.notificationManager || null;
        this.currentUser = dependencies.currentUser || null;
    }
}
```

#### 2.2 Remove Window Lookup Methods

```javascript
// Remove these methods:
// - getUserPreferencesManager()
// - getVisibilitySettingsManager()
// - getNotificationManager()

// Replace with direct property access:
// this.userPreferencesManager (already set in constructor)
```

#### 2.3 Update Initialization

```javascript
// Before:
async initialize() {
    this.userPreferencesManager = this.getUserPreferencesManager();
    // ...
}

// After:
async initialize() {
    // Dependencies already injected via constructor
    if (!this.userPreferencesManager) {
        throw new Error('UserPreferencesManager dependency required');
    }
    // ...
}
```

#### 2.4 Update Factory Function

```javascript
// Create factory for easy initialization
export function createSettingsModule(dependencies) {
    // Auto-resolve dependencies from window if not provided (backward compat)
    const resolvedDeps = {
        userPreferencesManager: dependencies?.userPreferencesManager || 
            (typeof window !== 'undefined' ? window.userPreferencesManager : null),
        visibilitySettingsManager: dependencies?.visibilitySettingsManager || 
            (typeof window !== 'undefined' ? window.visibilitySettingsManagerInstance : null),
        notificationManager: dependencies?.notificationManager || 
            (typeof window !== 'undefined' ? window.notificationManager : null),
        currentUser: dependencies?.currentUser || 
            (typeof window !== 'undefined' ? window.currentUser : null),
    };
    
    return new SettingsModule(resolvedDeps);
}

// Update singleton
export const settingsModuleInstance = createSettingsModule();
```

---

### Phase 3: Refactor VisibilityModule (Week 1, Day 5)

**Goal**: Replace window lookups with dependency injection

#### 3.1 Update Constructor

```javascript
// After:
export class VisibilityModule {
    constructor(dependencies = {}) {
        this.logger = new Logger();
        this.isInitialized = false;
        
        // Dependency injection
        this.visibilityManager = dependencies.visibilityManager || null;
        this.stateManager = dependencies.stateManager || stateManagerInstance;
    }
}
```

#### 3.2 Remove Window Lookup

```javascript
// Remove:
// - getVisibilityManager()

// Use:
// this.visibilityManager (from constructor)
```

#### 3.3 Update Factory

```javascript
export function createVisibilityModule(dependencies) {
    const resolvedDeps = {
        visibilityManager: dependencies?.visibilityManager || 
            (typeof window !== 'undefined' ? 
                (window.graph?.visibilityManager || window.visibilityManager) : null),
        stateManager: dependencies?.stateManager || stateManagerInstance,
    };
    
    return new VisibilityModule(resolvedDeps);
}

export const visibilityModuleInstance = createVisibilityModule();
```

---

### Phase 4: Refactor MessagesModule (Week 2, Days 1-3)

**Goal**: Replace getWindowFunction() and window lookups with imports/DI

#### 4.1 Create Service Modules

```javascript
// services/NotificationService.js
export class NotificationService {
    show(message, type = 'info') {
        // Implementation
    }
}

export const notificationService = new NotificationService();

// services/MessageRendererService.js
export class MessageRendererService {
    createUnifiedMessageElement(message) {
        // Implementation
    }
}

export const messageRendererService = new MessageRendererService();
```

#### 4.2 Replace getWindowFunction() with Imports

```javascript
// Before:
const getWindowFunction = (name) => {
    if (typeof window === 'undefined') return undefined;
    return window[name];
};

const showNotification = getWindowFunction('showNotification');

// After:
import { notificationService } from '../services/NotificationService.js';

// Use:
notificationService.show(message);
```

#### 4.3 Update Constructor for Remaining Dependencies

```javascript
export class MessagesModule {
    constructor(dependencies = {}) {
        // Injected dependencies
        this.supabase = dependencies.supabase || null;
        this.api = dependencies.api || null;
        this.communitiesModule = dependencies.communitiesModule || null;
        this.uiManager = dependencies.uiManager || null;
        
        // Direct imports (no DI needed)
        // notificationService, messageRendererService, etc.
    }
}
```

#### 4.4 Replace Window API Access

```javascript
// Before:
const supabase = window.supabase;
const api = window.api;

// After:
// Via constructor injection
this.supabase
this.api

// Or create service:
import { supabaseClient } from '../services/SupabaseService.js';
import { apiClient } from '../services/APIService.js';
```

#### 4.5 Handle Browser APIs

```javascript
// Browser APIs are acceptable window usage:
const href = window.location?.href;
const width = window.innerWidth;
const style = window.getComputedStyle(element);

// These are fine - no refactoring needed
```

---

### Phase 5: Update Module Initialization (Week 2, Days 4-5)

**Goal**: Update initialization code to inject dependencies

#### 5.1 Create Module Initializer

```javascript
// core/ModuleInitializer.js
import { createSettingsModule } from '../features/SettingsModule.js';
import { createVisibilityModule } from '../features/VisibilityModule.js';
import { createMessagesModule } from '../features/MessagesModule.js';

export async function initializeModules() {
    // Get dependencies from window (temporary bridge)
    const dependencies = {
        // SettingsModule dependencies
        userPreferencesManager: window.userPreferencesManager,
        visibilitySettingsManager: window.visibilitySettingsManagerInstance,
        notificationManager: window.notificationManager,
        currentUser: window.currentUser,
        
        // VisibilityModule dependencies
        visibilityManager: window.graph?.visibilityManager || window.visibilityManager,
        
        // MessagesModule dependencies
        supabase: window.supabase,
        api: window.api,
        communitiesModule: window.CommunitiesModule,
        uiManager: window.uiManager,
    };
    
    // Initialize modules with dependencies
    const settingsModule = createSettingsModule(dependencies);
    await settingsModule.initialize();
    
    const visibilityModule = createVisibilityModule(dependencies);
    await visibilityModule.initialize();
    
    const messagesModule = createMessagesModule(dependencies);
    await messagesModule.initialize();
    
    return {
        settingsModule,
        visibilityModule,
        messagesModule
    };
}
```

#### 5.2 Update sidepanel.html

```javascript
// Add after all modules loaded:
<script type="module">
    import { initializeModules } from './core/ModuleInitializer.js';
    
    // Wait for dependencies to be available
    window.addEventListener('load', async () => {
        await initializeModules();
    });
</script>
```

---

### Phase 6: Testing & Validation (Week 3)

**Goal**: Ensure refactoring doesn't break functionality

#### 6.1 Unit Tests

```javascript
// tests/SettingsModule.test.js
describe('SettingsModule', () => {
    it('should initialize with injected dependencies', () => {
        const mockUserPrefs = { /* mock */ };
        const module = new SettingsModule({
            userPreferencesManager: mockUserPrefs
        });
        
        expect(module.userPreferencesManager).toBe(mockUserPrefs);
    });
    
    it('should throw error if required dependency missing', () => {
        const module = new SettingsModule({});
        expect(() => module.initialize()).toThrow();
    });
});
```

#### 6.2 Integration Tests

- Test module initialization
- Test dependency resolution
- Test backward compatibility (window fallback)

#### 6.3 Browser Testing

- Test all settings functionality
- Test visibility functionality
- Test message functionality
- Test module interactions

---

## Migration Checklist

### SettingsModule
- [ ] Create ISettingsDependencies interface
- [ ] Update constructor to accept dependencies
- [ ] Remove getUserPreferencesManager()
- [ ] Remove getVisibilitySettingsManager()
- [ ] Remove getNotificationManager()
- [ ] Update initialize() to use injected dependencies
- [ ] Create createSettingsModule() factory
- [ ] Update singleton initialization
- [ ] Add dependency validation
- [ ] Write unit tests
- [ ] Update documentation

### VisibilityModule
- [ ] Create IVisibilityDependencies interface
- [ ] Update constructor to accept dependencies
- [ ] Remove getVisibilityManager()
- [ ] Update initialize() to use injected dependencies
- [ ] Create createVisibilityModule() factory
- [ ] Update singleton initialization
- [ ] Add dependency validation
- [ ] Write unit tests
- [ ] Update documentation

### MessagesModule
- [ ] Create IMessageDependencies interface
- [ ] Create NotificationService module
- [ ] Create MessageRendererService module
- [ ] Replace getWindowFunction() with imports
- [ ] Update constructor to accept dependencies
- [ ] Replace window.supabase with DI
- [ ] Replace window.api with DI
- [ ] Replace window.CommunitiesModule with DI
- [ ] Replace window.showNotification with import
- [ ] Replace window.XIcons with import
- [ ] Replace window.AvatarUtils with import
- [ ] Create createMessagesModule() factory
- [ ] Update singleton initialization
- [ ] Write unit tests
- [ ] Update documentation

### Module Initialization
- [ ] Create ModuleInitializer
- [ ] Update sidepanel.html initialization
- [ ] Test module initialization order
- [ ] Test dependency resolution
- [ ] Test backward compatibility

---

## Risk Assessment

### Low Risk
- ✅ SettingsModule refactoring (isolated, clear dependencies)
- ✅ VisibilityModule refactoring (isolated, clear dependencies)

### Medium Risk
- ⚠️ MessagesModule refactoring (many dependencies, complex)
- ⚠️ Module initialization changes (affects startup)

### High Risk
- ⚠️ Breaking changes if dependencies not available
- ⚠️ Circular dependency issues

### Mitigation Strategies
1. **Backward Compatibility**: Keep window fallback during transition
2. **Incremental Migration**: Refactor one module at a time
3. **Feature Flags**: Use flags to enable/disable new code
4. **Comprehensive Testing**: Test each phase before proceeding
5. **Rollback Plan**: Keep old code commented for quick rollback

---

## Rollback Strategy

### If Issues Arise
1. Revert to window-based lookup (keep old code commented)
2. Use feature flag to disable new code
3. Gradual rollback (one module at a time)

### Code Preservation
```javascript
// Keep old code commented for reference:
// OLD CODE (window-based):
// getUserPreferencesManager() {
//     return window.userPreferencesManager || null;
// }

// NEW CODE (dependency injection):
get userPreferencesManager() {
    return this._userPreferencesManager;
}
```

---

## Success Criteria

### Phase 1 Complete
- [ ] All interfaces defined
- [ ] Service locator created (if needed)
- [ ] Documentation updated

### Phase 2 Complete
- [ ] SettingsModule uses DI
- [ ] No window lookups for dependencies
- [ ] Unit tests passing
- [ ] Browser tests passing

### Phase 3 Complete
- [ ] VisibilityModule uses DI
- [ ] No window lookups for dependencies
- [ ] Unit tests passing
- [ ] Browser tests passing

### Phase 4 Complete
- [ ] MessagesModule uses imports/DI
- [ ] getWindowFunction() removed
- [ ] No window lookups for dependencies
- [ ] Unit tests passing
- [ ] Browser tests passing

### Phase 5 Complete
- [ ] ModuleInitializer created
- [ ] All modules initialized with DI
- [ ] Integration tests passing
- [ ] Browser tests passing

### Final
- [ ] All window dependency lookups removed
- [ ] All modules use DI or ES6 imports
- [ ] 100% test coverage
- [ ] Documentation complete
- [ ] Performance maintained or improved

---

## Timeline

**Week 1**: Phases 1-3 (Interfaces, SettingsModule, VisibilityModule)
**Week 2**: Phases 4-5 (MessagesModule, Initialization)
**Week 3**: Phase 6 (Testing & Validation)

**Total**: 3 weeks (incremental, low-risk approach)

---

## Next Steps

1. Review and approve plan
2. Create feature branch: `refactor/dependency-injection`
3. Start Phase 1: Create interfaces
4. Implement incrementally with testing at each phase
5. Merge after all tests pass

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-24  
**Status**: Ready for Implementation

