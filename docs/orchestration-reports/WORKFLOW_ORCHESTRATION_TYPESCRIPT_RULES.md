# Orchestration Workflow - TypeScript Enforcement Rules

**For use in orchestration prompts and agent instructions**

## TypeScript Project Rules (MANDATORY)

**CRITICAL**: This is a TypeScript project. Before editing ANY file:

### 1. Path Validation (REQUIRED BEFORE EDIT)

Check file path against these rules:

**✅ ALLOW**:
- Files in `src/` directory (TypeScript source)
- Hand-authored files explicitly documented (e.g., `sidepanel/buildGraph.js` if marked as hand-authored)
- Configuration files (`.json`, `.md`, `.sh`, etc.)

**❌ REJECT**:
- Files in `extension/` directory (compiled output)
- Files in `dist/` directory (compiled output)
- Files in `build/` directory (compiled output)
- `.js` files in `sidepanel/` if corresponding `.ts` exists in `src/sidepanel/`

### 2. Auto-Redirect Logic

If edit target is a compiled JS file:

1. **Find TypeScript Source**:
   - `extension/path/to/file.js` → `src/path/to/file.ts`
   - `dist/path/to/file.js` → `src/path/to/file.ts`
   - `sidepanel/path/to/file.js` → `src/sidepanel/path/to/file.ts`

2. **Verify Source Exists**:
   - If TypeScript source found: Edit it instead
   - If not found: Warn user and ask if file should be migrated

3. **Build After Edit**:
   - Run: `npx tsc --project tsconfig.json`
   - Run: `bash scripts/sync-extension-from-dist.sh`
   - Verify compiled output matches changes

### 3. Workflow Integration

Add this validation step to orchestration workflow:

```markdown
## Pre-Edit Validation (MANDATORY)

Before ANY file edit operation:

1. **Path Check**: 
   - If path in restricted directory → REJECT
   - Find TypeScript source → Redirect edit
   - Log: "Redirected edit from {jsPath} to {tsPath}"

2. **Source Verification**:
   - If TypeScript source not found → WARN user
   - Ask: "Is this hand-authored JS? Should it be migrated?"

3. **Build Process**:
   - After TypeScript edit → Run build
   - Verify compiled JS matches changes
```

### 4. Example Violation Handling

**Scenario**: User requests edit to `sidepanel/controllers/TabController.js`

**Correct Response**:
```
❌ REJECT: Cannot edit compiled JS file
🔍 Found: src/sidepanel/controllers/TabController.ts
✅ Redirecting edit to TypeScript source
📝 Logging: "Edit redirected from .js to .ts"
🔨 Building: TypeScript → JavaScript
```

### 5. Explicit Rule for Orchestration Prompts

Add this section to orchestration initialization:

```
## TypeScript Enforcement

**CRITICAL**: This is a TypeScript project. 

- ❌ NEVER edit files in extension/, dist/, build/
- ❌ NEVER edit compiled .js files if .ts source exists
- ✅ ALWAYS edit TypeScript source files in src/
- ✅ ALWAYS run build after TypeScript edits
- ⚠️ WARN if TypeScript source doesn't exist

**VIOLATION**: Editing compiled JS will be REJECTED and logged.
```

## Implementation Checklist

- [x] Document the rules
- [x] Create workflow template
- [ ] Add to orchestration prompt template
- [ ] Test with sample edits
- [ ] Monitor for violations

---

**Status**: Ready for integration into orchestration workflow

