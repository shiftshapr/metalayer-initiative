const { PrismaClient } = require('../generated/prisma');
const { createClient } = require('@supabase/supabase-js');
const UrlNormalizationService = require('./urlNormalizationService');

class PresenceService {
  constructor(prisma) {
    this.prisma = prisma;
    this.urlNormalization = new UrlNormalizationService();
    this.supabase = null;
    this.initializeSupabase();
  }

  async initializeSupabase() {
    try {
      const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zwxomzkmncwzwryvudwu.supabase.co';
      const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';
      
      this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('✅ Supabase client initialized in PresenceService');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase in PresenceService:', error);
    }
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
      // Use Supabase to query presence data instead of Prisma
      if (!this.supabase) {
        console.error('❌ Supabase client not initialized');
        return [];
      }

      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
      
      // Query Supabase user_presence table for active users on this page
      console.log(`🔍 DEBUG: Querying Supabase for pageId: ${pageId}, thresholdTime: ${thresholdTime.toISOString()}`);
      
      // CRITICAL DIAGNOSTIC: Check if pageId has triple underscores (bug indicator)
      if (pageId.includes('___')) {
        console.error(`❌ PAGE_ID_BUG_DETECTED: Backend received pageId with TRIPLE underscores: ${pageId}`);
        console.error(`❌ PAGE_ID_BUG_DETECTED: This indicates frontend cache poisoning!`);
        console.error(`❌ PAGE_ID_BUG_DETECTED: User must hard refresh Chrome extension to fix!`);
      }
      
      const { data: presenceData, error } = await this.supabase
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .gte('last_seen', thresholdTime.toISOString())
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('❌ Error querying Supabase presence data:', error);
        return [];
      }

      console.log(`🔍 DEBUG: Raw Supabase query result: ${presenceData ? presenceData.length : 0} records`);
      if (presenceData && presenceData.length > 0) {
        presenceData.forEach((record, index) => {
          console.log(`🔍 DEBUG: Record ${index + 1}: ${record.user_email} - last_seen: ${record.last_seen} (active: ${record.is_active})`);
        });
      }

      if (!presenceData || presenceData.length === 0) {
        console.log('🔍 No active users found in Supabase for page:', pageId);
        // Let's also check what records exist for this page regardless of time/active status
        const { data: allRecords, error: allError } = await this.supabase
          .from('user_presence')
          .select('*')
          .eq('page_id', pageId);
        
        if (!allError && allRecords) {
          console.log(`🔍 DEBUG: All records for page ${pageId}: ${allRecords.length} found`);
          allRecords.forEach((record, index) => {
            const lastSeen = new Date(record.last_seen);
            const isRecent = lastSeen > thresholdTime;
            console.log(`🔍 DEBUG: All record ${index + 1}: ${record.user_email} - last_seen: ${record.last_seen} (active: ${record.is_active}, recent: ${isRecent})`);
          });
        }
        return [];
      }

      console.log('🔍 Found', presenceData.length, 'active users in Supabase for page:', pageId);

      // CRITICAL FIX: Query real user data from appUser table to get REAL Google avatars
      const emailList = presenceData.map(p => p.user_email);
      console.log('🔍 AVATAR_FIX: Querying appUser table for real avatars for emails:', emailList);
      
      const users = await this.prisma.appUser.findMany({
        where: {
          email: {
            in: emailList
          }
        },
        select: {
          email: true,
          name: true,
          handle: true,
          avatarUrl: true,
          auraColor: true
        }
      });
      
      console.log('🔍 AVATAR_FIX: ========================================');
      console.log('🔍 AVATAR_FIX: Queried appUser table with emails:', emailList);
      console.log('🔍 AVATAR_FIX: Found', users.length, 'users in appUser table');
      
      if (users.length === 0) {
        console.error('❌ AVATAR_FIX: NO USERS FOUND IN appUser TABLE!');
        console.error('❌ AVATAR_FIX: This means avatars will be FAKE ui-avatars.com URLs!');
        console.error('❌ AVATAR_FIX: Check if users exist in database with these emails:', emailList);
      }
      
