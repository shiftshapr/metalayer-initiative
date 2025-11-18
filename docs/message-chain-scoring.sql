-- ============================================================================
-- RECURSIVE REPLY CHAIN SCORING
-- ============================================================================
-- Purpose: Calculate top-scoring reply chains for each child reply
-- Scoring: 1 pt per reaction, 3 pts per comment (reply)
-- Chain score = sum of reply score + all nested replies recursively
-- Only return chains with score > threshold X
-- ============================================================================

-- Function to get top reply chains for a parent message
CREATE OR REPLACE FUNCTION get_top_reply_chains(
  p_parent_id UUID,
  p_page_id TEXT,
  p_community_id TEXT DEFAULT 'comm-001',
  p_score_threshold INTEGER DEFAULT 5,
  p_limit_per_child INTEGER DEFAULT 1
)
RETURNS TABLE (
  child_id UUID,
  child_content TEXT,
  child_created_at TIMESTAMPTZ,
  child_author_id UUID,
  child_author_name TEXT,
  child_author_avatar_url TEXT,
  chain_score INTEGER,
  chain_reply_count INTEGER,
  first_reply_id UUID,
  first_reply_content TEXT,
  first_reply_created_at TIMESTAMPTZ,
  first_reply_author_id UUID,
  first_reply_author_name TEXT,
  first_reply_author_avatar_url TEXT,
  has_more_replies BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE reply_tree AS (
    -- Base case: Direct children of parent
    SELECT 
      m.id AS reply_id,
      m.parent_id,
      m.content,
      m.created_at,
      m.user_id AS author_id,
      u.name AS author_name,
      u.avatar_url AS author_avatar_url,
      ARRAY[m.id] AS path,  -- Track path to detect cycles
      0 AS depth
    FROM messages m
    JOIN "AppUser" u ON m.user_id = u.id
    WHERE m.parent_id = p_parent_id
      AND m.page_id = p_page_id
      AND m.community_id = p_community_id
      AND NOT EXISTS (
        SELECT 1 FROM message_deletions md 
        WHERE md.message_id = m.id
      )
    
    UNION ALL
    
    -- Recursive case: Nested replies
    SELECT 
      m.id AS reply_id,
      m.parent_id,
      m.content,
      m.created_at,
      m.user_id AS author_id,
      u.name AS author_name,
      u.avatar_url AS author_avatar_url,
      rt.path || m.id,  -- Append to path
      rt.depth + 1
    FROM messages m
    JOIN "AppUser" u ON m.user_id = u.id
    JOIN reply_tree rt ON m.parent_id = rt.reply_id
    WHERE m.page_id = p_page_id
      AND m.community_id = p_community_id
      AND NOT EXISTS (
        SELECT 1 FROM message_deletions md 
        WHERE md.message_id = m.id
      )
      AND NOT (m.id = ANY(rt.path))  -- Prevent cycles
      AND rt.depth < 10  -- Safety limit for recursion depth
  ),
  
  -- Calculate scores for each reply in the tree
  reply_scores AS (
    SELECT 
      rt.reply_id,
      rt.parent_id,
      rt.content,
      rt.created_at,
      rt.author_id,
      rt.author_name,
      rt.author_avatar_url,
      rt.path,
      rt.depth,
      -- Count reactions (1 pt each)
      COALESCE(react_count.count, 0) AS reaction_count,
      -- Count direct replies (3 pts each)
      COALESCE(reply_count.count, 0) AS reply_count,
      -- Calculate reply score
      COALESCE(react_count.count, 0) * 1 + COALESCE(reply_count.count, 0) * 3 AS reply_score
    FROM reply_tree rt
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::INTEGER AS count
      FROM reactions r
      WHERE r.message_id = rt.reply_id
    ) react_count ON TRUE
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::INTEGER AS count
      FROM messages m
      WHERE m.parent_id = rt.reply_id
        AND NOT EXISTS (
          SELECT 1 FROM message_deletions md 
          WHERE md.message_id = m.id
        )
    ) reply_count ON TRUE
  ),
  
  -- Get direct children (first level replies to parent)
  direct_children AS (
    SELECT DISTINCT reply_id
    FROM reply_scores
    WHERE parent_id = p_parent_id
  ),
  
  -- Calculate chain scores: sum of reply + all nested replies recursively
  chain_scores AS (
    SELECT 
      dc.reply_id AS child_id,
      rs_child.content AS child_content,
      rs_child.created_at AS child_created_at,
      rs_child.author_id AS child_author_id,
      rs_child.author_name AS child_author_name,
      rs_child.author_avatar_url AS child_author_avatar_url,
      -- Sum all scores in the chain (child + all descendants)
      (
        SELECT SUM(reply_score)
        FROM reply_scores rs_nested
        WHERE rs_nested.path @> ARRAY[dc.reply_id]
          OR rs_nested.reply_id = dc.reply_id
      ) AS chain_score,
      -- Count total replies in chain
      (
        SELECT COUNT(*)
        FROM reply_scores rs_nested
        WHERE rs_nested.path @> ARRAY[dc.reply_id]
          AND rs_nested.reply_id != dc.reply_id
      ) AS chain_reply_count
    FROM direct_children dc
    JOIN reply_scores rs_child ON dc.reply_id = rs_child.reply_id
  ),
  
  -- For each child, find the best chain (top-scoring nested reply chain)
  top_chains AS (
    SELECT DISTINCT ON (cs.child_id)
      cs.child_id,
      cs.child_content,
      cs.child_created_at,
      cs.child_author_id,
      cs.child_author_name,
      cs.child_author_avatar_url,
      cs.chain_score,
      cs.chain_reply_count,
      -- Find first reply in the best chain (first nested reply with highest score)
      (
        SELECT rs.reply_id
        FROM reply_scores rs
        WHERE rs.path @> ARRAY[cs.child_id]
          AND rs.reply_id != cs.child_id
        ORDER BY rs.reply_score DESC, rs.created_at ASC
        LIMIT 1
      ) AS first_reply_id,
      (
        SELECT rs.content
        FROM reply_scores rs
        WHERE rs.path @> ARRAY[cs.child_id]
          AND rs.reply_id != cs.child_id
        ORDER BY rs.reply_score DESC, rs.created_at ASC
        LIMIT 1
      ) AS first_reply_content,
      (
        SELECT rs.created_at
        FROM reply_scores rs
        WHERE rs.path @> ARRAY[cs.child_id]
          AND rs.reply_id != cs.child_id
        ORDER BY rs.reply_score DESC, rs.created_at ASC
        LIMIT 1
      ) AS first_reply_created_at,
      (
        SELECT rs.author_id
        FROM reply_scores rs
        WHERE rs.path @> ARRAY[cs.child_id]
          AND rs.reply_id != cs.child_id
        ORDER BY rs.reply_score DESC, rs.created_at ASC
        LIMIT 1
      ) AS first_reply_author_id,
      (
        SELECT rs.author_name
        FROM reply_scores rs
        WHERE rs.path @> ARRAY[cs.child_id]
          AND rs.reply_id != cs.child_id
        ORDER BY rs.reply_score DESC, rs.created_at ASC
        LIMIT 1
      ) AS first_reply_author_name,
      (
        SELECT rs.author_avatar_url
        FROM reply_scores rs
        WHERE rs.path @> ARRAY[cs.child_id]
          AND rs.reply_id != cs.child_id
        ORDER BY rs.reply_score DESC, rs.created_at ASC
        LIMIT 1
      ) AS first_reply_author_avatar_url,
      -- Check if there are more replies beyond the first
      (
        SELECT COUNT(*) > 1
        FROM reply_scores rs
        WHERE rs.path @> ARRAY[cs.child_id]
          AND rs.reply_id != cs.child_id
      ) AS has_more_replies
    FROM chain_scores cs
    WHERE cs.chain_score >= p_score_threshold
    ORDER BY cs.child_id, cs.chain_score DESC
  )
  
  SELECT 
    tc.child_id,
    tc.child_content,
    tc.child_created_at,
    tc.child_author_id,
    tc.child_author_name,
    tc.child_author_avatar_url,
    tc.chain_score,
    tc.chain_reply_count,
    tc.first_reply_id,
    tc.first_reply_content,
    tc.first_reply_created_at,
    tc.first_reply_author_id,
    tc.first_reply_author_name,
    tc.first_reply_author_avatar_url,
    tc.has_more_replies
  FROM top_chains tc
  ORDER BY tc.chain_score DESC, tc.child_created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example 1: Get top reply chains for a parent message (default threshold: 5)
