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
  // Node lowercases header keys; read canonical names and fallbacks
  const rawUserId = req.headers['x-user-id'] || null; // canonical
  const rawEmail = req.headers['x-user-email'] || null; // canonical (may be comma-separated)
  let rawUserEmail = null;
  if (rawEmail) {
    const first = rawEmail.includes(',') ? rawEmail.split(',')[0] : rawEmail;
    const normalized = first.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(normalized)) {
      rawUserEmail = normalized;
    }
  }
  const userName = req.headers['x-user-name'] || null;
  const userAvatarUrl = req.headers['x-user-avatar'] || null;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validUuid = typeof rawUserId === 'string' && uuidRegex.test(rawUserId);

  // Debug logging for incoming auth headers
  try {
    console.log('🔐 AUTH_MW: Headers received:', {
      'x-user-id': rawUserId,
      'x-user-email': rawUserEmail,
      'x-user-name': userName,
      'x-user-avatar': userAvatarUrl
    });
  } catch (_) {}

  if (!validUuid && !rawUserEmail) {
    return res.status(401).json({ error: 'Unauthorized: X-User-Id (UUID) or X-User-Email required' });
  }

  try {
    let user = null;

    if (validUuid) {
      console.log('🔐 AUTH_MW: Looking up user by UUID');
      user = await prisma.appUser.findUnique({ where: { id: rawUserId } });
    }

    // Fallback to email lookup if UUID not provided/invalid or not found
    if (!user && rawUserEmail) {
      console.log('🔐 AUTH_MW: Looking up user by email');
      user = await prisma.appUser.findUnique({ where: { email: rawUserEmail } });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found in database' });
    }

    req.user = { id: user.id, email: user.email, name: userName, avatarUrl: userAvatarUrl };
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    const code = error.code || error.name;
    const message = error.message || 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', code, message });
  }
};

// POST /v1/presence/event - Record a presence event
router.post('/event', authenticateUser, async (req, res) => {
  const { pageId, kind, availability, customLabel, pageUrl } = req.body;
  const { id: userId } = req.user;

  if (!pageId || !kind) {
    return res.status(400).json({ error: 'pageId and kind are required' });
  }

  if (!['ENTER', 'EXIT', 'AVAILABILITY'].includes(kind)) {
    return res.status(400).json({ error: 'Invalid kind. Must be ENTER, EXIT, or AVAILABILITY' });
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
    const code = error.code || error.name;
    const message = error.message;
    res.status(500).json({ error: 'Failed to record presence event', code, message });
  }
});

// GET /v1/presence/active - Get active users on a page
router.get('/active', authenticateUser, async (req, res) => {
  const { pageId, communityId, minutes = 0.5 } = req.query; // CRITICAL FIX: Reduced from 5 minutes to 30 seconds for faster visibility updates
  const { id: currentUserId } = req.user;

  if (!pageId) {
    return res.status(400).json({ error: 'pageId is required' });
  }

  try {
    const activeUsers = await presenceService.getActiveUsers(
      pageId,
      communityId,
      parseFloat(minutes), // Use parseFloat instead of parseInt to preserve decimal values
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
  const { communityIds, minutes = 0.5 } = req.query; // CRITICAL FIX: Reduced from 5 minutes to 30 seconds for faster visibility updates
  const { id: currentUserId } = req.user;

  if (!communityIds) {
    return res.status(400).json({ error: 'communityIds is required (comma-separated)' });
  }

  const communityIdArray = communityIds.split(',').map(id => id.trim());

  try {
    const activeUsers = await presenceService.getActiveUsersByCommunities(
      communityIdArray,
      parseFloat(minutes), // Use parseFloat instead of parseInt to preserve decimal values
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
  const { url, communityIds, minutes = 0.5 } = req.query; // CRITICAL FIX: Reduced from 5 minutes to 30 seconds for faster visibility updates
  const { id: currentUserId } = req.user;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    // Normalize URL exactly like frontend using UrlNormalizationService
    const UrlNormalizationService = require('../services/urlNormalizationService');
    const urlNormalizationService = new UrlNormalizationService();
    const { normalizedUrl, pageId } = await urlNormalizationService.normalizeUrl(url);

    const activeUsers = await presenceService.getActiveUsers(
      pageId,
      communityIds ? communityIds.split(',')[0] : null,
      parseFloat(minutes),
      currentUserId
    );

    res.json({
      active: activeUsers,
      pageId,
      url: normalizedUrl
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
