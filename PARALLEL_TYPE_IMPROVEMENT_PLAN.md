# Parallel Type Improvement Plan

**Date:** 2025-01-17  
**Status:** Ready for Parallel Agent Execution

---

## 🎯 Current Status

- **Starting Point:** 265 `(window as any)` occurrences
- **Current Total:** 162 `(window as any)` occurrences
- **Removed:** ~103 occurrences (39% reduction)
- **Compilation:** ✅ 0 errors

---

## 📊 Work Breakdown

### High-Priority Files (Sequential - Keep for Quality Control)
These large files should be handled sequentially to maintain quality and ensure proper Window interface coordination:

1. **CanopiModule.ts** - 38 remaining
   - Complex file with many integrations
   - Requires careful Window interface updates
   - **Recommendation:** Continue sequential work

2. **RealtimeManager.ts** - 26 remaining
   - Critical real-time functionality
   - Requires careful Window interface updates
   - **Recommendation:** Continue sequential work

3. **AuthModule.ts** - 14 remaining
   - Authentication-critical
   - **Recommendation:** Continue sequential work

### Medium-Priority Files (Good for Parallel Work)
These files have 5-10 occurrences and can be handled in parallel:

1. **ProvenanceService.ts** - 10 remaining
2. **VisibilityManager.ts** - 10 remaining
3. **AgentModule.ts** - 10 remaining
4. **UnifiedStorageSync.ts** - 7 remaining
5. **DisplayNameManager.ts** - 7 remaining
6. **SettingsHeadlineManager.ts** - 6 remaining
7. **ProvenanceDiagnostic.ts** - 5 remaining
8. **provenance/init.ts** - 5 remaining

### Low-Priority Files (Excellent for Parallel Work)
These smaller files (1-4 occurrences) are perfect for parallel processing:

- **ProvenanceLinkInjector.ts** - 3 remaining
- **DIAGNOSTIC_LOADING_AND_REPLIES.ts** - 3 remaining
- **CursorVisibilityModule.ts** - 3 remaining
- **ComprehensiveDiagnostic.ts** - 2 remaining
- Plus ~10+ other files with 1-2 occurrences

---

## 🤖 Recommended Agent Strategy

### Option 1: Conservative (Recommended)
**3-4 Agents** working on medium-priority files:
- Agent 1: ProvenanceService.ts + ProvenanceDiagnostic.ts + provenance/init.ts (20 total)
- Agent 2: VisibilityManager.ts + AgentModule.ts (20 total)
- Agent 3: UnifiedStorageSync.ts + DisplayNameManager.ts + SettingsHeadlineManager.ts (20 total)
- Agent 4: All small files (1-4 occurrences each) - batch processing

**Benefits:**
- Lower coordination overhead
- Easier to verify and merge
- Maintains quality control

### Option 2: Aggressive
**6-8 Agents** working on all medium + low priority files:
- More parallelization
- Faster completion
- Higher coordination overhead
- More merge conflicts possible

---

## 📋 Agent Prompt Template

```markdown
# Type Improvement Task: [FILE_NAME]

## Objective
Replace all `(window as any)` usages in `presence/src/[PATH]/[FILE_NAME].ts` with typed assertions using the pattern:
```typescript
const property = (window as Window & { property?: Type }).property;
```

## Current Status
- File: `presence/src/[PATH]/[FILE_NAME].ts`
- Remaining: [N] `(window as any)` occurrences
- Strategy: Typed assertions `(Window & {...})`

## Instructions

1. **Read the file** and identify all `(window as any)` usages
2. **For each usage:**
   - Determine the property name being accessed
   - Determine the expected type (check `global.d.ts` if needed)
   - Replace with typed assertion pattern
   - If property not in `global.d.ts`, add it (or use `any` for complex types)

3. **Pattern Examples:**
   ```typescript
   // Before:
   const api = (window as any).api;
   
   // After:
   const api = (window as Window & { api?: { request: (url: string) => Promise<any> } }).api;
   ```

4. **Verify:**
   - Run: `npx tsc --noEmit --skipLibCheck presence/src/[PATH]/[FILE_NAME].ts`
   - Ensure 0 compilation errors
   - Ensure all `(window as any)` replaced

5. **Report:**
   - Number of replacements made
   - Any properties added to `global.d.ts`
   - Compilation status

## Constraints
- ✅ Maintain backward compatibility
- ✅ Use typed assertions, not direct Window interface modifications
- ✅ Ensure compilation succeeds
- ✅ Follow existing patterns in CanopiModule.ts and RealtimeManager.ts

## Success Criteria
- [ ] All `(window as any)` replaced
- [ ] File compiles without errors
- [ ] No breaking changes
- [ ] Type safety improved
```

---

## 🔄 Coordination Requirements

### Window Interface Updates
When agents add new properties to `global.d.ts`:
1. Check if property already exists
2. If not, add with appropriate type
3. Use `any` for complex types that are hard to define
4. Document in commit message

### Compilation Checks
- Each agent should verify their file compiles
- Final merge should run full compilation check
- Resolve any conflicts before merging

---

## ✅ Verification Checklist

After all agents complete:
- [ ] Run full compilation: `npx tsc --noEmit --skipLibCheck`
- [ ] Count remaining: `grep -r "(window as any)" presence/src/ --include="*.ts" | wc -l`
- [ ] Verify no breaking changes
- [ ] Update progress report

---

## 📈 Expected Outcomes

### With 3-4 Agents (Conservative)
- **Time:** 1-2 hours
- **Files Completed:** ~15-20 files
- **Occurrences Removed:** ~60-80
- **Final Total:** ~80-100 remaining
- **Reduction:** ~60-65% total

### With 6-8 Agents (Aggressive)
- **Time:** 30-60 minutes
- **Files Completed:** ~25-30 files
- **Occurrences Removed:** ~80-100
- **Final Total:** ~60-80 remaining
- **Reduction:** ~70-75% total

---

## 🎯 Recommendation

**YES, spin up 3-4 agents** to handle medium-priority files in parallel. This will:
- ✅ Speed up completion significantly
- ✅ Maintain quality control
- ✅ Allow sequential work on high-priority files
- ✅ Minimize coordination overhead

**Keep sequential work** on:
- CanopiModule.ts
- RealtimeManager.ts
- AuthModule.ts

These are complex and benefit from careful, sequential improvement.

---

*Plan created: 2025-01-17*

