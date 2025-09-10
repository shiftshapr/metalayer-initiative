const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Add your auth and poh route
app.use('/auth', require('./routes/auth'));
app.use('/poh', require('./routes/poh'));
app.use('/communities', require('./routes/communities'));
app.use('/avatars', require('./routes/avatars'));
app.use('/chat', require('./routes/chat'));
app.use(require('./routes/interaction'));
app.use('/policy/enforce', require('./routes/policy'));
// X-Owlz dynamic NFT endpoints
app.use('/', require('./routes/xowlz'));






// ✅ Optional: Add a simple health check
app.get('/', (req, res) => {
  res.send('API is live!');
});

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Metalayer Initiative API running on http://${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});