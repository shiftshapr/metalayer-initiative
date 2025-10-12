#!/usr/bin/env node

/**
 * Comprehensive Syntax Validator
 * Prevents syntax errors from reaching the browser
 */

const fs = require('fs');
const path = require('path');

class SyntaxValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.files = [];
  }

  // Validate all JavaScript files in the project
  validateProject() {
    console.log('🔍 SYNTAX VALIDATOR: Starting comprehensive syntax validation...');
    
    this.findJavaScriptFiles();
    this.validateAllFiles();
    this.reportResults();
    
    return this.errors.length === 0;
  }

  // Find all JavaScript files in the project
  findJavaScriptFiles() {
    const projectRoot = process.cwd();
    const extensions = ['.js', '.mjs'];
    
    const findFiles = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other build directories
          if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
            findFiles(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            this.files.push(fullPath);
          }
        }
      }
    };
    
    findFiles(projectRoot);
    console.log(`📁 Found ${this.files.length} JavaScript files to validate`);
  }

  // Validate a single file
  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common syntax issues
      this.checkAwaitOutsideAsync(filePath, content);
      this.checkReturnOutsideFunction(filePath, content);
      this.checkOrphanedCode(filePath, content);
      this.checkUnclosedBlocks(filePath, content);
      
      // Use Node.js syntax checker
      try {
        require('vm').createContext();
        new Function(content);
      } catch (error) {
        this.errors.push({
          file: filePath,
          line: this.getLineNumber(content, error.message),
          message: error.message,
          type: 'syntax'
        });
      }
      
    } catch (error) {
      this.errors.push({
        file: filePath,
        line: 0,
        message: `Failed to read file: ${error.message}`,
        type: 'file'
      });
    }
  }

  // Check for await outside async functions
  checkAwaitOutsideAsync(filePath, content) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('await ') && !this.isInAsyncFunction(content, i)) {
        this.errors.push({
          file: filePath,
          line: i + 1,
          message: 'await is only valid in async functions',
          type: 'await-outside-async'
        });
      }
    }
  }

  // Check for return statements outside functions
  checkReturnOutsideFunction(filePath, content) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('return ') && !this.isInFunction(content, i)) {
        this.errors.push({
          file: filePath,
          line: i + 1,
          message: 'return statement outside function',
          type: 'return-outside-function'
        });
      }
    }
  }

  // Check for orphaned code blocks
  checkOrphanedCode(filePath, content) {
    const lines = content.split('\n');
    let inFunction = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track function boundaries
      if (line.includes('function ') || line.includes('=>') || line.includes('async ')) {
        inFunction = true;
      }
      
      // Track braces
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      
      // If we're not in a function and have executable code
      if (!inFunction && braceCount === 0 && this.hasExecutableCode(line)) {
        this.warnings.push({
          file: filePath,
          line: i + 1,
          message: 'Potential orphaned code outside function',
          type: 'orphaned-code'
        });
      }
    }
  }

  // Check for unclosed code blocks
  checkUnclosedBlocks(filePath, content) {
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
        file: filePath,
        line: lines.length,
        message: `Unclosed braces: ${braceCount > 0 ? 'missing' : 'extra'} ${Math.abs(braceCount)} closing brace(s)`,
        type: 'unclosed-braces'
      });
    }
  }

  // Helper methods
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

  hasExecutableCode(line) {
    const trimmed = line.trim();
    return trimmed.length > 0 && 
           !trimmed.startsWith('//') && 
           !trimmed.startsWith('*') &&
           !trimmed.startsWith('/*') &&
           !trimmed.startsWith('*/') &&
           (trimmed.includes('=') || trimmed.includes('await') || trimmed.includes('return'));
  }

  getLineNumber(content, errorMessage) {
    // Try to extract line number from error message
    const match = errorMessage.match(/line (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Validate all files
  validateAllFiles() {
    for (const file of this.files) {
      this.validateFile(file);
    }
  }

  // Report results
  reportResults() {
    console.log('\n📊 SYNTAX VALIDATION RESULTS:');
    console.log(`✅ Files validated: ${this.files.length}`);
    console.log(`❌ Errors found: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ SYNTAX ERRORS:');
      this.errors.forEach(error => {
        console.log(`  ${error.file}:${error.line} - ${error.message}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.file}:${warning.line} - ${warning.message}`);
      });
    }
    
    if (this.errors.length === 0) {
      console.log('\n🎉 All syntax checks passed!');
    } else {
      console.log('\n💥 Syntax validation failed!');
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SyntaxValidator();
  const success = validator.validateProject();
  process.exit(success ? 0 : 1);
}

module.exports = SyntaxValidator;








