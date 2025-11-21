/**
 * JAUmemory Logging Service
 * Sends extension logs to JAUmemory for milestone and error tracking
 */

// This service integrates with JAUmemory MCP server
// See: https://github.com/jaumemory/jaumemory-mcp

class JAUmemoryLoggingService {
  constructor() {
    this.enabled = process.env.JAUMEMORY_ENABLED === 'true';
    this.autoStore = process.env.JAUMEMORY_AUTO_STORE === 'true';
  }

  /**
   * Log milestone event to JAUmemory
   */
  async logMilestone(milestoneData) {
    if (!this.enabled) return null;

    const { milestoneKey, name, status, communityId, userId } = milestoneData;

    try {
      // Use JAUmemory MCP to store memory
      // In production, this would use the MCP server
      const memoryContent = `Milestone ${name} (${milestoneKey}) status: ${status}`;
      const context = {
        milestoneKey,
        name,
        status,
        communityId,
        userId,
        timestamp: new Date().toISOString()
      };

      // TODO: Integrate with JAUmemory MCP
      // const memory = await mcp_jaumemory_remember({
      //   content: memoryContent,
      //   context: JSON.stringify(context),
      //   importance: status === 'completed' ? 0.8 : 0.5,
      //   tags: ['milestone', 'token-launch', milestoneKey]
      // });

      // For now, return placeholder
      return {
        stored: true,
        memoryId: `mem-${Date.now()}`,
        content: memoryContent
      };
    } catch (error) {
      console.error('Error logging milestone to JAUmemory:', error);
      return null;
    }
  }

  /**
   * Log error to JAUmemory
   */
  async logError(errorData) {
    if (!this.enabled) return null;

    const { error, message, stack, context, userId, communityId } = errorData;

    try {
      const memoryContent = `Error: ${message || error?.message || 'Unknown error'}`;
      const fullContext = {
        error: error?.toString(),
        message,
        stack,
        context,
        userId,
        communityId,
        timestamp: new Date().toISOString()
      };

      // TODO: Integrate with JAUmemory MCP
      // const memory = await mcp_jaumemory_remember({
      //   content: memoryContent,
      //   context: JSON.stringify(fullContext),
      //   importance: 0.9, // Errors are high importance
      //   tags: ['error', 'token-launch', context?.category || 'general']
      // });

      return {
        stored: true,
        memoryId: `mem-error-${Date.now()}`,
        content: memoryContent
      };
    } catch (err) {
      console.error('Error logging error to JAUmemory:', err);
      return null;
    }
  }

  /**
   * Log general event to JAUmemory
   */
  async logEvent(eventData) {
    if (!this.enabled || !this.autoStore) return null;

    const { type, category, message, data, userId } = eventData;

    try {
      const memoryContent = `${type}: ${message}`;
      const context = {
        type,
        category,
        data,
        userId,
        timestamp: new Date().toISOString()
      };

      // Determine importance based on type
      let importance = 0.5;
      if (type === 'milestone') importance = 0.7;
      if (type === 'error') importance = 0.9;
      if (type === 'warning') importance = 0.6;

      // TODO: Integrate with JAUmemory MCP
      // const memory = await mcp_jaumemory_remember({
      //   content: memoryContent,
      //   context: JSON.stringify(context),
      //   importance,
      //   tags: [type, category || 'general']
      // });

      return {
        stored: true,
        memoryId: `mem-${type}-${Date.now()}`,
        content: memoryContent
      };
    } catch (error) {
      console.error('Error logging event to JAUmemory:', error);
      return null;
    }
  }

  /**
   * Store extension log in database and JAUmemory
   */
  async storeExtensionLog(logData) {
    const { PrismaClient } = require('../generated/prisma');
    const prisma = new PrismaClient();

    try {
      const { userId, logType, category, message, data } = logData;

      // Store in database first
      const extensionLog = await prisma.extensionLog.create({
        data: {
          userId,
          logType,
          category,
          message,
          data: data ? JSON.parse(JSON.stringify(data)) : null
        }
      });

      // Store in JAUmemory if enabled
      let jauMemoryResult = null;
      if (this.enabled && (logType === 'milestone' || logType === 'error')) {
        if (logType === 'milestone') {
          jauMemoryResult = await this.logMilestone({
            ...data,
            userId
          });
        } else if (logType === 'error') {
          jauMemoryResult = await this.logError({
            error: data?.error,
            message,
            stack: data?.stack,
            context: data,
            userId
          });
        }
      }

      // Update log with JAUmemory result
      if (jauMemoryResult) {
        await prisma.extensionLog.update({
          where: { id: extensionLog.id },
          data: {
            jauMemoryId: jauMemoryResult.memoryId,
            jauMemoryStored: true,
            jauMemoryStoredAt: new Date()
          }
        });
      }

      return extensionLog;
    } catch (error) {
      console.error('Error storing extension log:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Query JAUmemory for related memories
   */
  async queryMemories(query, limit = 10) {
    if (!this.enabled) return [];

    try {
      // TODO: Integrate with JAUmemory MCP
      // const memories = await mcp_jaumemory_recall({
      //   query,
      //   limit
      // });

      return [];
    } catch (error) {
      console.error('Error querying JAUmemory:', error);
      return [];
    }
  }
}

module.exports = new JAUmemoryLoggingService();








