const timelineService = require('../services/timelineService');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Timeline Controller
 * Handles HTTP requests for timeline endpoints
 */
class TimelineController {
  /**
   * Get timeline for a single user
   * GET /api/timelines/:identifier
   */
  async getTimeline(req, res) {
    try {
      const { identifier } = req.params;
      const queryParams = this.parseQueryParams(req.query);
      
      // Resolve UUID from identifier (could be UUID or username)
      const userId = await this.resolveUserId(identifier);
      
      if (!userId) {
        return res.status(404).json({
          error: 'User not found',
          message: `No user found with identifier: ${identifier}`
        });
      }

      // Check visibility permissions
      const hasPermission = await this.checkTimelinePermission(
        req.user?.id,
        userId
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'You do not have permission to view this timeline'
        });
      }

      // Get timeline data
      const timeline = await timelineService.getUserTimeline(userId, queryParams);

      res.json({
        success: true,
        userId,
        timeline,
        pagination: timeline.pagination,
        filters: queryParams
      });

    } catch (error) {
      console.error('Timeline controller error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Get timelines for multiple users (multi-profile view)
   * GET /api/timelines?profiles=uuid1,uuid2,uuid3
   */
  async getMultipleTimelines(req, res) {
    try {
      const { profiles } = req.query;
      const queryParams = this.parseQueryParams(req.query);

      if (!profiles) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'profiles parameter is required'
        });
      }

      const userIds = profiles.split(',').filter(id => id.trim());

      if (userIds.length === 0 || userIds.length > 4) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'Must provide 1-4 profile UUIDs'
        });
      }

      // Check permissions for each user
      const permissions = await Promise.all(
        userIds.map(userId => 
          this.checkTimelinePermission(req.user?.id, userId)
        )
      );

      const allowedUserIds = userIds.filter((_, index) => permissions[index]);

      if (allowedUserIds.length === 0) {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'No accessible timelines found'
        });
      }

      // Get timelines for all users in parallel
      const timelines = await timelineService.getMultipleUserTimelines(
        allowedUserIds,
        queryParams
      );

      res.json({
        success: true,
        profiles: allowedUserIds,
        timelines,
        filters: queryParams
      });

    } catch (error) {
      console.error('Multiple timelines controller error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Parse and validate query parameters
   */
  parseQueryParams(query) {
    return {
      persistence: query.persistence || 'all',
      community: query.community || null,
      search: query.search || null,
      activityTypes: query.type ? query.type.split(',') : [],
      page: parseInt(query.page) || 1,
      limit: Math.min(parseInt(query.limit) || 50, 100) // Max 100 items per page
    };
  }

  /**
   * Resolve user ID from identifier (UUID or username)
   */
  async resolveUserId(identifier) {
    // Check if it's a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(identifier)) {
      // It's a UUID, verify user exists
      const user = await prisma.AppUser.findUnique({
        where: { id: identifier },
        select: { id: true }
      });
      return user?.id || null;
    } else {
      // It's a username, look up by handle
      const user = await prisma.AppUser.findUnique({
        where: { handle: identifier },
        select: { id: true }
      });
      return user?.id || null;
    }
  }

  /**
   * Check if current user has permission to view target user's timeline
   */
  async checkTimelinePermission(currentUserId, targetUserId) {
    // Public timelines are always visible
    // For private/community timelines, check permissions
    // TODO: Implement visibility rule checking by consulting VisibilityManager/DB rules:
    //       - allow self-view (currentUserId === targetUserId)
    //       - allow admins/moderators (check role flag once available)
    //       - for community visibility, confirm shared membership via MetaCommunityMembership
    //       - respect per-activity overrides stored in user preferences
    // For now, allow if user exists
    const user = await prisma.AppUser.findUnique({
      where: { id: targetUserId },
      select: { id: true }
    });
    return !!user;
  }
}

module.exports = new TimelineController();

