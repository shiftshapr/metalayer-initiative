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
const capitalizeShimPattern = /window\.[A-Z][A-Za-z0-9_]*\s*=/;

const log = (message) => console.log(`[build-extension] ${message}`);

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function copyPresenceContents() {
  const entries = await readdir(presenceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'build') {
      continue;
    }
    const source = path.join(presenceDir, entry.name);
    const destination = path.join(buildDir, entry.name);
    await cp(source, destination, { recursive: true });
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
  for (const filePath of files) {
    const contents = await readFile(filePath, 'utf8');
    if (capitalizeShimPattern.test(contents)) {
      offenders.push(path.relative(targetDir, filePath));
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
  await verifyNoWindowShims(path.join(buildDir, 'dist'));

  log(`Build complete. Distribution ready at ${buildDir}`);
}

run().catch((error) => {
  console.error('[build-extension] ❌ Build failed:', error.message);
  process.exit(1);
});


