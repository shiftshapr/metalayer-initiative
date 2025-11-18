#!/usr/bin/env node
/**
 * COMP vs TypeScript Function Comparison Tool V2
 * 
 * Improved function extraction using better regex patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Improved function extraction
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
  
  // Also look for standalone function declarations (not keywords)
  const validFunctionNames = new Set();
  const keywordSet = new Set(['if', 'for', 'while', 'switch', 'catch', 'try', 'return', 'break', 'continue', 'const', 'let', 'var', 'function', 'async', 'await', 'class', 'constructor', 'static', 'get', 'set', 'delete', 'new', 'typeof', 'instanceof']);
  
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
              
              functions.push({
                name: funcName,
                type: funcType,
                body: funcBody,
                start: startPos,
                end: i + 1,
                line: lineNum
              });
              
              validFunctionNames.add(funcName);
              break;
            }
          }
        }
      }
    }
  });
  
  // Also extract exported functions
  const exportPatterns = [
    /^export\s+(?:async\s+)?function\s+(\w+)/gm,
    /^export\s+(?:const|let|var)\s+(\w+)\s*=/gm,
  ];
  
  exportPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const funcName = match[1];
      if (!keywordSet.has(funcName) && !validFunctionNames.has(funcName)) {
        // Try to find the function definition
        const searchPattern = new RegExp(`(?:function|const|let|var)\\s+${funcName}\\s*[=(]`, 'g');
        const funcMatch = searchPattern.exec(code);
        if (funcMatch) {
          validFunctionNames.add(funcName);
        }
      }
    }
  });
  
  return functions.filter(f => validFunctionNames.has(f.name) || !keywordSet.has(f.name));
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

// Compare two functions
function compareFunctions(compFunc, tsFunc) {
  const compSig = getFunctionSignature(compFunc.body, compFunc.name);
  const tsSig = getFunctionSignature(tsFunc.body, tsFunc.name);
  
  const differences = [];
  
  // Compare parameters
  if (compSig.params.length !== tsSig.params.length) {
    differences.push(`Parameter count: COMP has ${compSig.params.length}, TS has ${tsSig.params.length}`);
  } else {
    compSig.params.forEach((param, i) => {
      const tsParam = tsSig.params[i];
      if (param !== tsParam) {
        differences.push(`Parameter ${i + 1}: COMP "${param}" vs TS "${tsParam}"`);
      }
    });
  }
  
  // Compare async
  if (compSig.isAsync !== tsSig.isAsync) {
    differences.push(`Async: COMP ${compSig.isAsync ? 'is' : 'is not'} async, TS ${tsSig.isAsync ? 'is' : 'is not'} async`);
  }
  
  // Compare function body length
  const compBodyLength = compFunc.body.length;
  const tsBodyLength = tsFunc.body.length;
  const lengthDiff = Math.abs(compBodyLength - tsBodyLength);
  const lengthDiffPercent = (lengthDiff / Math.max(compBodyLength, tsBodyLength)) * 100;
  
  if (lengthDiffPercent > 30) {
    differences.push(`Body length: COMP ${compBodyLength} chars, TS ${tsBodyLength} chars (${lengthDiffPercent.toFixed(1)}% difference)`);
  }
  
  return {
    equivalent: differences.length === 0,
    differences,
    compSig,
    tsSig
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
    compOnly.slice(0, 20).forEach(name => console.log(`      - ${name}`));
    if (compOnly.length > 20) {
      console.log(`      ... and ${compOnly.length - 20} more`);
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
  console.log(`\n🔬 Detailed Comparison:`);
  const comparisonResults = [];
  
  both.forEach(funcName => {
    const compFuncs = compMap.get(funcName);
    const tsFuncs = tsMap.get(funcName);
    
    // Compare first occurrence
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
  console.log('🔍 COMP vs TypeScript Function Comparison Tool V2');
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
    const equivalent = result.comparisons.filter(c => c.equivalent).length;
    if (nonEquivalent > 0) {
      console.log(`   ⚠️  Non-equivalent: ${nonEquivalent}`);
    }
    if (equivalent > 0) {
      console.log(`   ✅ Equivalent: ${equivalent}`);
    }
  });
  
  // Write detailed report
  const reportPath = 'COMP_TS_FUNCTION_COMPARISON_REPORT_V2.md';
  let report = '# COMP vs TypeScript Function Comparison Report V2\n\n';
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
        report += `**COMP Signature:**\n`;
        report += `- Params: ${comp.compSig.params.join(', ')}\n`;
        report += `- Async: ${comp.compSig.isAsync}\n`;
        report += `- Return: ${comp.compSig.returnType || 'void'}\n\n`;
        report += `**TS Signature:**\n`;
        report += `- Params: ${comp.tsSig.params.join(', ')}\n`;
        report += `- Async: ${comp.tsSig.isAsync}\n`;
        report += `- Return: ${comp.tsSig.returnType || 'void'}\n\n`;
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

