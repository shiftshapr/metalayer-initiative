# Window References Audit Report
**Date:** 2025-11-26  
**Total Window References:** 669  
**Goal:** Identify best practice violations and migration opportunities

## Executive Summary

The codebase has **669 window references**, but most are **necessary browser APIs** or **type checks**. However, there are **significant opportunities** to migrate application-specific globals to the module graph for better encapsulation and type safety.

### Key Findings
- **~400 references**: Necessary browser APIs (keep)
- **~150 references**: Application globals (migrate to module graph)
- **~50 references**: Type checks (improve patterns)
- **~69 references**: Legacy/temporary (remove after migration)

---

## 1. Window Reference Categories

### ✅ Category 1: NECESSARY (Keep As-Is)
**Count:** ~400 references  
**Examples:**
- `window.location` - Browser location API
- `window.document` - DOM access
- `window.chrome` - Chrome extension APIs
- `window.getComputedStyle` - CSS computation
- `window.addEventListener` - Event handling
- `window.localStorage` - Storage API
- `typeof window !== 'undefined'` - Environment checks

**Action:** ✅ **No changes needed** - These are standard browser APIs

---

### ⚠️ Category 2: MIGRATION CANDIDATES (High Priority)
**Count:** ~150 references  
**These should be migrated to module graph for better encapsulation:**

#### 2.1 State Management (50+ references)
**Current Pattern:**
```typescript
window.getState('currentUser')
window.setState('currentUser', user)
window.currentUser
```

**Best Practice:**
```typescript
// From module graph
const stateManager = moduleGraph.stateManager;
const user = stateManager.getState('currentUser');
stateManager.setState('currentUser', user);
```

**Files Affected:**
- `MessagesModule.ts` - Uses `window.getState`, `window.currentUser`
- `ProfileManager.ts` - Uses `window.currentUser`
- `RealtimeManager.ts` - Uses `window.currentUser`
- `PeopleModule.ts` - Uses `window.currentUser`
- Many utility files

**Impact:** HIGH - Reduces global state coupling

---

#### 2.2 API Service (30+ references)
**Current Pattern:**
```typescript
window.api.request('/endpoint', options)
```

**Best Practice:**
```typescript
// From module graph or direct import
import { APIService } from '../services/APIService.js';
const api = new APIService();
// OR
const api = moduleGraph.apiService;
await api.request('/endpoint', options);
```

**Files Affected:**
- `MessagesModule.ts`
- `ProfileManager.ts`
- `AuthModule.ts`
- Various service files

**Impact:** HIGH - Better dependency injection, type safety

---

#### 2.3 Supabase Client (20+ references)
**Current Pattern:**
```typescript
window.supabase.from('table').select()
```

**Best Practice:**
```typescript
// From module graph
const supabase = moduleGraph.supabaseService.getClient();
await supabase.from('table').select();
```

**Files Affected:**
- `RealtimeManager.ts`
- `SupabaseService.ts`
- Various visibility files

**Impact:** MEDIUM - Already has service, just needs migration

---

#### 2.4 Message Loading (15+ references)
**Current Pattern:**
```typescript
window.loadChatHistory(url, communities)
```

**Best Practice:**
```typescript
// From module graph
await moduleGraph.messageLoadingService.loadMessages(url, communities);
```

**Files Affected:**
- `BootController.ts` - Already uses service ✅
- `TabController.ts` - Already uses service ✅
- Legacy code still uses `window.loadChatHistory`

**Impact:** MEDIUM - Most code already migrated

---

#### 2.5 Current Data Access (20+ references)
**Current Pattern:**
```typescript
window.currentChatData
window.currentUrlData
window.currentVisibilityData
```

**Best Practice:**
```typescript
// From state manager or module graph
const chatData = stateManager.getState('chat.data');
const urlData = stateManager.getState('currentUrlData');
const visibilityData = visibilityManager.getState();
```

