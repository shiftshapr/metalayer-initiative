#!/usr/bin/env node

/**
 * Unified Build Orchestrator for Canopi Chrome Extension
 * 
 * Single source of truth for building the extension.
 * Output: presence/extension/ directory - ready to load in Chrome
 * 
 * Build stages:
 * 1. Preflight: Validate environment and dependencies
 * 2. Compile: TypeScript compilation to dist/
 * 3. Assemble: Copy files to extension/ with proper structure
 * 4. Metadata: Generate .build-info.json and ensure manifest.json
 * 5. Verify: Validate build output integrity
 */

const { execSync } = require('node:child_process');
const { cp, mkdir, readdir, rm, stat, readFile, writeFile } = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');

// Get script directory (CommonJS provides __dirname automatically)
const repoRoot = path.resolve(__dirname, '..', '..');
const presenceDir = path.join(repoRoot, 'presence');
const distDir = path.join(presenceDir, 'dist');
const extensionDir = path.join(presenceDir, 'extension');

const log = (message) => console.log(`[build-canopi] ${message}`);
const error = (message) => console.error(`[build-canopi] ❌ ${message}`);
const warn = (message) => console.warn(`[build-canopi] ⚠️  ${message}`);

// TypeScript types (for reference, removed in JS version)
// interface BuildInfo {
//   buildNumber: number;
//   timestamp: string;
//   gitCommit: string;
//   gitBranch: string;
//   buildTime: string;
//   firstBuild?: string;
//   lastBuild?: string;
// }

/**
 * Stage 1: Preflight - Validate environment
 */
async function preflight() {
  log('Stage 1: Preflight checks...');
  
  // Check TypeScript config
  const tsconfigPath = path.join(presenceDir, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    throw new Error('tsconfig.json not found');
  }
  log('✅ TypeScript config found');
  
  // Check source directory
  const srcDir = path.join(presenceDir, 'src');
  if (!existsSync(srcDir)) {
    throw new Error('src/ directory not found');
  }
  log('✅ Source directory found');
  
  // Check manifest.json exists in source
  const manifestPath = path.join(presenceDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error('manifest.json not found in presence/ - required for extension');
  }
  log('✅ manifest.json found');
}

/**
 * Stage 2: Compile - TypeScript compilation
 */
async function compile() {
  log('Stage 2: Compiling TypeScript...');
  
  try {
    execSync('npx tsc -p tsconfig.json', { 
      cwd: presenceDir, 
      stdio: 'inherit' 
    });
    log('✅ TypeScript compilation complete');
  } catch (err) {
    warn('TypeScript compilation had errors (continuing with noEmitOnError=false)');
  }
  
  // Verify dist/ was created
  if (!existsSync(distDir)) {
    throw new Error('dist/ directory not created after TypeScript compilation');
  }
  log('✅ Compiled output verified in dist/');
}

/**
 * Stage 3: Assemble - Copy files to extension/
 */
async function assemble() {
  log('Stage 3: Assembling extension directory...');
  
  // Clean extension directory
  if (existsSync(extensionDir)) {
    await rm(extensionDir, { recursive: true, force: true });
    log('🧹 Cleaned extension/ directory');
  }
  await mkdir(extensionDir, { recursive: true });
  
  // Copy compiled TypeScript from dist/ (flatten structure - no dist/ prefix)
  if (existsSync(distDir)) {
    log('📦 Copying compiled TypeScript files...');
    await copyDistToExtension();
  }
  
  // Copy essential manifest and entry files
  log('📄 Copying essential files...');
  const essentialFiles = [
    'manifest.json',
    'sidepanel.html',
    'sidepanel.css',
    'tab-manager.css',
    'content.css',
    'background.js',
    'content.js',
    'config.js'
  ];
  
  for (const file of essentialFiles) {
    const sourcePath = path.join(presenceDir, file);
    const destPath = path.join(extensionDir, file);
    
    if (existsSync(sourcePath)) {
      await cp(sourcePath, destPath);
      log(`   ✓ ${file}`);
    } else {
      warn(`   Missing: ${file}`);
    }
  }
  
  // Copy asset directories
  log('🖼️  Copying asset directories...');
  const assetDirs = ['images', 'lib', 'auth'];
  for (const dir of assetDirs) {
    const sourceDir = path.join(presenceDir, dir);
    const destDir = path.join(extensionDir, dir);
    
    if (existsSync(sourceDir)) {
      await cp(sourceDir, destDir, { recursive: true });
      log(`   ✓ ${dir}/`);
    }
  }
  
  // Remove non-essential files
  log('🧹 Removing non-essential files...');
  await removeNonEssentialFiles();
  
  log('✅ Extension directory assembled');
}

/**
 * Copy dist/ files to extension/ (flattening structure)
 */
