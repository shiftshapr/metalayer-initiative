# TypeScript Migration Plan

## Current State
- **Working COMP**: `presence/features/CanopiModule.js` (9,011 lines) - ✅ WORKING
- **TypeScript Source**: `presence/src/features/CanopiModule.ts` (1,865 lines) - ⚠️ INCOMPLETE
- **Type Definitions**: `presence/src/types/` - ✅ GOOD (keep)
- **Core Modules**: `presence/src/core/`, `src/utils/`, `src/services/` - ✅ KEEP

## Migration Strategy: Hybrid Approach

### Phase 1: Preserve Valuable TypeScript Work
**KEEP:**
- ✅ `src/types/` - Excellent type definitions, use as reference
- ✅ `src/core/` - Core modules (StateManager, EventBus, ConfigModule)
- ✅ `src/utils/` - Utility modules (Logger, ErrorHandler, AvatarUtils)
- ✅ `src/services/` - Service modules (APIService, SupabaseService)
- ✅ Other feature modules as templates/reference

**REBUILD:**
- 🔄 `src/features/CanopiModule.ts` - Delete and regenerate from COMP

### Phase 2: CanopiModule Migration (Priority 1)
1. **Delete** `src/features/CanopiModule.ts`
2. **Generate** new TypeScript from working `CanopiModule.js`
3. **Use** old TS file only for:
   - Type patterns
   - Import structure
   - Class organization
4. **Ensure** 100% functional parity with COMP

### Phase 3: Incremental Migration
After CanopiModule is working:
- Migrate smaller feature modules one at a time
- Test each module before moving to next
- Maintain COMP as reference implementation

## Migration Checklist

### CanopiModule.ts
- [ ] Delete existing `src/features/CanopiModule.ts`
- [ ] Convert `CanopiModule.js` to TypeScript
- [ ] Add proper type annotations
- [ ] Ensure all exports match COMP
- [ ] Test message loading
- [ ] Test visibility tab
- [ ] Test all COMP functionality

### Build Process
- [ ] Verify `tsconfig.json` settings
- [ ] Test `npm run build:extension`
- [ ] Verify compiled output matches COMP behavior
- [ ] Update `manifest.json` if needed

## Key Principles
1. **COMP is source of truth** - TypeScript must match COMP functionality exactly
2. **Types are valuable** - Keep existing type definitions
3. **Incremental migration** - One module at a time
4. **Test thoroughly** - Each module must work before moving on

## Files to Keep as Reference
- `src/types/index.ts` - Type definitions
- `src/core/*.ts` - Core architecture
- `src/utils/*.ts` - Utility patterns
- Other feature modules - As templates

## Files to Rebuild
- `src/features/CanopiModule.ts` - From COMP