**Files Affected:**
- `MessagesModule.ts`
- Various UI components
- Visibility modules

**Impact:** HIGH - Eliminates global mutable state

---

#### 2.6 User Utilities (15+ references)
**Current Pattern:**
```typescript
window.getCurrentUserEmail()
window.getCurrentUserId()
window.getCurrentUser()
```

**Best Practice:**
```typescript
// From state manager
const user = stateManager.getState('currentUser');
const email = user?.email;
const userId = user?.id;
```

**Files Affected:**
- `RealtimeManager.ts`
- `APIService.ts`
- Various utility files

**Impact:** MEDIUM - Consolidates user access patterns

---

### 🔴 Category 3: LEGACY/TEMPORARY (Remove After Migration)
**Count:** ~69 references  
**These are temporary migration bridges:**

#### 3.1 Module Graph Exposure
**Current Pattern:**
```typescript
window.__CANOPI_MODULE_GRAPH__
window.__CANOPI_SIDEPANEL_READY__
```

**Status:** Temporary bridge for migration  
**Action:** Keep for now, remove once all code uses module graph

**Impact:** LOW - Already documented as temporary

---

### ℹ️ Category 4: TYPE CHECKS (Improve Patterns)
**Count:** ~50 references  
**Current Pattern:**
```typescript
if (typeof window !== 'undefined') {
  // access window
}
const win = window as Window & { customProp?: Type };
```

**Best Practice:**
```typescript
// Use proper type guards
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// Use global.d.ts types instead of assertions
// window.customProp is already typed in global.d.ts
```

**Impact:** LOW - Code works, but can be cleaner

---

## 2. Top Window Reference Patterns

### Most Common References (by frequency)

1. **`window.currentUser`** - ~80 references
   - **Priority:** HIGH
   - **Migration:** Use `stateManager.getState('currentUser')`
   - **Files:** MessagesModule, ProfileManager, RealtimeManager, PeopleModule

2. **`window.getState`** - ~40 references
   - **Priority:** HIGH
   - **Migration:** Use `stateManager.getState()` from module graph
   - **Files:** MessagesModule, various utilities

3. **`window.api`** - ~30 references
   - **Priority:** HIGH
   - **Migration:** Use `APIService` or `moduleGraph.apiService`
   - **Files:** MessagesModule, ProfileManager, AuthModule

4. **`window.supabase`** - ~20 references
   - **Priority:** MEDIUM
   - **Migration:** Use `moduleGraph.supabaseService.getClient()`
   - **Files:** RealtimeManager, SupabaseService

5. **`window.loadChatHistory`** - ~15 references
   - **Priority:** MEDIUM
   - **Migration:** Use `moduleGraph.messageLoadingService.loadMessages()`
   - **Files:** Legacy code, BootController already migrated ✅

6. **`window.currentChatData`** - ~10 references
   - **Priority:** HIGH
   - **Migration:** Use `stateManager.getState('chat.data')`
   - **Files:** MessagesModule, UI components

7. **`window.currentUrlData`** - ~10 references
   - **Priority:** HIGH
   - **Migration:** Use `stateManager.getState('currentUrlData')`
   - **Files:** MessagesModule, various modules

8. **`window.document`** - ~200 references
   - **Priority:** NONE (necessary browser API)
   - **Action:** Keep as-is

9. **`window.location`** - ~50 references
   - **Priority:** NONE (necessary browser API)
   - **Action:** Keep as-is

10. **`window.chrome`** - ~30 references
    - **Priority:** NONE (necessary extension API)
    - **Action:** Keep as-is

---

## 3. Best Practice Migration Plan

### Phase 1: High Priority (This Week)
**Target:** State management and API access

1. **Migrate `window.currentUser`**
   - Find all references: `grep -r "window.currentUser" src/`
   - Replace with: `stateManager.getState('currentUser')`
   - Files: ~80 references in 15+ files

