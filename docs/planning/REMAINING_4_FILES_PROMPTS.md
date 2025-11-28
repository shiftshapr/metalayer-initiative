# Remaining 4 Files - Agent Prompts

## Overview
Convert the final 4 utility modules from JavaScript to TypeScript. These were assigned to Agent 4 but weren't completed.

---

## Agent 1: AvatarConfig.js

**File to convert:**
- `presence/utils/AvatarConfig.js` → `presence/src/utils/AvatarConfig.ts`

**Prompt:**
```
Convert AvatarConfig.js from JavaScript to TypeScript:

1. Read presence/utils/AvatarConfig.js
2. Convert to presence/src/utils/AvatarConfig.ts with proper TypeScript types
3. Remove all RED-LINE violations (snake_case fields → camelCase)
4. Add proper type annotations:
   - Interface definitions for config objects
   - Type definitions for function parameters and returns
   - Proper typing for DOM elements
5. Export as ES module (no window globals, use named exports)
6. Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/AvatarConfig.ts`
7. Preserve all functionality exactly

Requirements:
- No `any` types (use proper types or `unknown`)
- No snake_case field names (except in database column mappings with comments)
- No window.* assignments (export as ES module)
- All functions must have return type annotations
- All parameters must have type annotations
```

---

## Agent 2: EnhancedLogger.js

**File to convert:**
- `presence/utils/EnhancedLogger.js` → `presence/src/utils/EnhancedLogger.ts`

**Prompt:**
```
Convert EnhancedLogger.js from JavaScript to TypeScript:

1. Read presence/utils/EnhancedLogger.js
2. Convert to presence/src/utils/EnhancedLogger.ts with proper TypeScript types
3. Remove all RED-LINE violations (snake_case fields → camelCase)
4. Add proper type annotations:
   - Interface definitions for log entries
   - Type definitions for log levels
   - Proper typing for logger methods
5. Export as ES module (no window globals, use named exports)
6. Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/EnhancedLogger.ts`
7. Preserve all functionality exactly

Note: Check if this conflicts with existing Logger.ts - if so, merge or rename appropriately.

Requirements:
- No `any` types (use proper types or `unknown`)
- No snake_case field names
- No window.* assignments
- All functions must have return type annotations
- All parameters must have type annotations
```

---

## Agent 3: StatusDotHelper.js

**File to convert:**
- `presence/utils/StatusDotHelper.js` → `presence/src/utils/StatusDotHelper.ts`

**Prompt:**
```
Convert StatusDotHelper.js from JavaScript to TypeScript:

1. Read presence/utils/StatusDotHelper.js
2. Convert to presence/src/utils/StatusDotHelper.ts with proper TypeScript types
3. Remove all RED-LINE violations (snake_case fields → camelCase)
4. Add proper type annotations:
   - Interface definitions for status objects
   - Type definitions for status values
   - Proper typing for DOM manipulation
5. Export as ES module (no window globals, use named exports)
6. Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/StatusDotHelper.ts`
7. Preserve all functionality exactly

Requirements:
- No `any` types (use proper types or `unknown`)
- No snake_case field names
- No window.* assignments
- All functions must have return type annotations
- All parameters must have type annotations
```

---

## Agent 4: UnifiedSettingsStorage.js

**File to convert:**
- `presence/utils/UnifiedSettingsStorage.js` → `presence/src/utils/UnifiedSettingsStorage.ts`

**Prompt:**
```
Convert UnifiedSettingsStorage.js from JavaScript to TypeScript:

1. Read presence/utils/UnifiedSettingsStorage.js
2. Convert to presence/src/utils/UnifiedSettingsStorage.ts with proper TypeScript types
3. Remove all RED-LINE violations (snake_case fields → camelCase)
4. Add proper type annotations:
   - Interface definitions for settings objects
   - Type definitions for storage operations
   - Proper typing for Chrome storage API
   - Proper typing for settings keys and values
5. Export as ES module (no window globals, use named exports)
6. Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/UnifiedSettingsStorage.ts`
7. Preserve all functionality exactly

Requirements:
- No `any` types (use proper types or `unknown`)
- No snake_case field names (except in database column mappings with comments)
- No window.* assignments
- All functions must have return type annotations
- All parameters must have type annotations
- Proper typing for Chrome storage callbacks
```

---

## Common Requirements (All Agents)

1. **RED-LINE Compliance:**
   - No `aura_color`, `user_id`, `created_at`, `updated_at` in code (only in comments/column mappings)
   - All field names must be camelCase

2. **Type Safety:**
   - Minimize `any` usage (use `unknown` if type is truly unknown)
   - Add proper interfaces for all object shapes
   - Add return types to all functions
   - Add parameter types to all functions

3. **Module Structure:**
   - Use ES module exports (`export class`, `export function`, `export const`)
   - Use ES module imports (`import ... from '...'`)
   - Add `.js` extension to imports (required for ES modules)
   - No default exports (use named exports)

4. **Code Quality:**
   - Preserve all functionality exactly
   - Maintain same logic flow
   - Keep all comments and documentation
   - Add JSDoc comments for public APIs

5. **Compilation:**
   - Must compile without errors: `npx tsc --noEmit --skipLibCheck`
   - Must build successfully: `npx tsc --outDir presence/dist --skipLibCheck`

---

## Verification

After conversion, verify:
```bash
cd /home/ubuntu/metalayer-initiative

# Check compilation
npx tsc --noEmit --skipLibCheck presence/src/utils/AvatarConfig.ts
npx tsc --noEmit --skipLibCheck presence/src/utils/EnhancedLogger.ts
npx tsc --noEmit --skipLibCheck presence/src/utils/StatusDotHelper.ts
npx tsc --noEmit --skipLibCheck presence/src/utils/UnifiedSettingsStorage.ts

# Check file exists
ls -la presence/src/utils/{AvatarConfig,EnhancedLogger,StatusDotHelper,UnifiedSettingsStorage}.ts

# Check no RED-LINE violations
grep -E "\b(aura_color|user_id|created_at|updated_at)\b" presence/src/utils/{AvatarConfig,EnhancedLogger,StatusDotHelper,UnifiedSettingsStorage}.ts | grep -v "//\|/\*\|dbColumn\|db_column"
```

---

*Last Updated: 2025-01-17*

