#!/usr/bin/env node

/**
 * Enforces the fallback and boundary policy for the presence TypeScript codebase.
 * Fails if new snake_case field access or legacy fallback chains appear outside
 * approved helpers or boundary files.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');
const GUARDED_FILES = new Set([
  'features/VisibilityManager.ts',
  'features/CommunitiesModule.ts',
  'features/CanopiModule.ts',
  'features/APIModule.ts',
  'core/UserModule.ts',
  'utils/AvatarUtils.ts',
  'utils/Fallbacks.ts',
  'utils/provenance/ProvenanceService.ts'
]);

const ALLOWED_SNAKE_CASE_FILES = new Set([
  'features/APIModule.ts',
  'features/CanopiModule.ts',
  'features/CommunitiesModule.ts',
  'features/VisibilityManager.ts',
  'core/UserModule.ts',
  'features/ProfileManager.ts', // legacy module still normalizing Supabase payloads
  'features/UserHoverModal.ts' // realtime handler awaiting refactor
]);

const SNAKE_CASE_PATTERNS = [
  { regex: /\.user_id\b/, token: 'user_id' },
  { regex: /\.created_at\b/, token: 'created_at' },
  { regex: /\.updated_at\b/, token: 'updated_at' },
  { regex: /\.avatar_url\b/, token: 'avatar_url' },
  { regex: /\.aura_color\b/, token: 'aura_color' },
  { regex: /\.parent_id\b/, token: 'parent_id' },
  { regex: /\.page_id\b/, token: 'page_id' },
  { regex: /\.message_id\b/, token: 'message_id' },
  { regex: /\.community_id\b/, token: 'community_id' }
];

const FALLBACK_PATTERNS = [
  {
    regex: /\|\|\s*['"]Unknown['"]/,
    message: "Use formatUserDisplayName/formatAuthorName helpers instead of inline `'Unknown'` fallbacks.",
    allowFiles: new Set(['utils/Fallbacks.ts'])
  },
  {
    regex: /\|\|\s*['"]unknown['"]/,
    message: "Wrap `'unknown'` fallbacks in format helpers (formatUserDisplayName, formatAuthorName, getUserIdentity).",
    allowFiles: new Set(['utils/Fallbacks.ts'])
  },
  {
    regex: /\|\|\s*['"]#aaaaaa['"]/i,
    message: "Use getAuraColorValue helper instead of inline `#aaaaaa` fallback.",
    allowFiles: new Set(['utils/Fallbacks.ts'])
  },
  {
    regex: /\|\|\s*['"]\/icons\/default-user\.svg['"]/,
    message: "Use getAvatarUrlWithFallback helper instead of inline avatar fallback.",
    allowFiles: new Set(['utils/Fallbacks.ts'])
  }
];

const results = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      inspectFile(fullPath);
    }
  }
}

function inspectFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (GUARDED_FILES.size > 0 && !GUARDED_FILES.has(rel)) {
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  content.forEach((line, index) => {
    SNAKE_CASE_PATTERNS.forEach(({ regex, token }) => {
      if (regex.test(line)) {
        if (!ALLOWED_SNAKE_CASE_FILES.has(rel)) {
          results.push({
            file: rel,
            line: index + 1,
            message: `Disallowed snake_case property '${token}' detected. Normalize at boundary or use helpers.`
          });
        }
      }
    });

    FALLBACK_PATTERNS.forEach(({ regex, message, allowFiles }) => {
      if (regex.test(line) && !allowFiles.has(rel)) {
        results.push({
          file: rel,
          line: index + 1,
          message
        });
      }
    });
  });
}

walk(ROOT);

if (results.length > 0) {
  console.error('\nFallback/Ban policy violations detected:\n');
  for (const violation of results) {
    console.error(`- ${violation.file}:${violation.line} -> ${violation.message}`);
  }
  console.error('\nResolve the issues above or add the file to the allow list with a clear justification.');
  process.exit(1);
} else {
  console.log('✅ Fallback/boundary lint passed (no disallowed patterns found).');
}


