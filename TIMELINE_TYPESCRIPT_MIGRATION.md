# Timeline Feature TypeScript Migration

## Status: In Progress

Converting the timeline feature from JavaScript to TypeScript for better type safety, IDE support, and maintainability.

## Structure

- **Source**: `public/timelines/src/` (TypeScript files)
- **Output**: `public/timelines/dist/` (Compiled JavaScript)
- **Config**: `tsconfig.timeline.json`
- **Types**: `public/timelines/src/types.ts`

## Files to Convert

### Core Application
- [x] `types.ts` - Type definitions
- [ ] `timeline-app.ts` - Main entry point
- [ ] `timeline-reaction-fix.ts` - Reaction handling

### Modules
- [ ] `modules/TimelineManager.ts` - State management
- [ ] `modules/TimelineQuery.ts` - API queries
- [ ] `modules/TimelineRealtime.ts` - Real-time subscriptions
- [ ] `modules/TimelineCache.ts` - Caching
- [ ] `modules/VisibilityManager.ts` - Visibility rules

### Components
- [ ] `components/TimelineView.ts` - Timeline rendering
- [ ] `components/ProfileSelector.ts` - Profile selection
- [ ] `components/TimelineFilters.ts` - Filter UI

## Build Process

```bash
# Compile TypeScript
npx tsc -p tsconfig.timeline.json

# Watch mode
npx tsc -p tsconfig.timeline.json --watch
```

## HTML Updates

After compilation, update `index.html` to load from `dist/`:
- `timeline-app.js` → `dist/timeline-app.js`
- Module imports will be resolved by TypeScript compiler

## Type Safety Benefits

1. **Compile-time error checking** - Catch errors before runtime
2. **IntelliSense support** - Better IDE autocomplete
3. **Self-documenting** - Types serve as documentation
4. **Safer refactoring** - TypeScript catches breaking changes
5. **Better maintainability** - Clearer code structure

## Migration Notes

- All imports use ES6 module syntax
- Window globals are typed via `Window` interface extension
- External dependencies (AvatarUtils, AuthManager, SupabaseService) need type definitions or `any` types
- Timeline scripts are standalone - no extension dependencies








