# TypeScript + ES6 Modules Unified Migration Plan

## Executive Decision

**Approach**: Unified TypeScript + ES6 Modules Migration
**Rationale**: TypeScript compiles to ES6, native module support, single migration effort
**Status**: Recommended by PM and SD

## Why Unified Migration?

### 1. Technical Synergy
- TypeScript's module system IS ES6 modules
- TypeScript compiles to ES6/ESNext JavaScript
- Native `import/export` syntax in TypeScript
- Compiler handles module resolution

### 2. Efficiency
- **One migration** instead of two
- **One build system** setup
- **One testing cycle**
- Avoids intermediate hybrid states

### 3. Quality Benefits
- TypeScript catches errors at compile time
- Type safety prevents runtime module issues
- Better IDE support for refactoring
- Proper dependency management

## Current State

### Issues with Current ES6 Migration
- ❌ Hybrid approach causing problems
- ❌ Duplicate declarations exposed
- ❌ Module loading timing issues
- ❌ Mixing module/non-module patterns

### Solution: Full Revert + TypeScript Migration
- ✅ Revert all ES6 module changes
- ✅ Set up TypeScript build system
- ✅ Migrate to TypeScript with ES6 modules
- ✅ Clean, maintainable solution

## Migration Plan

### Phase 1: Revert & Setup (Day 1)

#### 1.1 Revert Current Changes
```bash
# Revert all ES6 module changes
git revert <commits>
# Or manually revert:
- Remove type="module" from sidepanel.html
- Remove import statements from files
- Restore window.* pattern
```

#### 1.2 TypeScript Setup
```bash
npm install --save-dev typescript @types/chrome @types/node
```

#### 1.3 Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "outDir": "./presence/dist",
    "rootDir": "./presence/src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["presence/src/**/*"],
  "exclude": ["node_modules", "presence/dist"]
}
```

#### 1.4 Directory Structure
```
presence/
  src/          # TypeScript source files
    core/
    features/
    utils/
    services/
  dist/         # Compiled JavaScript (ES6 modules)
  (legacy JS files remain for gradual migration)
```

### Phase 2: TypeScript Migration (Days 2-3)

#### 2.1 Start with Simple Modules
1. **ConfigModule.ts**
   ```typescript
   // src/core/ConfigModule.ts
   export const AVATAR_FALLBACK_COLOR = '#ffffff';
   ```

2. **UserModule.ts** (new)
   ```typescript
   // src/core/UserModule.ts
   let currentUser: User | null = null;
   
   export function getCurrentUser(): User | null {
     return currentUser;
   }
   
   export function setCurrentUser(user: User | null): void {
     currentUser = user;
   }
   ```

#### 2.2 Migrate Feature Modules
- Start with isolated modules
- Add type definitions
- Use ES6 import/export
- Compile and test

#### 2.3 Build Pipeline
```json
// package.json scripts
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "build:extension": "tsc && cp -r presence/dist/* presence/"
  }
}
```

### Phase 3: Integration (Day 3-4)

#### 3.1 Update sidepanel.html
```html
<!-- Load compiled TypeScript modules -->
<script type="module" src="dist/core/ConfigModule.js"></script>
<script type="module" src="dist/core/UserModule.js"></script>
```

#### 3.2 Gradual Migration
- Migrate one module at a time
- Test after each migration
- Keep legacy files until migration complete
- Update imports as modules migrate

### Phase 4: Cleanup (Day 4-5)

#### 4.1 Remove Legacy Files
- Once all modules migrated
- Remove old .js files
- Update all imports

#### 4.2 Type Definitions
- Add types for all modules
- Create shared type definitions
- Document public APIs

## Benefits of This Approach

### Immediate
- ✅ Clean solution (no hybrid)
- ✅ Type safety
- ✅ Compile-time error checking
- ✅ Better developer experience

### Long-term
- ✅ Maintainable codebase
- ✅ Easier refactoring
- ✅ Better IDE support
- ✅ Proper module boundaries
- ✅ Type documentation

## Risk Mitigation

1. **Gradual Migration**: Migrate one module at a time
2. **Testing**: Test after each module migration
3. **Rollback**: Keep legacy files until migration complete
4. **Documentation**: Document all type definitions

## Success Criteria

- ✅ All files migrated to TypeScript
- ✅ ES6 modules throughout
- ✅ No runtime module errors
- ✅ Type safety enforced
- ✅ Build pipeline working
- ✅ Extension functional

## Timeline

- **Day 1**: Revert + Setup (4-6 hours)
- **Day 2-3**: Core modules migration (8-12 hours)
- **Day 3-4**: Feature modules migration (8-12 hours)
- **Day 4-5**: Integration & cleanup (4-6 hours)

**Total**: 2-3 days for complete migration

## Next Steps

1. ✅ Get approval for unified approach
2. ⏳ Revert current ES6 changes
3. ⏳ Set up TypeScript build system
4. ⏳ Begin gradual migration

---

**Status**: Plan ready for execution
**Recommendation**: Proceed with unified TypeScript + ES6 migration

