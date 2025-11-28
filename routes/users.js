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

// Get user preferences (UUID only)
// MUST be before /:email route to avoid conflicts
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId (UUID) is required in x-user-id header or query parameter' });
    }
    
    // Validate UUID format - only accept UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
    }
    
    const targetUser = await userService.getUser(userId);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`🔍 BACKEND: Getting preferences for user ${targetUser.id} (${targetUser.email})`);
    
    const preferences = await userService.getPreferences(targetUser.id);
    
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
    
    // ROOT CAUSE FIX: Use getOrCreateUser instead of updateAvatarUrl to handle first-time users
    // This ensures user exists before updating avatar
    let user = await userService.getOrCreateUser({ 
      email: email,
      avatarUrl: avatarUrl
    });
    
    // If user already exists but avatarUrl is different, update it
    if (user.avatarUrl !== avatarUrl) {
      user = await userService.updateAvatarUrl(email, avatarUrl);
    }
    
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
    console.error('❌ BACKEND: Error updating avatar URL:', error);
    console.error('❌ BACKEND: Error stack:', error.stack);
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
    
    // Only accept UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
    }
    
    const targetUserId = userId;
    
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
    
    // Only accept UUID format - no email or Google ID lookups
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.log(`❌ BACKEND: Invalid userId format: ${userId}. Must be a valid UUID`);
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
    }
    
    const user = await userService.getUser(userId);
    
    if (!user) {
      console.error(`❌ BACKEND: User not found for userId: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`✅ BACKEND: Found user: ${user.id}, avatarUrl: ${user.avatarUrl}`);
    
    // ROOT CAUSE FIX: preferences column was dropped - reconstruct from individual columns
    const preferences = {
      theme: user.theme || 'light',
      headline: user.headline || null,
      displayName: user.displayName || null,
      auraIntensity: user.auraIntensity || 0.5
    };
    
    res.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      auraColor: user.auraColor,
      aura_color: user.auraColor, // Also include snake_case
      theme: preferences.theme, // From individual column
      aura_intensity: user.auraIntensity || 0.5, // From individual column
      tab_configuration: user.tabConfiguration || null, // Tab manager configuration
      preferences: preferences // Reconstructed from individual columns
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
    
    // Only accept UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetUserId)) {
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
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
    
    // Only accept UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetUserId)) {
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
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
    const requestEmail = req.headers['x-user-email'];
    
    if (!requestUserId && !requestEmail) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log(`🔍 BACKEND: PATCH /v1/users/${userId}`, updates);
    
    // ROOT CAUSE FIX: Initialize userService at the start (was being used before initialization)
    const UserService = require('../services/userService');
    const userService = new UserService(prisma);
    
    // Only accept UUID format - no email or Google ID lookups
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.log(`❌ BACKEND: Invalid userId format: ${userId}. Must be a valid UUID`);
      return res.status(400).json({ error: 'Invalid userId format. Must be a valid UUID' });
    }
    
    if (!requestUserId) {
      return res.status(401).json({ error: 'Authentication required: x-user-id header is required' });
    }
    
    // Validate requestUserId is also a UUID
    if (!uuidRegex.test(requestUserId)) {
      return res.status(400).json({ error: 'Invalid x-user-id format. Must be a valid UUID' });
    }
    
    const targetUser = await userService.getUser(userId);
    
    if (!targetUser) {
      console.error(`❌ BACKEND: User not found for userId: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only allow users to update their own data - UUID comparison only
    if (requestUserId !== targetUser.id) {
      return res.status(403).json({ error: 'Forbidden: Cannot update other users' });
    }
    
    // Use targetUser.id (UUID) for all updates
    const actualUserId = targetUser.id;
    
    // Build update object - only allow specific fields
    // ROOT CAUSE FIX: Prisma schema uses camelCase, so use camelCase for all fields
    const allowedFields = ['auraColor', 'auraIntensity', 'theme', 'tabConfiguration'];
    const updateData = {};
    
    // Handle both snake_case and camelCase for backward compatibility
    if (updates.aura_color || updates.auraColor) {
      const auraColor = updates.aura_color || updates.auraColor;
      // Validate hex color format
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(auraColor)) {
        return res.status(400).json({ error: 'Invalid color format. Must be a valid hex color' });
      }
      updateData.auraColor = auraColor; // Use camelCase for Prisma
    }
    
    if (updates.aura_intensity !== undefined || updates.auraIntensity !== undefined) {
      const intensity = updates.aura_intensity || updates.auraIntensity;
      if (typeof intensity !== 'number' || intensity < 0 || intensity > 1) {
        return res.status(400).json({ error: 'Aura intensity must be a number between 0 and 1' });
      }
      updateData.auraIntensity = intensity; // Use camelCase for Prisma
    }
    
    if (updates.theme) {
      if (!['light', 'dark', 'auto'].includes(updates.theme)) {
        return res.status(400).json({ error: 'Theme must be "light", "dark", or "auto"' });
      }
      // ROOT CAUSE FIX: Store theme in individual column (preferences column was dropped)
      updateData.theme = updates.theme; // Use camelCase for Prisma
    }
    
    // Handle tab_configuration (tab manager configuration)
    if (updates.tab_configuration !== undefined || updates.tabConfiguration !== undefined) {
      let tabConfig = updates.tab_configuration || updates.tabConfiguration;
      
      // ROOT CAUSE FIX: If tabConfig is a string (JSON stringified), parse it
      if (typeof tabConfig === 'string') {
        try {
          tabConfig = JSON.parse(tabConfig);
        } catch (parseError) {
          console.error('❌ BACKEND: Failed to parse tab_configuration JSON:', parseError);
          return res.status(400).json({ error: 'tab_configuration must be valid JSON' });
        }
      }
      
      // Validate that it's an object (JSON will be stored as JSONB)
      // Allow objects (including those with nested arrays) but reject arrays directly
      if (tabConfig !== null && (typeof tabConfig !== 'object' || Array.isArray(tabConfig))) {
        return res.status(400).json({ error: 'tab_configuration must be an object or null' });
      }
      // ROOT CAUSE FIX: Prisma schema uses camelCase 'tabConfiguration', not snake_case 'tab_configuration'
      updateData.tabConfiguration = tabConfig;
    }
    
    // Update user if there are any allowed fields
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await prisma.appUser.update({
        where: { id: actualUserId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          auraColor: true,
          auraIntensity: true,
          theme: true,
          headline: true,
          displayName: true,
          tabConfiguration: true
          // NOTE: preferences column was dropped
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
        user: await userService.getUser(actualUserId)
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
