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
      
      // Determine if userId is an email or UUID
      const isEmail = userId && userId.includes('@');
      const isUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      let user;
      
      // Validate userId
      if (!userId || userId === 'null' || userId === '' || (!isEmail && !isUUID)) {
        throw new Error('Invalid userId: must be a valid email address or UUID');
      }
      
      if (isEmail) {
        // userId is an email - find by email; DO NOT auto-create here
        user = await this.prisma.AppUser.findUnique({
          where: { email: userId }
        });
        if (!user) {
          // Only Chrome-auth flow may create users; presence must not create users
          throw new Error('Unauthorized: user not found. Authenticate via Chrome to provision account.');
        }
      } else if (isUUID) {
        // userId is a UUID - find by id
        user = await this.prisma.AppUser.findUnique({
          where: { id: userId }
        });
        
        if (!user) {
          console.error(`❌ PRESENCE_EVENT: User with UUID ${userId} not found in database`);
          throw new Error(`User with UUID ${userId} not found`);
        }
      }
      
      // Determine if user is active based on event kind
      const isActive = kind === 'ENTER';
      
      // Upsert UserPresence record using UUID foreign key
      let userPresence;
      try {
        userPresence = await this.prisma.user_presence.upsert({
          where: {
            user_id_page_id: {
              user_id: user.id,
              page_id: pageId
            }
          },
          update: {
            is_active: isActive,
            last_seen: new Date(),
            page_url: pageUrl || pageId,
            user_name: user.name || user.email?.split('@')[0] || 'User'
          },
          create: {
            user_id: user.id,
            user_name: user.name || user.email?.split('@')[0] || 'User',
            page_id: pageId,
            page_url: pageUrl || pageId,
            is_active: isActive,
            last_seen: new Date()
          }
        });
      } catch (prismaError) {
        // Fallback path for schema differences (e.g., missing composite unique)
        console.error('⚠️ Prisma upsert failed:', { code: prismaError.code, message: prismaError.message });

        // First try a minimal column path (only required columns), attempting with page_url then without
        try {
          const existingMin = await this.prisma.user_presence.findFirst({
            where: { user_id: user.id, page_id: pageId }
          });
          if (existingMin) {
            try {
              userPresence = await this.prisma.user_presence.update({
                where: { id: existingMin.id },
                data: {
                  is_active: isActive,
                  last_seen: new Date(),
                  page_url: pageUrl || pageId
                }
              });
            } catch (updateWithUrlError) {
              console.error('⚠️ Update with page_url failed, retrying without page_url:', { code: updateWithUrlError.code, message: updateWithUrlError.message });
              userPresence = await this.prisma.user_presence.update({
                where: { id: existingMin.id },
                data: {
                  is_active: isActive,
                  last_seen: new Date()
                }
              });
            }
          } else {
            try {
              userPresence = await this.prisma.user_presence.create({
                data: {
                  user_id: user.id,
                  page_id: pageId,
                  page_url: pageUrl || pageId,
                  is_active: isActive,
                  last_seen: new Date()
                }
              });
            } catch (createWithUrlError) {
              console.error('⚠️ Create with page_url failed, retrying without page_url:', { code: createWithUrlError.code, message: createWithUrlError.message });
              userPresence = await this.prisma.user_presence.create({
                data: {
                  user_id: user.id,
                  page_id: pageId,
                  is_active: isActive,
                  last_seen: new Date()
                }
              });
            }
          }
        } catch (minimalError) {
          console.error('⚠️ Minimal-path write failed:', { code: minimalError.code, message: minimalError.message });

          // As a last resort, try extended fields via find/update/create
          const existing = await this.prisma.user_presence.findFirst({
            where: { user_id: user.id, page_id: pageId }
          });

          if (existing) {
            userPresence = await this.prisma.user_presence.update({
              where: { id: existing.id },
              data: {
                is_active: isActive,
                last_seen: new Date(),
                page_url: pageUrl || pageId,
                user_name: user.name || user.email?.split('@')[0] || 'User'
              }
            });
          } else {
            userPresence = await this.prisma.user_presence.create({
              data: {
                user_id: user.id,
                user_name: user.name || user.email?.split('@')[0] || 'User',
                page_id: pageId,
                page_url: pageUrl || pageId,
                is_active: isActive,
                last_seen: new Date()
              }
            });
          }
        }
      }
      
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
      // Re-throw original error so the route can surface details
      throw error;
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

  // COMP METHOD: Get active users on a page (following COMP implementation)
  // ROOT CAUSE FIX: Uses dual cutoff times (30s for active, 24h for recently seen)
  async getActiveUsers(pageId, communityId = null, minutes = 0.5, currentUserId = null) {
    try {
      console.log(`🔍 PRESENCE_SERVICE: Getting active users for page: ${pageId}, communityId: ${communityId}`);
      
      if (!this.prisma) {
        throw new Error('Prisma client not initialized');
      }

      // ROOT CAUSE FIX: Use two separate cutoff times
      // - activeCutoffTime: Short window (30 seconds) for truly active users
      // - recentlySeenCutoffTime: Longer window (24 hours) for "Last seen X ago" users
      const activeCutoffTime = new Date(Date.now() - (minutes * 60 * 1000)); // Short cutoff for active status
      const recentlySeenCutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours for recently seen
      
      // ROOT CAUSE FIX: Query ALL users for this page seen within 24 hours
      // This ensures both profiles can see each other even if one's presence is slightly stale
      // CRITICAL: Convert to ISO string for Prisma date comparison (Prisma requires ISO string for gte)
      const recentlySeenCutoffTimeISO = recentlySeenCutoffTime.toISOString();
      
      console.log(`🔍 PRESENCE_SERVICE: Query filters - pageId: ${pageId}, cutoffTime: ${recentlySeenCutoffTimeISO}`);
      
      // ROOT CAUSE FIX: Build whereClause - start simple, add filters conditionally
      let whereClause = {
        page_id: pageId
      };
      
      // Only add date filter if we want it (can be disabled for debugging)
      whereClause.last_seen = {
        gte: recentlySeenCutoffTimeISO
      };
      
      if (communityId) {
        whereClause.community_id = communityId;
      }
      
      // ROOT CAUSE FIX: Try query with and without date filter to diagnose issue
      // First, query without date filter to see if pageId matching works
      let allUsersOnPageNoFilter = [];
      try {
        allUsersOnPageNoFilter = await this.prisma.user_presence.findMany({
          where: {
            page_id: pageId,
            ...(communityId && { community_id: communityId })
          },
          include: {
            AppUser: true
          },
          orderBy: {
            last_seen: 'desc'
          }
        });
        console.log(`🔍 PRESENCE_SERVICE: Query WITHOUT date filter found ${allUsersOnPageNoFilter.length} users`);
      } catch (error) {
        console.error(`❌ PRESENCE_SERVICE: Query without date filter failed:`, error);
      }
      
      // Now query WITH date filter
      let allUsersOnPage = [];
      try {
        allUsersOnPage = await this.prisma.user_presence.findMany({
          where: whereClause,
          include: {
            AppUser: true // Join with AppUser table to get avatarUrl and auraColor
          },
          orderBy: {
            last_seen: 'desc'
          }
        });
        console.log(`🔍 PRESENCE_SERVICE: Query WITH date filter found ${allUsersOnPage.length} users`);
      } catch (error) {
        console.error(`❌ PRESENCE_SERVICE: Query with date filter failed:`, error);
        // If date filter query fails, use no-filter results
        allUsersOnPage = allUsersOnPageNoFilter;
      }
      
      // ROOT CAUSE FIX: Compare results to diagnose date filter issue
      if (allUsersOnPageNoFilter.length > 0 && allUsersOnPage.length === 0) {
        console.warn(`⚠️ PRESENCE_SERVICE: Date filter is excluding all users!`);
        console.warn(`   Found ${allUsersOnPageNoFilter.length} users without date filter`);
        console.warn(`   Found ${allUsersOnPage.length} users with date filter`);
        console.warn(`   Cutoff time: ${recentlySeenCutoffTimeISO}`);
        allUsersOnPageNoFilter.forEach((u, idx) => {
          const lastSeen = u.last_seen ? new Date(u.last_seen) : null;
          const diffMs = lastSeen ? (Date.now() - lastSeen.getTime()) : null;
          const diffHours = diffMs ? Math.floor(diffMs / (60 * 60 * 1000)) : null;
          const cutoffTime = new Date(recentlySeenCutoffTimeISO);
          const passesFilter = lastSeen && lastSeen >= cutoffTime;
          console.warn(`   User ${idx + 1}: last_seen=${u.last_seen}, diff=${diffHours}h, passesFilter=${passesFilter}`);
        });
        
        // ROOT CAUSE FIX: If date filter fails, fall back to returning all users on page (within reason)
        // But still filter by a longer window (7 days) to avoid returning very old records
        const fallbackCutoff = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)); // 7 days
        const fallbackUsers = allUsersOnPageNoFilter.filter(u => {
          if (!u.last_seen) return false;
          const lastSeen = new Date(u.last_seen);
          return lastSeen >= fallbackCutoff;
        });
        
        if (fallbackUsers.length > 0) {
          console.warn(`⚠️ PRESENCE_SERVICE: Using fallback query (7-day window) - found ${fallbackUsers.length} users`);
          // Use fallback users but still apply the normal filtering/transformation
          allUsersOnPage = fallbackUsers;
        } else if (allUsersOnPageNoFilter.length > 0) {
          // CRITICAL FIX: If even 7-day filter excludes users but they exist, use them anyway (likely date format issue)
          console.warn(`⚠️ PRESENCE_SERVICE: Date filtering seems broken, using all users found (${allUsersOnPageNoFilter.length} users)`);
          allUsersOnPage = allUsersOnPageNoFilter;
        }
      } else if (allUsersOnPageNoFilter.length === 0 && allUsersOnPage.length === 0) {
        // Both queries return 0 - likely no users on this page or pageId mismatch
        console.warn(`⚠️ PRESENCE_SERVICE: Both queries returned 0 users for pageId: ${pageId}`);
        console.warn(`   This suggests either:`);
        console.warn(`   1. No users have presence records for this pageId`);
        console.warn(`   2. pageId mismatch between frontend and database`);
        console.warn(`   3. All users' last_seen is older than cutoff`);
      }

      console.log(`✅ PRESENCE_SERVICE: Found ${allUsersOnPage.length} total users on page (seen within 24h)`);
      
      // ROOT CAUSE FIX: Enhanced debugging to diagnose why API returns 0 when DB has users
      if (allUsersOnPage.length === 0) {
        console.warn(`⚠️ PRESENCE_SERVICE: Query returned 0 users but database might have users for pageId: ${pageId}`);
        console.warn(`   Cutoff time: ${recentlySeenCutoffTimeISO}`);
        console.warn(`   Current time: ${new Date().toISOString()}`);
        console.warn(`   This suggests either:`);
        console.warn(`   1. No users on this page`);
        console.warn(`   2. All users' last_seen is older than 24 hours`);
        console.warn(`   3. pageId mismatch between query and database`);
      } else {
        allUsersOnPage.forEach((u, idx) => {
          const appUserId = u.AppUser?.id || u.user_id;
          const userName = u.AppUser?.name || u.user_name || 'Unknown';
          const lastSeen = u.last_seen ? new Date(u.last_seen) : null;
          const diffMs = lastSeen ? (Date.now() - lastSeen.getTime()) : null;
          const diffMinutes = diffMs ? Math.floor(diffMs / 60000) : null;
          const diffHours = diffMs ? Math.floor(diffMs / (60 * 60 * 1000)) : null;
          const within24h = diffMs && diffMs < (24 * 60 * 60 * 1000);
          console.log(`   User ${idx + 1}: ${userName} (${appUserId})`);
          console.log(`     last_seen: ${u.last_seen}`);
          console.log(`     Minutes ago: ${diffMinutes}, Hours ago: ${diffHours}`);
          console.log(`     Within 24h: ${within24h ? '✅ YES' : '❌ NO'}`);
          console.log(`     is_active: ${u.is_active}`);
          console.log(`     AppUser present: ${u.AppUser ? '✅ YES' : '❌ NO'}`);
        });
      }
      
      // ROOT CAUSE FIX: Transform ALL users found (all are within recently seen window)
      // Determine status based on is_active and activeCutoffTime
      // CRITICAL: Filter out users without AppUser (orphaned presence records) but log them
      const validUsers = allUsersOnPage.filter(user => {
        if (!user.AppUser && !user.user_id) {
          console.warn(`⚠️ PRESENCE_SERVICE: Skipping presence record without AppUser or user_id:`, user);
          return false;
        }
        return true;
      });
      
      if (validUsers.length < allUsersOnPage.length) {
        console.warn(`⚠️ PRESENCE_SERVICE: Filtered out ${allUsersOnPage.length - validUsers.length} invalid presence records (no AppUser)`);
      }
      
      return validUsers.map(user => {
        // ROOT CAUSE FIX: Ensure last_seen is a Date object for comparison
        const lastSeenDate = user.last_seen ? (user.last_seen instanceof Date ? user.last_seen : new Date(user.last_seen)) : null;
        
        // User is truly active if: is_active=true AND last_seen within short cutoff (30 seconds)
        const isActive = user.is_active && lastSeenDate && lastSeenDate >= activeCutoffTime;
        
        // User is recently seen if: last_seen within 24 hours (already filtered by query)
        // Since query filters by last_seen >= recentlySeenCutoffTime, all returned users should be recently seen
        const isRecentlySeen = lastSeenDate && lastSeenDate >= recentlySeenCutoffTime;
        
        // ROOT CAUSE FIX: Determine status - all users returned are within 24h, so they're either active or recently seen
        // CRITICAL: Always set status explicitly - never leave it undefined
        let status;
        if (isActive) {
          status = 'online';
        } else if (isRecentlySeen && lastSeenDate) {
          status = 'recently_seen'; // Will show "Last seen X ago"
        } else {
          // This shouldn't happen since query filters by last_seen, but handle gracefully
          console.warn(`⚠️ PRESENCE_SERVICE: User ${user.user_id} has invalid last_seen but was returned by query`);
          status = 'offline';
        }
        
        // ROOT CAUSE FIX: Ensure enterTime is set for active users (needed for "Online for X" display)
        const enterTime = user.enter_time || user.last_seen;
        
        // ROOT CAUSE FIX: Handle missing AppUser gracefully - use user_presence data as fallback
        const appUserId = user.AppUser?.id || user.user_id;
        const userResult = {
          id: appUserId,
          userId: appUserId,
          email: user.AppUser?.email || 'unknown@example.com',
          name: user.AppUser?.name || user.user_name || 'User',
          handle: user.AppUser?.handle || user.user_name || 'user',
          avatarUrl: user.AppUser?.avatarUrl || null, // Get from AppUser, not user_presence
          auraColor: user.AppUser?.auraColor || '#ffffff', // Get from AppUser, fallback to white
          lastSeen: user.last_seen,
          isActive: isActive, // ROOT CAUSE FIX: True only if active AND within short cutoff
          pageId: user.page_id,
          pageUrl: user.page_url,
          enterTime: enterTime, // ROOT CAUSE FIX: Include enterTime for "Online for X" display
          status: status // ROOT CAUSE FIX: 'online', 'recently_seen', or 'offline' - ALWAYS defined
        };
        
        // Debug logging to verify status is set
        if (!status || status === undefined) {
          console.error(`❌ PRESENCE_SERVICE: Status is undefined for user ${userResult.id} (${userResult.name})`);
          console.error(`   isActive: ${isActive}, isRecentlySeen: ${isRecentlySeen}, lastSeenDate: ${lastSeenDate}`);
        }
        
        return userResult;
      });
      
    } catch (error) {
      console.error('❌ PRESENCE_SERVICE: Error getting active users:', error);
      throw error;
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
