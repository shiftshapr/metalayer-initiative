# Messages API Implementation

## Overview

New REST API endpoint for messages with keyset pagination, reply chain scoring, and unified response format.

## Endpoints

### GET /api/messages

Get messages with keyset pagination.

**Query Parameters:**
- `pageId` (required): Page ID (normalized URL)
- `parentId` (optional): Parent message ID (null or omitted for top-level)
- `limit` (optional): Max items per page (default: 10, max: 100)
- `cursor` (optional): Keyset cursor from previous response (`createdAt|id`)
- `includeTopReply` (optional): Include best reply chain (default: true for parentId=null)
- `focusContextId` (optional): When entering focus mode, allows bundling parent
- `communityId` (optional): Community ID (default: 'comm-001')

**Response:**
```json
{
  "pageId": "string",
  "parentId": null,
  "items": [
    {
      "id": "uuid",
      "messageKind": "TEXT",
      "content": "string",
      "attachments": [],
      "emojiMetadata": null,
      "author": {
        "id": "uuid",
        "name": "string",
        "handle": "string",
        "avatarUrl": "string",
        "auraColor": "string"
      },
      "createdAt": "2025-01-30T12:34:56.123Z",
      "updatedAt": "2025-01-30T12:35:10.000Z",
      "parentId": null,
      "thread": {
        "replyCount": 12,
        "topReply": {
          "id": "uuid",
          "content": "string",
          "reactions": {},
          "createdAt": "2025-01-30T12:40:00Z",
          "author": {
            "id": "uuid",
            "name": "string",
            "avatarUrl": "string"
          },
          "hasMoreReplies": true
        }
      },
      "focusContext": { "mode": "default" }
    }
  ],
  "parent": null,
  "nextCursor": "2025-01-30T12:34:56.123Z|7f4c5a2d",
  "hasMore": true,
  "metadata": {
    "pageTitle": null,
    "totalCountApprox": null
  }
}
```

### GET /api/messages/:id

Get a single message with context.

**Response:**
```json
{
  "id": "uuid",
  "messageKind": "TEXT",
  "content": "string",
  "attachments": [],
  "emojiMetadata": null,
  "author": { ... },
  "createdAt": "2025-01-30T12:34:56.123Z",
  "updatedAt": "2025-01-30T12:35:10.000Z",
  "parentId": null
}
```

### POST /api/messages

Create a new message.

**Request Body:**
```json
{
  "content": "string",
  "pageId": "string",
  "parentId": "uuid" | null,
  "communityId": "string",
  "messageKind": "TEXT",
  "attachments": [],
  "emojiMetadata": null,
  "focusContext": null
}
```

**Response:**
Same format as GET /api/messages/:id

## Features

### Keyset Pagination

- Uses `(created_at, id)` tuple for cursor
- Format: `"2025-01-30T12:34:56.123Z|uuid"`
- Consistent performance regardless of offset
- Real-time safe (no page shifts on new messages)

### Reply Chain Scoring

- Automatically included for top-level messages when `includeTopReply=true`
- Uses `get_top_reply_chains()` SQL function
- Returns best reply chain per child (if score > threshold)
- Includes first reply in chain + "hasMoreReplies" flag

### Response Format

- Unified structure for all message types
- Includes author info, timestamps, thread data
- Ready for media attachments (currently empty array)
- Focus context support (default/parent/child modes)

## Files Created

1. **routes/messages.js** - Route definitions
2. **controllers/messagesController.js** - Business logic
3. **Registered in app.js** - `/api/messages` endpoint

## Testing

### Test with existing data:
```bash
curl "http://localhost:3001/api/messages?pageId=test-page-reply-chains&parentId=null&limit=10"
```

### Test with cursor:
```bash
curl "http://localhost:3001/api/messages?pageId=test-page-reply-chains&parentId=null&limit=10&cursor=2025-01-30T12:34:56.123Z|uuid"
```

### Test focus mode (replies):
```bash
curl "http://localhost:3001/api/messages?pageId=test-page-reply-chains&parentId=ab203467-b455-4fda-b0ea-28e318036336&limit=10"
```

## Next Steps

1. ✅ SQL function created and tested
2. ✅ REST endpoint created
3. ⏳ Frontend MessageStore integration
4. ⏳ Overlay spinner UI
5. ⏳ IntersectionObserver lazy loading
6. ⏳ Real-time subscription service refactor





