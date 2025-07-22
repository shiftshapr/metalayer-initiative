require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const authRoutes = require('../routes/auth');
const chatRoutes = require('../routes/chat');
const communitiesRoutes = require('../routes/communities');
const interactionRoutes = require('../routes/interaction');
const pohRoutes = require('../routes/poh');
const policyRoutes = require('../routes/policy');
// Future: Blockchain, TEE, Agent orchestration routes

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));
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

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/communities', communitiesRoutes);
app.use('/interaction', interactionRoutes);
app.use('/poh', pohRoutes);
app.use('/policy', policyRoutes);

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

// Debug route to check configuration
app.get('/auth/debug', (req, res) => {
  res.json({
    message: 'Server is running',
    googleClientConfigured: !!process.env.GOOGLE_CLIENT_ID,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    timestamp: new Date().toISOString()
  });
});

// TODO: Add blockchain, TEE, agent orchestration endpoints

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 