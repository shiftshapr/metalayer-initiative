# Diagnostic Scripts

## diagnose-features-types.ts

Enhanced diagnostic script for detecting TypeScript errors in feature files with full project type checking.

### Features
- **Full Project Type Checking**: Uses `tsc --noEmit` to catch cross-file dependency errors
- **Cross-File Error Detection**: Identifies errors in other files that import from feature files
- **Error Categorization**: Groups errors by type code (TS6133, TS2322, etc.)
- **Detailed Reporting**: Shows file, line number, error code, and message for each error

### Usage
```bash
npx tsx presence/src/scripts/diagnose-features-types.ts
```

### Output
- Lists all errors in feature files
- Marks cross-file dependency errors
- Shows error type distribution
- Exits with code 1 if errors found, 0 if clean

## check-interface-exports.ts

Pre-commit hook script to check for missing interface exports.

### Features
- **TS2305 Detection**: Specifically checks for "module has no exported member" errors
- **Staged Files Only**: Only checks TypeScript files that are staged for commit
- **Clear Error Messages**: Provides actionable feedback on how to fix issues

### Usage
```bash
# Manual check
npx tsx presence/src/scripts/check-interface-exports.ts

# Via npm script
npm run check:interface-exports

# Automatically via pre-commit hook
git commit  # Hook runs automatically
```

### Integration
The script is integrated into:
- `.git/hooks/pre-commit` - Runs automatically on commit
- `package.json` - `npm run check:interface-exports` and `npm run precommit:types`

### Pattern Detected
When a class uses `implements InterfaceName`, the interface must be exported from the module where it's defined. This prevents TS2305 errors.

### Example Error
```
❌ Missing interface exports detected:

presence/src/features/MyClass.ts(10,3): error TS2305: Module '"../types/MyTypes"' has no exported member 'MyInterface'.

💡 Fix: Export the interface from the module where it's defined.
   Pattern: When a class implements an interface, the interface must be exported.
```
