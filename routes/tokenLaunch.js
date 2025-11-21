const express = require('express');
const router = express.Router();
const tokenLaunchController = require('../controllers/tokenLaunchController');

// TODO: Add authentication middleware
// const { authenticate } = require('../middleware/auth');

// ========== Milestone Routes ==========
router.get('/milestones', tokenLaunchController.getMilestones);
router.get('/milestones/:key', tokenLaunchController.getMilestone);
router.get('/milestones/readiness/status', tokenLaunchController.getLaunchReadiness);
router.put('/milestones/:key', tokenLaunchController.updateMilestone);
router.post('/milestones/:milestoneId/attestations', tokenLaunchController.addAttestation);

// ========== Community Metrics Routes ==========
router.get('/metrics', tokenLaunchController.getMetrics);
router.get('/metrics/history', tokenLaunchController.getMetricsHistory);
router.get('/metrics/engagement-check', tokenLaunchController.checkEngagementMilestone);
router.post('/metrics/calculate', tokenLaunchController.calculateMetrics);

// ========== Governance Routes ==========
router.get('/governance/proposals', tokenLaunchController.getProposals);
router.get('/governance/proposals/:id', tokenLaunchController.getProposal);
router.post('/governance/proposals', tokenLaunchController.createProposal);
router.post('/governance/proposals/:id/votes', tokenLaunchController.castVote);
router.get('/governance/proposals/:id/results', tokenLaunchController.getProposalResults);

// ========== Treasury Routes ==========
router.get('/treasury/summary', tokenLaunchController.getTreasurySummary);
router.get('/treasury/transactions', tokenLaunchController.getTreasuryTransactions);
router.post('/treasury/transactions', tokenLaunchController.createTransaction);
router.post('/treasury/transactions/:id/approve', tokenLaunchController.approveTransaction);
router.post('/treasury/transactions/:id/execute', tokenLaunchController.executeTransaction);

// ========== Token Utility Routes ==========
router.get('/token-utilities', tokenLaunchController.getTokenUtilities);
router.get('/token-utilities/check-access', tokenLaunchController.checkAccess);
router.get('/users/:userId/balance', tokenLaunchController.getUserBalance);
router.post('/users/:userId/balance/sync', tokenLaunchController.syncUserBalance);

// ========== Security Routes ==========
router.get('/security/alerts', tokenLaunchController.getSecurityAlerts);
router.post('/security/alerts/:id/acknowledge', tokenLaunchController.acknowledgeAlert);
router.get('/security/multisig-signers', tokenLaunchController.getMultisigSigners);
router.post('/security/monitoring/run', tokenLaunchController.runMonitoring);

module.exports = router;








