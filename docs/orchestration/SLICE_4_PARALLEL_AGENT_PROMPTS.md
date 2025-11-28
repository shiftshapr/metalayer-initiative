# Slice 4: Parallel Agent Prompts (8 Agents)

**Date**: 2025-01-24  
**Status**: Ready for parallel execution  
**Context**: Slice 2 partially completed (ProfileManager.ts 47%), Slice 4 targets remaining high-priority files  
**JAUmemory Problem ID**: `cd4f8be2-828c-41de-99ac-181eaf868aad`

---

## Shared Context for All Agents

### Problem Memory
- **JAUmemory ID**: `cd4f8be2-828c-41de-99ac-181eaf868aad`
- **Status**: Implementation in progress
- **Diagnostic**: `presence/src/scripts/diagnose-slice2-console-logging.ts`
- **Pattern**: `console.log → Logger.debug(..., null, 'context')`, `console.warn → Logger.warn(..., null, 'context')`, `console.error → Logger.error(..., null, 'context')`
- **Current State**: 1,517 console statements remaining across 76 files (down from 2,894)

### Critical Rules
- ✅ **ONLY edit files in `src/`** - NEVER edit `extension/`, `dist/`, or `build/`
- ✅ **Add Logger import** if not present: `import { Logger } from '../utils/Logger.js';`
- ✅ **Use appropriate context** ('profile', 'messages', 'realtime', 'api', 'auth', etc.)
- ✅ **Build after changes**: `npm run build:presence`
- ✅ **Update JAUmemory** with progress after completion
- ✅ **Exclude diagnostic scripts** - Files in `src/scripts/` and `src/utils/*DIAGNOSTIC*.ts` may keep console.* (they're not production code)

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

## Agent 1: MessagesModule.ts (141 statements)

**Scope**: Migrate all console.* calls in MessagesModule.ts to Logger

**Files**:
- `presence/src/features/MessagesModule.ts`

**Tasks**:
1. Add Logger import: `import { Logger } from '../utils/Logger.js';`
2. Replace all `console.log` → `Logger.debug(..., null, 'messages')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'messages')`
4. Replace all `console.error` → `Logger.error(..., null, 'messages')`
5. Verify no functionality regressions

**Expected Console Statements**: 141 statements
- console.log: 89
- console.error: 31
- console.warn: 21

**Context**: Message loading, message operations, message display

**Verification**:
- Run: `grep -n "console\." presence/src/features/MessagesModule.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `cd4f8be2-828c-41de-99ac-181eaf868aad` with progress

---

## Agent 2: RealtimeManager.ts (129 statements)

**Scope**: Migrate all console.* calls in RealtimeManager.ts to Logger

**Files**:
- `presence/src/features/RealtimeManager.ts`

**Tasks**:
1. Add Logger import: `import { Logger } from '../utils/Logger.js';`
2. Replace all `console.log` → `Logger.debug(..., null, 'realtime')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'realtime')`
4. Replace all `console.error` → `Logger.error(..., null, 'realtime')`
5. Verify no functionality regressions

**Expected Console Statements**: 129 statements
- console.log: 107
- console.error: 16
- console.warn: 6

**Context**: Realtime subscriptions, connection management, event handling

**Verification**:
- Run: `grep -n "console\." presence/src/features/RealtimeManager.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `cd4f8be2-828c-41de-99ac-181eaf868aad` with progress

---

## Agent 3: AuthModule.ts + UserPreferencesManager.ts (82 + 75 = 157 statements)

**Scope**: Migrate console.* calls in AuthModule.ts and UserPreferencesManager.ts

**Files**:
- `presence/src/features/AuthModule.ts` (82 statements)
- `presence/src/utils/UserPreferencesManager.ts` (75 statements)

**Tasks**:
1. Add Logger import to both files
2. Replace all `console.log` → `Logger.debug(..., null, 'auth'/'preferences')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'auth'/'preferences')`
4. Replace all `console.error` → `Logger.error(..., null, 'auth'/'preferences')`
5. Use 'auth' context for AuthModule.ts
6. Use 'preferences' context for UserPreferencesManager.ts
7. Verify no functionality regressions

**Expected Console Statements**: 157 statements total
- AuthModule.ts: 82 (64 log, 14 error, 4 warn)
- UserPreferencesManager.ts: 75 (63 log, 4 error, 8 warn)

