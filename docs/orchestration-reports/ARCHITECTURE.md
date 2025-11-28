# Architecture: Source vs Build Directories

## ⚠️ CRITICAL RED-LINE RULE

**NEVER edit files in `extension/`, `dist/`, or `build/` directories.**

These are **BUILD OUTPUTS** - they are generated from `src/` files.

## Directory Structure

```
src/              ← EDIT HERE (TypeScript source)
  ├── features/   ← Source modules
  ├── services/   ← Source services
  ├── utils/      ← Source utilities
  └── ...

extension/        ← BUILD OUTPUT (DO NOT EDIT)
  ├── features/   ← Generated from src/features/
  └── ...

dist/             ← BUILD OUTPUT (DO NOT EDIT)
  └── ...

build/            ← BUILD OUTPUT (DO NOT EDIT)
  └── ...
```

## Workflow

1. **Edit** files in `src/` (TypeScript)
2. **Build** to generate `extension/` files
3. **Never** edit `extension/` directly

## Build Process

Files in `extension/` are generated from `src/` via:
- TypeScript compilation
- Module bundling
- Asset copying

**If you need to change functionality:**
1. Find or create the source file in `src/`
2. Edit the `src/` file
3. Run build process
4. `extension/` files will be regenerated

## Exceptions

Only these file types can be edited in `extension/`:
- `.md` files (documentation)
- `.gitignore`
- `.gitattributes`

## Prevention

Multiple layers prevent editing `extension/`:
1. ✅ Pre-commit hook (blocks commits)
2. ✅ Validation script (`prevent-extension-edits.js`)
3. ✅ `.gitattributes` (marks as generated)
4. ✅ `.cursorrules` (AI guidance)
5. ✅ This documentation

## If You See a File Only in `extension/`

**DO NOT EDIT IT DIRECTLY**

Instead:
1. Check if source exists in `src/` (may be named differently)
2. If not, **create** the TypeScript source in `src/`
3. Migrate the logic to TypeScript
4. Build to generate `extension/` version

## Examples

### ❌ WRONG:
```bash
# Editing extension/ file directly
vim extension/features/SomeModule.js
```

### ✅ CORRECT:
```bash
# Edit source file
vim src/features/SomeModule.ts
# Then build
npm run build
```

## Questions?

If a file only exists in `extension/` and you need to change it:
1. **STOP** - don't edit it
2. **ASK** - clarify architecture
3. **CREATE** - source file in `src/` if needed
4. **MIGRATE** - move logic to TypeScript source

**This is a RED-LINE. Violations will be blocked automatically.**

