
#!/usr/bin/env node

/**
 * Cleanup Script: Remove Custom WebSocket Infrastructure
 * 
 * This script removes all custom WebSocket server files and configurations
 * after successful migration to Supabase real-time.
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up custom WebSocket infrastructure...');

// Files to remove
const filesToRemove = [
  'websocket-server.js',
  'server-realtime-logger.js',
  'websocket-system-working.html',
  'test-websocket-aura-integration.js',
  'comprehensive-realtime-audit.js',
  'websocket-architecture-analysis.js',
  'final-websocket-analysis.js'
];

// Directories to clean
const dirsToClean = [
  'websocket-logs',
  'websocket-backups'
];

// Remove files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed ${file}`);
  }
});

// Remove directories
dirsToClean.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed directory ${dir}`);
  }
});

// Update package.json to remove WebSocket dependencies
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove WebSocket-related dependencies
  const dependenciesToRemove = ['ws', 'websocket'];
  dependenciesToRemove.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      delete packageJson.dependencies[dep];
      console.log(`✅ Removed dependency: ${dep}`);
    }
  });
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');
}

console.log('🧹 Cleanup complete!');
console.log('📝 Note: Make sure to update your Supabase credentials before testing');
