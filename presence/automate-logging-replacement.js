/**
 * SD1 AUTOMATED LOGGING REPLACEMENT SCRIPT
 * 
 * This script automates the replacement of console.log statements with Logger calls.
 * Run this in Node.js to process the sidepanel.js file.
 */

const fs = require('fs');
const path = require('path');

// Read the sidepanel.js file
const filePath = path.join(__dirname, 'sidepanel.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Starting automated logging replacement...');
console.log(`📄 Processing file: ${filePath}`);
console.log(`📊 Original file size: ${content.length} characters`);

// Count original console.log statements
const originalConsoleLogs = (content.match(/console\.log/g) || []).length;
console.log(`🔍 Found ${originalConsoleLogs} console.log statements`);

// Pattern 1: Simple console.log statements
content = content.replace(
  /console\.log\("([^"]*)"\);/g,
  (match, message) => {
    // Determine log level based on emoji
    let level = 'info';
    let context = 'general';
    
    if (message.includes('🚀')) {
      level = 'info';
      message = message.replace('🚀 ', '');
    } else if (message.includes('✅')) {
      level = 'success';
      message = message.replace('✅ ', '');
    } else if (message.includes('❌')) {
      level = 'error';
      message = message.replace('❌ ', '');
    } else if (message.includes('⚠️')) {
      level = 'warn';
      message = message.replace('⚠️ ', '');
    } else if (message.includes('🔍')) {
      level = 'debug';
      message = message.replace('🔍 ', '');
    } else if (message.includes('📡')) {
      level = 'debug';
      context = 'realtime';
      message = message.replace('📡 ', '');
    } else if (message.includes('👋')) {
      level = 'info';
      context = 'presence';
      message = message.replace('👋 ', '');
    } else if (message.includes('💬')) {
      level = 'info';
      context = 'message';
      message = message.replace('💬 ', '');
    } else if (message.includes('🎨')) {
      level = 'debug';
      context = 'avatar';
      message = message.replace('🎨 ', '');
    } else if (message.includes('👁️')) {
      level = 'debug';
      context = 'visibility';
      message = message.replace('👁️ ', '');
    } else if (message.includes('🔄')) {
      level = 'debug';
      message = message.replace('🔄 ', '');
    } else if (message.includes('🎯')) {
      level = 'debug';
      message = message.replace('🎯 ', '');
    } else if (message.includes('📨')) {
      level = 'info';
      context = 'message';
      message = message.replace('📨 ', '');
    } else if (message.includes('🌐')) {
      level = 'info';
      context = 'network';
      message = message.replace('🌐 ', '');
    } else if (message.includes('📁')) {
      level = 'debug';
      message = message.replace('📁 ', '');
    } else if (message.includes('👂')) {
      level = 'debug';
      context = 'event';
      message = message.replace('👂 ', '');
    }
    
    return `Logger.${level}("${message}", null, '${context}');`;
  }
);

// Pattern 2: console.log with data
content = content.replace(
  /console\.log\("([^"]*)",\s*([^;]+)\);/g,
  (match, message, data) => {
    let level = 'info';
    let context = 'general';
    
    if (message.includes('🚀')) {
      level = 'info';
      message = message.replace('🚀 ', '');
    } else if (message.includes('✅')) {
      level = 'success';
      message = message.replace('✅ ', '');
    } else if (message.includes('❌')) {
      level = 'error';
      message = message.replace('❌ ', '');
    } else if (message.includes('⚠️')) {
      level = 'warn';
      message = message.replace('⚠️ ', '');
    } else if (message.includes('🔍')) {
      level = 'debug';
      message = message.replace('🔍 ', '');
    } else if (message.includes('📡')) {
      level = 'debug';
      context = 'realtime';
      message = message.replace('📡 ', '');
    } else if (message.includes('👋')) {
      level = 'info';
      context = 'presence';
      message = message.replace('👋 ', '');
    } else if (message.includes('💬')) {
      level = 'info';
      context = 'message';
      message = message.replace('💬 ', '');
    } else if (message.includes('🎨')) {
      level = 'debug';
      context = 'avatar';
      message = message.replace('🎨 ', '');
    } else if (message.includes('👁️')) {
      level = 'debug';
      context = 'visibility';
      message = message.replace('👁️ ', '');
    } else if (message.includes('🔄')) {
      level = 'debug';
      message = message.replace('🔄 ', '');
    } else if (message.includes('🎯')) {
      level = 'debug';
      message = message.replace('🎯 ', '');
    } else if (message.includes('📨')) {
      level = 'info';
      context = 'message';
      message = message.replace('📨 ', '');
    } else if (message.includes('🌐')) {
      level = 'info';
      context = 'network';
      message = message.replace('🌐 ', '');
    } else if (message.includes('📁')) {
      level = 'debug';
      message = message.replace('📁 ', '');
    } else if (message.includes('👂')) {
      level = 'debug';
      context = 'event';
      message = message.replace('👂 ', '');
    }
    
    return `Logger.${level}("${message}", ${data}, '${context}');`;
  }
);

