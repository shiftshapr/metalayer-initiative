# Issue Review Template

## Issue Details
- **File**: `[file path]`
- **Line**: `[line number]`
- **Type**: `[as any | ROOT CAUSE FIX | TODO | etc.]`
- **Context**: `[surrounding code]`

## Review Questions

### 1. Why does this exist?
- [ ] Type error that was "fixed" with assertion
- [ ] Missing type definition
- [ ] Legacy code that needs refactoring
- [ ] Legitimate use case (document why)

### 2. Is it safe?
- [ ] Yes - underlying issue is fixed
- [ ] Yes - but needs better type definition
- [ ] No - needs proper fix
- [ ] Unknown - needs investigation

### 3. Does it violate policies?
- [ ] UUID-only policy
- [ ] Field naming policy
- [ ] Console logging policy
- [ ] Other: `[specify]`

### 4. Action Required
- [ ] Fix immediately (critical)
- [ ] Fix in this sprint (high)
- [ ] Fix when refactoring (medium)
- [ ] Document and leave (low)
- [ ] Remove (not needed)

## Fix Plan
```
[Describe how to fix]
```

## Verification
- [ ] Code compiles
- [ ] Tests pass
- [ ] No new type errors
- [ ] Policy compliance verified

## Notes
```
[Any additional context]
```

