# COMP vs TypeScript Function Comparison Report

Generated: 2025-11-15T21:04:02.501Z

## CanopiModule.ts

- COMP Functions: 282
- TS Functions: 86
- Missing in TS: 44
- New in TS: 0
- In both: 4

### Functions in COMP but NOT in TypeScript:

- sendMessageViaSupabase
- updateMessageInChat
- removeMessageFromChat
- checkAndAddThreadToggle
- getSenderName
- getSenderInitial
- convertUrlsToLinks
- getSenderAvatar
- sendSupabaseMessage
- convertSupabaseMessageToAPIFormat
- loadChatHistory
- handleMessageFocus
- handleReactionClick
- loadMessageReactions
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
- addMessageActionListeners
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
- function
- switch

### Non-Equivalent Functions:

#### if

- Parameter 1 differs: COMP "typeof window.sendMessageViaSupabase === 'function'" vs TS "this.isInitialized"
- Body length differs significantly: COMP 453 chars, TS 110 chars (75.7% difference)

#### constructor

- Body length differs significantly: COMP 82 chars, TS 55 chars (32.9% difference)

#### for

- Parameter 1 differs: COMP "const communityId of activeCommunities" vs TS "let i = 0; i < 25; i++"
- Body length differs significantly: COMP 3037 chars, TS 1188 chars (60.9% difference)

## VisibilityManager.ts

- COMP Functions: 34
- TS Functions: 42
- Missing in TS: 11
- New in TS: 1
- In both: 3

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

### Functions in TypeScript but NOT in COMP:

- for

### Non-Equivalent Functions:

#### constructor

- Body length differs significantly: COMP 206 chars, TS 134 chars (35.0% difference)

## AuthManager.ts

- COMP Functions: 33
- TS Functions: 27
- Missing in TS: 17
- New in TS: 0
- In both: 3

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

### Non-Equivalent Functions:

#### constructor

- Body length differs significantly: COMP 210 chars, TS 116 chars (44.8% difference)

#### if

- Parameter 1 differs: COMP "this.currentUser && this.currentUser.email === user.email" vs TS "provider === 'google'"

