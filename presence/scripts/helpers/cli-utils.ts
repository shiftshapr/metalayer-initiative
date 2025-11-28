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
export function parseCLIArgs(args: string[] = process.argv.slice(2)): ParsedCLIArgs {
  const options: CLIOptions = {};
  const positional: string[] = [];
  const raw: string[] = [...args];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        options[key] = nextArg;
        i++; // Skip next argument as it's the value
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith('-')) {
      // Short flags like -abc
      for (let j = 1; j < arg.length; j++) {
        options[arg[j]] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  // If positional args look like files, add to options.files
  if (positional.length > 0 && !options.files) {
    options.files = positional.filter(p => 
      p.includes('.') || p.includes('/') || p.includes('*')
    );
  }

  return {
    options,
    positional,
    raw
  };
}

/**
 * Get file paths from CLI args or return default
 * @param parsedArgs - Parsed CLI arguments
 * @param defaultFiles - Default files to use if none provided
 * @returns Array of file paths
 */
export function getFilesFromCLI(
  parsedArgs: ParsedCLIArgs,
  defaultFiles: string[] = []
): string[] {
  if (parsedArgs.options.files && Array.isArray(parsedArgs.options.files) && parsedArgs.options.files.length > 0) {
    return parsedArgs.options.files;
  }
  if (parsedArgs.positional.length > 0) {
    return parsedArgs.positional;
  }
  return defaultFiles;
}

/**
 * Print help message
 * @param scriptName - Name of the script
 * @param description - Description of what the script does
 * @param usage - Usage examples
 */
export function printHelp(scriptName: string, description: string, usage?: string[]): void {
  console.log(`\n${scriptName}`);
  console.log(description);
  if (usage && usage.length > 0) {
    console.log('\nUsage:');
    usage.forEach(line => console.log(`  ${line}`));
  }
  console.log('\nOptions:');
  console.log('  --help, -h     Show this help message');
  console.log('  --verbose, -v  Enable verbose output');
  console.log('\n');
}

