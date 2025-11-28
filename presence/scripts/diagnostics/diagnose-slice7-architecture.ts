/**
 * SLICE 7 DIAGNOSTIC: Code Duplication & Architecture Issues
 * 
 * Identifies:
 * 1. Duplicate implementations (message loading, UI components, state management)
 * 2. Inconsistent patterns (classes vs functions, mixed state management)
 * 3. Large files (ProfileManager.ts, MessagesModule.ts)
 * 4. Tight coupling (window property access, hard dependencies)
 * 
 * Run: npx tsx src/diagnostics/diagnose-slice7-architecture.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '..');

interface DiagnosticResult {
  duplicates: {
    messageLoading: Array<{ file: string; functions: string[]; lines: number }>;
    uiComponents: Array<{ file: string; components: string[]; lines: number }>;
    stateManagement: Array<{ file: string; patterns: string[]; lines: number }>;
  };
  largeFiles: Array<{ file: string; lines: number; complexity: 'high' | 'medium' | 'low' }>;
  tightCoupling: Array<{ file: string; windowAccesses: number; patterns: string[] }>;
  inconsistentPatterns: {
    classBased: string[];
    functionBased: string[];
    mixed: string[];
  };
  summary: {
    totalDuplicates: number;
    totalLargeFiles: number;
    totalTightCoupling: number;
    totalInconsistent: number;
  };
}

function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

function findMessageLoadingFunctions(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const functions: string[] = [];
    
    // Pattern: function loadMessages, async loadMessages, const loadMessages, loadChatHistory, etc.
    const patterns = [
      /(?:function|const|async\s+function)\s+(loadMessages|loadChatHistory|loadReplies|fetchMessages|getMessages)/g,
      /(?:function|const|async\s+function)\s+(\w*[Mm]essage\w*Load)/g,
      /(?:function|const|async\s+function)\s+(\w*Load\w*[Mm]essage)/g,
    ];
    
    patterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && !functions.includes(match[1])) {
          functions.push(match[1]);
        }
      }
    });
    
    return functions;
  } catch {
    return [];
  }
}

function findUIComponents(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const components: string[] = [];
    
    // Pattern: class ComponentName, export class ComponentName, export function ComponentName
    const patterns = [
      /(?:export\s+)?class\s+(\w*(?:Modal|Display|Component|UI|Renderer|Loader))\w*/g,
      /(?:export\s+)?(?:function|const)\s+(\w*(?:Modal|Display|Component|UI|Renderer|Loader))\w*/g,
    ];
    
    patterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && !components.includes(match[1])) {
          components.push(match[1]);
        }
      }
    });
    
    return components;
  } catch {
    return [];
  }
}

function findStateManagementPatterns(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const patterns: string[] = [];
    
    // Check for different state management patterns
    if (content.includes('stateManagerInstance') || content.includes('StateManager')) {
      patterns.push('StateManager');
    }
    if (content.includes('window.') && (content.includes('getState') || content.includes('setState'))) {
      patterns.push('window-state');
    }
    if (content.includes('localStorage') || content.includes('sessionStorage')) {
      patterns.push('storage-api');
    }
    if (content.includes('chrome.storage')) {
      patterns.push('chrome-storage');
    }
    if (content.includes('useState') || content.includes('useReducer')) {
      patterns.push('react-hooks');
    }
    
    return patterns;
  } catch {
    return [];
  }
}

function countWindowAccesses(filePath: string): { count: number; patterns: string[] } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const patterns: string[] = [];
    let count = 0;
    
    // Count window.property accesses
    const windowPatterns = [
      /window\.\w+/g,
      /globalThis\.\w+/g,
      /\(window\s+as\s+[^)]+\)/g,
      /\(globalThis\s+as\s+[^)]+\)/g,
    ];
    
    windowPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        count++;
        const patternType = pattern.source.includes('window') ? 'window-access' : 'globalThis-access';
        if (!patterns.includes(patternType)) {
          patterns.push(patternType);
        }
      }
    });
    
    return { count, patterns };
  } catch {
    return { count: 0, patterns: [] };
  }
}

