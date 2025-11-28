# 🚨 CRITICAL: Agent Editing Rules

**IF YOU ARE AN AI AGENT - READ THIS BEFORE EDITING ANY FILE**

## Absolute Prohibition

**YOU CANNOT EDIT FILES IN THESE DIRECTORIES:**
- `extension/` - COMPILED OUTPUT
- `dist/` - COMPILED OUTPUT
- `build/` - COMPILED OUTPUT

## Pre-Edit Checklist (MANDATORY)

Before editing ANY file, you MUST:

1. ✅ Check the file path
   - Does it start with `extension/`, `dist/`, or `build/`?
   - If YES → **STOP IMMEDIATELY**

2. ✅ Find the source file
   - Look in `src/` directory
   - Path mapping: `extension/path/file.js` → `src/path/file.ts`

3. ✅ Edit the source file
   - Edit the TypeScript source in `src/`
   - NOT the compiled JavaScript in `extension/`

4. ✅ Build after editing
   ```bash
   npx tsc
   bash scripts/sync-extension-from-dist.sh
   ```

## Validation Tools

### Before Editing
Run the pre-edit check:
```bash
bash scripts/pre-edit-check.sh <file-path>
```

### Before Committing
Run the validation script:
```bash
bash scripts/validate-no-extension-edits.sh
```

## How It's Enforced

1. **`.cursorignore`** - Blocks Cursor from seeing/editing `extension/` files
2. **`.cursorrules`** - Explicit rules with violation handling
3. **Validation Script** - Detects and blocks commits to `extension/`
4. **Pre-edit Check** - Validates file paths before editing

## Example Workflow

**❌ WRONG:**
```
User: "Edit extension/features/MessagesModule.js"
Agent: [Edits extension/features/MessagesModule.js] ❌ BLOCKED
```

**✅ CORRECT:**
```
User: "Edit extension/features/MessagesModule.js"
Agent: 
  1. Detects path starts with "extension/"
  2. Finds source: src/features/MessagesModule.ts
  3. Edits: src/features/MessagesModule.ts ✅
  4. Runs: npx tsc && sync-extension-from-dist.sh
  5. Result: extension/ updated automatically
```

## Violation Consequences

- ❌ Edit will be rejected
- ❌ Commit will be blocked
- ❌ Changes will be lost on next build
- ❌ Violation logged

**DO NOT VIOLATE THESE RULES**

