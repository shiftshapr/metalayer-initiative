const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Add your auth and poh route
app.use('/auth', require('./routes/auth'));
app.use('/poh', require('./routes/poh'));


// ✅ Optional: Add a simple health check
app.get('/', (req, res) => {
  res.send('API is live!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
