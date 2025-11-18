# Distribution Cleanup Plan

## Problem
The `presence/` directory (extension distribution) is polluted with:
- 140+ markdown documentation files
- TypeScript source files in `presence/src/` (should be in `src/presence/` outside distribution)
- `dist/` directory (compiled files should be in `presence/` root, not `dist/`)
- Build scripts, SQL migrations, test files
- Temporary/diagnostic files

This increases bundle size and confuses deployment.

## Solution

### 1. Cleanup Scripts Created
- **`scripts/cleanup-distribution.sh`** - Removes non-distribution files (archives them for safety)
- **`scripts/build-distribution.sh`** - Full build process: compile TypeScript → cleanup → verify

### 2. Build Process
```bash
# Build extension distribution
npm run build:extension

# Or manually:
cd presence
bash scripts/build-distribution.sh
```

### 3. Distribution Structure
**Allowed in distribution:**
- `manifest.json`
- `sidepanel.html`, `sidepanel.css`, `sidepanel.js`
- `background.js`, `content.js`, `content.css`
- `core/`, `features/`, `utils/`, `services/` (compiled JavaScript from `src/presence/`)
- `images/`, `lib/`, `auth/` (assets)
- Core runtime JS files

**NOT allowed in distribution:**
- `*.md` files (documentation)
- `src/` directory (TypeScript source - should be in `src/presence/` outside distribution)
- `dist/` directory (compiled files go directly to `presence/` root)
- `*.ts` files in root
- `*.sh` scripts in root
- `*.sql` migrations
- `tests/`, `*test*.js` files
- Diagnostic/temporary files

### 4. Prevention Rules
Updated `.cursorrules` with RED-LINE policy:
- Never create `.md` files in `presence/` root
- Never put TypeScript source in `presence/` - it belongs in `src/presence/` (outside distribution)
- Always compile `src/presence/` → `presence/` (directly to distribution root, not `dist/`)
- Use `scripts/build-distribution.sh` before distribution

### 5. Cleanup Execution
```bash
# Archive and remove non-distribution files
npm run clean:presence

# Or manually:
cd presence
bash scripts/cleanup-distribution.sh
```

Files are archived to `../presence-archive-TIMESTAMP/` for safety review.

## Next Steps
1. ✅ Created cleanup scripts
2. ✅ Updated `.cursorrules` with distribution rules
3. ✅ Created `tsconfig.json` for proper compilation
4. ✅ Updated `package.json` with build scripts
5. ⏳ **Run cleanup** (when ready): `npm run clean:presence`
6. ⏳ **Verify build**: `npm run build:extension`
7. ⏳ **Review archive** before deleting

## Notes
- Test scripts that are actively loaded are acceptable temporarily but should be cleared over time
- Source maps (`.map` files) are removed by default but can be kept for debugging if needed
- TypeScript source should be in `src/presence/` (outside the distribution)
- Compiled JavaScript goes directly to `presence/` root directories (`core/`, `features/`, etc.), NOT into a `dist/` subdirectory

