# Refactor Scaffolding Created

## Services Created

### 1. MessageRendererService.js
**Location**: `presence/extension/services/MessageRendererService.js`

**Purpose**: Single source of truth for rendering messages

**Methods** (all TODO):
- `renderMessage(message, options)` - Render single message
- `renderMessages(messages, container, options)` - Batch rendering
- `updateMessage(messageId, updates)` - Update existing message
- `removeMessage(messageId)` - Remove message from DOM

**Dependencies**:
- `avatarUtils`
- `communitiesModule`
- `notificationService`
- `userResolutionService`
- `unifiedMessageRenderer`

---

### 2. MessageLoadingService.js
**Location**: `presence/extension/services/MessageLoadingService.js`

**Purpose**: Handle loading messages with state-first approach

**Methods** (all TODO):
- `loadChatHistory(pageId, activeCommunities)` - Load and render chat history
- `addMessage(message, container)` - Add single message (state-first)
- `updateMessage(messageId, updates)` - Update message (state-first)
- `removeMessage(messageId)` - Remove message (state-first)

**Dependencies**:
- `messageRenderer`
- `messageSystemIntegration`
- `stateManager`

---

### 3. MessageActionListenersService.js
**Location**: `presence/extension/services/MessageActionListenersService.js`

**Purpose**: Attach event listeners (replaces window lookups)

**Methods** (all TODO):
- `attachListeners(messageElement, message)` - Attach all listeners
- `attachReactionListener(button, message)` - Reaction button
- `attachBookmarkListener(button, message)` - Bookmark button
- `attachEditListener(button, message)` - Edit button
- `attachDeleteListener(button, message)` - Delete button

**Dependencies**:
- `reactionsService`
- `bookmarkService`
- `replyService`
- `repostService`
- `shareService`
- `editService`
- `deleteService`

---

## Exports Updated

**File**: `presence/extension/services/index.js`

All three services are now exported from the central services index.

---

## Next Steps

### Phase 1: Implement MessageRendererService
1. Implement `renderMessage()` using `UnifiedMessageRenderer.generateMessageHTML()`
2. Implement `renderMessages()` using `UnifiedMessageDisplay` logic
3. Implement `updateMessage()` and `removeMessage()`

### Phase 2: Implement MessageLoadingService
1. Implement `loadChatHistory()` with state-first approach
2. Implement `addMessage()` with proper duplicate detection
3. Update `MessagesModule.loadChatHistory()` to use service

### Phase 3: Implement MessageActionListenersService
1. Implement all listener attachment methods
2. Replace `getWindowFunction()` calls in `MessagesModule`
3. Fix reactions/bookmark/edit/delete actions

---

## Status

✅ **Scaffolding Complete**
- All service files created
- Exports updated
- Ready for implementation

⏳ **Implementation Pending**
- All methods are TODO stubs
- Need to implement each phase

---

**Created**: 2025-01-24  
**Next**: Begin Phase 1 implementation

