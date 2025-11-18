const { PrismaClient } = require('../generated/prisma');
const crypto = require('crypto');
const prisma = new PrismaClient();

/**
 * GET /.well-known/provenance
 * Serves provenance artifacts for a message in JSON-LD format
 * 
 * URL pattern: /message/:messageId/.well-known/provenance
 */
exports.getProvenance = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        '@context': 'https://schema.org',
        '@type': 'Error',
        error: 'Message ID is required'
      });
    }

    console.log(`[Provenance] Fetching provenance for message: ${messageId}`);

    // First, check for stored provenance artifacts in database
    const storedArtifacts = await prisma.provenance_artifacts.findMany({
      where: { message_id: messageId },
      orderBy: { created_at: 'asc' },
      select: {
        artifact: true,
        created_at: true
      }
    });

    // If we have stored artifacts, return them
    if (storedArtifacts.length > 0) {
      console.log(`[Provenance] Found ${storedArtifacts.length} stored artifacts for message ${messageId}`);
      
      const artifacts = storedArtifacts.map(item => item.artifact);
      
      const response = {
        '@context': 'https://schema.org',
        '@type': 'ProvenanceCollection',
        messageId: messageId,
        retrievedAt: new Date().toISOString(),
        source: 'database',
        artifacts: artifacts
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      return res.json(response);
    }

    // Fallback: Generate artifacts from message data
    console.log(`[Provenance] No stored artifacts found, generating from message data`);

    // Try to find message in Post table (current system)
    let message = await prisma.post.findUnique({
      where: { id: messageId },
      include: {
        author: {
          select: {
            id: true,
            handle: true,
            name: true,
            email: true
          }
        },
        Conversation: {
          include: {
            Page: {
              select: {
                id: true,
                url: true,
                canonicalUrl: true
              }
            }
          }
        }
      }
    });

    // Fallback to legacy messages table if not found
    if (!message) {
      message = await prisma.messages.findUnique({
        where: { id: messageId },
        include: {
          AppUser: {
            select: {
              id: true,
              handle: true,
              name: true,
              email: true
            }
          }
        }
      });
    }

    if (!message) {
      return res.status(404).json({
        '@context': 'https://schema.org',
        '@type': 'Error',
        error: 'Message not found',
        messageId: messageId
      });
    }

    // Check if provenance artifacts are stored in database
    // For now, we'll generate provenance from message data
    // In the future, this could query a provenance_artifacts table
    
    // Generate provenance artifacts from message history
    const artifacts = await generateProvenanceArtifacts(message);

    // Create provenance collection response
    const response = {
      '@context': 'https://schema.org',
      '@type': 'ProvenanceCollection',
      messageId: messageId,
      retrievedAt: new Date().toISOString(),
      source: 'generated',
      artifacts: artifacts
    };

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log(`[Provenance] Returning ${artifacts.length} artifacts for message ${messageId}`);
    res.json(response);

  } catch (error) {
    console.error('[Provenance] Error fetching provenance:', error);
    res.status(500).json({
      '@context': 'https://schema.org',
      '@type': 'Error',
      error: 'Failed to fetch provenance',
      details: error.message
    });
  }
};

/**
 * POST /message/:messageId/provenance
 * Store provenance artifact from client
 */
exports.storeProvenance = async (req, res) => {
  try {
    const { messageId } = req.params;
    const artifact = req.body;

    if (!messageId || !artifact) {
      return res.status(400).json({ 
        '@context': 'https://schema.org',
        '@type': 'Error',
        error: 'Message ID and artifact are required' 
      });
    }

    // Validate artifact structure
    if (!artifact['@id'] || !artifact.timestamp) {
      return res.status(400).json({ 
        '@context': 'https://schema.org',
        '@type': 'Error',
        error: 'Invalid artifact structure: @id and timestamp are required' 
      });
    }

    // Verify message exists (either in Post or messages table)
    const postExists = await prisma.post.findUnique({
      where: { id: messageId },
      select: { id: true }
    });

    const messageExists = postExists || await prisma.messages.findUnique({
      where: { id: messageId },
      select: { id: true }
    });

    if (!messageExists) {
      return res.status(404).json({ 
        '@context': 'https://schema.org',
        '@type': 'Error',
        error: 'Message not found',
        messageId: messageId
      });
    }

    // Store artifact in database
    const stored = await prisma.provenance_artifacts.create({
      data: {
        message_id: messageId,
        artifact: artifact
      }
    });

    console.log(`[Provenance] Stored artifact ${artifact['@id']} for message ${messageId}`);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      '@context': 'https://schema.org',
      '@type': 'ProvenanceArtifactStored',
      success: true,
      messageId: messageId,
      artifactId: artifact['@id'],
      storedId: stored.id,
      storedAt: stored.created_at.toISOString()
    });

  } catch (error) {
    console.error('[Provenance] Error storing provenance:', error);
    
    // Handle unique constraint violations (duplicate artifacts)
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        '@context': 'https://schema.org',
        '@type': 'Error',
        error: 'Artifact already exists',
        artifactId: artifact?.['@id']
      });
    }

    res.status(500).json({ 
      '@context': 'https://schema.org',
      '@type': 'Error',
      error: 'Failed to store provenance', 
      details: error.message 
    });
  }
};

