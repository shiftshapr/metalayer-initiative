# Error Handling Migration Guide

## Overview

The automated migration script (`migrate-error-handling.ts`) standardizes error handling across the Canopi codebase by:

1. Converting `catch (error)` to `catch (error: unknown)`
2. Replacing `console.error/warn` with `handleError()` utility
3. Adding proper error context
4. Adding necessary imports

## Usage

### Dry Run (Preview Changes)

```bash
cd presence
npx tsx src/scripts/migrate-error-handling.ts --dry-run
```

This shows what would be changed without modifying any files.

### Apply Changes

```bash
cd presence
npx tsx src/scripts/migrate-error-handling.ts
```

This will modify files according to the migration pattern.

## What Gets Migrated

### ✅ Will Be Fixed

- Untyped catch blocks: `catch (error)` → `catch (error: unknown)`
- Console.error in catch blocks → `handleError()` with proper context
- Console.warn in catch blocks → `handleError()` with warn level
- Missing imports → Automatically added

### ⚠️ Will Be Skipped

- Diagnostic files (intentionally use console)
- Already migrated files (ProfileManager.ts, MessagesModule.ts)
- Files already using `handleError()` or `Logger.error/warn`
- Empty catch blocks (intentionally silent)
- Console.log calls (usually debug, not errors)

## Migration Pattern

### Before

```typescript
try {
  await someOperation();
} catch (error) {
  console.error('❌ Operation failed:', error);
  const showNotification = getWindowFunction('showNotification');
  if (showNotification) {
    showNotification('Operation failed');
  }
}
```

### After

```typescript
import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';

try {
  await someOperation();
} catch (error: unknown) {
  const context: ErrorContext = {
    operation: 'someOperation',
    component: 'SomeComponent'
  };
  handleError(error, {
    log: true,
    logLevel: 'error',
    showUserNotification: true,
    userMessage: 'Operation failed',
    context
  });
}
```

## Current Status

### Already Migrated (Manual)
- ✅ `features/ProfileManager.ts` - 5 catch blocks
- ✅ `features/MessagesModule.ts` - 20 catch blocks

### Ready for Migration (Automated)
- 58 files identified with ~1,835 changes
- High priority files:
  - `features/RealtimeManager.ts` - 85 changes
  - `features/AuthModule.ts` - 114 changes
  - `utils/UnifiedStorageSync.ts` - 161 changes
  - `utils/UserPreferencesManager.ts` - 78 changes

## Verification

After running the migration:

1. **Check TypeScript compilation**:
   ```bash
   npx tsc --noEmit --project .
   ```

2. **Run diagnostic script**:
   ```bash
   npx tsx src/scripts/diagnose-slice5-error-handling.ts
   ```

3. **Review changes**:
   ```bash
   git diff
   ```

## Rollback

If you need to rollback:

```bash
git checkout -- src/
```

Or use git to revert specific files.

## Manual Review Required

Some cases may need manual review:

1. **Complex error handling** - Multi-step error recovery
2. **Error-specific logic** - Custom error type handling
3. **User notifications** - May need message refinement
4. **Context extraction** - May need additional context fields

## Best Practices

1. **Always run dry-run first** to preview changes
2. **Review changes** before committing
3. **Test after migration** to ensure functionality
4. **Run diagnostics** to verify improvements
5. **Commit in batches** by file or feature area

## Troubleshooting

### Import Path Issues

If imports are incorrect, the script calculates relative paths. If issues occur:
- Check file structure
- Verify `ErrorHandler.ts` exists at `src/utils/ErrorHandler.ts`
- Manually fix import paths if needed

### Scope Issues

If variables are out of scope in error context:
- The script tries to extract context from surrounding code
- May need manual adjustment for complex cases
- Check that variables exist in catch block scope

### Nested Try-Catch

The script handles nested try-catch blocks, but complex nesting may need manual review.

## Next Steps

After migration:

1. ✅ Run TypeScript compilation check
2. ✅ Run diagnostic script to verify improvements
3. ✅ Test critical user flows
4. ✅ Review error logs in production
5. ✅ Update error handling guide if patterns emerge

## Support

For issues or questions:
- Check `ERROR_HANDLING_GUIDE.md` for patterns
- Review `ErrorHandler.ts` for available utilities
- Check `ErrorTypes.ts` for error type definitions






