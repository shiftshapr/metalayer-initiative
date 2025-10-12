#!/usr/bin/env node

/**
 * Extension-Specific Syntax Validator
 * Only validates the Chrome extension files
 */

const fs = require('fs');
const path = require('path');

class ExtensionSyntaxValidator {
  constructor() {
    this.errors = [];
    this.extensionFiles = [
      'presence/manifest.json',
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

  // Validate only extension files
  validateExtension() {
    console.log('🔍 EXTENSION SYNTAX VALIDATOR: Validating Chrome extension files...');
    
    for (const file of this.extensionFiles) {
      if (fs.existsSync(file)) {
        this.validateFile(file);
      }
    }
    
    this.reportResults();
    return this.errors.length === 0;
  }

  // Validate a single file
  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Skip JSON files
      if (filePath.endsWith('.json')) {
        try {
          JSON.parse(content);
          console.log(`✅ ${filePath} - JSON syntax valid`);
          return;
        } catch (error) {
          this.errors.push({
            file: filePath,
            line: 0,
            message: `JSON syntax error: ${error.message}`,
            type: 'json'
          });
          return;
        }
      }
      
      // Use Node.js syntax checker for JavaScript files
      try {
        require('vm').createContext();
        new Function(content);
        console.log(`✅ ${filePath} - JavaScript syntax valid`);
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

  getLineNumber(content, errorMessage) {
    // Try to extract line number from error message
    const match = errorMessage.match(/line (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Report results
  reportResults() {
    console.log('\n📊 EXTENSION SYNTAX VALIDATION RESULTS:');
    console.log(`✅ Files validated: ${this.extensionFiles.length}`);
    console.log(`❌ Errors found: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ EXTENSION SYNTAX ERRORS:');
      this.errors.forEach(error => {
        console.log(`  ${error.file}:${error.line} - ${error.message}`);
      });
    } else {
      console.log('\n🎉 All extension files have valid syntax!');
    }
    
    if (this.errors.length > 0) {
      console.log('\n💥 Extension syntax validation failed!');
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ExtensionSyntaxValidator();
  const success = validator.validateExtension();
  process.exit(success ? 0 : 1);
}

module.exports = ExtensionSyntaxValidator;








