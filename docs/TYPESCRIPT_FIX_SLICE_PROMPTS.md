# TypeScript Fix Slice Prompts
## Canopi Project - Parallel Execution Prompts

**Date**: 2025-01-24  
**Project**: canopi (metalayer-initiative)  
**Status**: READY FOR EXECUTION

---

## Shared Context (All Sessions)

**Problem Memory ID**: Created in JAUmemory  
**Audit Report**: `docs/TYPESCRIPT_AUDIT_REPORT.md`  
**Orchestration Plan**: `docs/ORCHESTRATION_PLAN_TYPESCRIPT_AUDIT.md`

**Critical Rules**:
- NEVER edit `extension/`, `dist/`, `build/`. Edit `src/` only.
- Build required: `npm run build:presence` after changes
- TypeScript ES6 modules only. No CommonJS.
- No pre-launch backward-compat. Remove duplicates.
- Document in JAUmemory. No markdown in dist.
- Commit on resolution.

**Workflow**: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

**Before Starting**: Search JAUmemory for existing problem memories. Create/update if missing (status=identified).

---

## Assessment: Parallelization Not Recommended

**Finding**: The TypeScript audit revealed only **1 minor issue** requiring a single file migration (~35 lines).

**Recommendation**: Execute as **single sequential task** rather than parallel slices.

**Reasoning**:
- Single file migration is too small to parallelize
- Estimated time: < 30 minutes
- No benefit from parallelization
- Sequential execution is simpler and faster

---

## Alternative: Single Comprehensive Prompt

Since parallelization is not recommended, here is a **single comprehensive prompt** for the fix:

---

## PROMPT: Migrate getActiveSidepanelTab.js to TypeScript

**Scope**: Migrate single JavaScript file to TypeScript

**Files Affected**:
- `presence/src/utils/getActiveSidepanelTab.js` (to be migrated)
- `presence/src/utils/getActiveSidepanelTab.d.ts` (to be removed - types will be in .ts)

**Tasks**:

1. **Before Starting**:
   - Search JAUmemory for existing problem memories
   - Create/update problem memory if missing (status=identified)
   - Read audit report and orchestration plan

2. **SD Phase - Diagnostic Scripts**:
   - Create `scripts/diagnose-js-files-in-src.ts`:
     - Find all `.js` files in `presence/src/` (excluding `scripts/`)
     - Report files that should be migrated
   - Create `scripts/diagnose-type-safety.ts`:
     - Check for `any` types
     - Check for type suppressions
   - Run diagnostics before implementation

3. **Implementation**:
   - Read `presence/src/utils/getActiveSidepanelTab.js`
   - Read `presence/src/utils/getActiveSidepanelTab.d.ts`
   - Create `presence/src/utils/getActiveSidepanelTab.ts`:
     ```typescript
     /**
      * Get the currently active sidepanel tab
      * Shared utility to prevent message loading on visibility tab
      * 
      * @returns Tab ID string or null if not found
      */
     export function getActiveSidepanelTab(): string | null {
       if (typeof document === 'undefined') {
         return null;
       }
       
       // Check tabContextManager first
       const win = typeof window !== 'undefined' ? window : null;
       if (win?.tabContextManager?.getActiveTab) {
         const activeTab = win.tabContextManager.getActiveTab();
         if (activeTab) {
           return activeTab;
         }
       }
       
       // Fallback: check DOM for active tab
       const activeTab = document.querySelector('.main-nav-tab.active');
       const tabId = activeTab?.getAttribute('data-tab');
       return tabId || null;
     }
     
     /**
      * Check if visibility tab is active
      * 
      * @returns True if visibility tab is active
      */
     export function isVisibilityTabActive(): boolean {
       return getActiveSidepanelTab() === 'visibility-tab';
     }
     ```
   - Add proper type annotations:
     - Return type: `string | null` for `getActiveSidepanelTab()`
     - Return type: `boolean` for `isVisibilityTabActive()`
     - Type window access properly
   - Delete `getActiveSidepanelTab.js`
   - Delete `getActiveSidepanelTab.d.ts` (types now in `.ts`)

4. **Verification**:
   - Run `npm run build:presence` to verify build
   - Run `npx tsc --noEmit` to verify TypeScript compilation
   - Check for any broken imports
   - Verify functionality (manual testing)

5. **Update JAUmemory**:
   - Update problem memory with status: `implemented`
   - Document changes made
   - Link diagnostic script results
   - Record verification results

6. **Continue Workflow**:
   - TEST: Run diagnostics after implementation
   - RED: Security audit
   - WHITE: Code review
   - PURPLE: Integration testing
   - BLINDSPOT: Blindspot audit
   - BLUE: Final approval
   - LEARNING: Document patterns
   - META: Evaluate learning
   - DEVOPS: Verify CI/CD
   - ETHICS: Ethics review

**Success Criteria**:
- [ ] `.ts` file created with proper types
- [ ] `.js` file deleted
- [ ] `.d.ts` file deleted
- [ ] Build succeeds
- [ ] TypeScript compilation passes
- [ ] No broken imports
- [ ] Functionality verified
- [ ] JAUmemory updated
- [ ] All workflow phases complete

---

## If User Insists on Parallelization

If the user still wants parallel slices despite the recommendation, here are **2 minimal slices**:

### SLICE 1: Diagnostic Scripts
- Create all diagnostic scripts
- Run diagnostics
- Document findings

### SLICE 2: File Migration
- Migrate the file
- Verify build
- Update JAUmemory

**Note**: Even with 2 slices, the effort is minimal and parallelization provides little benefit.

---

## Execution Instructions

**Recommended Approach**: Execute as **single sequential task**

1. Run diagnostic scripts
2. Migrate file
3. Verify build
4. Complete workflow phases
5. Update JAUmemory
6. Generate final report

**Estimated Time**: < 30 minutes total

---

**Status**: ✅ **PROMPTS READY**  
**Recommendation**: Single sequential execution  
**Alternative**: 2 minimal slices (if user insists)



