# Unified Message Modal - Reply & Quote Support

## Overview

The UnifiedMessageModal now fully supports replies and quotes with automatic message loading, preview display, and proper API integration.

## What Was Implemented

### 1. **Parent Message Loading (Replies)**
- When opening in `reply` mode with a `parentId`, the modal automatically fetches the parent message
- Displays parent message preview with author name and truncated content
- Shows "Replying to:" context label

### 2. **Quoted Message Loading (Quotes)**
- When opening in `quote` mode with a `quoteId`, the modal automatically fetches the quoted message
- Displays quoted message preview with author name and truncated content
- Shows "Quoting:" context label

### 3. **API Integration**
- Updated `POST /api/messages` to accept `quoteId` parameter
- Updated database INSERT to include `quote_id` column
- API response now includes both `parentId` and `quoteId`

### 4. **Helper Functions**
Two convenient helper functions are available on `window`:

```typescript
// Open modal for replying to a message
window.openReplyModal(message: Message, pageId: string)

// Open modal for quoting a message
window.openQuoteModal(message: Message, pageId: string)
```

### 5. **UI Enhancements**
- Context preview sections with proper styling
- Author name display
- Truncated content preview (100 chars for replies, 150 for quotes)
- Loading states while fetching parent/quoted messages
- HTML escaping for security

## Usage Examples

### Opening a Reply Modal

```typescript
// From a message click handler
const message = { id: 'msg-123', content: 'Original message', ... };
await window.openReplyModal(message, 'current-page-id');
```

### Opening a Quote Modal

```typescript
// From a quote button click
const message = { id: 'msg-456', content: 'Message to quote', ... };
await window.openQuoteModal(message, 'current-page-id');
```

### Manual Modal Opening

```typescript
// For more control
await window.openMessageModal({
  mode: 'reply',
  pageId: 'current-page-id',
  parentId: 'parent-message-id',
  communityId: 'comm-001',
  onSuccess: (replyMessage) => {
    console.log('Reply sent:', replyMessage);
    // Refresh UI or add to message list
  }
});

// For quotes
await window.openMessageModal({
  mode: 'quote',
  pageId: 'current-page-id',
  quoteId: 'quoted-message-id',
  communityId: 'comm-001',
  onSuccess: (quoteMessage) => {
    console.log('Quote sent:', quoteMessage);
  }
});
```

## Integration Points

### Replace Existing Reply Handlers

In your message action handlers, replace:

```javascript
// Old way
function handleReplyClick(messageId, message) {
  // Show sidebar input or old modal
  handleReplyToMessage(message);
}

// New way
async function handleReplyClick(messageId, message) {
  const pageId = getCurrentPageId(); // Get from your state
  await window.openReplyModal(message, pageId);
}
```

### Replace Existing Quote Handlers

```javascript
// Old way
async function sendQuotePost(quotedMessageId, quoteText, communityId) {
  // Use old quote sending logic
}

// New way
async function handleQuoteClick(message) {
  const pageId = getCurrentPageId();
  await window.openQuoteModal(message, pageId);
}
```

## API Changes

### Request Body (POST /api/messages)

```json
{
  "content": "Message content",
  "pageId": "page-id",
  "parentId": "parent-id",  // Optional, for replies
  "quoteId": "quote-id",     // Optional, for quotes
  "communityId": "comm-001",
  "messageKind": "TEXT",
  "attachments": [],
  "emojiMetadata": null,
  "focusContext": null,
  "userId": "user-id"
}
```

### Response

```json
{
  "id": "message-id",
  "content": "Message content",
  "parentId": "parent-id",   // If this is a reply
  "quoteId": "quote-id",      // If this is a quote
  "messageKind": "TEXT",
  "attachments": [],
  "emojiMetadata": null,
  "author": { ... },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "focusContext": { "mode": "default" }
}
```

## CSS Classes

The modal includes these context preview classes:

- `.unified-message-parent-context` - Container for reply context
- `.unified-message-quote-context` - Container for quote context
- `.unified-message-context-label` - "Replying to:" / "Quoting:" label
- `.unified-message-context-author` - Author name in preview
- `.unified-message-context-text` - Message content preview
- `.unified-message-loading` - Loading state indicator

## Error Handling

- If parent/quoted message fails to load, the modal still opens
- Error is logged to console but doesn't block modal usage
- User can still send reply/quote even if preview didn't load

## Next Steps

1. **Replace existing reply/quote handlers** in CanopiModule.js to use the new modal
2. **Test reply flow** - Click reply button, verify parent loads, send reply
3. **Test quote flow** - Click quote button, verify quoted message loads, send quote
4. **Update message display** to show quote context when displaying quoted messages
5. **Add quote rendering** in UnifiedMessageDisplay component

