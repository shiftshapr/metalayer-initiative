# Provenance Database Storage

## Overview

The `provenance_artifacts` table stores JSON-LD provenance artifacts for messages, enabling persistent, queryable provenance records.

## Schema

```sql
CREATE TABLE provenance_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  artifact JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields

- **id**: Unique identifier for the stored artifact record
- **message_id**: References the message (Post.id or messages.id)
- **artifact**: Full JSON-LD provenance artifact (stored as JSONB for querying)
- **created_at**: Timestamp when artifact was stored

### Indexes

- `idx_provenance_artifacts_message_id`: Fast lookup by message ID
- `idx_provenance_artifacts_created_at`: Time-based queries
- `idx_provenance_artifacts_message_created`: Combined index for message + time queries

## Migration

Run the migration script:

```bash
psql $DATABASE_URL -f migrations/add_provenance_artifacts_table.sql
```

Or use Prisma:

```bash
npx prisma migrate dev --name add_provenance_artifacts
```

## Usage

### Storing Artifacts

Artifacts are automatically stored when the frontend captures provenance:

```javascript
// Frontend automatically POSTs to:
POST /message/:messageId/provenance
```

### Retrieving Artifacts

The `.well-known/provenance` endpoint automatically checks the database first:

```javascript
GET /message/:messageId/.well-known/provenance
```

**Priority:**
1. Stored artifacts from database (if available)
2. Generated artifacts from message data (fallback)

### Querying Artifacts

```sql
-- Get all artifacts for a message
SELECT artifact 
FROM provenance_artifacts 
WHERE message_id = 'message-uuid'
ORDER BY created_at ASC;

-- Get artifacts by action type
SELECT artifact 
FROM provenance_artifacts 
WHERE message_id = 'message-uuid'
  AND artifact->>'claim'->>'action' = 'create';

-- Get recent artifacts
SELECT * 
FROM provenance_artifacts 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## JSON-LD Artifact Structure

Each artifact stored follows this structure:

```json
{
  "@context": "https://schema.org",
  "@type": "ProvenanceArtifact",
  "@id": "provenance:messageId:action:timestamp",
  "timestamp": "2025-11-02T15:45:00.000Z",
  "scope": {
    "type": "Message",
    "id": "message-uuid",
    "contentHash": "sha256-hash",
    "url": "https://..."
  },
  "claim": {
    "action": "create|update|delete",
    "messageId": "message-uuid",
    "content": "content-hash",
    "parentId": null,
    "userId": "user-id"
  },
  "actor": {
    "type": "System|User",
    "id": "actor-id"
  },
  "signature": "base64-signature"
}
```

## Benefits

1. **Persistence**: Artifacts survive browser clears and device changes
2. **Queryability**: Can query by message, time, action type, etc.
3. **Verification**: Stored signatures can be verified independently
4. **Audit Trail**: Complete history of provenance events
5. **Performance**: Indexed lookups are fast

## Future Enhancements

- [ ] Add foreign key constraints (when message schema stabilizes)
- [ ] Add unique constraint on artifact @id to prevent duplicates
- [ ] Add GIN index on artifact JSONB for advanced queries
- [ ] Add archival/cleanup policies for old artifacts
- [ ] Add signature verification endpoint





