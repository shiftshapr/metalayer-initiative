#!/usr/bin/env node
/**
 * Runtime Issues Diagnostic
 * Checks for common issues that prevent messages and visibility from working
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Runtime Issues Diagnostic\n');
console.log('='.repeat(60));

let issues = [];
let warnings = [];
let successes = [];

// Check 1: TypeScript compilation
console.log('\n1️⃣  TypeScript Compilation...');
try {
  const result = execSync('cd presence && npx tsc --noEmit 2>&1', { encoding: 'utf-8' });
  if (result.trim() === '') {
    console.log('   ✅ No TypeScript errors');
    successes.push('TypeScript compilation');
  } else {
    console.log('   ❌ TypeScript errors found:');
    console.log('   ' + result.split('\n').slice(0, 5).join('\n   '));
    issues.push('TypeScript compilation errors');
  }
} catch (error) {
  console.log('   ❌ TypeScript check failed:', error.message);
  issues.push('TypeScript check failed');
}

// Check 2: Extension build
console.log('\n2️⃣  Extension Build...');
try {
  const buildInfo = path.join(__dirname, '..', 'presence', 'extension', '.build-info.json');
  if (fs.existsSync(buildInfo)) {
    const info = JSON.parse(fs.readFileSync(buildInfo, 'utf-8'));
    console.log(`   ✅ Build #${info.buildNumber} found`);
    successes.push('Extension build exists');
  } else {
    console.log('   ⚠️  Build info not found - may need to rebuild');
    warnings.push('Extension build info missing');
  }
} catch (error) {
  console.log('   ⚠️  Could not check build info:', error.message);
  warnings.push('Build info check failed');
}

// Check 3: Backend API - Messages
console.log('\n3️⃣  Messages API...');
const checkMessagesAPI = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3002,
      path: '/api/messages?pageId=test',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.items && Array.isArray(json.items)) {
            console.log(`   ✅ API responding (${json.items.length} items)`);
            if (json.items.length === 0) {
              warnings.push('Messages API returns empty array');
            }
            successes.push('Messages API responding');
          } else {
            console.log('   ⚠️  API response format unexpected:', Object.keys(json));
            warnings.push('Messages API response format unexpected');
          }
        } catch (e) {
          console.log('   ❌ API response not valid JSON');
          issues.push('Messages API invalid response');
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ API error: ${error.message}`);
      issues.push(`Messages API error: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log('   ❌ API timeout');
      issues.push('Messages API timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
};

// Check 4: Backend API - Presence
console.log('\n4️⃣  Presence API...');
const checkPresenceAPI = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3002,
      path: '/v1/presence/active?pageId=test',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Presence API responding');
          successes.push('Presence API responding');
        } else {
          console.log(`   ⚠️  Presence API status: ${res.statusCode}`);
          warnings.push(`Presence API status ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`   ⚠️  Presence API error: ${error.message}`);
      warnings.push(`Presence API error: ${error.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log('   ⚠️  Presence API timeout');
      warnings.push('Presence API timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
};

// Check 5: Critical files exist
console.log('\n5️⃣  Critical Files...');
const criticalFiles = [
  'presence/src/features/MessagesModule.ts',
  'presence/src/features/visibility/core/VisibilityManager.ts',
  'presence/src/features/visibility/ui/VisibilityTab.ts',
  'presence/src/core/StateManager.ts'
];

criticalFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file}`);
    successes.push(`File exists: ${file}`);
  } else {
    console.log(`   ❌ ${file} MISSING`);
    issues.push(`Missing file: ${file}`);
  }
});

// Check 6: Module exports
console.log('\n6️⃣  Module Exports...');
const checkExports = () => {
  const messagesModule = path.join(__dirname, '..', 'presence', 'src', 'features', 'MessagesModule.ts');
  if (fs.existsSync(messagesModule)) {
    const content = fs.readFileSync(messagesModule, 'utf-8');
    if (content.includes('export') && (content.includes('loadChatHistory') || content.includes('export function'))) {
      console.log('   ✅ MessagesModule has exports');
      successes.push('MessagesModule exports');
    } else {
      console.log('   ⚠️  MessagesModule exports unclear');
      warnings.push('MessagesModule exports unclear');
    }
  }
};

// Run async checks
(async () => {
  await checkMessagesAPI();
  await checkPresenceAPI();
  checkExports();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Diagnostic Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${successes.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`❌ Issues: ${issues.length}`);

  if (issues.length > 0) {
    console.log('\n❌ Critical Issues:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ No issues detected at system level.');
    console.log('   Next: Check browser console for runtime errors.');
  } else {
    console.log('\n💡 Next Steps:');
    console.log('   1. Fix critical issues above');
    console.log('   2. Check browser console for runtime errors');
    console.log('   3. Verify extension is loaded correctly');
    console.log('   4. Test messages/visibility manually');
  }

  process.exit(issues.length > 0 ? 1 : 0);
})();

