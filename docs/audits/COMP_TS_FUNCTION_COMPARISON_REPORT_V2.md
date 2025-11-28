# COMP vs TypeScript Function Comparison Report V2

Generated: 2025-11-15T21:04:59.158Z

## CanopiModule.ts

- COMP Functions: 44
- TS Functions: 10
- Missing in TS: 34
- New in TS: 2
- In both: 8

### Functions in COMP but NOT in TypeScript:

- sendMessageViaSupabase
- checkAndAddThreadToggle
- getSenderInitial
- getSenderAvatar
- sendSupabaseMessage
- convertSupabaseMessageToAPIFormat
- handleReactionClick
- updateReactionsDisplay
- createReactionButton
- getReactionEmoji
- updateReactionCounts
- handleReplyToMessage
- handleDeleteMessage
- handleEditMessage
- handleShareMessage
- handleStartThread
- formatMessageTime
- getMessageActionMenu
- canUserEditMessage
- handleCopyLink
- focusOnMessage
- parseMessageUrl
- handleIncomingMessageUrl
- handleBackNavigation
- handleReaction
- toggleThreadReplies
- setupMessageInputEventListeners
- handleKeyDown
- handleButtonClick
- saveEdit
- cancelEdit
- closeModal
- initialize
- log

### Functions in TypeScript but NOT in COMP:

- createUnifiedMessageElement
- updateReactionDisplay

### Non-Equivalent Functions:

#### updateMessageInChat

**COMP Signature:**
- Params: updatedMessage
- Async: false
- Return: void

**TS Signature:**
- Params: updatedMessage
- Async: false
- Return: void

- Body length: COMP 1468 chars, TS 325 chars (77.9% difference)

#### removeMessageFromChat

**COMP Signature:**
- Params: deletedMessage
- Async: false
- Return: void

**TS Signature:**
- Params: deletedMessage
- Async: false
- Return: void

- Body length: COMP 1127 chars, TS 320 chars (71.6% difference)

#### getSenderName

**COMP Signature:**
- Params: userId
- Async: false
- Return: void

**TS Signature:**
- Params: userId
- Async: false
- Return: string

- Body length: COMP 382 chars, TS 1328 chars (71.2% difference)

#### loadChatHistory

**COMP Signature:**
- Params: communityId
- Async: true
- Return: 'N/A'
            }, 'general');
          });
          
          // Find community name
          const community = communities.find(c => c.id === communityId);
          const communityName = community ? community.name : `Community $

**TS Signature:**
- Params: rawUrl?, activeCommunities?
- Async: true
- Return: Promise<void>

- Parameter count: COMP has 1, TS has 2

#### handleMessageFocus

**COMP Signature:**
- Params: message
- Async: true
- Return: void

**TS Signature:**
- Params: messageId
- Async: false
- Return: void

- Parameter 1: COMP "message" vs TS "messageId"
- Async: COMP is async, TS is not async
- Body length: COMP 30272 chars, TS 404 chars (98.7% difference)

#### loadMessageReactions

**COMP Signature:**
- Params: messageId, container
- Async: true
- Return: void

**TS Signature:**
- Params: messageId
- Async: true
- Return: Promise<void>

- Parameter count: COMP has 2, TS has 1
- Body length: COMP 552 chars, TS 1337 chars (58.7% difference)

#### addMessageActionListeners

**COMP Signature:**
- Params: messageDiv, message
- Async: false
- Return: void

**TS Signature:**
- Params: messageDiv, message
- Async: false
- Return: void

- Body length: COMP 11473 chars, TS 3733 chars (67.5% difference)

## VisibilityManager.ts

- COMP Functions: 11
- TS Functions: 0
- Missing in TS: 11
- New in TS: 0
- In both: 0

### Functions in COMP but NOT in TypeScript:

- updateVisibleTab
- initialize
- refreshVisibilityAvatars
- fetchUserAvatars
- filterCurrentUser
- updateVisibilityUI
- handlePresenceEvent
- setCurrentPage
- getCurrentVisibilityData
- getStatus
- cleanup

## AuthManager.ts

- COMP Functions: 17
- TS Functions: 0
- Missing in TS: 17
- New in TS: 0
- In both: 0

### Functions in COMP but NOT in TypeScript:

- initializeAuthHandlers
- handleAuthStateChange
- handleUserUpdate
- requireAuth
- isAuthenticated
- getCurrentUser
- showAuthPrompt
- createAuthPromptModal
- setupAuthPromptListeners
- handleGoogleSignIn
- handleMagicLinkSignIn
- hideAuthPrompt
- updateAuthUI
- onAuthStateChange
- updateUserProfile
- signOut
- getAuthStatus

