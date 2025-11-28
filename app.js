const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();

// CORS configuration for extension
app.use(cors({
  origin: ['http://216.238.91.120:3000', 'http://216.238.91.120:3001'],
  credentials: true
}));

app.use(express.json());

// Serve static files from public directory
// CRITICAL: Define routes BEFORE static file serving to ensure they're matched
// Handle /message/:id route - redirect to share-message resolver
// This supports URLs like: https://app.themetalayer.org/message/39555d38-784c-4d75-a495-eddc896c19f9
app.get('/message/:id', (req, res) => {
  const messageId = req.params.id;
  const queryParams = new URLSearchParams();
  
  // Preserve any existing query parameters (like page, conversation)
  if (req.query.page) {
    queryParams.set('page', req.query.page);
  }
  if (req.query.conversation) {
    queryParams.set('conversation', req.query.conversation);
  }
  
  // Redirect to share-message with message ID as query parameter
  const queryString = queryParams.toString();
  const redirectUrl = `/share-message?message=${messageId}${queryString ? '&' + queryString : ''}`;
  console.log(`🔗 ROUTE: Redirecting /message/${messageId} to ${redirectUrl}`);
  res.redirect(redirectUrl);
});

// Serve share message resolver page
const path = require('path');
app.get('/share-message', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'share-message.html'));
});

// Serve timeline page (BEFORE static file serving)
app.get('/timelines', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'timelines', 'index.html'));
});

app.get('/timelines/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'timelines', 'index.html'));
});

app.get('/timelines/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'timelines', 'index.html'));
});

// Serve Web3Auth test page with Client ID injected server-side (BEFORE static file serving)
app.get('/web3auth-test', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'web3auth-test', 'index.html');
  const fs = require('fs');
  
  if (!fs.existsSync(htmlPath)) {
    return res.status(404).send('Web3Auth test page not found');
  }
  
  // Read HTML file
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Determine network from query parameter (default: mainnet)
  const networkParam = req.query.network || 'mainnet';
  const useTestnet = networkParam === 'devnet' || networkParam === 'testnet';
  const network = useTestnet ? 'sapphire_devnet' : 'sapphire_mainnet';
  
  // Get appropriate Client ID based on network
  const clientId = useTestnet 
    ? (process.env.WEB3AUTH_CLIENT_ID_DEVNET || process.env.WEB3AUTH_CLIENT_ID || '')
    : (process.env.WEB3AUTH_CLIENT_ID || '');
  
  // Log for debugging (first few chars only for security)
  if (clientId) {
    console.log(`[Web3Auth] Injecting ${network} Client ID: ${clientId.substring(0, 10)}... (length: ${clientId.length})`);
  } else {
    const envVar = useTestnet ? 'WEB3AUTH_CLIENT_ID_DEVNET' : 'WEB3AUTH_CLIENT_ID';
    console.warn(`[Web3Auth] WARNING: ${envVar} not found in environment variables`);
    console.warn(`[Web3Auth] Check .env file or set ${envVar} environment variable`);
  }
  
  if (clientId) {
    // Replace the variable declaration - handle both old pattern and new pattern with window global
    html = html.replace(
      /let\s+WEB3AUTH_CLIENT_ID\s*=\s*(?:null|\(typeof window !== 'undefined' && window\.CANOPI_WEB3AUTH_CLIENT_ID\) \|\| null)\s*;/,
      `let WEB3AUTH_CLIENT_ID = '${clientId.replace(/'/g, "\\'").replace(/\\/g, "\\\\")}';`
    );
    
    // Inject network configuration
    html = html.replace(
      /const\s+WEB3AUTH_NETWORK\s*=\s*['"](?:sapphire_mainnet|sapphire_devnet)['"];.*\/\/.*/,
      `const WEB3AUTH_NETWORK = '${network}'; // ${useTestnet ? 'Testnet' : 'Mainnet'} (set via ?network=devnet or ?network=mainnet)`
    );
    
    // Also set as window global for fallback - inject right after the opening body tag or in head
    // Try to inject before the first script that uses it
    if (html.includes('</head>')) {
      html = html.replace(
        /<\/head>/,
        `<script>window.CANOPI_WEB3AUTH_CLIENT_ID = '${clientId.replace(/'/g, "\\'").replace(/\\/g, "\\\\")}'; window.CANOPI_WEB3AUTH_NETWORK = '${network}';</script></head>`
      );
    } else {
      // Fallback: inject at the very beginning of the first script tag
      html = html.replace(
        /(<script[^>]*>)/,
        `$1window.CANOPI_WEB3AUTH_CLIENT_ID = '${clientId.replace(/'/g, "\\'").replace(/\\/g, "\\\\")}'; window.CANOPI_WEB3AUTH_NETWORK = '${network}';`
      );
    }
  } else {
    // If no Client ID, inject a console error
    const envVar = useTestnet ? 'WEB3AUTH_CLIENT_ID_DEVNET' : 'WEB3AUTH_CLIENT_ID';
    html = html.replace(
      /let\s+WEB3AUTH_CLIENT_ID\s*=\s*(?:null|\(typeof window !== 'undefined' && window\.CANOPI_WEB3AUTH_CLIENT_ID\) \|\| null)\s*;/,
      `let WEB3AUTH_CLIENT_ID = null; // ERROR: ${envVar} not set in server .env file`
    );
  }
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.get('/web3auth-test/', (req, res) => {
  res.redirect('/web3auth-test');
});

// Serve static files from public directory (AFTER specific routes)
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://216.238.91.120:3001/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Here you would look up or create the user in your DB
  return done(null, profile);
}));

