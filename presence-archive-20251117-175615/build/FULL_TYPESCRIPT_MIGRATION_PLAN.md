# Full TypeScript Migration Plan

## Objective
Convert all JavaScript files to TypeScript with ES6 modules, removing all window globals.

---

## Current State

### TypeScript Files (35)
- ✅ `src/features/CanopiModule.ts` - Pure ES6, no window exports
- ✅ `src/utils/Logger.ts`
- ✅ `src/utils/AvatarUtils.ts`
- ✅ `src/features/VisibilityManager.ts`
- ✅ Other core/utils/services modules

### JavaScript Files to Migrate (143)
**Priority 1 (Critical - Use CanopiModule):**
- `features/CommunitiesModule.js` (1,068 lines)
- `sidepanel.js` (3,464 lines)
- `features/APIModule.js` (~500 lines)
- `features/ProfileManager.js` (~2,000 lines)
- `features/UIManager.js` (~1,200 lines)

**Priority 2 (Feature Modules):**
- `features/VisibilityModalHandler.js`
- `features/AuthModule.js`
- Other feature modules

**Priority 3 (Utilities):**
- Various utility files
- Diagnostic files (can migrate later)

---

## Migration Strategy

### Phase 1: Core Dependencies (IMMEDIATE)
1. **CommunitiesModule.js → CommunitiesModule.ts**
   - Uses `loadChatHistory` from CanopiModule
   - Convert to ES6 module
   - Use `import { loadChatHistory } from './CanopiModule.js'`

### Phase 2: Main Application (HIGH PRIORITY)
2. **sidepanel.js → sidepanel.ts**
   - Large file (3400+ lines)
   - Main entry point
   - Convert to ES6 module
   - Use imports for all dependencies

### Phase 3: Feature Modules (MEDIUM PRIORITY)
3. **APIModule.js → APIModule.ts**
4. **ProfileManager.js → ProfileManager.ts**
5. **UIManager.js → UIManager.ts**

### Phase 4: Cleanup (FINAL)
6. Remove all window exports from compiled JS
7. Update HTML to load as ES6 modules
8. Remove verification scripts

---

## Migration Steps (Per File)

### Step 1: Create TypeScript File
```bash
# Copy JS to src/ as TS
cp features/CommunitiesModule.js src/features/CommunitiesModule.ts
```

### Step 2: Add TypeScript Types
```typescript
// Add imports
import { loadChatHistory } from './CanopiModule.js';
import { Logger } from '../utils/Logger.js';

// Add types
interface Community {
  id: string;
  name: string;
  // ...
}

class CommunitiesModule {
  private logger: Logger;
  // ...
}
```

### Step 3: Replace Window Globals
```typescript
// BEFORE
if (typeof window.loadChatHistory === 'function') {
  await window.loadChatHistory(null, activeCommunities);
}

// AFTER
import { loadChatHistory } from './CanopiModule.js';
await loadChatHistory(null, activeCommunities);
```

### Step 4: Add ES6 Exports
```typescript
// Export class
export { CommunitiesModule };
export default CommunitiesModule;
```

### Step 5: Update HTML
```html
<!-- BEFORE -->
<script src="features/CommunitiesModule.js"></script>

<!-- AFTER -->
<script type="module" src="features/CommunitiesModule.js"></script>
```

### Step 6: Compile
```bash
# Compile TypeScript
npx tsc src/features/CommunitiesModule.ts --outDir features --module es2020 --target es2020
```

---

## File-by-File Migration Plan

### 1. CommunitiesModule.js → CommunitiesModule.ts

**Dependencies:**
- `CanopiModule.loadChatHistory` → `import { loadChatHistory }`
- `StateManager` → `import { StateManager } from '../core/StateManager.js'`
- `APIModule` → `import { api } from './APIModule.js'` (or convert APIModule first)

**Window Globals to Remove:**
- `window.loadChatHistory` → ES6 import
- `window.getState` → Import StateManager
- `window.setState` → Import StateManager

**Estimated Time:** 2-3 hours

---

### 2. sidepanel.js → sidepanel.ts

**Dependencies:**
- `CanopiModule.loadChatHistory` → `import { loadChatHistory }`
- `CommunitiesModule` → `import { CommunitiesModule }`
- Many other modules

**Window Globals to Remove:**
- `window.loadChatHistory` → ES6 import
- `window.CanopiModule` → ES6 import
- Many others

**Challenges:**
- Very large file (3400+ lines)
- Many dependencies
- Complex initialization logic

**Estimated Time:** 6-8 hours

**Alternative:** Keep as JS but use dynamic imports:
```javascript
const { loadChatHistory } = await import('./features/CanopiModule.js');
```

---

### 3. APIModule.js → APIModule.ts

**Dependencies:**
- Supabase client
- ConfigModule

**Window Globals:**
- `window.api` → Export as `api`
- `window.supabase` → Import from SupabaseService

**Estimated Time:** 2-3 hours

---

### 4. ProfileManager.js → ProfileManager.ts

**Dependencies:**
- Many modules
- Complex state management

**Estimated Time:** 4-6 hours

---

### 5. UIManager.js → UIManager.ts

**Dependencies:**
- Theme management
- Tab navigation
- Message input

**Estimated Time:** 3-4 hours

---

## Build Process Updates

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "outDir": "./",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Build Script
```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "build:extension": "tsc && echo 'Build complete'"
  }
}
```

---

## HTML Updates

### sidepanel.html

**Before:**
```html
<script src="features/CommunitiesModule.js"></script>
<script src="sidepanel.js"></script>
<script>
  // Verification scripts checking window globals
</script>
```

**After:**
```html
<script type="module" src="features/CommunitiesModule.js"></script>
<script type="module" src="sidepanel.js"></script>
<!-- No verification scripts needed - modules handle loading -->
```

---

## Testing Strategy

### After Each Migration
1. **Compile** - Ensure TypeScript compiles without errors
2. **Load Extension** - Verify extension loads
3. **Test Functionality** - Ensure migrated feature works
4. **Check Console** - No errors related to missing globals

### Final Testing
1. **Full Extension Test** - All features work
2. **No Window Globals** - Search codebase for `window.loadChatHistory`, etc.
3. **Type Safety** - TypeScript catches errors
4. **Performance** - No regressions

---

## Rollback Plan

### If Migration Fails
1. Keep compiled JS files
2. Revert HTML changes
3. Restore window exports temporarily
4. Fix issues and retry

---

## Success Criteria

### ✅ Migration Complete When:
1. All critical files converted to TypeScript
2. No `window.loadChatHistory` in codebase
3. No `window.CanopiModule` in codebase
4. All files use ES6 imports/exports
5. TypeScript compiles without errors
6. Extension works correctly
7. No window global dependencies

---

## Timeline Estimate

- **Phase 1 (CommunitiesModule):** 2-3 hours
- **Phase 2 (sidepanel.js):** 6-8 hours
- **Phase 3 (Feature Modules):** 10-15 hours
- **Phase 4 (Cleanup):** 2-3 hours
- **Testing:** 4-6 hours
- **Total:** 24-35 hours

---

## Next Steps

1. **Start with CommunitiesModule** - Smallest, most critical
2. **Then sidepanel.js** - Main entry point
3. **Then feature modules** - One by one
4. **Finally cleanup** - Remove all window exports

---

## Notes

- Keep compiled JS files until migration is complete
- Test after each file migration
- Update HTML incrementally
- Document any issues encountered

