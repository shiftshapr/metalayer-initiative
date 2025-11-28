/**
 * File Walker Utilities for Diagnostic Scripts
 * Provides type-safe file system traversal
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FileWalkerOptions {
  /** File extensions to include (e.g., ['.ts', '.tsx']) */
  extensions?: string[];
  /** Directories to exclude */
  excludeDirs?: string[];
  /** Files to exclude */
  excludeFiles?: string[];
  /** Maximum depth to traverse (0 = unlimited) */
  maxDepth?: number;
  /** Whether to follow symlinks */
  followSymlinks?: boolean;
}

export interface FileInfo {
  /** Full path to the file */
  fullPath: string;
  /** Relative path from base directory */
  relativePath: string;
  /** File name */
  name: string;
  /** File extension */
  extension: string;
  /** Directory containing the file */
  dir: string;
}

/**
 * Type-safe file walker that recursively finds files matching criteria
 * @param dir - Directory to start walking from
 * @param baseDir - Base directory for relative paths (default: dir)
 * @param options - Walker options
 * @returns Array of file information with explicit types
 */
export function walkDirectory(
  dir: string,
  baseDir: string = dir,
  options: FileWalkerOptions = {}
): FileInfo[] {
  const {
    extensions = ['.ts', '.tsx'],
    excludeDirs = ['node_modules', '.git', 'dist', 'build', 'extension'],
    excludeFiles = [],
    maxDepth = 0,
    followSymlinks = false
  } = options;

  const results: FileInfo[] = [];
  const currentDepth = dir === baseDir ? 0 : dir.split(path.sep).length - baseDir.split(path.sep).length;

  if (maxDepth > 0 && currentDepth >= maxDepth) {
    return results;
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      // Skip excluded directories
      if (entry.isDirectory()) {
        if (excludeDirs.includes(entry.name)) {
          continue;
        }
        // Recursively walk subdirectories
        results.push(...walkDirectory(fullPath, baseDir, {
          ...options,
          maxDepth: maxDepth > 0 ? maxDepth - 1 : 0
        }));
        continue;
      }

      // Skip if not a file
      if (!entry.isFile()) {
        continue;
      }

      // Skip excluded files
      if (excludeFiles.includes(entry.name) || excludeFiles.some(ex => relativePath.includes(ex))) {
        continue;
      }

      // Check extension
      const ext = path.extname(entry.name);
      if (!extensions.includes(ext)) {
        continue;
      }

      // Add to results
      results.push({
        fullPath,
        relativePath,
        name: entry.name,
        extension: ext,
        dir: dir
      });
    }
  } catch (error) {
    // Silently skip directories we can't read
    if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
      return results;
    }
    throw error;
  }

  return results;
}

/**
 * Find TypeScript files in a directory
 * @param dir - Directory to search
 * @param baseDir - Base directory for relative paths
 * @returns Array of file information
 */
export function findTypeScriptFiles(
  dir: string,
  baseDir?: string
): FileInfo[] {
  return walkDirectory(dir, baseDir, {
    extensions: ['.ts', '.tsx'],
    excludeDirs: ['node_modules', '.git', 'dist', 'build', 'extension']
  });
}

/**
 * Resolve file path with multiple possible locations
 * @param importPath - Import path to resolve
 * @param projectRoot - Project root directory
 * @param fromFile - File making the import (for relative paths)
 * @returns Resolved file path or null if not found
 */
export function resolveImportPath(
  importPath: string,
  projectRoot: string,
  fromFile?: string
): string | null {
  // Handle relative imports
  if (importPath.startsWith('.')) {
    if (!fromFile) {
      return null;
    }
    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(fromDir, importPath);
    // Try with .ts extension
    if (fs.existsSync(resolved + '.ts')) {
      return resolved + '.ts';
    }
    // Try as directory with index.ts
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      const indexPath = path.join(resolved, 'index.ts');
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
    return null;
  }

  // Handle absolute imports from project root
  const possiblePaths = [
    path.join(projectRoot, 'presence', 'src', importPath + '.ts'),
    path.join(projectRoot, 'presence', 'src', importPath, 'index.ts'),
    path.join(projectRoot, importPath + '.ts'),
    path.join(projectRoot, 'src', importPath + '.ts'),
    path.join(projectRoot, 'src', importPath, 'index.ts')
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  return null;
}

