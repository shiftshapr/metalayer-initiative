#!/usr/bin/env node

// Simple webhook that triggers sync when called
// Usage: curl http://216.238.91.120:3004/sync

const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = 3004;

// Configuration
const PRESENCE_PATH = '/home/ubuntu/metalayer-initiative/presence';
const MACBOOK_USER = 'daveed';
const MACBOOK_IP = 'YOUR_MACBOOK_IP';
const MACBOOK_PATH = '/path/to/your/project/presence';

app.use(express.json());

// Sync function
function syncToMacBook() {
  console.log('🔄 Syncing to MacBook...');
  
  const rsyncCommand = `rsync -avz --delete \
    --exclude='*.log' \
    --exclude='node_modules' \
    --exclude='.git' \
    ${PRESENCE_PATH}/ \
    ${MACBOOK_USER}@${MACBOOK_IP}:${MACBOOK_PATH}/`;
  
  exec(rsyncCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Sync failed:', error);
      return;
    }
    console.log('✅ Sync completed successfully');
  });
}

// Webhook endpoint
app.post('/sync', (req, res) => {
  console.log('📡 Sync webhook triggered');
  syncToMacBook();
  res.json({ status: 'sync triggered', timestamp: new Date().toISOString() });
});

// Manual trigger endpoint
app.get('/sync', (req, res) => {
  console.log('🔄 Manual sync triggered');
  syncToMacBook();
  res.json({ status: 'sync triggered', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook sync server running on port ${PORT}`);
  console.log(`📡 Trigger sync: curl http://216.238.91.120:${PORT}/sync`);
});


