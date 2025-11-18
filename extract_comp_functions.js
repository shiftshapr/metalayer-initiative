#!/usr/bin/env node
/**
 * Extract all functions from COMP CanopiModule.js
 */

const { execSync } = require('child_process');

const compCode = execSync('git show 8d4bf64:presence/features/CanopiModule.js', { encoding: 'utf-8' });

// Extract function definitions
const functionPattern = /^(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/gm;
const functions = {};

let match;
while ((match = functionPattern.exec(compCode)) !== null) {
  const funcName = match[1];
  const startPos = match.index;
  
  // Find function end
  let braceCount = 0;
  let inString = false;
  let stringChar = null;
  let foundFirstBrace = false;
  
  for (let i = startPos; i < compCode.length; i++) {
    const char = compCode[i];
    const prevChar = i > 0 ? compCode[i - 1] : '';
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      stringChar = null;
    }
    
    if (!inString) {
      if (char === '{') {
        if (!foundFirstBrace) foundFirstBrace = true;
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && foundFirstBrace) {
          functions[funcName] = compCode.substring(startPos, i + 1);
          break;
        }
      }
    }
  }
}

// List all functions
console.log('Functions found in COMP:');
Object.keys(functions).sort().forEach(name => {
  console.log(`- ${name}`);
});

console.log(`\nTotal: ${Object.keys(functions).length} functions`);

// Missing functions from audit
const missingFunctions = [
  'sendMessageViaSupabase',
  'checkAndAddThreadToggle',
  'getSenderInitial',
  'getSenderAvatar',
  'sendSupabaseMessage',
  'convertSupabaseMessageToAPIFormat',
  'handleReactionClick',
  'updateReactionsDisplay',
  'createReactionButton',
  'getReactionEmoji',
  'updateReactionCounts',
  'handleReplyToMessage',
  'handleDeleteMessage',
  'handleEditMessage',
  'handleShareMessage',
  'handleStartThread',
  'formatMessageTime',
  'getMessageActionMenu',
  'canUserEditMessage',
  'handleCopyLink',
  'focusOnMessage',
  'parseMessageUrl',
  'handleIncomingMessageUrl',
  'handleBackNavigation',
  'handleReaction',
  'toggleThreadReplies',
  'setupMessageInputEventListeners',
  'handleKeyDown',
  'handleButtonClick',
  'saveEdit',
  'cancelEdit',
  'closeModal'
];

console.log('\n\nMissing functions to extract:');
missingFunctions.forEach(name => {
  if (functions[name]) {
    console.log(`\n// ===== ${name} =====`);
    console.log(functions[name]);
  } else {
    console.log(`\n// ⚠️  ${name} NOT FOUND in COMP`);
  }
});

