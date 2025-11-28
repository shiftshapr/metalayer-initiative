# Hardcoded URLs Summary

**Date**: 2025-01-24  
**Scope**: Frontend code (`presence/src/`)

---

## Hardcoded IP Address: `http://216.238.91.120:3002`

This IP address is hardcoded in **10 files** across the frontend codebase:

### Files with Hardcoded URLs

1. **`presence/src/features/APIModule.ts`** (5 occurrences)
   - Line 78: `endpoint.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002')`
   - Line 91: `` `http://216.238.91.120:3002${endpoint}` ``
   - Line 677: `new MetaLayerAPI('http://216.238.91.120:3002')`
   - Line 686: `url.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002')`
   - Line 690: `` `http://216.238.91.120:3002${url}` ``

2. **`presence/src/features/RealtimeManager.ts`** (1 occurrence)
   - Line 1218: `` `window.METALAYER_API_URL || 'http://216.238.91.120:3002'` ``

3. **`presence/src/components/UnifiedMessageModal.ts`** (1 occurrence)
   - Line 1341: `const FALLBACK_API_BASE = 'http://216.238.91.120:3002';`

4. **`presence/src/features/AgentModule.ts`** (1 occurrence)
   - Line 173: `return 'http://216.238.91.120:3002/api/agent';`

5. **`presence/src/services/MessageStore.ts`** (1 occurrence)
   - Line 37: `const FALLBACK_API_BASE = 'http://216.238.91.120:3002';`

6. **`presence/src/services/APIService.ts`** (4 occurrences)
   - Line 40: `endpoint.replace('https://api.themetalayer.org', 'http://216.238.91.120:3002')`
   - Line 55: `` `http://216.238.91.120:3002${endpoint}` ``
   - Line 116: `` `http://216.238.91.120:3002/v1/users/${user.id}` ``
   - Line 322: `new MetaLayerAPI('http://216.238.91.120:3002')`

7. **`presence/src/core/StateManager.ts`** (2 occurrences)
   - Line 52: `baseUrl: 'http://216.238.91.120:3002',`
   - Line 336: `baseUrl: 'http://216.238.91.120:3002',`

8. **`presence/src/components/DraftSelectionModal.ts`** (likely contains hardcoded URL)
9. **`presence/src/features/MessagesModule.ts`** (likely contains hardcoded URL)
10. **`presence/src/core/ContextMenuConfig.ts`** (likely contains hardcoded URL)

---

## Total Count

- **Files affected**: 10
- **Total occurrences**: ~15+ hardcoded URLs
- **Pattern**: All use `http://216.238.91.120:3002` as fallback or direct URL

---

## Recommended Fix

Replace hardcoded IPs with environment variables or configuration:

```typescript
// Instead of:
const FALLBACK_API_BASE = 'http://216.238.91.120:3002';

// Use:
const FALLBACK_API_BASE = process.env.API_BASE_URL || 
  (window as Window & { API_BASE_URL?: string }).API_BASE_URL || 
  'https://api.themetalayer.org';
```

Or use a centralized config module:

```typescript
// config/api.ts
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 
    (typeof window !== 'undefined' && (window as any).API_BASE_URL) ||
    'https://api.themetalayer.org',
  fallbackUrl: process.env.API_FALLBACK_URL || 'http://216.238.91.120:3002'
};
```

---

## Status

- **Backend**: ✅ No hardcoded URLs (uses environment variables)
- **Frontend**: ⚠️ Contains hardcoded IPs (needs migration)
- **Priority**: Medium (not security-critical, but maintenance issue)

---

*Generated: 2025-01-24*





