#!/usr/bin/env node

/**
 * Development Error Catcher
 * Aggressively catches syntax errors during development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DevelopmentErrorCatcher {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.extensionFiles = [
      'presence/sidepanel.js',
      'presence/background.js',
      'presence/content.js',
      'presence/config.js',
      'presence/auth-manager.js',
      'presence/EventBus.js',
      'presence/StateManager.js',
      'presence/LifecycleManager.js',
      'presence/logger.js',
      'presence/performance-optimizer.js',
      'presence/security.js',
      'presence/supabase-client.js',
      'presence/urlNormalization.js',
      'presence/realtime-logger.js'
    ];
  }

  // Comprehensive error catching
  catchAllErrors() {
    console.log('🔍 DEVELOPMENT ERROR CATCHER: Aggressively checking for all error types...');
    
    this.checkSyntaxErrors();
    this.checkOrphanedCode();
    this.checkUndefinedVariables();
    this.checkAsyncAwaitIssues();
    this.checkReturnStatements();
    this.checkUnclosedBlocks();
    
    this.reportResults();
    return this.errors.length === 0;
  }

  // Check for syntax errors
  checkSyntaxErrors() {
    console.log('🔍 Checking syntax errors...');
    
    for (const file of this.extensionFiles) {
      if (fs.existsSync(file)) {
        try {
          execSync(`node -c "${file}"`, { stdio: 'pipe' });
          console.log(`✅ ${file} - Syntax OK`);
        } catch (error) {
          this.errors.push({
            file: file,
            type: 'syntax',
            message: `Syntax error: ${error.message}`,
            severity: 'critical'
          });
        }
      }
    }
  }

  // Check for orphaned code
  checkOrphanedCode() {
    console.log('🔍 Checking for orphaned code...');
    
    for (const file of this.extensionFiles) {
      if (fs.existsSync(file) && file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        let inFunction = false;
        let braceCount = 0;
        let parenCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();
          
          // Skip comments and empty lines
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed === '') {
            continue;
          }
          
          // Track function boundaries
          if (line.includes('function ') || line.includes('=>') || line.includes('async ')) {
            inFunction = true;
          }
          
          // Track braces and parentheses
          braceCount += (line.match(/\{/g) || []).length;
          braceCount -= (line.match(/\}/g) || []).length;
          parenCount += (line.match(/\(/g) || []).length;
          parenCount -= (line.match(/\)/g) || []).length;
          
          // Check for orphaned code
          if (!inFunction && braceCount === 0 && parenCount === 0 && this.hasExecutableCode(line)) {
            this.warnings.push({
              file: file,
              line: i + 1,
              type: 'orphaned-code',
              message: 'Potential orphaned code outside function',
              severity: 'warning',
              code: trimmed.substring(0, 50)
            });
          }
          
          // Reset function flag when we hit a closing brace
          if (line.includes('}') && braceCount <= 0) {
            inFunction = false;
          }
        }
      }
    }
  }

  // Check for undefined variables
  checkUndefinedVariables() {
    console.log('🔍 Checking for undefined variables...');
    
    for (const file of this.extensionFiles) {
      if (fs.existsSync(file) && file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        // Look for common undefined variable patterns
        const undefinedPatterns = [
          /userData\./g,
          /serverUserId\./g,
          /result\.googleUser\./g,
          /METALAYER_API_URL/g
        ];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          for (const pattern of undefinedPatterns) {
            if (pattern.test(line) && !line.trim().startsWith('//')) {
              // Check if variable is defined in scope
              if (!this.isVariableDefined(content, line, pattern)) {
                this.errors.push({
                  file: file,
                  line: i + 1,
                  type: 'undefined-variable',
                  message: `Potential undefined variable: ${line.trim()}`,
                  severity: 'critical',
                  code: line.trim()
                });
              }
            }
          }
        }
      }
    }
  }

  // Check for async/await issues
  checkAsyncAwaitIssues() {
    console.log('🔍 Checking async/await issues...');
    
    for (const file of this.extensionFiles) {
      if (fs.existsSync(file) && file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.includes('await ') && !line.trim().startsWith('//')) {
            if (!this.isInAsyncFunction(content, i)) {
              this.errors.push({
                file: file,
                line: i + 1,
                type: 'await-outside-async',
                message: 'await is only valid in async functions',
                severity: 'critical',
                code: line.trim()
              });
            }
          }
        }
      }
    }
  }

  // Check for return statements outside functions
  checkReturnStatements() {
    console.log('🔍 Checking return statements...');
    
    for (const file of this.extensionFiles) {
      if (fs.existsSync(file) && file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.trim().startsWith('return ') && !line.trim().startsWith('//')) {
            if (!this.isInFunction(content, i)) {
              this.errors.push({
                file: file,
                line: i + 1,
                type: 'return-outside-function',
                message: 'return statement outside function',
                severity: 'critical',
                code: line.trim()
              });
            }
          }
        }
      }
    }
  }

  // Check for unclosed blocks
  checkUnclosedBlocks() {
    console.log('🔍 Checking for unclosed blocks...');
    
    for (const file of this.extensionFiles) {
      if (fs.existsSync(file) && file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        let braceCount = 0;
        let parenCount = 0;
        let bracketCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          braceCount += (line.match(/\{/g) || []).length;
          braceCount -= (line.match(/\}/g) || []).length;
          parenCount += (line.match(/\(/g) || []).length;
          parenCount -= (line.match(/\)/g) || []).length;
          bracketCount += (line.match(/\[/g) || []).length;
          bracketCount -= (line.match(/\]/g) || []).length;
        }
        
        if (braceCount !== 0) {
          this.errors.push({
            file: file,
            line: lines.length,
            type: 'unclosed-braces',
            message: `Unclosed braces: ${braceCount > 0 ? 'missing' : 'extra'} ${Math.abs(braceCount)} closing brace(s)`,
            severity: 'critical'
          });
        }
        
        if (parenCount !== 0) {
          this.errors.push({
            file: file,
            line: lines.length,
            type: 'unclosed-parentheses',
            message: `Unclosed parentheses: ${parenCount > 0 ? 'missing' : 'extra'} ${Math.abs(parenCount)} closing parenthesis(es)`,
            severity: 'critical'
          });
        }
      }
    }
  }

  // Helper methods
  hasExecutableCode(line) {
    const trimmed = line.trim();
    return trimmed.length > 0 && 
           !trimmed.startsWith('//') && 
           !trimmed.startsWith('*') &&
           !trimmed.startsWith('/*') &&
           !trimmed.startsWith('*/') &&
           (trimmed.includes('=') || trimmed.includes('await') || trimmed.includes('return') || trimmed.includes('const') || trimmed.includes('let') || trimmed.includes('var'));
  }

  isInAsyncFunction(content, lineIndex) {
    const lines = content.split('\n');
    for (let i = lineIndex; i >= 0; i--) {
      const line = lines[i];
      if (line.includes('async ') && line.includes('function')) {
        return true;
      }
      if (line.includes('}') && i < lineIndex) {
        return false;
      }
    }
    return false;
  }

  isInFunction(content, lineIndex) {
    const lines = content.split('\n');
    let inFunction = false;
    
    for (let i = 0; i <= lineIndex; i++) {
      const line = lines[i];
      if (line.includes('function ') || line.includes('=>')) {
        inFunction = true;
      }
      if (line.includes('}') && i < lineIndex) {
        inFunction = false;
      }
    }
    return inFunction;
  }

  isVariableDefined(content, line, pattern) {
    // Simple check - look for variable declaration before usage
    const lines = content.split('\n');
    const lineIndex = lines.indexOf(line);
    
    for (let i = 0; i < lineIndex; i++) {
      if (lines[i].includes('const ') || lines[i].includes('let ') || lines[i].includes('var ')) {
        return true;
      }
    }
    return false;
  }

  // Report results
  reportResults() {
    console.log('\n📊 DEVELOPMENT ERROR CATCHER RESULTS:');
    console.log(`✅ Files checked: ${this.extensionFiles.length}`);
    console.log(`❌ Critical errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ CRITICAL ERRORS:');
      this.errors.forEach(error => {
        console.log(`  ${error.file}:${error.line} - ${error.message}`);
        if (error.code) {
          console.log(`    Code: ${error.code}`);
        }
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.file}:${warning.line} - ${warning.message}`);
        if (warning.code) {
          console.log(`    Code: ${warning.code}`);
        }
      });
    }
    
    if (this.errors.length === 0) {
      console.log('\n🎉 No critical errors found!');
    } else {
      console.log('\n💥 Critical errors found - fix before committing!');
      process.exit(1);
    }
  }
}

// Run error catching if called directly
if (require.main === module) {
  const catcher = new DevelopmentErrorCatcher();
  const success = catcher.catchAllErrors();
  process.exit(success ? 0 : 1);
}

module.exports = DevelopmentErrorCatcher;








