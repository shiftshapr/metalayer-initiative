# Active Issues Tracking

**Last Updated:** 2025-01-25  
**Status:** 🔴 **INVESTIGATING**

---

## Critical Issues

### 1. 🔴 Messages Not Working
**Status:** Investigating  
**Reported:** User reports messages not loading/displaying

**Potential Causes:**
- Browser console errors blocking message loading
- API endpoint returning empty data
- Message module initialization failing
- State management issues
- DOM rendering problems

**Next Steps:**
- [ ] Check browser console for errors
- [ ] Verify API endpoint is returning data
- [ ] Check MessagesModule initialization
- [ ] Verify message rendering pipeline
- [ ] Check state management for chat.data

**Diagnostic Commands:**
```bash
# Check API
curl http://localhost:3002/api/messages?pageId=test

# Check TypeScript compilation
npm run type-check

# Check extension build
npm run build:presence
```

---

### 2. 🔴 Visibility Not Working
**Status:** Investigating  
**Reported:** User reports visibility tab not showing users

**Known Issues (from diagnostic report):**
- Page ID resolution failing
- Multiple initializations causing duplication
- Realtime subscription may not be working
- VisibilityManager initialization issues

**Root Causes Identified:**
1. `getCurrentPageId('visibility-tab')` returns `null`
2. `refreshVisibilityAvatars()` cannot run without pageId
3. Multiple render calls causing duplication

**Fixes Applied (from diagnostic report):**
- ✅ Added guard to prevent multiple initializations in VisibilityTab
- ⚠️ Page ID resolution still needs investigation

**Next Steps:**
- [ ] Verify page ID resolution is working
- [ ] Check realtime subscription status
- [ ] Verify VisibilityManager initialization
- [ ] Test visibility refresh manually

---

### 3. 🟡 TypeScript Compilation Error
**Status:** ✅ FIXED  
**File:** `presence/src/core/auth/config.ts:49`

**Error:**
```
error TS2352: Conversion of type 'Web3AuthConfig' to type 'Record<string, unknown>' may be a mistake
```

**Fix Applied:**
```typescript
// Before
config: web3AuthConfig as Record<string, unknown>,

// After
config: web3AuthConfig as unknown as Record<string, unknown>,
```

**Verification:**
- [ ] Run `npm run type-check` to verify fix

---

## Investigation Plan

### Phase 1: Browser Console Errors
**Goal:** Identify runtime errors blocking functionality

**Steps:**
1. Load extension in Chrome
2. Open DevTools console
3. Navigate to messages tab
4. Navigate to visibility tab
5. Document all errors

**Expected Output:**
- List of console errors
- Stack traces
- Failed API calls
- Module initialization failures

---

### Phase 2: API Verification
**Goal:** Verify backend is returning correct data

**Steps:**
1. Test messages API endpoint
2. Test presence API endpoint
3. Check response format
4. Verify data structure matches frontend expectations

**Commands:**
```bash
# Messages API
curl http://localhost:3002/api/messages?pageId=test

# Presence API
curl http://localhost:3002/v1/presence/active?pageId=test
```

---

### Phase 3: Module Initialization
**Goal:** Verify modules are initializing correctly

**Modules to Check:**
- MessagesModule
- VisibilityManager
- VisibilityTab
- MessageSystemIntegration

**Checks:**
- [ ] Modules exported correctly
- [ ] Initialization functions called
- [ ] No circular dependencies
- [ ] State management working

---

### Phase 4: State Management
**Goal:** Verify state is being set/retrieved correctly

**State Keys to Check:**
- `chat.data` - Messages array
- `currentUrlData` - Current page info
- `ui.activeCommunities` - Active communities
- `visibility.users` - Visible users

**Checks:**
- [ ] State is set correctly
- [ ] State is retrieved correctly
- [ ] State updates trigger UI updates
- [ ] No state corruption

---

## Diagnostic Scripts Available

### Messages Diagnostic
```bash
# Run messages diagnostic
cd presence && npx tsx src/scripts/diagnose-message-loading-issue.ts
```

### Visibility Diagnostic
```bash
# Run visibility diagnostic
cd presence && npx tsx src/scripts/diagnose-visibility-issues.ts
```

### Root Cause Diagnostic
```bash
# Run comprehensive diagnostic
cd presence && npx tsx src/utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.ts
```

---

## Known Issues from Previous Work

### TypeScript Migration Issues
**Status:** ⚠️ User reports migration didn't fix anything

**Potential Problems:**
- Type errors not caught at compile time
- Runtime errors not addressed
- Type definitions incorrect
- Missing type guards

**Action Items:**
- [ ] Review TypeScript strict mode settings
- [ ] Check for `any` types that should be typed
- [ ] Verify type definitions match runtime
- [ ] Add runtime type validation where needed

---

## Next Steps (Priority Order)

1. **Fix TypeScript error** ✅ (Done)
2. **Check browser console for runtime errors** (Critical)
3. **Verify API endpoints returning data** (Critical)
4. **Test message loading manually** (Critical)
5. **Test visibility loading manually** (Critical)
6. **Review TypeScript migration effectiveness** (Important)
7. **Create runtime error tracking** (Important)

---

## Error Reporting Template

When reporting errors, include:

1. **Browser Console Errors:**
   - Copy all red errors
   - Include stack traces
   - Note which tab (messages/visibility) triggers errors

2. **Network Errors:**
   - Failed API calls
   - Response status codes
   - Response bodies

3. **Expected vs Actual:**
   - What should happen
   - What actually happens
   - Steps to reproduce

4. **Environment:**
   - Chrome version
   - Extension build number
   - Backend status
   - Network conditions

---

*Document created: 2025-01-25*  
*Status: Active investigation*

