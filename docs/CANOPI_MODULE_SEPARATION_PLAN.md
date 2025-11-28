# CanopiModule Separation: Detailed Migration Plan

## Executive Summary

This document outlines a comprehensive plan to separate visibility and messages functionality from the monolithic `CanopiModule` (2,594 lines) into focused, maintainable modules following single responsibility principle.

**Goal**: Split `CanopiModule` into:
- `MessagesModule` - All message/chat functionality
- `VisibilityModule` - Visibility data management and user resolution
- `UserResolutionService` - Interface for user data resolution

**Timeline**: 4-6 weeks (phased approach)
**Risk Level**: Medium (mitigated by gradual migration)

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Target Architecture](#target-architecture)
3. [Migration Phases](#migration-phases)
4. [Detailed Implementation Steps](#detailed-implementation-steps)
5. [Dependency Mapping](#dependency-mapping)
6. [Testing Strategy](#testing-strategy)
7. [Risk Mitigation](#risk-mitigation)
8. [Rollback Plan](#rollback-plan)
9. [Success Criteria](#success-criteria)

---

## Current State Analysis

### CanopiModule Current Responsibilities

**Message Functions** (to extract):
- `loadChatHistory()` - Load messages for a page/community
- `addMessageToChat()` - Add message to UI
- `createUnifiedMessageElement()` - Render message DOM
- `updateReactionDisplay()` - Update reaction UI
- `addMessageActionListeners()` - Attach event handlers
- `loadMessageReactions()` - Load reaction data
- `handleMessageFocus()` - Focus on specific message
- `handleReplyToMessage()` - Reply functionality
- `handleQuoteMessage()` - Quote functionality
- `handleRepostMessage()` - Repost functionality
- `handleBookmarkMessage()` - Bookmark functionality
- `handleShareMessage()` - Share functionality
- `handleReaction()` - Reaction toggle
- `setupMessageInputEventListeners()` - Input handlers
- `sendChatMessage()` - Send message
- Message system integration initialization

**Visibility Functions** (to extract):
- `getCurrentVisibilityData()` - Get visibility state
- `getCurrentVisibilityDataUnfiltered()` - Get unfiltered visibility
- Visibility tab check logic (lines 1311-1315)
- User name resolution from visibility data (lines 710-721)

**Shared/Helper Functions** (to keep or move):
- `getCurrentUser()` - Get current user
- `getCurrentChatData()` - Get chat state
- `getCurrentUrlData()` - Get URL state
- `getActiveCommunities()` - Get active communities
- `getCurrentLocationHref()` - Get current URL

### Current Dependencies

**Files importing from CanopiModule:**
- `sidepanel/Sidepanel.js` - imports `loadChatHistory`
- `features/CommunityLoaders.js` - imports `loadChatHistory`
- `features/index.js` - re-exports multiple functions

**Files using window references:**
- `sidepanel.js` - 15+ references to `window.loadChatHistory`
- `ui-realtime-bindings.js` - uses `window.addMessageToChat`, `window.loadChatHistory`
- `SupabaseRealtimeClient.js` - uses `window.addMessageToChat`
- `CommunityHelpers.js` - uses `window.loadChatHistory`
- Various diagnostic/utility files

**Total window references**: ~47 occurrences

---

## Target Architecture

### Module Structure

```
features/
├── MessagesModule.js          # NEW: All message functionality
├── VisibilityModule.js         # NEW: Visibility data management
├── UserResolutionService.js    # NEW: User resolution interface
├── CanopiModule.js             # DEPRECATED: Thin orchestrator (eventually removed)
└── index.js                    # Updated exports
```

### Dependency Graph

```
┌─────────────────────────────────────┐
│      MessagesModule                 │
│  - loadChatHistory()                │
│  - addMessageToChat()               │
│  - createUnifiedMessageElement()   │
│  - All message actions              │
└──────────────┬──────────────────────┘
               │ depends on
               ▼
┌─────────────────────────────────────┐
│   UserResolutionService             │
│  (Interface/Adapter)                │
│  - resolveUserName(userId)         │
│  - resolveUserAvatar(userId)       │
│  - resolveUserHandle(userId)       │
└──────────────┬──────────────────────┘
               │ implemented by
               ▼
┌─────────────────────────────────────┐
│      VisibilityModule               │
│  - getCurrentVisibilityData()      │
│  - getActiveUsers()                │
│  - isVisibilityTabActive()         │
│  - subscribeToVisibilityUpdates()  │
└─────────────────────────────────────┘
```

### Interface Definitions

**UserResolutionService Interface:**
```javascript
interface UserResolutionService {
  resolveUserName(userId: string): Promise<string | null>;
  resolveUserAvatar(userId: string): Promise<string | null>;
  resolveUserHandle(userId: string): Promise<string | null>;
  resolveUser(userId: string): Promise<User | null>;
}
```

**VisibilityModule API:**
```javascript
class VisibilityModule {
  getCurrentVisibilityData(): VisibilityData | undefined;
  getCurrentVisibilityDataUnfiltered(): VisibilityData | undefined;
  getActiveUsers(): User[];
  isVisibilityTabActive(): boolean;
  subscribeToVisibilityUpdates(callback: (data: VisibilityData) => void): Unsubscribe;
}
```

**MessagesModule API:**
```javascript
class MessagesModule {
  async initialize(userResolutionService: UserResolutionService): Promise<void>;
  async loadChatHistory(rawUrl?: string, activeCommunities?: string[]): Promise<void>;
  async addMessageToChat(message: Message): Promise<void>;
  createUnifiedMessageElement(message: Message): Promise<HTMLElement>;
  // ... other message functions
}
```

---

## Migration Phases

### Phase 1: Foundation (Week 1)
**Goal**: Create new modules and interfaces without breaking existing code

**Tasks**:
1. Create `UserResolutionService.js` interface
2. Create `VisibilityModule.js` skeleton
3. Create `MessagesModule.js` skeleton
4. Add backward compatibility layer

**Deliverables**:
- New module files created
- Interface definitions complete
- No breaking changes

### Phase 2: Extract Visibility (Week 2)
**Goal**: Move visibility functionality to VisibilityModule

**Tasks**:
1. Move visibility helper functions
2. Implement UserResolutionService using VisibilityModule
3. Update CanopiModule to use VisibilityModule
4. Test visibility functionality

**Deliverables**:
- VisibilityModule fully functional
- CanopiModule uses VisibilityModule
- All tests passing

### Phase 3: Extract Messages (Week 3-4)
**Goal**: Move message functionality to MessagesModule

**Tasks**:
1. Move message functions to MessagesModule
2. Inject UserResolutionService into MessagesModule
3. Update CanopiModule to delegate to MessagesModule
4. Update internal references

**Deliverables**:
- MessagesModule fully functional
- CanopiModule delegates to MessagesModule
- All tests passing

### Phase 4: Update Dependencies (Week 5)
**Goal**: Update all external dependencies

**Tasks**:
1. Update ES6 imports
2. Update window references (gradual)
3. Update sidepanel.js
4. Update realtime bindings
5. Update diagnostic utilities

**Deliverables**:
- All imports updated
- Window references maintained for backward compatibility
- All tests passing

### Phase 5: Cleanup & Deprecation (Week 6)
**Goal**: Remove CanopiModule and finalize architecture

**Tasks**:
1. Remove CanopiModule (or keep as thin wrapper)
2. Remove deprecated window references
3. Update documentation
4. Final testing

**Deliverables**:
- Clean module structure
- Documentation updated
- All tests passing
- No deprecated code

---

## Detailed Implementation Steps

### Step 1: Create UserResolutionService Interface

**File**: `features/UserResolutionService.js`

```javascript
/**
 * UserResolutionService - Interface for resolving user information
 * Allows MessagesModule to resolve user data without direct dependency on VisibilityModule
 */

export class UserResolutionService {
  constructor(resolver) {
    this.resolver = resolver;
  }

  async resolveUserName(userId) {
    return this.resolver.resolveUserName(userId);
  }

  async resolveUserAvatar(userId) {
    return this.resolver.resolveUserAvatar(userId);
  }

  async resolveUserHandle(userId) {
    return this.resolver.resolveUserHandle(userId);
  }

  async resolveUser(userId) {
    return this.resolver.resolveUser(userId);
  }
}
```

**Implementation**: Create adapter that wraps VisibilityModule

### Step 2: Create VisibilityModule

**File**: `features/VisibilityModule.js`

```javascript
/**
 * VisibilityModule - Manages visibility data and user presence
 */

import { stateManagerInstance } from '../core/StateManager.js';

export class VisibilityModule {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    // Initialize visibility subscriptions, etc.
    this.isInitialized = true;
  }

  getCurrentVisibilityData() {
    const data = stateManagerInstance.getState('currentVisibilityData');
    return data && typeof data === 'object' ? data : undefined;
  }

  getCurrentVisibilityDataUnfiltered() {
    const data = stateManagerInstance.getState('currentVisibilityDataUnfiltered');
    return data && typeof data === 'object' ? data : undefined;
  }

  getActiveUsers() {
    const visibilityData = this.getCurrentVisibilityData();
    if (Array.isArray(visibilityData)) {
      return visibilityData;
    }
    if (visibilityData && typeof visibilityData === 'object' && 'active' in visibilityData) {
      return Array.isArray(visibilityData.active) ? visibilityData.active : [];
    }
    return [];
  }

  isVisibilityTabActive() {
    if (typeof document === 'undefined') return false;
    const visibilityTab = document.getElementById('visibility-tab');
    return visibilityTab && visibilityTab.classList.contains('active');
  }

  // User resolution methods for UserResolutionService
  async resolveUserName(userId) {
    const activeUsers = this.getActiveUsers();
    const user = activeUsers.find(u => u.id === userId);
    if (user) {
      return user.name || user.email?.split('@')[0] || null;
    }
    // Fallback to current user
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser?.id === userId) {
      return currentUser.name || currentUser.email?.split('@')[0] || null;
    }
    return null;
  }

  async resolveUserAvatar(userId) {
    const activeUsers = this.getActiveUsers();
    const user = activeUsers.find(u => u.id === userId);
    return user?.avatar || user?.photoURL || null;
  }

  async resolveUserHandle(userId) {
    const activeUsers = this.getActiveUsers();
    const user = activeUsers.find(u => u.id === userId);
    return user?.handle || user?.email?.split('@')[0] || null;
  }

  async resolveUser(userId) {
    const activeUsers = this.getActiveUsers();
    const user = activeUsers.find(u => u.id === userId);
    if (user) return user;
    
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser?.id === userId) return currentUser;
    
    return null;
  }
}

// Singleton instance
export const visibilityModuleInstance = new VisibilityModule();
```

### Step 3: Create MessagesModule

**File**: `features/MessagesModule.js`

**Extract from CanopiModule**:
- All message-related functions
- Message system integration
- Remove visibility data access (use UserResolutionService instead)

**Key Changes**:
1. Constructor accepts `UserResolutionService`
2. Replace `getCurrentVisibilityData()` calls with `userResolutionService.resolveUserName()`
3. Replace visibility tab check with `visibilityModule.isVisibilityTabActive()`
4. Keep all message rendering and action logic

**Structure**:
```javascript
import { UserResolutionService } from './UserResolutionService.js';
import { visibilityModuleInstance } from './VisibilityModule.js';
// ... other imports

export class MessagesModule {
  constructor(userResolutionService) {
    this.userResolutionService = userResolutionService;
    this.isInitialized = false;
    // ... other state
  }

  async initialize() {
    // Initialize message system
    // Use this.userResolutionService for user resolution
  }

  // Move all message functions from CanopiModule
  async loadChatHistory(rawUrl, activeCommunities) {
    // Check visibility tab using visibilityModuleInstance
    if (visibilityModuleInstance.isVisibilityTabActive()) {
      console.log('⚠️ loadChatHistory: Skipping - visibility tab is active');
      return;
    }
    // ... rest of function
  }

  async getSenderName(userId) {
    // Use UserResolutionService instead of direct visibility access
    const name = await this.userResolutionService.resolveUserName(userId);
    if (name) return name;
    
    // Fallback to cached messages
    const cachedMessage = getCurrentChatData().find(m => 
      m.authorId === userId || m.author?.id === userId
    );
    if (cachedMessage?.author) {
      return cachedMessage.author.name || cachedMessage.author.handle || 'Unknown User';
    }
    
    return 'Unknown User';
  }

  // ... all other message functions
}
```

### Step 4: Update CanopiModule (Backward Compatibility)

**File**: `features/CanopiModule.js` (temporary wrapper)

```javascript
/**
 * CanopiModule - DEPRECATED: Thin wrapper for backward compatibility
 * This module will be removed after migration is complete
 * 
 * @deprecated Use MessagesModule and VisibilityModule directly
 */

import { MessagesModule } from './MessagesModule.js';
import { VisibilityModule, visibilityModuleInstance } from './VisibilityModule.js';
import { UserResolutionService } from './UserResolutionService.js';

// Create UserResolutionService adapter
const userResolutionService = new UserResolutionService(visibilityModuleInstance);

// Create MessagesModule instance
const messagesModule = new MessagesModule(userResolutionService);

// Initialize modules
let isInitialized = false;

class CanopiModule {
  async initialize() {
    if (isInitialized) return;
    
    await visibilityModuleInstance.initialize();
    await messagesModule.initialize();
    
    isInitialized = true;
  }
}

// Export all functions for backward compatibility
export const loadChatHistory = (...args) => messagesModule.loadChatHistory(...args);
export const addMessageToChat = (...args) => messagesModule.addMessageToChat(...args);
export const createUnifiedMessageElement = (...args) => messagesModule.createUnifiedMessageElement(...args);
// ... export all other functions

export { CanopiModule };

// Also attach to window for backward compatibility
if (typeof window !== 'undefined') {
  window.loadChatHistory = loadChatHistory;
  window.addMessageToChat = addMessageToChat;
  // ... all other window exports
}
```

### Step 5: Update Dependencies

#### 5.1 Update ES6 Imports

**File**: `features/CommunityLoaders.js`
```javascript
// OLD:
import { loadChatHistory } from './CanopiModule.js';

// NEW:
import { loadChatHistory } from './MessagesModule.js';
// OR keep using CanopiModule during transition
```

**File**: `sidepanel/Sidepanel.js`
```javascript
// OLD:
import { loadChatHistory } from '../features/CanopiModule.js';

// NEW:
import { loadChatHistory } from '../features/MessagesModule.js';
```

#### 5.2 Update Window References (Gradual)

**Strategy**: Keep window references during transition, update gradually

**File**: `sidepanel.js`
```javascript
// During transition, both work:
if (typeof window.loadChatHistory === 'function') {
  await window.loadChatHistory();
}

// Eventually migrate to:
import { loadChatHistory } from './features/MessagesModule.js';
await loadChatHistory();
```

#### 5.3 Update Realtime Bindings

**File**: `ui-realtime-bindings.js`
```javascript
// Update to use MessagesModule
import { addMessageToChat, loadChatHistory } from './features/MessagesModule.js';

// Replace window references
window.addMessageToChat = addMessageToChat; // For backward compat
```

---

## Dependency Mapping

### Functions to Extract

| Function | Current Location | New Location | Dependencies |
|----------|-----------------|--------------|--------------|
| `loadChatHistory` | CanopiModule | MessagesModule | VisibilityModule (tab check) |
| `addMessageToChat` | CanopiModule | MessagesModule | None |
| `createUnifiedMessageElement` | CanopiModule | MessagesModule | UserResolutionService |
| `getSenderName` | CanopiModule | MessagesModule | UserResolutionService |
| `getCurrentVisibilityData` | CanopiModule | VisibilityModule | StateManager |
| `getCurrentVisibilityDataUnfiltered` | CanopiModule | VisibilityModule | StateManager |
| Visibility tab check | CanopiModule (inline) | VisibilityModule | DOM |

### Files Requiring Updates

| File | Current Usage | Update Required |
|------|--------------|-----------------|
| `sidepanel.js` | 15+ `window.loadChatHistory` | Import from MessagesModule |
| `ui-realtime-bindings.js` | `window.addMessageToChat` | Import from MessagesModule |
| `SupabaseRealtimeClient.js` | `window.addMessageToChat` | Import from MessagesModule |
| `CommunityHelpers.js` | `window.loadChatHistory` | Import from MessagesModule |
| `CommunityLoaders.js` | ES6 import | Update import path |
| `sidepanel/Sidepanel.js` | ES6 import | Update import path |
| `features/index.js` | Re-exports | Update exports |

---

## Testing Strategy

### Unit Tests

**MessagesModule Tests:**
- Test message loading with mock UserResolutionService
- Test message rendering
- Test message actions (reactions, replies, etc.)
- Test error handling

**VisibilityModule Tests:**
- Test visibility data retrieval
- Test user resolution
- Test visibility tab detection
- Test state subscriptions

**UserResolutionService Tests:**
- Test adapter pattern
- Test fallback behavior
- Test error handling

### Integration Tests

**Module Integration:**
- Test MessagesModule with VisibilityModule via UserResolutionService
- Test initialization order
- Test state synchronization

**Backward Compatibility:**
- Test CanopiModule wrapper still works
- Test window references still work
- Test existing imports still work

### Manual Testing Checklist

- [ ] Messages load correctly
- [ ] User names resolve correctly
- [ ] User avatars resolve correctly
- [ ] Visibility tab doesn't trigger message loading
- [ ] Message actions work (reactions, replies, etc.)
- [ ] Real-time updates work
- [ ] No console errors
- [ ] Performance is maintained

### Test Files to Create

```
tests/
├── MessagesModule.test.js
├── VisibilityModule.test.js
├── UserResolutionService.test.js
├── Integration.test.js
└── BackwardCompatibility.test.js
```

---

## Risk Mitigation

### Risk 1: Breaking Changes During Migration

**Mitigation**:
- Keep CanopiModule as backward-compatible wrapper
- Maintain all window exports
- Gradual migration (one file at a time)
- Comprehensive testing at each phase

**Rollback**: Revert to previous commit if issues arise

### Risk 2: Circular Dependencies

**Mitigation**:
- Use UserResolutionService as adapter (prevents circular deps)
- Clear dependency direction: MessagesModule → UserResolutionService → VisibilityModule
- No direct imports between MessagesModule and VisibilityModule

### Risk 3: Initialization Order Issues

**Mitigation**:
- Explicit initialization in CanopiModule wrapper
- Lazy initialization where possible
- Initialization checks in each module

### Risk 4: Performance Regression

**Mitigation**:
- Benchmark before and after
- Profile critical paths
- Optimize adapter pattern if needed

### Risk 5: Missing Dependencies

**Mitigation**:
- Comprehensive dependency mapping
- Automated dependency checking
- Manual verification checklist

---

## Rollback Plan

### Immediate Rollback (< 1 hour)

If critical issues are discovered:

1. **Revert Git Commit**
   ```bash
   git revert <commit-hash>
   ```

2. **Restore Previous CanopiModule**
   - Keep backup of original CanopiModule.js
   - Restore from backup if needed

3. **Verify Functionality**
   - Run all tests
   - Manual smoke test
   - Check console for errors

### Partial Rollback

If only one module has issues:

1. **Keep Working Modules**
   - Don't revert entire migration
   - Fix specific module

2. **Temporary Workaround**
   - Use CanopiModule wrapper for broken functionality
   - Fix issues in isolation

### Rollback Triggers

- Critical bugs in production
- Performance degradation > 20%
- Test failure rate > 5%
- User-reported issues

---

## Success Criteria

### Phase 1 Success
- [ ] New modules created
- [ ] No breaking changes
- [ ] All existing tests pass

### Phase 2 Success
- [ ] VisibilityModule functional
- [ ] CanopiModule uses VisibilityModule
- [ ] User resolution works correctly
- [ ] All tests pass

### Phase 3 Success
- [ ] MessagesModule functional
- [ ] CanopiModule delegates to MessagesModule
- [ ] All message functionality works
- [ ] All tests pass

### Phase 4 Success
- [ ] All dependencies updated
- [ ] Window references maintained for backward compat
- [ ] No console errors
- [ ] All tests pass

### Phase 5 Success
- [ ] CanopiModule removed or minimal
- [ ] Clean module structure
- [ ] Documentation updated
- [ ] Performance maintained or improved
- [ ] Code coverage maintained
- [ ] Zero breaking changes for end users

### Final Metrics

- **Code Organization**: CanopiModule reduced from 2,594 lines to < 200 lines (or removed)
- **Module Count**: 3 focused modules vs 1 monolithic module
- **Coupling**: MessagesModule has no direct dependency on VisibilityModule
- **Testability**: Each module independently testable
- **Maintainability**: Clear separation of concerns

---

## Timeline & Milestones

### Week 1: Foundation
- **Day 1-2**: Create interfaces and module skeletons
- **Day 3-4**: Implement UserResolutionService
- **Day 5**: Testing and documentation

### Week 2: Extract Visibility
- **Day 1-2**: Move visibility functions to VisibilityModule
- **Day 3**: Implement UserResolutionService adapter
- **Day 4**: Update CanopiModule to use VisibilityModule
- **Day 5**: Testing

### Week 3-4: Extract Messages
- **Week 3**: Move message functions to MessagesModule
- **Week 4**: Update CanopiModule to delegate to MessagesModule
- **Testing**: Continuous testing throughout

### Week 5: Update Dependencies
- **Day 1-2**: Update ES6 imports
- **Day 3**: Update window references
- **Day 4-5**: Update realtime bindings and utilities

### Week 6: Cleanup
- **Day 1-2**: Remove deprecated code
- **Day 3**: Update documentation
- **Day 4**: Final testing
- **Day 5**: Release preparation

---

## Documentation Updates

### Code Documentation

1. **Module JSDoc Comments**
   - Document all public APIs
   - Document dependencies
   - Document initialization requirements

2. **Architecture Documentation**
   - Update architecture diagrams
   - Document module relationships
   - Document migration rationale

3. **Developer Guide**
   - How to use MessagesModule
   - How to use VisibilityModule
   - How to extend UserResolutionService

### User Documentation

- No user-facing changes expected
- Update changelog if needed

---

## Post-Migration Benefits

### Immediate Benefits
- **Clearer Code Organization**: Each module has single responsibility
- **Better Testability**: Modules can be tested independently
- **Reduced Coupling**: MessagesModule doesn't depend on VisibilityModule internals

### Long-term Benefits
- **Easier Maintenance**: Changes to visibility don't affect messages
- **Better Scalability**: Can add new user data sources via UserResolutionService
- **Improved Developer Experience**: Clearer module boundaries
- **Future Flexibility**: Can swap implementations without breaking consumers

---

## Appendix

### A. Code Examples

See detailed code examples in implementation steps above.

### B. Migration Checklist

**Pre-Migration:**
- [ ] Backup current CanopiModule.js
- [ ] Document all current dependencies
- [ ] Run full test suite (baseline)
- [ ] Create feature branch

**During Migration:**
- [ ] Complete each phase before moving to next
- [ ] Run tests after each change
- [ ] Update documentation as you go
- [ ] Commit frequently with clear messages

**Post-Migration:**
- [ ] Remove deprecated code
- [ ] Update all documentation
- [ ] Run full test suite
- [ ] Performance benchmarking
- [ ] Code review
- [ ] Merge to main

### C. Key Files Reference

| File | Purpose | Status |
|-----|---------|--------|
| `CanopiModule.js` | Current monolithic module | To be deprecated |
| `MessagesModule.js` | New message module | To be created |
| `VisibilityModule.js` | New visibility module | To be created |
| `UserResolutionService.js` | User resolution interface | To be created |
| `features/index.js` | Module exports | To be updated |

---

## Questions & Decisions Needed

1. **CanopiModule Removal**: Should we completely remove CanopiModule or keep as thin wrapper?
   - **Recommendation**: Keep as thin wrapper initially, remove after 1-2 releases

2. **Window Exports**: How long should we maintain window exports?
   - **Recommendation**: Maintain for 2-3 releases, then deprecate

3. **UserResolutionService Implementation**: Should we support multiple data sources?
   - **Recommendation**: Start with VisibilityModule, add extensibility later

4. **Testing Strategy**: Unit tests vs integration tests priority?
   - **Recommendation**: Both, but prioritize integration tests for critical paths

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Author**: Architecture Team  
**Status**: Draft - Pending Review

