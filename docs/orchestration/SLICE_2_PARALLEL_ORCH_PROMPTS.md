# Slice 2: Parallel Orchestration Prompts (8 Agents)

**Date**: 2025-01-24  
**Status**: Ready for parallel execution  
**Context**: 1,226 console statements remaining across 69 files (57.6% reduction achieved)

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

### Current State (2025-01-24)
- **Total Console Statements**: 1,226
- **Files with Console**: 69
- **Progress**: 57.6% reduction from initial 2,894 statements

---

## Agent 1: ProfileManager.ts - Part 1 (Lines 1-1200)

**Scope**: Complete console.* replacements in ProfileManager.ts, focusing on lines 1-1200

**Files**:
- `presence/src/features/ProfileManager.ts` (lines 1-1200)

**Tasks**:
1. Replace all `console.log` → `Logger.debug(..., null, 'profile')`
2. Replace all `console.warn` → `Logger.warn(..., null, 'profile')`
3. Replace all `console.error` → `Logger.error(..., null, 'profile')`
4. Ensure Logger import exists at top of file (already present)
5. Verify no functionality regressions

**Expected Console Statements**: ~90 statements (approximately 1/3 of 268)

**Context**: Initialization, authentication, profile loading, early UI methods

**Verification**:
- Run: `grep -n "console\." presence/src/features/ProfileManager.ts | wc -l` (should decrease)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `8953a683-96aa-45c3-b36f-7a6db788ca19` with progress

---

## Agent 2: ProfileManager.ts - Part 2 (Lines 1200-2400)

**Scope**: Complete console.* replacements in ProfileManager.ts, focusing on lines 1200-2400

**Files**:
- `presence/src/features/ProfileManager.ts` (lines 1200-2400)

**Tasks**:
1. Replace all `console.log` → `Logger.debug(..., null, 'profile')`
2. Replace all `console.warn` → `Logger.warn(..., null, 'profile')`
3. Replace all `console.error` → `Logger.error(..., null, 'profile')`
4. Ensure Logger import exists at top of file (already present)
5. Verify no functionality regressions

**Expected Console Statements**: ~90 statements (approximately 1/3 of 268)

**Context**: Profile update methods, avatar update logic, aura color fetching, UI updates

**Verification**:
- Run: `grep -n "console\." presence/src/features/ProfileManager.ts | wc -l` (should decrease)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `8953a683-96aa-45c3-b36f-7a6db788ca19` with progress

---

## Agent 3: ProfileManager.ts - Part 3 (Lines 2400-end)

**Scope**: Complete console.* replacements in ProfileManager.ts, focusing on lines 2400 to end of file (3666)

**Files**:
- `presence/src/features/ProfileManager.ts` (lines 2400-3666)

**Tasks**:
1. Replace all `console.log` → `Logger.debug(..., null, 'profile')`
2. Replace all `console.warn` → `Logger.warn(..., null, 'profile')`
3. Replace all `console.error` → `Logger.error(..., null, 'profile')`
4. Ensure Logger import exists at top of file (already present)
5. Verify no functionality regressions

**Expected Console Statements**: ~88 statements (remaining portion of 268)

**Context**: Avatar creation, utility methods, error handlers, cleanup methods, remaining UI methods

**Verification**:
- Run: `grep -n "console\." presence/src/features/ProfileManager.ts | wc -l` (should be 0 after all 3 agents complete)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `8953a683-96aa-45c3-b36f-7a6db788ca19` with progress

---

## Agent 4: MessagesModule.ts (139 statements)

**Scope**: Migrate all console.* calls in MessagesModule.ts to Logger

**Files**:
- `presence/src/features/MessagesModule.ts`

**Tasks**:
1. Add Logger import: `import { Logger } from '../utils/Logger.js';` (if not present)
2. Replace all `console.log` → `Logger.debug(..., null, 'messages')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'messages')`
4. Replace all `console.error` → `Logger.error(..., null, 'messages')`
5. Verify no functionality regressions

**Expected Console Statements**: 139 statements
- console.log: 88
- console.error: 30
- console.warn: 21

**Context**: Message loading, message operations, message display, message creation

**Verification**:
- Run: `grep -n "console\." presence/src/features/MessagesModule.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for MessagesModule.ts migration completion

---

## Agent 5: RealtimeManager.ts (129 statements)

**Scope**: Migrate all console.* calls in RealtimeManager.ts to Logger

**Files**:
- `presence/src/features/RealtimeManager.ts`

**Tasks**:
1. Add Logger import: `import { Logger } from '../utils/Logger.js';` (if not present)
2. Replace all `console.log` → `Logger.debug(..., null, 'realtime')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'realtime')`
4. Replace all `console.error` → `Logger.error(..., null, 'realtime')`
5. Verify no functionality regressions

**Expected Console Statements**: 129 statements
- console.log: 107
- console.error: 16
- console.warn: 6

**Context**: Realtime subscriptions, connection management, event handling, presence tracking

**Verification**:
- Run: `grep -n "console\." presence/src/features/RealtimeManager.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for RealtimeManager.ts migration completion

---

## Agent 6: AuthModule.ts + UserPreferencesManager.ts + APIService.ts

**Scope**: Migrate console.* calls in AuthModule.ts, UserPreferencesManager.ts, and APIService.ts

**Files**:
- `presence/src/features/AuthModule.ts` (~93 statements estimated)
- `presence/src/utils/UserPreferencesManager.ts` (~83 statements estimated)
- `presence/src/services/APIService.ts` (19 statements)

