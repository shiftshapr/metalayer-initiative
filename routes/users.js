const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const userService = new UserService(prisma);

// Update user's avatar URL (MUST be before /:email route to avoid conflicts)
router.post('/update-avatar', async (req, res) => {
  try {
    const { email, avatarUrl } = req.body;
    
    if (!email || !avatarUrl) {
      return res.status(400).json({ error: 'Email and avatar URL are required' });
    }
    
    console.log(`🔍 BACKEND: Updating avatar URL for ${email} to ${avatarUrl}`);
    
    const user = await userService.updateAvatarUrl(email, avatarUrl);
    
    res.json({ 
      success: true, 
      message: 'Avatar URL updated successfully',
      user: {
        id: user.id,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Error updating avatar URL:', error);
    res.status(500).json({ error: 'Failed to update avatar URL' });
  }
});

// Create or update user (fallback for avatar updates)
router.post('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    // Normalize and validate email param
    const raw = (email || '').toString();
    const first = raw.includes(',') ? raw.split(',')[0] : raw;
    const normalized = first.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalized || normalized === 'null' || normalized === 'undefined' || !emailRegex.test(normalized)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    const { name, avatarUrl, auraColor } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log(`🔍 BACKEND: Creating/updating user ${email} with avatarUrl: ${avatarUrl}`);
    
    const user = await userService.getOrCreateUser({ 
      email: decodeURIComponent(normalized),
      name: name || email.split('@')[0],
      avatarUrl: avatarUrl,
      auraColor: auraColor
    });
    
    res.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      auraColor: user.auraColor
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

// Update user's aura color
router.put('/:userId/aura-color', async (req, res) => {
  try {
    const { userId } = req.params;
    const { auraColor } = req.body;
    const requestUserId = req.headers['x-user-id'];
    
    if (!auraColor) {
      return res.status(400).json({ error: 'Aura color is required' });
    }
    
    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(auraColor)) {
      return res.status(400).json({ error: 'Invalid color format. Must be a valid hex color (e.g., #FF6B6B)' });
    }
    
    // If userId is an email, find the user by email first
    let targetUserId = userId;
    if (userId.includes('@')) {
      const user = await userService.getOrCreateUser({ email: userId });
      targetUserId = user.id;
    } else if (/^\d+$/.test(userId)) {
      const user = await userService.getOrCreateUser({ id: userId });
      targetUserId = user.id;
    }
    
    const user = await userService.updateAuraColor(targetUserId, auraColor);
    
    res.json({ 
      success: true, 
      message: 'Aura color updated successfully',
      user: {
        id: user.id,
        auraColor: user.auraColor
      }
    });
  } catch (error) {
    console.error('Error updating aura color:', error);
    res.status(500).json({ error: 'Failed to update aura color' });
  }
});

// Get current user's database ID by UUID
router.get('/me', async (req, res) => {
  try {
    const requestUserId = req.headers['x-user-id'];
    const rawEmail = req.headers['x-user-email'];
    let requestUserEmail = null;
    if (rawEmail) {
      const first = rawEmail.includes(',') ? rawEmail.split(',')[0] : rawEmail;
      const normalized = first.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(normalized)) {
        requestUserEmail = normalized;
      }
    }
    if (!requestUserId && !requestUserEmail) {
      return res.status(400).json({ error: 'x-user-id or x-user-email required' });
    }
    let user = null;
    if (requestUserId) {
      user = await userService.getUser(requestUserId);
    }
    if (!user && requestUserEmail) {
      user = await userService.getOrCreateUser({ email: decodeURIComponent(requestUserEmail) });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      auraColor: user.auraColor
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// COMP METHOD: Get user by UUID (used by frontend for avatar fetching)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🔍 BACKEND: GET /v1/users/${userId}`);
    
    // COMP METHOD: Validate UUID parameter
    if (!userId || userId === 'null' || userId === 'undefined' || userId.trim() === '') {
      console.log(`❌ BACKEND: Invalid userId parameter: ${userId}`);
      return res.status(400).json({ error: 'Valid userId is required' });
    }
    
    // COMP METHOD: Try to find user by UUID first
    let user = await userService.getUser(userId);
    
    // If not found by UUID and it looks like an email, try by email (backward compatibility)
    if (!user && userId.includes('@')) {
      console.log(`🔍 BACKEND: Trying email lookup for: ${userId}`);
      user = await userService.getOrCreateUser({ email: decodeURIComponent(userId) });
    }
    
    if (!user) {
      console.error(`❌ BACKEND: User not found for userId: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`✅ BACKEND: Found user: ${user.id}, avatarUrl: ${user.avatarUrl}`);
    
    res.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      auraColor: user.auraColor
    });
  } catch (error) {
    console.error('Error getting user by userId:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user's aura color
router.get('/:userId/aura-color', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      auraColor: user.auraColor
    });
  } catch (error) {
    console.error('Error getting aura color:', error);
    res.status(500).json({ error: 'Failed to get aura color' });
  }
});

// Update user's headline
router.put('/:userId/headline', async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const { headline } = req.body;
    const requestUserId = req.headers['x-user-id'];
    
    if (typeof headline !== 'string') {
      return res.status(400).json({ error: 'Headline must be a string' });
    }
    
    // If targetUserId is a Google ID, find the user by email first
    if (/^\d+$/.test(targetUserId)) {
      const user = await userService.getOrCreateUser({ id: targetUserId });
      targetUserId = user.id;
    }
    
    const user = await userService.updateHeadline(targetUserId, headline);
    
    res.json({ 
      success: true, 
      message: 'Headline updated successfully',
      user: {
        id: user.id,
        headline: user.headline
      }
    });
  } catch (error) {
    console.error('Error updating headline:', error);
    res.status(500).json({ error: 'Failed to update headline' });
  }
});

// Update user's display visibility after exit
router.put('/:userId/display-visibility-after-exit', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.body;
    const requestUserId = req.headers['x-user-id'];
    
    if (typeof days !== 'number' || days < 0 || days > 365) {
      return res.status(400).json({ error: 'Days must be a number between 0 and 365' });
    }
    
    // If targetUserId is a Google ID, find the user by email first
    if (/^\d+$/.test(targetUserId)) {
      const user = await userService.getOrCreateUser({ id: targetUserId });
      targetUserId = user.id;
    }
    
    const user = await userService.updateDisplayVisibilityAfterExit(targetUserId, days);
    
    res.json({ 
      success: true, 
      message: 'Display visibility after exit updated successfully',
      user: {
        id: user.id,
        displayVisibilityAfterExit: user.displayVisibilityAfterExit
      }
    });
  } catch (error) {
    console.error('Error updating display visibility after exit:', error);
    res.status(500).json({ error: 'Failed to update display visibility after exit' });
  }
});

// Get user's headline
router.get('/:userId/headline', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        headline: user.headline
      }
    });
  } catch (error) {
    console.error('Error getting headline:', error);
    res.status(500).json({ error: 'Failed to get headline' });
  }
});

// Get user's display visibility after exit
router.get('/:userId/display-visibility-after-exit', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userService.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        displayVisibilityAfterExit: user.displayVisibilityAfterExit
      }
    });
  } catch (error) {
    console.error('Error getting display visibility after exit:', error);
    res.status(500).json({ error: 'Failed to get display visibility after exit' });
  }
});

module.exports = router;
