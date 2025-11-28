# Slice 4: Parallel Orchestration Sessions (8 Sessions)

**Date**: 2025-01-24  
**Status**: Ready for parallel execution  
**JAUmemory Problem ID**: `cd4f8be2-828c-41de-99ac-181eaf868aad`  
**Parent Document**: `SLICE_4_PARALLEL_AGENT_PROMPTS.md`

---

## Instructions for Parallel Execution

Each session should be run independently with the prompt below. All sessions share:
- Same JAUmemory problem ID: `cd4f8be2-828c-41de-99ac-181eaf868aad`
- Same diagnostic script: `presence/src/scripts/diagnose-slice2-console-logging.ts`
- Same build command: `npm run build:presence`
- Same migration pattern: `console.log → Logger.debug(..., null, 'context')`

After all 8 sessions complete, run final verification:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsx presence/src/scripts/diagnose-slice2-console-logging.ts
```

---

## Session 1: MessagesModule.ts (141 statements)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Migrate all console.* calls in MessagesModule.ts to Logger (141 statements).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: cd4f8be2-828c-41de-99ac-181eaf868aad

Tasks:
1. Add Logger import: import { Logger } from '../utils/Logger.js';
2. Replace all console.log → Logger.debug(..., null, 'messages')
3. Replace all console.warn → Logger.warn(..., null, 'messages')
4. Replace all console.error → Logger.error(..., null, 'messages')
5. Verify: grep -n "console\." presence/src/features/MessagesModule.ts | wc -l (should be 0)
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: 141 statements (89 log, 31 error, 21 warn)
```

---

## Session 2: RealtimeManager.ts (129 statements)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Migrate all console.* calls in RealtimeManager.ts to Logger (129 statements).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: cd4f8be2-828c-41de-99ac-181eaf868aad

Tasks:
1. Add Logger import: import { Logger } from '../utils/Logger.js';
2. Replace all console.log → Logger.debug(..., null, 'realtime')
3. Replace all console.warn → Logger.warn(..., null, 'realtime')
4. Replace all console.error → Logger.error(..., null, 'realtime')
5. Verify: grep -n "console\." presence/src/features/RealtimeManager.ts | wc -l (should be 0)
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: 129 statements (107 log, 16 error, 6 warn)
```

---

## Session 3: AuthModule.ts + UserPreferencesManager.ts (157 statements)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Migrate console.* calls in AuthModule.ts (82) and UserPreferencesManager.ts (75) to Logger (157 total statements).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: cd4f8be2-828c-41de-99ac-181eaf868aad

Tasks:
1. Add Logger import to both files: import { Logger } from '../utils/Logger.js';
2. AuthModule.ts: Replace console.* → Logger.*(..., null, 'auth')
3. UserPreferencesManager.ts: Replace console.* → Logger.*(..., null, 'preferences')
4. Verify: grep -n "console\." presence/src/features/AuthModule.ts presence/src/utils/UserPreferencesManager.ts | wc -l (should be 0)
5. Build: npm run build:presence
6. Update JAUmemory with completion status

Expected: AuthModule.ts: 82 (64 log, 14 error, 4 warn), UserPreferencesManager.ts: 75 (63 log, 4 error, 8 warn)
```

---

## Session 4: AgentModule.ts + APIModule.ts (133 statements)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Migrate console.* calls in AgentModule.ts (70) and APIModule.ts (63) to Logger (133 total statements).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: cd4f8be2-828c-41de-99ac-181eaf868aad

Tasks:
1. Add Logger import to both files: import { Logger } from '../utils/Logger.js';
2. AgentModule.ts: Replace console.* → Logger.*(..., null, 'agent')
3. APIModule.ts: Replace console.* → Logger.*(..., null, 'api')
4. Verify: grep -n "console\." presence/src/features/AgentModule.ts presence/src/features/APIModule.ts | wc -l (should be 0)
5. Build: npm run build:presence
6. Update JAUmemory with completion status

Expected: AgentModule.ts: 70 (63 log, 6 error, 1 warn), APIModule.ts: 63 (55 log, 3 error, 5 warn)
```

---

## Session 5: CommunityLoaders.ts + SupabaseService.ts + UnifiedStorageSync.ts (114 statements)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Migrate console.* calls in CommunityLoaders.ts (37), SupabaseService.ts (40), and UnifiedStorageSync.ts (37) to Logger (114 total statements).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: cd4f8be2-828c-41de-99ac-181eaf868aad

Tasks:
1. Add Logger import to each file: import { Logger } from '../utils/Logger.js';
2. CommunityLoaders.ts: Replace console.* → Logger.*(..., null, 'community')
3. SupabaseService.ts: Replace console.* → Logger.*(..., null, 'supabase')
4. UnifiedStorageSync.ts: Replace console.* → Logger.*(..., null, 'storage')
5. Verify: grep -n "console\." presence/src/features/CommunityLoaders.ts presence/src/services/SupabaseService.ts presence/src/utils/UnifiedStorageSync.ts | wc -l (should be 0)
6. Build: npm run build:presence
7. Update JAUmemory with completion status

Expected: CommunityLoaders.ts: 37 (33 log, 4 warn), SupabaseService.ts: 40 (36 log, 2 warn, 2 error), UnifiedStorageSync.ts: 37 (29 log, 7 error, 1 warn)
```

