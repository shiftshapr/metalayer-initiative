# RED-LINE: Field Naming Standardization Policy

## Critical Policy

**In pre-release stages of development, ALWAYS standardize field names rather than maintaining duplicate fields with different naming conventions.**

## Standard

- **Use camelCase for ALL interface/JavaScript code** 
  - Examples: `createdAt`, `parentId`, `pageId`, `userId`, `communityId`, `conversationId`, `auraColor`, `deletedAt`
- **Convert snake_case to camelCase immediately upon receipt from backend/Supabase**
- **Delete snake_case fields after conversion** - do NOT maintain both

## Prohibited Patterns

❌ **DO NOT** maintain both `createdAt` and `created_at`
❌ **DO NOT** maintain both `parentId` and `parent_id`
❌ **DO NOT** maintain both `pageId` and `page_id`
❌ **DO NOT** maintain both `userId` and `user_id`
❌ **DO NOT** maintain both `communityId` and `community_id`
❌ **DO NOT** maintain both `conversationId` and `conversation_id`
❌ **DO NOT** maintain both `auraColor` and `aura_color`
❌ **DO NOT** maintain both `deletedAt` and `deleted_at`
❌ **DO NOT** add comments like "Also include X for compatibility" or "Also include X for backward compatibility"
❌ **DO NOT** add fallback patterns like `field || field_other` in display/business logic code

## Required Pattern

```javascript
// ✅ CORRECT: Convert immediately at interface boundary, delete original
if (data.created_at && !data.createdAt) {
  data.createdAt = data.created_at;
  delete data.created_at;
}

// ✅ CORRECT: Use only camelCase in business logic
formatMessageTime(message.createdAt)

// ✅ CORRECT: Supabase queries can use snake_case (database column names)
supabase.from('messages').select('*').eq('parent_id', parentId)

// ❌ WRONG: Maintaining both
{
  createdAt: data.created_at,
  created_at: data.created_at // Also include for compatibility
}

// ❌ WRONG: Fallback in display/business logic
formatMessageTime(message.createdAt || message.created_at)

// ❌ WRONG: Maintaining both formats throughout code
if (message.parent_id || message.parentId) { ... }
```

## Enforcement

- This is a **RED-LINE** policy - violations block release
- All field name conversions must happen at the **interface boundary**:
  - API responses → JavaScript objects
  - Supabase query results → JavaScript objects
  - External data sources → Internal data structures
- Once converted to camelCase, use **ONLY camelCase** throughout the codebase
- Supabase queries can still use snake_case (those are actual database column names)
- But JavaScript objects must use camelCase

## Conversion Points

Standardize field names at these interface boundaries:

1. **API Response Handling**: `convertSupabaseMessageToAPIFormat()`
2. **Supabase Query Results**: When mapping query results to JavaScript objects
3. **Real-time Event Handlers**: When processing Supabase events
4. **Message Loading**: When processing `loadChatHistory()` results

## Examples from Codebase

### ✅ GOOD: convertSupabaseMessageToAPIFormat
```javascript
const apiMessage = {
  createdAt: supabaseMessage.created_at || supabaseMessage.createdAt,
  parentId: supabaseMessage.parent_id || supabaseMessage.parentId,
  pageId: supabaseMessage.page_id || supabaseMessage.pageId,
  // No duplicate fields!
};
```

### ✅ GOOD: addMessageToChat
```javascript
if (message.created_at && !message.createdAt) {
  message.createdAt = message.created_at;
  delete message.created_at;
}
formatMessageTime(message.createdAt); // Only camelCase
```

### ❌ BAD: Duplicate fields
```javascript
{
  createdAt: data.created_at,
  created_at: data.created_at, // Don't do this!
  parentId: data.parent_id,
  parent_id: data.parent_id // Don't do this!
}
```

### ❌ BAD: Fallback patterns
```javascript
formatMessageTime(message.createdAt || message.created_at); // Don't do this!
const parent = message.parentId || message.parent_id; // Don't do this!
```

## Status

- **Status**: RED-LINE (blocking)
- **Scope**: All JavaScript/TypeScript code
- **Effective**: Immediately
- **Review**: Required before any release







