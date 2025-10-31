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
      // Normalize and validate inputs to prevent malformed users
      const emailCandidate = (email ?? '').toString();
      // If multiple header values were merged, Node may present them comma-separated
      let normalizedEmail = emailCandidate.includes(',') ? emailCandidate.split(',')[0] : emailCandidate;
      normalizedEmail = normalizedEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!normalizedEmail || normalizedEmail === 'null' || normalizedEmail === 'undefined' || !emailRegex.test(normalizedEmail)) {
        normalizedEmail = null;
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const normalizedId = (typeof id === 'string' && uuidRegex.test(id)) ? id : null;
      
      // Must have either email or id to create/find user
      if (!normalizedEmail && !normalizedId) {
        throw new Error('Email or ID is required to get or create user');
      }
      
      // Try to find user by ID first (if provided), then by email
      let user = null;
      
      if (normalizedId) {
        try {
          user = await this.prisma.AppUser.findUnique({
            where: { id: normalizedId }
          });
        } catch (idError) {
          // ID might be invalid format, ignore and continue
          console.log('Invalid user ID format, trying email lookup');
        }
      }
      
      // If not found by ID and we have an email, try by email
      if (!user && normalizedEmail) {
        user = await this.prisma.AppUser.findUnique({
          where: { email: normalizedEmail }
        });
      }

      if (!user) {
        // Generate unique handle
        let userHandle = handle || (normalizedEmail ? normalizedEmail.split('@')[0] : 'user');
        let counter = 1;
        
        // Check if handle exists and make it unique
        while (true) {
          const existingUser = await this.prisma.AppUser.findUnique({
            where: { handle: userHandle }
          });
          if (!existingUser) break;
          userHandle = `${handle || (normalizedEmail ? normalizedEmail.split('@')[0] : 'user')}${counter}`;
          counter++;
        }

        // Create new user with only the fields that exist in the schema
        // Use provided ID or generate a UUID
        const userName = name || (normalizedEmail ? normalizedEmail.split('@')[0] : 'User');
        const userData = {
          id: normalizedId || require('crypto').randomUUID(),
          email: normalizedEmail || null, // Save email if available, null if not
          name: userName,
          handle: userHandle,
          avatarUrl: (avatarUrl && avatarUrl.trim() !== '') ? avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=96`,
          auraColor: auraColor || null,
          isVerified: false,
          isSuperAdmin: false,
          updatedAt: new Date()
        };
        
        user = await this.prisma.AppUser.create({
          data: userData
        });
      } else {
        // User exists, but update avatar URL if we have a new one
        if (avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== user.avatarUrl) {
          user = await this.prisma.AppUser.update({
            where: { id: user.id },
            data: { avatarUrl, updatedAt: new Date() }
          });
        } else if (!user.avatarUrl || user.avatarUrl.trim() === '') {
          // If user has no avatarUrl, generate one using ui-avatars.com
          const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email.split('@')[0])}&background=random&color=fff&size=96`;
          user = await this.prisma.AppUser.update({
            where: { id: user.id },
            data: { avatarUrl: fallbackAvatarUrl, updatedAt: new Date() }
          });
        }
        
        // Update aura color if provided
        if (auraColor !== undefined && user.auraColor !== auraColor) {
          user = await this.prisma.AppUser.update({
            where: { id: user.id },
            data: { auraColor, updatedAt: new Date() }
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
      const user = await this.prisma.AppUser.findUnique({
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
      const user = await this.prisma.AppUser.update({
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
   * Update user's avatar URL
   */
  async updateAvatarUrl(email, avatarUrl) {
    try {
      console.log(`🔍 USER SERVICE: Updating avatar URL for user ${email} to: ${avatarUrl}`);
      
      const user = await this.prisma.AppUser.update({
        where: { email },
        data: { avatarUrl, updatedAt: new Date() }
      });
      
      console.log(`✅ USER SERVICE: Avatar URL updated successfully for user ${email}`);
      return user;
    } catch (error) {
      console.error('Error updating avatar URL:', error);
      throw new Error('Failed to update avatar URL');
    }
  }

  /**
   * Update user's aura color
   */
  async updateAuraColor(userId, auraColor) {
    try {
      const user = await this.prisma.AppUser.update({
        where: { id: userId },
        data: { auraColor, updatedAt: new Date() }
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
      
      const user = await this.prisma.AppUser.update({
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
      
      const user = await this.prisma.AppUser.update({
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
