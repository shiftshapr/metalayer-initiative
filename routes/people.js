const express = require('express');
const router = express.Router();
const PeopleService = require('../services/peopleService');
const AuthService = require('../services/authService');

// Initialize services
const peopleService = new PeopleService();
const authService = new AuthService();

// Middleware to get current user
const getCurrentUser = async (req, res, next) => {
  try {
    req.currentUser = await authService.getCurrentUser(req);
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Authentication required' });
  }
};

// Get all users (for search/discovery)
router.get('/users', async (req, res) => {
  try {
    const { search, status, limit = 50 } = req.query;
    const result = await peopleService.getUsers(search, status, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's friends
router.get('/friends', getCurrentUser, async (req, res) => {
  try {
    const result = await peopleService.getFriends(req.currentUser.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get friend requests (sent and received)
router.get('/friend-requests', getCurrentUser, async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'sent', 'received', 'all'
    const result = await peopleService.getFriendRequests(req.currentUser.id, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send friend request
router.post('/friend-request', getCurrentUser, async (req, res) => {
  try {
    const { toUserId } = req.body;

    if (!toUserId) {
      return res.status(400).json({ success: false, error: 'toUserId is required' });
    }

    const result = await peopleService.sendFriendRequest(req.currentUser.id, toUserId);
    res.json({
      success: true,
      request: result.request,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Accept friend request
router.post('/friend-request/accept', getCurrentUser, async (req, res) => {
  try {
    const { requestId } = req.body;
    const result = await peopleService.acceptFriendRequest(requestId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Decline friend request
router.post('/friend-request/decline', getCurrentUser, async (req, res) => {
  try {
    const { requestId } = req.body;
    const result = await peopleService.declineFriendRequest(requestId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Remove friend
router.delete('/friends/:friendId', getCurrentUser, async (req, res) => {
  try {
    const { friendId } = req.params;
    const result = await peopleService.removeFriend(req.currentUser.id, friendId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Block user
router.post('/block', getCurrentUser, async (req, res) => {
  try {
    const { blockedUserId } = req.body;

    if (!blockedUserId) {
      return res.status(400).json({ success: false, error: 'blockedUserId is required' });
    }

    const result = await peopleService.blockUser(req.currentUser.id, blockedUserId);
    res.json({
      success: true,
      block: result.block,
      message: 'User blocked successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Unblock user
router.delete('/block/:blockedUserId', getCurrentUser, async (req, res) => {
  try {
    const { blockedUserId } = req.params;
    const result = await peopleService.unblockUser(req.currentUser.id, blockedUserId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get blocked users
router.get('/blocked', getCurrentUser, async (req, res) => {
  try {
    const result = await peopleService.getBlockedUsers(req.currentUser.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', getCurrentUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await peopleService.getUserProfile(userId, req.currentUser.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create or update user profile
router.post('/profile', getCurrentUser, async (req, res) => {
  try {
    const userData = req.body;
    const user = await peopleService.createOrUpdateUser(userData);
    res.json({
      success: true,
      user,
      message: 'User profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user status
router.patch('/status', getCurrentUser, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['online', 'away', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    await peopleService.updateUserStatus(req.currentUser.id, status);
    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user info
router.get('/me', getCurrentUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.currentUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;