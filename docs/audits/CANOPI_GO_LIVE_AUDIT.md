# Canopi Go-Live Acceleration Audit

**Date:** 2025-01-24  
**Goal:** Identify the minimum refactor work required to get the application “green” (builds succeeding, critical pages rendering) so that feature fixes can resume safely.

---

## Executive Snapshot

- `npm run type-check` currently fails with **90+ errors**, so the extension bundle cannot be produced.
- Core message and realtime modules contain duplicated exports and unresolved merge fragments.
- Active-community state is still written under the wrong key, preventing chat/history fetches even if builds passed.
- Supabase-backed APIs log missing credentials instead of failing fast, so production endpoints silently 500.

**Go-Live Readiness Score:** 3.5 / 10  
**Refactor milestone focus:** Clear the build, restore canonical state flow, harden configuration. Remaining cleanups can happen in parallel with feature QA once these slices pass.

---

## Refactor-Milestone Slices (Must Land Before Feature QA)

| # | Slice | Why it blocks go-live | Suggested owner |
|---|-------|-----------------------|-----------------|
| 1 | TypeScript build failures | `tsc --noEmit` stops on Messages/Realtime/UI modules | Presence eng |
| 2 | Merge artifacts in MessagesModule | Multiple default exports, duplicate symbol definitions | Presence eng |
| 3 | Active-community state mismatch | Chats never load; state written to wrong path | Presence eng |
| 4 | Runtime config validation gaps | APIs start with missing Supabase creds / CORS mismatch | Backend eng |

### Slice 1 – TypeScript build failure backlog
- `npm run type-check` fails on unused imports (`ErrorContext`), duplicate identifiers (`Logger`), undefined globals (`currentUser`), and broken Supabase realtime typings.
- Example: UIManager imports `Logger` twice, instantly producing duplicate identifier errors.

```10:15:presence/src/features/UIManager.ts
import { Logger, type LogData } from '../utils/Logger.js';
import { getCurrentUser } from '../core/UserModule.js';

import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
```

**Plan**
1. Sweep imports introduced by the ErrorHandler refactor and delete unused `ErrorContext` symbols (CursorParkManager, DependencyContainer, etc.).
2. Deduplicate Logger imports and collapse `type LogData` usages into the first import.
3. Fix `UserHoverModal` to reference `window.currentUser` (or via a helper) instead of an undeclared global so TS2304 disappears.
4. Patch `SupabaseRealtimeClientFix` to return a consistent array type.
5. Gate CI on `npm run type-check` so these regressions cannot reappear.

### Slice 2 – MessagesModule merge artifact removal
- The module currently exports the same function sets three times and re-exports multiple default objects, triggering TS2528/TS2300 errors.

```2990:3036:presence/src/features/MessagesModule.ts
export { 
    addMessageToChat, 
    createUnifiedMessageElement, 
    updateReactionDisplay, 
    addMessageActionListeners, 
    loadMessageReactions, 
    handleMessageFocus, 
    loadChatHistory,
    updateMessageInChat, 
    removeMessageFromChat, 
    getSenderName, 
    convertUrlsToLinks, 
    formatMessageTime, 
    getSenderInitial, 
    canUserEditMessage, 
    checkAndAddThreadToggle, 
    toggleThreadReplies, 
    sendMessageViaSupabase, 
    getSenderAvatar, 
    handleShareMessage, 
    handleStartThread, 
    handleCopyLink, 
    focusOnMessage, 
    parseMessageUrl, 
    handleIncomingMessageUrl, 
    handleBackNavigation, 
    handleReaction, 
    setupMessageInputEventListeners, 
    sendChatMessage, 
    handleReplyToMessage, 
    handleQuoteMessage, 
    handleRepostMessage, 
    handleBookmarkMessage,
    handleDeleteMessage,
    handleEditMessage,
    getMessageActionMenu
};

export default {
    addMessageToChat,
    createUnifiedMessageElement,
    updateReactionDisplay,
    addMessageActionListeners,
    loadMessageReactions,
    handleMessageFocus,
    loadChatHistory,
    setupMessageInputEventListeners
};
```