**Verification**:
- Run: `grep -n "console\." presence/src/features/AuthModule.ts presence/src/utils/UserPreferencesManager.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `cd4f8be2-828c-41de-99ac-181eaf868aad` with progress

---

## Agent 4: AgentModule.ts + APIModule.ts (70 + 63 = 133 statements)

**Scope**: Migrate console.* calls in AgentModule.ts and APIModule.ts

**Files**:
- `presence/src/features/AgentModule.ts` (70 statements)
- `presence/src/features/APIModule.ts` (63 statements)

**Tasks**:
1. Add Logger import to both files
2. Replace all `console.log` → `Logger.debug(..., null, 'agent'/'api')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'agent'/'api')`
4. Replace all `console.error` → `Logger.error(..., null, 'agent'/'api')`
5. Use 'agent' context for AgentModule.ts
6. Use 'api' context for APIModule.ts
7. Verify no functionality regressions

**Expected Console Statements**: 133 statements total
- AgentModule.ts: 70 (63 log, 6 error, 1 warn)
- APIModule.ts: 63 (55 log, 3 error, 5 warn)

**Verification**:
- Run: `grep -n "console\." presence/src/features/AgentModule.ts presence/src/features/APIModule.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `cd4f8be2-828c-41de-99ac-181eaf868aad` with progress

---

## Agent 5: CommunityLoaders.ts + SupabaseService.ts + UnifiedStorageSync.ts (37 + 40 + 37 = 114 statements)

**Scope**: Migrate console.* calls in CommunityLoaders.ts, SupabaseService.ts, and UnifiedStorageSync.ts

**Files**:
- `presence/src/features/CommunityLoaders.ts` (37 statements)
- `presence/src/services/SupabaseService.ts` (40 statements)
- `presence/src/utils/UnifiedStorageSync.ts` (37 statements)

**Tasks**:
1. Add Logger import to each file
2. Replace all `console.log` → `Logger.debug(..., null, 'appropriate-context')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'appropriate-context')`
4. Replace all `console.error` → `Logger.error(..., null, 'appropriate-context')`
5. Use appropriate context for each file
6. Verify no functionality regressions

**Expected Console Statements**: 114 statements total
- CommunityLoaders.ts: 37 (33 log, 4 warn)
- SupabaseService.ts: 40 (36 log, 2 warn, 2 error)
- UnifiedStorageSync.ts: 37 (29 log, 7 error, 1 warn)

**Context Selection**:
- CommunityLoaders.ts → 'community'
- SupabaseService.ts → 'supabase'
- UnifiedStorageSync.ts → 'storage'

