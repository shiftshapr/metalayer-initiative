const express = require('express');
const router = express.Router();
const PresenceService = require('../services/presenceService');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const presenceService = new PresenceService(prisma);

// Middleware to ensure user is authenticated
const authenticateUser = (req, res, next) => {
  const userEmail = req.headers['x-user-email'];
  const userId = req.headers['x-user-id'];
  
  if (!userEmail || !userId) {
    return res.status(401).json({ error: 'Unauthorized: x-user-email and x-user-id headers required' });
  }
  
  req.user = { email: userEmail, id: userId };
  next();
};

// POST /v1/presence/event - Record a presence event
router.post('/event', authenticateUser, async (req, res) => {
  const { pageId, kind, availability, customLabel } = req.body;
  const { id: userId } = req.user;

  if (!pageId || !kind) {
    return res.status(400).json({ error: 'pageId and kind are required' });
  }

  if (!['ENTER', 'HEARTBEAT', 'EXIT', 'AVAILABILITY'].includes(kind)) {
    return res.status(400).json({ error: 'Invalid kind. Must be ENTER, HEARTBEAT, EXIT, or AVAILABILITY' });
  }

  if (availability && !['AVAILABLE', 'BUSY', 'AWAY', 'CUSTOM'].includes(availability)) {
    return res.status(400).json({ error: 'Invalid availability. Must be AVAILABLE, BUSY, AWAY, or CUSTOM' });
  }

  try {
    const presenceEvent = await presenceService.recordPresenceEvent(
      userId,
      pageId,
      kind,
      availability,
      customLabel
    );
    
    res.json(presenceEvent);
  } catch (error) {
    console.error('Error recording presence event:', error);
    res.status(500).json({ error: 'Failed to record presence event' });
  }
});

// GET /v1/presence/active - Get active users on a page
router.get('/active', async (req, res) => {
  const { pageId, communityId, minutes = 5 } = req.query;

  if (!pageId) {
    return res.status(400).json({ error: 'pageId is required' });
  }

  try {
    const activeUsers = await presenceService.getActiveUsers(
      pageId,
      communityId,
      parseInt(minutes)
    );
    
    res.json({ active: activeUsers });
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({ error: 'Failed to get active users' });
  }
});

// GET /v1/presence/communities - Get active users across multiple communities
router.get('/communities', async (req, res) => {
  const { communityIds, minutes = 5 } = req.query;

  if (!communityIds) {
    return res.status(400).json({ error: 'communityIds is required (comma-separated)' });
  }

  const communityIdArray = communityIds.split(',').map(id => id.trim());

  try {
    const activeUsers = await presenceService.getActiveUsersForCommunities(
      communityIdArray,
      parseInt(minutes)
    );
    
    res.json({ active: activeUsers });
  } catch (error) {
    console.error('Error getting active users for communities:', error);
    res.status(500).json({ error: 'Failed to get active users for communities' });
  }
});

// GET /v1/presence/url - Get active users on a specific URL with optional community filtering
router.get('/url', async (req, res) => {
  const { url, communityIds, minutes = 5 } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    // For now, return empty result to get the system working
    // TODO: Implement proper page creation and presence tracking
    console.log(`🔍 PRESENCE: URL-based presence request for: ${url}, communities: ${communityIds}`);
    
    res.json({ 
      active: [], 
      pageId: null, 
      url: url,
      message: 'URL-based presence tracking - returning empty for now'
    });
  } catch (error) {
    console.error('Error getting active users for URL:', error);
    res.status(500).json({ 
      error: 'Failed to get active users for URL',
      details: error.message 
    });
  }
});

// GET /v1/presence/stats - Get presence statistics for a page
router.get('/stats', async (req, res) => {
  const { pageId, hours = 24 } = req.query;

  if (!pageId) {
    return res.status(400).json({ error: 'pageId is required' });
  }

  try {
    const stats = await presenceService.getPresenceStats(pageId, parseInt(hours));
    res.json(stats);
  } catch (error) {
    console.error('Error getting presence stats:', error);
    res.status(500).json({ error: 'Failed to get presence stats' });
  }
});

// POST /v1/presence/cleanup - Clean up old presence events (admin endpoint)
router.post('/cleanup', async (req, res) => {
  const { days = 7 } = req.body;

  try {
    const deletedCount = await presenceService.cleanupOldPresenceEvents(parseInt(days));
    res.json({ message: `Cleaned up ${deletedCount} old presence events` });
  } catch (error) {
    console.error('Error cleaning up presence events:', error);
    res.status(500).json({ error: 'Failed to cleanup presence events' });
  }
});

module.exports = router;
