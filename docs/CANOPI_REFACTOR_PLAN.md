# CanopiModule.js Refactoring Plan

## Current State
- **Size**: ~3,900 lines (after duplicate removal)
- **Issues**: Single monolithic file mixing multiple concerns
- **Goal**: Split into focused modules (~300-500 lines each)

## Proposed Module Structure

### 1. MessageService.js (~400 lines)
**Responsibility**: Message CRUD operations, API interactions

**Functions to Extract**:
- `sendMessageViaSupabase(content, parentId)`
- `sendSupabaseMessage(message)`
- `convertSupabaseMessageToAPIFormat(supabaseMessage)`
- `loadChatHistory(communityId)`
- `updateMessageInChat(updatedMessage)`
- `removeMessageFromChat(deletedMessage)`

**API Dependencies**:
- Uses `window.api.request()` for backend calls
- Uses Supabase realtime client for sending

---

### 2. MessageRenderer.js (~600 lines)
**Responsibility**: DOM rendering, message UI construction

**Functions to Extract**:
- `addMessageToChat(message)` - **Main renderer** (~300 lines)
- `getSenderAvatar(author)`
- `getSenderInitial(name)` (HTML version)
- `getSenderName(userId)`
- `formatMessageTime(createdAt)`
- `convertUrlsToLinks(text)`
- `updateMessageVisualHierarchy()`
- `updateVerticalLineHeight(threadStarter, replies)`

**DOM Dependencies**:
- Queries `.chat-messages` container
- Creates message DOM elements
- Uses `AvatarUtils.createUnifiedAvatar()`

---

### 3. ReactionService.js (~500 lines)
**Responsibility**: Reaction handling, UI updates

**Functions to Extract**:
- `setupReactionSubscription(messageId)`
- `window.handleReactionChange(payload)`
- `window.addReactionToMessage(reaction)`
- `window.updateReactionInMessage(reaction)`
- `window.removeReactionFromMessage(reaction)`
- `window.loadMessageReactions(messageId, reactionBtn)`
- `window.updateReactionDisplay(messageId, reactions)`
- `window.showReactionModal(messageId)` (from CanopiModule)
- `window.addReaction`, `window.removeReaction` (if in CanopiModule)

**Real-time Dependencies**:
- Supabase reaction subscriptions
- Debouncing logic for real-time updates

---

### 4. ThreadService.js (~400 lines)
**Responsibility**: Thread/reply handling, navigation

**Functions to Extract**:
- `loadMessageReplies(messageId, conversationId, communityId)`
- `handleReplyToMessage(message)`
- `handleStartThread(message)`
- `toggleThreadReplies(threadId, messageElement)`
- `checkAndAddThreadToggle(messageElement, conversationId)`
- `handleBackNavigation()`
- Reply hierarchy logic from `addMessageToChat`

**Navigation Dependencies**:
- Message URL parsing
- Thread state management

---

### 5. MessageActions.js (~300 lines)
**Responsibility**: Action menus, edit/delete, sharing

**Functions to Extract**:
- `getMessageActionMenu(message)` (full version with dropdown)
- `canUserEditMessage(message)` (complete version)
- `addMessageActionListeners(messageDiv, message)`
- `handleShareMessage(message, shareType)`
- `handleCopyLink(message)`
- `focusOnMessage(message)`
- `parseMessageUrl(url)`
- `handleIncomingMessageUrl()`

**Event Listeners**:
- Edit/delete button handlers
- Share/navigate handlers
- Copy link handlers

---

### 6. MessageInputHandler.js (~200 lines)
**Responsibility**: Input handling, message sending UI

**Functions to Extract**:
- `setupMessageInputEventListeners()`
- `sendChatMessage()`
- `handleMessageFocus(message)`

**UI Dependencies**:
- Message input field
- Send button
- Focus/blur handlers

---

### 7. CanopiModule.js (~200 lines)
**Responsibility**: Module initialization, orchestration

**Keep**:
- `class CanopiModule` (minimal)
- `initialize()` method
- Export window functions that need to stay global
- Module-level logging

**Imports**:
- Import all service modules
- Wire up dependencies
- Provide unified API

---

## Refactoring Steps

### Phase 1: Extract Services (Low Risk)
1. Create `MessageService.js`, move message CRUD functions
2. Create `ReactionService.js`, move reaction functions
3. Test each extraction independently

### Phase 2: Extract Renderers (Medium Risk)
4. Create `MessageRenderer.js`, move rendering functions
5. Create `ThreadService.js`, move thread functions
6. Update imports in `addMessageToChat`

### Phase 3: Extract Actions & Input (Medium Risk)
7. Create `MessageActions.js`, move action handlers
8. Create `MessageInputHandler.js`, move input handling
9. Update event listener setup

### Phase 4: Cleanup (Low Risk)
10. Clean up `CanopiModule.js` to just orchestration
11. Remove unused functions
12. Update all imports across codebase

---

## Dependencies Map

```
CanopiModule.js (orchestrator)
├── MessageService.js
│   ├── window.api
│   └── window.supabaseRealtimeClient
├── MessageRenderer.js
│   ├── AvatarUtils.createUnifiedAvatar
│   └── MessageService (for conversions)
├── ReactionService.js
│   ├── window.api
│   └── window.supabaseRealtimeClient
├── ThreadService.js
│   └── MessageService (for loading replies)
├── MessageActions.js
│   └── (standalone)
└── MessageInputHandler.js
    └── MessageService (for sending)
```

---

## Risk Mitigation

### Before Refactoring
1. ✅ Remove duplicate functions (DONE)
2. Create comprehensive test cases for current functionality
3. Document all window.* exports and their usage

### During Refactoring
1. Extract one module at a time
2. Test after each extraction
3. Keep old code commented until verified
4. Update sidepanel.js imports incrementally

### After Refactoring
1. Verify all window.* exports still work
2. Test message sending/receiving
3. Test reactions
4. Test threads/replies
5. Test action menus

---

## Estimated Impact
- **Lines per module**: 200-600 (manageable)
- **Total modules**: 7 focused modules
- **Risk level**: Medium (requires careful testing)
- **Time estimate**: 2-3 days for full refactor

---

## Next Steps
1. ✅ Remove duplicates (COMPLETED)
2. Create MessageService.js first (lowest risk)
3. Test thoroughly before proceeding
4. Continue with ReactionService.js
5. Iterate through remaining modules


