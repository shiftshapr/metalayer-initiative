/**
 * Canopies API Routes
 * Simple endpoints for top canopies
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CANOPIES: Supabase credentials not configured');
} else {
  console.log('✅ CANOPIES: Supabase credentials configured');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * GET /api/canopies/top
 * Get top canopies with simple algorithm (for low traffic)
 * Query params: algorithm (simple|engagement|recent), limit (default: 5)
 */
router.get('/top', async (req, res) => {
  try {
    const algorithm = req.query.algorithm || 'simple';
    const limit = parseInt(req.query.limit) || 5;

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get communities (canopies) - basic info first, counts fetched separately
    let query = supabase
      .from('MetaCommunity')
      .select('id, name, description, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Simple algorithm: most recent communities
    // Can be extended later with engagement scoring
    if (algorithm === 'simple') {
      // Already ordered by created_at desc
    } else if (algorithm === 'recent') {
      // Same as simple for now
      query = query.order('created_at', { ascending: false });
    } else if (algorithm === 'engagement') {
      // TODO: Implement engagement scoring based on member count, message count
      // For now, fall back to simple
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('CANOPIES: Error fetching top canopies:', error);
      return res.status(500).json({ error: 'Failed to fetch canopies', details: error.message });
    }

    // Get member and message counts separately (simple version for low traffic)
    const items = await Promise.all((data || []).map(async (canopy) => {
      // Get member count
      const { count: memberCount } = await supabase
        .from('MetaCommunityMembership')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', canopy.id);
      
      // Get message count (messages in this community)
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', canopy.id)
        .eq('deleted', false);

      return {
        id: canopy.id,
        title: canopy.name || 'Unnamed Canopy',
        subtitle: canopy.description?.substring(0, 100),
        metadata: `${memberCount || 0} members • ${messageCount || 0} messages`,
        name: canopy.name,
        description: canopy.description,
        createdAt: canopy.created_at
      };
    }));

    res.json({ items, algorithm, limit });
  } catch (error) {
    console.error('CANOPIES: Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;

