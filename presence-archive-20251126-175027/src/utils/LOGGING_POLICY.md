# Logging Policy for Canopi Presence Extension

## Overview

This document defines the logging strategy for the Canopi Presence extension to address Slice 2: Excessive Debug Logging.

## Policy

### ✅ **USE Logger Utility**

All production code MUST use the `Logger` utility from `src/utils/Logger.ts`:

```typescript
import { Logger } from '../utils/Logger.js';

// ✅ CORRECT
Logger.debug('Debug message', data, 'context');
Logger.info('Info message', data, 'context');
Logger.warn('Warning message', data, 'context');
Logger.error('Error message', error, 'context');
```

### ❌ **DO NOT Use Direct console.* Calls**

Direct `console.log`, `console.error`, `console.warn`, etc. are PROHIBITED in production code:

```typescript
// ❌ WRONG - Direct console calls
console.log('Debug message');
console.error('Error message');
console.warn('Warning message');
```

### Exception: Diagnostic Scripts

Diagnostic scripts in `src/scripts/` may use `console.*` directly as they are not part of the production build.

## Log Levels

### DEBUG
- **Purpose**: Detailed debugging information
- **Production**: Stripped/disabled
- **Usage**: Development-only logs, detailed state information
- **Example**: `Logger.debug('User profile loaded', { userId: user.id }, 'profile')`

### INFO
- **Purpose**: General informational messages
- **Production**: Stripped/disabled
- **Usage**: Important state changes, non-critical information
- **Example**: `Logger.info('Theme changed', { theme: 'dark' }, 'ui')`

### WARN
- **Purpose**: Warning messages for potentially problematic situations
- **Production**: **ENABLED** - Always logged
- **Usage**: Recoverable errors, deprecated API usage, performance warnings
- **Example**: `Logger.warn('API request took longer than expected', { duration: 5000 }, 'api')`

### ERROR
- **Purpose**: Error messages for failures
- **Production**: **ENABLED** - Always logged
- **Usage**: Unrecoverable errors, exceptions, critical failures
- **Example**: `Logger.error('Failed to load user profile', error, 'profile')`

## Context Parameter

Always provide a context string to categorize logs:

```typescript
// ✅ CORRECT - With context
Logger.debug('Message loaded', message, 'messages');
Logger.error('API request failed', error, 'api');

// ❌ WRONG - Missing context
Logger.debug('Message loaded', message);
```

Common contexts:
- `'profile'` - Profile management
- `'messages'` - Message operations
- `'api'` - API requests/responses
- `'auth'` - Authentication
- `'realtime'` - Realtime subscriptions
- `'visibility'` - Visibility features
- `'ui'` - UI updates
- `'storage'` - Storage operations

## Production Behavior

In production mode (`NODE_ENV=production`):

1. **DEBUG logs**: Completely stripped (no console output, no history)
2. **INFO logs**: Completely stripped (no console output, no history)
3. **WARN logs**: Always logged to console
4. **ERROR logs**: Always logged to console

This ensures:
- ✅ No performance impact from debug logs
- ✅ No sensitive data leakage in production
- ✅ Critical errors still visible
- ✅ Reduced bundle size

## Migration Strategy

### Phase 1: High Priority Files (COMPLETED ✅)
- ✅ `ProfileManager.ts` - Migration complete
- ✅ `MessagesModule.ts` - Migration complete
- ✅ `RealtimeManager.ts` - Migration complete

### Phase 2: Medium Priority Files (COMPLETED ✅)
- ✅ `AuthModule.ts` - Migration complete
- ✅ `UserPreferencesManager.ts` - Migration complete
- ✅ `AgentModule.ts` - Migration complete
- ✅ `APIModule.ts` - Migration complete

### Phase 3: Remaining Files (COMPLETED ✅)
- ✅ All other feature modules - Migration complete
- ✅ Utility modules - Migration complete
- ✅ Service modules - Migration complete

**Status**: All console.* statements have been migrated to Logger. Migration is 100% complete.

### Migration Pattern

1. **Add Logger import**:
   ```typescript
   import { Logger } from '../utils/Logger.js';
   ```

2. **Replace console.log → Logger.debug**:
   ```typescript
   // Before
   console.log('User loaded', user);
   
   // After
   Logger.debug('User loaded', user, 'profile');
   ```

3. **Replace console.error → Logger.error**:
   ```typescript
   // Before
   console.error('Failed to load', error);
   
   // After
   Logger.error('Failed to load', error, 'context');
   ```

4. **Replace console.warn → Logger.warn**:
   ```typescript
   // Before
   console.warn('Deprecated API used');
   
   // After
   Logger.warn('Deprecated API used', null, 'context');
   ```

## Sensitive Data

**NEVER log sensitive data**:
- ❌ Passwords, tokens, API keys
- ❌ Full user objects (log only IDs)
- ❌ Authentication tokens
- ❌ Personal information without consent

**Safe to log**:
- ✅ User IDs (not full user objects)
- ✅ Error messages (sanitized)
- ✅ Operation status
- ✅ Non-sensitive metadata

## Build Configuration

Production builds automatically:
1. Set `NODE_ENV=production`
2. Logger detects production mode
3. DEBUG/INFO logs are stripped at runtime
4. Only WARN/ERROR logs are emitted

## Verification

Run diagnostic script to verify compliance:

```bash
npx tsx presence/src/scripts/diagnose-slice2-console-logging.ts
```

This will:
- Count remaining `console.*` statements
- Identify files needing migration
- Check for sensitive data patterns
- Provide migration priority list

## Enforcement

### ESLint Rule
ESLint is configured to **error** on any `console.*` usage in `src/**/*.ts` files:
- ✅ Production code: `no-console: "error"` enforced
- ✅ Diagnostic scripts: `no-console: "off"` (excluded)
- ✅ Logger.ts: `no-console: "off"` (uses console internally)

### Pre-commit Hook
Run logging check before committing:
```bash
npm run check:logging
```

### CI/CD Integration
The `check:logging` script is integrated into CI/CD pipeline:
```bash
npm run check:logging
```

This will:
- Scan all `src/**/*.ts` files
- Report any remaining `console.*` statements
- Fail if console usage detected in production code

### Code Review
- **Reject PRs** with direct `console.*` calls in production code
- **Accept** `console.*` only in diagnostic scripts (`src/scripts/`)
- **Verify** Logger usage includes appropriate context

## Questions?

Contact the development team or refer to:
- `src/utils/Logger.ts` - Logger implementation
- `src/scripts/diagnose-slice2-console-logging.ts` - Diagnostic tool
- This document - Logging policy

---

**Last Updated**: 2025-01-24  
**Status**: Active  
**Related**: Slice 2 - Excessive Debug Logging


