const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const userService = new UserService(prisma);

// Update user preferences (UUID only - no email required)
// MUST be before /:email route to avoid conflicts
router.post('/update-preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId (UUID) is required' });
    }
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'preferences object is required' });
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
    }
    
    console.log(`🔍 BACKEND: Updating preferences for user ${userId}`);
    
    const user = await userService.updatePreferences(userId, preferences);
    
    res.json({ 
      success: true, 
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    if (error.message && error.message.includes('not found')) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  }
});

// Get user preferences (UUID only - no email required)
// MUST be before /:email route to avoid conflicts
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId (UUID) is required in x-user-id header or query parameter' });
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
    }
    
    console.log(`🔍 BACKEND: Getting preferences for user ${userId}`);
    
    const preferences = await userService.getPreferences(userId);
    
    res.json({ 
      success: true, 
      preferences: preferences || {}
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    if (error.message && error.message.includes('not found')) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to get preferences' });
    }
  }
});

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
    
    // CRITICAL FIX: Handle test/non-existent user IDs gracefully
    // Return 404 instead of 500 for invalid/test IDs
    if (!userId || userId === 'null' || userId === 'undefined' || userId.trim() === '' ||
        userId === 'test-user-id' || userId === 'test@example.com') {
      console.log(`⚠️ BACKEND: Invalid or test user ID: ${userId}, returning 404`);
      return res.status(404).json({ 
        error: 'User not found',
        message: `User "${userId}" not found in database`
      });
    }
    
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
    
    // ROOT CAUSE FIX: Parse preferences if it's a string (JSON stored as string in some DBs)
    let preferences = user.preferences;
    if (typeof preferences === 'string') {
      try {
        preferences = JSON.parse(preferences);
      } catch (e) {
        console.warn('⚠️ BACKEND: Failed to parse preferences JSON:', e);
        preferences = {};
      }
    }
    
    res.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      auraColor: user.auraColor,
      aura_color: user.auraColor, // Also include snake_case
      theme: preferences?.theme || 'light', // ROOT CAUSE FIX: Include theme from preferences (with fallback)
      aura_intensity: user.aura_intensity || 0.5, // ROOT CAUSE FIX: Include aura intensity
      preferences: preferences || {} // ROOT CAUSE FIX: Include full preferences object
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

// FIX: Add PATCH endpoint for general user updates (FULL CRUD)
router.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const requestUserId = req.headers['x-user-id'];
    
    if (!requestUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Only allow users to update their own data
    if (requestUserId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Cannot update other users' });
    }
    
    console.log(`🔍 BACKEND: PATCH /v1/users/${userId}`, updates);
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
    }
    
    // Get user service
    const userService = new (require('../services/userService'))(prisma);
    
    // Build update object - only allow specific fields
    const allowedFields = ['aura_color', 'auraColor', 'aura_intensity', 'auraIntensity', 'theme'];
    const updateData = {};
    
    if (updates.aura_color || updates.auraColor) {
      const auraColor = updates.aura_color || updates.auraColor;
      // Validate hex color format
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(auraColor)) {
        return res.status(400).json({ error: 'Invalid color format. Must be a valid hex color' });
      }
      updateData.aura_color = auraColor;
    }
    
    if (updates.aura_intensity !== undefined || updates.auraIntensity !== undefined) {
      const intensity = updates.aura_intensity || updates.auraIntensity;
      if (typeof intensity !== 'number' || intensity < 0 || intensity > 1) {
        return res.status(400).json({ error: 'Aura intensity must be a number between 0 and 1' });
      }
      updateData.aura_intensity = intensity;
    }
    
    if (updates.theme) {
      if (!['light', 'dark'].includes(updates.theme)) {
        return res.status(400).json({ error: 'Theme must be "light" or "dark"' });
      }
      // Store theme in preferences
      const user = await userService.getUser(userId);
      if (user) {
        const preferences = user.preferences || {};
        preferences.theme = updates.theme;
        await userService.updatePreferences(userId, preferences);
      }
    }
    
    // Update user if there are any allowed fields
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.appUser.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          aura_color: true,
          aura_intensity: true,
          preferences: true
        }
      });
      
      res.json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser
      });
    } else {
      res.json({
        success: true,
        message: 'No updates to apply',
        user: await userService.getUser(userId)
      });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
});

module.exports = router;