2. **Migrate `window.getState` / `window.setState`**
   - Find all references: `grep -r "window\.getState\|window\.setState" src/`
   - Replace with: `stateManager.getState()` / `stateManager.setState()`
   - Files: ~40 references in 10+ files

3. **Migrate `window.api`**
   - Find all references: `grep -r "window\.api" src/`
   - Replace with: Import `APIService` or use module graph
   - Files: ~30 references in 8+ files

**Expected Reduction:** ~150 window references → ~520 remaining (mostly browser APIs)

---

### Phase 2: Medium Priority (Next Week)
**Target:** Supabase, message loading, data access

1. **Migrate `window.supabase`**
   - Use `moduleGraph.supabaseService.getClient()`
   - Files: ~20 references

2. **Migrate `window.loadChatHistory`**
   - Use `moduleGraph.messageLoadingService.loadMessages()`
   - Files: ~15 references (most already migrated)

3. **Migrate `window.currentChatData` / `window.currentUrlData`**
   - Use `stateManager.getState('chat.data')` / `stateManager.getState('currentUrlData')`
   - Files: ~20 references

**Expected Reduction:** ~55 window references → ~465 remaining

---

### Phase 3: Low Priority (Future)
**Target:** Type checks, legacy bridges

1. **Improve type check patterns**
   - Create proper type guards
   - Use global.d.ts types instead of assertions
   - Files: ~50 references

2. **Remove legacy bridges**
   - Remove `window.__CANOPI_MODULE_GRAPH__` once migration complete
   - Files: ~10 references

**Expected Reduction:** ~60 window references → ~405 remaining (mostly browser APIs)

---

## 4. Migration Examples

### Example 1: State Management
**Before:**
```typescript
// Bad: Global state access
const user = window.currentUser;
window.setState('chat.data', messages);
const chatData = window.currentChatData;
```

**After:**
```typescript
// Good: Module graph access
import { stateManagerInstance } from '../core/StateManager.js';

const user = stateManagerInstance.getState('currentUser');
stateManagerInstance.setState('chat.data', messages);
const chatData = stateManagerInstance.getState('chat.data');
```

---

### Example 2: API Service
**Before:**
```typescript
// Bad: Global API access
const response = await window.api.request('/v1/users', { method: 'GET' });
```

**After:**
```typescript
// Good: Dependency injection
import { APIService } from '../services/APIService.js';
// OR from module graph
const api = moduleGraph.apiService;
const response = await api.request('/v1/users', { method: 'GET' });
```

---

### Example 3: Supabase Client
**Before:**
```typescript
// Bad: Global Supabase access
const { data } = await window.supabase.from('user_presence').select();
```

**After:**
```typescript
// Good: Service access
const supabase = moduleGraph.supabaseService.getClient();
const { data } = await supabase.from('user_presence').select();
```

---

## 5. Files Requiring Migration

### High Priority Files (State Management)
1. `src/features/MessagesModule.ts` - ~20 window references
2. `src/features/ProfileManager.ts` - ~15 window references
3. `src/features/RealtimeManager.ts` - ~10 window references
4. `src/features/PeopleModule.ts` - ~8 window references
5. `src/utils/UserPreferencesManager.ts` - ~5 window references

### Medium Priority Files (API/Services)
1. `src/features/AuthModule.ts` - ~8 window references
2. `src/services/APIService.ts` - ~5 window references
3. `src/services/SupabaseService.ts` - ~5 window references

### Low Priority Files (Type Checks)
1. Various utility files - ~50 type check references

---

## 6. Benefits of Migration

### 1. Better Encapsulation
- **Before:** Global state accessible from anywhere
- **After:** State managed through module graph
- **Benefit:** Easier to test, debug, and reason about

### 2. Type Safety
- **Before:** `window.currentUser` could be `undefined` or wrong type
- **After:** `stateManager.getState('currentUser')` returns typed `User | null`
- **Benefit:** Compile-time type checking, fewer runtime errors

