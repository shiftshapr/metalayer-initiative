# Message for Cursor if Reverting

## If you need to revert the message visibility fixes, tell Cursor:

---

**"Revert changes to ChatLoadingOverlayPatch.js, CanopiModule.js visibility restoration, APIModule.js AppUser queries, and remove test files from sidepanel.html.**

**CRITICAL LEARNINGS - DO NOT REPEAT THESE MISTAKES:**

1. **NEVER load test files in production HTML** - Test files like `UserPreferencesManager.test.js` cause console errors and confusion. They should only run in test environments.

2. **NEVER use variables before declaration** - Always declare variables before first use. Check for `const allMessages` being used before declaration.

3. **NEVER reference try-block variables in catch/finally** - Variables declared in `try` block aren't available in `catch`. Use `window.activeCommunities` or declare outside try/catch.

4. **NEVER use `.single()` for optional Supabase queries** - Use `.maybeSingle()` which returns null instead of throwing. `.single()` throws error if row doesn't exist, causing 400 errors.

5. **NEVER rely on 'original' visibility values** - When restoring visibility, always force to explicit `'visible'` and `'1'`, never use `originalChatVisibility` which might be wrong.

6. **NEVER add delays after loading completes** - Only enforce minimum display duration, never add extra delays after `loadChatHistory` completes.

7. **NEVER remove overlays with setTimeout** - Remove overlays immediately with `.remove()`, don't defer with setTimeout which can fail.

8. **NEVER trust single cleanup path** - Always have multiple fallback mechanisms. If `hideLoading` hangs, overlay stays forever. Add timeout-based cleanup.

**ROOT CAUSE:** Messages were loading successfully but:
- Container visibility was `hidden` and never restored
- Loading overlay was never removed, blocking view
- No fallback mechanisms to catch stuck states

**THE FIX MUST:**
- Force visibility in multiple places with `!important`
- Remove overlays immediately (no setTimeout)
- Have timeout-based cleanup as backup
- Auto-detect stuck overlays

**KEY PRINCIPLE:** Visibility restoration and overlay cleanup are non-negotiable. Errors should never prevent UI from being visible. Always have redundant safety mechanisms."**

---

