const { PrismaClient } = require('../generated/prisma');

class ConversationService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create a new conversation
   */
  async createConversation(data) {
    try {
      const { pageId, anchorId, visibility, title, body, createdById, tags = [], communityId } = data;

      const conversation = await this.prisma.conversation.create({
        data: {
          pageId,
          anchorId,
          visibility,
          title,
          tags,
          communityId,
          createdById,
          posts: body ? {
            create: [{
              authorId: createdById,
              body
            }]
          } : undefined
        },
        include: {
          page: true,
          anchor: true,
          createdBy: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          },
          posts: {
            include: {
              author: {
                select: { id: true, handle: true, name: true, avatarUrl: true }
              }
            }
          }
        }
      });

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  /**
   * Get conversation by ID with posts
   */
  async getConversation(conversationId, includePosts = true) {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          page: true,
          anchor: true,
          createdBy: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          },
          posts: includePosts ? {
            include: {
              author: {
                select: { id: true, handle: true, name: true, avatarUrl: true }
              },
              reactions: {
                include: {
                  user: {
                    select: { id: true, handle: true }
                  }
                }
              },
              _count: {
                select: { reactions: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          } : false,
          reactions: {
            include: {
              user: {
                select: { id: true, handle: true }
              }
            }
          },
          _count: {
            select: { posts: true, reactions: true }
          }
        }
      });

      return conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw new Error('Failed to get conversation');
    }
  }

  /**
   * Update conversation
   */
  async updateConversation(conversationId, updates) {
    try {
      const conversation = await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          page: true,
          anchor: true,
          createdBy: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          }
        }
      });

      return conversation;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw new Error('Failed to update conversation');
    }
  }

  /**
   * Delete conversation (soft delete by setting status)
   */
  async deleteConversation(conversationId) {
    try {
      const conversation = await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { 
          status: 'ARCHIVED',
          updatedAt: new Date()
        }
      });

      return conversation;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  /**
   * Get conversations with filters
   */
  async getConversations(filters = {}) {
    try {
      const where = {
        ...(filters.pageId && { pageId: filters.pageId }),
        ...(filters.anchorId && { anchorId: filters.anchorId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.visibility && { visibility: filters.visibility }),
        ...(filters.createdById && { createdById: filters.createdById }),
        ...(filters.communityId && { communityId: filters.communityId }),
        ...(filters.tags && { tags: { hasSome: filters.tags } })
      };

      const conversations = await this.prisma.conversation.findMany({
        where,
        include: {
          page: true,
          anchor: true,
          createdBy: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          },
          posts: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: { id: true, handle: true, name: true, avatarUrl: true }
              }
            }
          },
          reactions: {
            include: {
              user: {
                select: { id: true, handle: true }
              }
            }
          },
          _count: {
            select: { posts: true, reactions: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      return conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw new Error('Failed to get conversations');
    }
  }
}

module.exports = ConversationService;





