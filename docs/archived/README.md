# Archived Modules

This directory contains archived modules that are no longer in active use but kept for reference.

**IMPORTANT**: These files are archived and should NOT be imported or referenced in the codebase.

## CanopiModule.js

**Status**: Archived  
**Date**: 2025-01-24  
**Reason**: Functionality moved to MessagesModule  
**Location**: `presence/extension/features/MessagesModule.js`

### History
- Originally contained all message and chat functionality
- Deprecated in favor of modular architecture
- Split into MessagesModule and VisibilityModule
- Kept as wrapper for backward compatibility
- Finally archived when all references were updated

### Migration
All functionality has been moved to:
- `presence/extension/features/MessagesModule.js` - Message and chat functionality
- `presence/extension/features/VisibilityModule.js` - Visibility data management

### Notes
- This file is kept for historical reference only
- **DO NOT** import or reference this file
- All imports should use MessagesModule directly
- This archive is outside the extension folder to prevent accidental usage

