const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Middleware to ensure user is authenticated (same as reactions.js)
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

// Get bookmarks for a message (count and user's bookmark status)
router.get('/:messageId', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    console.log(`🔍 BOOKMARKS: Getting bookmarks for message: ${messageId}`);
    
    // CRITICAL FIX: Validate messageId is a valid UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(messageId)) {
      console.log(`⚠️ BOOKMARKS: Invalid messageId format (not UUID): ${messageId}`);
      // Return empty result for non-UUID message IDs (e.g., test IDs)
      return res.json({
        success: true,
        count: 0,
        isBookmarked: false,
        bookmarkId: null,
        message: 'Invalid message ID format (not a UUID)'
      });
    }
    
    // Get total count of bookmarks (excluding soft-deleted)
    const bookmarkCount = await prisma.bookmarks.count({
      where: {
        message_id: messageId,
        deleted_at: null
      }
    });
    
    // Check if current user has bookmarked this message
    const userBookmark = await prisma.bookmarks.findFirst({
      where: {
        message_id: messageId,
        user_id: userId,
        deleted_at: null
      }
    });
    
    console.log(`✅ BOOKMARKS: Message ${messageId} has ${bookmarkCount} bookmarks, user bookmarked: ${!!userBookmark}`);
    
    res.json({
      success: true,
      count: bookmarkCount,
      isBookmarked: !!userBookmark,
      bookmarkId: userBookmark?.id || null,
      message: 'Bookmarks retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting bookmarks:', error);
    res.status(500).json({ 
      error: 'Failed to get bookmarks',
      details: error.message 
    });
  }
});

// Toggle bookmark (add or remove)
router.post('/toggle', authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ 
        error: 'Missing required field: messageId' 
      });
    }
    
    const userId = req.user.id;
    
    console.log(`🔍 BOOKMARKS: Toggling bookmark for message ${messageId} by user ${userId}`);
    
    // Check if user already has a bookmark (non-deleted)
    const existingBookmark = await prisma.bookmarks.findFirst({
      where: {
        message_id: messageId,
        user_id: userId,
        deleted_at: null
      }
    });
    
    if (existingBookmark) {
      // User has bookmarked - remove it (soft delete)
      await prisma.bookmarks.update({
        where: { id: existingBookmark.id },
        data: { 
          deleted_at: new Date(),
          updated_at: new Date()
        }
      });
      
      console.log(`✅ BOOKMARKS: Removed bookmark from message ${messageId}`);
      
      // Get updated count
      const bookmarkCount = await prisma.bookmarks.count({
        where: {
          message_id: messageId,
          deleted_at: null
        }
      });
      
      return res.json({
        success: true,
        action: 'removed',
        count: bookmarkCount,
        isBookmarked: false,
        message: 'Bookmark removed successfully'
      });
    } else {
      // Check if there's a soft-deleted bookmark to restore
      const deletedBookmark = await prisma.bookmarks.findFirst({
        where: {
          message_id: messageId,
          user_id: userId,
          deleted_at: { not: null }
        }
      });
      
      let bookmark;
      if (deletedBookmark) {
        // Restore soft-deleted bookmark
        bookmark = await prisma.bookmarks.update({
          where: { id: deletedBookmark.id },
          data: {
            deleted_at: null,
            updated_at: new Date(),
            is_private: true, // Ensure it's private
            comments: null, // Clear comments
            category_id: null // Clear category
          }
        });
        
        console.log(`✅ BOOKMARKS: Restored bookmark for message ${messageId}`);
      } else {
        // Create new bookmark
        bookmark = await prisma.bookmarks.create({
          data: {
            message_id: messageId,
            user_id: userId,
            is_private: true,
            comments: null,
            category_id: null
          }
        });
        
        console.log(`✅ BOOKMARKS: Added bookmark to message ${messageId}`);
      }
      
      // Get updated count
      const bookmarkCount = await prisma.bookmarks.count({
        where: {
          message_id: messageId,
          deleted_at: null
        }
      });
      
      return res.json({
        success: true,
        action: 'added',
        count: bookmarkCount,
        isBookmarked: true,
        bookmarkId: bookmark.id,
        message: 'Bookmark added successfully'
      });
    }
    
  } catch (error) {
    console.error('❌ Error toggling bookmark:', error);
    res.status(500).json({ 
      error: 'Failed to toggle bookmark',
      details: error.message 
    });
  }
});

// Get all bookmarks for a user
router.get('/user/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    
    // Only allow users to see their own bookmarks (or admins in future)
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other user\'s bookmarks' });
    }
    
    const bookmarks = await prisma.bookmarks.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
        archived: false
      },
      include: {
        message: {
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
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    res.json({
      success: true,
      bookmarks: bookmarks,
      count: bookmarks.length,
      message: 'User bookmarks retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting user bookmarks:', error);
    res.status(500).json({ 
      error: 'Failed to get user bookmarks',
      details: error.message 
    });
  }
});

module.exports = router;

