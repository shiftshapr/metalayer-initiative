const { PrismaClient } = require('../generated/prisma');

class PostService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create a new post
   */
  async createPost(data) {
    try {
      const { conversationId, authorId, body, parentId, attachments, visibilityOverride } = data;

      // Use transaction to create post and update conversation timestamp
      const result = await this.prisma.$transaction(async (tx) => {
        // Create the post
        const post = await tx.post.create({
          data: {
            conversationId,
            authorId,
            body,
            parentId,
            attachments,
            visibilityOverride
          },
          include: {
            author: {
              select: { id: true, handle: true, name: true, avatarUrl: true }
            },
            parent: parentId ? {
              select: { id: true, body: true, author: { select: { handle: true } } }
            } : undefined
          }
        });

        // Update conversation's updatedAt timestamp
        await tx.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        return post;
      });

      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  /**
   * Get post by ID
   */
  async getPost(postId) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          },
          conversation: {
            select: { id: true, title: true, page: { select: { url: true } } }
          },
          parent: {
            select: { id: true, body: true, author: { select: { handle: true } } }
          },
          children: {
            include: {
              author: {
                select: { id: true, handle: true, name: true, avatarUrl: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          reactions: {
            include: {
              user: {
                select: { id: true, handle: true }
              }
            }
          },
          _count: {
            select: { reactions: true, children: true }
          }
        }
      });

      return post;
    } catch (error) {
      console.error('Error getting post:', error);
      throw new Error('Failed to get post');
    }
  }

  /**
   * Update post
   */
  async updatePost(postId, updates) {
    try {
      const post = await this.prisma.post.update({
        where: { id: postId },
        data: {
          ...updates,
          editedAt: new Date()
        },
        include: {
          author: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          }
        }
      });

      return post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }
  }

  /**
   * Delete post (soft delete)
   */
  async deletePost(postId) {
    try {
      const post = await this.prisma.post.update({
        where: { id: postId },
        data: { 
          deletedAt: new Date(),
          body: '[Deleted]'
        }
      });

      return post;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  /**
   * Get posts for a conversation
   */
  async getConversationPosts(conversationId, filters = {}) {
    try {
      const where = {
        conversationId,
        deletedAt: null, // Only show non-deleted posts
        ...(filters.parentId !== undefined && { parentId: filters.parentId })
      };

      const posts = await this.prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          },
          parent: {
            select: { id: true, body: true, author: { select: { handle: true } } }
          },
          reactions: {
            include: {
              user: {
                select: { id: true, handle: true }
              }
            }
          },
          _count: {
            select: { reactions: true, children: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: filters.limit || 100,
        skip: filters.offset || 0
      });

      return posts;
    } catch (error) {
      console.error('Error getting conversation posts:', error);
      throw new Error('Failed to get conversation posts');
    }
  }

  /**
   * Get posts by author
   */
  async getPostsByAuthor(authorId, filters = {}) {
    try {
      const where = {
        authorId,
        deletedAt: null,
        ...(filters.conversationId && { conversationId: filters.conversationId })
      };

      const posts = await this.prisma.post.findMany({
        where,
        include: {
          conversation: {
            select: { id: true, title: true, page: { select: { url: true } } }
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
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      });

      return posts;
    } catch (error) {
      console.error('Error getting posts by author:', error);
      throw new Error('Failed to get posts by author');
    }
  }
}

module.exports = PostService;