**Verification**:
- Run: `grep -n "console\." presence/src/features/CommunityLoaders.ts presence/src/services/SupabaseService.ts presence/src/utils/UnifiedStorageSync.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `cd4f8be2-828c-41de-99ac-181eaf868aad` with progress

---

## Agent 6: Remaining High-Priority Files - Part 1 (APIService + Components)

**Scope**: Migrate console.* calls in APIService.ts and component files

**Files**:
- `presence/src/services/APIService.ts` (19 statements)
- `presence/src/components/UnifiedMessageModal.ts` (23 statements)
- `presence/src/components/UnifiedMessageDisplay.ts` (10 statements)
- `presence/src/components/MessageLoader.ts` (1 statement)

**Tasks**:
1. Add Logger import to each file
2. Replace all `console.log` → `Logger.debug(..., null, 'appropriate-context')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'appropriate-context')`
4. Replace all `console.error` → `Logger.error(..., null, 'appropriate-context')`
5. Use appropriate context for each file
6. Verify no functionality regressions

**Expected Console Statements**: ~53 statements total

**Context Selection**:
- APIService.ts → 'api'
- UnifiedMessageModal.ts → 'messages'
- UnifiedMessageDisplay.ts → 'messages'
- MessageLoader.ts → 'messages'

**Verification**:
- Run: `grep -n "console\." presence/src/services/APIService.ts presence/src/components/*.ts | wc -l` (should be 0)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `cd4f8be2-828c-41de-99ac-181eaf868aad` with progress

---

## Agent 7: Remaining High-Priority Files - Part 2 (Core + Utils)

**Scope**: Migrate console.* calls in core and utility files

**Files**:
- `presence/src/core/StateManager.ts` (7 statements)
- `presence/src/core/DependencyContainer.ts` (3 statements)
- `presence/src/core/UnifiedContextMenu.ts` (3 statements)
- `presence/src/core/CursorParkManager.ts` (6 statements)
- `presence/src/utils/UnifiedMessageRenderer.ts` (7 statements)
- `presence/src/utils/ReplyLoader.ts` (4 statements)
- `presence/src/utils/UserUtils.ts` (15 statements)
- `presence/src/utils/UrlUtils.ts` (6 statements)

**Tasks**:
1. Add Logger import to each file
2. Replace all `console.log` → `Logger.debug(..., null, 'appropriate-context')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'appropriate-context')`
4. Replace all `console.error` → `Logger.error(..., null, 'appropriate-context')`
5. Use appropriate context for each file
6. Verify no functionality regressions

**Expected Console Statements**: ~51 statements total

**Context Selection**:
- StateManager.ts → 'state'
- DependencyContainer.ts → 'core'
- UnifiedContextMenu.ts → 'ui'
- CursorParkManager.ts → 'cursor'
- UnifiedMessageRenderer.ts → 'messages'
- ReplyLoader.ts → 'messages'
- UserUtils.ts → 'user'
- UrlUtils.ts → 'utils'

**Verification**:
- Run: `grep -n "console\." presence/src/core/*.ts presence/src/utils/*.ts | wc -l` (should be 0, excluding diagnostic files)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `cd4f8be2-828c-41de-99ac-181eaf868aad` with progress

---

## Agent 8: Remaining High-Priority Files - Part 3 (Features + Services)

**Scope**: Migrate console.* calls in remaining feature and service files

**Files**:
- `presence/src/features/PeopleModule.ts` (14 statements)
- `presence/src/features/DisplayNameManager.ts` (16 statements)
- `presence/src/features/SettingsHeadlineManager.ts` (16 statements)
- `presence/src/features/UserHoverModal.ts` (15 statements)
- `presence/src/features/AuthManager.ts` (6 statements)
- `presence/src/services/MessageStore.ts` (6 statements)
- `presence/src/services/RealtimeSubscriptionService.ts` (8 statements)
- `presence/src/services/MessageActionListenersService.ts` (8 statements)
- `presence/src/services/MessageRendererService.ts` (5 statements)
- `presence/src/services/MessageLoadingService.ts` (2 statements)

**Tasks**:
1. Add Logger import to each file
2. Replace all `console.log` → `Logger.debug(..., null, 'appropriate-context')`
3. Replace all `console.warn` → `Logger.warn(..., null, 'appropriate-context')`
4. Replace all `console.error` → `Logger.error(..., null, 'appropriate-context')`
5. Use appropriate context for each file
6. Verify no functionality regressions

**Expected Console Statements**: ~96 statements total

**Context Selection**:
- PeopleModule.ts → 'people'
- DisplayNameManager.ts → 'display'
- SettingsHeadlineManager.ts → 'settings'
- UserHoverModal.ts → 'ui'
- AuthManager.ts → 'auth'
- MessageStore.ts → 'messages'
- RealtimeSubscriptionService.ts → 'realtime'
- MessageActionListenersService.ts → 'messages'
- MessageRendererService.ts → 'messages'
- MessageLoadingService.ts → 'messages'

**Verification**:
- Run: `grep -n "console\." presence/src/features/*.ts presence/src/services/*.ts | wc -l` (should be 0, excluding diagnostic files)
- Build: `npm run build:presence`
- Check: No TypeScript errors

**JAUmemory Update**: After completion, update memory `cd4f8be2-828c-41de-99ac-181eaf868aad` with progress

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

Expected result: Significant reduction in console statements (from 1,517 to < 200, excluding diagnostic scripts)

---

## Notes

- **Diagnostic scripts**: Files in `src/scripts/` and `src/utils/*DIAGNOSTIC*.ts` may keep console.* (they're not production code)
- **Context consistency**: Use the same context string throughout each file
- **Data handling**: Move data objects to second parameter: `Logger.debug('Message', { data }, 'context')`
- **Error handling**: Pass errors as second parameter: `Logger.error('Message', error, 'context')`
- **Exclude patterns**: Do not migrate diagnostic files, test files, or build scripts

---

*Generated for parallel orchestration - Slice 4 migration*






