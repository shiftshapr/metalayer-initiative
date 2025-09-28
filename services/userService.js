const { PrismaClient } = require('../generated/prisma');

class UserService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Get or create user by ID
   */
  async getOrCreateUser(userData) {
    try {
      const { id, email, name, handle, avatarUrl, auraColor } = userData;
      
      // Must have email to create/find user
      if (!email) {
        throw new Error('Email is required to get or create user');
      }
      
      // First try to find by email (since that's more reliable)
      let user = null;
      user = await this.prisma.appUser.findUnique({
        where: { email }
      });
      
      // If not found by email and we have an ID, try by ID
      if (!user && id) {
        try {
          user = await this.prisma.appUser.findUnique({
            where: { id }
          });
        } catch (idError) {
          // ID might be invalid format, ignore and continue
          console.log('Invalid user ID format, continuing with email lookup');
        }
      }

      if (!user) {
        // Generate unique handle
        let userHandle = handle || email.split('@')[0];
        let counter = 1;
        
        // Check if handle exists and make it unique
        while (true) {
          const existingUser = await this.prisma.appUser.findUnique({
            where: { handle: userHandle }
          });
          if (!existingUser) break;
          userHandle = `${handle || email.split('@')[0]}${counter}`;
          counter++;
        }

        // Create new user with only the fields that exist in the schema
        // Use the provided ID if it's a valid UUID, otherwise let Prisma generate one
        const userData = {
          email,
          name: name || email.split('@')[0],
          handle: userHandle,
          avatarUrl: avatarUrl || null,
          auraColor: auraColor || null,
          isVerified: false,
          isSuperAdmin: false
        };
        
        // Only use the provided ID if it's a valid UUID format
        if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          userData.id = id;
        }
        
        user = await this.prisma.appUser.create({
          data: userData
        });
      } else {
        // User exists, but update avatar URL if we have a new one and the current one is null
        if (avatarUrl && !user.avatarUrl) {
          user = await this.prisma.appUser.update({
            where: { id: user.id },
            data: { avatarUrl }
          });
        }
        
        // Update aura color if provided
        if (auraColor !== undefined && user.auraColor !== auraColor) {
          user = await this.prisma.appUser.update({
            where: { id: user.id },
            data: { auraColor }
          });
        }
      }

      return user;
    } catch (error) {
      console.error('Error getting/creating user:', error);
      throw new Error('Failed to get/create user');
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    try {
      const user = await this.prisma.appUser.findUnique({
        where: { id: userId }
      });

      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    try {
      const user = await this.prisma.appUser.update({
        where: { id: userId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Update user's aura color
   */
  async updateAuraColor(userId, auraColor) {
    try {
      const user = await this.prisma.appUser.update({
        where: { id: userId },
        data: { auraColor }
      });
      return user;
    } catch (error) {
      console.error('Error updating aura color:', error);
      throw new Error('Failed to update aura color');
    }
  }

  // Update user's headline
  async updateHeadline(userId, headline) {
    try {
      console.log(`🔍 USER SERVICE: Updating headline for user ${userId} to: "${headline}"`);
      
      const user = await this.prisma.appUser.update({
        where: { id: userId },
        data: { headline }
      });
      
      console.log(`🔍 USER SERVICE: Headline updated successfully for user ${userId}`);
      return user;
    } catch (error) {
      console.error('Error updating headline:', error);
      throw new Error('Failed to update headline');
    }
  }

  // Update user's display visibility after exit
  async updateDisplayVisibilityAfterExit(userId, days) {
    try {
      console.log(`🔍 USER SERVICE: Updating display visibility after exit for user ${userId} to ${days} days`);
      
      const user = await this.prisma.appUser.update({
        where: { id: userId },
        data: { displayVisibilityAfterExit: days }
      });
      
      console.log(`🔍 USER SERVICE: Display visibility after exit updated successfully for user ${userId}`);
      return user;
    } catch (error) {
      console.error('Error updating display visibility after exit:', error);
      throw new Error('Failed to update display visibility after exit');
    }
  }
}

module.exports = UserService;
