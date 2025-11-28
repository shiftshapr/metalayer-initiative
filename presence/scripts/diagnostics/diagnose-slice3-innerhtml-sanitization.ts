/**
 * DIAGNOSTIC: Slice 3 innerHTML Sanitization Verification
 * 
 * Verifies that all innerHTML assignments in MessagesModule.ts are properly sanitized
 * to prevent XSS attacks.
 * 
 * Checks:
 * 1. HtmlSanitizer utility exists and is properly implemented
 * 2. All innerHTML usages in MessagesModule.ts use sanitized content
 * 3. UnifiedMessageRenderer uses sanitization
 * 4. convertUrlsToLinks uses sanitized version
 */

import * as fs from 'fs';
import * as path from 'path';

interface InnerHTMLUsage {
  file: string;
  line: number;
  code: string;
  context: string;
  isSanitized: boolean;
  sanitizationMethod?: string;
  risk: 'low' | 'medium' | 'high';
}

interface DiagnosticResult {
  totalInnerHTMLUsages: number;
  sanitized: number;
  unsanitized: number;
  usages: InnerHTMLUsage[];
  recommendations: string[];
}

function checkFunctionUsesSanitization(functionName: string, filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if function uses sanitization
  const functionRegex = new RegExp(`function\\s+${functionName}[^{]*\\{([^}]*)\\}`, 's');
  const match = content.match(functionRegex);
  
  if (match) {
    const functionBody = match[1];
    return /convertUrlsToLinksSafely|escapeHtml|sanitizeHtml|sanitizeUserContent|DOMPurify/.test(functionBody);
  }
  
  // Also check for arrow functions and const assignments
  const arrowRegex = new RegExp(`(const|let|var)\\s+${functionName}\\s*=\\s*[^{]*\\{([^}]*)\\}`, 's');
  const arrowMatch = content.match(arrowRegex);
  
  if (arrowMatch) {
    const functionBody = arrowMatch[2];
    return /convertUrlsToLinksSafely|escapeHtml|sanitizeHtml|sanitizeUserContent|DOMPurify/.test(functionBody);
  }
  
  return false;
}