/**
 * Generate provenance artifacts from message data
 * This creates artifacts for create, update, and delete events
 */
async function generateProvenanceArtifacts(message) {
  const artifacts = [];

  // Determine message structure (Post vs legacy messages)
  const isPost = message.Conversation !== undefined;
  const messageBody = isPost ? message.body : message.content;
  const messageAuthor = isPost ? message.author : message.AppUser;
  const createdAt = isPost ? message.createdAt : message.created_at;
  const updatedAt = isPost ? message.editedAt : message.updated_at;
  const deletedAt = isPost ? message.deletedAt : null;
  const messageId = message.id;
  const authorId = isPost ? message.authorId : message.user_id;

  // Get page URL for scope
  let pageUrl = 'unknown';
  if (isPost && message.Conversation?.Page) {
    pageUrl = message.Conversation.Page.canonicalUrl || message.Conversation.Page.url;
  } else if (!isPost && message.page_id) {
    // Would need to query Page table, but for now use page_id
    pageUrl = `page:${message.page_id}`;
  }

  // Hash content for scope binding
  const contentHash = crypto.createHash('sha256')
    .update(messageBody || '')
    .digest('hex');

  // 1. Creation artifact
  artifacts.push({
    '@context': 'https://schema.org',
    '@type': 'ProvenanceArtifact',
    '@id': `provenance:${messageId}:create:${createdAt.getTime()}`,
    timestamp: createdAt.toISOString(),
    scope: {
      type: 'Message',
      id: messageId,
      contentHash: contentHash,
      url: pageUrl
    },
    claim: {
      action: 'create',
      messageId: messageId,
      content: contentHash,
      parentId: isPost ? message.parentId : message.parent_id || null,
      userId: authorId
    },
    actor: {
      type: 'User',
      id: authorId,
      handle: messageAuthor?.handle || null,
      name: messageAuthor?.name || null
    },
    signature: null, // Would be signed by client
    note: 'Generated on-demand from message data. Client-side signatures not yet stored.'
  });

  // 2. Update artifact (if message was edited)
  if (updatedAt && updatedAt.getTime() !== createdAt.getTime()) {
    artifacts.push({
      '@context': 'https://schema.org',
      '@type': 'ProvenanceArtifact',
      '@id': `provenance:${messageId}:update:${updatedAt.getTime()}`,
      timestamp: updatedAt.toISOString(),
      scope: {
        type: 'Message',
        id: messageId,
        contentHash: contentHash,
        url: pageUrl
      },
      claim: {
        action: 'update',
        messageId: messageId,
        content: contentHash,
        userId: authorId
      },
      actor: {
        type: 'User',
        id: authorId,
        handle: messageAuthor?.handle || null,
        name: messageAuthor?.name || null
      },
      signature: null,
      note: 'Generated on-demand from message data. Client-side signatures not yet stored.'
    });
  }

  // 3. Delete artifact (if message was deleted)
  if (deletedAt) {
    // Check if there's a deletion record
    const deletion = await prisma.message_deletions.findFirst({
      where: { message_id: messageId },
      orderBy: { deleted_at: 'desc' }
    });

    if (deletion) {
      artifacts.push({
        '@context': 'https://schema.org',
        '@type': 'ProvenanceArtifact',
        '@id': `provenance:${messageId}:delete:${deletion.deleted_at.getTime()}`,
        timestamp: deletion.deleted_at.toISOString(),
        scope: {
          type: 'Message',
          id: messageId,
          contentHash: contentHash,
          url: pageUrl
        },
        claim: {
          action: 'delete',
          messageId: messageId,
          userId: deletion.deleted_by || deletion.user_id
        },
        actor: {
          type: 'User',
          id: deletion.deleted_by || deletion.user_id
        },
        signature: null,
        note: 'Generated on-demand from deletion record. Client-side signatures not yet stored.'
      });
    }
  }

  return artifacts;
}

