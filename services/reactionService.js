const { PrismaClient } = require('../generated/prisma');

class ReactionService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Toggle reaction on a post or conversation
   */
  async toggleReaction(data) {
    try {
      const { userId, userEmail, kind, conversationId, postId, emoji } = data;

      // Validate that at least one target is specified
      if (!conversationId && !postId) {
        throw new Error('At least one of conversationId or postId must be specified');
      }

      // Get user ID from email if not provided
      let actualUserId = userId;
      if (!actualUserId && userEmail) {
        const user = await this.prisma.appUser.findUnique({
          where: { email: userEmail },
          select: { id: true }
        });
        if (!user) {
          throw new Error('User not found');
        }
        actualUserId = user.id;
      }

      // Check for existing reaction
      console.log('🔍 REACTION SERVICE: Looking for existing reaction for user:', actualUserId, 'message:', postId);
      console.log('🔍 REACTION SERVICE: Query parameters:', { user_id: actualUserId, message_id: postId });
      
      const existing = await this.prisma.reactions.findFirst({
        where: {
          user_id: actualUserId,
          message_id: postId
        }
      });

      console.log('🔍 REACTION SERVICE: Existing reaction found:', existing);
      console.log('🔍 REACTION SERVICE: Query result type:', typeof existing);
      console.log('🔍 REACTION SERVICE: Query result length:', existing ? Object.keys(existing).length : 'null');

      if (existing) {
        if (existing.emoji === emoji) {
          // Remove reaction if same emoji
          console.log('🔍 REACTION SERVICE: Same emoji, removing reaction');
          await this.prisma.reactions.delete({
            where: { id: existing.id }
          });
          return { action: 'removed', reaction: null };
        } else {
          // Update reaction if different emoji
          console.log('🔍 REACTION SERVICE: Different emoji, replacing reaction');
          const updated = await this.prisma.reactions.update({
            where: { id: existing.id },
            data: { emoji: emoji }
          });
          return { action: 'replaced', reaction: updated };
        }
      } else {
        // Create new reaction
        console.log('🔍 REACTION SERVICE: No existing reaction, creating new one');
        const reaction = await this.prisma.reactions.create({
          data: {
            message_id: postId,
            emoji: emoji,
            user_id: actualUserId
          }
        });
        return { action: 'added', reaction };
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw new Error('Failed to toggle reaction');
    }
  }

  /**
   * Get reactions for a post or conversation
   */
  async getReactions(targetId, targetType) {
    try {
      const reactions = await this.prisma.reactions.findMany({
        where: {
          message_id: targetId
        },
        orderBy: { created_at: 'asc' }
      });

      // Return flat array for frontend compatibility
      return reactions;
    } catch (error) {
      console.error('Error getting reactions:', error);
      throw new Error('Failed to get reactions');
    }
  }

  /**
   * Get user's reaction on a target
   */
  async getUserReaction(userId, targetId, targetType) {
    try {
      const where = {
        userId,
        ...(targetType === 'post' 
          ? { postId: targetId }
          : { conversationId: targetId })
      };

      const reaction = await this.prisma.reaction.findFirst({
        where,
        include: {
          user: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          }
        }
      });

      return reaction;
    } catch (error) {
      console.error('Error getting user reaction:', error);
      throw new Error('Failed to get user reaction');
    }
  }

  /**
   * Get reaction counts for multiple targets
   */
  async getReactionCounts(targets) {
    try {
      const results = {};

      for (const target of targets) {
        const where = target.type === 'post' 
          ? { postId: target.id }
          : { conversationId: target.id };

        const counts = await this.prisma.reaction.groupBy({
          by: ['kind'],
          where,
          _count: { kind: true }
        });

        results[target.id] = counts.reduce((acc, count) => {
          acc[count.kind] = count._count.kind;
          return acc;
        }, {});
      }

      return results;
    } catch (error) {
      console.error('Error getting reaction counts:', error);
      throw new Error('Failed to get reaction counts');
    }
  }

  /**
   * Delete reaction by ID
   */
  async deleteReaction(reactionId) {
    try {
      const reaction = await this.prisma.reaction.delete({
        where: { id: reactionId }
      });

      return reaction;
    } catch (error) {
      console.error('Error deleting reaction:', error);
      throw new Error('Failed to delete reaction');
    }
  }
}

module.exports = ReactionService;





