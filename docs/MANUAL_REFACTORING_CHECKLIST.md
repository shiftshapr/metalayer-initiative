# Manual Refactoring Checklist - Safest Approach

## Strategy: Manual, Systematic, Incremental

**Why Manual is Safest:**
- ✅ Verify each function as you move it
- ✅ Test incrementally  
- ✅ Catch issues early
- ✅ Understand each change
- ✅ Easy rollback

## Step-by-Step Manual Process

### Step 1: Prepare MessagesModule_complete.js
- [x] Copy CanopiModule.js to MessagesModule_complete.js
- [ ] Update header comment to "MESSAGES MODULE"
- [ ] Remove CanopiModule class wrapper
- [ ] Remove backward compatibility code
- [ ] Remove visibility helper functions (use VisibilityModule)
- [ ] Update imports to include VisibilityModule

### Step 2: Move Functions Systematically
For each function:
- [ ] Copy function from CanopiModule
- [ ] Paste into MessagesModule_complete
- [ ] Update to use VisibilityModule instead of direct visibility access
- [ ] Remove any backward compatibility checks
- [ ] Test function works
- [ ] Commit

### Step 3: Export All Functions
- [ ] Export all 37 functions from MessagesModule_complete
- [ ] Remove CanopiModule exports
- [ ] Test exports work

### Step 4: Replace CanopiModule
- [ ] Make CanopiModule.js just re-export from MessagesModule_complete
- [ ] Test everything still works
- [ ] Update all imports
- [ ] Final testing

### Step 5: Cleanup
- [ ] Rename MessagesModule_complete.js to MessagesModule.js
- [ ] Delete old CanopiModule.js
- [ ] Final verification

## Functions to Move (37 total)
1. initializeNewMessageSystem
2. updateMessageInChat
3. removeMessageFromChat
4. addMessageToChat
5. getSenderName
6. getSenderInitial
7. convertUrlsToLinks
8. formatMessageTime
9. canUserEditMessage
10. createUnifiedMessageElement
11. updateReactionDisplay
12. loadMessageReactions
13. addMessageActionListeners
14. handleMessageFocus
15. loadChatHistory
16. checkAndAddThreadToggle
17. toggleThreadReplies
18. getMessageActionMenu
19. handleReplyToMessage
20. handleQuoteMessage
21. handleDeleteMessage
22. handleEditMessage
23. sendMessageViaSupabase
24. getSenderAvatar
25. handleRepostMessage
26. handleBookmarkMessage
27. handleShareMessage
28. handleStartThread
29. handleCopyLink
30. focusOnMessage
31. parseMessageUrl
32. handleIncomingMessageUrl
33. handleBackNavigation
34. handleReaction
35. setupMessageInputEventListeners
36. sendChatMessage
37. Plus helper functions (resolveAuthorFromPayload, normalizeMessagePayload, etc.)

## Testing After Each Function
- [ ] Function compiles without errors
- [ ] Function logic preserved
- [ ] Uses VisibilityModule correctly
- [ ] No backward compatibility code