function analyzeFilePatterns(filePath: string): 'class' | 'function' | 'mixed' {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasClass = /(?:export\s+)?class\s+\w+/.test(content);
    const hasFunction = /(?:export\s+)?(?:function|const)\s+\w+\s*=/.test(content);
    
    if (hasClass && hasFunction) return 'mixed';
    if (hasClass) return 'class';
    if (hasFunction) return 'function';
    return 'function'; // default
  } catch {
    return 'function';
  }
}

function scanDirectory(dir: string, result: DiagnosticResult): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules, dist, build, extension, diagnostics, scripts
    if (entry.name === 'node_modules' || 
        entry.name === 'dist' || 
        entry.name === 'build' || 
        entry.name === 'extension' ||
        entry.name === 'diagnostics' ||
        entry.name === 'scripts') {
      continue;
    }
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, result);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      const relativePath = path.relative(srcDir, fullPath);
      const lines = countLines(fullPath);
      
      // Check for message loading duplicates
      const messageFunctions = findMessageLoadingFunctions(fullPath);
      if (messageFunctions.length > 0) {
        result.duplicates.messageLoading.push({
          file: relativePath,
          functions: messageFunctions,
          lines
        });
      }
      
      // Check for UI component duplicates
      const uiComponents = findUIComponents(fullPath);
      if (uiComponents.length > 0) {
        result.duplicates.uiComponents.push({
          file: relativePath,
          components: uiComponents,
          lines
        });
      }
      
      // Check for state management patterns
      const statePatterns = findStateManagementPatterns(fullPath);
      if (statePatterns.length > 0) {
        result.duplicates.stateManagement.push({
          file: relativePath,
          patterns: statePatterns,
          lines
        });
      }
      
      // Check for large files (>1000 lines)
      if (lines > 1000) {
        const complexity = lines > 3000 ? 'high' : lines > 2000 ? 'medium' : 'low';
        result.largeFiles.push({
          file: relativePath,
          lines,
          complexity
        });
      }
      
      // Check for tight coupling (window access)
      const windowAccess = countWindowAccesses(fullPath);
      if (windowAccess.count > 0) {
        result.tightCoupling.push({
          file: relativePath,
          windowAccesses: windowAccess.count,
          patterns: windowAccess.patterns
        });
      }
      
      // Check for inconsistent patterns
      const pattern = analyzeFilePatterns(fullPath);
      if (pattern === 'class') {
        result.inconsistentPatterns.classBased.push(relativePath);
      } else if (pattern === 'function') {
        result.inconsistentPatterns.functionBased.push(relativePath);
      } else {
        result.inconsistentPatterns.mixed.push(relativePath);
      }
    }
  }
}

