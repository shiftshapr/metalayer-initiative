# TypeScript Migration Audit Plan

## Risk Assessment
**High Risk**: During TypeScript migration, agents may have:
- Changed logic to satisfy type errors (instead of fixing types)
- Introduced "fixes" that violate project policies
- Used type assertions (`as any`, `as unknown`) to bypass type safety
- Changed data matching/filtering logic
- Modified authentication/authorization patterns

## Systematic Audit Checklist

### 1. Type Safety Violations
**Search for**: `as any`, `as unknown`, `@ts-ignore`, `@ts-expect-error`
**Risk**: These hide type errors that might indicate logic bugs
**Action**: Review each instance - why was it needed? Is the underlying issue fixed?

### 2. User Identification Patterns
**Search for**: 
- Email-based matching: `user.email ===`, `.eq('email',`
- Google ID patterns: `/^\d+$/`, `googleId`, `google_id`
- Mixed identifier usage
**Risk**: Violates UUID-only policy (like the bug we just fixed)
**Action**: Verify all user matching uses UUID only

### 3. Database Query Patterns
**Search for**: 
- `findUnique({ where: { email:`
- `.eq('email',`
- `WHERE email =`
- Any email-based lookups
**Risk**: Privacy violations, wrong user matching
**Action**: Replace with UUID-based queries

### 4. API Header Patterns
**Search for**: `x-user-email`, `user-email`, email in headers
**Risk**: Sending PII unnecessarily, backend confusion
**Action**: Use `x-user-id` only

### 5. Authentication/Authorization Logic
**Search for**: 
- Session checks using email
- User verification by email
- Permission checks with email
**Risk**: Security issues, wrong user access
**Action**: Use UUID for all auth checks

### 6. Data Filtering/Visibility
**Search for**: 
- Filtering by email
- Visibility checks using email
- Current user matching by email
**Risk**: Wrong data shown, privacy leaks
**Action**: Use UUID for all filtering

### 7. "Fixes" and "Improvements"
**Search for**: 
- Commit messages with "fix", "improve", "refactor" during migration
- Comments like "ROOT CAUSE FIX", "TODO", "FIXME", "HACK"
**Risk**: Logic changed without proper review
**Action**: Review each "fix" - was it requested? Does it violate policies?

### 8. Type Assertions in Critical Paths
**Search for**: Type assertions in:
- Authentication flows
- User identification
- Data matching
- API calls
**Risk**: Runtime errors, wrong data types
**Action**: Verify types are correct, not just asserted

### 9. Changed Function Signatures
**Search for**: Functions that changed parameters during migration
**Risk**: Callers might be passing wrong data
**Action**: Verify all call sites match new signatures

### 10. Removed/Changed Validation
**Search for**: 
- Removed `if (!user.id)` checks
- Changed validation logic
- Removed null checks
**Risk**: Runtime errors, wrong behavior
**Action**: Verify validation is still present and correct

## Automated Detection Scripts

### Script 1: Find Type Safety Violations
```bash
grep -r "as any\|as unknown\|@ts-ignore\|@ts-expect-error" presence/src --include="*.ts" | wc -l
```

### Script 2: Find Email-Based Matching
```bash
grep -r "\.eq('email'\|findUnique.*email\|user\.email\s*===" presence/src --include="*.ts" | wc -l
```

### Script 3: Find Google ID Patterns
```bash
grep -r "/^\d+\$/\|googleId\|google_id" presence/src --include="*.ts" | wc -l
```

### Script 4: Find Email Headers
```bash
grep -r "x-user-email\|user-email" presence/src --include="*.ts" | wc -l
```

## Review Process

1. **Run all detection scripts** - Get baseline counts
2. **Review each match** - Is it legitimate or a bug?
3. **Document findings** - Create issues for each violation
4. **Fix systematically** - Don't fix randomly, fix by category
5. **Verify fixes** - Re-run scripts to confirm reduction

## Prevention

1. **Add pre-commit hooks** - Block commits with `as any` in critical files
2. **Add linting rules** - ESLint rules to catch email-based matching
3. **Code review checklist** - Review all migration-related changes
4. **Policy enforcement** - Add UUID-only policy to `.cursorrules` (already done)

## Priority Order

1. **Critical**: User identification, authentication, authorization
2. **High**: Data filtering, visibility, privacy
3. **Medium**: Type safety violations, validation
4. **Low**: Code quality, comments, documentation

