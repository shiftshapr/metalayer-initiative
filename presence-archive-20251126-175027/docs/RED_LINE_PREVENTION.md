# Red-Line Prevention: extension/ Directory Edits

## Problem

Agents repeatedly violate the red-line rule by editing files in `extension/`, `dist/`, `build/` directories directly. These are build outputs and should NEVER be edited.

## Prevention Layers

### 1. Pre-Commit Hook ✅
- **Location:** `.husky/pre-commit`
- **Action:** Blocks commits that modify `extension/`, `dist/`, `build/` files
- **Status:** Active

### 2. Validation Scripts ✅
- **Location:** `scripts/prevent-extension-edits.js`
- **Location:** `scripts/validate-file-location.js`
- **Action:** Validates file paths before editing
- **Usage:** Can be integrated into editor hooks

### 3. Git Attributes ✅
- **Location:** `.gitattributes`
- **Action:** Marks `extension/`, `dist/`, `build/` as generated files
- **Status:** Active

### 4. Cursor Rules ✅
- **Location:** `.cursorrules`
- **Action:** AI guidance to never edit build directories
- **Status:** Active

### 5. Architecture Documentation ✅
- **Location:** `ARCHITECTURE.md`
- **Action:** Clear documentation of source vs build
- **Status:** Active

### 6. VS Code Settings ✅
- **Location:** `.vscode/settings.json`
- **Action:** Marks extension/ files as readonly in editor
- **Status:** Active

## How It Works

### Pre-Commit Hook
```bash
# Automatically runs on git commit
# Blocks if any extension/, dist/, build/ files are modified
```

### Validation Script
```bash
# Can be run manually
node scripts/prevent-extension-edits.js <file-path>

# Or integrated into editor
```

### Git Attributes
```gitattributes
# Marks directories as generated
extension/** linguist-generated=true
```

## What Happens on Violation

1. **Pre-commit hook** blocks the commit
2. **Error message** shows which file violated
3. **Instructions** provided on how to fix
4. **Commit rejected** until violation fixed

## Architecture Reminder

```
src/          → Source (TypeScript) - EDIT HERE
  ↓ build
extension/    → Build output (JavaScript) - NEVER EDIT
```

## If File Only Exists in extension/

**DO NOT EDIT IT**

Instead:
1. Check if source exists in `src/` (may have different name)
2. If not, create TypeScript source in `src/`
3. Migrate logic to TypeScript
4. Build to generate `extension/` version

## Testing Prevention

```bash
# Try to commit a change to extension/ (should fail)
git add extension/features/SomeModule.js
git commit -m "test"
# ❌ Should be blocked by pre-commit hook
```

## Maintenance

- Pre-commit hook: Automatically runs
- Validation scripts: Run manually or integrate
- Documentation: Update as architecture changes
- Cursor rules: Update as needed

## Status

✅ **All prevention layers active**
✅ **Pre-commit hook blocks violations**
✅ **Documentation complete**
✅ **Validation scripts ready**

**This should prevent ALL future violations.**




