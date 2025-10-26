const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Get reactions for a message
router.get('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    console.log(`🔍 REACTIONS: Getting reactions for message: ${messageId}`);
    
    const reactions = await prisma.reactions.findMany({
      where: {
        message_id: messageId
      }
    });
    
    console.log(`✅ REACTIONS: Found ${reactions.length} reactions for message ${messageId}`);
    
    res.json({
      success: true,
      reactions: reactions,
      message: 'Reactions retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting reactions:', error);
    res.status(500).json({ 
      error: 'Failed to get reactions',
      details: error.message 
    });
  }
});

// Add a reaction to a message
router.post('/', async (req, res) => {
  try {
    const { messageId, emoji, userEmail } = req.body;
    
    if (!messageId || !emoji || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: messageId, emoji, userEmail' 
      });
    }
    
    console.log(`🔍 REACTIONS: Adding reaction ${emoji} to message ${messageId} by ${userEmail}`);
    
    // Find the user
    const user = await prisma.appUser.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user already reacted with this emoji
    const existingReaction = await prisma.reactions.findFirst({
      where: {
        message_id: messageId,
        user_email: userEmail,
        emoji: emoji
      }
    });
    
    if (existingReaction) {
      // Remove the reaction (toggle off)
      await prisma.reactions.delete({
        where: { id: existingReaction.id }
      });
      
      console.log(`✅ REACTIONS: Removed reaction ${emoji} from message ${messageId}`);
      
      return res.json({
        success: true,
        action: 'removed',
        message: 'Reaction removed successfully'
      });
    } else {
      // Add the reaction
      const reaction = await prisma.reactions.create({
        data: {
          message_id: messageId,
          emoji: emoji,
          user_email: userEmail
        }
      });
      
      console.log(`✅ REACTIONS: Added reaction ${emoji} to message ${messageId}`);
      
      return res.json({
        success: true,
        action: 'added',
        reaction: reaction,
        message: 'Reaction added successfully'
      });
    }
    
  } catch (error) {
    console.error('❌ Error adding reaction:', error);
    res.status(500).json({ 
      error: 'Failed to add reaction',
      details: error.message 
    });
  }
});

// Remove a reaction
router.delete('/:reactionId', async (req, res) => {
  try {
    const { reactionId } = req.params;
    
    console.log(`🔍 REACTIONS: Removing reaction ${reactionId}`);
    
    await prisma.reactions.delete({
      where: { id: reactionId }
    });
    
    console.log(`✅ REACTIONS: Removed reaction ${reactionId}`);
    
    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error removing reaction:', error);
    res.status(500).json({ 
      error: 'Failed to remove reaction',
      details: error.message 
    });
  }
});

module.exports = router;
