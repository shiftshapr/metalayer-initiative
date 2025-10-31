# Archive Directory

This directory contains archived files that are no longer actively used in the codebase but are preserved for historical reference and potential future use.

## Directory Structure

### `/console-scripts/`
**Purpose**: Temporary console debugging scripts used during development  
**Contents**: Browser console debugging scripts for avatar fixes, diagnostic code, etc.  
**Status**: Safe to delete if space is needed, but preserved for reference  
**Last Archived**: 2025-10-31

### `/test-files/`
**Purpose**: Test files and test suites  
**Contents**: Comprehensive test files, reaction tests, avatar tests, etc.  
**Status**: May be needed for future testing or CI/CD integration  
**Last Archived**: 2025-10-31

### `/diagnostic-scripts/`
**Purpose**: One-time diagnostic and debugging scripts  
**Contents**: Visibility diagnostics, reaction diagnostics, API diagnostics, etc.  
**Status**: May be useful for troubleshooting specific issues  
**Last Archived**: 2025-10-31

### `/fix-scripts/`
**Purpose**: One-time fix scripts that have been integrated into main codebase  
**Contents**: Database fixes, avatar URL fixes, reaction modal fixes, etc.  
**Status**: Fixes have been integrated - these are historical reference only  
**Last Archived**: 2025-10-31

### `/sql-migrations/`
**Purpose**: SQL migration scripts that have been applied to the database  
**Contents**: Database migrations, schema updates, RLS fixes, etc.  
**Status**: Historical reference - all migrations have been applied  
**Last Archived**: 2025-10-31

## Legacy Server Files

The following legacy server files have been archived to `/legacy-servers/`:
- `canopi2-server.js` - Legacy server implementation (replaced by app.js)
- `push-sync-server.js` - Push synchronization server (development tool)
- `webhook-sync.js` - Webhook synchronization (development tool)

**Status**: Archived - verified not in use by PM2 or production code

**Note**: `websocket-server.js` remains in root directory - verify if needed separately before archiving

## Archive Policy

1. Files are moved here (not deleted) to preserve history
2. Before archiving, verify:
   - File is not referenced in production code
   - File is not needed by CI/CD pipelines
   - Fixes have been integrated (for fix-scripts)
   - Migrations have been applied (for sql-migrations)
3. Can be safely deleted after 6+ months if confirmed unused
4. Maintain this README with updates

## Restoration

To restore a file:
```bash
# Example: Restore a console script
mv archive/console-scripts/console_debug_appuser_avatar.js ./
```

**Note**: Only restore if you understand what the file does and why it was archived.

---
**Archived by**: SD3 Codebase Cleanup Agent  
**Date**: 2025-10-31  
**Method**: Systematic analysis → Verification → Archive

