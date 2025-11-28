# Sidepanel File Structure

## ✅ CORRECT Structure

### Source File (EDIT THIS)
- **`src/sidepanel/Sidepanel.ts`** - TypeScript source file
  - This is the ONLY file that should be edited
  - Compiles to `dist/sidepanel/Sidepanel.js`
  - Copied to `extension/sidepanel/Sidepanel.js` during build

### Compiled Files (DO NOT EDIT)
- `dist/sidepanel/Sidepanel.js` - Compiled from TypeScript source
- `extension/sidepanel/Sidepanel.js` - Copied from dist/ during build sync

### HTML Reference
- `sidepanel.html` references: `sidepanel/Sidepanel.js` (capital S)
  - This loads the compiled file from `extension/sidepanel/Sidepanel.js`

## ❌ REMOVED Files

- ~~`extension/sidepanel.js`~~ - **LEGACY FILE REMOVED**
  - This was a duplicate/legacy file that should not exist
  - All functionality is now in `src/sidepanel/Sidepanel.ts`

## Rules

1. ✅ **ALWAYS edit**: `src/sidepanel/Sidepanel.ts`
2. ❌ **NEVER edit**: `dist/sidepanel/Sidepanel.js` or `extension/sidepanel/Sidepanel.js`
3. ✅ **Build process**: TypeScript compiles `src/` → `dist/`, then sync script copies to `extension/`
4. ✅ **Single source of truth**: Only `src/sidepanel/Sidepanel.ts` exists as source

## Build Flow

```
src/sidepanel/Sidepanel.ts
  ↓ (TypeScript compilation)
dist/sidepanel/Sidepanel.js
  ↓ (sync-extension-from-dist.sh)
extension/sidepanel/Sidepanel.js
  ↓ (loaded by)
sidepanel.html
```

---

**Status**: ✅ **FIXED** - Single source file, no duplicates

