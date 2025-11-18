# Timeline Red-Line Rules

## CRITICAL: No Window Globals for Extension Code

**RED-LINE**: Timeline scripts (standalone web pages) MUST import modules directly via ES6 imports. They CANNOT rely on `window` globals from extension scripts.

### Why?
- Timeline pages are **standalone web pages** that run independently
- Extension scripts may **not be loaded** when viewing timeline pages
- Using `window.extensionModule` will fail if extension isn't loaded
- This causes runtime errors and broken functionality

### ✅ CORRECT: Import as ES6 Module
```javascript
// Timeline script
import { AvatarUtils } from '/presence/utils/AvatarUtils.js';
import { AuthManager } from '/presence/features/AuthManager.js';
import { SupabaseService } from '/presence/services/SupabaseService.js';

// Use directly
const avatar = await AvatarUtils.createUnifiedAvatar(user, 'message');
const authManager = new AuthManager();
const supabaseService = new SupabaseService();
const client = await supabaseService.initialize();
```

### ❌ WRONG: Rely on Window Global
```javascript
// Timeline script
// DON'T DO THIS - extension may not be loaded!
if (window.AvatarUtils) {
  await window.AvatarUtils.createUnifiedAvatar(user, 'message');
}
if (window.supabase) {
  window.supabase.from('messages').select();
}
```

### Affected Files
- `public/timelines/components/TimelineView.js` - ✅ Fixed: Now imports AvatarUtils
- `public/timelines/timeline-app.js` - ✅ Fixed: Now imports AvatarUtils, AuthManager, SupabaseService
- `public/timelines/modules/TimelineQuery.js` - ✅ Fixed: Now imports AuthManager, removed window.supabase
- `public/timelines/timeline-reaction-fix.js` - ✅ Fixed: Removed window.api checks
- Any future timeline modules must import dependencies directly

### Related Red-Lines
- See `RED_LINES.md` for general project red-lines
- Extension scripts can use `window` globals (they control the environment)
- Standalone web pages must import modules (they don't control the environment)

### Date Logged
2025-11-15: Initial red-line logged after fixing TimelineView.js and timeline-app.js to import AvatarUtils instead of using window.AvatarUtils

### Fixed - All Window References Removed
- ✅ `window.AvatarUtils` - Now imported as ES6 module
- ✅ `window.AuthManager` - Now imported as ES6 module
- ✅ `window.SupabaseService` - Now imported as ES6 module
- ✅ `window.supabase` - Now using SupabaseService instance's getClient() method
- ✅ `window.supabaseRealtimeClient` - Removed (no longer needed)
- ✅ `window.api` - Removed from timeline-reaction-fix.js (no longer checks for extension)
- ✅ `window.createUnifiedMessageElement` - Now imported as ES6 module from CanopiModule
- ✅ `window.updateReactionDisplay` - Now imported as ES6 module from CanopiModule
- ✅ `window.addMessageActionListeners` - Now imported as ES6 module from CanopiModule
- ✅ `window.loadMessageReactions` - Now imported as ES6 module from CanopiModule

### CanopiModule ES6 Exports
CanopiModule now exports functions as ES6 modules:
- Functions are defined as `const` first (e.g., `const createUnifiedMessageElement = function...`)
- Then exported via `export { createUnifiedMessageElement, ... }`
- Also assigned to `window` for backward compatibility with extension scripts
- Timeline scripts import directly: `import { createUnifiedMessageElement } from '/presence/features/CanopiModule.js'`

### Verification
All window module references have been removed from timeline scripts. Timeline scripts now import all dependencies as ES6 modules:
- `AvatarUtils` - imported
- `AuthManager` - imported
- `SupabaseService` - imported
- `CanopiModule` functions - imported (createUnifiedMessageElement, updateReactionDisplay, addMessageActionListeners, loadMessageReactions)
