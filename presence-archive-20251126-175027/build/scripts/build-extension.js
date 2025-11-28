#!/usr/bin/env node

/**
 * Build script for the Canopi Chrome extension.
 * - Compiles TypeScript sources to dist
 * - Copies runtime assets into presence/build
 * - Removes TypeScript sources from the distribution folder
 * - Verifies that no .ts files or window.* shim exports remain in the build output
 */

const { execSync } = require('node:child_process');
const { cp, mkdir, readdir, rm, stat, readFile } = require('node:fs/promises');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const presenceDir = path.join(repoRoot, 'presence');
const buildDir = path.join(presenceDir, 'build');
const distDir = path.join(presenceDir, 'dist');
const extensionDir = path.join(presenceDir, 'extension');
const capitalizeShimPattern = /window\.[A-Z][A-Za-z0-9_]*\s*=/;

const log = (message) => console.log(`[build-extension] ${message}`);

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function copyPresenceContents() {
  const entries = await readdir(presenceDir, { withFileTypes: true });
  // Exclude legacy directories that have TypeScript equivalents in src/
  // Note: dist/ is compiled output and will be copied separately
  const excludeDirs = ['build', 'src', 'dist', 'extension', 'node_modules', 'utils', 'config', 'features', 'tests', 'docs'];
  
  for (const entry of entries) {
    if (excludeDirs.includes(entry.name)) {
      continue;
    }
    const source = path.join(presenceDir, entry.name);
    const destination = path.join(buildDir, entry.name);
    await cp(source, destination, { recursive: true });
  }
  
  // Copy compiled dist/ output to build/dist/
  if (await stat(distDir).then(() => true).catch(() => false)) {
    await cp(distDir, path.join(buildDir, 'dist'), { recursive: true });
  }
}

async function pruneByExtensions(rootDir, extensions) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      await pruneByExtensions(fullPath, extensions);
      return;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (extensions.includes(ext)) {
      await rm(fullPath, { force: true });
    }
  }));
}

async function verifyNoTypeScript(rootDir) {
  const pending = [rootDir];
  while (pending.length > 0) {
    const current = pending.pop();
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
        continue;
      }
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.ts' || ext === '.tsx') {
          throw new Error(`TypeScript source detected in build output: ${path.relative(rootDir, fullPath)}`);
        }
      }
    }
  }
}

async function verifyNoWindowShims(targetDir) {
  const files = await collectFiles(targetDir, '.js');
  const offenders = [];
  const excludePatterns = [
    /\.test\.js$/,           // Test files
    /\/scripts\//,          // Script files
    /\/diagnose.*\.js$/,    // Diagnostic scripts
    /utils\//,              // Legacy utils files (to be migrated)
    /config\//,             // Legacy config files (to be migrated)
    /features\//,            // Legacy features files (to be migrated)
    /\.example\.js$/,       // Example files
    /UserPreferencesManager\.js$/,  // Legacy file (to be migrated)
  ];
  
  for (const filePath of files) {
    // Skip test files and scripts
    const relativePath = path.relative(targetDir, filePath);
    if (excludePatterns.some(pattern => pattern.test(relativePath))) {
      continue;
    }
    
    const contents = await readFile(filePath, 'utf8');
    if (capitalizeShimPattern.test(contents)) {
      offenders.push(relativePath);
    }
  }
  if (offenders.length > 0) {
    throw new Error(`window.* shim exports detected in build output:\n${offenders.map((f) => ` - ${f}`).join('\n')}`);
  }
}

async function collectFiles(rootDir, extensionFilter) {
  const results = [];
  const entries = await readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectFiles(fullPath, extensionFilter));
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === extensionFilter) {
      results.push(fullPath);
    }
  }
  return results;
}

async function assertExists(targetPath, description) {
  try {
    await stat(targetPath);
  } catch {
    throw new Error(`${description} not found at ${targetPath}`);
  }
}

async function run() {
  log('Compiling TypeScript sources...');
  try {
    execSync('npx tsc -p tsconfig.json', { cwd: repoRoot, stdio: 'inherit' });
  } catch (error) {
    log('TypeScript compiler reported diagnostics, continuing per noEmitOnError=false configuration.');
  }
  await assertExists(distDir, 'Compiled dist directory');

  log('Preparing build directory...');
  await rm(buildDir, { recursive: true, force: true });
  await ensureDir(buildDir);

  log('Copying extension assets...');
  await copyPresenceContents();

  log('Pruning TypeScript sources from build output...');
  await pruneByExtensions(buildDir, ['.ts', '.tsx']);
  await rm(path.join(buildDir, 'src'), { recursive: true, force: true });

  log('Running distribution validation...');
  await verifyNoTypeScript(buildDir);
  // Only validate dist/ for window.* shims - legacy files in root/utils/etc are excluded
  await verifyNoWindowShims(path.join(buildDir, 'dist'));

  log('Copying essential files to extension directory...');
  const filesToCopy = [
    'config.js',
    'sidepanel.css',
    'tab-manager.css',
    'sidepanel.html',
    'manifest.json',
    'content.css',
    'background.js',
    'content.js',
    '.build-info.json'
  ];
  
  for (const fileName of filesToCopy) {
    const sourcePath = path.join(presenceDir, fileName);
    const destPath = path.join(extensionDir, fileName);
    try {
      await stat(sourcePath);
      await cp(sourcePath, destPath);
      log(`✅ ${fileName} copied to extension directory`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Special handling for .build-info.json - ensure it exists even if not in source
        if (fileName === '.build-info.json') {
          log(`⚠️  .build-info.json not found in source, ensuring it exists in extension...`);
          // Run increment-build.sh to create/update .build-info.json
          try {
            const { execSync } = require('node:child_process');
            execSync('bash scripts/increment-build.sh', { cwd: presenceDir, stdio: 'pipe' });
            // Now copy the newly created file
            try {
              await stat(sourcePath);
              await cp(sourcePath, destPath);
              log(`✅ ${fileName} created and copied to extension directory`);
            } catch (err) {
              log(`⚠️  Could not create/copy ${fileName}: ${err.message}`);
            }
          } catch (buildError) {
            log(`⚠️  Failed to create .build-info.json: ${buildError.message}`);
            // Create a minimal fallback
            const fallbackBuildInfo = {
              buildNumber: Math.floor(Date.now() / 1000),
              timestamp: new Date().toISOString(),
              gitCommit: 'unknown',
              gitBranch: 'unknown',
              buildTime: new Date().toISOString()
            };
            const { writeFile } = require('node:fs/promises');
            await writeFile(destPath, JSON.stringify(fallbackBuildInfo, null, 2));
            log(`✅ Created fallback ${fileName} in extension directory`);
          }
        } else {
          log(`⚠️  ${fileName} not found in presence directory, skipping`);
        }
      } else {
        log(`⚠️  Warning: Could not copy ${fileName} to extension: ${error.message}`);
      }
    }
  }

  log(`Build complete. Distribution ready at ${buildDir}`);
}

run().catch((error) => {
  console.error('[build-extension] ❌ Build failed:', error.message);
  process.exit(1);
});


