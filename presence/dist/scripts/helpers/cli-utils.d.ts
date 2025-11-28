/**
 * CLI Utilities for Diagnostic Scripts
 * Provides type-safe CLI argument parsing and validation
 */
export interface CLIOptions {
    /** File paths or globs to process */
    files?: string[];
    /** Verbose output */
    verbose?: boolean;
    /** Help flag */
    help?: boolean;
    /** Additional custom options */
    [key: string]: unknown;
}
export interface ParsedCLIArgs {
    /** Parsed options */
    options: CLIOptions;
    /** Positional arguments */
    positional: string[];
    /** Raw arguments */
    raw: string[];
}
/**
 * Parse CLI arguments with explicit type safety
 * @param args - Process arguments (default: process.argv.slice(2))
 * @returns Parsed CLI arguments with explicit types
 */
export declare function parseCLIArgs(args?: string[]): ParsedCLIArgs;
/**
 * Get file paths from CLI args or return default
 * @param parsedArgs - Parsed CLI arguments
 * @param defaultFiles - Default files to use if none provided
 * @returns Array of file paths
 */
export declare function getFilesFromCLI(parsedArgs: ParsedCLIArgs, defaultFiles?: string[]): string[];
/**
 * Print help message
 * @param scriptName - Name of the script
 * @param description - Description of what the script does
 * @param usage - Usage examples
 */
export declare function printHelp(scriptName: string, description: string, usage?: string[]): void;
//# sourceMappingURL=cli-utils.d.ts.map