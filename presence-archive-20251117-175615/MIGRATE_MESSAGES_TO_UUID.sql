-- SQL to check and diagnose message loading issues
-- All messages already have correct UUID: abe5ec85-4ba6-456f-adaf-03d7d51cecf4

-- Check what pageIds exist in messages (this is likely the issue)
SELECT DISTINCT page_id, COUNT(*) as message_count
FROM messages
WHERE community_id = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4'
GROUP BY page_id
ORDER BY message_count DESC;

-- Check full message details
SELECT id, page_id, community_id, content, created_at
FROM messages
WHERE community_id = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4'
ORDER BY created_at DESC
LIMIT 10;

-- If messages are on different pages, you may need to:
-- 1. Update pageIds to match current normalization
-- 2. Or query without pageId filter for testing