### 3. Dependency Injection
- **Before:** Hard-coded global dependencies
- **After:** Dependencies injected via module graph
- **Benefit:** Easier to mock for testing, better architecture

### 4. Tree Shaking
- **Before:** All window globals loaded even if unused
- **After:** Only imported modules included
- **Benefit:** Smaller bundle size

### 5. Testability
- **Before:** Hard to test code that uses window globals
- **After:** Easy to inject mock dependencies
- **Benefit:** Better test coverage

---

## 7. Recommendations

### Immediate Actions (This Week)
1. ✅ **Migrate `window.currentUser`** → `stateManager.getState('currentUser')`
2. ✅ **Migrate `window.getState/setState`** → `stateManager` methods
3. ✅ **Migrate `window.api`** → `APIService` or module graph

**Expected Impact:** Reduce window references by ~150 (22% reduction)

### Short-term (Next 2 Weeks)
1. ✅ **Migrate `window.supabase`** → `moduleGraph.supabaseService`
2. ✅ **Migrate `window.currentChatData`** → `stateManager.getState('chat.data')`
3. ✅ **Migrate `window.currentUrlData`** → `stateManager.getState('currentUrlData')`

**Expected Impact:** Reduce window references by ~55 (8% reduction)

### Long-term (Next Month)
1. ✅ **Improve type check patterns** → Proper type guards
2. ✅ **Remove legacy bridges** → Once migration complete
3. ✅ **Document remaining window usage** → Why each is necessary

**Expected Impact:** Reduce window references by ~60 (9% reduction)

### Final State
- **Total Window References:** ~405 (down from 669)
- **Application Globals:** ~0 (all migrated)
- **Browser APIs:** ~400 (necessary, keep)
- **Type Checks:** ~5 (improved patterns)

**Reduction:** 39% fewer window references, 100% of application globals migrated

---

## 8. Migration Checklist

### Phase 1: State Management
- [ ] Replace `window.currentUser` with `stateManager.getState('currentUser')`
- [ ] Replace `window.getState()` with `stateManager.getState()`
- [ ] Replace `window.setState()` with `stateManager.setState()`
- [ ] Replace `window.currentChatData` with `stateManager.getState('chat.data')`
- [ ] Replace `window.currentUrlData` with `stateManager.getState('currentUrlData')`
- [ ] Replace `window.currentVisibilityData` with `visibilityManager.getState()`

### Phase 2: Services
- [ ] Replace `window.api` with `APIService` or `moduleGraph.apiService`
- [ ] Replace `window.supabase` with `moduleGraph.supabaseService.getClient()`
- [ ] Replace `window.loadChatHistory` with `moduleGraph.messageLoadingService.loadMessages()`

### Phase 3: Utilities
- [ ] Replace `window.getCurrentUserEmail()` with `stateManager.getState('currentUser')?.email`
- [ ] Replace `window.getCurrentUserId()` with `stateManager.getState('currentUser')?.id`
- [ ] Replace `window.getCurrentUser()` with `stateManager.getState('currentUser')`

### Phase 4: Cleanup
- [ ] Remove `window.__CANOPI_MODULE_GRAPH__` (once all code migrated)
- [ ] Improve type check patterns
- [ ] Document remaining window usage

---

## 9. Conclusion

**Current State:** 669 window references (mixed necessary and application globals)  
**Target State:** ~405 window references (only necessary browser APIs)  
**Reduction:** 39% fewer references, 100% of application globals migrated

**Priority:** Focus on **Phase 1 (State Management)** first - this will have the biggest impact on code quality and type safety.

**Timeline:**
- **Week 1:** Phase 1 (State Management) - ~150 references
- **Week 2:** Phase 2 (Services) - ~55 references
- **Week 3-4:** Phase 3 (Utilities & Cleanup) - ~60 references

**Expected Outcome:** Clean, maintainable code with proper encapsulation and type safety.

---

**Report Generated:** 2025-11-26  
**Next Review:** After Phase 1 completion
