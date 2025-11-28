# Slice 7 Solution Design: Code Duplication & Architecture

## Problem Summary
- **7 duplicate message loading functions** across multiple files
- **6 large files** (>1000 lines), with ProfileManager.ts at 3675 lines
- **71 files with tight coupling** via window property access
- **66 files with inconsistent patterns** (mixed class/function)

## Solution Strategy

### Phase 1: Extract Shared Utilities (Priority: High)

#### 1.1 Unified Message Loading Service
**Current State**: 7 different implementations of message loading
- `MessageLoader.ts` - messageLoad
- `MessagesModule.ts` - loadChatHistory
- `MessageLoadingService.ts` - loadMessages, loadChatHistory
- `MessagesModuleServiceIntegration.ts` - loadChatHistory, messageLoad
- `AgentModule.ts` - removeLoadingMessage
- `Sidepanel.ts` - loadChatHistory, messageLoad
- `MESSAGE_LOADING_DIAGNOSTIC.ts` - runMessageLoad

**Solution**: Consolidate into single `MessageLoadingService`
- Keep existing `MessageLoadingService.ts` as base
- Migrate all other implementations to use this service
- Remove duplicate implementations
- Add proper dependency injection

#### 1.2 Shared UI Components Library
**Current State**: Multiple similar UI components
- Multiple modal implementations
- Duplicate display components
- Repeated UI patterns

**Solution**: Create `src/components/shared/` directory
- Extract common modal patterns
- Create reusable display components
- Establish component composition patterns

#### 1.3 Unified State Management
**Current State**: 4 different state management patterns
- StateManager (27 files)
- window-state (23 files)
- chrome-storage (19 files)
- storage-api (6 files)

**Solution**: Standardize on StateManager
- Migrate window-state to StateManager
- Create storage abstraction layer
- Document state management patterns

### Phase 2: Break Down Large Files (Priority: High)

#### 2.1 ProfileManager.ts (3675 lines → ~4 modules)

**Split into**:
- `ProfileManager.ts` (core logic, ~800 lines)
  - User profile data management
  - Profile state management
  - Core profile operations
  
- `ProfileUIManager.ts` (UI updates, ~800 lines)
  - UI rendering
  - Modal management
  - Color picker UI
  - Avatar UI updates
  
- `ProfileStorageManager.ts` (storage operations, ~600 lines)
  - Chrome storage operations
  - Preference persistence
  - Cache management
  
- `ProfileAuthManager.ts` (auth integration, ~500 lines)
  - Authentication integration
  - User session management
  - Auth state handling

**Dependencies**:
- Use dependency injection for API, storage, stateManager
- Remove direct window property access
- Export clean interfaces

#### 2.2 MessagesModule.ts (2611 lines → ~3 modules)

**Split into**:
- `MessagesModule.ts` (core message logic, ~900 lines)
  - Message data management
  - Message CRUD operations
  - Message state management
  
- `MessageUIManager.ts` (UI rendering, ~800 lines)
  - Message rendering
  - UI updates
  - Modal management
  
- `MessageIntegrationManager.ts` (integrations, ~600 lines)
  - Supabase integration
  - Real-time subscriptions
  - API integration

**Dependencies**:
- Inject MessageLoadingService
- Use StateManager instead of window state
- Clean separation of concerns

### Phase 3: Improve Dependency Injection (Priority: Medium)

#### 3.1 Replace Window Property Access

**Current Pattern** (71 files):
```typescript
const api = window.api;
const state = window.stateManager.getState('key');
```

**Target Pattern**:
```typescript
class MyModule {
  constructor(
    private api: MetaLayerAPI,
    private stateManager: StateManager
  ) {}
  
  doSomething() {
    const state = this.stateManager.getState('key');
  }
}
```

#### 3.2 Create Dependency Container

**New File**: `src/core/DependencyContainer.ts`
- Centralized dependency management
- Type-safe dependency injection
- Singleton management
- Testing support

### Phase 4: Establish Architectural Patterns (Priority: Medium)

#### 4.1 Module Template

**Create**: `src/templates/ModuleTemplate.ts`
- Standard module structure
- Dependency injection pattern
- Export patterns
- Documentation template

#### 4.2 Pattern Guidelines

**Create**: `ARCHITECTURE.md`
- When to use classes vs functions
- State management guidelines
- Dependency injection patterns
- Testing patterns

## Implementation Plan

### Week 1: Extract Utilities
1. ✅ Consolidate message loading (Day 1-2)
2. ✅ Extract shared UI components (Day 3-4)
3. ✅ Standardize state management (Day 5)

### Week 2: Refactor Large Files
1. ✅ Split ProfileManager.ts (Day 1-2)
2. ✅ Split MessagesModule.ts (Day 3-4)
3. ✅ Update all imports (Day 5)

### Week 3: Dependency Injection
1. ✅ Create DependencyContainer (Day 1)
2. ✅ Migrate top 20 files (Day 2-3)
3. ✅ Migrate remaining files (Day 4-5)

### Week 4: Documentation & Patterns
1. ✅ Create architecture docs (Day 1-2)
2. ✅ Create module template (Day 3)
3. ✅ Code review and cleanup (Day 4-5)

## Risk Mitigation

1. **Breaking Changes**: 
   - Maintain backward compatibility during migration
   - Gradual migration with feature flags
   - Comprehensive testing

2. **Testing**:
   - Unit tests for each new module
   - Integration tests for refactored code
   - E2E tests for critical paths

3. **Rollback Plan**:
   - Git branches for each phase
   - Feature flags for gradual rollout
   - Monitoring and alerting

## Success Criteria

1. ✅ No duplicate message loading functions
2. ✅ All files < 1500 lines
3. ✅ < 10 files with window property access
4. ✅ Consistent patterns across codebase
5. ✅ All tests passing
6. ✅ Build successful
7. ✅ No runtime errors

## Files to Create/Modify

### New Files:
- `src/core/DependencyContainer.ts`
- `src/components/shared/Modal.ts`
- `src/components/shared/Display.ts`
- `src/features/ProfileUIManager.ts`
- `src/features/ProfileStorageManager.ts`
- `src/features/ProfileAuthManager.ts`
- `src/features/MessageUIManager.ts`
- `src/features/MessageIntegrationManager.ts`
- `src/templates/ModuleTemplate.ts`
- `ARCHITECTURE.md`

### Files to Modify:
- `src/features/ProfileManager.ts` (refactor to core only)
- `src/features/MessagesModule.ts` (refactor to core only)
- All 71 files with window access (migrate to DI)
- All files using duplicate message loading (use service)






