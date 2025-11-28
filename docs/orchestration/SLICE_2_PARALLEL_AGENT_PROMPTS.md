# Slice 2: Parallel Agent Prompts (8 Agents)

**Date**: 2025-01-24  
**Status**: Ready for parallel execution  
**Context**: ProfileManager.ts 58% complete (210/363 remaining), need to complete migration across all files

---

## Shared Context for All Agents

### Problem Memory
- **JAUmemory ID**: `1891c6f4-b65f-4a85-a5b8-76ea56bfdf98`
- **Status**: Implementation in progress
- **Diagnostic**: `presence/src/scripts/diagnose-slice2-console-logging.ts`
- **Pattern**: `console.log → Logger.debug(..., null, 'context')`, `console.warn → Logger.warn(..., null, 'context')`, `console.error → Logger.error(..., null, 'context')`

### Critical Rules
- ✅ **ONLY edit files in `src/`** - NEVER edit `extension/`, `dist/`, or `build/`
- ✅ **Add Logger import** if not present: `import { Logger } from '../utils/Logger.js';`
- ✅ **Use appropriate context** ('profile', 'messages', 'realtime', 'api', 'auth', etc.)
- ✅ **Build after changes**: `npm run build:presence`
- ✅ **Update JAUmemory** with progress after completion

### Migration Pattern
```typescript
// Before
console.log('Message', data);
console.warn('Warning', error);
console.error('Error', error);

// After
Logger.debug('Message', data, 'context');
Logger.warn('Warning', error, 'context');
Logger.error('Error', error, 'context');
```

---

## Agent 1: ProfileManager.ts - Part 1 (Lines 2100-2400)

**Scope**: Complete remaining console.* replacements in ProfileManager.ts, focusing on lines 2100-2400

**Files**:
- `presence/src/features/ProfileManager.ts` (lines 2100-2400)

**Tasks**:
1. Replace all `console.log` → `Logger.debug(..., null, 'profile')`
2. Replace all `console.warn` → `Logger.warn(..., null, 'profile')`
3. Replace all `console.error` → `Logger.error(..., null, 'profile')`
4. Ensure Logger import exists at top of file
5. Verify no functionality regressions

**Expected Console Statements**: ~25-30 statements

**Context**: Profile update methods, avatar update logic, aura color fetching

**Verification**:
- Run: `grep -n "console\." presence/src/features/ProfileManager.ts | wc -l` (should decrease)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `8953a683-96aa-45c3-b36f-7a6db788ca19` with progress

---

## Agent 2: ProfileManager.ts - Part 2 (Lines 2400-2700)

**Scope**: Complete remaining console.* replacements in ProfileManager.ts, focusing on lines 2400-2700

**Files**:
- `presence/src/features/ProfileManager.ts` (lines 2400-2700)

**Tasks**:
1. Replace all `console.log` → `Logger.debug(..., null, 'profile')`
2. Replace all `console.warn` → `Logger.warn(..., null, 'profile')`
3. Replace all `console.error` → `Logger.error(..., null, 'profile')`
4. Ensure Logger import exists at top of file
5. Verify no functionality regressions

**Expected Console Statements**: ~25-30 statements

**Context**: Avatar creation, UI updates, utility methods

**Verification**:
- Run: `grep -n "console\." presence/src/features/ProfileManager.ts | wc -l` (should decrease)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `8953a683-96aa-45c3-b36f-7a6db788ca19` with progress

---

## Agent 3: ProfileManager.ts - Part 3 (Lines 2700-end)

**Scope**: Complete remaining console.* replacements in ProfileManager.ts, focusing on lines 2700 to end of file

**Files**:
- `presence/src/features/ProfileManager.ts` (lines 2700-end)

**Tasks**:
1. Replace all `console.log` → `Logger.debug(..., null, 'profile')`
2. Replace all `console.warn` → `Logger.warn(..., null, 'profile')`
3. Replace all `console.error` → `Logger.error(..., null, 'profile')`
4. Ensure Logger import exists at top of file
5. Verify no functionality regressions

**Expected Console Statements**: ~25-30 statements

**Context**: Remaining utility methods, error handlers, cleanup methods

**Verification**:
- Run: `grep -n "console\." presence/src/features/ProfileManager.ts | wc -l` (should decrease)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `8953a683-96aa-45c3-b36f-7a6db788ca19` with progress

---

## Agent 4: MessagesModule.ts (164 statements)

**Scope**: Migrate all console.* calls in MessagesModule.ts to Logger

**Files**:
- `presence/src/features/MessagesModule.ts`

**Tasks**:
1. Add Logger import: `import { Logger } from '../utils/Logger.js';`
2. Replace all `console.log` → `Logger.debug(..., null, 'messages')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'messages')`
4. Replace all `console.error` → `Logger.error(..., null, 'messages')`
5. Verify no functionality regressions

**Expected Console Statements**: 164 statements

**Context**: Message loading, message operations, message display

