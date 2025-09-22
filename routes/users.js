const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const { PrismaClient } = require('@prisma/client');

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

module.exports = router;