// ✅ Add your auth and poh route
app.use('/auth', require('./routes/auth'));
app.use('/poh', require('./routes/poh'));
app.use('/communities', require('./routes/communities'));
app.use('/avatars', require('./routes/avatars'));
app.use('/chat', require('./routes/chat'));
app.use('/api/messages', require('./routes/messages')); // New messages API with keyset pagination
app.use('/v1/presence', require('./routes/presence')); // CRITICAL FIX: Register presence routes
app.use('/v1/users', require('./routes/users')); // CRITICAL FIX: Register users routes
app.use('/v1/reactions', require('./routes/reactions')); // CRITICAL FIX: Register reactions routes
app.use('/v1/bookmarks', require('./routes/bookmarks')); // Register bookmarks routes
app.use(require('./routes/interaction'));
app.use('/policy/enforce', require('./routes/policy'));
// X-Owlz dynamic NFT endpoints
app.use('/', require('./routes/xowlz'));

// Add Canopi2Controller for posts and share functionality
const { PrismaClient } = require('./generated/prisma');
const Canopi2Controller = require('./controllers/canopi2Controller');
const prisma = new PrismaClient();
const canopi2Controller = new Canopi2Controller(prisma);

// Posts API endpoints
app.post('/v1/posts', (req, res) => canopi2Controller.createPost(req, res));
app.get('/v1/posts/:id', (req, res) => canopi2Controller.getPost(req, res));
app.get('/v1/posts/:id/share', (req, res) => canopi2Controller.getPostForShare(req, res));
app.put('/v1/posts/:id', (req, res) => canopi2Controller.updatePost(req, res));
app.delete('/v1/posts/:id', (req, res) => canopi2Controller.deletePost(req, res));

// Google Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/google/failure',
  session: true,
}), (req, res) => {
  // Successful authentication - redirect to page that closes popup
  res.redirect('/auth/google/success-redirect');
});

app.get('/auth/google/success', (req, res) => {
  res.json({ message: 'Google Auth successful', user: req.user });
});

app.get('/auth/google/success-redirect', (req, res) => {
  // Store user in session for persistence
  if (req.user) {
    req.session.user = req.user;
  }
  
  // Redirect to a simple success page that closes the popup and notifies parent
  res.send(`
    <html>
      <head><title>Authentication Successful</title></head>
      <body>
        <script>
          // Try to communicate with parent window (extension)
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'GOOGLE_AUTH_SUCCESS', 
              user: ${JSON.stringify(req.user || req.session.user)}
            }, '*');
          }
          
          // Store user data in localStorage for the extension to access
          localStorage.setItem('metalayer_user', JSON.stringify(${JSON.stringify(req.user || req.session.user)}));
          
          // Close the popup
          setTimeout(() => {
            window.close();
          }, 1000);
        </script>
        <div style="text-align: center; padding: 40px; font-family: Arial, sans-serif;">
          <h2>✅ Authentication Successful!</h2>
          <p>You can close this window.</p>
          <p>Redirecting back to extension...</p>
        </div>
      </body>
    </html>
  `);
});