**Verification**:
- Run: `grep -n "console\." presence/src/features/MessagesModule.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for MessagesModule.ts migration completion

---

## Agent 5: RealtimeManager.ts (137 statements)

**Scope**: Migrate all console.* calls in RealtimeManager.ts to Logger

**Files**:
- `presence/src/features/RealtimeManager.ts`

**Tasks**:
1. Add Logger import: `import { Logger } from '../utils/Logger.js';`
2. Replace all `console.log` → `Logger.debug(..., null, 'realtime')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'realtime')`
4. Replace all `console.error` → `Logger.error(..., null, 'realtime')`
5. Verify no functionality regressions

**Expected Console Statements**: 137 statements

**Context**: Realtime subscriptions, connection management, event handling

**Verification**:
- Run: `grep -n "console\." presence/src/features/RealtimeManager.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for RealtimeManager.ts migration completion

---

## Agent 6: AuthModule.ts + UserPreferencesManager.ts (93 + 83 = 176 statements)

**Scope**: Migrate console.* calls in AuthModule.ts and UserPreferencesManager.ts

**Files**:
- `presence/src/features/AuthModule.ts` (93 statements)
- `presence/src/utils/UserPreferencesManager.ts` (83 statements)

**Tasks**:
1. Add Logger import to both files
2. Replace all `console.log` → `Logger.debug(..., null, 'auth'/'preferences')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'auth'/'preferences')`
4. Replace all `console.error` → `Logger.error(..., null, 'auth'/'preferences')`
5. Use 'auth' context for AuthModule.ts
6. Use 'preferences' context for UserPreferencesManager.ts
7. Verify no functionality regressions

**Expected Console Statements**: 176 statements total

**Verification**:
- Run: `grep -n "console\." presence/src/features/AuthModule.ts presence/src/utils/UserPreferencesManager.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for AuthModule + UserPreferencesManager migration

---

## Agent 7: AgentModule.ts + APIModule.ts (72 + 71 = 143 statements)

**Scope**: Migrate console.* calls in AgentModule.ts and APIModule.ts

**Files**:
- `presence/src/features/AgentModule.ts` (72 statements)
- `presence/src/features/APIModule.ts` (71 statements)

**Tasks**:
1. Add Logger import to both files
2. Replace all `console.log` → `Logger.debug(..., null, 'agent'/'api')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'agent'/'api')`
4. Replace all `console.error` → `Logger.error(..., null, 'agent'/'api')`
5. Use 'agent' context for AgentModule.ts
6. Use 'api' context for APIModule.ts
7. Verify no functionality regressions

**Expected Console Statements**: 143 statements total

**Verification**:
- Run: `grep -n "console\." presence/src/features/AgentModule.ts presence/src/features/APIModule.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for AgentModule + APIModule migration

---

## Agent 8: Remaining High-Priority Files (CommunityLoaders + SupabaseService + Others)

**Scope**: Migrate console.* calls in remaining high-priority files

**Files**:
- `presence/src/features/CommunityLoaders.ts` (35 statements)
- `presence/src/services/SupabaseService.ts` (45 statements)
- `presence/src/utils/UnifiedStorageSync.ts` (53 statements)
- Other files with 20+ console statements (check diagnostic output)

**Tasks**:
1. Add Logger import to each file
2. Replace all `console.log` → `Logger.debug(..., null, 'appropriate-context')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'appropriate-context')`
4. Replace all `console.error` → `Logger.error(..., null, 'appropriate-context')`
5. Use appropriate context for each file (e.g., 'community', 'supabase', 'storage')
6. Verify no functionality regressions

**Expected Console Statements**: ~150+ statements total

**Context Selection**:
- CommunityLoaders.ts → 'community'
- SupabaseService.ts → 'supabase'
- UnifiedStorageSync.ts → 'storage'
- Others → determine from file purpose

**Verification**:
- Run: `grep -n "console\." presence/src/features/CommunityLoaders.ts presence/src/services/SupabaseService.ts presence/src/utils/UnifiedStorageSync.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for remaining files migration

---

## Success Criteria for All Agents

1. ✅ All console.* statements replaced with Logger.*
2. ✅ Logger import added to file(s)
3. ✅ Appropriate context used for each file
4. ✅ TypeScript compilation succeeds: `npm run build:presence`
5. ✅ No functionality regressions
6. ✅ JAUmemory updated with completion status

## Final Verification (After All Agents Complete)

Run diagnostic to verify progress:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsx presence/src/scripts/diagnose-slice2-console-logging.ts
```

Expected result: Significant reduction in console statements (from 2,894 to < 500, excluding diagnostic scripts)

---

## Notes

- **Diagnostic scripts**: Files in `src/scripts/` may keep console.* (they're not production code)
- **Context consistency**: Use the same context string throughout each file
- **Data handling**: Move data objects to second parameter: `Logger.debug('Message', { data }, 'context')`
- **Error handling**: Pass errors as second parameter: `Logger.error('Message', error, 'context')`

---

*Generated for parallel orchestration - Slice 2 migration*