      users.forEach((user, index) => {
        const isRealAvatar = user.avatarUrl && (
          user.avatarUrl.includes('googleusercontent.com') ||
          user.avatarUrl.includes('lh3.google')
        );
        console.log(`🔍 AVATAR_FIX: User ${index + 1}:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Handle: ${user.handle}`);
        console.log(`   Avatar URL: ${user.avatarUrl}`);
        console.log(`   Is Real Google Avatar: ${isRealAvatar}`);
        console.log(`   Aura Color: ${user.auraColor}`);
      });
      console.log('🔍 AVATAR_FIX: ========================================');
      
      // Create a map for quick lookup
      const userMap = new Map(users.map(u => [u.email, u]));

      // Convert Supabase presence data to the expected format
      const activeUsers = presenceData.map(presence => {
        const email = presence.user_email;
        const dbUser = userMap.get(email);
        
        // CRITICAL FIX: Use REAL avatar from database, not generated ui-avatars.com
        const avatarUrl = dbUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=${presence.aura_color?.replace('#', '') || '45B7D1'}&color=fff`;
        const name = dbUser?.name || email.split('@')[0];
        const handle = dbUser?.handle || email.split('@')[0];
        const auraColor = dbUser?.auraColor || presence.aura_color || '#45B7D1';
        
        const isRealAvatar = avatarUrl.includes('googleusercontent.com') || avatarUrl.includes('lh3.google');
        console.log(`🔍 AVATAR_FIX: Building user object for ${email}:`);
        console.log(`   avatarUrl: ${avatarUrl}`);
        console.log(`   isReal: ${isRealAvatar}`);
        console.log(`   dbUser exists: ${!!dbUser}`);
        console.log(`   presence.enter_time: ${presence.enter_time}`);
        console.log(`   presence.last_seen: ${presence.last_seen}`);
        console.log(`   enterTime will be: ${presence.enter_time || presence.last_seen}`);
        
        // CRITICAL BUG FIX: Check if enter_time exists and is valid, otherwise log error
        if (!presence.enter_time) {
          console.error(`❌ ENTER_TIME_BUG: enter_time is ${presence.enter_time} for ${email}!`);
          console.error(`❌ ENTER_TIME_BUG: This will cause time to reset to 'Now' on every update!`);
          console.error(`❌ ENTER_TIME_BUG: Falling back to last_seen: ${presence.last_seen}`);
        }
        
        return {
          id: email,
          userId: email,
          email: email,
          name: name,
          handle: handle,
          avatarUrl: avatarUrl, // USE REAL AVATAR FROM DATABASE!
          auraColor: auraColor,
          communityId: communityId || 'comm-001',
          communityName: communityId ? `Community ${communityId}` : 'Community comm-001',
          lastSeen: presence.last_seen,
          availability: null,
          customLabel: null,
          enterTime: presence.enter_time || presence.last_seen, // CRITICAL FIX: Use enter_time if available
          isActive: presence.is_active,
          status: presence.is_active ? 'online' : 'offline'
        };
      });

      // Sort by time on page (longest first) - users who entered earliest appear first
      activeUsers.sort((a, b) => {
        const aEnterTime = new Date(a.enterTime);
        const bEnterTime = new Date(b.enterTime);
        return aEnterTime - bEnterTime; // Earlier enter time = longer on page = appears first
      });
      
      console.log(`🔍 PRESENCE: Returning ${activeUsers.length} active users from Supabase`);
      
      return activeUsers;
    } catch (error) {
      console.error('Error getting active users:', error);
      throw new Error('Failed to get active users');
    }
  }

  // Get active users across multiple communities/pages
  async getActiveUsersForCommunities(communityIds, minutesThreshold = 0.17, currentUserId = null) {
    try {
      // Use Supabase to query presence data instead of Prisma
      if (!this.supabase) {
        console.error('❌ Supabase client not initialized');
        return [];
      }

      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
      
      // Query Supabase user_presence table for all active users
      const { data: presenceData, error } = await this.supabase
        .from('user_presence')
        .select('*')
        .eq('is_active', true)
        .gte('last_seen', thresholdTime.toISOString())
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('❌ Error querying Supabase presence data for communities:', error);
        return [];
      }

      if (!presenceData || presenceData.length === 0) {
        console.log('🔍 No active users found in Supabase for communities');
        return [];
      }

      console.log('🔍 Found', presenceData.length, 'active users in Supabase for communities');

      // CRITICAL FIX: Query real user data from appUser table to get REAL Google avatars
      const emailList = presenceData.map(p => p.user_email);
      console.log('🔍 AVATAR_FIX (communities): Querying appUser table for real avatars for emails:', emailList);
      
      const users = await this.prisma.appUser.findMany({
        where: {
          email: {
            in: emailList
          }
        },
        select: {
          email: true,
          name: true,
          handle: true,
          avatarUrl: true,
          auraColor: true
        }
      });
      
      console.log('🔍 AVATAR_FIX (communities): ========================================');
      console.log('🔍 AVATAR_FIX (communities): Queried appUser table with emails:', emailList);
      console.log('🔍 AVATAR_FIX (communities): Found', users.length, 'users in appUser table');
      
      if (users.length === 0) {
        console.error('❌ AVATAR_FIX (communities): NO USERS FOUND IN appUser TABLE!');
        console.error('❌ AVATAR_FIX (communities): This means avatars will be FAKE ui-avatars.com URLs!');
        console.error('❌ AVATAR_FIX (communities): Check if users exist in database with these emails:', emailList);
      }
      
      users.forEach((user, index) => {
        const isRealAvatar = user.avatarUrl && (
          user.avatarUrl.includes('googleusercontent.com') ||
          user.avatarUrl.includes('lh3.google')
        );
        console.log(`🔍 AVATAR_FIX (communities): User ${index + 1}:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Avatar URL: ${user.avatarUrl}`);
        console.log(`   Is Real Google Avatar: ${isRealAvatar}`);
      });
      console.log('🔍 AVATAR_FIX (communities): ========================================');
      
      // Create a map for quick lookup
      const userMap = new Map(users.map(u => [u.email, u]));

      // Convert Supabase presence data to the expected format
      const activeUsers = presenceData.map(presence => {
        const email = presence.user_email;
        const dbUser = userMap.get(email);
        
        // CRITICAL FIX: Use REAL avatar from database, not generated ui-avatars.com
        const avatarUrl = dbUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=${presence.aura_color?.replace('#', '') || '45B7D1'}&color=fff`;
        const name = dbUser?.name || email.split('@')[0];
        const handle = dbUser?.handle || email.split('@')[0];
        const auraColor = dbUser?.auraColor || presence.aura_color || '#45B7D1';
        
        const isRealAvatar = avatarUrl.includes('googleusercontent.com') || avatarUrl.includes('lh3.google');
        console.log(`🔍 AVATAR_FIX (communities): Building user object for ${email}:`);
        console.log(`   avatarUrl: ${avatarUrl}`);
        console.log(`   isReal: ${isRealAvatar}`);
        console.log(`   dbUser exists: ${!!dbUser}`);
        console.log(`   presence.enter_time: ${presence.enter_time}`);
        console.log(`   presence.last_seen: ${presence.last_seen}`);
        
        // CRITICAL BUG FIX: Check if enter_time exists and is valid, otherwise log error
        if (!presence.enter_time) {
          console.error(`❌ ENTER_TIME_BUG (communities): enter_time is ${presence.enter_time} for ${email}!`);
          console.error(`❌ ENTER_TIME_BUG (communities): Falling back to last_seen: ${presence.last_seen}`);
        }
        
        return {
          id: email,
          userId: email,
          email: email,
          name: name,
          handle: handle,
          avatarUrl: avatarUrl, // USE REAL AVATAR FROM DATABASE!
          auraColor: auraColor,
          communityId: communityIds[0] || 'comm-001',
          communityName: `Community ${communityIds[0] || 'comm-001'}`,
          lastSeen: presence.last_seen,
          availability: null,
          customLabel: null,
          pageUrl: presence.page_url,
          enterTime: presence.enter_time || presence.last_seen // CRITICAL FIX: Use enter_time if available
        };
      });
      
      console.log(`🔍 PRESENCE: Returning ${activeUsers.length} active users from Supabase for communities`);
      
      return activeUsers;
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