**Tasks**:
1. Add Logger import to each file (if not present)
2. Replace all `console.log` → `Logger.debug(..., null, 'auth'/'preferences'/'api')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'auth'/'preferences'/'api')`
4. Replace all `console.error` → `Logger.error(..., null, 'auth'/'preferences'/'api')`
5. Use 'auth' context for AuthModule.ts
6. Use 'preferences' context for UserPreferencesManager.ts
7. Use 'api' context for APIService.ts
8. Verify no functionality regressions

**Expected Console Statements**: ~195 statements total

**Verification**:
- Run: `grep -n "console\." presence/src/features/AuthModule.ts presence/src/utils/UserPreferencesManager.ts presence/src/services/APIService.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for AuthModule + UserPreferencesManager + APIService migration

---

## Agent 7: AgentModule.ts + APIModule.ts + UnifiedMessageModal.ts

**Scope**: Migrate console.* calls in AgentModule.ts, APIModule.ts, and UnifiedMessageModal.ts

**Files**:
- `presence/src/features/AgentModule.ts` (~72 statements estimated)
- `presence/src/features/APIModule.ts` (~71 statements estimated)
- `presence/src/components/UnifiedMessageModal.ts` (23 statements)

**Tasks**:
1. Add Logger import to each file (if not present)
2. Replace all `console.log` → `Logger.debug(..., null, 'agent'/'api'/'messages')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'agent'/'api'/'messages')`
4. Replace all `console.error` → `Logger.error(..., null, 'agent'/'api'/'messages')`
5. Use 'agent' context for AgentModule.ts
6. Use 'api' context for APIModule.ts
7. Use 'messages' context for UnifiedMessageModal.ts
8. Verify no functionality regressions

**Expected Console Statements**: ~166 statements total

**Verification**:
- Run: `grep -n "console\." presence/src/features/AgentModule.ts presence/src/features/APIModule.ts presence/src/components/UnifiedMessageModal.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, create new memory entry for AgentModule + APIModule + UnifiedMessageModal migration

---

## Agent 8: Remaining High-Priority Files

**Scope**: Migrate console.* calls in remaining high-priority files

**Files** (check diagnostic for exact counts):
- `presence/src/utils/ThemeChangeTracker.ts` (21 statements)
- `presence/src/utils/provenance/ProvenanceService.ts` (18 statements)
- `presence/src/features/DisplayNameManager.ts` (16 statements)
- `presence/src/features/SettingsHeadlineManager.ts` (16 statements)
- `presence/src/features/UserHoverModal.ts` (15 statements)
- `presence/src/utils/UserUtils.ts` (15 statements)
- `presence/src/features/CommunityLoaders.ts` (estimated ~35 statements)
- `presence/src/services/SupabaseService.ts` (estimated ~45 statements)
- `presence/src/utils/UnifiedStorageSync.ts` (estimated ~53 statements)
- Other files with 10+ console statements

**Tasks**:
1. Add Logger import to each file (if not present)
2. Replace all `console.log` → `Logger.debug(..., null, 'appropriate-context')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'appropriate-context')`
4. Replace all `console.error` → `Logger.error(..., null, 'appropriate-context')`
5. Use appropriate context for each file:
   - ThemeChangeTracker.ts → 'theme'
   - ProvenanceService.ts → 'provenance'
   - DisplayNameManager.ts → 'display-name'
   - SettingsHeadlineManager.ts → 'settings'
   - UserHoverModal.ts → 'user-hover'
   - UserUtils.ts → 'user-utils'
   - CommunityLoaders.ts → 'community'
   - SupabaseService.ts → 'supabase'
   - UnifiedStorageSync.ts → 'storage'
   - Others → determine from file purpose
6. Verify no functionality regressions

**Expected Console Statements**: ~200+ statements total

**Verification**:
- Run diagnostic to verify reduction: `npx tsx presence/src/scripts/diagnose-slice2-console-logging.ts`
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

**Expected Result**: 
- Significant reduction in console statements (from 1,226 to < 200, excluding diagnostic scripts)
- ProfileManager.ts: 0 console statements
- MessagesModule.ts: 0 console statements
- RealtimeManager.ts: 0 console statements
- All high-priority files migrated

---

## Notes

- **Diagnostic scripts**: Files in `src/scripts/` may keep console.* (they're not production code)
- **Diagnostic utilities**: Files like `ComprehensiveDiagnostic.ts` and `MESSAGE_LOADING_DIAGNOSTIC.ts` may keep console.* (they're diagnostic utilities)
- **Context consistency**: Use the same context string throughout each file
- **Data handling**: Move data objects to second parameter: `Logger.debug('Message', { data }, 'context')`
- **Error handling**: Pass errors as second parameter: `Logger.error('Message', error, 'context')`
- **Coordination**: Agents 1-3 working on ProfileManager.ts should coordinate to avoid conflicts (work on different line ranges)

---

## Agent Coordination Notes

**ProfileManager.ts Split Strategy**:
- Agent 1: Lines 1-1200 (early methods, initialization)
- Agent 2: Lines 1200-2400 (middle methods, updates)
- Agent 3: Lines 2400-3666 (late methods, utilities)

**File Ownership**:
- Each agent owns specific files to avoid merge conflicts
- ProfileManager.ts is split by line ranges (non-overlapping)
- Other files are assigned to single agents

---

*Generated for parallel orchestration - Slice 2 migration*  
*Current State: 1,226 console statements across 69 files*  
*Target: < 200 console statements (excluding diagnostic scripts)*





