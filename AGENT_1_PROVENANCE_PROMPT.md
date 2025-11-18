# Agent 1: Provenance Files Type Improvement

## Objective
Replace all `(window as any)` usages in provenance-related files with typed assertions.

## Files to Process
1. `presence/src/utils/provenance/ProvenanceService.ts` - 10 occurrences
2. `presence/src/utils/provenance/ProvenanceDiagnostic.ts` - 5 occurrences
3. `presence/src/utils/provenance/init.ts` - 5 occurrences

**Total:** ~20 occurrences

## Instructions

### Step 1: Read and Analyze
1. Read each file to understand the context
2. Identify all `(window as any)` usages
3. Determine what properties are being accessed
4. Check `presence/src/types/global.d.ts` for existing type definitions

### Step 2: Replace Pattern
Replace each `(window as any)` with typed assertions:

```typescript
// Before:
const property = (window as any).property;

// After:
const property = (window as Window & { property?: Type }).property;
```

### Step 3: Type Definitions
- If property exists in `global.d.ts`, use that type
- If property doesn't exist, add it to `global.d.ts` with appropriate type
- For complex types, use `any` (e.g., `property?: any`)

### Step 4: Verify Each File
After each file:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit --skipLibCheck presence/src/utils/provenance/[FILENAME].ts
```
Ensure 0 compilation errors.

### Step 5: Final Verification
After all files:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit --skipLibCheck
grep -c "(window as any)" presence/src/utils/provenance/ProvenanceService.ts
grep -c "(window as any)" presence/src/utils/provenance/ProvenanceDiagnostic.ts
grep -c "(window as any)" presence/src/utils/provenance/init.ts
```

## Examples from Existing Work

### Example 1: Simple Property Access
```typescript
// Before:
const supabase = (window as any).supabase;

// After:
const supabase = (window as Window & { supabase?: any }).supabase;
```

### Example 2: Function Access
```typescript
// Before:
const showNotification = (window as any).showNotification;

// After:
const showNotification = (window as Window & { showNotification?: (message: string, options?: any) => void }).showNotification;
```

### Example 3: Complex Object
```typescript
// Before:
const api = (window as any).api;

// After:
const api = (window as Window & { api?: { request: (url: string) => Promise<any> } }).api;
```

## Constraints
- ✅ Maintain backward compatibility
- ✅ Use typed assertions, not direct Window interface modifications in the file
- ✅ Ensure compilation succeeds
- ✅ Follow existing patterns from CanopiModule.ts and RealtimeManager.ts
- ✅ If adding to `global.d.ts`, check for conflicts first

## Success Criteria
- [ ] All `(window as any)` replaced in ProvenanceService.ts
- [ ] All `(window as any)` replaced in ProvenanceDiagnostic.ts
- [ ] All `(window as any)` replaced in init.ts
- [ ] All files compile without errors
- [ ] No breaking changes introduced
- [ ] Type safety improved

## Report Format
After completion, report:
1. Number of replacements made per file
2. Any properties added to `global.d.ts`
3. Compilation status
4. Final count of remaining `(window as any)` in each file

## Notes
- Check for existing Window interface extensions in `global.d.ts`
- Be careful with property name conflicts
- Use `any` for complex types that are hard to define precisely
- Maintain the same functionality - only improve type safety

