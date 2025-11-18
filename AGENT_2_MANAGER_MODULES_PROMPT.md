# Agent 2: Manager Modules Type Improvement

## Objective
Replace all `(window as any)` usages in manager modules with typed assertions.

## Files to Process
1. `presence/src/features/VisibilityManager.ts` - 10 occurrences
2. `presence/src/features/AgentModule.ts` - 10 occurrences

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
npx tsc --noEmit --skipLibCheck presence/src/features/[FILENAME].ts
```
Ensure 0 compilation errors.

### Step 5: Final Verification
After all files:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit --skipLibCheck
grep -c "(window as any)" presence/src/features/VisibilityManager.ts
grep -c "(window as any)" presence/src/features/AgentModule.ts
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
const refreshVisibilityAvatars = (window as any).refreshVisibilityAvatars;

// After:
const refreshVisibilityAvatars = (window as Window & { refreshVisibilityAvatars?: () => Promise<void> }).refreshVisibilityAvatars;
```

### Example 3: Complex Object with Methods
```typescript
// Before:
const uiManager = (window as any).uiManager;

// After:
const uiManager = (window as Window & { uiManager?: { switchTab?: (tab: string) => void } }).uiManager;
```

## Common Patterns in Manager Modules

### Pattern 1: Current User Access
```typescript
// Before:
const currentUser = (window as any).currentUser;

// After:
const currentUser = (window as Window & { currentUser?: User | null }).currentUser;
```

### Pattern 2: State Management
```typescript
// Before:
const getState = (window as any).getState;

// After:
const getState = (window as Window & { getState?: (key: string) => Promise<any> }).getState;
```

### Pattern 3: API Access
```typescript
// Before:
const api = (window as any).api;

// After:
const api = (window as Window & { api?: any }).api;
```

## Constraints
- ✅ Maintain backward compatibility
- ✅ Use typed assertions, not direct Window interface modifications in the file
- ✅ Ensure compilation succeeds
- ✅ Follow existing patterns from CanopiModule.ts and RealtimeManager.ts
- ✅ If adding to `global.d.ts`, check for conflicts first

## Success Criteria
- [ ] All `(window as any)` replaced in VisibilityManager.ts
- [ ] All `(window as any)` replaced in AgentModule.ts
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
- Manager modules often access UI state and user data
- Check for existing Window interface extensions in `global.d.ts`
- Be careful with property name conflicts
- Use `any` for complex types that are hard to define precisely
- Maintain the same functionality - only improve type safety

