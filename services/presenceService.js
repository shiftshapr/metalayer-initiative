const { PrismaClient } = require('../generated/prisma');
const { createClient } = require('@supabase/supabase-js');
const UserNameExtractor = require('../presence/utils/UserNameExtractor');

class PresenceService {
  constructor(prisma) {
    this.prisma = prisma;
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
      console.log(`🔍 PRESENCE_EVENT: Recording ${kind} event for user ${userId} on page ${pageId}`);
      
      // Find the user first, create AppUser if needed
      let user = await this.prisma.appUser.findUnique({
        where: { email: userId }
      });
      
      if (!user) {
        // Create AppUser record for new user
        console.log(`🔍 PRESENCE_EVENT: Creating new AppUser record for ${userId}`);
        user = await this.prisma.appUser.create({
              data: {
            id: require('crypto').randomUUID(),
            handle: userId.split('@')[0],
            email: userId,
            name: userId.split('@')[0],
            avatarUrl: '', // Will be updated by auth service
            auraColor: '#ffffff', // Default white
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ PRESENCE_EVENT: Created AppUser record for ${userId}`);
      }
      
      // Determine if user is active based on event kind
      const isActive = kind === 'ENTER';
      
      // Upsert UserPresence record using UUID foreign key
      const userPresence = await this.prisma.user_presence.upsert({
            where: {
          unique_user_presence_user_page: {
            user_id: user.id,
            page_id: pageId
              }
            },
            update: {
          is_active: isActive,
          last_seen: new Date(),
          // Don't update aura_color on presence updates - keep existing database value
          page_url: pageUrl || pageId,
          user_name: user.user_metadata?.full_name || user.name || user.email?.split('@')[0] || 'User'
            },
            create: {
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.name || user.email?.split('@')[0] || 'User',
          page_id: pageId,
          page_url: pageUrl || pageId,
          is_active: isActive,
          last_seen: new Date()
        }
      });
      
      console.log(`✅ PRISMA_METHOD: Successfully recorded user presence with ID: ${userPresence.id}`);
      
      // Skip PresenceEvent creation for now since it requires Page relationships
      // We can add this back later if needed
      
      return {
        success: true,
        userPresence: userPresence,
        message: 'Presence event recorded successfully'
      };
      
    } catch (error) {
      console.error('❌ Error recording presence event:', error);
      throw new Error('Failed to record presence event');
    }
  }

  // Get presence data for a page
  async getPagePresence(pageId) {
    try {
      const presenceData = await this.prisma.user_presence.findMany({
        where: {
          page_id: pageId,
          is_active: true
        },
        orderBy: {
          last_seen: 'desc'
        }
      });
      
      return presenceData;
    } catch (error) {
      console.error('❌ Error getting page presence:', error);
      throw new Error('Failed to get page presence');
    }
  }

  // Get active users on a page
  async getActiveUsers(pageId, communityId = null, minutes = 0.5, currentUserId = null) {
    try {
      console.log(`🔍 GET_ACTIVE_USERS: Getting active users for page ${pageId}`);
      
      const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));
      
      let whereClause = {
        page_id: pageId,
        is_active: true,
        last_seen: {
          gte: cutoffTime
        }
      };
      
      if (communityId) {
        whereClause.community_id = communityId;
      }
      
      const activeUsers = await this.prisma.user_presence.findMany({
        where: whereClause,
        include: {
          AppUser: true // Join with AppUser table to get auraColor and avatarUrl
        },
        orderBy: {
          last_seen: 'desc'
        }
      });
      
      console.log(`✅ GET_ACTIVE_USERS: Found ${activeUsers.length} active users`);
      
      // Transform to expected format using AppUser data
      return activeUsers.map(user => ({
        id: user.AppUser?.id || user.user_id,
        userId: user.AppUser?.id || user.user_id,
        email: user.AppUser?.email || 'unknown@example.com',
        name: user.AppUser?.name || user.user_name || 'User',
        handle: user.AppUser?.handle || user.user_name || 'user',
        avatarUrl: user.AppUser?.avatarUrl || null, // Get from AppUser, not user_presence
        auraColor: user.AppUser?.auraColor || '#ffffff', // Get from AppUser, fallback to white
        lastSeen: user.last_seen,
        enterTime: user.enter_time,
        isActive: user.is_active,
        status: 'online'
      }));
      
    } catch (error) {
      console.error('❌ GET_ACTIVE_USERS: Error:', error);
      throw new Error('Failed to get active users');
    }
  }

  // Get presence stats
  async getPresenceStats(pageId) {
    try {
      console.log(`🔍 GET_STATS: Getting presence stats for page ${pageId}`);
      
      const totalUsers = await this.prisma.user_presence.count({
        where: { page_id: pageId }
      });
      
      const activeUsers = await this.prisma.user_presence.count({
        where: {
          page_id: pageId,
          is_active: true,
          last_seen: {
            gte: new Date(Date.now() - (5 * 60 * 1000)) // Last 5 minutes
          }
        }
      });
        
        return {
        totalUsers,
        activeUsers,
        pageId
      };
      
    } catch (error) {
      console.error('❌ GET_STATS: Error:', error);
      throw new Error('Failed to get presence stats');
    }
  }

  // COMP METHOD: Get active users on a page (following COMP implementation)
  async getActiveUsers(pageId, communityId = null, minutes = 0.5, currentUserId = null) {
    try {
      console.log(`🔍 PRESENCE_SERVICE: Getting active users for page: ${pageId}`);
      
      if (!this.prisma) {
        throw new Error('Prisma client not initialized');
      }

      // Calculate cutoff time
      const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));
      
      // Query user_presence table with AppUser join (COMP method)
      const activeUsers = await this.prisma.user_presence.findMany({
        where: {
          page_id: pageId,
          is_active: true,
          last_seen: {
            gte: cutoffTime
          }
        },
        include: {
          AppUser: true // Join with AppUser table to get avatarUrl and auraColor
        },
        orderBy: {
          last_seen: 'desc'
        }
      });

      console.log(`✅ PRESENCE_SERVICE: Found ${activeUsers.length} active users`);
      
      // Transform to expected format using AppUser data
      return activeUsers.map(user => ({
        id: user.AppUser?.id || user.user_id,
        userId: user.AppUser?.id || user.user_id,
        email: user.AppUser?.email || 'unknown@example.com',
        name: user.AppUser?.name || user.user_name || 'User',
        handle: user.AppUser?.handle || user.user_name || 'user',
        avatarUrl: user.AppUser?.avatarUrl || null, // Get from AppUser, not user_presence
        auraColor: user.AppUser?.auraColor || '#ffffff', // Get from AppUser, fallback to white
        lastSeen: user.last_seen,
        isActive: user.is_active,
        pageId: user.page_id,
        pageUrl: user.page_url
      }));
      
    } catch (error) {
      console.error('❌ PRESENCE_SERVICE: Error getting active users:', error);
      throw error;
    }
  }

  // COMP METHOD: Get active users across communities
  async getActiveUsersByCommunities(communityIds, minutes = 0.5, currentUserId = null) {
    try {
      console.log(`🔍 PRESENCE_SERVICE: Getting active users for communities: ${communityIds}`);
      
      if (!this.prisma) {
        throw new Error('Prisma client not initialized');
      }

      // Calculate cutoff time
      const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));
      
      // Query user_presence table for multiple communities
      const activeUsers = await this.prisma.user_presence.findMany({
        where: {
          is_active: true,
          last_seen: {
            gte: cutoffTime
          }
        },
        orderBy: {
          last_seen: 'desc'
        }
      });

      console.log(`✅ PRESENCE_SERVICE: Found ${activeUsers.length} active users across communities`);
      
      // Transform to expected format using AppUser data
      return activeUsers.map(user => ({
        id: user.AppUser?.id || user.user_id,
        userId: user.AppUser?.id || user.user_id,
        email: user.AppUser?.email || 'unknown@example.com',
        name: user.AppUser?.name || user.user_name || 'User',
        handle: user.AppUser?.handle || user.user_name || 'user',
        avatarUrl: user.AppUser?.avatarUrl || null,
        auraColor: user.AppUser?.auraColor || '#ffffff',
        lastSeen: user.last_seen,
        isActive: user.is_active,
        pageId: user.page_id,
        pageUrl: user.page_url
      }));
      
    } catch (error) {
      console.error('❌ PRESENCE_SERVICE: Error getting active users by communities:', error);
      throw error;
    }
  }
}

module.exports = PresenceService;