async function copyDistToExtension() {
  const allFiles = await collectFiles(distDir);
  let copiedCount = 0;
  
  for (const sourcePath of allFiles) {
    // Skip .d.ts and .map files
    const fileName = path.basename(sourcePath);
    if (fileName.endsWith('.d.ts') || fileName.endsWith('.map')) {
      continue;
    }
    
    const relativePath = path.relative(distDir, sourcePath);
    const destPath = path.join(extensionDir, relativePath);
    const destDir = path.dirname(destPath);
    
    await mkdir(destDir, { recursive: true });
    await cp(sourcePath, destPath);
    copiedCount++;
  }
  
  log(`   ✓ Copied ${copiedCount} compiled TypeScript files`);
}

/**
 * Remove non-essential files from extension/
 */
async function removeNonEssentialFiles() {
  const patternsToRemove = [
    /\.ts$/,
    /\.tsx$/,
    /\.d\.ts$/,
    /\.d\.ts\.map$/,
    /\.map$/,
    /\.md$/,
    /\.test\.js$/,
    /\.spec\.js$/,
    /\.test\.ts$/,
    /\.spec\.ts$/,
    /tsconfig\.json$/,
    /package\.json$/,
    /package-lock\.json$/
  ];
  
  const dirsToRemove = ['src', 'node_modules', '.git', 'tests', 'test', '__tests__'];
  
  // Remove files matching patterns
  const allFiles = await collectFiles(extensionDir);
  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);
    if (patternsToRemove.some(pattern => pattern.test(fileName))) {
      await rm(filePath, { force: true });
    }
  }
  
  // Remove forbidden directories
  for (const dir of dirsToRemove) {
    const dirPath = path.join(extensionDir, dir);
    if (existsSync(dirPath)) {
      await rm(dirPath, { recursive: true, force: true });
      log(`   🗑️  Removed ${dir}/`);
    }
  }
}

/**
 * Collect all files recursively
 */
