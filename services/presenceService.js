const { PrismaClient } = require('../generated/prisma');
const UrlNormalizationService = require('./urlNormalizationService');

class PresenceService {
  constructor(prisma) {
    this.prisma = prisma;
    this.urlNormalization = new UrlNormalizationService();
  }

  // Record a presence event (ENTER, HEARTBEAT, EXIT, AVAILABILITY)
  async recordPresenceEvent(userId, pageId, kind, availability = null, customLabel = null, pageUrl = null) {
    try {
      // First, ensure the page exists
      let page = await this.prisma.page.findUnique({
        where: { id: pageId }
      });

      if (!page && pageUrl) {
        // Create the page if it doesn't exist
        try {
          // Normalize the URL using the URL normalization service
          const { normalizedUrl, pageId: normalizedPageId } = await this.urlNormalization.normalizeUrl(pageUrl);
          
          // Find or create a default space first
          let defaultSpace = await this.prisma.space.findFirst({
            where: { name: 'Default Space' }
          });
          
          if (!defaultSpace) {
            defaultSpace = await this.prisma.space.create({
              data: {
                id: `default-space-${Date.now()}`,
                name: 'Default Space',
                description: 'Default space for presence tracking'
              }
            });
          }
          
          page = await this.prisma.page.upsert({
            where: {
              spaceId_canonicalUrl: {
                spaceId: defaultSpace.id,
                canonicalUrl: normalizedUrl
              }
            },
            update: {
              url: pageUrl,
              title: this.extractTitleFromUrl(pageUrl)
            },
            create: {
              id: normalizedPageId,
              url: pageUrl,
              canonicalUrl: normalizedUrl,
              title: this.extractTitleFromUrl(pageUrl),
              spaceId: defaultSpace.id
            }
          });
        } catch (pageError) {
          console.error('Error creating page:', pageError);
          // If page creation fails, we can't record the presence event
          throw new Error('Failed to create page for presence event');
        }
      } else if (!page) {
        throw new Error(`Page ${pageId} not found and no URL provided for creation`);
      }

      // Log heartbeat events for tracking
      if (kind === 'HEARTBEAT') {
        console.log(`💓 HEARTBEAT: ${userId} on ${pageId}`);
      } else if (kind === 'EXIT') {
        console.log(`🚪 EXIT: ${userId} from ${pageId}`);
      }

      // Use upsert to avoid race conditions
      const presenceEvent = await this.prisma.presenceEvent.upsert({
        where: {
          userId_pageId_kind: {
            userId,
            pageId,
            kind
          }
        },
        update: {
          availability,
          customLabel,
          createdAt: new Date()
        },
        create: {
          userId,
          pageId,
          kind,
          availability,
          customLabel
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatarUrl: true,
              auraColor: true
            }
          },
          page: {
            select: {
              id: true,
              canonicalUrl: true
            }
          }
        }
      });
      
      // Convert BigInt id to string for JSON serialization
      const serializedEvent = {
        ...presenceEvent,
        id: presenceEvent.id.toString(),
        user: presenceEvent.user ? {
          ...presenceEvent.user,
          id: presenceEvent.user.id.toString()
        } : null,
        page: presenceEvent.page ? {
          ...presenceEvent.page,
          id: presenceEvent.page.id.toString()
        } : null
      };
      
