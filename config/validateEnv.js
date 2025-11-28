/**
 * Environment Variable Validation Module
 * 
 * Validates that all required environment variables are present and properly configured.
 * Throws an error on startup if any required variables are missing.
 * 
 * Usage:
 *   const validateEnv = require('./config/validateEnv');
 *   validateEnv();
 */

const REQUIRED_SETS = {
  supabase: ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
};

// SESSION_SECRET is optional - will generate a default for development if not set
const OPTIONAL_REQUIRED = {
  session: ['SESSION_SECRET']
};

// Google OAuth is optional - only required if actually using Google auth
const OPTIONAL_SETS = {
  google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'],
  cors: ['ALLOWED_ORIGINS']
};

const OPTIONAL_VARS = ['PORT', 'HOST', 'NODE_ENV', 'DEEPSEEK_API_KEY'];

let cachedConfig = null;

function collectMissing(keys) {
  return keys.filter(key => {
    const value = process.env[key];
    return !value || value.trim() === '';
  });
}

function parseAllowedOrigins(rawValue) {
  const origins = rawValue
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error(
      'ALLOWED_ORIGINS must include at least one origin, separated by commas'
    );
  }

  const invalidOrigin = origins.find(origin => {
    return !origin.startsWith('http://') && !origin.startsWith('https://');
  });

  if (invalidOrigin) {
    throw new Error(
      `ALLOWED_ORIGINS entry "${invalidOrigin}" must start with http:// or https://`
    );
  }

  return origins;
}

function generateDefaultSessionSecret() {
  // Generate a random secret for development
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

function buildConfig() {
  // Check required variables
  const missing = [
    ...collectMissing(REQUIRED_SETS.supabase)
  ];

  if (missing.length > 0) {
    const error = new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please set these variables in your .env file or environment.'
    );
    error.name = 'EnvironmentValidationError';
    error.missing = missing;
    throw error;
  }

  // SESSION_SECRET is optional - generate default if not set
  // Note: In production, you should set this explicitly, but we allow auto-generation
  // to avoid blocking development
  let sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || !sessionSecret.trim()) {
    sessionSecret = generateDefaultSessionSecret();
    console.warn(
      '⚠️  WARNING: SESSION_SECRET not set. Generated a temporary secret.\n' +
      '   This secret will change on each restart. Set SESSION_SECRET in .env for a persistent secret.'
    );
  } else {
    sessionSecret = sessionSecret.trim();
    if (sessionSecret.length < 32) {
      console.warn(
        '⚠️  WARNING: SESSION_SECRET is shorter than 32 characters. ' +
        'Consider using a longer, more secure secret for production.'
      );
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL.trim();
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error(
      'SUPABASE_URL must be a valid URL starting with http:// or https://'
    );
  }

  // Google OAuth is optional - only validate if all Google vars are present
  const googleMissing = collectMissing(OPTIONAL_SETS.google);
  const hasGoogleAuth = googleMissing.length === 0;
  
  if (hasGoogleAuth) {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL.trim();
    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
      throw new Error(
        'GOOGLE_CALLBACK_URL must be a valid URL starting with http:// or https://'
      );
    }
  }

  // ALLOWED_ORIGINS is optional - default to allowing all if not set
  let allowedOrigins = [];
  if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.trim()) {
    allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
  } else {
    console.warn('⚠️  ALLOWED_ORIGINS not set. CORS will allow all origins.');
    allowedOrigins = []; // Empty array means allow all (handled in app.js)
  }

  return {
    sessionSecret,
    google: hasGoogleAuth ? {
      clientId: process.env.GOOGLE_CLIENT_ID.trim(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
      callbackUrl: process.env.GOOGLE_CALLBACK_URL.trim(),
      enabled: true
    } : {
      enabled: false
    },
    supabase: {
      url: supabaseUrl,
      anonKey: process.env.SUPABASE_ANON_KEY.trim()
    },
    cors: {
      allowedOrigins
    },
    optional: OPTIONAL_VARS.reduce((acc, key) => {
      if (process.env[key]) {
        acc[key] = process.env[key];
      }
      return acc;
    }, {})
  };
}

function validateEnv() {
  cachedConfig = buildConfig();

  console.log('✅ Environment variables validated successfully');
  console.log(`   Required variables: ${Object.values(REQUIRED_SETS).reduce((sum, set) => sum + set.length, 0)} present`);
  console.log(`   Google OAuth: ${cachedConfig.google.enabled ? '✅ enabled' : '⚠️  disabled (optional)'}`);
  console.log(`   CORS origins: ${cachedConfig.cors.allowedOrigins.length > 0 ? `${cachedConfig.cors.allowedOrigins.length} configured` : '⚠️  allowing all (not configured)'}`);
  console.log(`   Optional variables: ${Object.keys(cachedConfig.optional).length}/${OPTIONAL_VARS.length} present`);

  return {
    valid: true,
    required: Object.values(REQUIRED_SETS).reduce((sum, set) => sum + set.length, 0),
    optional: Object.keys(cachedConfig.optional).length
  };
}

function getRuntimeConfig() {
  if (!cachedConfig) {
    cachedConfig = buildConfig();
  }
  return cachedConfig;
}

validateEnv.getRuntimeConfig = getRuntimeConfig;
validateEnv.parseAllowedOrigins = parseAllowedOrigins;

module.exports = validateEnv;




