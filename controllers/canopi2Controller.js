const PageService = require('../services/pageService');
const ConversationService = require('../services/conversationService');
const PostService = require('../services/postService');
const ReactionService = require('../services/reactionService');
const UserService = require('../services/userService');

class Canopi2Controller {
  constructor(prisma) {
    this.pageService = new PageService(prisma);
    this.conversationService = new ConversationService(prisma);
    this.postService = new PostService(prisma);
    this.reactionService = new ReactionService(prisma);
    this.userService = new UserService(prisma);
  }

  // Page resolution endpoints
  async resolvePage(req, res) {
    try {
      const { url, spaceId } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const page = await this.pageService.resolvePage(url, spaceId);
      
      res.json({
        pageId: page.id,
        canonicalUrl: page.canonicalUrl,
        url: page.url,
        title: page.title,
        spaceId: page.spaceId,
        createdAt: page.createdAt
      });
    } catch (error) {
      console.error('Error in resolvePage:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Conversation endpoints
  async getConversations(req, res) {
    try {
      const { pageId, anchorId, status, visibility, communityId, limit, offset } = req.query;
      
      const filters = {
        pageId,
        anchorId,
        status,
        visibility,
        communityId,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      };

      const conversations = await this.conversationService.getConversations(filters);
      
      res.json({
        conversations,
        count: conversations.length,
        filters
      });
    } catch (error) {
      console.error('Error in getConversations:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createConversation(req, res) {
    try {
      const { pageId, anchorId, visibility, title, body, tags, communityId } = req.body;
      const userData = req.user; // Assuming auth middleware sets req.user

      if (!pageId || !visibility) {
        return res.status(400).json({ error: 'pageId and visibility are required' });
      }

      if (!userData?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get or create user
      const user = await this.userService.getOrCreateUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        handle: userData.handle,
        avatarUrl: userData.avatarUrl
      });

      const conversation = await this.conversationService.createConversation({
        pageId,
        anchorId,
        visibility,
        title,
        body,
        createdById: user.id,
        tags: tags || [],
        communityId: communityId || null
      });
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error in createConversation:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getConversation(req, res) {
    try {
      const { id } = req.params;
      const { includePosts } = req.query;
      
      const conversation = await this.conversationService.getConversation(
        id, 
        includePosts !== 'false'
      );
      
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error('Error in getConversation:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Post endpoints
  async createPost(req, res) {
    try {
      const { conversationId, body, parentId, attachments, visibilityOverride } = req.body;
      
      if (!conversationId || !body) {
        return res.status(400).json({ error: 'conversationId and body are required' });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Ensure user exists in database before creating post
      const user = await this.userService.getOrCreateUser(req.user);
      
      const post = await this.postService.createPost({
        conversationId,
        authorId: user.id, // Use the actual user ID from database
        body,
        parentId,
        attachments,
        visibilityOverride
      });

      res.status(201).json(post);
    } catch (error) {
      console.error('Error in createPost:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getPost(req, res) {
    try {
      const { id } = req.params;
      
      const post = await this.postService.getPost(id);
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      console.error('Error in getPost:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { body } = req.body;
      const userData = req.user;
      
      if (!body) {
        return res.status(400).json({ error: 'body is required' });
      }
      
      if (!userData?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Get the post first to check ownership
      const existingPost = await this.postService.getPost(id);
      if (!existingPost) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // Check if the current user is the author of the post
      if (existingPost.authorId !== userData.id) {
        return res.status(403).json({ error: 'You can only edit your own posts' });
      }

      const post = await this.postService.updatePost(id, { body });
      
      res.json(post);
    } catch (error) {
      console.error('Error in updatePost:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userData = req.user;
      
      if (!userData?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Get the post first to check ownership
      const post = await this.postService.getPost(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // Check if the current user is the author of the post
      if (post.authorId !== userData.id) {
        return res.status(403).json({ error: 'You can only delete your own posts' });
      }
      
      const deletedPost = await this.postService.deletePost(id);
      
      res.json({ message: 'Post deleted', id });
    } catch (error) {
      console.error('Error in deletePost:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Reaction endpoints
  async toggleReaction(req, res) {
    try {
      const { kind, conversationId, postId, emoji } = req.body;
      const userData = req.user;
      
      if (!kind || !userData?.id) {
        return res.status(400).json({ error: 'kind and authentication are required' });
      }

      if (!conversationId && !postId) {
        return res.status(400).json({ error: 'At least one of conversationId or postId must be specified' });
      }

      // Ensure user exists in database before creating reaction
      const user = await this.userService.getOrCreateUser(userData);

      const result = await this.reactionService.toggleReaction({
        userId: user.id, // Use the actual database user ID
        kind,
        emoji,
        conversationId,
        postId
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error in toggleReaction:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getReactions(req, res) {
    try {
      const { targetId, targetType } = req.query;
      
      if (!targetId || !targetType) {
        return res.status(400).json({ error: 'targetId and targetType are required' });
      }

      const reactions = await this.reactionService.getReactions(targetId, targetType);
      
      res.json(reactions);
    } catch (error) {
      console.error('Error in getReactions:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Page conversations endpoint
  async getPageConversations(req, res) {
    try {
      const { pageId } = req.params;
      const { status, visibility, anchorId, limit } = req.query;
      
      const filters = {
        status,
        visibility,
        anchorId,
        limit: limit ? parseInt(limit) : undefined
      };

      const conversations = await this.pageService.getPageConversations(pageId, filters);
      
      res.json({
        pageId,
        conversations,
        count: conversations.length,
        filters
      });
    } catch (error) {
      console.error('Error in getPageConversations:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = Canopi2Controller;
