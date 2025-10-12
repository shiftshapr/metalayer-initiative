const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const ServerRealtimeLogger = require('./server-realtime-logger');

// WebSocket Server for Real Cross-User Communication
class CrossUserWebSocketServer {
  constructor(port = 3004) {
    this.port = port;
    this.clients = new Map(); // userId -> WebSocket
    this.userPresence = new Map(); // userId -> presence data
    this.pageUsers = new Map(); // pageId -> Set of userIds
    
    // Initialize comprehensive logging
    this.logger = new ServerRealtimeLogger();
    
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.setupWebSocketHandlers();
    this.logger.connection('info', `Cross-User WebSocket Server starting on port ${port}`);
    console.log(`🚀 Cross-User WebSocket Server starting on port ${port}`);
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const timer = this.logger.startTimer('connection_setup');
      this.logger.startFlow('connection_setup', {
        remoteAddress: req.connection.remoteAddress,
        url: req.url,
        timestamp: Date.now()
      });
      
      this.logger.connection('info', 'New WebSocket connection attempt', {
        remoteAddress: req.connection.remoteAddress,
        url: req.url,
        headers: req.headers
      });
      
      console.log(`🔌 New WebSocket connection attempt from: ${req.connection.remoteAddress}`);
      console.log(`🔌 Request URL: ${req.url}`);
      console.log(`🔌 Request headers:`, req.headers);
      console.log(`🔌 Connection established at: ${new Date().toISOString()}`);
      
      const query = url.parse(req.url, true).query;
      const userId = query.userId;
      const userEmail = query.userEmail;
      
      this.logger.stepFlow('connection_setup', 'Parsing connection query', {
        userId,
        userEmail,
        query
      });
      
      console.log(`🔌 Parsed query: userId=${userId}, userEmail=${userEmail}`);
      
      if (!userId || !userEmail) {
        this.logger.connection('error', 'Missing required parameters', {
          hasUserId: !!userId,
          hasUserEmail: !!userEmail,
          query
        });
        this.logger.trackConnection(userId, userEmail, false);
        this.logger.endFlow('connection_setup', false, { reason: 'Missing parameters' });
        console.log(`❌ Missing userId or userEmail, closing connection`);
        ws.close(1008, 'Missing userId or userEmail');
        return;
      }

      this.logger.connection('info', 'User connection validated', {
        userId,
        userEmail,
        connectionTime: this.logger.endTimer(timer)
      });
      
      // Store client connection
      this.clients.set(userId, {
        ws,
        userEmail,
        connectedAt: Date.now(),
        currentPage: null
      });

      this.logger.trackConnection(userId, userEmail, true);
      this.logger.endFlow('connection_setup', true, { userId, userEmail });
      
      console.log(`👤 User connected: ${userEmail} (${userId})`);
      
      // Setup message handlers
      ws.on('message', (data) => this.handleMessage(userId, data));
      ws.on('close', () => this.handleDisconnect(userId));
      ws.on('error', (error) => this.handleError(userId, error));

      // Send welcome message
      this.sendToUser(userId, {
        type: 'CONNECTION_ESTABLISHED',
        message: 'Connected to cross-user communication server'
      });
    });
  }

  handleMessage(userId, data) {
    const timer = this.logger.startTimer('message_handle');
    this.logger.startFlow('message_handle', { userId, dataLength: data.length });
    
    try {
      const message = JSON.parse(data);
      this.logger.trackMessageReceived(userId, message.type, {
        messageSize: data.length,
        hasContent: !!message.content,
        hasPageId: !!message.pageId,
        hasUserEmail: !!message.userEmail
      });
      
      this.logger.message('info', 'Processing message', {
        userId,
        messageType: message.type,
        messageSize: data.length
      });
      
      console.log(`📨 Message from ${userId}:`, message.type);

      switch (message.type) {
        case 'PRESENCE_UPDATE':
          this.logger.stepFlow('message_handle', 'Handling presence update');
          this.handlePresenceUpdate(userId, message);
          break;
        case 'AURA_COLOR_CHANGED':
          this.logger.stepFlow('message_handle', 'Handling aura color change');
          this.handleAuraColorChange(userId, message);
          break;
        case 'MESSAGE_SENT':
          this.logger.stepFlow('message_handle', 'Handling message sent');
          this.handleMessageSent(userId, message);
          break;
        case 'MESSAGE_NEW':
          this.logger.stepFlow('message_handle', 'Handling new message');
          this.handleMessageNew(userId, message);
          break;
        case 'MESSAGE_DELETED':
          this.logger.stepFlow('message_handle', 'Handling message deleted');
          this.handleMessageDeleted(userId, message);
          break;
        case 'NEW_MESSAGE_ADDED':
          this.logger.stepFlow('message_handle', 'Handling new message added');
          this.handleNewMessageAdded(userId, message);
          break;
        case 'USER_JOINED_PAGE':
          this.logger.stepFlow('message_handle', 'Handling user joined page');
          this.handleUserJoinedPage(userId, message);
          break;
        case 'USER_LEFT_PAGE':
          this.logger.stepFlow('message_handle', 'Handling user left page');
          this.handleUserLeftPage(userId, message);
          break;
        case 'CONNECTION_ESTABLISHED':
          this.logger.stepFlow('message_handle', 'Handling connection established');
          this.handleConnectionEstablished(userId, message);
          break;
        case 'USER_PRESENCE_UPDATED':
          this.logger.stepFlow('message_handle', 'Handling user presence updated');
          this.handleUserPresenceUpdated(userId, message);
          break;
        case 'PAGE_SUBSCRIPTION':
          this.logger.stepFlow('message_handle', 'Handling page subscription');
          this.handlePageSubscription(userId, message);
          break;
        default:
          this.logger.message('warn', 'Unknown message type received', {
            userId,
            messageType: message.type,
            message
          });
          console.log(`❓ Unknown message type: ${message.type}`);
      }
      
      this.logger.endFlow('message_handle', true, {
        messageType: message.type,
        processingTime: this.logger.endTimer(timer)
      });
    } catch (error) {
      this.logger.error('error', 'Error handling message', {
        userId,
        error: error.message,
        stack: error.stack,
        data: data.toString().substring(0, 200)
      });
      this.logger.endFlow('message_handle', false, { error: error.message });
      console.error(`❌ Error handling message from ${userId}:`, error);
    }
  }

  handlePresenceUpdate(userId, message) {
    const { pageId, pageUrl, userEmail, auraColor } = message;
    
    // Update user presence
    this.userPresence.set(userId, {
      userId,
      userEmail,
      pageId,
      pageUrl,
      auraColor,
      lastSeen: Date.now(),
      isActive: true
    });

    // Update page users
    if (!this.pageUsers.has(pageId)) {
      this.pageUsers.set(pageId, new Set());
    }
    this.pageUsers.get(pageId).add(userId);

    // Notify other users on the same page
    this.notifyPageUsers(pageId, {
      type: 'USER_PRESENCE_UPDATED',
      user: {
        userId,
        userEmail,
        auraColor,
        pageId,
        pageUrl
      }
    }, userId);

    console.log(`👁️ Presence updated: ${userEmail} on ${pageUrl}`);
  }

  handleAuraColorChange(userId, message) {
    const { color, userEmail } = message;
    
    // Update user's aura color
    const userPresence = this.userPresence.get(userId);
    if (userPresence) {
      userPresence.auraColor = color;
      this.userPresence.set(userId, userPresence);
    }

    // Notify other users on the same page
    const pageId = userPresence?.pageId;
    if (pageId) {
      this.notifyPageUsers(pageId, {
        type: 'AURA_COLOR_CHANGED',
        userEmail,
        color,
        timestamp: Date.now()
      }, userId);
    }

    console.log(`🎨 Aura color changed: ${userEmail} -> ${color}`);
  }

  handleMessageSent(userId, message) {
    const { pageId, content, userEmail } = message;
    
    // Notify other users on the same page
    this.notifyPageUsers(pageId, {
      type: 'NEW_MESSAGE',
      message: {
        id: `msg-${Date.now()}-${userId}`,
        content,
        author: userEmail,
        timestamp: Date.now()
      }
    }, userId);

    console.log(`💬 Message sent: ${userEmail} -> ${content}`);
  }

  handleMessageNew(userId, message) {
    const { pageId, content, userEmail } = message;
    
    // Notify other users on the same page
    this.notifyPageUsers(pageId, {
      type: 'MESSAGE_NEW',
      message: {
        id: `msg-${Date.now()}-${userId}`,
        content,
        author: userEmail,
        timestamp: Date.now()
      }
    }, userId);
    
    console.log(`💬 New message from ${userEmail} on page ${pageId}: ${content}`);
  }

  handleMessageDeleted(userId, message) {
    const { pageId, messageId, userEmail } = message;
    
    // Notify other users on the same page
    this.notifyPageUsers(pageId, {
      type: 'MESSAGE_DELETED',
      messageId,
      userEmail,
      timestamp: Date.now()
    }, userId);
    
    console.log(`🗑️ Message deleted by ${userEmail} on page ${pageId}: ${messageId}`);
  }

  handleNewMessageAdded(userId, message) {
    const { pageId, content, userEmail } = message;
    
    // Notify other users on the same page
    this.notifyPageUsers(pageId, {
      type: 'NEW_MESSAGE_ADDED',
      message: {
        id: `msg-${Date.now()}-${userId}`,
        content,
        author: userEmail,
        timestamp: Date.now()
      }
    }, userId);
    
    console.log(`💬 New message added by ${userEmail} on page ${pageId}: ${content}`);
  }

  handleUserJoinedPage(userId, message) {
    const { pageId, pageUrl, userEmail } = message;
    
    // Update user's current page
    const client = this.clients.get(userId);
    if (client) {
      client.currentPage = pageId;
    }

    // Notify other users on the same page
    this.notifyPageUsers(pageId, {
      type: 'USER_JOINED_PAGE',
      user: {
        userId,
        userEmail,
        pageId,
        pageUrl
      }
    }, userId);

    console.log(`👋 User joined page: ${userEmail} -> ${pageUrl}`);
  }

  handleUserLeftPage(userId, message) {
    const { pageId, userEmail } = message;
    
    // Remove user from page
    if (this.pageUsers.has(pageId)) {
      this.pageUsers.get(pageId).delete(userId);
    }

    // Notify other users on the same page
    this.notifyPageUsers(pageId, {
      type: 'USER_LEFT_PAGE',
      user: {
        userId,
        userEmail,
        pageId
      }
    }, userId);

    console.log(`👋 User left page: ${userEmail} from ${pageId}`);
  }

  notifyPageUsers(pageId, message, excludeUserId = null) {
    const pageUserIds = this.pageUsers.get(pageId);
    if (!pageUserIds) return;

    pageUserIds.forEach(userId => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, message);
      }
    });
  }

  sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  handleDisconnect(userId) {
    const client = this.clients.get(userId);
    if (client) {
      console.log(`👋 User disconnected: ${client.userEmail} (${userId})`);
      
      // Notify other users if they were on a page
      if (client.currentPage) {
        this.notifyPageUsers(client.currentPage, {
          type: 'USER_DISCONNECTED',
          user: {
            userId,
            userEmail: client.userEmail
          }
        });
      }
      
      // Clean up
      this.clients.delete(userId);
      this.userPresence.delete(userId);
    }
  }

  handleError(userId, error) {
    console.error(`❌ WebSocket error for ${userId}:`, error);
  }

  handleConnectionEstablished(userId, message) {
    console.log(`✅ Connection established for user ${userId}`);
    // Connection is already established, just acknowledge
    this.sendToUser(userId, {
      type: 'CONNECTION_ACKNOWLEDGED',
      message: 'Connection confirmed'
    });
  }

  handleUserPresenceUpdated(userId, message) {
    console.log(`👁️ User presence updated for ${userId}`);
    // This is handled by the presence update logic
    // Just acknowledge the update
    this.sendToUser(userId, {
      type: 'PRESENCE_UPDATE_ACKNOWLEDGED',
      message: 'Presence update received'
    });
  }

  handlePageSubscription(userId, message) {
    console.log(`📄 Page subscription for ${userId} on page ${message.pageId}`);
    
    // Add user to page tracking
    if (!this.pageUsers.has(message.pageId)) {
      this.pageUsers.set(message.pageId, new Set());
    }
    this.pageUsers.get(message.pageId).add(userId);
    
    // Acknowledge subscription
    this.sendToUser(userId, {
      type: 'PAGE_SUBSCRIPTION_ACKNOWLEDGED',
      pageId: message.pageId,
      message: 'Subscribed to page updates'
    });
    
    console.log(`📄 User ${userId} subscribed to page ${message.pageId}`);
  }

  start() {
    this.server.listen(this.port, '0.0.0.0', () => {
      console.log(`🚀 Cross-User WebSocket Server running on port ${this.port}`);
      console.log(`📡 Ready for real cross-user communication!`);
    });
  }

  getStats() {
    return {
      connectedUsers: this.clients.size,
      activePages: this.pageUsers.size,
      totalPresence: this.userPresence.size
    };
  }
}

// Start the server
const server = new CrossUserWebSocketServer(3004);
server.start();

module.exports = CrossUserWebSocketServer;



