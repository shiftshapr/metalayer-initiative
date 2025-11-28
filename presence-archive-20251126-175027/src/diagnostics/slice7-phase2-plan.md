# Slice 7 Phase 2 Implementation Plan

## Status: Ready to Execute

### Completed (Phase 1)
- ✅ DependencyContainer created
- ✅ Architecture guidelines established
- ✅ Diagnostic tools created
- ✅ Solution design documented

### Phase 2 Implementation Strategy

Given the complexity and need for backward compatibility, we'll use a **gradual, incremental approach**:

## Priority 1: Message Loading Consolidation (Safest)

### Current State
- `MessageLoadingService` exists but not fully utilized
- 9 files directly call `loadChatHistory()`
- Multiple message loading patterns exist

### Implementation Steps
1. **Enhance MessageLoadingService** to be the single source of truth
2. **Update call sites** to use MessageLoadingService
3. **Maintain backward compatibility** with window.loadChatHistory during migration
4. **Remove duplicate implementations** after migration complete

### Files to Update
- `src/sidepanel/Sidepanel.ts`
- `src/features/CommunityLoaders.ts`
- `src/sidepanel/controllers/BootController.ts`
- `src/sidepanel/controllers/TabController.ts`
- `src/features/CommunityHelpers.ts`
- `src/features/MessagesModuleServiceIntegration.ts`
- `src/features/UIManager.ts`

### Risk: Low
- MessageLoadingService already exists
- Can maintain backward compatibility
- Incremental migration possible

## Priority 2: Extract Shared UI Components (Medium Risk)

### Current State
- Multiple modal implementations
- Duplicate display components
- Repeated UI patterns

### Implementation Steps
1. **Create shared components directory** (`src/components/shared/`)
2. **Extract common modal patterns** to `Modal.ts`
3. **Extract display utilities** to `Display.ts`
4. **Update imports** gradually
5. **Remove duplicates** after migration

### Risk: Medium
- Requires careful extraction
- Need to maintain API compatibility
- Testing required for each component

## Priority 3: Split Large Files (Higher Risk)

### ProfileManager.ts (3675 lines → 4 modules)

**Strategy**: Extract in phases, maintain backward compatibility

#### Phase 3.1: Extract ProfileUIManager
- Extract UI-related functions (~800 lines)
- Keep ProfileManager as facade
- Update internal calls
- Test thoroughly

#### Phase 3.2: Extract ProfileStorageManager
- Extract storage operations (~600 lines)
- Use dependency injection
- Test storage operations

#### Phase 3.3: Extract ProfileAuthManager
- Extract auth integration (~500 lines)
- Maintain auth flow
- Test authentication

#### Phase 3.4: Refactor ProfileManager core
- Keep core logic (~800 lines)
- Use extracted managers via DI
- Final cleanup

### MessagesModule.ts (2611 lines → 3 modules)

**Strategy**: Similar phased approach

#### Phase 3.5: Extract MessageUIManager
- Extract UI rendering (~800 lines)
- Maintain rendering API
- Test UI updates

#### Phase 3.6: Extract MessageIntegrationManager
- Extract integrations (~600 lines)
- Use dependency injection
- Test integrations

#### Phase 3.7: Refactor MessagesModule core
- Keep core logic (~900 lines)
- Use extracted managers
- Final cleanup

### Risk: High
- Large files have many dependencies
- Requires comprehensive testing
- Must maintain backward compatibility
- Gradual migration essential

## Priority 4: Migrate Window Access to DI (Medium Risk)

### Current State
- 71 files with window property access
- Top 20 files have most accesses

### Implementation Steps
1. **Start with top 20 files** (highest impact)
2. **Replace window access** with DependencyContainer
3. **Maintain window exports** during migration
4. **Test each file** after migration
5. **Continue with remaining files**

### Top Priority Files
1. `utils/UnifiedStorageSync.ts` (111 accesses)
2. `features/ProfileManager.ts` (80 accesses)
3. `utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.ts` (67 accesses)
4. `features/RealtimeManager.ts` (62 accesses)
5. `utils/ComprehensiveDiagnostic.ts` (62 accesses)
6. `features/AuthModule.ts` (59 accesses)
7. `utils/UserPreferencesManager.ts` (59 accesses)

### Risk: Medium
- Can migrate incrementally
- Maintain backward compatibility
- Requires testing at each step

## Implementation Timeline

### Week 1: Message Loading & Shared Components
- Day 1-2: Consolidate message loading
- Day 3-4: Extract shared UI components
- Day 5: Testing and documentation

### Week 2: ProfileManager Split
- Day 1-2: Extract ProfileUIManager
- Day 3: Extract ProfileStorageManager
- Day 4: Extract ProfileAuthManager
- Day 5: Refactor core, testing

### Week 3: MessagesModule Split
- Day 1-2: Extract MessageUIManager
- Day 3: Extract MessageIntegrationManager
- Day 4: Refactor core
- Day 5: Testing

### Week 4: DI Migration
- Day 1-2: Top 10 files
- Day 3-4: Next 10 files
- Day 5: Testing and cleanup

## Success Criteria

- [ ] All message loading uses MessageLoadingService
- [ ] Shared components extracted and used
- [ ] ProfileManager.ts < 1000 lines
- [ ] MessagesModule.ts < 1000 lines
- [ ] Top 20 files migrated to DI
- [ ] All tests passing
- [ ] Build successful
- [ ] No runtime errors

## Risk Mitigation

1. **Backward Compatibility**: Maintain window exports during migration
2. **Gradual Migration**: One module/file at a time
3. **Comprehensive Testing**: Test after each change
4. **Monitoring**: Watch for runtime errors
5. **Rollback Plan**: Git branches for each phase
6. **Documentation**: Update docs as patterns evolve

## Next Immediate Actions

1. ✅ Create shared components directory structure
2. ⏳ Enhance MessageLoadingService documentation
3. ⏳ Start message loading consolidation (1-2 files)
4. ⏳ Extract first shared component (Modal base)

---

*Plan created: 2025-01-24*  
*Status: Ready for execution*






