# TypeScript Agent Comprehensive Audit Prompt

Use this prompt with your TypeScript agent after all conversions are complete:

---

## Comprehensive TypeScript Audit

Perform a comprehensive audit of all TypeScript files in `presence/src/` for the following:

### 1. Type Safety Issues

**Find and report:**
- All uses of `any` type (should be minimal, with justification)
- Missing return type annotations on functions/methods
- Missing parameter types
- Unsafe type assertions (`as any`, `as unknown`)
- Missing null/undefined checks where needed
- Missing optional chaining (`?.`) where appropriate
- Missing non-null assertions (`!`) where safe

**For each issue, provide:**
- File path and line number
- Current code
- Suggested fix
- Severity (critical, warning, suggestion)

### 2. TypeScript Best Practices

**Check for:**
- Proper use of `interface` vs `type` (prefer interface for objects)
- Proper use of `readonly` modifiers on properties that shouldn't change
- Proper use of `const` assertions (`as const`) where appropriate
- Proper use of generics where code could be more reusable
- Proper error handling types (`Error`, custom error classes)
- Proper async/await patterns (no Promise chains where async/await is clearer)
- Proper use of `unknown` instead of `any` for truly unknown types

**Report violations with:**
- File and line
- Current pattern
- Recommended pattern
- Rationale

### 3. Code Quality Issues

**Identify:**
- Duplicate code that could be extracted to utilities
- Magic numbers/strings that should be constants
- Functions longer than 100 lines (should be broken down)
- Classes that violate single responsibility principle
- Missing JSDoc comments on public APIs
- Inconsistent naming conventions

**For each:**
- Location
- Issue description
- Suggested refactoring
- Priority

### 4. Module Structure Issues

**Check:**
- Proper export patterns (prefer named exports over default exports)
- Circular dependencies (use `madge --circular` if available)
- Proper import organization (group: external, internal, types)
- Unused imports/exports
- Missing `.js` extensions in imports (required for ES modules)
- Proper use of `import type` for type-only imports

**Report:**
- Files with issues
- Specific problems
- Fixes needed

### 5. RED-LINE Compliance

**Verify:**
- No snake_case field names (except in database column mappings)
- No `window.*` assignments (except for backward compatibility)
- All field names use camelCase
- Database column mappings are clearly marked with comments

**List any violations:**
- File and line
- Violation type
- Required fix

### 6. Missing Type Definitions

**Find:**
- Functions without return types
- Parameters without types
- Variables without explicit types where type inference is unclear
- Missing interface definitions for object shapes
- Missing type definitions for function parameters/returns

**Provide:**
- Location
- Missing type
- Suggested type definition

---

## Output Format

Generate a comprehensive report with:

1. **Executive Summary**
   - Total files audited
   - Total issues found
   - Critical issues count
   - Warning count
   - Suggestions count

2. **Critical Issues** (must fix)
   - List all critical issues with fixes

3. **Warnings** (should fix)
   - List all warnings with fixes

4. **Suggestions** (nice to have)
   - List all suggestions

5. **File-by-File Report**
   - For each file with issues, list all issues

6. **Priority Fix List**
   - Ordered list of fixes by priority
   - Estimated effort for each

---

## Example Output Structure

```markdown
# TypeScript Audit Report

## Executive Summary
- Files audited: 54
- Critical issues: 12
- Warnings: 34
- Suggestions: 67

## Critical Issues

### presence/src/features/AuthModule.ts:45
**Issue:** Missing return type
**Code:** `async authenticate(user) {`
**Fix:** `async authenticate(user: User): Promise<AuthResult> {`
**Severity:** Critical

## Warnings
...

## Suggestions
...
```

---

## Additional Checks

Also verify:
- All converted files compile without errors
- All imports resolve correctly
- No runtime errors from type mismatches
- All public APIs are properly typed
- All error paths are properly typed

---

**Run this audit and provide the comprehensive report.**