```3133:3235:presence/src/features/MessagesModule.ts
export { 
    addMessageToChat, 
    createUnifiedMessageElement, 
    updateReactionDisplay, 
    addMessageActionListeners, 
    loadMessageReactions, 
    handleMessageFocus, 
    loadChatHistory,
    updateMessageInChat, 
    removeMessageFromChat, 
    getSenderName, 
    convertUrlsToLinks, 
    formatMessageTime, 
    getSenderInitial, 
    canUserEditMessage, 
    checkAndAddThreadToggle, 
    toggleThreadReplies, 
    sendMessageViaSupabase, 
    getSenderAvatar, 
    handleShareMessage, 
    handleStartThread, 
    handleCopyLink, 
    focusOnMessage, 
    parseMessageUrl, 
    handleIncomingMessageUrl, 
    handleBackNavigation, 
    handleReaction, 
    setupMessageInputEventListeners, 
    sendChatMessage, 
    handleReplyToMessage, 
    handleQuoteMessage, 
    handleRepostMessage, 
    handleBookmarkMessage,
    handleDeleteMessage,
    handleEditMessage,
    getMessageActionMenu
};

export default {
    addMessageToChat,
    createUnifiedMessageElement,
    updateReactionDisplay,
    addMessageActionListeners,
    loadMessageReactions,
    handleMessageFocus,
    loadChatHistory,
    setupMessageInputEventListeners
};
```

**Plan**
1. Keep a single export block plus one default export (if required) and delete the duplicated block at the bottom of the file.
2. Move `setupMessageInputEventListeners` bootstrapping into a small initializer to avoid circular side effects.
3. Re-run `npm run type-check` to verify the duplicate-identifier cascade clears.

### Slice 3 – Active-community state coherence
- Community toggles still write to `setState('activeCommunities')`, but the rest of the stack reads from `ui.activeCommunities`, so chats cannot resolve even with valid auth.

```120:136:presence/src/features/CommunityHelpers.ts
// Update state
setState('activeCommunities', activeCommunities);
...
```

```107:113:presence/src/features/CommunityLoaders.ts
setState('activeCommunities', activeCommunities);
setState('ui.activeCommunities', activeCommunities);
```

```66:69:presence/src/features/MessagesModule.ts
const getActiveCommunities = () => {
    const communities = stateManagerInstance.getState('ui.activeCommunities');
    return Array.isArray(communities) ? communities : [];
};
```

**Plan**
1. Standardize on `ui.activeCommunities` (StateManager path) and make `setState` write both the raw and namespaced keys, or migrate all consumers to the namespaced key.
2. Update `loadChatHistory` to also try `window.getState('ui.activeCommunities')` before failing.
3. Add a regression test (vitest + mocked StateManager) to ensure toggling a community updates the read path immediately.

### Slice 4 – Runtime configuration validation gaps
- `config/validateEnv` only marks Supabase URL/keys as optional, so `routes/posts` happily boots with `null` Supabase clients and responds 500 at runtime.

```12:28:config/validateEnv.js
const required = [
  'SESSION_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL'
];

const optional = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ALLOWED_ORIGINS',
  'PORT',
  'HOST',
  'NODE_ENV',
  'DEEPSEEK_API_KEY'
];
```

```10:33:routes/posts.js
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ POSTS: Supabase credentials not configured');
} else {
  console.log('✅ POSTS: Supabase credentials configured');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
...
if (!supabase) {
  return res.status(500).json({ error: 'Database not configured' });
}
```

**Plan**
1. Promote Supabase URL/key (and other backend service secrets) to the required list; fail fast if missing.
2. Emit actionable startup errors instead of silently returning HTTP 500 later.
3. Feed `ALLOWED_ORIGINS` through the validator so the Express CORS layer remains aligned with deployment domains.