function generateReport(result: DiagnosticResult): string {
  let report = '# SLICE 7 DIAGNOSTIC REPORT: Code Duplication & Architecture\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Summary
  report += '## SUMMARY\n\n';
  report += `- **Total Duplicate Message Loading Functions**: ${result.summary.totalDuplicates}\n`;
  report += `- **Total Large Files (>1000 lines)**: ${result.summary.totalLargeFiles}\n`;
  report += `- **Total Files with Tight Coupling**: ${result.summary.totalTightCoupling}\n`;
  report += `- **Total Inconsistent Pattern Files**: ${result.summary.totalInconsistent}\n\n`;
  
  // Duplicate Message Loading
  report += '## 1. DUPLICATE MESSAGE LOADING FUNCTIONS\n\n';
  if (result.duplicates.messageLoading.length === 0) {
    report += '✅ No duplicate message loading functions found.\n\n';
  } else {
    result.duplicates.messageLoading.forEach(item => {
      report += `### ${item.file} (${item.lines} lines)\n`;
      report += `- Functions: ${item.functions.join(', ')}\n\n`;
    });
  }
  
  // Duplicate UI Components
  report += '## 2. DUPLICATE UI COMPONENTS\n\n';
  if (result.duplicates.uiComponents.length === 0) {
    report += '✅ No duplicate UI components found.\n\n';
  } else {
    result.duplicates.uiComponents.forEach(item => {
      report += `### ${item.file} (${item.lines} lines)\n`;
      report += `- Components: ${item.components.join(', ')}\n\n`;
    });
  }
  
  // State Management Patterns
  report += '## 3. STATE MANAGEMENT PATTERNS\n\n';
  if (result.duplicates.stateManagement.length === 0) {
    report += '✅ No state management patterns found.\n\n';
  } else {
    const patternCounts: Record<string, number> = {};
    result.duplicates.stateManagement.forEach(item => {
      item.patterns.forEach(pattern => {
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      });
    });
    report += 'Pattern distribution:\n';
    Object.entries(patternCounts).forEach(([pattern, count]) => {
      report += `- ${pattern}: ${count} files\n`;
    });
    report += '\n';
  }
  
  // Large Files
  report += '## 4. LARGE FILES (>1000 lines)\n\n';
  if (result.largeFiles.length === 0) {
    report += '✅ No large files found.\n\n';
  } else {
    result.largeFiles.sort((a, b) => b.lines - a.lines);
    result.largeFiles.forEach(item => {
      report += `### ${item.file}\n`;
      report += `- Lines: ${item.lines}\n`;
      report += `- Complexity: ${item.complexity}\n\n`;
    });
  }
  
  // Tight Coupling
  report += '## 5. TIGHT COUPLING (Window Access)\n\n';
  if (result.tightCoupling.length === 0) {
    report += '✅ No tight coupling detected.\n\n';
  } else {
    result.tightCoupling.sort((a, b) => b.windowAccesses - a.windowAccesses);
    result.tightCoupling.slice(0, 20).forEach(item => {
      report += `### ${item.file}\n`;
      report += `- Window Accesses: ${item.windowAccesses}\n`;
      report += `- Patterns: ${item.patterns.join(', ')}\n\n`;
    });
  }
  
  // Inconsistent Patterns
  report += '## 6. INCONSISTENT PATTERNS\n\n';
  report += `### Class-Based Files: ${result.inconsistentPatterns.classBased.length}\n`;
  report += `### Function-Based Files: ${result.inconsistentPatterns.functionBased.length}\n`;
  report += `### Mixed Files: ${result.inconsistentPatterns.mixed.length}\n\n`;
  
  if (result.inconsistentPatterns.mixed.length > 0) {
    report += '**Mixed Pattern Files (should be refactored):**\n';
    result.inconsistentPatterns.mixed.forEach(file => {
      report += `- ${file}\n`;
    });
    report += '\n';
  }
  
  // Recommendations
  report += '## RECOMMENDATIONS\n\n';
  report += '1. **Extract Shared Utilities**: Create common message loading service, shared UI components library, reusable state management patterns\n';
  report += '2. **Break Down Large Files**: Split ProfileManager.ts and MessagesModule.ts into smaller, focused modules\n';
  report += '3. **Establish Architectural Patterns**: Document preferred patterns (classes vs functions), create module template\n';
  report += '4. **Improve Dependency Injection**: Replace window property access with proper dependency injection\n\n';
  
  return report;
}

async function main(): Promise<void> {
  console.log('🔍 Starting Slice 7 Diagnostic: Code Duplication & Architecture...\n');
  
  const result: DiagnosticResult = {
    duplicates: {
      messageLoading: [],
      uiComponents: [],
      stateManagement: []
    },
    largeFiles: [],
    tightCoupling: [],
    inconsistentPatterns: {
      classBased: [],
      functionBased: [],
      mixed: []
    },
    summary: {
      totalDuplicates: 0,
      totalLargeFiles: 0,
      totalTightCoupling: 0,
      totalInconsistent: 0
    }
  };
  
  // Scan src directory
  console.log('📂 Scanning src directory...');
  scanDirectory(srcDir, result);
  
  // Calculate summary
  result.summary.totalDuplicates = result.duplicates.messageLoading.length;
  result.summary.totalLargeFiles = result.largeFiles.length;
  result.summary.totalTightCoupling = result.tightCoupling.length;
  result.summary.totalInconsistent = result.inconsistentPatterns.mixed.length;
  
  // Generate report
  const report = generateReport(result);
  
  // Output report
  console.log(report);
  
  // Save to file
  const reportPath = path.join(__dirname, 'slice7-diagnostic-report.txt');
  fs.writeFileSync(reportPath, report);
  console.log(`\n✅ Diagnostic report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  const hasIssues = result.summary.totalDuplicates > 0 || 
                    result.summary.totalLargeFiles > 0 || 
                    result.summary.totalTightCoupling > 0 ||
                    result.summary.totalInconsistent > 0;
  
  process.exit(hasIssues ? 1 : 0);
}

main().catch(console.error);


