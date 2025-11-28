/**
 * Timeline TypeScript Migration Diagnostic
 * Identifies issues with TypeScript migration and build configuration
 */

console.log('🔍 Timeline TypeScript Diagnostic Starting...');

const diagnosticResults = {
  timestamp: new Date().toISOString(),
  issues: [],
  warnings: [],
  passed: [],
  recommendations: []
};

// Check 1: HTML file loading path
function checkHtmlLoadingPath() {
  console.log('📄 Checking index.html loading path...');
  const htmlContent = document.querySelector('script[type="module"]');
  if (htmlContent) {
    const src = htmlContent.getAttribute('src');
    if (src && !src.includes('dist/')) {
      diagnosticResults.issues.push({
        id: 'html-path',
        severity: 'error',
        message: `index.html loads script from '${src}' but should load from 'dist/${src}'`,
        fix: `Update index.html to load from dist/ directory`
      });
    } else if (src && src.includes('dist/')) {
      diagnosticResults.passed.push({
        id: 'html-path',
        message: `HTML correctly loads from dist/ directory: ${src}`
      });
    }
  }
}

// Check 2: Old JS files in root
function checkOldJsFiles() {
  console.log('🗑️  Checking for old JS files in root...');
  // This would need to be checked server-side, but we can check if the old file is being loaded
  const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && !src.includes('dist/') && src.endsWith('.js')) {
      diagnosticResults.warnings.push({
        id: 'old-js-files',
        message: `Script loaded from root: ${src}. Should be in dist/`,
        fix: 'Remove old JS files from root and update HTML to load from dist/'
      });
    }
  });
}

// Check 3: Module resolution errors
function checkModuleResolution() {
  console.log('🔗 Checking module resolution...');
  const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
  scripts.forEach(script => {
    script.addEventListener('error', (e) => {
      diagnosticResults.issues.push({
        id: 'module-resolution',
        severity: 'error',
        message: `Failed to load module: ${script.src}`,
        error: e.message,
        fix: 'Check import paths in TypeScript source files'
      });
    });
  });
}

// Check 4: TypeScript compilation output
function checkCompiledOutput() {
  console.log('📦 Checking compiled output structure...');
  // Check if dist/ files are accessible
  fetch('/timelines/dist/timeline-app.js', { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        diagnosticResults.passed.push({
          id: 'compiled-output',
          message: 'Compiled timeline-app.js exists in dist/'
        });
      } else {
        diagnosticResults.issues.push({
          id: 'compiled-output',
          severity: 'error',
          message: 'Compiled timeline-app.js not found in dist/',
          fix: 'Run TypeScript compilation: tsc -p tsconfig.timeline.json'
        });
      }
    })
    .catch(error => {
      diagnosticResults.issues.push({
        id: 'compiled-output',
        severity: 'error',
        message: 'Cannot access dist/ directory',
        error: error.message,
        fix: 'Check file permissions and server configuration'
      });
    });
}

// Check 5: Import path consistency
function checkImportPaths() {
  console.log('🛤️  Checking import path consistency...');
  // This would need to check the actual source files
  diagnosticResults.recommendations.push({
    id: 'import-paths',
    message: 'Verify all imports use relative paths (./modules/...) not absolute paths',
    check: 'Review timeline-app.ts and ensure imports are relative to dist/ structure'
  });
}

// Run all checks
function runDiagnostics() {
  checkHtmlLoadingPath();
  checkOldJsFiles();
  checkModuleResolution();
  checkCompiledOutput();
  checkImportPaths();
  
  // Wait a bit for async checks
  setTimeout(() => {
    console.log('\n📊 Diagnostic Results:');
    console.log('====================');
    
    if (diagnosticResults.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      diagnosticResults.issues.forEach(issue => {
        console.log(`  [${issue.severity.toUpperCase()}] ${issue.id}: ${issue.message}`);
        if (issue.fix) console.log(`     Fix: ${issue.fix}`);
      });
    }
    
    if (diagnosticResults.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      diagnosticResults.warnings.forEach(warning => {
        console.log(`  ${warning.id}: ${warning.message}`);
        if (warning.fix) console.log(`     Fix: ${warning.fix}`);
      });
    }
    
    if (diagnosticResults.passed.length > 0) {
      console.log('\n✅ PASSED:');
      diagnosticResults.passed.forEach(pass => {
        console.log(`  ${pass.id}: ${pass.message}`);
      });
    }
    
    if (diagnosticResults.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      diagnosticResults.recommendations.forEach(rec => {
        console.log(`  ${rec.id}: ${rec.message}`);
      });
    }
    
    console.log('\n====================');
    console.log(`Total Issues: ${diagnosticResults.issues.length}`);
    console.log(`Total Warnings: ${diagnosticResults.warnings.length}`);
    console.log(`Total Passed: ${diagnosticResults.passed.length}`);
    
    // Store results globally for access
    window.timelineDiagnosticResults = diagnosticResults;
  }, 1000);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runDiagnostics);
} else {
  runDiagnostics();
}