---

## Feature-Hardening Slices (Tackle Alongside Feature QA)

| # | Slice | Why it matters post-refactor |
|---|-------|------------------------------|
| 5 | Diagnostic logging firehose | 30K+ debug logs keep bundles noisy and slow |
| 6 | Undefined globals in hover/profile flows | `UserHoverModal` still references `currentUser` directly, leading to runtime ReferenceErrors |
| 7 | Supabase realtime patch typing | Fix return signatures so presence UI can rely on typed responses |
| 8 | Error handling consistency | `handleError` contexts are wired but catch blocks still swallow errors silently |

### Slice 5 – Reduce noisy logging once builds pass
- ProfileManager alone emits seven “SD1 PROFILE DEBUG” logs per update.

```1888:1897:presence/src/features/ProfileManager.ts
Logger.debug('🔍 SD1 PROFILE DEBUG: === PROFILE MANAGER USER UPDATE ===', null, 'profile');
...
Logger.debug('🔍 SD1 PROFILE DEBUG: === END PROFILE MANAGER USER UPDATE ===', null, 'profile');
```

**Plan:** Introduce a log-level guard (e.g., `Logger.isDebugEnabled('profile')`) or strip the SD1 logs when `NODE_ENV === 'production'`.

### Slice 6 – Normalize hover/profile globals
- `UserHoverModal` still accesses `currentUser` as a free variable instead of `window.currentUser`, generating TS2304 and runtime ReferenceErrors.

```551:561:presence/src/features/UserHoverModal.ts
handleError(error, {
  ...
  userId: currentUser?.id
});
```

**Plan:** import `stateManagerInstance` or reference `window.currentUser` via the global type defined in `global.d.ts`, then adjust the error context type.

### Slice 7 – Realtime typing & consistency
- `SupabaseRealtimeClientFix` overrides `getPageUsers` but TypeScript sees a `(pageId) => Promise<string | Presence[]>`, so downstream presence UIs cannot rely on array semantics.
- Fix signature to `Promise<PresenceRecord[]>` and update the handler to return `[]` consistently (never strings). This also eliminates the TS2322 intersection errors flagged during `npm run type-check`.

### Slice 8 – Error handling uniformity
- Many `catch` blocks call `handleError` but then swallow the exception and continue, masking failures. Others log and rethrow inconsistently.
- Define a shared policy (log + surface user-safe toast vs. rethrow) and retrofit the high-traffic modules (MessagesModule, RealtimeManager, Supabase services) while features are being verified.

---

## Recommended Implementation Plan

1. **Day 0–2: Build clears**
   - Remove unused imports / duplicate `Logger` definitions.
   - Collapse MessagesModule exports to a single block.
   - Fix `UserHoverModal` / SupabaseRealtimeClient typing.
   - Gate CI on `npm run type-check`.
2. **Day 3–4: State + config alignment**
   - Standardize `ui.activeCommunities` writes, add `window.getState` fallback.
   - Promote Supabase + CORS env vars to required and document them.
3. **Day 5+: Feature QA with cleanups**
   - Trim debug logging, align error handling, and address realtime typing once the app renders reliably again.

With these slices complete, the application should boot, render chats, and hit backend APIs reliably enough to resume feature-level work while mopping up residual tech debt.
# Canopi Go-Live Acceleration Audit

**Date:** 2025-01-24  
**Goal:** Identify the minimum refactor work required to get the application “green” (builds succeeding, critical pages rendering) so that feature fixes can resume safely.

---

## Executive Snapshot

- `npm run type-check` currently fails with **90+ errors**, so the extension bundle cannot be produced.
- Core message and realtime modules contain duplicated exports and unresolved merge fragments.
- Active-community state is still written under the wrong key, preventing chat/history fetches even if builds passed.
- Supabase-backed APIs log missing credentials instead of failing fast, so production endpoints silently 500.

