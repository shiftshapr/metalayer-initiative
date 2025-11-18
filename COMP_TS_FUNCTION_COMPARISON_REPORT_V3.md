# COMP vs TypeScript Function Comparison Report V3

Generated: 2025-11-15T23:30:13.221Z

## Policy

- ✅ Structural changes (ES6 modules, imports/exports) are NOT discrepancies
- ❌ Functional differences (missing logic, different behavior) ARE discrepancies
- ⚠️  ONLY permitted discrepancy: avatar glow effect

## CanopiModule.ts

- COMP Functions: 44
- TS Functions: 45
- ❌ Functional Discrepancies: 10
- ✅ Structural Changes (OK): 1
- ✅ Functionally Equivalent: 31

### ❌ Functional Discrepancies: Missing Functions

- addMessageActionListeners

### ❌ Functional Discrepancies: Non-Equivalent Functions

#### sendSupabaseMessage

- Parameter count differs: COMP 1 vs TS 0

#### loadChatHistory

- Parameter count differs: COMP 1 vs TS 2

#### handleMessageFocus

- Body length differs significantly: COMP 30272 chars, TS 6076 chars (79.9% difference) - may indicate missing logic

#### loadMessageReactions

- Body length differs significantly: COMP 552 chars, TS 2067 chars (73.3% difference) - may indicate missing logic

#### updateReactionCounts

- Body length differs significantly: COMP 347 chars, TS 1235 chars (71.9% difference) - may indicate missing logic

#### parseMessageUrl

- Body length differs significantly: COMP 446 chars, TS 117 chars (73.8% difference) - may indicate missing logic

#### setupMessageInputEventListeners

- Body length differs significantly: COMP 585 chars, TS 1554 chars (62.4% difference) - may indicate missing logic

#### cancelEdit

- Body length differs significantly: COMP 314 chars, TS 649 chars (51.6% difference) - may indicate missing logic

#### closeModal

- Parameter 1 differs: COMP "e" vs TS "modalId?"

### ✅ Structural Changes: Functions Exported Elsewhere (ES6 Modules)

- getSenderAvatar

## VisibilityManager.ts

- COMP Functions: 11
- TS Functions: 11
- ❌ Functional Discrepancies: 8
- ✅ Structural Changes (OK): 1
- ✅ Functionally Equivalent: 2

### ❌ Functional Discrepancies: Non-Equivalent Functions

#### initialize

- Body length differs significantly: COMP 589 chars, TS 192 chars (67.4% difference) - may indicate missing logic

#### refreshVisibilityAvatars

- Body length differs significantly: COMP 1324 chars, TS 201 chars (84.8% difference) - may indicate missing logic

#### fetchUserAvatars

- Body length differs significantly: COMP 2233 chars, TS 204 chars (90.9% difference) - may indicate missing logic

#### filterCurrentUser

- Body length differs significantly: COMP 783 chars, TS 189 chars (75.9% difference) - may indicate missing logic

#### updateVisibilityUI

- Body length differs significantly: COMP 737 chars, TS 187 chars (74.6% difference) - may indicate missing logic

#### handlePresenceEvent

- Body length differs significantly: COMP 957 chars, TS 230 chars (76.0% difference) - may indicate missing logic

#### getCurrentVisibilityData

- Body length differs significantly: COMP 73 chars, TS 182 chars (59.9% difference) - may indicate missing logic

#### cleanup

- Body length differs significantly: COMP 339 chars, TS 147 chars (56.6% difference) - may indicate missing logic

### ✅ Structural Changes: Functions Exported Elsewhere (ES6 Modules)

- updateVisibleTab

## AuthManager.ts

- COMP Functions: 17
- TS Functions: 20
- ❌ Functional Discrepancies: 14
- ✅ Structural Changes (OK): 0
- ✅ Functionally Equivalent: 3

### ❌ Functional Discrepancies: Non-Equivalent Functions

#### initializeAuthHandlers

- Body length differs significantly: COMP 418 chars, TS 126 chars (69.9% difference) - may indicate missing logic

#### handleAuthStateChange

- Body length differs significantly: COMP 464 chars, TS 141 chars (69.6% difference) - may indicate missing logic

#### handleUserUpdate

- Parameter 1 differs: COMP "user" vs TS "updatedUser"

#### requireAuth

- Parameter 2 differs: COMP "callback" vs TS "callback?"

#### getCurrentUser

- Body length differs significantly: COMP 53 chars, TS 124 chars (57.3% difference) - may indicate missing logic

#### showAuthPrompt

- Body length differs significantly: COMP 758 chars, TS 130 chars (82.8% difference) - may indicate missing logic

#### createAuthPromptModal

- Body length differs significantly: COMP 1157 chars, TS 124 chars (89.3% difference) - may indicate missing logic

#### setupAuthPromptListeners

- Body length differs significantly: COMP 1099 chars, TS 130 chars (88.2% difference) - may indicate missing logic

#### handleGoogleSignIn

- Async differs: COMP is not async, TS is async

#### handleMagicLinkSignIn

- Parameter count differs: COMP 0 vs TS 1

#### updateAuthUI

- Body length differs significantly: COMP 408 chars, TS 106 chars (74.0% difference) - may indicate missing logic

#### updateUserProfile

- Async differs: COMP is not async, TS is async

#### signOut

- Body length differs significantly: COMP 311 chars, TS 96 chars (69.1% difference) - may indicate missing logic

#### getAuthStatus

- Body length differs significantly: COMP 261 chars, TS 96 chars (63.2% difference) - may indicate missing logic

