const express = require('express');
const router = express.Router();
const communityTokenService = require('../services/communityTokenService');
const waitlistService = require('../services/waitlistService');
const authService = require('../services/authService');
const activityRewardService = require('../services/activityRewardService');
const jauMemoryLoggingService = require('../services/jauMemoryLoggingService');

// ========== Community Token Launch Routes ==========

router.get('/communities/:communityId/token-launch', async (req, res) => {
  try {
    const { communityId } = req.params;
    const launch = await communityTokenService.getTokenLaunch(communityId);
    res.json({ success: true, data: launch });
  } catch (error) {
    console.error('Error fetching token launch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/communities/:communityId/token-launch', async (req, res) => {
  try {
    const { communityId } = req.params;
    const launch = await communityTokenService.createTokenLaunch(communityId, req.body);
    
    // Log milestone
    await jauMemoryLoggingService.logMilestone({
      milestoneKey: 'token_launch_created',
      name: 'Token Launch Created',
      status: 'created',
      communityId
    });

    res.status(201).json({ success: true, data: launch });
  } catch (error) {
    console.error('Error creating token launch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/token-launches/active', async (req, res) => {
  try {
    const launches = await communityTokenService.getActiveTokenLaunches(req.query);
    res.json({ success: true, data: launches });
  } catch (error) {
    console.error('Error fetching active launches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== Waitlist Routes ==========

router.post('/communities/:communityId/waitlist', async (req, res) => {
  try {
    const { communityId } = req.params;
    const entry = await waitlistService.addToWaitlist(communityId, req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/communities/:communityId/waitlist', async (req, res) => {
  try {
    const { communityId } = req.params;
    const entries = await waitlistService.getWaitlistEntries(communityId, req.query);
    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/communities/:communityId/batches', async (req, res) => {
  try {
    const { communityId } = req.params;
    const batch = await waitlistService.createBatch(communityId, req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/communities/:communityId/batches/:batchNumber/assign', async (req, res) => {
  try {
    const { communityId, batchNumber } = req.params;
    const { userIds } = req.body;
    const result = await waitlistService.assignToBatch(communityId, parseInt(batchNumber), userIds);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error assigning to batch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/communities/:communityId/batches/:batchNumber/grant-access', async (req, res) => {
  try {
    const { communityId, batchNumber } = req.params;
    const count = await waitlistService.grantBatchAccess(communityId, parseInt(batchNumber));
    res.json({ success: true, data: { granted: count } });
  } catch (error) {
    console.error('Error granting batch access:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/users/:userId/proof-of-humanity', async (req, res) => {
  try {
    const { userId } = req.params;
    const { pohIdentifier, provider } = req.body;
    const result = await waitlistService.verifyProofOfHumanity(userId, pohIdentifier, provider);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error verifying PoH:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== Auth Routes ==========

router.get('/auth/providers', async (req, res) => {
  try {
    const providers = await authService.getEnabledProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    console.error('Error fetching auth providers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users/:userId/auth-methods', async (req, res) => {
  try {
    const { userId } = req.params;
    const methods = await authService.getUserAuthMethods(userId);
    res.json({ success: true, data: methods });
  } catch (error) {
    console.error('Error fetching auth methods:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== Activity Rewards Routes ==========

router.post('/users/:userId/activities/reward', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await activityRewardService.recordActivity(userId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error recording activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users/:userId/rewards', async (req, res) => {
  try {
    const { userId } = req.params;
    const rewards = await activityRewardService.getUserRewards(userId, req.query);
    res.json({ success: true, data: rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users/:userId/rewards/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    const { communityId } = req.query;
    const summary = await activityRewardService.getRewardSummary(userId, communityId);
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching reward summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== Extension Logging Routes ==========

router.post('/extension/logs', async (req, res) => {
  try {
    const log = await jauMemoryLoggingService.storeExtensionLog(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Error storing extension log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;













