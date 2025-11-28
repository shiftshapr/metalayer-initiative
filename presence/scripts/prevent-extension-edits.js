#!/usr/bin/env node

/**
 * PREVENT EXTENSION EDITS
 * 
 * Blocks any edits to extension/, dist/, build/ directories
 * These are build outputs - edit src/ only!
 * 
 * Run: node scripts/prevent-extension-edits.js <file-path>
 * Returns exit code 1 if file is in forbidden directory
 */

const path = require('path');
const fs = require('fs');

const FORBIDDEN_DIRS = [
  'extension/',
  'dist/',
  'build/'
];

const ALLOWED_PATTERNS = [
  // Only allow README/docs in these dirs
  /extension\/.*\.md$/,
  /dist\/.*\.md$/,
  /build\/.*\.md$/,
  // Allow .gitignore, .gitattributes
  /\.gitignore$/,
  /\.gitattributes$/,
];

function isForbidden(filePath) {
  const normalized = path.normalize(filePath);
  
  // Check if file matches allowed patterns
  for (const pattern of ALLOWED_PATTERNS) {
    if (pattern.test(normalized)) {
      return false;
    }
  }
  
  // Check if file is in forbidden directory
  for (const dir of FORBIDDEN_DIRS) {
    if (normalized.includes(dir) && !normalized.includes('node_modules')) {
      return true;
    }
  }
  
  return false;
}

// Get file path from command line
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Usage: node scripts/prevent-extension-edits.js <file-path>');
  process.exit(1);
}

if (isForbidden(filePath)) {
  const relativePath = path.relative(process.cwd(), filePath);
  console.error('═══════════════════════════════════════════════════════════');
  console.error('❌ RED-LINE VIOLATION: FORBIDDEN FILE EDIT');
  console.error('═══════════════════════════════════════════════════════════');
  console.error('');
  console.error(`File: ${relativePath}`);
  console.error('');
  console.error('🚫 RULE: Never edit extension/, dist/, build/');
  console.error('✅ RULE: Edit src/ only');
  console.error('');
  console.error('📋 What to do:');
  console.error('   1. Find or create the source file in src/');
  console.error('   2. Edit the src/ file');
  console.error('   3. Build to generate extension/ files');
  console.error('');
  console.error('🔍 Architecture:');
  console.error('   src/ → (build) → extension/');
  console.error('   src/ → (compile) → dist/');
  console.error('');
  console.error('═══════════════════════════════════════════════════════════');
  process.exit(1);
}

// File is allowed
process.exit(0);




