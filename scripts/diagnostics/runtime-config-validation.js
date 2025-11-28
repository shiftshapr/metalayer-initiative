#!/usr/bin/env node
/**
 * Runtime configuration diagnostic
 *
 * Reproduces the Slice 4 failure mode by temporarily removing Supabase/CORS
 * environment variables and asserting that validateEnv() fails fast.
 * Before the Slice 4 fix, the validator ignores these keys, so the diagnostic
 * reports a failure. After the fix, the validator should throw immediately,
 * proving the regression cannot return.
 *
 * Usage:
 *   node scripts/diagnostics/runtime-config-validation.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..', '..');
const envFile = findEnvFile();
if (envFile) {
  dotenv.config({ path: envFile });
  console.log(`🔍 DIAGNOSTIC: Loaded env file ${envFile}`);
} else {
  console.log('⚠️  DIAGNOSTIC: No env file found, relying on process.env');
}

const validateEnv = require('../../config/validateEnv');

const targetVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'ALLOWED_ORIGINS'];
const baselineRequired = {
  SESSION_SECRET: '__diag_session_secret__',
  GOOGLE_CLIENT_ID: '__diag_google_client_id__',
  GOOGLE_CLIENT_SECRET: '__diag_google_client_secret__',
  GOOGLE_CALLBACK_URL: 'https://diag.canopi.local/auth/callback'
};

function findEnvFile() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const candidate = path.join(projectRoot, `.env.${nodeEnv}`);
  if (fs.existsSync(candidate)) {
    return candidate;
  }
  const fallback = path.join(projectRoot, '.env');
  return fs.existsSync(fallback) ? fallback : null;
}

function runScenario(variable) {
  const restoredCoreVars = [];

  Object.entries(baselineRequired).forEach(([key, value]) => {
    if (!process.env[key] || process.env[key].trim() === '') {
      process.env[key] = value;
      restoredCoreVars.push(key);
    }
  });

  const originalValue = process.env[variable];
  delete process.env[variable];

  const result = {
    variable,
    passed: false,
    error: null
  };

  try {
    validateEnv();
    result.error = 'Validator did not fail when variable was missing';
  } catch (error) {
    result.passed = true;
    result.error = error instanceof Error ? error.message : String(error);
  } finally {
    if (originalValue !== undefined) {
      process.env[variable] = originalValue;
    }

    restoredCoreVars.forEach(key => {
      delete process.env[key];
    });
  }

  return result;
}

function main() {
  const baseline = [];
  console.log('🔍 DIAGNOSTIC: Checking runtime config enforcement...');
  for (const variable of targetVars) {
    const scenarioResult = runScenario(variable);
    baseline.push(scenarioResult);
  }

  const failures = baseline.filter(entry => !entry.passed);
  const status = failures.length === 0 ? 'passed' : 'failed';

  console.log('🔍 DIAGNOSTIC RESULT:', JSON.stringify({ status, baseline }, null, 2));

  if (status === 'failed') {
    process.exitCode = 1;
  }
}

main();