-- SELECT * FROM get_top_reply_chains(
--   'parent-message-uuid'::UUID,
--   'page-id',
--   'comm-001',
--   5,  -- score threshold
--   1   -- limit per child
-- );

-- Example 2: Get chains with higher threshold (only very active chains)
-- SELECT * FROM get_top_reply_chains(
--   'parent-message-uuid'::UUID,
--   'page-id',
--   'comm-001',
--   10,  -- higher threshold
--   1
-- );

-- Example 3: For REST endpoint integration
-- This would be called for each parent message when loading top-level messages
-- The result includes all data needed to render the child + first reply in chain

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Index for faster parent_id lookups (already exists)
-- CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_id);

-- Index for faster reaction counts
-- CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);

-- Index for faster reply counts (nested queries)
-- The existing parent_id index should cover this

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. The function uses recursive CTE to traverse reply trees
-- 2. Path array prevents infinite loops (cycle detection)
-- 3. Depth limit (10) prevents runaway recursion
-- 4. Scores are calculated: reactions * 1 + replies * 3
-- 5. Chain score = sum of all scores in the chain (child + descendants)
-- 6. Only returns chains above threshold
-- 7. For each child, returns the top-scoring chain starting from that child
-- 8. Includes "has_more_replies" flag to show "Show replies" link
-- 9. Table names: Uses "app_user" (Prisma default). If your schema uses 
--    "AppUser" (PascalCase), update the JOIN clauses accordingly.
-- 10. Soft deletes: Checks message_deletions table (not a deleted_at column)

