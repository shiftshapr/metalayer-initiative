const express = require('express');
const router = express.Router();
const {
  getCommunities,
  selectCommunity,
  getSelectedCommunity
} = require('../controllers/communitiesController');

router.get('/', getCommunities);
router.post('/select', selectCommunity);
router.get('/selected/:userId', getSelectedCommunity);

module.exports = router;
