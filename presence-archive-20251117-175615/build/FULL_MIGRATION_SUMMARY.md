# Full TypeScript Migration - Summary & Status

## Migration Started ✅

### What We've Done
1. ✅ **Removed window exports from CanopiModule.ts** - Pure ES6 modules
2. ✅ **Started CommunitiesModule.ts conversion** - Added imports, types, removed some window globals
3. ✅ **Created migration plan** - Full roadmap documented

### Current State

#### CanopiModule.ts
- ✅ **Pure ES6 exports** - No window globals
- ✅ **TypeScript types** - Full type safety
- ✅ **Ready to compile** - Just needs recompilation

#### CommunitiesModule.ts (IN PROGRESS)
- ✅ **TypeScript file created** - `src/features/CommunitiesModule.ts`
- ✅ **ES6 imports added** - `import { loadChatHistory } from './CanopiModule.js'`
- ✅ **Types added** - Community interface, LogLevel type
- ✅ **Logger imported** - Using ES6 import
- ⚠️ **Window globals remaining:**
  - `window.getState()` / `window.setState()` - Need StateManager instance
  - `window.currentUser` - Reading only (OK for now)
  - `window.currentUrlData` - Reading only (OK for now)
  - `api` - Need to import APIModule
  - Various helper functions - Need to find/import

### Key Findings

#### Boundary Normalization Strategy
- **One-way snake_case** – Snake_case is permitted only at data boundaries (Supabase queries, realtime events, raw API payloads).
- **Immediate normalization** – `APIModule.ts`, `CanopiModule.ts`, and `UserModule.ts` convert external fields to camelCase before anything writes to app state.
- **Window state rule** – Any data persisted on `window.*` (e.g., `currentPresenceData`, `currentVisibilityData`) must be normalized when set so downstream consumers never need fallbacks.
- **Documentation requirement** – Every legitimate snake_case usage must carry a comment such as `// Boundary transform: Supabase → camelCase` to prevent regressions.

#### Defensive Defaults Audit
- **Allowed defaults** – UI resilience patterns (`user.name || 'Unknown'`, `auraColor || '#aaaaaa'`) remain but should be centralized.
- **Identity fallbacks** – `user.id || user.email` indicates missing IDs; prefer a helper (e.g., `getUserIdentity(user)`) so we can retire it once APIs are strict.
- **Content guards** – `message.content || ''` still guards legacy rows; document them and plan for removal once backend guarantees `content`.
- **Action item** – Centralize allowable fallbacks into helper utilities and remove redundant instances during each module conversion.

#### Defensive Fallback Catalogue (NEW)
| Location | Pattern | Purpose | Retirement Plan |
| --- | --- | --- | --- |
| `VisibilityManager.ts` | `formatUserDisplayName(user)` helper (wraps former `name || email || 'Unknown'`) | Display placeholder when profile data missing | Remove helper fallback once profile service guarantees name |
| `VisibilityManager.ts` / `CommunitiesModule.ts` | `getUserIdentity(user)` helper (wraps former `user.id || user.email`) | Ensure stable key when Supabase row lacks `id` (legacy data) | Enforce `id` from backend, then delete helper fallback path |
| `VisibilityManager.ts` | `getAvatarUrlWithFallback`, `getAuraColorValue` helpers | UI placeholder colors/avatars | Replace helper fallback once theme/avatar service guarantees data |
| `CanopiModule.ts` | `ensureMessageContent(message)` helper (replaces `message.content || ''`) | Guard against historical messages missing `content` | Remove helper fallback after data backfill verification |
| `ProvenanceService.ts` | `ensureMessageContent(message)` helper | Ensure hashing works even if content absent | Replace with explicit null-check once backend guarantees |
| `APIModule.ts` / `CanopiModule.ts` | `formatAuthorName(author)` helper | Debug logging clarity when AppUser missing | Remove helper fallback once AppUser join always returns `name` |
| `CanopiModule.ts` | `formatAuthorName` feeding `getSenderInitial` | Provide initials for avatars when author missing | Remove once author identity always present |
| Misc UI components | `getAuraColorValue` helper | Visual fallback | Replace with centralized theme helper (or strict data) |

> **Action:** Each pattern above should be wrapped in a shared helper (`formatUserDisplayName`, `getUserIdentity`, `ensureMessageContent`) so the fallback logic is isolated and easy to delete when backend contracts are strict.

#### StateManager Pattern
- StateManager is instantiated in `sidepanel.js`: `stateManager = new StateManager()`
- `window.getState` and `window.setState` are wrappers: 
  ```javascript
  window.getState = (key) => stateManager.getState(key);
  window.setState = (key, value) => stateManager.setState(key, value);
  ```

