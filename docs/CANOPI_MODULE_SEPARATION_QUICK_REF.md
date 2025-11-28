# CanopiModule Separation - Quick Reference

## Overview

**Goal**: Split `CanopiModule` (2,594 lines) into focused modules:
- `MessagesModule` - Message/chat functionality
- `VisibilityModule` - Visibility data management
- `UserResolutionService` - User data resolution interface

**Timeline**: 4-6 weeks (phased approach)

---

## Architecture

```
MessagesModule → UserResolutionService → VisibilityModule
```

**Key Principle**: MessagesModule depends on interface, not implementation

---

## Migration Phases

### Phase 1: Foundation (Week 1)
- Create module skeletons
- Define interfaces
- No breaking changes

### Phase 2: Extract Visibility (Week 2)
- Move visibility functions
- Implement UserResolutionService
- Update CanopiModule

### Phase 3: Extract Messages (Week 3-4)
- Move message functions
- Inject UserResolutionService
- Update CanopiModule

### Phase 4: Update Dependencies (Week 5)
- Update ES6 imports
- Update window references
- Update realtime bindings

### Phase 5: Cleanup (Week 6)
- Remove deprecated code
- Update documentation
- Final testing

---

## Key Functions to Extract

### MessagesModule
- `loadChatHistory()`
- `addMessageToChat()`
- `createUnifiedMessageElement()`
- `updateReactionDisplay()`
- All message actions (reactions, replies, etc.)

### VisibilityModule
- `getCurrentVisibilityData()`
- `getCurrentVisibilityDataUnfiltered()`
- `getActiveUsers()`
- `isVisibilityTabActive()`
- User resolution methods

### UserResolutionService (Interface)
- `resolveUserName(userId)`
- `resolveUserAvatar(userId)`
- `resolveUserHandle(userId)`
- `resolveUser(userId)`

---

## Files Requiring Updates

**ES6 Imports:**
- `features/CommunityLoaders.js`
- `sidepanel/Sidepanel.js`
- `features/index.js`

**Window References:**
- `sidepanel.js` (15+ references)
- `ui-realtime-bindings.js`
- `SupabaseRealtimeClient.js`
- `CommunityHelpers.js`

---

## Backward Compatibility Strategy

1. **CanopiModule as Wrapper**: Keep CanopiModule as thin wrapper during transition
2. **Window Exports**: Maintain all window exports
3. **Gradual Migration**: Update one file at a time
4. **No Breaking Changes**: All existing code continues to work

---

## Testing Checklist

- [ ] Messages load correctly
- [ ] User names resolve correctly
- [ ] User avatars resolve correctly
- [ ] Visibility tab doesn't trigger message loading
- [ ] Message actions work
- [ ] Real-time updates work
- [ ] No console errors
- [ ] Performance maintained

---

## Risk Mitigation

1. **Breaking Changes**: Keep backward compatibility layer
2. **Circular Dependencies**: Use adapter pattern
3. **Initialization Order**: Explicit initialization
4. **Performance**: Benchmark before/after
5. **Rollback Plan**: Git revert + backup restoration

---

## Success Criteria

- CanopiModule reduced from 2,594 lines to < 200 lines
- 3 focused modules vs 1 monolithic module
- Zero breaking changes for end users
- All tests passing
- Performance maintained or improved

---

## Quick Commands

```bash
# Create feature branch
git checkout -b feature/canopi-module-separation

# Run tests
npm test

# Check dependencies
grep -r "CanopiModule" features/
grep -r "window.loadChatHistory" .

# Backup current module
cp features/CanopiModule.js features/CanopiModule.js.backup
```

---

## Key Decisions

1. **CanopiModule Removal**: Keep as thin wrapper initially, remove after 1-2 releases
2. **Window Exports**: Maintain for 2-3 releases, then deprecate
3. **UserResolutionService**: Start with VisibilityModule, add extensibility later

---

**See**: `CANOPI_MODULE_SEPARATION_PLAN.md` for full details

