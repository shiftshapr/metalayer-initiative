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
      const { userId, kind, conversationId, postId, emoji } = data;

      // Validate that at least one target is specified
      if (!conversationId && !postId) {
        throw new Error('At least one of conversationId or postId must be specified');
      }

      // Check for existing reaction
      const existing = await this.prisma.reaction.findFirst({
        where: {
          userId,
          conversationId: conversationId || null,
          postId: postId || null
        }
      });

      if (existing) {
        if (existing.kind === kind) {
          // Remove reaction if same kind
          await this.prisma.reaction.delete({
            where: { id: existing.id }
          });
          return { action: 'removed', reaction: null };
        } else {
          // Update reaction if different kind or emoji
          const updated = await this.prisma.reaction.update({
            where: { id: existing.id },
            data: { kind, emoji }
          });
          return { action: 'updated', reaction: updated };
        }
      } else {
        // Create new reaction
        const reaction = await this.prisma.reaction.create({
          data: {
            userId,
            kind,
            emoji,
            conversationId: conversationId || null,
            postId: postId || null
          },
          include: {
            user: {
              select: { id: true, handle: true, name: true, avatarUrl: true }
            }
          }
        });
        return { action: 'created', reaction };
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
      const where = targetType === 'post' 
        ? { postId: targetId }
        : { conversationId: targetId };

      const reactions = await this.prisma.reaction.findMany({
        where,
        include: {
          user: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: 'asc' }
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





