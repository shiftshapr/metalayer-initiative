const express = require('express');
const router = express.Router();
const { 
  selectCommunity, 
  getCommunities, 
  getManageableCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity 
} = require('../controllers/communitiesController');
const avatarStore = require('../avatarStore');

// Public routes
router.get('/', getCommunities);

// Community management routes
router.get('/manage/list', getManageableCommunities);
router.post('/', createCommunity);
router.put('/:id', updateCommunity);
router.delete('/:id', deleteCommunity);

// Legacy route for backward compatibility
router.post('/select', (req, res) => {
  const { userId, communityId } = req.body;
  if (!userId || !communityId) {
    return res.status(400).json({ error: 'Missing userId or communityId' });
  }

  avatarStore.setActive(userId, communityId);

  res.json({
    message: 'Community selected',
    userId,
    communityId
  });
});

module.exports = router;