// Pattern 3: Template literals
content = content.replace(
  /console\.log\(`([^`]*)`\);/g,
  (match, message) => {
    let level = 'info';
    let context = 'general';
    
    if (message.includes('🚀')) {
      level = 'info';
      message = message.replace('🚀 ', '');
    } else if (message.includes('✅')) {
      level = 'success';
      message = message.replace('✅ ', '');
    } else if (message.includes('❌')) {
      level = 'error';
      message = message.replace('❌ ', '');
    } else if (message.includes('⚠️')) {
      level = 'warn';
      message = message.replace('⚠️ ', '');
    } else if (message.includes('🔍')) {
      level = 'debug';
      message = message.replace('🔍 ', '');
    } else if (message.includes('📡')) {
      level = 'debug';
      context = 'realtime';
      message = message.replace('📡 ', '');
    } else if (message.includes('👋')) {
      level = 'info';
      context = 'presence';
      message = message.replace('👋 ', '');
    } else if (message.includes('💬')) {
      level = 'info';
      context = 'message';
      message = message.replace('💬 ', '');
    } else if (message.includes('🎨')) {
      level = 'debug';
      context = 'avatar';
      message = message.replace('🎨 ', '');
    } else if (message.includes('👁️')) {
      level = 'debug';
      context = 'visibility';
      message = message.replace('👁️ ', '');
    } else if (message.includes('🔄')) {
      level = 'debug';
      message = message.replace('🔄 ', '');
    } else if (message.includes('🎯')) {
      level = 'debug';
      message = message.replace('🎯 ', '');
    } else if (message.includes('📨')) {
      level = 'info';
      context = 'message';
      message = message.replace('📨 ', '');
    } else if (message.includes('🌐')) {
      level = 'info';
      context = 'network';
      message = message.replace('🌐 ', '');
    } else if (message.includes('📁')) {
      level = 'debug';
      message = message.replace('📁 ', '');
    } else if (message.includes('👂')) {
      level = 'debug';
      context = 'event';
      message = message.replace('👂 ', '');
    }
    
    return `Logger.${level}(\`${message}\`, null, '${context}');`;
  }
);

// Pattern 4: Template literals with data
content = content.replace(
  /console\.log\(`([^`]*)`,\s*([^;]+)\);/g,
  (match, message, data) => {
    let level = 'info';
    let context = 'general';
    
    if (message.includes('🚀')) {
      level = 'info';
      message = message.replace('🚀 ', '');
    } else if (message.includes('✅')) {
      level = 'success';
      message = message.replace('✅ ', '');
    } else if (message.includes('❌')) {
      level = 'error';
      message = message.replace('❌ ', '');
    } else if (message.includes('⚠️')) {
      level = 'warn';
      message = message.replace('⚠️ ', '');
    } else if (message.includes('🔍')) {
      level = 'debug';
      message = message.replace('🔍 ', '');
    } else if (message.includes('📡')) {
      level = 'debug';
      context = 'realtime';
      message = message.replace('📡 ', '');
    } else if (message.includes('👋')) {
      level = 'info';
      context = 'presence';
      message = message.replace('👋 ', '');
    } else if (message.includes('💬')) {
      level = 'info';
      context = 'message';
      message = message.replace('💬 ', '');
    } else if (message.includes('🎨')) {
      level = 'debug';
      context = 'avatar';
      message = message.replace('🎨 ', '');
    } else if (message.includes('👁️')) {
      level = 'debug';
      context = 'visibility';
      message = message.replace('👁️ ', '');
    } else if (message.includes('🔄')) {
      level = 'debug';
      message = message.replace('🔄 ', '');
    } else if (message.includes('🎯')) {
      level = 'debug';
      message = message.replace('🎯 ', '');
    } else if (message.includes('📨')) {
      level = 'info';
      context = 'message';
      message = message.replace('📨 ', '');
    } else if (message.includes('🌐')) {
      level = 'info';
      context = 'network';
      message = message.replace('🌐 ', '');
    } else if (message.includes('📁')) {
      level = 'debug';
      message = message.replace('📁 ', '');
    } else if (message.includes('👂')) {
      level = 'debug';
      context = 'event';
      message = message.replace('👂 ', '');
    }
    
    return `Logger.${level}(\`${message}\`, ${data}, '${context}');`;
  }
);

// Count remaining console.log statements
const remainingConsoleLogs = (content.match(/console\.log/g) || []).length;
const replacedLogs = originalConsoleLogs - remainingConsoleLogs;

console.log(`✅ Replaced ${replacedLogs} console.log statements`);
console.log(`📊 Remaining console.log statements: ${remainingConsoleLogs}`);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log(`📄 Updated file size: ${content.length} characters`);
console.log('🎉 Automated logging replacement complete!');
