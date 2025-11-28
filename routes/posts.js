/**
 * Posts API Routes
 * Simple endpoints for top posts
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { getRuntimeConfig } = require('../config/validateEnv');

const runtimeConfig = getRuntimeConfig();
const supabase = createClient(runtimeConfig.supabase.url, runtimeConfig.supabase.anonKey);

/**
 * GET /api/posts/top
 * Get top posts with simple algorithm (for low traffic)
 * Query params: algorithm (simple|engagement|recent), limit (default: 5)
 */
router.get('/top', async (req, res) => {
  try {
    const algorithm = req.query.algorithm || 'simple';
    const limit = parseInt(req.query.limit) || 5;

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Simple query - get recent messages (reactions count will be fetched separately)
    let query = supabase
      .from('messages')
      .select('id, content, user_id, created_at')
      .eq('deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Simple algorithm: most recent posts
    // Can be extended later with engagement scoring
    if (algorithm === 'simple') {
      // Already ordered by created_at desc
    } else if (algorithm === 'recent') {
      // Same as simple for now
      query = query.order('created_at', { ascending: false });
    } else if (algorithm === 'engagement') {
      // TODO: Implement engagement scoring
      // For now, fall back to simple
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('POSTS: Error fetching top posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
    }

    // Get reaction counts separately (simple version for low traffic)
    const items = await Promise.all((data || []).map(async (post) => {
      // Get reaction count
      const { count: reactionCount } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('message_id', post.id);

      return {
        id: post.id,
        title: post.content?.substring(0, 100) || 'Untitled post',
        subtitle: post.content?.length > 100 ? post.content.substring(100, 200) + '...' : undefined,
        metadata: `${reactionCount || 0} reactions`,
        content: post.content,
        userId: post.user_id,
        createdAt: post.created_at
      };
    }));

    res.json({ items, algorithm, limit });
  } catch (error) {
    console.error('POSTS: Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;

