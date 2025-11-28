#!/usr/bin/env node

// Push-based sync server that runs on VPS
// Triggers sync to MacBook when files change

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const PORT = 3003;

// Configuration
const PRESENCE_PATH = '/home/ubuntu/canopi/presence';
const MACBOOK_IP = 'YOUR_MACBOOK_IP'; // You'll need to set this
const MACBOOK_USER = 'daveed'; // Your MacBook username
const MACBOOK_PATH = '/path/to/your/project/presence'; // Path on your MacBook

app.use(express.json());

// File watcher
const watcher = chokidar.watch(PRESENCE_PATH, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
});

// Function to trigger sync to MacBook
function triggerSyncToMacBook() {
  console.log('📁 File change detected, triggering sync to MacBook...');
  
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
    console.log('📤 Files pushed to MacBook');
  });
}

// Watch for file changes
watcher
  .on('add', (path) => {
    console.log(`📄 File added: ${path}`);
    triggerSyncToMacBook();
  })
  .on('change', (path) => {
    console.log(`📝 File changed: ${path}`);
    triggerSyncToMacBook();
  })
  .on('unlink', (path) => {
    console.log(`🗑️  File deleted: ${path}`);
    triggerSyncToMacBook();
  });

// Manual sync endpoint
app.post('/sync', (req, res) => {
  console.log('🔄 Manual sync triggered');
  triggerSyncToMacBook();
  res.json({ status: 'sync triggered' });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({ 
    status: 'watching', 
    path: PRESENCE_PATH,
    watching: watcher.getWatched()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Push-sync server running on port ${PORT}`);
  console.log(`👀 Watching: ${PRESENCE_PATH}`);
  console.log(`📤 Will push to: ${MACBOOK_USER}@${MACBOOK_IP}:${MACBOOK_PATH}`);
});












