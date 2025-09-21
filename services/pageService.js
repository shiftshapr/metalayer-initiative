const { PrismaClient } = require('../generated/prisma');

class PageService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Resolve a URL to a page, creating if it doesn't exist
   */
  async resolvePage(url, spaceId = null) {
    try {
      // Normalize URL
      const canonicalUrl = this.normalizeUrl(url);
      
      // Try to find existing page
      let page = await this.prisma.page.findFirst({
        where: {
          canonicalUrl: canonicalUrl,
          spaceId: spaceId || undefined
        },
        include: {
          space: true,
          latestSnapshot: true
        }
      });

      if (!page) {
        // Create new page
        page = await this.prisma.page.create({
          data: {
            url: url,
            canonicalUrl: canonicalUrl,
            spaceId: spaceId,
            title: this.extractTitleFromUrl(url)
          },
          include: {
            space: true,
            latestSnapshot: true
          }
        });
      }

      return page;
    } catch (error) {
      console.error('Error resolving page:', error);
      throw new Error('Failed to resolve page');
    }
  }

  /**
   * Create a page snapshot
   */
  async createSnapshot(pageId, contentHash, simhash, etag = null, lastModified = null) {
    try {
      const snapshot = await this.prisma.pageSnapshot.create({
        data: {
          pageId,
          contentHash,
          simhash,
          etag,
          lastModified
        }
      });

      // Update page's latest snapshot
      await this.prisma.page.update({
        where: { id: pageId },
        data: { latestSnapshotId: snapshot.id }
      });

      return snapshot;
    } catch (error) {
      console.error('Error creating snapshot:', error);
      throw new Error('Failed to create page snapshot');
    }
  }

  /**
   * Get conversations for a page
   */
  async getPageConversations(pageId, filters = {}) {
    try {
      const where = {
        pageId,
        ...(filters.status && { status: filters.status }),
        ...(filters.visibility && { visibility: filters.visibility }),
        ...(filters.anchorId && { anchorId: filters.anchorId })
      };

      const conversations = await this.prisma.conversation.findMany({
        where,
        include: {
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
        take: filters.limit || 50
      });

      return conversations;
    } catch (error) {
      console.error('Error getting page conversations:', error);
      throw new Error('Failed to get page conversations');
    }
  }

  /**
   * Normalize URL for canonical comparison
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove common tracking parameters and Google-specific params
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 
        'fbclid', 'gclid', 'zx', 'no_sw_cr', 'ei', 'ved', 'uact', 'source', 'sa'
      ];
      trackingParams.forEach(param => urlObj.searchParams.delete(param));
      
      // Normalize protocol and hostname
      urlObj.protocol = 'https:';
      urlObj.hostname = urlObj.hostname.toLowerCase();
      
      return urlObj.toString();
    } catch (error) {
      return url;
    }
  }

  /**
   * Extract title from URL (basic implementation)
   */
  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch (error) {
      return url;
    }
  }
}

module.exports = PageService;





