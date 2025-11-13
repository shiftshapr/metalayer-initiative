const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');

// Reuse existing authentication middleware
// TODO: Import `authenticateUser` from the same helper used by other routes (see `routes/presence.js`) so the
//       timeline endpoints enforce the X-User-* header contract.
// const { authenticateUser } = require('../middleware/auth');

/**
 * GET /api/timelines/:identifier
 * Get timeline for a single user (UUID or username)
 * 
 * Query parameters:
 * - persistence: 1d|7d|30d|1y|all (default: all)
 * - community: UUID of community to filter by
 * - search: Search query string
 * - type: Comma-separated activity types (messages,reactions,bookmarks,etc.)
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 50)
 */
router.get('/:identifier', async (req, res) => {
  // TODO: Once middleware is imported, change handler signature to `router.get('/:identifier', authenticateUser, ...)`
  //       so every request has a validated user context before reaching the controller.
  await timelineController.getTimeline(req, res);
});

/**
 * GET /api/timelines
 * Get timelines for multiple users (multi-profile view)
 * 
 * Query parameters:
 * - profiles: Comma-separated user UUIDs
 * - persistence: 1d|7d|30d|1y|all (default: all)
 * - community: UUID of community to filter by
 * - search: Search query string
 * - type: Comma-separated activity types
 * - page: Page number for pagination
 * - limit: Items per page
 */
router.get('/', async (req, res) => {
  // TODO: Same as above—wrap with `authenticateUser` so multi-profile queries honour permission checks.
  await timelineController.getMultipleTimelines(req, res);
});

module.exports = router;

