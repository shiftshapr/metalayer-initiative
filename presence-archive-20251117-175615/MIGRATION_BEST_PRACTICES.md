# TypeScript Migration - Best Practices

## ✅ Correct Approach: Pure ES6 Modules

### What We're Doing (Correct)
- **Pure ES6 module exports** in TypeScript source
- **No window globals** in TypeScript source
- **Singleton instances** exported for direct use
- **Type-safe imports** throughout

### Example (Correct):
```typescript
// src/features/VisibilitySettingsManager.ts
class VisibilitySettingsManager {
  // ... implementation
}

// Create singleton instance
const visibilitySettingsManagerInstance = new VisibilitySettingsManager();

// Export as ES6 module
export { VisibilitySettingsManager, visibilitySettingsManagerInstance };
export default VisibilitySettingsManager;

// Note: Window exports will be added in compiled JS for backward compatibility
// TypeScript source uses pure ES6 exports only
```

### Usage (Correct):
```typescript
// Other TypeScript files
import { visibilitySettingsManagerInstance } from './features/VisibilitySettingsManager.js';
// or
import VisibilitySettingsManager from './features/VisibilitySettingsManager.js';
const manager = new VisibilitySettingsManager();
```

---

## ❌ Wrong Approach: Window Globals

### What We're NOT Doing
- **No window exports** in TypeScript source
- **No global access patterns** in TypeScript
- **No auto-initialization** in TypeScript source

### Example (Wrong - DON'T DO THIS):
```typescript
// ❌ WRONG - Don't do this in TypeScript source
window.VisibilitySettingsManager = VisibilitySettingsManager;
window.visibilitySettingsManager = new VisibilitySettingsManager();
```

---

## Why This Matters

1. **Type Safety**: ES6 imports provide full type checking
2. **Tree Shaking**: Unused exports can be eliminated
3. **Module Boundaries**: Clear dependencies between modules
4. **Testability**: Easy to mock and test
5. **IDE Support**: Better autocomplete and refactoring
6. **Future-Proof**: Aligns with modern JavaScript standards

---

## No Backward Compatibility Needed (Re-Launch)

Since we're re-launching:
- **TypeScript source**: Pure ES6 modules (no window exports)
- **Compiled JS**: Pure ES6 modules (no window exports)
- **All code**: Uses ES6 imports/exports throughout
- **No legacy support**: Clean break from old architecture

---

## Migration Pattern

For every module conversion:
1. ✅ Remove all `window.` assignments from TypeScript source
2. ✅ Export as ES6 module (`export { Class, instance }`)
3. ✅ Create singleton instance if needed
4. ✅ Update imports in other TypeScript files
5. ✅ NO window exports anywhere (pure ES6 modules only)

---

*This ensures we build a solid, modern foundation!* 💪