**Go-Live Readiness Score:** 3.5 / 10  
**Refactor milestone focus:** Clear the build, restore canonical state flow, harden configuration. Remaining cleanups can happen in parallel with feature QA once these slices pass.

---

## Refactor-Milestone Slices (Must Land Before Feature QA)

| # | Slice | Why it blocks go-live | Suggested owner |
|---|-------|-----------------------|-----------------|
| 1 | TypeScript build failures | `tsc --noEmit` stops on Messages/Realtime/UI modules | Presence eng |
| 2 | Merge artifacts in MessagesModule | Multiple default exports, duplicate symbol definitions | Presence eng |
| 3 | Active-community state mismatch | Chats never load; state written to wrong path | Presence eng |
| 4 | Runtime config validation gaps | APIs start with missing Supabase creds / CORS mismatch | Backend eng |

### Slice 1 – TypeScript build failure backlog
- `npm run type-check` fails on unused imports (`ErrorContext`), duplicate identifiers (`Logger`), undefined globals (`currentUser`), and broken Supabase realtime typings.
- Example: UIManager imports `Logger` twice, instantly producing duplicate identifier errors.

```10:15:presence/src/features/UIManager.ts
import { Logger, type LogData } from '../utils/Logger.js';
import { getCurrentUser } from '../core/UserModule.js';

import { handleError, type ErrorContext } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
```

**Plan**
1. Sweep imports introduced by the ErrorHandler refactor and delete unused `ErrorContext` symbols (CursorParkManager, DependencyContainer, etc.).
2. Deduplicate Logger imports and collapse `type LogData` usages into the first import.
3. Fix `UserHoverModal` to reference `window.currentUser` (or via a helper) instead of an undeclared global so TS2304 disappears.
4. Patch `SupabaseRealtimeClientFix` to return a consistent array type.
5. Gate CI on `npm run type-check` so these regressions cannot reappear.

### Slice 2 – MessagesModule merge artifact removal
- The module currently exports the same function sets three times and re-exports multiple default objects, triggering TS2528/TS2300 errors.

```2990:3036:presence/src/features/MessagesModule.ts
export { 
    addMessageToChat, 
    createUnifiedMessageElement, 
    ...
};

export default {
    addMessageToChat,
    ...
    setupMessageInputEventListeners
};
```

```3133:3235:presence/src/features/MessagesModule.ts
export { 
    addMessageToChat, 
    ...
};

export default {
    addMessageToChat,
    ...
};
```

**Plan**
1. Keep a single export block plus one default export (if required) and delete the duplicated block at the bottom of the file.
2. Move `setupMessageInputEventListeners` bootstrapping into a small initializer to avoid circular side effects.
3. Re-run `npm run type-check` to verify the duplicate-identifier cascade clears.

### Slice 3 – Active-community state coherence
- Community toggles still write to `setState('activeCommunities')`, but the rest of the stack reads from `ui.activeCommunities`, so chats cannot resolve even with valid auth.

```120:136:presence/src/features/CommunityHelpers.ts
// Update state
setState('activeCommunities', activeCommunities);
...
```

```107:113:presence/src/features/CommunityLoaders.ts
setState('activeCommunities', activeCommunities);
setState('ui.activeCommunities', activeCommunities);
```

```66:69:presence/src/features/MessagesModule.ts
const getActiveCommunities = () => {
    const communities = stateManagerInstance.getState('ui.activeCommunities');
    return Array.isArray(communities) ? communities : [];
};
```

**Plan**
1. Standardize on `ui.activeCommunities` (StateManager path) and make `setState` write both the raw and namespaced keys, or migrate all consumers to the namespaced key.
2. Update `loadChatHistory` to also try `window.getState('ui.activeCommunities')` before failing.
3. Add a regression test (vitest + mocked StateManager) to ensure toggling a community updates the read path immediately.

### Slice 4 – Runtime configuration validation gaps
- `config/validateEnv` only marks Supabase URL/keys as optional, so `routes/posts` happily boots with `null` Supabase clients and responds 500 at runtime.

