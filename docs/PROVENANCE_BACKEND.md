# Backend Provenance Implementation

## Overview

The backend provides a `.well-known/provenance` endpoint that serves provenance artifacts for messages in JSON-LD format, following the Digital Vellum Note #3 specification.

## Endpoints

### GET `/message/:messageId/.well-known/provenance`

Serves provenance artifacts for a specific message.

**Response Format:**
```json
{
  "@context": "https://schema.org",
  "@type": "ProvenanceCollection",
  "messageId": "uuid",
  "retrievedAt": "2025-11-02T15:45:00.000Z",
  "artifacts": [
    {
      "@context": "https://schema.org",
      "@type": "ProvenanceArtifact",
      "@id": "provenance:messageId:create:timestamp",
      "timestamp": "2025-11-02T15:45:00.000Z",
      "scope": {
        "type": "Message",
        "id": "messageId",
        "contentHash": "sha256-hash",
        "url": "https://..."
      },
      "claim": {
        "action": "create|update|delete",
        "messageId": "uuid",
        "content": "content-hash",
        "parentId": null,
        "userId": "user-id"
      },
      "actor": {
        "type": "User",
        "id": "user-id",
        "handle": "username",
        "name": "Display Name"
      },
      "signature": null,
      "note": "Generated on-demand from message data"
    }
  ]
}
```

**Headers:**
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *` (for CORS)

**Status Codes:**
- `200`: Success
- `400`: Missing message ID
- `404`: Message not found
- `500`: Server error

### POST `/message/:messageId/provenance`

Store provenance artifact (for future use when client sends signed artifacts).

**Request Body:**
```json
{
  "@context": "https://schema.org",
  "@type": "ProvenanceArtifact",
  "@id": "provenance:messageId:action:timestamp",
  "timestamp": "2025-11-02T15:45:00.000Z",
  "scope": {...},
  "claim": {...},
  "actor": {...},
  "signature": "base64-signature"
}
```

**Note:** Currently acknowledges receipt but doesn't persist. Future implementation will store in database.

## Implementation Details

### Current Approach

The endpoint **generates provenance artifacts on-demand** from message data stored in the database:

1. Looks up message in `Post` table (current system)
2. Falls back to `messages` table (legacy)
3. Generates artifacts for:
   - **Create**: From message creation timestamp
   - **Update**: From `editedAt` timestamp (if different from creation)
   - **Delete**: From `message_deletions` table (if deleted)

### Future Enhancements

1. **Database Storage**: Create `provenance_artifacts` table to store client-signed artifacts
2. **Signature Verification**: Verify signatures from client artifacts
3. **Caching**: Cache generated artifacts for performance
4. **Webhook Support**: Accept provenance artifacts from client and store them

### Database Schema (Future)

```sql
CREATE TABLE provenance_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  artifact JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (message_id) REFERENCES post(id) ON DELETE CASCADE
);

CREATE INDEX idx_provenance_artifacts_message_id ON provenance_artifacts(message_id);
CREATE INDEX idx_provenance_artifacts_created_at ON provenance_artifacts(created_at);
```

## Integration with Frontend

The frontend extension automatically:
1. Injects `<link rel="provenance" href=".../.well-known/provenance">` tags
2. Points to this backend endpoint
3. Crawlers and meta-layer can discover provenance via these links

## Testing

```bash
# Test endpoint
curl https://app.canopi.live/message/{messageId}/.well-known/provenance

# With proper headers
curl -H "Accept: application/json" \
     https://app.canopi.live/message/{messageId}/.well-known/provenance
```

## Files

- `routes/provenance.js` - Route definitions
- `controllers/provenanceController.js` - Controller logic
- Registered in `app.js` at root level













