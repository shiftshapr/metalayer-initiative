const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

/**
 * Timeline Service
 * Aggregates timeline data from multiple database tables
 */
class TimelineService {
  /**
   * Get timeline for a single user
   * @param {string} userId - User UUID
   * @param {object} options - Query options
   * @returns {Promise<object>} Timeline data with activities
   */
  async getUserTimeline(userId, options = {}) {
    const {
      persistence = 'all',
      community = null,
      search = null,
      activityTypes = [],
      page = 1,
      limit = 50
    } = options;

    // Calculate date range based on persistence
    const dateRange = this.calculateDateRange(persistence);

    // Fetch all activity types in parallel
    const activities = await Promise.all([
      this.getMessages(userId, { dateRange, community, search, activityTypes }),
      this.getReactions(userId, { dateRange, activityTypes }),
      this.getBookmarks(userId, { dateRange, activityTypes }),
      this.getProfileUpdates(userId, { dateRange, activityTypes }),
      this.getCommunityJoins(userId, { dateRange, activityTypes }),
      this.getStatusChanges(userId, { dateRange, activityTypes }),
      this.getAuraChanges(userId, { dateRange, activityTypes }),
      // Add more activity types as needed
    ]);

    // Flatten and merge all activities
    const allActivities = activities.flat();

    // Sort chronologically (newest first)
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply search filter if provided
    const filteredActivities = search
      ? this.applySearchFilter(allActivities, search)
      : allActivities;

    // Apply activity type filter if provided
    const typeFilteredActivities = activityTypes.length > 0
      ? filteredActivities.filter(a => activityTypes.includes(a.type))
      : filteredActivities;

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = typeFilteredActivities.slice(startIndex, endIndex);

    return {
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total: typeFilteredActivities.length,
        totalPages: Math.ceil(typeFilteredActivities.length / limit),
        hasMore: endIndex < typeFilteredActivities.length
      },
      filters: {
        persistence,
        community,
        search,
        activityTypes
      }
    };
  }

  /**
   * Get timelines for multiple users
   */
  async getMultipleUserTimelines(userIds, options) {
    // Fetch timelines in parallel
    const timelines = await Promise.all(
      userIds.map(userId => this.getUserTimeline(userId, options))
    );

    return timelines.map((timeline, index) => ({
      userId: userIds[index],
      ...timeline
    }));
  }

  /**
   * Get messages for timeline
   */
  async getMessages(userId, options) {
    const { dateRange, community, search } = options;

    const where = {
      user_id: userId,
      created_at: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    };

    if (community) {
      where.community_id = community;
    }

    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const messages = await prisma.messages.findMany({
      where,
      include: {
        AppUser: {
          select: {
            id: true,
            handle: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 1000 // Limit per activity type
    });

    return messages.map(msg => ({
      id: msg.id,
      type: 'message',
      userId: msg.user_id,
      timestamp: msg.created_at,
      visibility: 'public', // TODO: Replace with `determineMessageVisibility` that looks up community visibility rules (public square vs private communities).
      data: {
        content: msg.content,
        communityId: msg.community_id,
        user: msg.AppUser
      }
    }));
  }

  /**
   * Get reactions for timeline
   */
  async getReactions(userId, options) {
    const { dateRange } = options;

    const reactions = await prisma.reactions.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        message: {
          include: {
            AppUser: {
              select: {
                id: true,
                handle: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 1000
    });

    return reactions.map(reaction => ({
      id: reaction.id,
      type: 'reaction',
      userId: reaction.user_id,
      timestamp: reaction.created_at,
      visibility: 'public', // TODO: Determine based on message visibility
      data: {
        emoji: reaction.emoji,
        messageId: reaction.message_id,
        message: reaction.message
      }
    }));
  }

  /**
   * Get bookmarks for timeline
   */
  async getBookmarks(userId, options) {
    const { dateRange } = options;

    const bookmarks = await prisma.bookmarks.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        deleted_at: null
      },
      include: {
        message: {
          include: {
            AppUser: {
              select: {
                id: true,
                handle: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 1000
    });

    return bookmarks.map(bookmark => ({
      id: bookmark.id,
      type: 'bookmark',
      userId: bookmark.user_id,
      timestamp: bookmark.created_at,
      visibility: 'private', // Bookmarks are private
      data: {
        messageId: bookmark.message_id,
        message: bookmark.message
      }
    }));
  }

  /**
   * Get profile updates from audit log
   */
  async getProfileUpdates(userId, options) {
    const { dateRange } = options;

    const updates = await prisma.user_audit_logs.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 1000
    });

    return updates.map(update => ({
      id: update.id,
      type: 'profileUpdate',
      userId: update.user_id,
      timestamp: update.created_at,
      visibility: this.determineProfileUpdateVisibility(update.field_name),
      data: {
        fieldName: update.field_name,
        oldValue: update.old_value,
        newValue: update.new_value,
        changeType: update.change_type,
        changedBy: update.changed_by
      }
    }));
  }

  /**
   * Get community joins/leaves
   */
  async getCommunityJoins(userId, options) {
    const { dateRange } = options;

    const memberships = await prisma.MetaCommunityMembership.findMany({
      where: {
        userId: userId,
        joinedAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        MetaCommunity: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      },
      take: 1000
    });

    return memberships.map(membership => ({
      id: membership.id,
      type: 'communityJoin',
      userId: membership.userId,
      timestamp: membership.joinedAt,
      visibility: 'community',
      data: {
        communityId: membership.metaCommunityId,
        community: membership.MetaCommunity,
        isActive: membership.isActive
      }
    }));
  }

  /**
   * Get status changes (from user_presence updates)
   * TODO: Implement by sourcing data from the same tables backing the 4-state status dot:
   *       - Prefer `PresenceEvent` records of type `AVAILABILITY`
   *       - Include both begin/end timestamps (if available) for visibility windows
   *       - fall back to `user_presence.updated_at` when PresenceEvent is missing
   */
  async getStatusChanges(userId, options) {
    return [];
  }

  /**
   * Get aura changes
   * TODO: Pull from `user_audit_logs` where `field_name` is `auraColor` or `auraIntensity`, merge with realtime buffer if needed.
   */
  async getAuraChanges(userId, options) {
    return [];
  }

  /**
   * Calculate date range based on persistence setting
   */
  calculateDateRange(persistence) {
    const now = new Date();
    let start;

    switch (persistence) {
      case '1d':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        start = new Date(0); // Beginning of time
        break;
    }

    return {
      start,
      end: now
    };
  }

  /**
   * Apply search filter to activities
   */
  applySearchFilter(activities, searchQuery) {
    const query = searchQuery.toLowerCase();
    return activities.filter(activity => {
      // Search in activity content based on type
      const searchableText = this.getSearchableText(activity);
      return searchableText.toLowerCase().includes(query);
    });
  }

  /**
   * Get searchable text from activity
   */
  getSearchableText(activity) {
    switch (activity.type) {
      case 'message':
        return activity.data.content || '';
      case 'profileUpdate':
        return `${activity.data.fieldName} ${activity.data.oldValue} ${activity.data.newValue}`;
      case 'communityJoin':
        return activity.data.community?.name || '';
      default:
        return JSON.stringify(activity.data);
    }
  }

  /**
   * Determine message visibility
   */
  determineMessageVisibility(communityId) {
    // Public Square is public
    if (communityId === 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4') {
      return 'public';
    }
    return 'community';
  }

  /**
   * Determine profile update visibility
   */
  determineProfileUpdateVisibility(fieldName) {
    // Some fields are public, others are private
    const publicFields = ['headline', 'displayName'];
    return publicFields.includes(fieldName) ? 'public' : 'private';
  }
}

module.exports = new TimelineService();

