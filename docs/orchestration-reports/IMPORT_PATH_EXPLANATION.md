# Import Path Explanation: `../src/features/visibility/index.js`

## The Problem

The import path `../src/features/visibility/index.js` has a **critical issue**:

### Current Situation

1. **File Structure**:
   - `sidepanel/buildGraph.js` - JavaScript file at root level
   - `src/features/visibility/index.ts` - TypeScript source file
   - `dist/features/visibility/index.js` - Compiled JavaScript (TypeScript output)

2. **Import Path Analysis**:
   ```javascript
   // Current (WRONG):
   from '../src/features/visibility/index.js'
   
   // Path resolution:
   // sidepanel/buildGraph.js
   //   → ../ (goes to root)
   //   → src/features/visibility/index.js
   //   → Points to: /presence/src/features/visibility/index.ts (TypeScript source!)
   ```

3. **The Issue**:
   - **TypeScript files (.ts) cannot be imported directly** by JavaScript files at runtime
   - The file is `.ts` but import says `.js`
   - TypeScript compiles to `dist/` (per tsconfig.json: `outDir: "dist"`)
   - Browser/Node.js can't execute TypeScript directly

### Why This Fails

- **Runtime Error**: Browser tries to load `src/features/visibility/index.ts` as JavaScript
- **Module Not Found**: TypeScript files aren't executable JavaScript
- **Build Process**: TypeScript must be compiled first to `dist/`

## The Correct Solution

### Option 1: Use Compiled Output (Recommended)
```javascript
// CORRECT:
from '../extension/features/visibility/index.js'

// Path resolution:
// sidepanel/buildGraph.js
//   → ../ (goes to root)
//   → extension/features/visibility/index.js
//   → Points to: /presence/extension/features/visibility/index.js (Compiled JS)
```

**Requirement**: TypeScript must be compiled first (build process compiles to `extension/`)

### Option 2: Use Root-Level Features (If Build Copies There)
```javascript
// ALTERNATIVE (if build process copies to root):
from '../features/visibility/index.js'

// This matches other imports in buildGraph.js:
// - '../features/AuthManager.js'
// - '../features/CommunitiesModule.js'
```

**Requirement**: Build process must copy compiled files to `features/` at root

### Option 3: TypeScript Module Resolution (If Using Build Tool)
If using a build tool (webpack, vite, etc.) that handles TypeScript:
```javascript
// Build tool resolves automatically:
from '../src/features/visibility/index.js'
// Tool compiles on-the-fly or uses pre-compiled
```

## Current Project Structure

Based on analysis:
- ✅ `extension/features/visibility/index.js` exists (compiled output)
- ✅ `src/features/visibility/index.ts` exists (source)
- ✅ Other imports use `../features/` (root level)
- ✅ Build process compiles TypeScript to `extension/` directory

## Implications

### If Using `../src/features/visibility/index.js`:
- ❌ **Will fail at runtime** - TypeScript not executable
- ❌ **Module not found** - Browser can't load `.ts` files
- ❌ **Inconsistent** - Other imports use `../features/`

### If Using `../dist/features/visibility/index.js`:
- ✅ **Will work** - Compiled JavaScript
- ✅ **Consistent** - Uses build output
- ⚠️ **Requires compilation** - Must run `npx tsc` first

### If Using `../features/visibility/index.js`:
- ✅ **Matches other imports** - Consistent pattern
- ⚠️ **Requires build step** - Files must be copied/symlinked to root
- ✅ **Cleaner paths** - No `dist/` or `src/` in imports

## Recommendation

**Use `../dist/features/visibility/index.js`** because:
1. TypeScript compiles to `dist/` (confirmed by tsconfig.json)
2. Compiled output exists (verified)
3. Matches build process
4. Will work at runtime

**Alternative**: If build process copies to root `features/`, use `../features/visibility/index.js` to match other imports.

---

**Action Required**: Update import path in `buildGraph.js` to use compiled output location.