---

## Session 6: APIService.ts + Components (53 statements)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Migrate console.* calls in APIService.ts (19) and component files: UnifiedMessageModal.ts (23), UnifiedMessageDisplay.ts (10), MessageLoader.ts (1) to Logger (53 total statements).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: cd4f8be2-828c-41de-99ac-181eaf868aad

Tasks:
1. Add Logger import to each file: import { Logger } from '../utils/Logger.js';
2. APIService.ts: Replace console.* → Logger.*(..., null, 'api')
3. UnifiedMessageModal.ts: Replace console.* → Logger.*(..., null, 'messages')
4. UnifiedMessageDisplay.ts: Replace console.* → Logger.*(..., null, 'messages')
5. MessageLoader.ts: Replace console.* → Logger.*(..., null, 'messages')
6. Verify: grep -n "console\." presence/src/services/APIService.ts presence/src/components/*.ts | wc -l (should be 0)
7. Build: npm run build:presence
8. Update JAUmemory with completion status

Expected: ~53 statements total
```

---

## Session 7: Core + Utils (51 statements)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Migrate console.* calls in core and utility files: StateManager.ts (7), DependencyContainer.ts (3), UnifiedContextMenu.ts (3), CursorParkManager.ts (6), UnifiedMessageRenderer.ts (7), ReplyLoader.ts (4), UserUtils.ts (15), UrlUtils.ts (6) to Logger (51 total statements).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: cd4f8be2-828c-41de-99ac-181eaf868aad

Tasks:
1. Add Logger import to each file: import { Logger } from '../utils/Logger.js';
2. Use appropriate context for each file (state, core, ui, cursor, messages, user, utils)
3. Replace all console.* → Logger.*(..., null, 'context')
4. Verify: grep -n "console\." presence/src/core/*.ts presence/src/utils/*.ts | wc -l (should be 0, excluding diagnostic files)
5. Build: npm run build:presence
6. Update JAUmemory with completion status

Expected: ~51 statements total
Contexts: StateManager→'state', DependencyContainer→'core', UnifiedContextMenu→'ui', CursorParkManager→'cursor', UnifiedMessageRenderer→'messages', ReplyLoader→'messages', UserUtils→'user', UrlUtils→'utils'
```

---

## Session 8: Features + Services (96 statements)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Migrate console.* calls in remaining feature and service files: PeopleModule.ts (14), DisplayNameManager.ts (16), SettingsHeadlineManager.ts (16), UserHoverModal.ts (15), AuthManager.ts (6), MessageStore.ts (6), RealtimeSubscriptionService.ts (8), MessageActionListenersService.ts (8), MessageRendererService.ts (5), MessageLoadingService.ts (2) to Logger (96 total statements).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: cd4f8be2-828c-41de-99ac-181eaf868aad

Tasks:
1. Add Logger import to each file: import { Logger } from '../utils/Logger.js';
2. Use appropriate context for each file (people, display, settings, ui, auth, messages, realtime)
3. Replace all console.* → Logger.*(..., null, 'context')
4. Verify: grep -n "console\." presence/src/features/*.ts presence/src/services/*.ts | wc -l (should be 0, excluding diagnostic files)
5. Build: npm run build:presence
6. Update JAUmemory with completion status

Expected: ~96 statements total
Contexts: PeopleModule→'people', DisplayNameManager→'display', SettingsHeadlineManager→'settings', UserHoverModal→'ui', AuthManager→'auth', MessageStore→'messages', RealtimeSubscriptionService→'realtime', MessageActionListenersService→'messages', MessageRendererService→'messages', MessageLoadingService→'messages'
```

---

## Final Verification (After All Sessions Complete)

Once all 8 sessions report completion:

1. **Run diagnostic**:
   ```bash
   cd /home/ubuntu/metalayer-initiative
   npx tsx presence/src/scripts/diagnose-slice2-console-logging.ts
   ```

2. **Expected result**: Console statements reduced from 1,517 to < 200 (excluding diagnostic scripts)

3. **Build verification**:
   ```bash
   npm run build:presence
   ```

4. **Update JAUmemory**: Mark problem `cd4f8be2-828c-41de-99ac-181eaf868aad` as solved

5. **Generate final report**: Consolidate all session results into Slice 4 completion report

---

*Generated for parallel orchestration - Slice 4 migration*





