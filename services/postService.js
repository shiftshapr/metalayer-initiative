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
            AppUser: {
              select: { id: true, handle: true, name: true, avatarUrl: true }
            },
            Post: parentId ? {
              select: { id: true, body: true, AppUser: { select: { handle: true } } }
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
            AppUser: {
              select: { id: true, handle: true, name: true, avatarUrl: true }
            },
            Conversation: {
              select: { id: true, title: true, Page: { select: { url: true } } }
            },
            Post: {
              select: { id: true, body: true, AppUser: { select: { handle: true } } }
            },
            other_Post: {
              include: {
                AppUser: {
                  select: { id: true, handle: true, name: true, avatarUrl: true }
                }
              },
              orderBy: { createdAt: 'asc' }
            },
            Reaction: {
              include: {
                AppUser: {
                  select: { id: true, handle: true }
                }
              }
            },
            _count: {
              select: { Reaction: true, other_Post: true }
            }
          }
      });

      return post;
    } catch (error) {
      console.error('Error getting post:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      });
      throw new Error(`Failed to get post: ${error.message}`);
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
          AppUser: {
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
          AppUser: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          },
          Post: {
            select: { id: true, body: true, AppUser: { select: { handle: true } } }
          },
          Reaction: {
            include: {
              AppUser: {
                select: { id: true, handle: true }
              }
            }
          },
          _count: {
            select: { Reaction: true, other_Post: true }
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
          Conversation: {
            select: { id: true, title: true, Page: { select: { url: true } } }
          },
          Reaction: {
            include: {
              AppUser: {
                select: { id: true, handle: true }
              }
            }
          },
          _count: {
            select: { Reaction: true }
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

  /**
   * Recursively get all descendants (progeny) of a post
   */
  async getAllProgeny(postId) {
    try {
      const directChildren = await this.prisma.post.findMany({
        where: {
          parentId: postId,
          deletedAt: null
        },
        include: {
          AppUser: {
            select: { id: true, handle: true, name: true, avatarUrl: true }
          },
          Reaction: {
            include: {
              AppUser: {
                select: { id: true, handle: true }
              }
            }
          },
          _count: {
            select: { Reaction: true, other_Post: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Recursively get children of each child
      const allProgeny = [];
      for (const child of directChildren) {
        allProgeny.push(child);
        const nestedProgeny = await this.getAllProgeny(child.id);
        allProgeny.push(...nestedProgeny);
      }

      return allProgeny;
    } catch (error) {
      console.error('Error getting progeny:', error);
      throw new Error('Failed to get progeny');
    }
  }

  /**
   * Get post with all related data for sharing (parent, quotes, progeny)
   */
  async getPostForShare(postId) {
    try {
      const post = await this.getPost(postId);
      
      if (!post) {
        return null;
      }

      // Get all progeny (recursive descendants)
      const progeny = await this.getAllProgeny(postId);

      // Get full parent chain if this is a reply
      let parentChain = [];
      let currentParentId = post.parentId;
      while (currentParentId) {
        const parent = await this.prisma.post.findUnique({
          where: { id: currentParentId },
          include: {
            AppUser: {
              select: { id: true, handle: true, name: true, avatarUrl: true }
            },
            Reaction: {
              include: {
                AppUser: {
                  select: { id: true, handle: true }
                }
              }
            },
            _count: {
              select: { Reaction: true, other_Post: true }
            }
          }
        });
        if (parent && !parent.deletedAt) {
          parentChain.push(parent);
          currentParentId = parent.parentId;
        } else {
          break;
        }
      }

      // Reverse parent chain to show oldest first
      parentChain.reverse();

      return {
        ...post,
        parentChain,
        progeny
      };
    } catch (error) {
      console.error('Error getting post for share:', error);
      throw new Error('Failed to get post for share');
    }
  }
}

module.exports = PostService;