#### Dependencies to Resolve
1. **StateManager** - Need singleton instance or import pattern
2. **APIModule** - Need to convert or import `api` object
3. **Helper functions** - `normalizeCurrentUrl()`, `getCurrentUserEmail()`, etc.
4. **Other modules** - Various dependencies throughout

---

## Migration Strategy

### Phase 1: Core Modules (CURRENT)
1. ✅ CanopiModule.ts - DONE
2. 🔄 CommunitiesModule.ts - IN PROGRESS
3. ⏳ StateManager - Need singleton pattern
4. ⏳ APIModule.ts - Convert next

### Phase 2: Main Application
1. ⏳ sidepanel.js → sidepanel.ts - Large file, complex
2. ⏳ Update HTML - Load as ES6 modules

### Phase 3: Feature Modules
1. ⏳ ProfileManager.js → ProfileManager.ts
2. ⏳ UIManager.js → UIManager.ts
3. ⏳ Other feature modules

### Phase 4: Cleanup
1. ⏳ Remove all window exports from compiled JS
2. ⏳ Remove verification scripts
3. ⏳ Final testing

---

## Next Immediate Steps

### 0. Document & Enforce Boundary Rules (NEW)
- ✅ Add boundary-normalization guidance to this summary (done)
- ⏳ Tag every legitimate snake_case usage in code with boundary comments
- ⏳ Normalize `window.currentPresenceData` / `window.currentVisibilityData` at the setter and document the helpers
- ⏳ Update linting/TS config to flag unauthorized snake_case access (see roadmap below)

### 1. Complete CommunitiesModule.ts
- Replace `window.getState()` with StateManager instance
- Replace `window.setState()` with StateManager instance
- Import/find all helper functions
- Add ES6 exports
- Compile and test

### 2. Create StateManager Singleton
- Export singleton instance from StateManager.ts
- Or create getter function
- Update all files to use singleton

### 3. Convert APIModule.js
- Convert to TypeScript
- Export `api` object as ES6 module
- Update imports in CommunitiesModule

---

## Challenges

### 1. Circular Dependencies
- Some modules depend on each other
- Need careful import ordering
- May need dependency injection

### 2. Global State
- `window.currentUser` - Used throughout
- `window.currentUrlData` - Used throughout
- Need to decide: keep as globals or move to StateManager

### 3. Large Files
- `sidepanel.js` is 3400+ lines
- Complex initialization logic
- Many dependencies

### 4. Legacy Code
- Some functions not in modules
- Need to find or recreate
- May need to keep some window globals temporarily

---

## Recommendation

### Continue Migration Incrementally

1. **Complete CommunitiesModule.ts** - Finish current work
2. **Create StateManager singleton** - Solve the getState/setState issue
3. **Convert APIModule.js** - Next critical dependency
4. **Test after each conversion** - Ensure stability
5. **Continue with sidepanel.js** - Biggest challenge

### Alternative: Hybrid Approach

Keep some window globals temporarily:
- `window.currentUser` - Read-only global (OK)
- `window.currentUrlData` - Read-only global (OK)
- Remove all window exports (function exports)
- Use ES6 imports for all functions

This allows gradual migration while maintaining functionality.

---

## Timeline Estimate

- **Complete CommunitiesModule.ts:** 2-3 hours
- **StateManager singleton:** 1 hour
- **Convert APIModule.js:** 2-3 hours
- **Convert sidepanel.js:** 6-8 hours
- **Other modules:** 10-15 hours
- **Testing & cleanup:** 4-6 hours
- **Total:** 25-36 hours

---

## Status: MIGRATION IN PROGRESS

We've started the full migration. The foundation is laid:
- ✅ CanopiModule is pure ES6
- 🔄 CommunitiesModule is being converted
- ⏳ Remaining files to convert

The migration is complex but achievable. We're making progress!

---

## Linting & Enforcement Roadmap

1. **Short term** – Manual boundary comments + documentation (this file & `MIGRATION_PROGRESS.md`).
2. **Medium term** – ESLint rule (custom or `typescript-eslint/no-unsafe-member-access`) configured to flag snake_case property access except in allow-listed boundary modules (`APIModule.ts`, `CanopiModule.ts`, `UserModule.ts`, realtime handlers).
3. **Long term** – Tighten `tsconfig` (`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`) and add codemods to remove legacy defensive fallbacks once backend contracts are strict.
4. **Automation hook** – Pre-commit script to reject `||` chains that reference `_id`, `_at`, `_url`, `_color`, etc., unless the file resides in an approved boundary folder.

