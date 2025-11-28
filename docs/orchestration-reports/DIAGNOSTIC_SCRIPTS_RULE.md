# ⚠️ CRITICAL: Diagnostic Scripts Rule

## NEVER CREATE TYPESCRIPT DIAGNOSTIC SCRIPTS

### The Rule:
**All diagnostic scripts MUST be plain JavaScript (`.js` files) with NO ES6 imports/exports.**

### Why?
- Diagnostic scripts run directly in the browser console
- They cannot use ES6 module syntax (`import`/`export`)
- They must work without transpilation or bundling

### What Happens If You Violate This:
1. ❌ Pre-commit hook will reject your commit
2. ❌ Validation script will fail
3. ❌ Browser console will throw: "Cannot use import statement outside a module"

### How to Create Diagnostic Scripts:

✅ **CORRECT:**
```javascript
// diagnose-something.js
class DiagnosticTool {
  async run() {
    const url = await window.getCurrentPageUri();
    const normalized = await window.normalizeUrl(url);
    // ...
  }
}
```

❌ **WRONG:**
```typescript
// diagnose-something.ts - NO!
import { getCurrentPageUri } from '../utils/UrlUtils.js';
export class DiagnosticTool { ... }
```

### File Locations:
- `src/scripts/` - All files must be `.js`
- `extension/utils/*diagnostic*.js` - All must be `.js`
- Any file with `diagnose` or `diagnostic` in name - Must be `.js`

### Validation:
Run before committing:
```bash
node scripts/validate-diagnostics.js
```

### Protection Layers:
1. ✅ Pre-commit hook (validates on commit)
2. ✅ Validation script (`scripts/validate-diagnostics.js`)
3. ✅ TypeScript config (excludes diagnostic patterns)
4. ✅ README in `src/scripts/`
5. ✅ `.cursorrules` file

**This rule is enforced automatically. You cannot commit TypeScript diagnostic scripts.**

