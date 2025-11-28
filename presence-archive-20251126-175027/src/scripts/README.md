# Diagnostic Scripts - CRITICAL RULES

## 🚨 ABSOLUTE REQUIREMENTS

**ALL diagnostic scripts that run in the browser console MUST be pure JavaScript (.js files only).**

### File Naming Convention:
- `diagnose-*.js` = Browser console scripts (PURE JAVASCRIPT ONLY)
- `test-*.js` = Browser console test scripts (PURE JAVASCRIPT ONLY)
- `*.ts` = Build-time scripts only (NOT for browser console)

## ❌ FORBIDDEN in Browser Diagnostic Scripts (.js files):

1. **TypeScript type annotations:**
   ```javascript
   // ❌ WRONG
   const statusTexts: string[] = [];
   const state: StateData = {};
   
   // ✅ CORRECT
   const statusTexts = [];
   const state = {};
   ```

2. **TypeScript 'as' assertions:**
   ```javascript
   // ❌ WRONG
   const stateManager = (window as any).stateManager;
   const result = value as string;
   
   // ✅ CORRECT
   const stateManager = window.stateManager;
   const result = value;
   ```

3. **TypeScript interface/type imports:**
   ```javascript
   // ❌ WRONG
   import type { StateData } from '../types/index.js';
   
   // ✅ CORRECT
   // No imports - use window.* or global objects
   ```

4. **ES6 module imports/exports:**
   ```javascript
   // ❌ WRONG
   import { Logger } from '../utils/Logger.js';
   export function diagnose() {}
   
   // ✅ CORRECT
   // Use window.* functions or inline code
   // No exports needed - scripts run directly
   ```

## ✅ ALLOWED in Browser Diagnostic Scripts:

1. **Plain JavaScript:**
   ```javascript
   // ✅ CORRECT
   const results = {};
   function checkSomething() {}
   ```

2. **Optional chaining (ES2020):**
   ```javascript
   // ✅ CORRECT (ES2020 feature, works in modern browsers)
   const value = obj?.property?.nested;
   ```

3. **Async/await:**
   ```javascript
   // ✅ CORRECT
   (async function() {
     const result = await someAsyncFunction();
   })();
   ```

4. **Window object access:**
   ```javascript
   // ✅ CORRECT
   const stateManager = window.stateManager;
   const moduleGraph = window.__CANOPI_MODULE_GRAPH__;
   ```

## Template for Browser Diagnostic Scripts:

```javascript
/**
 * Diagnostic Script: [Description]
 * 
 * This script diagnoses [issue].
 * 
 * Usage: Run in browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: [Name]');
  console.log('=========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    // Add your diagnostic data here
    issues: []
  };

  // Diagnostic checks here
  // Use window.* for accessing modules
  // Use plain JavaScript only
  
  // Summary
  console.log('\n=========================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('=========================================');
  console.log('Issues Found:', results.issues.length);
  results.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  
  return results;
})();
```

## Validation Checklist (Before Creating Diagnostic Script):

- [ ] File extension is `.js` (NOT `.ts`)
- [ ] No TypeScript type annotations (`: string`, `: any`, etc.)
- [ ] No TypeScript 'as' assertions (`as any`, `as Window`, etc.)
- [ ] No ES6 imports/exports
- [ ] Uses `window.*` for accessing modules
- [ ] Uses plain JavaScript only
- [ ] Tested in browser console

## Common Mistakes to Avoid:

1. **Don't copy TypeScript patterns:**
   - If you see `(window as any)` in TypeScript code, use `window` directly in JS
   - If you see type annotations, remove them

2. **Don't use imports:**
   - Browser console scripts can't use ES6 imports
   - Access everything via `window.*` or global objects

3. **Don't mix TypeScript and JavaScript:**
   - If you need TypeScript features, the script belongs in `.ts` (build-time only)
   - Browser console = pure JavaScript only

## Why These Rules Exist:

- Browser console doesn't support TypeScript compilation
- Diagnostic scripts must run immediately without build step
- TypeScript syntax causes "Unexpected identifier" errors
- Agents keep making the same mistakes without clear guidance

## Enforcement:

- Pre-commit hooks should validate .js files for TypeScript syntax
- Linters should flag TypeScript syntax in .js files
- Code review should reject diagnostic scripts with TypeScript syntax

