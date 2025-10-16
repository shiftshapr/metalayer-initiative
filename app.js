const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();

// CORS configuration for extension
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// Serve static files from public directory
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
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
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
app.use('/v1/presence', require('./routes/presence')); // CRITICAL FIX: Register presence routes
app.use('/v1/users', require('./routes/users')); // CRITICAL FIX: Register users routes
app.use(require('./routes/interaction'));
app.use('/policy/enforce', require('./routes/policy'));
// X-Owlz dynamic NFT endpoints
app.use('/', require('./routes/xowlz'));

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