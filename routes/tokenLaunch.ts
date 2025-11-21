/**
 * Token Launch Routes - TypeScript
 * API routes for token launch system
 */

import express, { Router } from 'express';
import tokenLaunchController from '../controllers/tokenLaunchController';

const router: Router = express.Router();

// TODO: Add authentication middleware
// import { authenticate } from '../middleware/auth';

// ========== Milestone Routes ==========
router.get('/milestones', tokenLaunchController.getMilestones.bind(tokenLaunchController));
router.get('/milestones/:key', tokenLaunchController.getMilestone.bind(tokenLaunchController));
router.get('/milestones/readiness/status', tokenLaunchController.getLaunchReadiness.bind(tokenLaunchController));
router.put('/milestones/:key', tokenLaunchController.updateMilestone.bind(tokenLaunchController));
router.post('/milestones/:milestoneId/attestations', tokenLaunchController.addAttestation.bind(tokenLaunchController));

// ========== Community Metrics Routes ==========
router.get('/metrics', tokenLaunchController.getMetrics.bind(tokenLaunchController));
router.get('/metrics/history', tokenLaunchController.getMetricsHistory.bind(tokenLaunchController));
router.get('/metrics/engagement-check', tokenLaunchController.checkEngagementMilestone.bind(tokenLaunchController));
router.post('/metrics/calculate', tokenLaunchController.calculateMetrics.bind(tokenLaunchController));

export default router;









