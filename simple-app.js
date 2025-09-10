const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration for extension
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://216.238.91.120:3002', 'chrome-extension://*'],
  credentials: true
}));

app.use(express.json());

// Mock data
const communities = [
  { id: 'comm-001', name: 'Public Square', ruleset: { allowAnonymous: true, moderation: 'light' } },
  { id: 'comm-002', name: 'Governance Circle', ruleset: { allowAnonymous: false, moderation: 'strict' } }
];

const avatars = {
  'comm-001': [
    { userId: 'user1', name: 'Alice Johnson', communityId: 'comm-001', lastSeen: new Date().toISOString() },
    { userId: 'user2', name: 'Bob Smith', communityId: 'comm-001', lastSeen: new Date().toISOString() },
    { userId: 'user3', name: 'Carol Davis', communityId: 'comm-001', lastSeen: new Date().toISOString() }
  ],
  'comm-002': [
    { userId: 'user4', name: 'David Wilson', communityId: 'comm-002', lastSeen: new Date().toISOString() },
    { userId: 'user5', name: 'Eva Brown', communityId: 'comm-002', lastSeen: new Date().toISOString() }
  ]
};

// Routes
app.get('/', (req, res) => {
  res.send('Meta-Layer Initiative API is running!');
});

app.get('/communities', (req, res) => {
  res.json({ communities });
});

app.get('/avatars/active', (req, res) => {
  const { communityId } = req.query;
  if (!communityId) {
    return res.status(400).json({ error: 'communityId required' });
  }
  
  const activeAvatars = avatars[communityId] || [];
  res.json({ active: activeAvatars });
});

app.post('/auth/login', (req, res) => {
  const mockSession = {
    userId: 'user-abc123',
    email: 'example@gmail.com',
    is_human: true
  };
  
  res.json({
    message: 'Login successful (mock)',
    session: mockSession
  });
});

app.get('/auth/me', (req, res) => {
  const mockUser = {
    userId: 'user-abc123',
    email: 'example@gmail.com',
    is_human: true
  };
  
  res.json({ user: mockUser });
});

// Google OAuth callback page (GET) - for redirect from Google
app.get('/api/auth/google/callback', (req, res) => {
  const { code, state } = req.query;
  
  if (code && state && state.includes('chrome-extension')) {
    // Return a simple HTML page that will close the popup and send the code to the extension
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Success</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: green; }
        </style>
      </head>
      <body>
        <h1 class="success">✅ Authentication Successful!</h1>
        <p>You can close this window and return to the extension.</p>
        <script>
          // Send the code back to the extension
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_OAUTH_SUCCESS',
              code: '${code}',
              state: '${state}'
            }, '*');
            window.close();
          }
        </script>
      </body>
      </html>
    `);
  } else {
    res.status(400).send('Invalid OAuth callback');
  }
});

// Serve static files for OAuth callback
app.use(express.static('public'));

// Google OAuth callback endpoint for Chrome extension
app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, redirect_uri, extension_id } = req.body;
    
    console.log('OAuth callback received:', { code: code ? 'present' : 'missing', redirect_uri, extension_id });
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '240745106929-q6hc1b06mochkuu4gf6uo3d2mopvg337.apps.googleusercontent.com',
        client_secret: 'GOCSPX-YOUR_NEW_CLIENT_SECRET_HERE',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return res.status(400).json({ error: 'Failed to exchange code for token', details: tokenData });
    }
    
    console.log('Access token received:', tokenData.access_token ? 'present' : 'missing');
    
    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    const userInfo = await userResponse.json();
    
    console.log('Google user info:', userInfo);
    
    // Return user data in the format expected by the extension
    const user = {
      id: userInfo.id,
      email: userInfo.email,
      user_metadata: {
        full_name: userInfo.name,
        avatar_url: userInfo.picture
      }
    };
    
    res.json({ 
      success: true,
      user: user,
      message: 'OAuth successful'
    });
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      error: 'OAuth callback failed', 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Meta-Layer Initiative API running on http://${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
