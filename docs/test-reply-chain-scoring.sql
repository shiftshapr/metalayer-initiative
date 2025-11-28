-- ============================================================================
-- TEST SCRIPT: Reply Chain Scoring Function
-- ============================================================================
-- This script tests the get_top_reply_chains function
-- Run this in your PostgreSQL client (psql, pgAdmin, Supabase SQL Editor, etc.)
-- ============================================================================

-- Step 1: Find a test parent message with replies
-- Replace these with actual IDs from your database
\echo 'Step 1: Finding a test parent message...'

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

-- Step 2: Test the function with a specific parent
-- Replace the UUIDs below with actual values from Step 1
\echo ''
\echo 'Step 2: Testing get_top_reply_chains()...'
\echo 'Replace the UUIDs below with actual values from Step 1'
\echo ''

-- Example call (replace with your actual IDs):
-- SELECT * FROM get_top_reply_chains(
--   'your-parent-uuid-here'::UUID,
--   'your-page-id-here',
--   'comm-001',
--   5,  -- score threshold
--   1   -- limit per child
-- );

-- Step 3: Test with different thresholds
\echo ''
\echo 'Step 3: Testing with different thresholds...'
\echo ''

-- Low threshold (shows more chains)
-- SELECT * FROM get_top_reply_chains(
--   'your-parent-uuid-here'::UUID,
--   'your-page-id-here',
--   'comm-001',
--   1,  -- very low threshold
--   1
-- );

-- High threshold (shows only very active chains)
-- SELECT * FROM get_top_reply_chains(
--   'your-parent-uuid-here'::UUID,
--   'your-page-id-here',
--   'comm-001',
--   20,  -- high threshold
--   1
-- );

-- Step 4: Diagnostic queries
\echo ''
\echo 'Step 4: Diagnostic queries...'
\echo ''

-- Check reply structure for a parent
-- WITH RECURSIVE reply_tree AS (
--   SELECT 
--     m.id,
--     m.parent_id,
--     m.content,
--     0 as depth,
--     ARRAY[m.id] as path
--   FROM messages m
--   WHERE m.parent_id = 'your-parent-uuid-here'::UUID
--     AND NOT EXISTS (SELECT 1 FROM message_deletions md WHERE md.message_id = m.id)
--   
--   UNION ALL
--   
--   SELECT 
--     m.id,
--     m.parent_id,
--     m.content,
--     rt.depth + 1,
--     rt.path || m.id
--   FROM messages m
--   JOIN reply_tree rt ON m.parent_id = rt.id
--   WHERE NOT EXISTS (SELECT 1 FROM message_deletions md WHERE md.message_id = m.id)
--     AND NOT (m.id = ANY(rt.path))
--     AND rt.depth < 5
-- )
-- SELECT 
--   depth,
--   COUNT(*) as count
-- FROM reply_tree
-- GROUP BY depth
-- ORDER BY depth;

-- Check reactions for replies
-- SELECT 
--   m.id,
--   m.content,
--   COUNT(r.id) as reaction_count
-- FROM messages m
-- LEFT JOIN reactions r ON r.message_id = m.id
-- WHERE m.parent_id = 'your-parent-uuid-here'::UUID
--   AND NOT EXISTS (SELECT 1 FROM message_deletions md WHERE md.message_id = m.id)
-- GROUP BY m.id, m.content
-- ORDER BY COUNT(r.id) DESC
-- LIMIT 10;

-- ============================================================================
-- QUICK TEST (Uncomment and fill in your IDs)
-- ============================================================================

-- Uncomment and replace with your actual IDs:
/*
DO $$
DECLARE
  v_parent_id UUID;
  v_page_id TEXT;
BEGIN
  -- Get first parent with replies
  SELECT m.id, m.page_id INTO v_parent_id, v_page_id
  FROM messages m
  WHERE m.parent_id IS NULL
    AND EXISTS (
      SELECT 1 FROM messages r 
      WHERE r.parent_id = m.id
        AND NOT EXISTS (SELECT 1 FROM message_deletions md WHERE md.message_id = r.id)
    )
    AND NOT EXISTS (SELECT 1 FROM message_deletions md WHERE md.message_id = m.id)
  LIMIT 1;
  
  IF v_parent_id IS NULL THEN
    RAISE NOTICE 'No parent messages with replies found';
  ELSE
    RAISE NOTICE 'Testing with parent_id: %, page_id: %', v_parent_id, v_page_id;
    
    -- Call the function
    PERFORM * FROM get_top_reply_chains(
      v_parent_id,
      v_page_id,
      'comm-001',
      5,
      1
    );
    
    RAISE NOTICE 'Function executed successfully. Check results above.';
  END IF;
END $$;
*/










