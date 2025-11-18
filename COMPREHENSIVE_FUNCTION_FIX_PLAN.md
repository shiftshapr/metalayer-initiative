# Comprehensive Function Fix Plan

## Status: 68 Functional Discrepancies Identified

### Strategy

Given the large scope, I'll fix functions in logical groups:

1. ✅ **Utility Functions** (4 functions) - DONE
   - formatMessageTime
   - getSenderInitial  
   - canUserEditMessage
   - getSenderAvatar (needs to be added)

2. ⏳ **Message Action Handlers** (8 functions) - IN PROGRESS
   - handleReplyToMessage
   - handleDeleteMessage
   - handleEditMessage
   - handleShareMessage
   - handleStartThread
   - handleCopyLink
   - getMessageActionMenu
   - focusOnMessage

3. ⏳ **Reaction Functions** (6 functions)
   - handleReactionClick
   - updateReactionsDisplay
   - createReactionButton
   - getReactionEmoji
   - updateReactionCounts
   - handleReaction

4. ⏳ **Thread Functions** (3 functions)
   - toggleThreadReplies
   - checkAndAddThreadToggle
   - handleBackNavigation

5. ⏳ **Message Sending** (3 functions)
   - sendMessageViaSupabase
   - sendSupabaseMessage
   - convertSupabaseMessageToAPIFormat

6. ⏳ **Input Handlers** (5 functions)
   - setupMessageInputEventListeners
   - handleKeyDown (may be inline)
   - handleButtonClick (may be inline)
   - saveEdit (may be inline)
   - cancelEdit (may be inline)
   - closeModal (may be inline)

7. ⏳ **Navigation/URL** (3 functions)
   - parseMessageUrl
   - handleIncomingMessageUrl
   - handleBackNavigation

8. ⏳ **Fix Non-Equivalent Functions** (7 functions)
   - updateMessageInChat (expand logic)
   - removeMessageFromChat (expand logic)
   - getSenderName (already done, verify)
   - loadChatHistory (fix signature)
   - handleMessageFocus (fix signature)
   - loadMessageReactions (fix signature)
   - addMessageActionListeners (expand logic)

9. ⏳ **VisibilityManager Class Methods** (10 methods)
   - All class methods need to be verified

10. ⏳ **AuthManager Class Methods** (17 methods)
    - All class methods need to be verified

## Progress

- ✅ Extracted 27 functions from COMP
- ✅ Added 3 utility functions
- ⏳ Need to add remaining 24 functions
- ⏳ Need to fix 7 non-equivalent functions
- ⏳ Need to verify class methods

## Next Action

Add all extracted functions to CanopiModule.ts, converting to TypeScript syntax.

