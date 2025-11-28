/**
 * File Walker Utilities for Diagnostic Scripts
 * Provides type-safe file system traversal
 */
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
export declare function walkDirectory(dir: string, baseDir?: string, options?: FileWalkerOptions): FileInfo[];
/**
 * Find TypeScript files in a directory
 * @param dir - Directory to search
 * @param baseDir - Base directory for relative paths
 * @returns Array of file information
 */
export declare function findTypeScriptFiles(dir: string, baseDir?: string): FileInfo[];
/**
 * Resolve file path with multiple possible locations
 * @param importPath - Import path to resolve
 * @param projectRoot - Project root directory
 * @param fromFile - File making the import (for relative paths)
 * @returns Resolved file path or null if not found
 */
export declare function resolveImportPath(importPath: string, projectRoot: string, fromFile?: string): string | null;
//# sourceMappingURL=file-walker.d.ts.map