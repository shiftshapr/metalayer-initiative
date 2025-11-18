#!/usr/bin/env node
/**
 * COMP vs TypeScript Function Comparison Tool V3
 * 
 * Distinguishes between:
 * - Functional discrepancies (missing functions, different behavior)
 * - Structural changes (ES6 modules, imports/exports, type annotations)
 * 
 * ONLY permitted discrepancy: avatar glow effect
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to extract functions from JavaScript/TypeScript code
function extractFunctions(code, fileType) {
  const functions = [];
  const lines = code.split('\n');
  
  // Track function declarations
  const functionPatterns = [
    // function name(...) { or async function name(...) {
    /^(?:\s*)(?:async\s+)?function\s+(\w+)\s*\(/gm,
    // const name = function(...) { or const name = async function(...) {
    /^(?:\s*)(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\(/gm,
    // const name = (...) => { or const name = async (...) => {
    /^(?:\s*)(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/gm,
    // Method: name(...) { or async name(...) {
    /^(?:\s+)(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/gm,
    // Static method: static name(...) { or static async name(...) {
    /^(?:\s+)static\s+(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/gm,
  ];
  
  const keywordSet = new Set(['if', 'for', 'while', 'switch', 'catch', 'try', 'return', 'break', 'continue', 'const', 'let', 'var', 'function', 'async', 'await', 'class', 'constructor', 'static', 'get', 'set', 'delete', 'new', 'typeof', 'instanceof', 'export', 'import', 'default']);
  
  functionPatterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const funcName = match[1];
      
      // Skip keywords
      if (keywordSet.has(funcName)) {
        continue;
      }
      
      // Find the function body
      const startPos = match.index;
      let braceCount = 0;
      let inString = false;
      let stringChar = null;
      let foundFirstBrace = false;
      
      for (let i = startPos; i < code.length; i++) {
        const char = code[i];
        const prevChar = i > 0 ? code[i - 1] : '';
        
        // Handle strings
        if (!inString && (char === '"' || char === "'" || char === '`')) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && prevChar !== '\\') {
          inString = false;
          stringChar = null;
        }
        
        if (!inString) {
          if (char === '{') {
            if (!foundFirstBrace) foundFirstBrace = true;
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0 && foundFirstBrace) {
              const funcBody = code.substring(startPos, i + 1);
              const funcType = patternIndex === 0 ? 'function' : 
                              patternIndex === 1 ? 'function-expr' :
                              patternIndex === 2 ? 'arrow' :
                              patternIndex === 3 ? 'method' : 'static';
              
              // Get line number
              const lineNum = code.substring(0, startPos).split('\n').length;
              
              // Check if exported (ES6 module)
              const beforeFunc = code.substring(Math.max(0, startPos - 200), startPos);
              const isExported = /export\s+(?:async\s+)?function\s+/.test(beforeFunc) || 
                                /export\s+(?:const|let|var)\s+/.test(beforeFunc) ||
                                /export\s+default\s+/.test(beforeFunc);
              
              // Check if window export (backward compatibility)
              const afterFunc = code.substring(i + 1, Math.min(code.length, i + 500));
              const hasWindowExport = /window\.\w+\s*=\s*\w+/.test(afterFunc) || 
                                     /\(window\s+as\s+any\)\.\w+\s*=\s*\w+/.test(afterFunc);
              
              functions.push({
                name: funcName,
                type: funcType,
                body: funcBody,
                start: startPos,
                end: i + 1,
                line: lineNum,
                isExported,
                hasWindowExport
              });
              break;
            }
          }
        }
      }
    }
  });
  
  return functions;
}

// Get function signature
function getFunctionSignature(funcBody, funcName) {
  // Extract parameters
  const paramMatch = funcBody.match(/\(([^)]*)\)/);
  const params = paramMatch ? paramMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('//'))
    .map(p => {
      // Remove type annotations and default values for comparison
      return p.split(':')[0].split('=')[0].trim();
    }) : [];
  
  // Extract return type (TypeScript)
  const returnTypeMatch = funcBody.match(/\)\s*:\s*([^{]+?)\s*\{/);
  const returnType = returnTypeMatch ? returnTypeMatch[1].trim() : null;
  
  // Check if async
  const isAsync = /async\s+/.test(funcBody.substring(0, 50));
  
  return {
    name: funcName,
    params,
    returnType,
    isAsync
  };
}

// Check if function is functionally equivalent (ignoring structural differences)
function isFunctionallyEquivalent(compFunc, tsFunc) {
  const compSig = getFunctionSignature(compFunc.body, compFunc.name);
  const tsSig = getFunctionSignature(tsFunc.body, tsFunc.name);
  
  // Structural differences (NOT functional discrepancies):
  // - Export statements (ES6 modules)
  // - Window exports (backward compatibility)
  // - Type annotations
  // - Return type annotations
  
  // Functional differences (ARE discrepancies):
  // - Different parameter names/types (excluding type annotations)
  // - Different async/await usage
  // - Missing functionality
  // - Different logic
  
  // Compare parameters (ignoring type annotations)
  if (compSig.params.length !== tsSig.params.length) {
    return { equivalent: false, reason: `Parameter count differs: COMP ${compSig.params.length} vs TS ${tsSig.params.length}` };
  }
  
  // Compare parameter names (ignoring types)
  for (let i = 0; i < compSig.params.length; i++) {
    const compParam = compSig.params[i];
    const tsParam = tsSig.params[i];
    if (compParam !== tsParam) {
      return { equivalent: false, reason: `Parameter ${i + 1} differs: COMP "${compParam}" vs TS "${tsParam}"` };
    }
  }
  
  // Compare async
  if (compSig.isAsync !== tsSig.isAsync) {
    return { equivalent: false, reason: `Async differs: COMP ${compSig.isAsync ? 'is' : 'is not'} async, TS ${tsSig.isAsync ? 'is' : 'is not'} async` };
  }
  
  // Compare function body length (rough heuristic for missing logic)
  const compBodyLength = compFunc.body.length;
  const tsBodyLength = tsFunc.body.length;
  const lengthDiff = Math.abs(compBodyLength - tsBodyLength);
  const lengthDiffPercent = (lengthDiff / Math.max(compBodyLength, tsBodyLength)) * 100;
  
  if (lengthDiffPercent > 50) {
    return { equivalent: false, reason: `Body length differs significantly: COMP ${compBodyLength} chars, TS ${tsBodyLength} chars (${lengthDiffPercent.toFixed(1)}% difference) - may indicate missing logic` };
  }
  
  return { equivalent: true };
}

// Check if function exists elsewhere (ES6 module export)
function findFunctionInExports(funcName, code) {
  // Check for export statements
  const exportPatterns = [
    new RegExp(`export\\s+(?:async\\s+)?function\\s+${funcName}`, 'g'),
    new RegExp(`export\\s+(?:const|let|var)\\s+${funcName}`, 'g'),
    new RegExp(`export\\s*{\\s*${funcName}`, 'g'),
    new RegExp(`export\\s+default\\s+.*${funcName}`, 'g'),
  ];
  
  for (const pattern of exportPatterns) {
    if (pattern.test(code)) {
      return true;
    }
  }
  
  // Check for window export (backward compatibility)
  const windowPattern = new RegExp(`(?:window|window\\.\\w+|window\\s+as\\s+any)\\.${funcName}\\s*=`, 'g');
  if (windowPattern.test(code)) {
    return true;
  }
  
  return false;
}

// Main comparison function
function compareFiles(compFile, tsFile) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Comparing: ${path.basename(compFile)} vs ${path.basename(tsFile)}`);
  console.log('='.repeat(80));
  
  // Read COMP file from git
  let compCode;
  try {
    compCode = execSync(`git show 8d4bf64:${compFile}`, { encoding: 'utf-8' });
  } catch (error) {
    console.error(`❌ Error reading COMP file: ${compFile}`);
    return null;
  }
  
  // Read TypeScript file
  let tsCode;
  try {
    tsCode = fs.readFileSync(tsFile, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading TypeScript file: ${tsFile}`);
    return null;
  }
  
  // Extract functions
  const compFunctions = extractFunctions(compCode, 'js');
  const tsFunctions = extractFunctions(tsCode, 'ts');
  
  console.log(`\n📊 Function Count:`);
  console.log(`   COMP: ${compFunctions.length} functions`);
  console.log(`   TS:   ${tsFunctions.length} functions`);
  
  // Create maps by function name
  const compMap = new Map();
  compFunctions.forEach(f => {
    if (!compMap.has(f.name)) {
      compMap.set(f.name, []);
    }
    compMap.get(f.name).push(f);
  });
  
  const tsMap = new Map();
  tsFunctions.forEach(f => {
    if (!tsMap.has(f.name)) {
      tsMap.set(f.name, []);
    }
    tsMap.get(f.name).push(f);
  });
  
  // Find missing functions
  const compOnly = [];
  const tsOnly = [];
  const both = [];
  const missingButExported = []; // Functions missing but exported elsewhere (ES6 modules)
  
  compMap.forEach((funcs, name) => {
    if (!tsMap.has(name)) {
      // Check if exported elsewhere (ES6 module)
      if (findFunctionInExports(name, tsCode)) {
        missingButExported.push(name);
      } else {
        compOnly.push(name);
      }
    } else {
      both.push(name);
    }
  });
  
  tsMap.forEach((funcs, name) => {
    if (!compMap.has(name)) {
      tsOnly.push(name);
    }
  });
  
  console.log(`\n🔍 Function Coverage:`);
  if (compOnly.length > 0) {
    console.log(`\n   ❌ FUNCTIONAL DISCREPANCY: Functions in COMP but NOT in TypeScript (${compOnly.length}):`);
    compOnly.slice(0, 20).forEach(name => console.log(`      - ${name}`));
    if (compOnly.length > 20) {
      console.log(`      ... and ${compOnly.length - 20} more`);
    }
  }
  
  if (missingButExported.length > 0) {
    console.log(`\n   ✅ STRUCTURAL CHANGE: Functions exported elsewhere (ES6 modules) (${missingButExported.length}):`);
    missingButExported.slice(0, 10).forEach(name => console.log(`      - ${name} (exported as ES6 module)`));
    if (missingButExported.length > 10) {
      console.log(`      ... and ${missingButExported.length - 10} more`);
    }
  }
  
  if (tsOnly.length > 0) {
    console.log(`\n   ⚠️  Functions in TypeScript but NOT in COMP (${tsOnly.length}):`);
    tsOnly.forEach(name => console.log(`      - ${name}`));
  }
  
  if (both.length > 0) {
    console.log(`\n   ✅ Functions in both (${both.length}):`);
    both.slice(0, 20).forEach(name => console.log(`      - ${name}`));
    if (both.length > 20) {
      console.log(`      ... and ${both.length - 20} more`);
    }
  }
  
  // Compare functions that exist in both
  console.log(`\n🔬 Functional Equivalence Check:`);
  const comparisonResults = [];
  const functionalDiscrepancies = [];
  
  both.forEach(funcName => {
    const compFuncs = compMap.get(funcName);
    const tsFuncs = tsMap.get(funcName);
    
    // Compare first occurrence
    const compFunc = compFuncs[0];
    const tsFunc = tsFuncs[0];
    
    const comparison = isFunctionallyEquivalent(compFunc, tsFunc);
    comparisonResults.push({
      name: funcName,
      ...comparison
    });
    
    if (!comparison.equivalent) {
      functionalDiscrepancies.push(funcName);
      console.log(`\n   ❌ FUNCTIONAL DISCREPANCY: ${funcName}:`);
      console.log(`      - ${comparison.reason}`);
    } else {
      console.log(`   ✅ ${funcName}: Functionally equivalent`);
    }
  });
  
  return {
    compFile,
    tsFile,
    compFunctions: compFunctions.length,
    tsFunctions: tsFunctions.length,
    compOnly, // Functional discrepancies
    missingButExported, // Structural changes (OK)
    tsOnly,
    both,
    functionalDiscrepancies,
    comparisons: comparisonResults
  };
}

// Main execution
function main() {
  console.log('🔍 COMP vs TypeScript Function Comparison Tool V3');
  console.log('='.repeat(80));
  console.log('📋 POLICY:');
  console.log('   ✅ Structural changes (ES6 modules, imports/exports) are NOT discrepancies');
  console.log('   ❌ Functional differences (missing logic, different behavior) ARE discrepancies');
  console.log('   ⚠️  ONLY permitted discrepancy: avatar glow effect');
  console.log('='.repeat(80));
  
  const comparisons = [
    {
      comp: 'presence/features/CanopiModule.js',
      ts: 'presence/src/features/CanopiModule.ts'
    },
    {
      comp: 'presence/features/VisibilityManager.js',
      ts: 'presence/src/features/VisibilityManager.ts'
    },
    {
      comp: 'presence/features/AuthManager.js',
      ts: 'presence/src/features/AuthManager.ts'
    }
  ];
  
  const results = [];
  
  comparisons.forEach(({ comp, ts }) => {
    const result = compareFiles(comp, ts);
    if (result) {
      results.push(result);
    }
  });
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  
  let totalFunctionalDiscrepancies = 0;
  
  results.forEach(result => {
    console.log(`\n${path.basename(result.tsFile)}:`);
    console.log(`   Total functions: COMP ${result.compFunctions}, TS ${result.tsFunctions}`);
    console.log(`   ❌ Functional discrepancies: ${result.compOnly.length + result.functionalDiscrepancies.length}`);
    console.log(`   ✅ Structural changes (OK): ${result.missingButExported.length}`);
    console.log(`   ✅ Functionally equivalent: ${result.both.length - result.functionalDiscrepancies.length}`);
    
    totalFunctionalDiscrepancies += result.compOnly.length + result.functionalDiscrepancies.length;
  });
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`⚠️  TOTAL FUNCTIONAL DISCREPANCIES: ${totalFunctionalDiscrepancies}`);
  console.log('='.repeat(80));
  
  if (totalFunctionalDiscrepancies > 0) {
    console.log('\n❌ ACTION REQUIRED: Fix functional discrepancies (excluding avatar glow)');
  } else {
    console.log('\n✅ All functions are functionally equivalent!');
  }
  
  // Write detailed report
  const reportPath = 'COMP_TS_FUNCTION_COMPARISON_REPORT_V3.md';
  let report = '# COMP vs TypeScript Function Comparison Report V3\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Policy\n\n`;
  report += `- ✅ Structural changes (ES6 modules, imports/exports) are NOT discrepancies\n`;
  report += `- ❌ Functional differences (missing logic, different behavior) ARE discrepancies\n`;
  report += `- ⚠️  ONLY permitted discrepancy: avatar glow effect\n\n`;
  
  results.forEach(result => {
    report += `## ${path.basename(result.tsFile)}\n\n`;
    report += `- COMP Functions: ${result.compFunctions}\n`;
    report += `- TS Functions: ${result.tsFunctions}\n`;
    report += `- ❌ Functional Discrepancies: ${result.compOnly.length + result.functionalDiscrepancies.length}\n`;
    report += `- ✅ Structural Changes (OK): ${result.missingButExported.length}\n`;
    report += `- ✅ Functionally Equivalent: ${result.both.length - result.functionalDiscrepancies.length}\n\n`;
    
    if (result.compOnly.length > 0) {
      report += `### ❌ Functional Discrepancies: Missing Functions\n\n`;
      result.compOnly.forEach(name => report += `- ${name}\n`);
      report += `\n`;
    }
    
    if (result.functionalDiscrepancies.length > 0) {
      report += `### ❌ Functional Discrepancies: Non-Equivalent Functions\n\n`;
      result.comparisons
        .filter(c => !c.equivalent && result.functionalDiscrepancies.includes(c.name))
        .forEach(comp => {
          report += `#### ${comp.name}\n\n`;
          report += `- ${comp.reason}\n\n`;
        });
    }
    
    if (result.missingButExported.length > 0) {
      report += `### ✅ Structural Changes: Functions Exported Elsewhere (ES6 Modules)\n\n`;
      result.missingButExported.forEach(name => report += `- ${name}\n`);
      report += `\n`;
    }
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Detailed report written to: ${reportPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { extractFunctions, isFunctionallyEquivalent, compareFiles };