      return serializedEvent;
    } catch (error) {
      console.error('Error recording presence event:', error);
      throw new Error('Failed to record presence event');
    }
  }

  // Extract title from URL (basic implementation)
  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch (error) {
      return url;
    }
  }

  // Get active users on a specific page (users with recent HEARTBEAT or ENTER events)
  async getActiveUsers(pageId, communityId = null, minutesThreshold = 5, currentUserId = null) {
    try {
      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
      
      // Get recent presence events for this page
      // Note: We only look for ENTER and HEARTBEAT events
      // EXIT events are inferred by heartbeat timeout, not explicit EXIT events
      const recentEvents = await this.prisma.presenceEvent.findMany({
        where: {
          pageId,
          kind: {
            in: ['ENTER', 'HEARTBEAT']
          },
          createdAt: {
            gte: thresholdTime
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatarUrl: true,
              auraColor: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Group by user and get the most recent event for each user
      const userMap = new Map();
      const userEnterTimes = new Map(); // Track when each user first entered
      
      recentEvents.forEach(event => {
        // Don't skip the current user - we want to see all users on the page
        
        // Track the earliest ENTER event for each user
        if (event.kind === 'ENTER') {
          if (!userEnterTimes.has(event.userId) || event.createdAt < userEnterTimes.get(event.userId)) {
            userEnterTimes.set(event.userId, event.createdAt);
          }
        }
        
        // Keep the most recent event for each user
        if (!userMap.has(event.userId) || event.createdAt > userMap.get(event.userId).createdAt) {
          userMap.set(event.userId, {
            id: event.user.id,
            userId: event.user.id,
            name: event.user.name || event.user.handle || 'Unknown',
            handle: event.user.handle,
            avatarUrl: event.user.avatarUrl,
            auraColor: event.user.auraColor,
            communityId: communityId,
            communityName: communityId ? `Community ${communityId}` : 'Unknown',
            lastSeen: event.createdAt,
            availability: event.availability,
            customLabel: event.customLabel,
            enterTime: userEnterTimes.get(event.userId) || event.createdAt // When they first entered
          });
        }
      });

      const activeUsers = Array.from(userMap.values());
      
      // Sort by time on page (longest first) - users who entered earliest appear first
      activeUsers.sort((a, b) => {
        const aEnterTime = a.enterTime || a.lastSeen;
        const bEnterTime = b.enterTime || b.lastSeen;
        return aEnterTime - bEnterTime; // Earlier enter time = longer on page = appears first
      });
      
      // Filter out users without valid avatars - only return users with real avatar images
      const usersWithAvatars = activeUsers.filter(user => 
        user.avatarUrl && 
        user.avatarUrl !== 'null' && 
        user.avatarUrl !== '' &&
        user.avatarUrl.startsWith('http')
      );
      
      // console.log(`🔍 PRESENCE: Returning ${usersWithAvatars.length} users with valid avatars (filtered from ${activeUsers.length} total)`);
      
      return usersWithAvatars;
    } catch (error) {
      console.error('Error getting active users:', error);
      throw new Error('Failed to get active users');
    }
  }

  // Get active users across multiple communities/pages
  async getActiveUsersForCommunities(communityIds, minutesThreshold = 0.17, currentUserId = null) {
    try {
      // For now, just get all recent presence events since the database schema
      // doesn't support community-based filtering yet
      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
      
      const recentEvents = await this.prisma.presenceEvent.findMany({
        where: {
          kind: {
            in: ['ENTER', 'HEARTBEAT']
          },
          createdAt: {
            gte: thresholdTime
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              handle: true,
              avatarUrl: true,
              auraColor: true
            }
          },
          page: {
            select: {
              id: true,
              canonicalUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Group by user and get the most recent event for each user
      const userMap = new Map();
      const now = new Date();
      
      recentEvents.forEach(event => {
        // Don't skip the current user - we want to see all users
        
        // Only include events that are truly recent (within 10 seconds)
        const eventAge = now - event.createdAt;
        if (eventAge > 10000) { // 10 seconds in milliseconds
          // console.log(`🔍 PRESENCE: Skipping stale event for user ${event.userId} - age: ${Math.round(eventAge / 1000)}s`);
          return;
        }
        
        if (!userMap.has(event.userId) || event.createdAt > userMap.get(event.userId).createdAt) {
          userMap.set(event.userId, {
            id: event.user.id,
            userId: event.user.id,
            name: event.user.name || event.user.handle || 'Unknown',
            handle: event.user.handle,
            avatarUrl: event.user.avatarUrl,
            auraColor: event.user.auraColor,
            communityId: communityIds[0] || 'default', // Use first community for now
            communityName: `Community ${communityIds[0] || 'default'}`,
            lastSeen: event.createdAt,
            availability: event.availability,
            customLabel: event.customLabel,
            pageUrl: event.page.canonicalUrl
          });
        }
      });
      
      const activeUsers = Array.from(userMap.values());
      
      // Filter out users without valid avatars - only return users with real avatar images
      const usersWithAvatars = activeUsers.filter(user => 
        user.avatarUrl && 
        user.avatarUrl !== 'null' && 
        user.avatarUrl !== '' &&
        user.avatarUrl.startsWith('http')
      );
      
      // console.log(`🔍 PRESENCE: Returning ${usersWithAvatars.length} users with valid avatars (filtered from ${activeUsers.length} total)`);
      
      return usersWithAvatars;
    } catch (error) {
      console.error('Error getting active users for communities:', error);
      throw new Error('Failed to get active users for communities');
    }
  }

  // Process heartbeat timeouts and create EXIT events for inactive users
  async processHeartbeatTimeouts(minutesThreshold = 15, heartbeatMissThreshold = 5) {
    try {
      console.log(`🔍 HEARTBEAT TIMEOUT: Starting with ${minutesThreshold}min threshold, ${heartbeatMissThreshold} missed heartbeats`);
      
      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
      const heartbeatCheckTime = new Date(Date.now() - 5 * 60 * 1000); // Check heartbeats in last 5 minutes
      console.log(`🔍 HEARTBEAT TIMEOUT: Checking ENTER events after ${thresholdTime.toISOString()}, heartbeats after ${heartbeatCheckTime.toISOString()}`);
      
      // Find users who have ENTER events in the last 15 minutes
      const enterEvents = await this.prisma.presenceEvent.findMany({
        where: {
          kind: 'ENTER',
          createdAt: {
            gte: thresholdTime
          }
        },
        select: {
          userId: true,
          pageId: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`🔍 HEARTBEAT TIMEOUT: Found ${enterEvents.length} ENTER events in time window`);

      // Group by user+page and find the most recent ENTER event for each
      const userPageMap = new Map();
      enterEvents.forEach(event => {
        const key = `${event.userId}-${event.pageId}`;
        if (!userPageMap.has(key) || event.createdAt > userPageMap.get(key).createdAt) {
          userPageMap.set(key, event);
        }
      });

      console.log(`🔍 HEARTBEAT TIMEOUT: Processing ${userPageMap.size} unique user/page combinations`);

      // Check for users who need EXIT events (missed heartbeats)
      const exitEvents = [];
      for (const [key, event] of userPageMap) {
        console.log(`🔍 HEARTBEAT TIMEOUT: Checking user ${event.userId} on page ${event.pageId}`);
        
        // Count recent heartbeats for this user/page combination (last 5 minutes)
        const recentHeartbeats = await this.prisma.presenceEvent.count({
          where: {
            userId: event.userId,
            pageId: event.pageId,
            kind: 'HEARTBEAT',
            createdAt: {
              gte: heartbeatCheckTime
            }
          }
        });

        console.log(`🔍 HEARTBEAT TIMEOUT: User ${event.userId} has ${recentHeartbeats} recent heartbeats (need ${heartbeatMissThreshold})`);

        // If user has fewer heartbeats than the threshold, create EXIT
        if (recentHeartbeats < heartbeatMissThreshold) {
          console.log(`🚪 EXIT PROCESSING: Creating EXIT for user ${event.userId} (missed ${heartbeatMissThreshold - recentHeartbeats} heartbeats)`);
          exitEvents.push({
            userId: event.userId,
            pageId: event.pageId,
            kind: 'EXIT',
            availability: null,
            customLabel: `Heartbeat timeout (missed ${heartbeatMissThreshold - recentHeartbeats} heartbeats)`
          });
        } else {
          console.log(`🔍 HEARTBEAT TIMEOUT: User ${event.userId} is still active (${recentHeartbeats} heartbeats)`);
        }
      }

      // Create EXIT events for inactive users (delete existing first)
      if (exitEvents.length > 0) {
        console.log(`🔍 HEARTBEAT TIMEOUT: Creating ${exitEvents.length} EXIT events`);
        for (const exitEvent of exitEvents) {
          // Delete any existing EXIT event for this user/page
          await this.prisma.presenceEvent.deleteMany({
            where: {
              userId: exitEvent.userId,
              pageId: exitEvent.pageId,
              kind: 'EXIT'
            }
          });
          
          // Create the new EXIT event
          await this.prisma.presenceEvent.create({
            data: exitEvent
          });
          console.log(`🔍 HEARTBEAT TIMEOUT: Created EXIT event for user ${exitEvent.userId}`);
        }
      } else {
        console.log(`🔍 HEARTBEAT TIMEOUT: No EXIT events needed - all users are active`);
      }

      console.log(`🔍 HEARTBEAT TIMEOUT: Completed - created ${exitEvents.length} EXIT events`);
      return exitEvents.length;
    } catch (error) {
      console.error('Error processing heartbeat timeouts:', error);
      throw new Error('Failed to process heartbeat timeouts');
    }
  }

  // Clean up old presence events (should be called periodically)
  async cleanupOldPresenceEvents(daysToKeep = 7) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const result = await this.prisma.presenceEvent.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up old presence events:', error);
      throw new Error('Failed to cleanup old presence events');
    }
  }

  // Clean up visibility entries after EXIT based on user's displayVisibilityAfterExit setting
  async cleanupVisibilityAfterExit() {
    try {
      console.log(`🔍 PRESENCE SERVICE: Starting visibility cleanup after EXIT`);
      
      // Get all users with their displayVisibilityAfterExit settings
      const users = await this.prisma.appUser.findMany({
        select: {
          id: true,
          displayVisibilityAfterExit: true
        }
      });

      console.log(`🔍 PRESENCE SERVICE: Found ${users.length} users to check for visibility cleanup`);
      let totalCleaned = 0;

      for (const user of users) {
        const daysToKeep = user.displayVisibilityAfterExit || 7;
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        
        console.log(`🔍 PRESENCE SERVICE: Checking user ${user.id} with ${daysToKeep} days visibility retention`);
        
        // Find EXIT events for this user
        const exitEvents = await this.prisma.presenceEvent.findMany({
          where: {
            userId: user.id,
            kind: 'EXIT',
            createdAt: {
              lt: cutoffDate
            }
          },
          include: {
            page: true
          }
        });

        console.log(`🔍 PRESENCE SERVICE: Found ${exitEvents.length} old EXIT events for user ${user.id}`);

        // Remove visibility entries for URLs where user has been offline for too long
        for (const exitEvent of exitEvents) {
          const deleted = await this.prisma.userVisibility.deleteMany({
            where: {
              userId: user.id,
              url: exitEvent.page.canonicalUrl
            }
          });
          
          if (deleted.count > 0) {
            console.log(`🔍 PRESENCE SERVICE: Cleaned up ${deleted.count} visibility entries for user ${user.id} on URL ${exitEvent.page.canonicalUrl}`);
          }
          
          totalCleaned += deleted.count;
        }
      }

      console.log(`🔍 CLEANUP: Cleaned up ${totalCleaned} visibility entries after EXIT`);
      return totalCleaned;
    } catch (error) {
      console.error('Error cleaning up visibility after EXIT:', error);
      throw new Error('Failed to clean up visibility after EXIT');
    }
  }

  // Get presence statistics for a page
  async getPresenceStats(pageId, hours = 24) {
    try {
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const stats = await this.prisma.presenceEvent.groupBy({
        by: ['kind'],
        where: {
          pageId,
          createdAt: {
            gte: startTime
          }
        },
        _count: {
          kind: true
        }
      });

      return stats.reduce((acc, stat) => {
        acc[stat.kind.toLowerCase()] = stat._count.kind;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting presence stats:', error);
      throw new Error('Failed to get presence stats');
    }
  }
}

module.exports = PresenceService;