async function collectFiles(rootDir) {
  const results = [];
  const entries = await readdir(rootDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Stage 4: Metadata - Generate .build-info.json and ensure manifest.json
 */
async function generateMetadata() {
  log('Stage 4: Generating build metadata...');
  
  // Get or create build info
  const buildInfo = await getBuildInfo();
  
  // Write .build-info.json to extension/ (Chrome loads from here)
  const buildInfoPath = path.join(extensionDir, '.build-info.json');
  await writeFile(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  log('✅ Generated .build-info.json in extension/');
  
  // ALSO write to root (in case Chrome loads from presence/ root instead of extension/)
  // CRITICAL: Chrome may load from either location, so we must have it in both
  const rootBuildInfoPath = path.join(presenceDir, '.build-info.json');
  await writeFile(rootBuildInfoPath, JSON.stringify(buildInfo, null, 2));
  log('✅ Generated .build-info.json in root (for compatibility)');
  
  // CRITICAL: Also ensure root manifest.json declares it (if Chrome loads from root)
  const rootManifestPath = path.join(presenceDir, 'manifest.json');
  if (existsSync(rootManifestPath)) {
    const rootManifestContent = await readFile(rootManifestPath, 'utf-8');
    const rootManifest = JSON.parse(rootManifestContent);
    
    let rootHasBuildInfo = false;
    if (rootManifest.web_accessible_resources) {
      for (const resource of rootManifest.web_accessible_resources) {
        if (resource.resources && Array.isArray(resource.resources)) {
          if (resource.resources.includes('.build-info.json')) {
            rootHasBuildInfo = true;
            break;
          }
        }
      }
    }
    
    if (!rootHasBuildInfo) {
      if (rootManifest.web_accessible_resources.length === 0) {
        rootManifest.web_accessible_resources.push({
          resources: ['.build-info.json'],
          matches: ['<all_urls>']
        });
      } else {
        const firstResource = rootManifest.web_accessible_resources[0];
        if (!firstResource.resources) {
          firstResource.resources = [];
        }
        if (!firstResource.resources.includes('.build-info.json')) {
          firstResource.resources.push('.build-info.json');
        }
      }
      
      await writeFile(rootManifestPath, JSON.stringify(rootManifest, null, 2));
      log('✅ Updated root manifest.json to declare .build-info.json');
    }
  }
  
  // Verify manifest.json exists and declares .build-info.json
  const manifestPath = path.join(extensionDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error('manifest.json missing in extension/ after assembly');
  }
  
  const manifestContent = await readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestContent);
  
  // Ensure web_accessible_resources declares .build-info.json
  if (!manifest.web_accessible_resources) {
    manifest.web_accessible_resources = [];
  }
  
  let hasBuildInfo = false;
  for (const resource of manifest.web_accessible_resources) {
    if (resource.resources && Array.isArray(resource.resources)) {
      if (resource.resources.includes('.build-info.json')) {
        hasBuildInfo = true;
        break;
      }
    }
  }
  
  if (!hasBuildInfo) {
    // Add .build-info.json to first web_accessible_resources entry
    if (manifest.web_accessible_resources.length === 0) {
      manifest.web_accessible_resources.push({
        resources: ['.build-info.json'],
        matches: ['<all_urls>']
      });
    } else {
      const firstResource = manifest.web_accessible_resources[0];
      if (!firstResource.resources) {
        firstResource.resources = [];
      }
      if (!firstResource.resources.includes('.build-info.json')) {
        firstResource.resources.push('.build-info.json');
      }
    }
    
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    log('✅ Updated manifest.json to declare .build-info.json');
  } else {
    log('✅ manifest.json already declares .build-info.json');
  }
}

/**
 * Get build info (from existing file or generate new)
 */
async function getBuildInfo() {
  const existingPath = path.join(presenceDir, '.build-info.json');
  
  if (existsSync(existingPath)) {
    try {
      const content = await readFile(existingPath, 'utf-8');
      const existing = JSON.parse(content);
      
      // Increment build number
      const buildInfo = {
        buildNumber: (existing.buildNumber || 0) + 1,
        timestamp: new Date().toISOString(),
        gitCommit: await getGitCommit(),
        gitBranch: await getGitBranch(),
        buildTime: new Date().toISOString(),
        firstBuild: existing.firstBuild || new Date().toISOString(),
        lastBuild: new Date().toISOString()
      };
      
      return buildInfo;
    } catch (err) {
      warn('Could not read existing .build-info.json, creating new');
    }
  }
  
  // Generate new build info
  return {
    buildNumber: 1,
    timestamp: new Date().toISOString(),
    gitCommit: await getGitCommit(),
    gitBranch: await getGitBranch(),
    buildTime: new Date().toISOString(),
    firstBuild: new Date().toISOString(),
    lastBuild: new Date().toISOString()
  };
}

/**
 * Get git commit hash
 */
async function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { 
      cwd: presenceDir,
      encoding: 'utf-8' 
    }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get git branch
 */
async function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { 
      cwd: presenceDir,
      encoding: 'utf-8' 
    }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Stage 5: Verify - Validate build output
 */
async function verify() {
  log('Stage 5: Verifying build output...');
  
  const checks = [
    { path: path.join(extensionDir, 'manifest.json'), name: 'manifest.json' },
    { path: path.join(extensionDir, '.build-info.json'), name: '.build-info.json' },
    { path: path.join(extensionDir, 'sidepanel.html'), name: 'sidepanel.html' },
    { path: path.join(extensionDir, 'core'), name: 'core/ directory' }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (existsSync(check.path)) {
      const stats = await stat(check.path);
      if (stats.size === 0) {
        error(`${check.name} exists but is empty`);
        allPassed = false;
      } else {
        log(`   ✓ ${check.name}`);
      }
    } else {
      error(`${check.name} missing`);
      allPassed = false;
    }
  }
  
  // Verify .build-info.json is valid JSON
  const buildInfoPath = path.join(extensionDir, '.build-info.json');
  try {
    const content = await readFile(buildInfoPath, 'utf-8');
    JSON.parse(content);
    log('   ✓ .build-info.json is valid JSON');
  } catch (err) {
    error('.build-info.json is not valid JSON');
    allPassed = false;
  }
  
  // Verify manifest.json declares .build-info.json
  const manifestPath = path.join(extensionDir, 'manifest.json');
  try {
    const content = await readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    
    let declared = false;
    if (manifest.web_accessible_resources) {
      for (const resource of manifest.web_accessible_resources) {
        if (resource.resources && resource.resources.includes('.build-info.json')) {
          declared = true;
          break;
        }
      }
    }
    
    if (declared) {
      log('   ✓ manifest.json declares .build-info.json');
    } else {
      error('manifest.json does NOT declare .build-info.json in web_accessible_resources');
      allPassed = false;
    }
  } catch (err) {
    error('Could not verify manifest.json');
    allPassed = false;
  }
  
  if (!allPassed) {
    throw new Error('Build verification failed');
  }
  
  log('✅ All verification checks passed');
}

/**
 * Main build function
 */
async function build() {
  try {
    log('🚀 Starting Canopi extension build...');
    log(`   Output: ${extensionDir}`);
    log('');
    
    await preflight();
    await compile();
    await assemble();
    await generateMetadata();
    await verify();
    
    log('');
    log('✅ Build complete! Extension ready in extension/');
    log('');
    log('📦 To load in Chrome:');
    log(`   1. Open chrome://extensions/`);
    log(`   2. Enable 'Developer mode'`);
    log(`   3. Click 'Load unpacked'`);
    log(`   4. Select: ${extensionDir}`);
    log('');
  } catch (err) {
    error(`Build failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

// Run build
build();

