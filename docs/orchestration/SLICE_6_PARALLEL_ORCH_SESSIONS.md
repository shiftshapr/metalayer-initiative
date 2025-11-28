# Slice 6: Frontend Hardcoded URLs - Parallel Orchestration Sessions (7 Sessions)

**Date**: 2025-01-25  
**Status**: Ready for parallel execution  
**JAUmemory Problem ID**: `frontend-hardcoded-urls-2025-01-25` (to be created)  
**Parent Document**: `HARDCODED_URLS_SUMMARY.md`

---

## Instructions for Parallel Execution

Each session should be run independently with the prompt below. All sessions share:
- Same JAUmemory problem ID: `frontend-hardcoded-urls-2025-01-25`
- Same diagnostic script: `presence/src/scripts/diagnose-slice6-frontend-urls.ts`
- Same build command: `npm run build:presence`
- Same migration pattern: Replace hardcoded URLs with `API_CONFIG` from `../core/APIConfig.js`

After all 7 sessions complete, run final verification:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsx presence/src/scripts/diagnose-slice6-frontend-urls.ts
```

---

## Session 1: APIModule.ts (11 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Replace hardcoded URLs in APIModule.ts (11 hardcoded URL issues).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: frontend-hardcoded-urls-2025-01-25

Tasks:
1. Add API_CONFIG import: import { API_CONFIG } from '../core/APIConfig.js';
2. Replace all hardcoded 'http://216.238.91.120:3002' with API_CONFIG.baseUrl or API_CONFIG.fallbackUrl
3. Replace endpoint.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002') with API_CONFIG.replaceMetalayerUrl(endpoint)
4. Replace template literals like `http://216.238.91.120:3002${endpoint}` with API_CONFIG.getUrl(endpoint)
5. Replace new MetaLayerAPI('http://216.238.91.120:3002') with new MetaLayerAPI(API_CONFIG.baseUrl)
6. Verify: Run diagnostic script - APIModule.ts should show 0 hardcoded_url issues
7. Build: npm run build:presence
8. Update JAUmemory with completion status

Expected: 11 hardcoded URLs fixed (lines 78, 91, 677, 686, 690)
```

---

## Session 2: APIService.ts (8 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Replace hardcoded URLs in APIService.ts (8 hardcoded URL issues).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: frontend-hardcoded-urls-2025-01-25

Tasks:
1. Add API_CONFIG import: import { API_CONFIG } from '../core/APIConfig.js';
2. Replace all hardcoded 'http://216.238.91.120:3002' with API_CONFIG.baseUrl or API_CONFIG.fallbackUrl
3. Replace endpoint.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002') with API_CONFIG.replaceMetalayerUrl(endpoint)
4. Replace template literals like `http://216.238.91.120:3002${endpoint}` with API_CONFIG.getUrl(endpoint)
5. Replace new MetaLayerAPI('http://216.238.91.120:3002') with new MetaLayerAPI(API_CONFIG.baseUrl)
6. Verify: Run diagnostic script - APIService.ts should show 0 hardcoded_url issues
7. Build: npm run build:presence
8. Update JAUmemory with completion status

Expected: 8 hardcoded URLs fixed (lines 41, 56, 117, 323)
```

---

## Session 3: StateManager.ts (6 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Replace hardcoded URLs in StateManager.ts (6 hardcoded URL issues).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: frontend-hardcoded-urls-2025-01-25

Tasks:
1. Add API_CONFIG import: import { API_CONFIG } from './APIConfig.js';
2. Replace baseUrl: 'http://216.238.91.120:3002' with baseUrl: API_CONFIG.baseUrl
3. Verify: Run diagnostic script - StateManager.ts should show 0 hardcoded_url issues
4. Build: npm run build:presence
5. Update JAUmemory with completion status

Expected: 6 hardcoded URLs fixed (lines 55, 339)
```

---

## Session 4: UnifiedMessageModal.ts (3 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Replace hardcoded URLs in UnifiedMessageModal.ts (3 hardcoded URL issues).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: frontend-hardcoded-urls-2025-01-25

Tasks:
1. Add API_CONFIG import: import { API_CONFIG } from '../core/APIConfig.js';
2. Replace const FALLBACK_API_BASE = 'http://216.238.91.120:3002' with const FALLBACK_API_BASE = API_CONFIG.fallbackUrl
3. Verify: Run diagnostic script - UnifiedMessageModal.ts should show 0 hardcoded_url issues
4. Build: npm run build:presence
5. Update JAUmemory with completion status

