# TypeScript Feature Module Migration Plan

## File Size Analysis

**Large Files (High Priority):**
- CanopiModule.js: **9,256 lines** - Main chat module, highest priority
- VisibilityManager.js: **748 lines** - Visibility tracking
- AuthManager.js: **748 lines** - Authentication

**Strategy for Large Files:**

### CanopiModule.js (9,256 lines)
**Approach**: Incremental migration
1. Create TypeScript skeleton with type definitions
2. Migrate in logical sections:
   - Core message handling
   - UI rendering functions
   - Event handlers
   - Real-time subscriptions
3. Test after each section
4. Maintain backward compatibility during migration

### VisibilityManager.js (748 lines)
**Approach**: Full migration in one pass
- Smaller size allows complete migration
- Focus on type safety for visibility data
- Integrate with StateManager and EventBus

### AuthManager.js (748 lines)
**Approach**: Full migration in one pass
- Authentication logic is well-contained
- Integrate with SupabaseService
- Type-safe user authentication

## Migration Order

1. **Smaller Feature Modules First** (if any exist)
2. **AuthManager** - Authentication is foundational
3. **VisibilityManager** - Visibility tracking
4. **CanopiModule** - Largest, most complex, do last

## Type Definitions Needed

- Auth types (session, token, user auth state)
- Visibility types (already defined)
- Message types (already defined)
- Chat UI types (for CanopiModule)

## Integration Points

- **AuthManager** → SupabaseService, UserModule
- **VisibilityManager** → StateManager, SupabaseService
- **CanopiModule** → All of the above + EventBus + APIService

