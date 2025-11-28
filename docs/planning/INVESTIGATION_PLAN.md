# Investigation Plan: Messages & Visibility Issues

**Date:** 2025-01-25  
**Status:** 🔍 **ACTIVE INVESTIGATION**

---

## Current Status

### ✅ System Level Checks (All Passing)
- TypeScript compilation: ✅ No errors
- Extension build: ✅ Build #257
- Critical files: ✅ All present
- Module exports: ✅ Correct
- Messages API: ✅ Responding (empty array for test pageId - expected)
- Presence API: ⚠️ 401 (authentication issue)

### 🔴 User Reports
- Messages not working
- Visibility not working
- TypeScript migration didn't fix runtime issues

---

## Root Cause Hypothesis

**The TypeScript migration fixed compilation errors, but runtime issues remain.**

This suggests:
1. **Runtime errors** not caught by TypeScript
2. **Initialization failures** in browser
3. **State management issues** preventing data flow
4. **Authentication issues** blocking API calls
5. **DOM/rendering issues** preventing UI updates

---

## Investigation Steps (Priority Order)

### Step 1: Browser Console Errors ⚠️ **CRITICAL**
**Why:** Runtime errors will show what's actually breaking

**Action:**
1. Open Chrome extension
2. Open DevTools (F12)
3. Go to Console tab
4. Navigate to Messages tab
5. Navigate to Visibility tab
6. **Document ALL errors** (red text)

**What to Look For:**
- Module initialization errors
- API call failures
- State management errors
- DOM manipulation errors
- Type errors at runtime

**Output Needed:**
- Screenshot or copy of console errors
- Stack traces
- Which tab triggers which errors

---

### Step 2: Network Tab Analysis ⚠️ **CRITICAL**
**Why:** See if API calls are failing

**Action:**
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Navigate to Messages tab
4. Navigate to Visibility tab
5. **Document failed requests**

**What to Look For:**
- Failed API calls (red status)
- 401/403 authentication errors
- 404 not found errors
- 500 server errors
- CORS errors
- Request/response bodies

**Output Needed:**
- List of failed requests
- Status codes
- Error messages
- Request URLs

---

### Step 3: Extension Loading Check
**Why:** Verify extension is loading correctly

**Action:**
1. Go to `chrome://extensions/`
2. Find Metalayer extension
3. Check for errors
4. Click "Inspect views: service worker" or "Inspect views: side panel"
5. Check console for errors

**What to Look For:**
- Extension errors on load
- Service worker errors
- Side panel errors
- Missing files

---

### Step 4: Manual State Inspection
**Why:** Verify state is being set/retrieved

**Action:**
1. Open extension side panel
2. Open DevTools console
3. Run diagnostic commands:

```javascript
// Check state manager
window.stateManager?.getState('chat.data')
window.stateManager?.getState('currentUrlData')
window.stateManager?.getState('ui.activeCommunities')
window.stateManager?.getState('visibility.users')

// Check if modules are loaded
window.loadChatHistory
window.refreshVisibilityAvatars
window.MessagesModule
window.VisibilityManager

// Check API
window.api
```

**What to Look For:**
- Undefined values
- Null values
- Incorrect data structure
- Missing functions

---

### Step 5: API Authentication Check
**Why:** Presence API returned 401

**Action:**
1. Check if user is authenticated
2. Verify Supabase session
3. Check authentication state

**Commands:**
```javascript
// In browser console
window.supabase?.auth.getSession()
window.currentUser
window.stateManager?.getState('currentUser')
```

---

## Diagnostic Scripts Available

### System Level
```bash
npm run diagnose          # Runtime issues diagnostic
npm run health-check      # Backend health check
npm run type-check        # TypeScript compilation
```

### Extension Level (Run in Browser Console)
```javascript
// Messages diagnostic
if (window.diagnoseMessages) window.diagnoseMessages()

// Visibility diagnostic  
if (window.diagnoseVisibility) window.diagnoseVisibility()

// Root cause diagnostic
if (window.runRootCauseDiagnostic) window.runRootCauseDiagnostic()
```

---

## Common Issues & Fixes

### Issue: "Cannot read property X of undefined"
**Cause:** Module not initialized or loaded
**Fix:** Check module initialization order

### Issue: "API call failed: 401"
**Cause:** Not authenticated
**Fix:** Sign in, check Supabase session

### Issue: "Messages not loading"
**Cause:** 
- API returning empty array (no messages for pageId)
- State not updating
- DOM not rendering
**Fix:** Check each step in message loading pipeline

### Issue: "Visibility shows 0 users"
**Cause:**
- Page ID resolution failing
- Realtime subscription not working
- Query returning no results
**Fix:** Check page ID, verify realtime, check database

---

## Next Actions

### Immediate (Do Now)
1. ✅ Run `npm run diagnose` - **DONE**
2. ⏳ **YOU NEED TO DO:** Check browser console for errors
3. ⏳ **YOU NEED TO DO:** Check Network tab for failed requests
4. ⏳ **YOU NEED TO DO:** Test messages/visibility manually

### Short Term (Today)
1. Document all console errors
2. Document all network failures
3. Test with real pageId (not "test")
4. Verify authentication state

### Medium Term (This Week)
1. Fix identified runtime errors
2. Add error boundaries
3. Improve error logging
4. Add runtime type validation

---

## Error Reporting Template

When you find errors, document:

```markdown
### Error: [Error Message]

**Location:** [Which tab/action triggers it]
**Console Error:**
```
[Paste error here]
```

**Stack Trace:**
```
[Paste stack trace]
```

**Network Request:**
- URL: [Request URL]
- Status: [Status code]
- Response: [Response body]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]
```

---

## Success Criteria

We'll know issues are fixed when:
- ✅ No console errors when loading messages
- ✅ No console errors when loading visibility
- ✅ Messages display correctly
- ✅ Visibility shows users correctly
- ✅ API calls succeed (200 status)
- ✅ State updates trigger UI updates

---

*Plan created: 2025-01-25*  
*Next update: After browser console check*

