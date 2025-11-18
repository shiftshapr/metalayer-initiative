# TypeScript Restoration Plan

## Current Situation
- JavaScript version: Messages not loading, visibility tab issues
- TypeScript version: In git stash, at least shows messages and visibility
- Decision: Restore TypeScript version and fix incrementally

## Restoration Steps

### Step 1: Save Current State
- Stash current JavaScript fixes (preserve for reference)
- Restore TypeScript stash

### Step 2: Build TypeScript
- Run `npm run build:extension` to compile TypeScript
- Verify compiled files in `presence/dist/`
- Copy compiled files to `presence/` directories

### Step 3: Update sidepanel.html
- Ensure it loads compiled TypeScript modules
- Use `type="module"` for ES6 modules
- Load from `dist/` or copied locations

### Step 4: Fix Issues Incrementally
- Messages loading (if broken)
- Visibility tab (if broken)
- Replies functionality
- Message icons and actions
- Test each fix before moving on

## Files to Restore
- `presence/sidepanel.html` - Module loading setup
- `presence/features/CanopiModule.js` - May be replaced by compiled version

## Build Command
```bash
cd /home/ubuntu/metalayer-initiative
npm run build:extension
```

This will:
1. Compile TypeScript (`tsc`)
2. Copy compiled files to `presence/` directories

## Verification
After restoration:
1. Check console for TypeScript module loading
2. Verify messages appear
3. Verify visibility tab works
4. Run diagnostic: `runComprehensiveDiagnostic()`