// GET /auth/me → Return session info
app.get('/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

app.get('/auth/google/success-redirect', (req, res) => {
  // Store user in session for persistence
  if (req.user) {
    req.session.user = req.user;
  }
  
  // Redirect to a simple success page that closes the popup and notifies parent
  res.send(`
    <html>
      <head><title>Authentication Successful</title></head>
      <body>
        <script>
          // Try to communicate with parent window (extension)
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'GOOGLE_AUTH_SUCCESS', 
              user: ${JSON.stringify(req.user || req.session.user)}
            }, '*');
          }
          
          // Store user data in localStorage for the extension to access
          localStorage.setItem('metalayer_user', JSON.stringify(${JSON.stringify(req.user || req.session.user)}));
          
          // Close the popup
          setTimeout(() => {
            window.close();
          }, 1000);
        </script>
        <div style="text-align: center; padding: 40px; font-family: Arial, sans-serif;">
          <h2>✅ Authentication Successful!</h2>
          <p>You can close this window.</p>
          <p>Redirecting back to extension...</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/auth/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google Auth failed' });
});

// Handle Chrome extension Google OAuth token
app.post('/auth/google/token', (req, res) => {
  const { token, userInfo } = req.body;
  
  if (!token || !userInfo) {
    return res.status(400).json({ error: 'Token and userInfo required' });
  }
  
  // In a real app, you would verify the token with Google
  // For now, we'll trust the Chrome extension's verification
  
  const user = {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
    verified_email: userInfo.verified_email,
    is_human: true,
    created_at: new Date().toISOString()
  };
  
  // Create session (you might want to use JWT or proper session storage)
  req.session.user = user;
  
  res.json({ 
    message: 'Chrome extension auth successful', 
    user: user,
    sessionId: req.sessionID 
  });
});

// Test Google OAuth URL
app.get('/auth/google-url', (req, res) => {
  const googleAuthURL = `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&scope=openid%20profile%20email&response_type=code&access_type=offline`;
  res.json({ 
    message: 'Google OAuth URL',
    url: googleAuthURL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
  });
});

// Handle Chrome extension Google OAuth token
app.post('/auth/google/token', (req, res) => {
  const { token, userInfo } = req.body;
  
  if (!token || !userInfo) {
    return res.status(400).json({ error: 'Token and userInfo required' });
  }
  
  // In a real app, you would verify the token with Google
  // For now, we'll trust the Chrome extension's verification
  
  const user = {
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
    verified_email: userInfo.verified_email,
    is_human: true,
    created_at: new Date().toISOString()
  };
  
  // Create session (you might want to use JWT or proper session storage)
  req.session.user = user;
  
  res.json({ 
    message: 'Chrome extension auth successful', 
    user: user,
    sessionId: req.sessionID 
  });
});

// Debug route to check configuration
app.get('/auth/debug', (req, res) => {
  res.json({
    message: 'Server is running',
    googleClientConfigured: !!process.env.GOOGLE_CLIENT_ID,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    timestamp: new Date().toISOString()
  });
});

// Test Google OAuth URL
app.get('/auth/google-url', (req, res) => {
  const googleAuthURL = `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&scope=openid%20profile%20email&response_type=code&access_type=offline`;
  res.json({ 
    message: 'Google OAuth URL',
    url: googleAuthURL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
  });
});

// ✅ Optional: Add a simple health check
app.get('/', (req, res) => {
  res.send('API is live!');
});

// Agent API endpoint (exact copy from main branch)
app.post('/api/agent', async (req, res) => {
  try {
    const { message, context, pageContent, type, videoData } = req.body;
    
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
      return res.status(500).json({ 
        error: 'DeepSeek API key not configured. Please set DEEPSEEK_API_KEY in your .env file.' 
      });
    }
    
    // Build enhanced system prompt with RAG context
    let systemPrompt = 'You are a helpful AI assistant that can analyze web page content and answer questions about it. You have access to the current page content and should provide clear, accurate, and helpful responses based on that content.';
    
    // Handle YouTube video context
    if (type === 'youtube_analysis' && context && context.transcript) {
      systemPrompt = `You are a helpful AI assistant that can analyze YouTube videos. You have access to the full video transcript and metadata. Provide detailed, accurate responses based on the video content.

VIDEO INFORMATION:
- Title: ${context.videoTitle || 'Unknown'}
- Channel: ${context.channelName || 'Unknown'}
- Duration: ${context.duration || 'Unknown'}
- Views: ${context.views || 'Unknown'}

FULL VIDEO TRANSCRIPT:
${context.transcript}

VIDEO SUMMARY:
${context.summary || 'Not available'}

KEY POINTS:
${context.keyPoints || 'Not available'}

GENERATED QUESTIONS:
${context.questions || 'Not available'}

IMPORTANT: You have access to the complete video transcript above. Use this information to answer the user's question about the video. Do not say you cannot see the video content - you have the full transcript right here.`;
    }
    // Handle regular page content
    else {
      if (context && context.relevantContent && context.relevantContent.length > 0) {
        systemPrompt += `\n\nRELEVANT PAGE CONTENT:\n${context.relevantContent.join('\n\n')}`;
      }
      
      if (pageContent && pageContent.title) {
        systemPrompt += `\n\nPAGE TITLE: ${pageContent.title}`;
      }
      
      if (pageContent && pageContent.metadata && pageContent.metadata.description) {
        systemPrompt += `\n\nPAGE DESCRIPTION: ${pageContent.metadata.description}`;
      }
    }

    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const data = await deepseekResponse.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response generated.';

    res.json({
      response: aiResponse,
      context: {
        pageTitle: context?.pageTitle || 'Current Page',
        hasContext: !!(context && context.relevantContent && context.relevantContent.length > 0)
      }
    });

  } catch (error) {
    console.error('Agent API error:', error);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Metalayer Initiative API running on http://${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});