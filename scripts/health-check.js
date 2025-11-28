#!/usr/bin/env node
/**
 * Health Check Script
 * Verifies system is running correctly
 * 
 * Usage: node scripts/health-check.js
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env file if it exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const PORT = process.env.PORT || 3002;
const HEALTH_ENDPOINTS = [
  { path: '/api/messages?pageId=test', name: 'Messages API' },
  { path: '/auth/debug', name: 'Auth Debug' }
];

let exitCode = 0;
const errors = [];
const successes = [];

console.log('🏥 Starting health check...\n');

// Check 1: PM2 Status
console.log('1️⃣  Checking PM2 status...');
try {
  const pm2Status = execSync('pm2 status --no-color', { encoding: 'utf-8' });
  if (pm2Status.includes('metalayer-api') && pm2Status.includes('online')) {
    console.log('   ✅ PM2: metalayer-api is online');
    successes.push('PM2 status');
  } else {
    console.log('   ❌ PM2: metalayer-api is not online');
    errors.push('PM2: metalayer-api not online');
    exitCode = 1;
  }
} catch (error) {
  console.log('   ❌ PM2: Error checking status');
  errors.push(`PM2: ${error.message}`);
  exitCode = 1;
}

// Check 2: Backend is listening
console.log(`\n2️⃣  Checking if backend is listening on port ${PORT}...`);
const checkPort = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/auth/debug',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log(`   ✅ Backend is responding on port ${PORT}`);
        successes.push('Backend listening');
        resolve(true);
      } else {
        console.log(`   ⚠️  Backend responded with status ${res.statusCode}`);
        errors.push(`Backend: Status ${res.statusCode}`);
        exitCode = 1;
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log(`   ❌ Backend not responding: ${error.message}`);
      errors.push(`Backend: ${error.message}`);
      exitCode = 1;
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ Backend request timed out');
      errors.push('Backend: Request timeout');
      exitCode = 1;
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// Check 3: API Endpoints
const checkEndpoints = async () => {
  console.log('\n3️⃣  Checking API endpoints...');
  
  for (const endpoint of HEALTH_ENDPOINTS) {
    try {
      const result = await new Promise((resolve) => {
        const req = http.request({
          hostname: 'localhost',
          port: PORT,
          path: endpoint.path,
          method: 'GET',
          timeout: 3000
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 401) {
              console.log(`   ✅ ${endpoint.name}: OK (${res.statusCode})`);
              successes.push(endpoint.name);
              resolve(true);
            } else {
              console.log(`   ⚠️  ${endpoint.name}: Status ${res.statusCode}`);
              errors.push(`${endpoint.name}: Status ${res.statusCode}`);
              exitCode = 1;
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          console.log(`   ❌ ${endpoint.name}: ${error.message}`);
          errors.push(`${endpoint.name}: ${error.message}`);
          exitCode = 1;
          resolve(false);
        });

        req.on('timeout', () => {
          console.log(`   ❌ ${endpoint.name}: Timeout`);
          errors.push(`${endpoint.name}: Timeout`);
          exitCode = 1;
          req.destroy();
          resolve(false);
        });

        req.end();
      });
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
      errors.push(`${endpoint.name}: ${error.message}`);
      exitCode = 1;
    }
  }
};

// Check 4: Environment Variables
console.log('\n4️⃣  Checking environment variables...');
const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName] || !process.env[varName].trim()) {
    missingVars.push(varName);
    console.log(`   ❌ Missing: ${varName}`);
  } else {
    console.log(`   ✅ ${varName}: Set`);
  }
}

if (missingVars.length > 0) {
  errors.push(`Missing env vars: ${missingVars.join(', ')}`);
  exitCode = 1;
} else {
  successes.push('Environment variables');
}

// Run all checks
(async () => {
  await checkPort();
  await checkEndpoints();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Health Check Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${successes.length}`);
  console.log(`❌ Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`   - ${error}`));
  }

  if (successes.length > 0 && errors.length === 0) {
    console.log('\n✅ All checks passed! System is healthy.');
  } else if (errors.length > 0) {
    console.log('\n⚠️  Some checks failed. Review errors above.');
  }

  process.exit(exitCode);
})();

