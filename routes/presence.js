const express = require('express');
const router = express.Router();
const PresenceService = require('../services/presenceService');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const presenceService = new PresenceService(prisma);

// URL Normalization endpoint - no auth required for this utility endpoint
router.post('/normalize-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`🔍 URL_NORMALIZE: Normalizing URL: ${url}`);
    
    const UrlNormalizationService = require('../services/urlNormalizationService');
    const urlNormalizationService = new UrlNormalizationService();
    const result = await urlNormalizationService.normalizeUrl(url);
    
    console.log(`✅ URL_NORMALIZE: Result:`, result);
    
    res.json(result);
  } catch (error) {
    console.error('Error normalizing URL:', error);
    res.status(500).json({ error: 'Failed to normalize URL' });
  }
});

// Middleware to ensure user is authenticated
const authenticateUser = async (req, res, next) => {
  const userEmail = req.headers['x-user-email'];
  const userName = req.headers['x-user-name'];
  const userAvatarUrl = req.headers['x-user-avatar'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized: x-user-email header required' });
  }
  
  try {
    // Look up user by email in database
    const user = await prisma.appUser.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found in database' });
    }
    
    req.user = { email: userEmail, id: user.id, name: userName, avatarUrl: userAvatarUrl };
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /v1/presence/event - Record a presence event
router.post('/event', authenticateUser, async (req, res) => {
  const { pageId, kind, availability, customLabel, pageUrl } = req.body;
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
      customLabel,
      pageUrl
    );
    
        // Process heartbeat timeouts to create EXIT events for inactive users
        // Temporarily disabled - too aggressive
        // await presenceService.processHeartbeatTimeouts();
        // await presenceService.cleanupVisibilityAfterExit();
    
    res.json(presenceEvent);
  } catch (error) {
    console.error('Error recording presence event:', error);
    res.status(500).json({ error: 'Failed to record presence event' });
  }
});

// GET /v1/presence/active - Get active users on a page
router.get('/active', authenticateUser, async (req, res) => {
  const { pageId, communityId, minutes = 5 } = req.query;
  const { id: currentUserId } = req.user;

  if (!pageId) {
    return res.status(400).json({ error: 'pageId is required' });
  }

  try {
    const activeUsers = await presenceService.getActiveUsers(
      pageId,
      communityId,
      parseInt(minutes),
      currentUserId
    );
    
    res.json({ active: activeUsers });
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({ error: 'Failed to get active users' });
  }
});

// GET /v1/presence/communities - Get active users across multiple communities
router.get('/communities', authenticateUser, async (req, res) => {
  const { communityIds, minutes = 5 } = req.query;
  const { id: currentUserId } = req.user;

  if (!communityIds) {
    return res.status(400).json({ error: 'communityIds is required (comma-separated)' });
  }

  const communityIdArray = communityIds.split(',').map(id => id.trim());

  try {
    const activeUsers = await presenceService.getActiveUsersForCommunities(
      communityIdArray,
      parseInt(minutes),
      currentUserId
    );
    
    res.json({ active: activeUsers });
  } catch (error) {
    console.error('Error getting active users for communities:', error);
    res.status(500).json({ error: 'Failed to get active users for communities' });
  }
});

// GET /v1/presence/url - Get active users on a specific URL with optional community filtering
router.get('/url', authenticateUser, async (req, res) => {
  const { url, communityIds, minutes = 5 } = req.query;
  const { id: currentUserId } = req.user;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    
    // Find or create the page for this URL
    // First try to find the page with the correct ID format (frontend-generated)
    const frontendPageId = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
    let page = await prisma.page.findFirst({
      where: {
        id: frontendPageId
      }
    });
    
    // If not found, try to find any page with this URL
    if (!page) {
      page = await prisma.page.findFirst({
        where: {
          OR: [
            { url: url },
            { canonicalUrl: url }
          ]
        }
      });
    }

    if (!page) {
      // Generate a pageId using the same logic as the frontend
      const pageId = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
      
      // Create the page
      page = await prisma.page.create({
        data: {
          id: pageId,
          url: url,
          canonicalUrl: url,
          title: extractTitleFromUrl(url),
          spaceId: null
        }
      });
    }

    // Get active users for this page
    const activeUsers = await presenceService.getActiveUsers(
      page.id,
      communityIds ? communityIds.split(',')[0] : null, // Use first community for now
      parseInt(minutes),
      currentUserId
    );
    
    res.json({ 
      active: activeUsers, 
      pageId: page.id, 
      url: url
    });
  } catch (error) {
    console.error('Error getting active users for URL:', error);
    res.status(500).json({ 
      error: 'Failed to get active users for URL',
      details: error.message 
    });
  }
});

// Helper function to extract title from URL
function extractTitleFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname;
  } catch (error) {
    return url;
  }
}

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