function findInnerHTMLUsages(filePath: string): InnerHTMLUsage[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const usages: InnerHTMLUsage[] = [];
  
  // Patterns to look for
  const innerHTMLPattern = /\.innerHTML\s*=/;
  const sanitizationPatterns = [
    /convertUrlsToLinksSafely/,
    /escapeHtml/,
    /sanitizeHtml/,
    /sanitizeUserContent/,
    /DOMPurify/
  ];
  
  // Check if convertUrlsToLinks uses sanitization
  const convertUrlsToLinksSanitized = checkFunctionUsesSanitization('convertUrlsToLinks', filePath);
  
  // Check UnifiedMessageRenderer
  const rendererPath = path.join(path.dirname(filePath), '../utils/UnifiedMessageRenderer.ts');
  const rendererUsesSanitization = checkFunctionUsesSanitization('convertUrlsToLinks', rendererPath) ||
                                   /convertUrlsToLinksSafely/.test(fs.existsSync(rendererPath) ? fs.readFileSync(rendererPath, 'utf-8') : '');
  
  lines.forEach((line, index) => {
    if (innerHTMLPattern.test(line)) {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      // Get context (previous 5 lines and next 10 lines for template literals)
      const contextStart = Math.max(0, index - 5);
      const contextEnd = Math.min(lines.length, index + 10);
      const context = lines.slice(contextStart, contextEnd).join('\n');
      
      // Check if sanitization is used directly in the context
      let isSanitized = sanitizationPatterns.some(pattern => 
        pattern.test(context) || pattern.test(trimmedLine)
      );
      
      // Check if convertUrlsToLinks is used (which uses sanitization)
      if (!isSanitized && /convertUrlsToLinks\s*\(/.test(context) && convertUrlsToLinksSanitized) {
        isSanitized = true;
      }
      
      // Check if html comes from UnifiedMessageRenderer (which uses sanitization)
      // Look in wider context (up to 70 lines back) for generateMessageHTML call
      const widerContextStart = Math.max(0, index - 70);
      const widerContext = lines.slice(widerContextStart, index + 1).join('\n');
      if (!isSanitized && /UnifiedMessageRenderer\.generateMessageHTML/.test(widerContext) && rendererUsesSanitization) {
        isSanitized = true;
      }
      
      // Check if template literal uses convertUrlsToLinks
      if (!isSanitized && /convertUrlsToLinks\s*\(/.test(context) && convertUrlsToLinksSanitized) {
        isSanitized = true;
      }
      
      // Check if it's action menu HTML (low risk, no user content)
      if (!isSanitized && /actionMenuHTML|getMessageActionMenu/.test(context)) {
        isSanitized = true; // Action menu doesn't contain user content
      }
      
      // Determine risk level
      let risk: 'low' | 'medium' | 'high' = 'medium';
      if ((trimmedLine.includes('message.content') || 
          trimmedLine.includes('content') ||
          trimmedLine.includes('newContent') ||
          trimmedLine.includes('text')) && 
          !isSanitized) {
        risk = 'high';
      } else if (trimmedLine.includes('message.id') || 
                 trimmedLine.includes('data-') ||
                 trimmedLine.includes('actionMenu')) {
        risk = 'low';
      } else if (isSanitized) {
        risk = 'low'; // If sanitized, risk is low
      }
      
      // Find sanitization method if present
      let sanitizationMethod: string | undefined;
      if (trimmedLine.includes('convertUrlsToLinksSafely') || 
          (convertUrlsToLinksSanitized && /convertUrlsToLinks/.test(context))) {
        sanitizationMethod = 'convertUrlsToLinksSafely (via convertUrlsToLinks)';
      } else if (trimmedLine.includes('escapeHtml')) {
        sanitizationMethod = 'escapeHtml';
      } else if (trimmedLine.includes('sanitizeHtml')) {
        sanitizationMethod = 'sanitizeHtml';
      } else if (trimmedLine.includes('sanitizeUserContent')) {
        sanitizationMethod = 'sanitizeUserContent';
      } else if (rendererUsesSanitization && (/UnifiedMessageRenderer/.test(context) || /UnifiedMessageRenderer/.test(widerContext))) {
        sanitizationMethod = 'convertUrlsToLinksSafely (via UnifiedMessageRenderer)';
      } else if (/actionMenuHTML|getMessageActionMenu/.test(context)) {
        sanitizationMethod = 'No user content (action menu)';
      } else if (convertUrlsToLinksSanitized && /convertUrlsToLinks\s*\(/.test(context)) {
        sanitizationMethod = 'convertUrlsToLinksSafely (via convertUrlsToLinks)';
      }
      
      usages.push({
        file: path.basename(filePath),
        line: lineNum,
        code: trimmedLine,
        context,
        isSanitized,
        sanitizationMethod,
        risk
      });
    }
  });
  
  return usages;
}

function checkHtmlSanitizer(): { exists: boolean; hasFunctions: string[]; missingFunctions: string[] } {
  const sanitizerPath = path.join(__dirname, '../utils/HtmlSanitizer.ts');
  const exists = fs.existsSync(sanitizerPath);
  
  if (!exists) {
    return { exists: false, hasFunctions: [], missingFunctions: ['escapeHtml', 'convertUrlsToLinksSafely'] };
  }
  
  const content = fs.readFileSync(sanitizerPath, 'utf-8');
  const requiredFunctions = ['escapeHtml', 'convertUrlsToLinksSafely', 'sanitizeHtml', 'sanitizeUserContent'];
  const hasFunctions: string[] = [];
  const missingFunctions: string[] = [];
  
  requiredFunctions.forEach(func => {
    if (new RegExp(`(export\\s+)?function\\s+${func}|export\\s+const\\s+${func}`).test(content)) {
      hasFunctions.push(func);
    } else {
      missingFunctions.push(func);
    }
  });
  
  return { exists, hasFunctions, missingFunctions };
}

function checkUnifiedMessageRenderer(): { usesSanitization: boolean; method?: string } {
  const rendererPath = path.join(__dirname, '../utils/UnifiedMessageRenderer.ts');
  if (!fs.existsSync(rendererPath)) {
    return { usesSanitization: false };
  }
  
  const content = fs.readFileSync(rendererPath, 'utf-8');
  const usesSanitization = /convertUrlsToLinksSafely/.test(content);
  const method = usesSanitization ? 'convertUrlsToLinksSafely' : undefined;
  
  return { usesSanitization, method };
}

function checkConvertUrlsToLinks(): { usesSanitization: boolean; method?: string } {
  const messagesPath = path.join(__dirname, '../features/MessagesModule.ts');
  if (!fs.existsSync(messagesPath)) {
    return { usesSanitization: false };
  }
  
  const content = fs.readFileSync(messagesPath, 'utf-8');
  
  // Check if convertUrlsToLinks function uses sanitization
  const functionMatch = content.match(/function\s+convertUrlsToLinks[^{]*\{[^}]*\}/s);
  if (functionMatch) {
    const usesSanitization = /convertUrlsToLinksSafely/.test(functionMatch[0]);
    return { usesSanitization, method: usesSanitization ? 'convertUrlsToLinksSafely' : undefined };
  }
  
  return { usesSanitization: false };
}

function generateDiagnostic(): DiagnosticResult {
  const messagesPath = path.join(__dirname, '../features/MessagesModule.ts');
  const usages = findInnerHTMLUsages(messagesPath);
  
  const sanitized = usages.filter(u => u.isSanitized).length;
  const unsanitized = usages.filter(u => !u.isSanitized).length;
  
  const recommendations: string[] = [];
  
  // Check HtmlSanitizer
  const sanitizerCheck = checkHtmlSanitizer();
  if (!sanitizerCheck.exists) {
    recommendations.push('❌ HtmlSanitizer.ts does not exist - create it with escapeHtml and convertUrlsToLinksSafely functions');
  } else if (sanitizerCheck.missingFunctions.length > 0) {
    recommendations.push(`⚠️ HtmlSanitizer.ts missing functions: ${sanitizerCheck.missingFunctions.join(', ')}`);
  }
  
  // Check UnifiedMessageRenderer
  const rendererCheck = checkUnifiedMessageRenderer();
  if (!rendererCheck.usesSanitization) {
    recommendations.push('❌ UnifiedMessageRenderer does not use sanitization for message content');
  }
  
  // Check convertUrlsToLinks
  const convertCheck = checkConvertUrlsToLinks();
  if (!convertCheck.usesSanitization) {
    recommendations.push('❌ convertUrlsToLinks function does not use sanitization');
  }
  
  // Check unsanitized usages
  const highRiskUnsanitized = usages.filter(u => !u.isSanitized && u.risk === 'high');
  if (highRiskUnsanitized.length > 0) {
    recommendations.push(`❌ Found ${highRiskUnsanitized.length} high-risk unsanitized innerHTML usages`);
    highRiskUnsanitized.forEach(u => {
      recommendations.push(`   - Line ${u.line}: ${u.code.substring(0, 60)}...`);
    });
  }
  
  const mediumRiskUnsanitized = usages.filter(u => !u.isSanitized && u.risk === 'medium');
  if (mediumRiskUnsanitized.length > 0) {
    recommendations.push(`⚠️ Found ${mediumRiskUnsanitized.length} medium-risk unsanitized innerHTML usages`);
  }
  
  if (unsanitized === 0 && sanitized > 0) {
    recommendations.push('✅ All innerHTML usages appear to be sanitized');
  }
  
  return {
    totalInnerHTMLUsages: usages.length,
    sanitized,
    unsanitized,
    usages,
    recommendations
  };
}

// Main execution
console.log('🔍 Slice 3: innerHTML Sanitization Diagnostic\n');
console.log('=' .repeat(60));

const result = generateDiagnostic();

console.log(`\n📊 Summary:`);
console.log(`   Total innerHTML usages: ${result.totalInnerHTMLUsages}`);
console.log(`   ✅ Sanitized: ${result.sanitized}`);
console.log(`   ❌ Unsanitized: ${result.unsanitized}`);

if (result.usages.length > 0) {
  console.log(`\n📋 Detailed Usage Report:\n`);
  result.usages.forEach((usage, index) => {
    console.log(`${index + 1}. ${usage.file}:${usage.line}`);
    console.log(`   Code: ${usage.code}`);
    console.log(`   Risk: ${usage.risk.toUpperCase()}`);
    console.log(`   Sanitized: ${usage.isSanitized ? '✅' : '❌'}`);
    if (usage.sanitizationMethod) {
      console.log(`   Method: ${usage.sanitizationMethod}`);
    }
    console.log('');
  });
}

if (result.recommendations.length > 0) {
  console.log(`\n💡 Recommendations:\n`);
  result.recommendations.forEach(rec => console.log(`   ${rec}`));
}

console.log('\n' + '='.repeat(60));

// Exit with error code if unsanitized high-risk usages found
const highRiskUnsanitized = result.usages.filter(u => !u.isSanitized && u.risk === 'high');
if (highRiskUnsanitized.length > 0) {
  console.error('\n❌ CRITICAL: High-risk unsanitized innerHTML usages found!');
  process.exit(1);
} else if (result.unsanitized > 0) {
  console.warn('\n⚠️ WARNING: Some unsanitized innerHTML usages found');
  process.exit(0);
} else {
  console.log('\n✅ All innerHTML usages are properly sanitized');
  process.exit(0);
}

