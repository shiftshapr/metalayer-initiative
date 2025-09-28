const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const userService = new UserService(prisma);

// Update user's aura color
router.put('/:userId/aura-color', async (req, res) => {
  try {
    const { userId } = req.params;
    const { auraColor } = req.body;
    
    if (!auraColor) {
      return res.status(400).json({ error: 'Aura color is required' });
    }
    
    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(auraColor)) {
      return res.status(400).json({ error: 'Invalid color format. Must be a valid hex color (e.g., #FF6B6B)' });
    }
    
    const user = await userService.updateAuraColor(userId, auraColor);
    
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
    const { userId } = req.params;
    const { headline } = req.body;
    
    if (typeof headline !== 'string') {
      return res.status(400).json({ error: 'Headline must be a string' });
    }
    
    const user = await userService.updateHeadline(userId, headline);
    
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
    
    if (typeof days !== 'number' || days < 0 || days > 365) {
      return res.status(400).json({ error: 'Days must be a number between 0 and 365' });
    }
    
    const user = await userService.updateDisplayVisibilityAfterExit(userId, days);
    
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
