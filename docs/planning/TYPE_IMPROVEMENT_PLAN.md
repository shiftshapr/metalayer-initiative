# TypeScript Type Improvement Plan

**Date:** 2025-01-17  
**Priority:** High

---

## 🎯 Goal

Reduce `any` types from ~292 to <50, focusing on type safety without breaking functionality.

---

## 📋 Phase 1: Window Interface (Immediate - High Impact)

### Current State
- ~100 `(window as any)` usages
- Window properties not properly typed

### Actions
1. ✅ Already have `global.d.ts` with Window extensions
2. ⏳ Audit all `(window as any)` usages
3. ⏳ Add missing properties to Window interface
4. ⏳ Replace `(window as any)` with proper types

### Expected Impact
- Reduce `any` by ~80-100 occurrences
- Improve type safety for window properties
- Better IDE autocomplete

---

## 📋 Phase 2: API Response Types (High Priority)

### Current State
- API responses use `any`
- No type safety for API calls

### Actions
1. Create `src/types/api.ts` with:
   - `ApiResponse<T>` generic
   - Common API response interfaces
   - Error response types
2. Update all API calls to use typed responses
3. Create specific interfaces for each endpoint

### Expected Impact
- Reduce `any` by ~40-50 occurrences
- Type-safe API calls
- Better error handling

---

## 📋 Phase 3: Event System (Medium Priority)

### Current State
- CustomEvent details use `any`
- Event handlers not typed

### Actions
1. Create `src/types/events.ts` with:
   - Typed CustomEvent interfaces
   - Event detail types
   - Event handler types
2. Update all event dispatchers
3. Update all event listeners

### Expected Impact
- Reduce `any` by ~20-30 occurrences
- Type-safe event system
- Better event handling

---

## 📋 Phase 4: Database Types (Medium Priority)

### Current State
- Supabase queries return `any`
- Database entities not typed

### Actions
1. Create `src/types/database.ts` with:
   - Supabase entity types
   - Query result types
   - Database schema types
2. Type all Supabase queries
3. Create query helper types

### Expected Impact
- Reduce `any` by ~30-40 occurrences
- Type-safe database access
- Better data validation

---

## 📋 Phase 5: Diagnostic Types (Low Priority)

### Current State
- Diagnostic data uses `any` for flexibility
- Diagnostic results not typed

### Actions
1. Create union types for diagnostic data
2. Type diagnostic results where possible
3. Keep `any` only for truly dynamic diagnostic data

### Expected Impact
- Reduce `any` by ~10-20 occurrences
- Better diagnostic type safety
- Maintain flexibility for dynamic data

---

## ✅ Success Criteria

- [ ] `any` types reduced to <50
- [ ] All window properties typed
- [ ] All API calls typed
- [ ] All events typed
- [ ] All database queries typed
- [ ] Compilation still passes
- [ ] No runtime errors
- [ ] Improved IDE support

---

## 🚀 Quick Wins (Do First)

1. **Window Interface** - Already have foundation, just need to expand
2. **API Response Types** - High impact, relatively straightforward
3. **Event Types** - Medium impact, good for type safety

---

*Plan created: 2025-01-17*
