#!/usr/bin/env node
/**
 * Diagnostic: TypeScript Configuration Alignment
 * 
 * Checks:
 * 1. Root tsconfig.json strict flags
 * 2. Presence tsconfig.json strict flags
 * 3. Type errors after enabling strict mode
 * 4. Build compatibility
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function readTSConfig(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function diagnoseTSConfig() {
  const projectRoot = path.resolve(__dirname, '../..');
  const rootConfigPath = path.join(projectRoot, 'tsconfig.json');
  const presenceConfigPath = path.join(projectRoot, 'presence', 'tsconfig.json');

  const result = {
    rootConfig: {
      path: rootConfigPath,
      exists: fs.existsSync(rootConfigPath),
      strict: false,
      noImplicitAny: false,
      useUnknownInCatchVariables: false,
      issues: [],
    },
    presenceConfig: {
      path: presenceConfigPath,
      exists: fs.existsSync(presenceConfigPath),
      strict: false,
      flags: {
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitReturns: false,
        noFallthroughCasesInSwitch: false,
        noUncheckedIndexedAccess: false,
      },
      issues: [],
    },
    typeErrors: {
      hasErrors: false,
      errorCount: 0,
      errors: [],
    },
    buildStatus: {
      success: false,
    },
  };

  // Check root config
  if (result.rootConfig.exists) {
    const rootConfig = readTSConfig(rootConfigPath);
    if (rootConfig) {
      const opts = rootConfig.compilerOptions || {};
      result.rootConfig.strict = opts.strict === true;
      result.rootConfig.noImplicitAny = opts.noImplicitAny === true;
      result.rootConfig.useUnknownInCatchVariables = opts.useUnknownInCatchVariables === true;

      if (!result.rootConfig.strict) {
        result.rootConfig.issues.push('strict: false (should be true)');
      }
      if (!result.rootConfig.noImplicitAny) {
        result.rootConfig.issues.push('noImplicitAny: false (should be true)');
      }
      if (!result.rootConfig.useUnknownInCatchVariables) {
        result.rootConfig.issues.push('useUnknownInCatchVariables: false (should be true)');
      }
    } else {
      result.rootConfig.issues.push('Failed to parse tsconfig.json');
    }
  } else {
    result.rootConfig.issues.push('File does not exist');
  }

  // Check presence config
  if (result.presenceConfig.exists) {
    const presenceConfig = readTSConfig(presenceConfigPath);
    if (presenceConfig) {
      const opts = presenceConfig.compilerOptions || {};
      result.presenceConfig.strict = opts.strict === true;
      result.presenceConfig.flags.noUnusedLocals = opts.noUnusedLocals === true;
      result.presenceConfig.flags.noUnusedParameters = opts.noUnusedParameters === true;
      result.presenceConfig.flags.noImplicitReturns = opts.noImplicitReturns === true;
      result.presenceConfig.flags.noFallthroughCasesInSwitch = opts.noFallthroughCasesInSwitch === true;
      result.presenceConfig.flags.noUncheckedIndexedAccess = opts.noUncheckedIndexedAccess === true;

      if (!result.presenceConfig.strict) {
        result.presenceConfig.issues.push('strict: false (should be true)');
      }
      if (!result.presenceConfig.flags.noUnusedLocals) {
        result.presenceConfig.issues.push('noUnusedLocals: false (should be true)');
      }
      if (!result.presenceConfig.flags.noUnusedParameters) {
        result.presenceConfig.issues.push('noUnusedParameters: false (should be true)');
      }
      if (!result.presenceConfig.flags.noImplicitReturns) {
        result.presenceConfig.issues.push('noImplicitReturns: false (should be true)');
      }
      if (!result.presenceConfig.flags.noFallthroughCasesInSwitch) {
        result.presenceConfig.issues.push('noFallthroughCasesInSwitch: false (should be true)');
      }
      if (!result.presenceConfig.flags.noUncheckedIndexedAccess) {
        result.presenceConfig.issues.push('noUncheckedIndexedAccess: false (should be true)');
      }
    } else {
      result.presenceConfig.issues.push('Failed to parse tsconfig.json');
    }
  } else {
    result.presenceConfig.issues.push('File does not exist');
  }

  // Check type errors
  try {
    const tscOutput = execSync('cd presence && npx tsc --noEmit', {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: projectRoot,
    });
    result.typeErrors.hasErrors = false;
    result.typeErrors.errorCount = 0;
  } catch (error: any) {
    result.typeErrors.hasErrors = true;
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
    const errorLines = errorOutput.split('\n').filter((line) => line.trim());
    result.typeErrors.errors = errorLines;
    result.typeErrors.errorCount = errorLines.filter((line) => 
      line.includes('error TS') || line.includes('error:')
    ).length;
  }

  // Check build status
  try {
    const buildOutput = execSync('npm run build:presence', {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: projectRoot,
    });
    result.buildStatus.success = true;
    result.buildStatus.output = buildOutput;
  } catch (error: any) {
    result.buildStatus.success = false;
    result.buildStatus.error = error.stdout?.toString() || error.stderr?.toString() || error.message;
  }

  return result;
}

// Run diagnostic
const result = diagnoseTSConfig();

console.log('=== TypeScript Configuration Alignment Diagnostic ===\n');
console.log(JSON.stringify(result, null, 2));

// Exit with error code if issues found
const hasIssues = 
  result.rootConfig.issues.length > 0 ||
  result.presenceConfig.issues.length > 0 ||
  result.typeErrors.hasErrors ||
  !result.buildStatus.success;

process.exit(hasIssues ? 1 : 0);

