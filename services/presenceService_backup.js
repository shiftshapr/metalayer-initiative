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

  // Record a presence event (ENTER, EXIT, AVAILABILITY)
  async recordPresenceEvent(userId, pageId, kind, availability = null, customLabel = null, pageUrl = null) {
    try {
      // For string page IDs like "google_com_", we'll use the pageId directly
      // without requiring a Page record in the database
      let page = null;
      
      // If not found or not a UUID, try to find by canonicalUrl or create with pageId as identifier
      if (!page) {
        page = await this.prisma.page.findFirst({
          where: {
            OR: [
              { canonicalUrl: pageUrl },
              { id: pageId }
            ]
          }
        });
      }

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

      // Log presence events for tracking
      if (kind === 'EXIT') {
        console.log(`🚪 EXIT: ${userId} from ${pageId}`);
      }

      // PRISMA METHOD: Use Prisma ORM for database operations
      console.log(`🔍 PRISMA_METHOD: Recording presence event using Prisma ORM`);
      console.log(`🔍 PRISMA_METHOD: User: ${userId}, Page: ${pageId}, Kind: ${kind}`);
      
      // Get user data for UserPresence record
      const user = await this.prisma.appUser.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          handle: true,
          avatarUrl: true,
          auraColor: true
        }
      });
      
      if (!user) {
        throw new Error(`User ${userId} not found in database`);
      }
      
      // Determine if user is active based on event kind
      const isActive = kind === 'ENTER';
      
      // Upsert UserPresence record
      const userPresence = await this.prisma.user_presence.upsert({
        where: {
          user_email_page_id: {
            user_email: user.email,
            page_id: pageId
          }
        },
        update: {
          is_active: isActive,
          last_seen: new Date(),
          aura_color: user.auraColor || '#45B7D1',
          page_url: pageUrl || page.canonicalUrl
        },
        create: {
          user_email: user.email,
          page_id: pageId,
          page_url: pageUrl || page.canonicalUrl,
          aura_color: user.auraColor || '#45B7D1',
          is_active: isActive,
          last_seen: new Date()
        }
      });
      
      console.log(`✅ PRISMA_METHOD: Successfully recorded user presence with ID: ${userPresence.id}`);
      
      // Also create PresenceEvent for historical tracking
      const presenceEvent = await this.prisma.presenceEvent.create({
        data: {
          pageId: pageId,
          userId: userId,
          kind: kind,
          availability: availability,
          customLabel: customLabel
        }
      });
      
      console.log(`✅ PRISMA_METHOD: Successfully recorded presence event with ID: ${presenceEvent.id}`);
      
      return {
        id: presenceEvent.id.toString(),
        userId,
        pageId,
        kind,
        availability,
        customLabel,
        createdAt: presenceEvent.createdAt,
        user: user,
        page: {
          id: pageId,
          canonicalUrl: page.canonicalUrl
        }
      };
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

  // Get active users on a specific page (users with recent ENTER events)
  // ENHANCED: Now also returns recently inactive users for "Last seen" display
  async getActiveUsers(pageId, communityId = null, minutesThreshold = 5, currentUserId = null) {
    try {
      // Use Supabase to query presence data instead of Prisma
      if (!this.supabase) {
        console.error('❌ Supabase client not initialized');
        return [];
      }

      const activeThreshold = new Date(Date.now() - minutesThreshold * 60 * 1000);
      const recentThreshold = new Date(Date.now() - 30 * 60 * 1000); // Last 30 minutes for "recently seen"
      
      // Query Supabase user_presence table for active users on this page
      console.log(`🔍 DEBUG: Querying Supabase for pageId: ${pageId}`);
      console.log(`🔍 DEBUG: Active threshold: ${activeThreshold.toISOString()}`);
      console.log(`🔍 DEBUG: Recent threshold: ${recentThreshold.toISOString()}`);
      
      // CRITICAL DIAGNOSTIC: Check if pageId has triple underscores (bug indicator)
      if (pageId.includes('___')) {
        console.error(`❌ PAGE_ID_BUG_DETECTED: Backend received pageId with TRIPLE underscores: ${pageId}`);
        console.error(`❌ PAGE_ID_BUG_DETECTED: This indicates frontend cache poisoning!`);
        console.error(`❌ PAGE_ID_BUG_DETECTED: User must hard refresh Chrome extension to fix!`);
      }
      
      // DIAGNOSTIC: First, check ALL users in the database for this page (ignore filters)
      const { data: allUsersOnPage, error: allError } = await this.supabase
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId)
        .order('last_seen', { ascending: false });
      
      console.log('');
      console.log('🔍🔍🔍 DIAGNOSTIC: ALL USERS ON THIS PAGE (no filters)');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🔍 Page ID: ${pageId}`);
      console.log(`🔍 Total records: ${allUsersOnPage?.length || 0}`);
      if (allUsersOnPage && allUsersOnPage.length > 0) {
        allUsersOnPage.forEach((record, index) => {
          console.log(`🔍 User ${index + 1}:`, {
            email: record.user_email,
            is_active: record.is_active,
            last_seen: record.last_seen,
            enter_time: record.enter_time,
            page_url: record.page_url
          });
        });
      } else {
        console.log('🔍 NO USERS FOUND ON THIS PAGE AT ALL!');
      }
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      
      // Query 1: Get currently active users (is_active = true)
      const { data: activeData, error: activeError } = await this.supabase
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .gte('last_seen', activeThreshold.toISOString())
        .order('last_seen', { ascending: false });

      if (activeError) {
        console.error('❌ Error querying active users:', activeError);
      }

      // Query 2: Get recently inactive users (is_active = false, but seen recently)
      // CRITICAL FIX OCT 14: Show users who LEFT this page, even if they're now active elsewhere
      // This is the WHOLE POINT of "Last seen X ago" - to show where users WERE before they moved
      
      console.log(`🔍 BACKEND: Querying for recently inactive users on THIS page (${pageId})`);
      console.log(`🔍 BACKEND: These are users who LEFT this page within the last 30 minutes`);
      console.log(`🔍 BACKEND: We WANT to show them even if they're now active on a different page!`);
      
      // Get recently inactive users on THIS page
      const { data: recentData, error: recentError } = await this.supabase
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', false)
        .gte('last_seen', recentThreshold.toISOString())
        .order('last_seen', { ascending: false });

      if (recentError) {
        console.error('❌ Error querying recent users:', recentError);
      }

      const activeUsers = activeData || [];
      const recentUsers = recentData || [];
      
      // NO FILTERING! We want to show ALL recently inactive users, even if they're now active elsewhere
      // This allows "Last seen X ago on this page" to work correctly
      
      console.log(`🔍 DEBUG: Active users on THIS page: ${activeUsers.length} records`);
      console.log(`🔍 DEBUG: Recently inactive users on THIS page: ${recentUsers.length} records`);
      console.log(`🔍 DEBUG: Total users to return: ${activeUsers.length + recentUsers.length} records`);
      
      if (activeUsers.length > 0) {
        activeUsers.forEach((record, index) => {
          console.log(`🔍 DEBUG: Active ${index + 1}: ${record.user_email} - last_seen: ${record.last_seen}`);
        });
      }
      
      if (recentUsers.length > 0) {
        recentUsers.forEach((record, index) => {
          console.log(`🔍 DEBUG: Recent ${index + 1}: ${record.user_email} - last_seen: ${record.last_seen}`);
        });
      }

      // Combine both lists (active users first, then recent)
      const allPresenceData = [...activeUsers, ...recentUsers];
      
      if (allPresenceData.length === 0) {
        console.log('🔍 No active or recent users found in Supabase for page:', pageId);
        return [];
      }

      console.log('🔍 Found', activeUsers.length, 'active +', recentUsers.length, 'recent users for page:', pageId);

      // CRITICAL FIX: Query real user data from appUser table to get REAL Google avatars
      const emailList = allPresenceData.map(p => p.user_email);
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
      // ENHANCED: Now includes both active and recently inactive users
      const formattedUsers = allPresenceData.map(presence => {
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
        console.log(`   presence.is_active: ${presence.is_active}`);
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

      // Sort by activity status first (active first), then by time on page
      formattedUsers.sort((a, b) => {
        // Active users come before inactive users
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        
        // Within same activity status, sort by enter time (longest first)
        const aEnterTime = new Date(a.enterTime);
        const bEnterTime = new Date(b.enterTime);
        return aEnterTime - bEnterTime; // Earlier enter time = longer on page = appears first
      });
      
      console.log(`🔍 PRESENCE: Returning ${formattedUsers.length} users from Supabase (${activeUsers.length} active, ${recentUsers.length} recent)`);
      
      return formattedUsers;
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

  // REMOVED: Heartbeat timeout processing - not used in COMP
  // COMP uses pure Supabase realtime, no heartbeat system needed

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
