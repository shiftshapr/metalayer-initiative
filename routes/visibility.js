const express = require('express');
const router = express.Router();
const VisibilityService = require('../services/visibilityService');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const visibilityService = new VisibilityService(prisma);

// Middleware to ensure user is authenticated
const authenticateUser = (req, res, next) => {
  const userEmail = req.headers['x-user-email'];
  const userName = req.headers['x-user-name'];
  const userAvatarUrl = req.headers['x-user-avatar'];
  
  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized: x-user-email header required' });
  }
  
  // Generate UUID from email (same logic as main auth middleware)
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(userEmail).digest('hex');
  const userId = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
  
  req.user = { email: userEmail, id: userId, name: userName, avatarUrl: userAvatarUrl };
  next();
};

// POST /v1/visibility/set - Set user visibility for a URL
router.post('/set', authenticateUser, async (req, res) => {
  const { url, isVisible } = req.body;
  const { id: userId } = req.user;

  if (!url || typeof isVisible !== 'boolean') {
    return res.status(400).json({ error: 'url and isVisible (boolean) are required' });
  }

  try {
    const visibility = await visibilityService.setUserVisibility(userId, url, isVisible);
    res.json({ success: true, visibility });
  } catch (error) {
    console.error('Error setting visibility:', error);
    res.status(500).json({ error: 'Failed to set visibility' });
  }
});

// GET /v1/visibility/status - Get user's visibility status for a URL
router.get('/status', authenticateUser, async (req, res) => {
  const { url } = req.query;
  const { id: userId } = req.user;

  if (!url) {
    return res.status(400).json({ error: 'url query parameter is required' });
  }

  try {
    const visibility = await visibilityService.getUserVisibility(userId, url);
    const isVisible = visibility ? visibility.isVisible : false;
    res.json({ isVisible });
  } catch (error) {
    console.error('Error getting visibility status:', error);
    res.status(500).json({ error: 'Failed to get visibility status' });
  }
});

// GET /v1/visibility/urls - Get all URLs where user is visible
router.get('/urls', authenticateUser, async (req, res) => {
  const { id: userId } = req.user;

  try {
    const visibleUrls = await visibilityService.getVisibleUrls(userId);
    res.json({ visibleUrls });
  } catch (error) {
    console.error('Error getting visible URLs:', error);
    res.status(500).json({ error: 'Failed to get visible URLs' });
  }
});

// GET /v1/visibility/users - Get all users visible on a specific URL
router.get('/users', authenticateUser, async (req, res) => {
  const { url, search, limit, offset = 0 } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url query parameter is required' });
  }

  try {
    const parsedLimit = limit ? parseInt(limit) : null;
    const parsedOffset = parseInt(offset);
    
    console.log(`🔍 VISIBILITY API: Getting visible users for URL: ${url}, search: "${search}", limit: ${parsedLimit}, offset: ${parsedOffset}`);
    
    const visibleUsers = await visibilityService.getVisibleUsersOnUrl(
      url, 
      search, 
      parsedLimit, 
      parsedOffset
    );
    
    console.log(`🔍 VISIBILITY API: Found ${visibleUsers.length} visible users`);
    res.json({ visibleUsers });
  } catch (error) {
    console.error('Error getting visible users:', error);
    res.status(500).json({ error: 'Failed to get visible users' });
  }
});

// PUT /v1/visibility/default - Update user's default visibility preference
router.put('/default', authenticateUser, async (req, res) => {
  const { defaultVisibility } = req.body;
  const { id: userId } = req.user;

  if (typeof defaultVisibility !== 'boolean') {
    return res.status(400).json({ error: 'defaultVisibility (boolean) is required' });
  }

  try {
    const user = await visibilityService.updateDefaultVisibility(userId, defaultVisibility);
    res.json({ success: true, defaultVisibility: user.defaultVisibility });
  } catch (error) {
    console.error('Error updating default visibility:', error);
    res.status(500).json({ error: 'Failed to update default visibility' });
  }
});

// GET /v1/visibility/default - Get user's default visibility preference
router.get('/default', authenticateUser, async (req, res) => {
  const { id: userId } = req.user;

  try {
    console.log(`🔍 VISIBILITY API: Getting default visibility for user: ${userId}`);
    const defaultVisibility = await visibilityService.getDefaultVisibility(userId);
    console.log(`🔍 VISIBILITY API: Default visibility response: ${defaultVisibility}`);
    res.json({ defaultVisibility });
  } catch (error) {
    console.error('Error getting default visibility:', error);
    res.status(500).json({ error: 'Failed to get default visibility' });
  }
});

module.exports = router;
