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

  if (!validUuid) {
    return res.status(401).json({ error: 'Unauthorized: X-User-Id (UUID) is required' });
  }

  try {
    const user = await prisma.appUser.findUnique({ where: { id: rawUserId } });

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found', 
        details: 'X-User-Id header contains valid UUID format but user not found in database. Frontend must send correct AppUser UUID.' 
      });
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

  // ROOT CAUSE FIX: Make communityIds optional - if not provided, return all active users
  let communityIdArray = [];
  if (communityIds) {
    communityIdArray = communityIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
  }

  try {
    const activeUsers = await presenceService.getActiveUsersByCommunities(
      communityIdArray,
      parseFloat(minutes), // Use parseFloat instead of parseInt to preserve decimal values
      currentUserId
    );
    
    res.json({ active: activeUsers });
  } catch (error) {
    console.error('❌ Error getting active users for communities:', error);
    console.error('   Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to get active users for communities',
      details: error.message 
    });
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

// GET /v1/presence/availability - Get user's current availability status (HYBRID: Global + Per-Tab Override)
// pageId is optional: if provided, returns status for that tab (override or global), else returns global status
router.get('/availability', authenticateUser, async (req, res) => {
  const { pageId } = req.query;
  const { id: userId } = req.user;

  console.log(`🎯 AVAILABILITY_API: GET request - userId: ${userId}, pageId: ${pageId || 'GLOBAL'}`);

  try {
    // Get user's global status
    const user = await prisma.appUser.findUnique({
      where: { id: userId },
      select: {
        globalAvailability: true,
        availabilityUpdatedAt: true
      }
    });

    const globalStatus = user?.globalAvailability || 'AVAILABLE'; // Default to AVAILABLE
    const globalUpdatedAt = user?.availabilityUpdatedAt;

    // If no pageId, return global status
    if (!pageId) {
      res.json({
        success: true,
        availability: globalStatus,
        scope: 'global',
        isActive: true,
        lastUpdated: globalUpdatedAt,
        message: 'Global status (applies to all tabs)'
      });
      return;
    }

    // If pageId provided, check for per-tab override first
    const tabOverride = await prisma.presenceEvent.findFirst({
      where: {
        user_id: userId,
        page_id: pageId,
        kind: 'AVAILABILITY'
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        availability: true,
        created_at: true
      }
    });

    // Also check user_presence for current active status
    const userPresence = await prisma.user_presence.findFirst({
      where: {
        user_id: userId,
        page_id: pageId,
        is_active: true
      },
      select: {
        is_active: true,
        updated_at: true
      }
    });

    // Determine current status: override takes precedence, else use global
    let currentStatus = globalStatus;
    let scope = 'global';
    let lastUpdated = globalUpdatedAt;

    if (tabOverride && tabOverride.availability) {
      // Per-tab override exists
      currentStatus = tabOverride.availability;
      scope = 'override';
      lastUpdated = tabOverride.created_at;
    }

    // If user is not active on this tab, status is OFFLINE
    if (!userPresence || !userPresence.is_active) {
      currentStatus = 'OFFLINE';
      scope = 'offline';
    }

    res.json({
      success: true,
      availability: currentStatus,
      scope: scope, // 'global', 'override', or 'offline'
      isActive: userPresence?.is_active || false,
      lastUpdated: lastUpdated,
      globalStatus: globalStatus, // Include global for reference
      hasOverride: !!tabOverride
    });
  } catch (error) {
    console.error('❌ AVAILABILITY_API: Error getting availability:', error);
    res.status(500).json({
      error: 'Failed to get availability',
      message: error.message
    });
  }
});

// POST /v1/presence/availability - Update user availability status (HYBRID: Global or Per-Tab Override)
// pageId is optional: if provided, creates per-tab override, else updates global status
router.post('/availability', authenticateUser, async (req, res) => {
  const { pageId, availability, isGlobal } = req.body;
  const { id: userId } = req.user;

  console.log(`🎯 AVAILABILITY_API: POST request - userId: ${userId}, pageId: ${pageId || 'GLOBAL'}, availability: ${availability}, isGlobal: ${isGlobal}`);

  if (!availability) {
    return res.status(400).json({ error: 'availability is required' });
  }

  // Validate availability value (4-state system)
  if (!['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(availability)) {
    return res.status(400).json({
      error: 'Invalid availability. Must be AVAILABLE, BUSY, AWAY, or OFFLINE'
    });
  }

  try {
    // Determine if this is a global update or per-tab override
    const updateGlobal = !pageId || isGlobal === true;

    if (updateGlobal) {
      // Update global status
      const updatedUser = await prisma.appUser.update({
        where: { id: userId },
        data: {
          globalAvailability: availability,
          availabilityUpdatedAt: new Date()
        },
        select: {
          globalAvailability: true,
          availabilityUpdatedAt: true
        }
      });

      console.log(`✅ AVAILABILITY_API: Global status updated:`, updatedUser);

      // Broadcast to all tabs via real-time (will be handled by real-time subscription)
      res.json({
        success: true,
        availability: updatedUser.globalAvailability,
        scope: 'global',
        updatedAt: updatedUser.availabilityUpdatedAt,
        message: `Global availability updated to ${availability} (applies to all tabs)`
      });
    } else {
      // Create per-tab override
      const presenceEvent = await presenceService.recordPresenceEvent(
        userId,
        pageId,
        'AVAILABILITY',
        availability,
        null, // customLabel
        null  // pageUrl
      );

      console.log(`✅ AVAILABILITY_API: Per-tab override created:`, presenceEvent);

      // Update user_presence table to reflect availability change
      const userPresence = await prisma.user_presence.updateMany({
        where: {
          user_id: userId,
          page_id: pageId,
          is_active: true
        },
        data: {
          updated_at: new Date()
        }
      });

      console.log(`✅ AVAILABILITY_API: User presence updated:`, userPresence);

      res.json({
        success: true,
        presenceEvent,
        scope: 'override',
        availability,
        message: `Per-tab availability override updated to ${availability}`
      });
    }
  } catch (error) {
    console.error('❌ AVAILABILITY_API: Error updating availability:', error);
    const code = error.code || error.name;
    const message = error.message;
    res.status(500).json({
      error: 'Failed to update availability',
      code,
      message
    });
  }
});

// DELETE /v1/presence/availability - Clear/delete user availability status (FULL CRUD - DELETE)
router.delete('/availability', authenticateUser, async (req, res) => {
  const { pageId } = req.query;
  const { id: userId } = req.user;

  console.log(`🎯 AVAILABILITY_API: DELETE request - userId: ${userId}, pageId: ${pageId}`);

  if (!pageId) {
    return res.status(400).json({ error: 'pageId is required' });
  }

  try {
    // Record EXIT event to clear availability
    const exitEvent = await presenceService.recordPresenceEvent(
      userId,
      pageId,
      'EXIT',
      null, // availability
      null, // customLabel
      null  // pageUrl
    );

    // Update user_presence to mark as inactive
    const userPresence = await prisma.user_presence.updateMany({
      where: {
        user_id: userId,
        page_id: pageId
      },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    });

    console.log(`✅ AVAILABILITY_API: Status cleared (user marked offline):`, userPresence);

    res.json({
      success: true,
      exitEvent,
      message: 'Availability status cleared (user marked offline)'
    });
  } catch (error) {
    console.error('❌ AVAILABILITY_API: Error clearing availability:', error);
    res.status(500).json({
      error: 'Failed to clear availability',
      message: error.message
    });
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
