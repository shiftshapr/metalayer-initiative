/**
 * Dynamic Pricing Routes - TypeScript
 * API routes for dynamic pricing system
 */

import express, { Router } from 'express';
import dynamicPricingController from '../controllers/dynamicPricingController';

const router: Router = express.Router();

// TODO: Add authentication middleware
// import { authenticate } from '../middleware/auth';

// Pricing configuration
router.get('/config', dynamicPricingController.getPricingConfig.bind(dynamicPricingController));
router.post('/config', dynamicPricingController.upsertPricingConfig.bind(dynamicPricingController));

// Usage tracking
router.get('/usage', dynamicPricingController.getCurrentUsage.bind(dynamicPricingController));

// Cost calculation and access
router.get('/cost', dynamicPricingController.calculateCost.bind(dynamicPricingController));
router.get('/access', dynamicPricingController.checkAccess.bind(dynamicPricingController));
router.post('/access', dynamicPricingController.requestAccess.bind(dynamicPricingController));
router.post('/usage/:usageId/end', dynamicPricingController.endUsage.bind(dynamicPricingController));

// Optimization
router.post('/optimization/collect', dynamicPricingController.collectOptimizationData.bind(dynamicPricingController));
router.post('/optimization/optimize', dynamicPricingController.optimizePricing.bind(dynamicPricingController));

export default router;







