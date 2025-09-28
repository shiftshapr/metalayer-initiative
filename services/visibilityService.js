const { PrismaClient } = require('../generated/prisma');

class VisibilityService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Set user visibility for a specific URL
  async setUserVisibility(userId, url, isVisible) {
    try {
      console.log(`🔍 VISIBILITY SERVICE: Setting visibility for user ${userId} on URL ${url} to ${isVisible}`);
      
      const visibility = await this.prisma.userVisibility.upsert({
        where: {
          user_url_visibility: {
            userId,
            url
          }
        },
        update: {
          isVisible,
          updatedAt: new Date()
        },
        create: {
          userId,
          url,
          isVisible
        }
      });

      console.log(`🔍 VISIBILITY SERVICE: Visibility set successfully:`, visibility);
      return visibility;
    } catch (error) {
      console.error('Error setting user visibility:', error);
      throw new Error('Failed to set user visibility');
    }
  }

  // Get user's visibility for a specific URL
  async getUserVisibility(userId, url) {
    try {
      const visibility = await this.prisma.userVisibility.findUnique({
        where: {
          user_url_visibility: {
            userId,
            url
          }
        }
      });

      return visibility;
    } catch (error) {
      console.error('Error getting user visibility:', error);
      throw new Error('Failed to get user visibility');
    }
  }

  // Get all URLs where user is visible
  async getVisibleUrls(userId) {
    try {
      const visibleUrls = await this.prisma.userVisibility.findMany({
        where: {
          userId,
          isVisible: true
        },
        select: {
          url: true,
          updatedAt: true
        }
      });

      return visibleUrls;
    } catch (error) {
      console.error('Error getting visible URLs:', error);
      throw new Error('Failed to get visible URLs');
    }
  }

  // Get all users visible on a specific URL with search and pagination
  async getVisibleUsersOnUrl(url, searchTerm = '', limit = null, offset = 0) {
    try {
      console.log(`🔍 VISIBILITY SERVICE: Getting visible users for URL: ${url}, search: "${searchTerm}", limit: ${limit}, offset: ${offset}`);
      
      const whereClause = {
        url,
        isVisible: true
      };

      // Add search filter if provided
      if (searchTerm) {
        whereClause.user = {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { handle: { contains: searchTerm, mode: 'insensitive' } },
            { headline: { contains: searchTerm, mode: 'insensitive' } }
          ]
        };
        console.log(`🔍 VISIBILITY SERVICE: Applied search filter for term: "${searchTerm}"`);
      }

      const visibleUsers = await this.prisma.userVisibility.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              handle: true,
              name: true,
              email: true,
              avatarUrl: true,
              auraColor: true,
              headline: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: limit || undefined, // Only apply limit if specified
        skip: offset
      });

      const mappedUsers = visibleUsers.map(v => ({
        userId: v.user.id,
        name: v.user.name || v.user.handle,
        email: v.user.email,
        avatarUrl: v.user.avatarUrl,
        auraColor: v.user.auraColor,
        headline: v.user.headline
      }));

      console.log(`🔍 VISIBILITY SERVICE: Found ${mappedUsers.length} visible users (${limit ? `limited to ${limit}` : 'no limit'})`);
      return mappedUsers;
    } catch (error) {
      console.error('Error getting visible users on URL:', error);
      throw new Error('Failed to get visible users on URL');
    }
  }

  // Update user's default visibility preference
  async updateDefaultVisibility(userId, defaultVisibility) {
    try {
      const user = await this.prisma.appUser.update({
        where: { id: userId },
        data: { defaultVisibility }
      });

      return user;
    } catch (error) {
      console.error('Error updating default visibility:', error);
      throw new Error('Failed to update default visibility');
    }
  }

  // Get user's default visibility preference
  async getDefaultVisibility(userId) {
    try {
      const user = await this.prisma.appUser.findUnique({
        where: { id: userId },
        select: { defaultVisibility: true }
      });

      return user?.defaultVisibility || false;
    } catch (error) {
      console.error('Error getting default visibility:', error);
      throw new Error('Failed to get default visibility');
    }
  }
}

module.exports = VisibilityService;
