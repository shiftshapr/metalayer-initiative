# Testing Reply Chain Scoring Function

This guide explains how to test the `get_top_reply_chains` SQL function.

## Files Created

1. **Migration**: `prisma/migrations/$(date +%Y%m%d%H%M%S)_add_reply_chain_scoring_function/migration.sql`
   - Contains the function definition
   - Run this migration to add the function to your database

2. **Test Script (Node.js)**: `prisma/test-reply-chain-scoring.js`
   - Automated test using Prisma
   - Finds test data automatically or accepts parameters

3. **Test Script (SQL)**: `docs/test-reply-chain-scoring.sql`
   - Manual SQL queries for testing
   - Can be run in any PostgreSQL client

## Option 1: Run Migration + Node.js Test

### Step 1: Run the Migration

```bash
cd /home/ubuntu/metalayer-initiative
npx prisma migrate dev --name add_reply_chain_scoring_function
```

Or apply the migration directly:

```bash
psql $DATABASE_URL -f prisma/migrations/$(date +%Y%m%d%H%M%S)_add_reply_chain_scoring_function/migration.sql
```

### Step 2: Run the Test Script

```bash
# Auto-find test data
node prisma/test-reply-chain-scoring.js

# Or specify parameters
node prisma/test-reply-chain-scoring.js <parent_id> <page_id> <community_id> <threshold>
```

Example:
```bash
node prisma/test-reply-chain-scoring.js \
  '550e8400-e29b-41d4-a716-446655440000' \
  'https://example.com/page' \
  'comm-001' \
  5
```

## Option 2: Manual SQL Testing

### Step 1: Run the Migration

Same as Option 1, Step 1.

### Step 2: Find Test Data

Run this query to find parent messages with replies:

```sql
SELECT 
  m.id as parent_id,
  m.page_id,
  m.community_id,
  m.content as parent_content,
  COUNT(r.id) as reply_count
FROM messages m
LEFT JOIN messages r ON r.parent_id = m.id
  AND NOT EXISTS (SELECT 1 FROM message_deletions md WHERE md.message_id = r.id)
WHERE m.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM message_deletions md WHERE md.message_id = m.id)
GROUP BY m.id, m.page_id, m.community_id, m.content
HAVING COUNT(r.id) > 0
ORDER BY COUNT(r.id) DESC
LIMIT 5;
```

### Step 3: Test the Function

Replace the UUIDs with values from Step 2:

```sql
SELECT * FROM get_top_reply_chains(
  'your-parent-uuid-here'::UUID,
  'your-page-id-here',
  'comm-001',
  5,  -- score threshold
  1   -- limit per child
);
```

### Step 4: Test Different Thresholds

```sql
-- Low threshold (shows more chains)
SELECT * FROM get_top_reply_chains(
  'your-parent-uuid-here'::UUID,
  'your-page-id-here',
  'comm-001',
  1,  -- very low threshold
  1
);

-- High threshold (shows only very active chains)
SELECT * FROM get_top_reply_chains(
  'your-parent-uuid-here'::UUID,
  'your-page-id-here',
  'comm-001',
  20,  -- high threshold
  1
);
```

## Expected Results

The function returns:
- `child_id`: ID of the direct reply to the parent
- `child_content`: Content of the child reply
- `child_author_*`: Author information for the child
- `chain_score`: Total score of the chain (reactions + replies)
- `chain_reply_count`: Number of nested replies in the chain
- `first_reply_id`: ID of the first reply in the best chain
- `first_reply_content`: Content of the first reply
- `first_reply_author_*`: Author information for the first reply
- `has_more_replies`: Boolean indicating if there are more replies beyond the first

## Troubleshooting

### "No reply chains found above threshold"

- Lower the threshold (try 1 or 2)
- Check if replies have reactions or nested replies
- Verify the parent_id and page_id are correct

### "Function does not exist"

- Make sure you ran the migration
- Check that the function was created: `\df get_top_reply_chains` in psql

### "Table does not exist" or "Column does not exist"

- Verify table names match your schema (`AppUser` vs `app_user`)
- Check that all required columns exist in `messages`, `reactions`, `AppUser`, `message_deletions`

### Performance Issues

- The function uses recursive CTEs which can be slow on large trees
- Consider adding indexes on `messages.parent_id` and `reactions.message_id`
- Limit recursion depth if needed (currently set to 10)

## Next Steps

Once testing is successful:
1. Integrate the function into the REST endpoint
2. Update the response schema to include chain data
3. Update the UI to display reply chains with "Show replies" links


