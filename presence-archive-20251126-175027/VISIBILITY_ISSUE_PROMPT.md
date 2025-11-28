# Visibility Issue - Agent Prompt

## Objective
Fix visibility profiles not showing:
1. No "last seen" profiles when on different pages
2. No "online" profiles when on the same page
3. VisibilityState has 0 users (diagnostic shows empty)

## Diagnostic Results
- **VisibilityState users count**: 0
- **Visibility tab exists**: true
- **Visibility tab active**: false
- **currentPageId**: null (now fixed with StateManager.getState() fix)
- **getUserStatusText() logic**: Should show "Online" for same page, "Last seen X ago" for different pages

## Diagnostic Script
Run: `src/scripts/diagnose-visibility-profiles.js` in browser console

## Root Cause Investigation Needed
1. **Why VisibilityState has 0 users?**
   - Check if VisibilityManager is loading users from database
   - Check if visibility realtime subscriptions are working
   - Check if users are being filtered out incorrectly
   - Check if VisibilityState.getUsers() is returning empty array

2. **Why no "last seen" on different pages?**
   - Check if `user.lastSeen` is being populated from database
   - Check if `getUserStatusText()` is receiving correct data
   - Check if page_id comparison is working correctly

3. **Why no "online" on same page?**
   - Check if `isUserActiveOnPage()` is working correctly
   - Check if `user.isActive` and `user.page_id` are set correctly
   - Check if currentPageId is being passed correctly to getUserStatusText()

## Files to Investigate
- `src/features/visibility/core/VisibilityManager.ts` - User loading logic
- `src/features/visibility/core/VisibilityState.ts` - State management
- `src/features/visibility/ui/VisibilityTab.ts` - UI rendering
- `src/features/visibility/utils/visibilityHelpers.ts` - getUserStatusText() logic
- `src/features/visibility/integration/buildGraphAdapter.ts` - Data fetching

## Expected Behavior
- Users on same page should show "Online" status
- Users on different pages should show "Last seen X ago" status
- VisibilityState should have users loaded from database/realtime

## Enforce .cursorrules
CRITICAL: Never edit extension/, dist/, build/. Edit src/ only. Build required. TypeScript ES6 modules. Modular. No pre-launch backward-compat. Remove duplicates. Extract unified helpers. Plan→Scaffold→Build. Document in JAUmemory. No markdown/non-runtime in dist. Archive/delete stale diagnostics/tests. Log problem/diagnostic/solution/verification to JAUmemory. Commit on resolution.

Use Default Collaboration Workflow Manifest. Enforce blind-spot and red-line audits.

Before SD, PM must: Search JAUmemory for existing problem memories. Create/update if missing (status=identified). Record context, impact, tags, links.

Diagnostic mandate: SD creates/references diagnostic script targeting root cause before coding. TEST runs diagnostics before/after implementation. Attach script IDs/results to problem memory. If not feasible, document exception.

Workflow: pm → sd → test → red → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics

Active project = canopi
Recall preferences, policies, agents from JAUmemory.
Execute end-to-end. Confirm diagnostics + memory updates before closing.

