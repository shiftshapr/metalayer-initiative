# Agent 3: Storage & Display Modules Type Improvement

## Objective
Replace all `(window as any)` usages in storage and display-related modules with typed assertions.

## Files to Process
1. `presence/src/utils/UnifiedStorageSync.ts` - 7 occurrences
2. `presence/src/features/DisplayNameManager.ts` - 7 occurrences
3. `presence/src/features/SettingsHeadlineManager.ts` - 6 occurrences

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
npx tsc --noEmit --skipLibCheck presence/src/[PATH]/[FILENAME].ts
```
Ensure 0 compilation errors.

### Step 5: Final Verification
After all files:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit --skipLibCheck
grep -c "(window as any)" presence/src/utils/UnifiedStorageSync.ts
grep -c "(window as any)" presence/src/features/DisplayNameManager.ts
grep -c "(window as any)" presence/src/features/SettingsHeadlineManager.ts
```

## Examples from Existing Work

### Example 1: Storage Access
```typescript
// Before:
const getState = (window as any).getState;

// After:
const getState = (window as Window & { getState?: (key: string) => Promise<any> }).getState;
```

### Example 2: User Data Access
```typescript
// Before:
const currentUser = (window as any).currentUser;

// After:
const currentUser = (window as Window & { currentUser?: User | null }).currentUser;
```

### Example 3: Settings/Preferences
```typescript
// Before:
const updateUI = (window as any).updateUI;

// After:
const updateUI = (window as Window & { updateUI?: (user?: any) => Promise<void> | void }).updateUI;
```

## Common Patterns in Storage & Display Modules

### Pattern 1: State Management
```typescript
// Before:
const setState = (window as any).setState;

// After:
const setState = (window as Window & { setState?: (key: string, value: any) => Promise<void> }).setState;
```

### Pattern 2: User Preferences
```typescript
// Before:
const authManager = (window as any).authManager;

// After:
const authManager = (window as Window & { authManager?: { getCurrentUser: () => Promise<any>; updateUserProfile: (profile: any) => void } }).authManager;
```

### Pattern 3: UI Updates
```typescript
// Before:
const refreshUserAvatar = (window as any).refreshUserAvatar;

// After:
const refreshUserAvatar = (window as Window & { refreshUserAvatar?: () => void }).refreshUserAvatar;
```

## Constraints
- ✅ Maintain backward compatibility
- ✅ Use typed assertions, not direct Window interface modifications in the file
- ✅ Ensure compilation succeeds
- ✅ Follow existing patterns from CanopiModule.ts and RealtimeManager.ts
- ✅ If adding to `global.d.ts`, check for conflicts first

## Success Criteria
- [ ] All `(window as any)` replaced in UnifiedStorageSync.ts
- [ ] All `(window as any)` replaced in DisplayNameManager.ts
- [ ] All `(window as any)` replaced in SettingsHeadlineManager.ts
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
- Storage modules often access Chrome storage and state management
- Display modules often access user data and UI state
- Check for existing Window interface extensions in `global.d.ts`
- Be careful with property name conflicts
- Use `any` for complex types that are hard to define precisely
- Maintain the same functionality - only improve type safety

