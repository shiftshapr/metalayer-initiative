const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');
const crypto = require('crypto');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const Canopi2Controller = require('./controllers/canopi2Controller');
require('dotenv').config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize controller
const canopi2Controller = new Canopi2Controller(prisma);

// Feature flags
const FEATURES = {
  THREADS: process.env.FEATURE_THREADS === 'true',
  ANCHORS: process.env.FEATURE_ANCHORS === 'true',
  PRESENCE: process.env.FEATURE_PRESENCE === 'true',
  LIVE: process.env.FEATURE_LIVE === 'true'
};

const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'chrome-extension://*'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    features: FEATURES,
    timestamp: new Date().toISOString()
  });
});

// Feature flag endpoint
app.get('/v1/features', (req, res) => {
  res.json({ features: FEATURES });
});

// Generate UUID from email
function generateUUIDFromEmail(email) {
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  // Take first 32 characters and format as UUID
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
  return uuid;
}

// Auth middleware - extract user from headers sent by extension
app.use((req, res, next) => {
  // Try to get user info from headers (sent by extension)
  const userEmail = req.headers['x-user-email'];
  const userName = req.headers['x-user-name'];
  const userAvatarUrl = req.headers['x-user-avatar'];
  
  console.log('🔍 Auth middleware - Headers received:', {
    email: userEmail,
    name: userName,
    avatarUrl: userAvatarUrl
  });
  
  if (userEmail) {
    // Use real user from extension - generate UUID from email
    req.user = { 
      id: generateUUIDFromEmail(userEmail),
      handle: userEmail.split('@')[0], // Use email prefix as handle
      name: userName || userEmail.split('@')[0],
      email: userEmail,
      avatarUrl: userAvatarUrl
    };
    console.log('✅ Auth middleware - req.user created:', req.user);
  } else {
    // Fallback to mock user for testing
    req.user = { 
      id: generateUUIDFromEmail('testuser@example.com'), 
      handle: 'testuser', 
      name: 'Test User',
      email: 'testuser@example.com'
    };
  }
  next();
});

// API routes
app.post('/v1/pages/resolve', (req, res) => canopi2Controller.resolvePage(req, res));

app.get('/v1/conversations', (req, res) => canopi2Controller.getConversations(req, res));
app.post('/v1/conversations', (req, res) => canopi2Controller.createConversation(req, res));
app.get('/v1/conversations/:id', (req, res) => canopi2Controller.getConversation(req, res));

app.post('/v1/posts', (req, res) => canopi2Controller.createPost(req, res));
app.get('/v1/posts/:id', (req, res) => canopi2Controller.getPost(req, res));
app.put('/v1/posts/:id', (req, res) => canopi2Controller.updatePost(req, res));
app.delete('/v1/posts/:id', (req, res) => canopi2Controller.deletePost(req, res));

app.post('/v1/reactions', (req, res) => canopi2Controller.toggleReaction(req, res));
app.get('/v1/reactions', (req, res) => canopi2Controller.getReactions(req, res));

app.get('/v1/pages/:pageId/conversations', (req, res) => canopi2Controller.getPageConversations(req, res));

// Compatibility endpoints for existing extension
app.get('/communities', (req, res) => {
  // Mock communities for now - replace with real data later
  res.json({
    communities: [
      {
        id: 'comm-001',
        name: 'Public Square',
        description: 'A general discussion space for all topics',
        codeOfConduct: 'Be respectful and constructive. No spam or harassment.',
        logo: 'https://via.placeholder.com/100x100/4ECDC4/white?text=PS',
        daoLink: 'https://example.com/public-square-dao',
        onboardingInstructions: 'Welcome to Public Square! This is a space for open discussion.',
        isPublic: true,
        isOpen: true,
        profileLink: 'public-square',
        owner: 'themetalayer@gmail.com',
        admins: ['themetalayer@gmail.com'],
        members: 3,
        messages: 5,
        ruleset: { allowAnonymous: true, moderation: 'light' }
      },
      {
        id: 'comm-002',
        name: 'Governance Circle',
        description: 'Discussion and decision-making for community governance',
        codeOfConduct: 'Focus on governance topics. Provide evidence for claims.',
        logo: 'https://via.placeholder.com/100x100/45B7D1/white?text=GC',
        daoLink: 'https://example.com/governance-dao',
        onboardingInstructions: 'Join governance discussions and help shape our community.',
        isPublic: true,
        isOpen: false,
        profileLink: 'governance-circle',
        owner: 'themetalayer@gmail.com',
        admins: ['themetalayer@gmail.com'],
        members: 2,
        messages: 3,
        ruleset: { allowAnonymous: false, moderation: 'strict' }
      }
    ]
  });
});

app.get('/avatars/active', (req, res) => {
  // Mock avatars for now
  res.json({
    avatars: [
      {
        id: 'avatar-1',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test User',
        url: 'https://via.placeholder.com/40x40/007bff/white?text=T',
        uri: req.query.uri || null,
        communityId: req.query.communityId || 'comm-001'
      }
    ]
  });
});


// Placeholder endpoints
app.get('/v1/presence', (req, res) => {
  res.json({ message: 'Presence endpoint - coming soon' });
});

app.get('/v1/live/state', (req, res) => {
  res.json({ message: 'Live state endpoint - coming soon' });
});

// WebSocket setup
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('WebSocket message received:', data);
      
      // Echo back for now
      ws.send(JSON.stringify({ 
        type: 'echo', 
        data: data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid JSON' 
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Canopi 2 server running on port ${PORT}`);
  console.log(`📊 Features enabled:`, Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name)
    .join(', ') || 'None');
});

module.exports = { app, server, prisma, FEATURES };