```12:28:config/validateEnv.js
const required = [
  'SESSION_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL'
];

const optional = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  ...
];
```

```10:33:routes/posts.js
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ POSTS: Supabase credentials not configured');
} else {
  console.log('✅ POSTS: Supabase credentials configured');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
...
if (!supabase) {
  return res.status(500).json({ error: 'Database not configured' });
}
```

**Plan**
1. Promote Supabase URL/key (and other backend service secrets) to the required list; fail fast if missing.
2. Emit actionable startup errors instead of silently returning HTTP 500 later.
3. Feed `ALLOWED_ORIGINS` through the validator so the Express CORS layer remains aligned with deployment domains.

---

## Feature-Hardening Slices (Tackle Alongside Feature QA)

| # | Slice | Why it matters post-refactor |
|---|-------|------------------------------|
| 5 | Diagnostic logging firehose | 30K+ debug logs keep bundles noisy and slow |
| 6 | Undefined globals in hover/profile flows | `UserHoverModal` still references `currentUser` directly, leading to runtime ReferenceErrors |
| 7 | Supabase realtime patch typing | Fix return signatures so presence UI can rely on typed responses |
| 8 | Error handling consistency | `handleError` contexts are wired but catch blocks still swallow errors silently |

### Slice 5 – Reduce noisy logging once builds pass
- ProfileManager alone emits seven “SD1 PROFILE DEBUG” logs per update.

```1888:1897:presence/src/features/ProfileManager.ts
Logger.debug('🔍 SD1 PROFILE DEBUG: === PROFILE MANAGER USER UPDATE ===', null, 'profile');
...
Logger.debug('🔍 SD1 PROFILE DEBUG: === END PROFILE MANAGER USER UPDATE ===', null, 'profile');
```

**Plan:** Introduce a log-level guard (e.g., `Logger.isDebugEnabled('profile')`) or strip the SD1 logs when `NODE_ENV === 'production'`.

### Slice 6 – Normalize hover/profile globals
- `UserHoverModal` still accesses `currentUser` as a free variable instead of `window.currentUser`, generating TS2304 and runtime ReferenceErrors.

```551:561:presence/src/features/UserHoverModal.ts
handleError(error, {
  ...
  userId: currentUser?.id
});
```

**Plan:** import `stateManagerInstance` or reference `window.currentUser` via the global type defined in `global.d.ts`, then adjust the error context type.

### Slice 7 – Realtime typing & consistency
- `SupabaseRealtimeClientFix` overrides `getPageUsers` but TypeScript sees a `(pageId) => Promise<string | Presence[]>`, so downstream presence UIs cannot rely on array semantics.
- Fix signature to `Promise<PresenceRecord[]>` and update the handler to return `[]` consistently (never strings). This also eliminates the TS2322 intersection errors flagged during `npm run type-check`.

### Slice 8 – Error handling uniformity
- Many `catch` blocks call `handleError` but then swallow the exception and continue, masking failures. Others log and rethrow inconsistently.
- Define a shared policy (log + surface user-safe toast vs. rethrow) and retrofit the high-traffic modules (MessagesModule, RealtimeManager, Supabase services) while features are being verified.

---

## Recommended Implementation Plan

1. **Day 0–2: Build clears**
   - Remove unused imports / duplicate `Logger` definitions.
   - Collapse MessagesModule exports to a single block.
   - Fix `UserHoverModal` / SupabaseRealtimeClient typing.
   - Gate CI on `npm run type-check`.
2. **Day 3–4: State + config alignment**
   - Standardize `ui.activeCommunities` writes, add `window.getState` fallback.
   - Promote Supabase + CORS env vars to required and document them.
3. **Day 5+: Feature QA with cleanups**
   - Trim debug logging, align error handling, and address realtime typing once the app renders reliably again.

With these slices complete, the application should boot, render chats, and hit backend APIs reliably enough to resume feature-level work while mopping up residual tech debt.


