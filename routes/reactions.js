const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Middleware to ensure user is authenticated (same as presence.js)
const authenticateUser = async (req, res, next) => {
  const rawUserId = req.headers['x-user-id'] || null;
  const rawEmail = req.headers['x-user-email'] || null;
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
    return res.status(500).json({ error: 'Internal server error', code: error.code, message: error.message });
  }
};

// Get reactions for a message
router.get('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    console.log(`🔍 REACTIONS: Getting reactions for message: ${messageId}`);
    
    // CRITICAL FIX: Validate messageId is a valid UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(messageId)) {
      console.log(`⚠️ REACTIONS: Invalid messageId format (not UUID): ${messageId}`);
      // Return empty result for non-UUID message IDs (e.g., test IDs)
      return res.json({
        success: true,
        reactions: [],
        message: 'Invalid message ID format (not a UUID)'
      });
    }
    
    const reactions = await prisma.reactions.findMany({
      where: {
        message_id: messageId
      },
      include: {
        AppUser: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        }
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
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    
    if (!messageId || !emoji) {
      return res.status(400).json({ 
        error: 'Missing required fields: messageId, emoji' 
      });
    }
    
    // Use authenticated user ID from headers (secure)
    const userId = req.user.id;
    
    console.log(`🔍 REACTIONS: Adding reaction ${emoji} to message ${messageId} by ${userId}`);
    
    // Check if user already has ANY reaction on this message
    const existingReaction = await prisma.reactions.findFirst({
      where: {
        message_id: messageId,
        user_id: userId
      },
      include: {
        AppUser: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
    
    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // Same emoji clicked - remove the reaction (toggle off)
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
        // Different emoji clicked - replace existing reaction
        const updatedReaction = await prisma.reactions.update({
          where: { id: existingReaction.id },
          data: { emoji: emoji },
          include: {
            AppUser: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        });
        
        console.log(`✅ REACTIONS: Replaced reaction ${existingReaction.emoji} with ${emoji} on message ${messageId}`);
        
        return res.json({
          success: true,
          action: 'replaced',
          reaction: updatedReaction,
          message: 'Reaction replaced successfully'
        });
      }
    } else {
      // No existing reaction - add the reaction
      const reaction = await prisma.reactions.create({
        data: {
          message_id: messageId,
          emoji: emoji,
          user_id: userId
        },
        include: {
          AppUser: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true
            }
          }
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

// ROOT CAUSE FIX: GET reaction by ID (for DELETE event messageId extraction)
router.get('/by-id/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const reaction = await prisma.reactions.findUnique({
      where: { id: id },
      include: {
        AppUser: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
    
    if (!reaction) {
      return res.status(404).json({ error: 'Reaction not found' });
    }
    
    return res.json({
      id: reaction.id,
      message_id: reaction.message_id,
      emoji: reaction.emoji,
      user_id: reaction.user_id,
      created_at: reaction.created_at,
      AppUser: reaction.AppUser
    });
  } catch (error) {
    console.error('❌ REACTIONS: Error fetching reaction by ID:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
