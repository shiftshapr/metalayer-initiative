# Workflow TypeScript Enforcement - META Improvement

**Date**: 2025-01-24  
**Type**: META - Workflow Improvement  
**Status**: 📋 **PROPOSAL**

## Problem

The default orchestration workflow allowed editing compiled JavaScript files (`.js` in `extension/`, `dist/`, `build/`, `sidepanel/`) which violates `.cursorrules`:
- "CRITICAL: Never edit extension/, dist/, build/. Edit src/ only."
- TypeScript projects must edit source files only, not compiled output

## Root Cause

The workflow did not check file paths before editing, allowing direct edits to compiled JavaScript files.

## Proposed Solution

### 1. Pre-Edit Path Validation

Before any file edit operation, the workflow should:

```javascript
function validateEditPath(filePath) {
  const restrictedDirs = ['extension/', 'dist/', 'build/'];
  const restrictedPatterns = [
    /^sidepanel\/.*\.js$/,  // Compiled JS in sidepanel
    /^extension\/.*\.js$/,   // Compiled JS in extension
    /^dist\/.*\.js$/,        // Compiled JS in dist
    /^build\/.*\.js$/        // Compiled JS in build
  ];
  
  // Check if path is in restricted directory
  if (restrictedDirs.some(dir => filePath.startsWith(dir))) {
    return { valid: false, reason: `Path in restricted directory: ${dir}` };
  }
  
  // Check if path matches restricted pattern
  if (restrictedPatterns.some(pattern => pattern.test(filePath))) {
    return { valid: false, reason: `Path matches restricted pattern` };
  }
  
  return { valid: true };
}
```

### 2. Auto-Redirect to TypeScript Source

If edit target is a compiled JS file, automatically find and edit the TypeScript source:

```javascript
function findTypeScriptSource(jsPath) {
  // Map compiled JS paths to TypeScript sources
  const pathMappings = {
    'sidepanel/controllers/TabController.js': 'src/sidepanel/controllers/TabController.ts',
    'sidepanel/controllers/BootController.js': 'src/sidepanel/controllers/BootController.ts',
    'extension/sidepanel/buildGraph.js': 'sidepanel/buildGraph.js', // Hand-authored, but should check
    // ... more mappings
  };
  
  // Direct mapping
  if (pathMappings[jsPath]) {
    return pathMappings[jsPath];
  }
  
  // Pattern-based: extension/.../file.js -> src/.../file.ts
  if (jsPath.startsWith('extension/')) {
    const srcPath = jsPath.replace(/^extension\//, 'src/').replace(/\.js$/, '.ts');
    if (fileExists(srcPath)) {
      return srcPath;
    }
  }
  
  // Pattern-based: dist/.../file.js -> src/.../file.ts
  if (jsPath.startsWith('dist/')) {
    const srcPath = jsPath.replace(/^dist\//, 'src/').replace(/\.js$/, '.ts');
    if (fileExists(srcPath)) {
      return srcPath;
    }
  }
  
  // Pattern-based: sidepanel/.../file.js -> src/sidepanel/.../file.ts
  if (jsPath.startsWith('sidepanel/') && jsPath.endsWith('.js')) {
    const srcPath = jsPath.replace(/^sidepanel\//, 'src/sidepanel/').replace(/\.js$/, '.ts');
    if (fileExists(srcPath)) {
      return srcPath;
    }
  }
  
  return null;
}
```

### 3. Workflow Integration

Update the default orchestration workflow to include:

```markdown
## Pre-Edit Validation (MANDATORY)

Before ANY file edit operation:

1. **Path Check**: Validate file path against restricted directories
   - If path is in `extension/`, `dist/`, `build/`, or matches compiled JS pattern:
     - ❌ REJECT edit
     - 🔍 Find corresponding TypeScript source
     - ✅ Edit TypeScript source instead
     - 📝 Log: "Redirected edit from {jsPath} to {tsPath}"

2. **Source Verification**: Ensure TypeScript source exists
   - If TypeScript source not found:
     - ⚠️ WARN: "No TypeScript source found for {jsPath}"
     - ❓ ASK: "Is this a hand-authored JS file? Should it be migrated to TypeScript?"

3. **Build Process**: After TypeScript edit
   - ✅ Run: `npx tsc --project tsconfig.json`
   - ✅ Run: `bash scripts/sync-extension-from-dist.sh`
   - ✅ Verify: Compiled JS matches TypeScript changes
```

### 4. Explicit Workflow Rule

Add to default orchestration prompt:

```
## TypeScript Project Rules (ENFORCED)

**CRITICAL**: This is a TypeScript project. Before editing ANY file:

1. Check file path:
   - ✅ ALLOW: Files in `src/` (TypeScript source)
   - ✅ ALLOW: Hand-authored files explicitly marked (e.g., `sidepanel/buildGraph.js` if documented)
   - ❌ REJECT: Files in `extension/`, `dist/`, `build/` (compiled output)
   - ❌ REJECT: `.js` files in `sidepanel/` if corresponding `.ts` exists in `src/sidepanel/`

2. If edit target is compiled JS:
   - Find TypeScript source: `src/{same-path}.ts`
   - Edit TypeScript source instead
   - Build will compile to JS automatically

3. If TypeScript source doesn't exist:
   - ⚠️ WARN user before editing compiled JS
   - Consider if file should be migrated to TypeScript

**VIOLATION**: Editing compiled JS files will be REJECTED and logged.
```

## Implementation Steps

1. ✅ Document the rule (this file)
2. ⏳ Update orchestration workflow template
3. ⏳ Add path validation function to workflow
4. ⏳ Add auto-redirect logic
5. ⏳ Test with sample edits

## Benefits

- ✅ Prevents red-line violations automatically
- ✅ Enforces TypeScript-first development
- ✅ Reduces build inconsistencies
- ✅ Makes workflow self-correcting

## Example Workflow

**Before (WRONG)**:
```
User: "Edit TabController.js"
Agent: [Edits sidepanel/controllers/TabController.js] ❌
```

**After (CORRECT)**:
```
User: "Edit TabController.js"
Agent: 
  1. Detects: sidepanel/controllers/TabController.js is compiled JS
  2. Finds: src/sidepanel/controllers/TabController.ts
  3. Edits: src/sidepanel/controllers/TabController.ts ✅
  4. Builds: npx tsc && sync-extension
  5. Logs: "Redirected edit to TypeScript source"
```

## Status

- ✅ Problem identified
- ✅ Solution designed
- ⏳ Implementation pending
- ⏳ Testing pending

---

**Next Steps**: Update orchestration workflow template with these rules.

