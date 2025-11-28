# Utilities to Convert to ES6 TypeScript Modules

## Summary
Several utilities are currently accessed via `window.*` and should be converted to ES6 TypeScript modules for better type safety, tree-shaking, and maintainability.

## ✅ Already Converted

1. **`normalizeUrl`** - `src/utils/UrlNormalization.ts`
   - Status: ✅ Complete
   - Exports: `normalizeUrl(rawUrl: string): Promise<NormalizationResult>`
   - Used in: `MessagesModule.js`

## ⚠️ Pending Conversion

### 1. URL Utilities (`src/utils/`)

#### `getCurrentPageUri`
- **Current Location**: `sidepanel.js` (line 778)
- **Current Usage**: `window.getCurrentPageUri()`
- **Function**: Gets the active tab URL using Chrome tabs API
- **Should Export**: `getCurrentPageUri(): Promise<string | null>`
- **Dependencies**: Chrome tabs API
- **Used In**: 
  - `sidepanel.js` (normalizeCurrentUrl)
  - `utils/ComprehensiveDiagnostic.js`

#### `normalizeCurrentUrl`
- **Current Location**: `sidepanel.js` (line 799)
- **Current Usage**: `window.normalizeCurrentUrl()`
- **Function**: Normalizes the current page URL (uses normalizeUrl)
- **Should Export**: `normalizeCurrentUrl(): Promise<NormalizationResult>`
- **Dependencies**: `getCurrentPageUri`, `normalizeUrl`
- **Used In**:
  - `sidepanel.js`
  - `features/RealtimeManager.js`
  - `utils/ComprehensiveDiagnostic.js`

### 2. User Utilities (`src/utils/` or `src/core/`)

#### `getCurrentUserId`
- **Current Location**: `extension/features/AuthModule.js` (line 528)
- **Current Usage**: `window.getCurrentUserId()`
- **Function**: Gets current user ID from stateManager
- **Should Export**: `getCurrentUserId(): Promise<string | null>`
- **Dependencies**: `stateManagerInstance`, `getCurrentUserEmail`
- **Status**: Already exported from AuthModule.js but still on window
- **Used In**:
  - `features/RealtimeManager.js`

#### `getCurrentUserEmail`
- **Current Location**: `extension/features/AuthModule.js` (line 552)
- **Current Usage**: `window.getCurrentUserEmail()`
- **Function**: Gets current user email from stateManager or auth
- **Should Export**: `getCurrentUserEmail(): Promise<string | null>`
- **Dependencies**: `stateManagerInstance`, `window.realGoogleAuth`, `window.authManager`
- **Status**: Already exported from AuthModule.js but still on window
- **Used In**:
  - `sidepanel.js`
  - `features/RealtimeManager.js`
  - `extension/services/APIService.js`

#### `getCurrentUserAvatarColor`
- **Current Location**: `extension/features/AuthModule.js` (line 629)
- **Current Usage**: `window.getCurrentUserAvatarColor()`
- **Function**: Gets custom avatar color or generates from email
- **Should Export**: `getCurrentUserAvatarColor(): Promise<string>`
- **Dependencies**: `window.getState`, `getCurrentUserEmail`, `window.getAvatarColor`
- **Used In**: Various places for avatar rendering

#### `getCurrentUserAvatarBgColor`
- **Current Location**: `extension/features/AuthModule.js` (line 674)
- **Current Usage**: `window.getCurrentUserAvatarBgColor()`
- **Function**: Gets user's aura color from stateManager
- **Should Export**: `getCurrentUserAvatarBgColor(): string`
- **Dependencies**: `stateManagerInstance`
- **Used In**: Profile avatar rendering

### 3. State Utilities

#### `getState` wrapper
- **Current Location**: `sidepanel.js` (line 3405)
- **Current Usage**: `window.getState(key)`
- **Function**: Wrapper around StateManager.getState
- **Should Export**: Not needed - use `stateManagerInstance.getState()` directly
- **Status**: StateManager already exists as TypeScript ES6 module
- **Recommendation**: Remove window wrapper, use direct import

## Recommended Conversion Order

1. **URL Utilities** (High Priority)
   - `getCurrentPageUri` → `src/utils/UrlUtils.ts`
   - `normalizeCurrentUrl` → `src/utils/UrlUtils.ts` (uses normalizeUrl)

2. **User Utilities** (Medium Priority)
   - `getCurrentUserId` → `src/utils/UserUtils.ts` or `src/core/UserModule.ts`
   - `getCurrentUserEmail` → `src/utils/UserUtils.ts` or `src/core/UserModule.ts`
   - `getCurrentUserAvatarColor` → `src/utils/UserUtils.ts`
   - `getCurrentUserAvatarBgColor` → `src/utils/UserUtils.ts`

3. **State Utilities** (Low Priority)
   - Remove `window.getState` wrapper
   - Update all callers to use `stateManagerInstance.getState()` directly

## Benefits of Conversion

1. **Type Safety**: TypeScript types prevent runtime errors
2. **Tree Shaking**: Unused utilities can be eliminated from bundle
3. **Better IDE Support**: Autocomplete and type checking
4. **Easier Testing**: ES6 modules are easier to mock and test
5. **No Global Pollution**: Avoids `window.*` namespace pollution
6. **Explicit Dependencies**: Import statements show dependencies clearly

## Migration Strategy

1. Create new TypeScript utility files in `src/utils/`
2. Export functions as ES6 modules
3. Update imports in consuming files
4. Remove `window.*` assignments
5. Test thoroughly
6. Remove old implementations once migration complete




