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

// Select community route (sets as primary and active)
router.post('/select', async (req, res) => {
  try {
    const { userId, communityId, tabId } = req.body;
    if (!userId || !communityId) {
      return res.status(400).json({ error: 'Missing userId or communityId' });
    }

    // Use the controller method which handles database updates
    const { selectCommunity } = require('../controllers/communitiesController');
    
    // Update request body to include tabId
    req.body = { userId, communityId, tabId };
    
    // Call controller (it will handle the response)
    await selectCommunity(req, res);
  } catch (error) {
    console.error('Error in /select route:', error);
    res.status(500).json({ error: 'Failed to select community' });
  }
});

module.exports = router;