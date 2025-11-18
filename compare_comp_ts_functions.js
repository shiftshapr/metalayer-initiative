#!/usr/bin/env node
/**
 * COMP vs TypeScript Function Comparison Tool
 * 
 * Extracts and compares all functions from COMP JavaScript and TypeScript implementations
 * to ensure functional equivalence.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to extract functions from JavaScript/TypeScript code
function extractFunctions(code, fileType) {
  const functions = [];
  
  // Match function declarations (including async, arrow functions, methods)
  const patterns = [
    // Regular function declarations: function name(...) { ... }
    /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
    // Arrow functions: const name = (...) => { ... } or const name = async (...) => { ... }
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
    // Method declarations: name(...) { ... } or async name(...) { ... }
    /\s+(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g,
    // Static methods: static name(...) { ... }
    /static\s+(\w+)\s*\([^)]*\)\s*\{/g,
  ];
  
  patterns.forEach((pattern, index) => {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const funcName = match[1];
      const startPos = match.index;
      
      // Find the function body end
      let braceCount = 0;
      let inString = false;
      let stringChar = null;
      let pos = match.index + match[0].length;
      
      for (let i = match.index; i < code.length; i++) {
        const char = code[i];
        
        if (!inString && (char === '"' || char === "'" || char === '`')) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && code[i - 1] !== '\\') {
          inString = false;
          stringChar = null;
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0 && i > startPos) {
              const funcBody = code.substring(startPos, i + 1);
              functions.push({
                name: funcName,
                type: index === 0 ? 'function' : index === 1 ? 'arrow' : index === 2 ? 'method' : 'static',
                body: funcBody,
                start: startPos,
                end: i + 1
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

// Function to get function signature
function getFunctionSignature(funcBody) {
  // Extract parameters
  const paramMatch = funcBody.match(/\(([^)]*)\)/);
  const params = paramMatch ? paramMatch[1].split(',').map(p => p.trim()).filter(p => p) : [];
  
  // Extract return type (TypeScript)
  const returnTypeMatch = funcBody.match(/\)\s*:\s*(\w+|Promise<[^>]+>)/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : null;
  
  // Check if async
  const isAsync = funcBody.includes('async');
  
  return {
    params,
    returnType,
    isAsync
  };
}

// Function to compare two functions
function compareFunctions(compFunc, tsFunc) {
  const compSig = getFunctionSignature(compFunc.body);
  const tsSig = getFunctionSignature(tsFunc.body);
  
  const differences = [];
  
  // Compare parameters
  if (compSig.params.length !== tsSig.params.length) {
    differences.push(`Parameter count differs: COMP has ${compSig.params.length}, TS has ${tsSig.params.length}`);
  } else {
    compSig.params.forEach((param, i) => {
      const tsParam = tsSig.params[i];
      // Remove type annotations for comparison
      const compParamClean = param.split(':')[0].trim();
      const tsParamClean = tsParam.split(':')[0].trim();
      if (compParamClean !== tsParamClean) {
        differences.push(`Parameter ${i + 1} differs: COMP "${compParamClean}" vs TS "${tsParamClean}"`);
      }
    });
  }
  
  // Compare async
  if (compSig.isAsync !== tsSig.isAsync) {
    differences.push(`Async differs: COMP ${compSig.isAsync ? 'is' : 'is not'} async, TS ${tsSig.isAsync ? 'is' : 'is not'} async`);
  }
  
  // Compare function body length (rough heuristic)
  const compBodyLength = compFunc.body.length;
  const tsBodyLength = tsFunc.body.length;
  const lengthDiff = Math.abs(compBodyLength - tsBodyLength);
  const lengthDiffPercent = (lengthDiff / Math.max(compBodyLength, tsBodyLength)) * 100;
  
  if (lengthDiffPercent > 20) {
    differences.push(`Body length differs significantly: COMP ${compBodyLength} chars, TS ${tsBodyLength} chars (${lengthDiffPercent.toFixed(1)}% difference)`);
  }
  
  return {
    equivalent: differences.length === 0,
    differences
  };
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
  
  compMap.forEach((funcs, name) => {
    if (!tsMap.has(name)) {
      compOnly.push(name);
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
    console.log(`\n   ⚠️  Functions in COMP but NOT in TypeScript (${compOnly.length}):`);
    compOnly.forEach(name => console.log(`      - ${name}`));
  }
  
  if (tsOnly.length > 0) {
    console.log(`\n   ⚠️  Functions in TypeScript but NOT in COMP (${tsOnly.length}):`);
    tsOnly.forEach(name => console.log(`      - ${name}`));
  }
  
  if (both.length > 0) {
    console.log(`\n   ✅ Functions in both (${both.length}):`);
    both.forEach(name => console.log(`      - ${name}`));
  }
  
  // Compare functions that exist in both
  console.log(`\n🔬 Detailed Comparison:`);
  const comparisonResults = [];
  
  both.forEach(funcName => {
    const compFuncs = compMap.get(funcName);
    const tsFuncs = tsMap.get(funcName);
    
    // Compare first occurrence (could be improved to match by signature)
    const compFunc = compFuncs[0];
    const tsFunc = tsFuncs[0];
    
    const comparison = compareFunctions(compFunc, tsFunc);
    comparisonResults.push({
      name: funcName,
      ...comparison
    });
    
    if (!comparison.equivalent) {
      console.log(`\n   ⚠️  ${funcName}:`);
      comparison.differences.forEach(diff => {
        console.log(`      - ${diff}`);
      });
    } else {
      console.log(`   ✅ ${funcName}: Equivalent`);
    }
  });
  
  return {
    compFile,
    tsFile,
    compFunctions: compFunctions.length,
    tsFunctions: tsFunctions.length,
    compOnly,
    tsOnly,
    both,
    comparisons: comparisonResults
  };
}

// Main execution
function main() {
  console.log('🔍 COMP vs TypeScript Function Comparison Tool');
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
  
  results.forEach(result => {
    console.log(`\n${path.basename(result.tsFile)}:`);
    console.log(`   Total functions: COMP ${result.compFunctions}, TS ${result.tsFunctions}`);
    console.log(`   Missing in TS: ${result.compOnly.length}`);
    console.log(`   New in TS: ${result.tsOnly.length}`);
    console.log(`   In both: ${result.both.length}`);
    
    const nonEquivalent = result.comparisons.filter(c => !c.equivalent).length;
    if (nonEquivalent > 0) {
      console.log(`   ⚠️  Non-equivalent: ${nonEquivalent}`);
    } else {
      console.log(`   ✅ All equivalent: ${result.both.length}`);
    }
  });
  
  // Write detailed report
  const reportPath = 'COMP_TS_FUNCTION_COMPARISON_REPORT.md';
  let report = '# COMP vs TypeScript Function Comparison Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  results.forEach(result => {
    report += `## ${path.basename(result.tsFile)}\n\n`;
    report += `- COMP Functions: ${result.compFunctions}\n`;
    report += `- TS Functions: ${result.tsFunctions}\n`;
    report += `- Missing in TS: ${result.compOnly.length}\n`;
    report += `- New in TS: ${result.tsOnly.length}\n`;
    report += `- In both: ${result.both.length}\n\n`;
    
    if (result.compOnly.length > 0) {
      report += `### Functions in COMP but NOT in TypeScript:\n\n`;
      result.compOnly.forEach(name => report += `- ${name}\n`);
      report += `\n`;
    }
    
    if (result.tsOnly.length > 0) {
      report += `### Functions in TypeScript but NOT in COMP:\n\n`;
      result.tsOnly.forEach(name => report += `- ${name}\n`);
      report += `\n`;
    }
    
    const nonEquivalent = result.comparisons.filter(c => !c.equivalent);
    if (nonEquivalent.length > 0) {
      report += `### Non-Equivalent Functions:\n\n`;
      nonEquivalent.forEach(comp => {
        report += `#### ${comp.name}\n\n`;
        comp.differences.forEach(diff => {
          report += `- ${diff}\n`;
        });
        report += `\n`;
      });
    }
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Detailed report written to: ${reportPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { extractFunctions, compareFunctions, compareFiles };

