# System Prompt Addition - TypeScript Enforcement

**For adding to AI assistant system prompt / instructions**

## Required Addition to System Prompt

Add this section to the system prompt to prevent editing compiled JavaScript files:

---

## TypeScript Project File Editing Rules (MANDATORY)

**CRITICAL**: This is a TypeScript project. Before editing ANY file, you MUST follow these rules:

### Pre-Edit Validation (REQUIRED)

**Before ANY file edit operation, you MUST:**

1. **Check File Path**:
   - ✅ **ALLOW**: Files in `src/` directory (TypeScript source)
   - ✅ **ALLOW**: Hand-authored files explicitly documented (e.g., `sidepanel/buildGraph.js` if marked as hand-authored)
   - ✅ **ALLOW**: Configuration files (`.json`, `.md`, `.sh`, `.html`, `.css`, etc.)
   - ❌ **REJECT**: Files in `extension/` directory (compiled output)
   - ❌ **REJECT**: Files in `dist/` directory (compiled output)
   - ❌ **REJECT**: Files in `build/` directory (compiled output)
   - ❌ **REJECT**: `.js` files in `sidepanel/` if corresponding `.ts` exists in `src/sidepanel/`

2. **If Edit Target is Compiled JS**:
   - **STOP** - Do not edit the compiled file
   - **FIND** - Locate the TypeScript source file:
     - `extension/path/to/file.js` → `src/path/to/file.ts`
     - `dist/path/to/file.js` → `src/path/to/file.ts`
     - `sidepanel/path/to/file.js` → `src/sidepanel/path/to/file.ts`
   - **EDIT** - Edit the TypeScript source file instead
   - **LOG** - Inform user: "Redirected edit from {jsPath} to {tsPath} (compiled JS files cannot be edited)"
   - **BUILD** - After editing TypeScript, run build process:
     - `npx tsc --project tsconfig.json`
     - `bash scripts/sync-extension-from-dist.sh`

3. **If TypeScript Source Not Found**:
   - **WARN** - Inform user: "No TypeScript source found for {jsPath}"
   - **ASK** - "Is this a hand-authored JS file? Should it be migrated to TypeScript?"
   - **WAIT** - Do not proceed until user confirms

### Violation Handling

**If you attempt to edit a compiled JS file:**
- ❌ **STOP** immediately
- 🔍 **FIND** TypeScript source
- ✅ **REDIRECT** edit to TypeScript source
- 📝 **LOG** the redirection
- 🔨 **BUILD** after edit

**DO NOT:**
- Edit files in `extension/`, `dist/`, `build/` directories
- Edit compiled `.js` files when `.ts` source exists
- Proceed with edit without path validation

### Example Workflow

**User Request**: "Edit `sidepanel/controllers/TabController.js`"

**Correct Response**:
```
❌ Cannot edit compiled JS file: sidepanel/controllers/TabController.js
🔍 Found TypeScript source: src/sidepanel/controllers/TabController.ts
✅ Redirecting edit to TypeScript source
📝 Editing: src/sidepanel/controllers/TabController.ts
🔨 Building: npx tsc && sync-extension
✅ Changes compiled to JavaScript automatically
```

**Incorrect Response** (DO NOT DO THIS):
```
❌ Editing: sidepanel/controllers/TabController.js
```

### Path Pattern Matching

Use these patterns to identify compiled files:

```javascript
// Restricted directories
const restrictedDirs = ['extension/', 'dist/', 'build/'];

// Restricted patterns
const restrictedPatterns = [
  /^sidepanel\/.*\.js$/,   // Compiled JS in sidepanel (if .ts exists)
  /^extension\/.*\.js$/,    // Compiled JS in extension
  /^dist\/.*\.js$/,         // Compiled JS in dist
  /^build\/.*\.js$/         // Compiled JS in build
];

// Exception: Hand-authored files (must be explicitly documented)
const handAuthoredFiles = [
  'sidepanel/buildGraph.js',  // If documented as hand-authored
  // Add other exceptions only if explicitly documented
];
```

### Build Process After TypeScript Edit

**After editing any TypeScript file in `src/`:**

1. Run TypeScript compiler:
   ```bash
   npx tsc --project tsconfig.json
   ```

2. Sync compiled files to extension:
   ```bash
   bash scripts/sync-extension-from-dist.sh
   ```

3. Verify changes:
   - Check that compiled JS reflects TypeScript changes
   - Ensure no build errors

### Special Cases

**Hand-Authored JavaScript Files:**
- Some files may be intentionally JavaScript (not compiled from TypeScript)
- These must be explicitly documented
- If not documented, assume they should be migrated to TypeScript
- Always ask user before editing undocumented JS files

**Configuration Files:**
- `.json`, `.md`, `.sh`, `.html`, `.css` files can be edited directly
- These are not compiled outputs

---

## Integration Instructions

Add this section to the system prompt under:

1. **File Editing Rules** section
2. **Before Making Code Changes** section
3. **TypeScript Project Guidelines** section

Or create a dedicated **"TypeScript Enforcement"** section.

## Testing

After adding to system prompt, test with:

1. Request to edit `extension/some/file.js` → Should redirect to `src/some/file.ts`
2. Request to edit `sidepanel/controllers/TabController.js` → Should redirect to `src/sidepanel/controllers/TabController.ts`
3. Request to edit `src/some/file.ts` → Should proceed normally
4. Request to edit `package.json` → Should proceed normally (config file)

---

**Status**: Ready for system prompt integration

