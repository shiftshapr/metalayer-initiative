#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script to optimize logging in the extension
// This replaces verbose console.log statements with debug logger calls

const filesToOptimize = [
  'presence/sidepanel.js',
  'presence/content.js',
  'presence/background.js'
];

// Patterns to replace
const replacements = [
  // Replace debug console.log with debug logger
  {
    pattern: /console\.log\(`🔍 ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.debug("general", `$1`$2);'
  },
  {
    pattern: /console\.log\(`✅ ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.info("general", `$1`$2);'
  },
  {
    pattern: /console\.log\(`❌ ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.error("general", `$1`$2);'
  },
  {
    pattern: /console\.log\(`⚠️ ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.warn("general", `$1`$2);'
  },
  {
    pattern: /console\.log\(`🎨 ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.debug("aura", `$1`$2);'
  },
  {
    pattern: /console\.log\(`🔍 AURA_DEBUG: ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.verbose("aura", `$1`$2);'
  },
  {
    pattern: /console\.log\(`🔍 CHAT_LOAD: ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.debug("chat", `$1`$2);'
  },
  {
    pattern: /console\.log\(`🔍 PRESENCE: ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.debug("presence", `$1`$2);'
  },
  {
    pattern: /console\.log\(`🔍 API: ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.debug("api", `$1`$2);'
  },
  {
    pattern: /console\.log\(`🔍 VISIBILITY: ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.debug("visibility", `$1`$2);'
  },
  {
    pattern: /console\.log\(`💓 HEARTBEAT: ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.verbose("presence", `$1`$2);'
  },
  {
    pattern: /console\.log\(`📡 ([^`]+)`([^)]*)\);/g,
    replacement: 'debugLogger.debug("api", `$1`$2);'
  }
];

function optimizeFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Apply replacements
    replacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      // Add debug logger import at the top if not present
      if (!content.includes('debugLogger')) {
        content = `// Debug logging optimized\n${content}`;
      }
      
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Optimized logging in: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed in: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error optimizing ${filePath}:`, error.message);
  }
}

// Run optimization
console.log('🚀 Starting logging optimization...');

filesToOptimize.forEach(optimizeFile);

console.log('✅ Logging optimization complete!');
console.log('💡 To enable debug logging, set window.debugLogger.enableAll() in the console');
console.log('💡 To enable specific categories, use window.debugLogger.enableCategory("category")');










