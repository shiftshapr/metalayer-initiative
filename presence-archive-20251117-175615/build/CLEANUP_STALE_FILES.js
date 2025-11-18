/**
 * CLEANUP STALE FILES SCRIPT
 * Removes old markdown reports and diagnostic scripts
 * 
 * Run with: node CLEANUP_STALE_FILES.js
 */

const fs = require('fs');
const path = require('path');

const cleanupLog = {
  timestamp: new Date().toISOString(),
  deleted: [],
  kept: [],
  errors: []
};

// Files to KEEP (current/important)
const keepFiles = [
  'IMPLEMENTATION_REPORT.md',
  'utils/DEEP_DIAGNOSTIC.js',
  'utils/FOCUS_MODE_COMPREHENSIVE_DIAGNOSTIC.js',
  'utils/FOCUS_REPLY_ZERO_WIDTH_DIAGNOSTIC.js',
  'utils/MessageVisibilityManager.js',
  'utils/ReplyLoader.js',
  'utils/FIX_ZERO_DIMENSION_REPLIES.js',
  'MessageDiagnosticManager.js'
];

// Patterns for files to DELETE
const deletePatterns = [
  /^ORCHESTRATION_REPORT.*\.md$/,
  /^.*_AUDIT.*\.md$/,
  /^.*_REVIEW.*\.md$/,
  /^.*_FIX.*\.md$/,
  /^.*DIAGNOSTIC.*\.md$/,
  /^.*TEST.*\.md$/,
  /^.*SUMMARY.*\.md$/,
  /^.*PLAN.*\.md$/,
  /^.*CONTINGENCY.*\.md$/,
  /^.*CLEANUP.*\.md$/,
  /^.*ROOT_CAUSE.*\.md$/,
  /^COMPREHENSIVE.*DIAGNOSTIC\.js$/,
  /^DEEP.*DIAGNOSTIC\.js$/,
  /^FOCUS_MODE.*DIAGNOSTIC\.js$/,
  /^.*BUTTON.*DIAGNOSTIC\.js$/,
  /^.*FIX.*ORCHESTRATION\.js$/,
  /^.*TEST.*\.js$/,
  /^.*VERIFY.*\.js$/,
  /^.*SAVE.*\.js$/,
  /^.*MIGRATE.*\.js$/,
  /^.*CLEANUP.*\.js$/,
  /^ERROR_FIXES_SUMMARY\.js$/,
  /^FINAL_DIAGNOSTIC.*\.js$/
];

function shouldDelete(filename) {
  // Never delete files in keep list
  if (keepFiles.includes(filename) || keepFiles.some(k => filename.includes(k))) {
    return false;
  }
  
  // Check against delete patterns
  return deletePatterns.some(pattern => pattern.test(filename));
}

function cleanupDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      if (shouldDelete(file)) {
        try {
          fs.unlinkSync(filePath);
          cleanupLog.deleted.push(filePath);
          console.log(`✅ Deleted: ${file}`);
        } catch (error) {
          cleanupLog.errors.push({ file: filePath, error: error.message });
          console.error(`❌ Error deleting ${file}: ${error.message}`);
        }
      } else {
        cleanupLog.kept.push(filePath);
      }
    } else if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      // Recursively clean subdirectories (but skip utils for now)
      if (file !== 'utils' && file !== 'archive') {
        cleanupDirectory(filePath);
      }
    }
  });
}

// Main cleanup
console.log('🧹 Starting cleanup of stale files...\n');
const baseDir = __dirname;
cleanupDirectory(baseDir);

// Write cleanup log
const logPath = path.join(baseDir, 'CLEANUP_LOG.json');
fs.writeFileSync(logPath, JSON.stringify(cleanupLog, null, 2));

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📊 CLEANUP SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log(`   ✅ Files deleted: ${cleanupLog.deleted.length}`);
console.log(`   📦 Files kept: ${cleanupLog.kept.length}`);
console.log(`   ❌ Errors: ${cleanupLog.errors.length}`);
console.log(`\n   📝 Log saved to: ${logPath}`);
console.log('═══════════════════════════════════════════════════════════\n');