Expected: 3 hardcoded URLs fixed (line 1342)
```

---

## Session 5: RealtimeManager.ts (3 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Replace hardcoded URLs in RealtimeManager.ts (3 hardcoded URL issues).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: frontend-hardcoded-urls-2025-01-25

Tasks:
1. Add API_CONFIG import: import { API_CONFIG } from '../core/APIConfig.js';
2. Replace const METALAYER_API_URL = (window as Window & { METALAYER_API_URL?: string }).METALAYER_API_URL || 'http://216.238.91.120:3002' with const METALAYER_API_URL = API_CONFIG.baseUrl
3. Verify: Run diagnostic script - RealtimeManager.ts should show 0 hardcoded_url issues
4. Build: npm run build:presence
5. Update JAUmemory with completion status

Expected: 3 hardcoded URLs fixed (line 1220)
```

---

## Session 6: MessageStore.ts (3 issues)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Replace hardcoded URLs in MessageStore.ts (3 hardcoded URL issues).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: frontend-hardcoded-urls-2025-01-25

Tasks:
1. Add API_CONFIG import: import { API_CONFIG } from '../core/APIConfig.js';
2. Replace const FALLBACK_API_BASE = 'http://216.238.91.120:3002' with const FALLBACK_API_BASE = API_CONFIG.fallbackUrl
3. Verify: Run diagnostic script - MessageStore.ts should show 0 hardcoded_url issues
4. Build: npm run build:presence
5. Update JAUmemory with completion status

Expected: 3 hardcoded URLs fixed (line 38)
```

---

## Session 7: AgentModule.ts (1 issue)

**Orch Prompt:**
```
Orch, initialize orchestration.

Objective: Replace hardcoded URLs in AgentModule.ts (1 hardcoded URL issue).

Enforce .cursorrules: CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Active project = canopi
JAUmemory Problem ID: frontend-hardcoded-urls-2025-01-25

Tasks:
1. Add API_CONFIG import: import { API_CONFIG } from '../core/APIConfig.js';
2. Replace return 'http://216.238.91.120:3002/api/agent' with return API_CONFIG.getUrl('/api/agent')
3. Verify: Run diagnostic script - AgentModule.ts should show 0 hardcoded_url issues
4. Build: npm run build:presence
5. Update JAUmemory with completion status

Expected: 1 hardcoded URL fixed (line 173)
```

---

## Final Verification (After All Sessions Complete)

Once all 7 sessions report completion:

1. **Run diagnostic**:
   ```bash
   cd /home/ubuntu/metalayer-initiative
   npx tsx presence/src/scripts/diagnose-slice6-frontend-urls.ts
   ```

2. **Expected result**: Hardcoded URLs reduced from 35 to 0

3. **Build verification**:
   ```bash
   npm run build:presence
   ```

4. **Update JAUmemory**: Mark problem `frontend-hardcoded-urls-2025-01-25` as solved

5. **Generate final report**: Consolidate all session results into Slice 6 completion report

---

## Migration Pattern Reference

### Pattern 1: Direct URL Replacement
```typescript
// Before
const url = 'http://216.238.91.120:3002';

// After
import { API_CONFIG } from '../core/APIConfig.js';
const url = API_CONFIG.baseUrl;
```

### Pattern 2: Template Literal Replacement
```typescript
// Before
const url = `http://216.238.91.120:3002${endpoint}`;

// After
import { API_CONFIG } from '../core/APIConfig.js';
const url = API_CONFIG.getUrl(endpoint);
```

### Pattern 3: URL Replacement
```typescript
// Before
finalUrl = endpoint.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002');

// After
import { API_CONFIG } from '../core/APIConfig.js';
finalUrl = API_CONFIG.replaceMetalayerUrl(endpoint);
```

### Pattern 4: Fallback Constants
```typescript
// Before
const FALLBACK_API_BASE = 'http://216.238.91.120:3002';

// After
import { API_CONFIG } from '../core/APIConfig.js';
const FALLBACK_API_BASE = API_CONFIG.fallbackUrl;
```

### Pattern 5: Window Configuration
```typescript
// Before
const METALAYER_API_URL = (window as Window & { METALAYER_API_URL?: string }).METALAYER_API_URL || 'http://216.238.91.120:3002';

// After
import { API_CONFIG } from '../core/APIConfig.js';
const METALAYER_API_URL = API_CONFIG.baseUrl;
```

---

*Generated for parallel orchestration - Slice 6 frontend hardcoded URL migration*





