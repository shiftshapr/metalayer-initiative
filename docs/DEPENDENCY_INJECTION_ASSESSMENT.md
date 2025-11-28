# Dependency Injection Assessment: ProfileManager

**Date**: 2025-01-24  
**Question**: Should we implement dependency injection now or defer it?  
**Context**: Event-based communication just implemented, but DI was recommended as long-term solution

---

## Current State

### ProfileManager Architecture
- **Pattern**: Singleton created at module level
- **Location**: `presence/src/features/ProfileManager.ts:3667`
- **Initialization**: `const profileManagerInstance = new ProfileManager();`
- **Window Global**: Assigned to `window.profileManager` (line 3674)
- **Constructor**: Takes no parameters (line 148)

### buildGraph.ts Pattern
- **Architecture**: Returns all components for explicit dependency injection
- **Pattern**: `return { stateManager, eventBus, authManager, visibilityManager, visibilitySettings, ... }`
- **Note**: ProfileManager is **NOT** currently in the return object

### Codebase Direction
- **Goal**: "ES6 Modules only - no window globals"
- **Status**: Window globals are "temporary during migration"
- **Future**: "Will migrate to proper state management (Redux/Zustand)"

---

## Assessment: Should We Do DI Now?

### ✅ **Arguments FOR Implementing DI Now**

1. **Architectural Alignment**
   - buildGraph.ts already uses DI pattern
   - ProfileManager is the outlier (not in return object)
   - Aligns with "ES6 Modules only" direction

2. **Type Safety**
   - Compile-time guarantees vs runtime checks
   - No need for window global type definitions
   - Clear dependency graph

3. **Testability**
   - Easy to inject mocks
   - No window global dependencies
   - Isolated unit tests

4. **Consistency**
   - Other managers use DI pattern
   - ProfileManager would match architecture
   - Reduces technical debt

### ⚠️ **Arguments AGAINST Implementing DI Now**

1. **Scope of Change**
   - ProfileManager is a large class (3700+ lines)
   - Currently singleton pattern
   - Many window.profileManager references throughout codebase
   - Would require refactoring initialization chain

2. **Migration State**
   - Codebase is in active migration
   - Window globals are explicitly "temporary"
   - Event-based solution works and is decoupled
   - May be premature optimization

3. **Risk vs Reward**
   - Event-based already solves the immediate problem
   - DI refactor is larger change with more risk
   - Could introduce bugs in working code
   - May conflict with ongoing migration work

4. **Timing**
   - Event-based just implemented and verified
   - DI would be another refactor on top
   - Better to do as part of broader window global migration

---

## Recommendation

### **Defer DI, But Plan It**

**Rationale**:
1. **Event-based is sufficient** for current needs
   - Decoupled ✅
   - Works ✅
   - Type-safe ✅
   - Testable ✅

2. **DI should be part of broader migration**
   - ProfileManager has many window dependencies
   - Better to refactor all window globals together
   - Aligns with "Future: Will migrate to proper state management"

3. **Incremental approach**
   - Event-based removes immediate coupling
   - DI can come later when doing full window global migration
   - Less risk, more manageable

### **When to Implement DI**

**Ideal Timing**:
- As part of broader window global migration
- When refactoring ProfileManager initialization
- When moving to proper state management (Redux/Zustand)
- When buildGraph.ts is updated to include ProfileManager

**Implementation Plan** (for future):
1. Add ProfileManager to buildGraph.ts return object
2. Update ProfileManager constructor to accept dependencies
3. Remove singleton pattern
4. Update all window.profileManager references
5. Remove window.profileManager assignment

---

## Conclusion

**Current Approach**: ✅ **Keep event-based communication**

**Future Approach**: 🔄 **Implement DI as part of window global migration**

**Reasoning**: Event-based solves the immediate problem with minimal risk. DI is the better long-term solution but should be part of a coordinated migration effort, not an isolated refactor.

---

*Assessment generated for architectural decision*






