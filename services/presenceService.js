const { PrismaClient } = require('../generated/prisma');

class PresenceService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Record a presence event (ENTER, HEARTBEAT, EXIT, AVAILABILITY)
  async recordPresenceEvent(userId, pageId, kind, availability = null, customLabel = null) {
    try {
      const presenceEvent = await this.prisma.presenceEvent.create({
        data: {
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
      
      return presenceEvent;
    } catch (error) {
      console.error('Error recording presence event:', error);
      throw new Error('Failed to record presence event');
    }
  }

  // Get active users on a specific page (users with recent HEARTBEAT or ENTER events)
  async getActiveUsers(pageId, communityId = null, minutesThreshold = 5) {
    try {
      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
      
      // Get recent presence events for this page
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
      recentEvents.forEach(event => {
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
            customLabel: event.customLabel
          });
        }
      });

      return Array.from(userMap.values());
    } catch (error) {
      console.error('Error getting active users:', error);
      throw new Error('Failed to get active users');
    }
  }

  // Get active users across multiple communities/pages
  async getActiveUsersForCommunities(communityIds, minutesThreshold = 5) {
    try {
      const allActiveUsers = [];
      
      for (const communityId of communityIds) {
        try {
          // Get all pages associated with this community
          const pages = await this.prisma.page.findMany({
            where: {
              space: {
                members: {
                  some: {
                    communityId: communityId
                  }
                }
              }
            },
            select: {
              id: true,
              canonicalUrl: true
            }
          });
          
          // If no pages found for community, try to get users from any recent presence events
          if (pages.length === 0) {
            console.log(`No pages found for community ${communityId}, checking recent presence events`);
            
            // Get recent presence events and filter by community membership
            const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
            const recentEvents = await this.prisma.presenceEvent.findMany({
              where: {
                kind: {
                  in: ['ENTER', 'HEARTBEAT']
                },
                createdAt: {
                  gte: thresholdTime
                },
                user: {
                  spaces: {
                    some: {
                      communityId: communityId
                    }
                  }
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
            recentEvents.forEach(event => {
              if (!userMap.has(event.userId) || event.createdAt > userMap.get(event.userId).createdAt) {
                userMap.set(event.userId, {
                  id: event.user.id,
                  userId: event.user.id,
                  name: event.user.name || event.user.handle || 'Unknown',
                  handle: event.user.handle,
                  avatarUrl: event.user.avatarUrl,
                  auraColor: event.user.auraColor,
                  communityId: communityId,
                  communityName: `Community ${communityId}`,
                  lastSeen: event.createdAt,
                  availability: event.availability,
                  customLabel: event.customLabel,
                  pageUrl: event.page.canonicalUrl
                });
              }
            });
            
            allActiveUsers.push(...Array.from(userMap.values()));
          } else {
            // Get users from each page in the community
            for (const page of pages) {
              const users = await this.getActiveUsers(page.id, communityId, minutesThreshold);
              allActiveUsers.push(...users);
            }
          }
        } catch (error) {
          console.warn(`Failed to get active users for community ${communityId}:`, error);
        }
      }

      // Deduplicate users across communities
      const userMap = new Map();
      allActiveUsers.forEach(user => {
        if (!userMap.has(user.userId) || user.lastSeen > userMap.get(user.userId).lastSeen) {
          userMap.set(user.userId, user);
        }
      });

      return Array.from(userMap.values());
    } catch (error) {
      console.error('Error getting active users for communities:', error);
      throw new Error('Failed to get active users for communities');
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

      console.log(`Cleaned up ${result.count} old presence events`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up old presence events:', error);
      throw new Error('Failed to cleanup old presence events');
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
