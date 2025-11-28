/**
 * Diagnostic Script: Slice 3 - Type Safety Violations
 * 
 * Comprehensive analysis of type safety issues:
 * - `any` type usage
 * - Type suppressions (@ts-ignore, @ts-expect-error, @ts-nocheck)
 * - Unsafe type assertions (as any)
 * - Missing window property type definitions
 * 
 * Usage:
 *   cd /home/ubuntu/metalayer-initiative
 *   npx tsx presence/src/scripts/diagnose-slice3-type-safety.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

interface TypeSafetyIssue {
  file: string;
  line: number;
  column: number;
  type: 'any' | 'suppression' | 'unsafe-assertion' | 'missing-window-type';
  severity: 'high' | 'medium' | 'low';
  context: string;
  recommendation?: string;
}

interface FileSummary {
  file: string;
  anyCount: number;
  suppressionCount: number;
  assertionCount: number;
  missingTypeCount: number;
  total: number;
  issues: TypeSafetyIssue[];
}

const currentDir = process.cwd();
const projectRoot = currentDir.endsWith('presence') 
  ? path.resolve(currentDir, '..')
  : path.resolve(currentDir, '.');

const srcDir = path.resolve(projectRoot, 'presence/src');
const globalTypesFile = path.resolve(projectRoot, 'presence/src/types/global.d.ts');

const priorityFiles = [
  'presence/src/features/ProfileManager.ts',
  'presence/src/features/MessagesModule.ts',
  'presence/src/utils/UserPreferencesManager.ts',
  'presence/src/features/RealtimeManager.ts'
];

const allIssues: TypeSafetyIssue[] = [];
const fileSummaries = new Map<string, FileSummary>();

let windowProperties: Set<string> = new Set();
if (fs.existsSync(globalTypesFile)) {
  const globalTypesContent = fs.readFileSync(globalTypesFile, 'utf-8');
  const windowInterfaceMatch = globalTypesContent.match(/interface\s+Window\s*\{([\s\S]*?)\n\s*\}/);
  if (windowInterfaceMatch) {
    const props = windowInterfaceMatch[1].match(/(\w+)\??\s*[:?]/g) || [];
    props.forEach(prop => {
      const name = prop.replace(/[?:].*$/, '').trim();
      if (name) windowProperties.add(name);
    });
  }
}

function analyzeFile(filePath: string, relativePath: string): void {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${relativePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    relativePath,
    content,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  );

  const fileIssues: TypeSafetyIssue[] = [];
  const lines = content.split(/\r?\n/);
  const windowPropertyAccesses = new Set<string>();

  function getLineContext(lineNum: number): string {
    const line = lines[lineNum - 1]?.trim() || '';
    return line.length > 100 ? line.substring(0, 100) + '...' : line;
  }

  function registerIssue(
    pos: number,
    type: TypeSafetyIssue['type'],
    severity: TypeSafetyIssue['severity'],
    recommendation?: string
  ): void {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
    const context = getLineContext(line + 1);
    
    fileIssues.push({
      file: relativePath,
      line: line + 1,
      column: character + 1,
      type,
      severity,
      context,
      recommendation
    });
  }

  function visitForAny(node: ts.Node): void {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const parent = node.parent;
      if (parent && (
        parent.kind === ts.SyntaxKind.TypeReference ||
        parent.kind === ts.SyntaxKind.TypeAnnotation ||
        parent.kind === ts.SyntaxKind.Parameter ||
        parent.kind === ts.SyntaxKind.PropertyDeclaration ||
        parent.kind === ts.SyntaxKind.VariableDeclaration
      )) {
        registerIssue(
          node.getStart(),
          'any',
          'high',
          'Replace with proper type. Use union types, generics, or create specific interfaces.'
        );
      }
    }
    ts.forEachChild(node, visitForAny);
  }

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (line.includes('@ts-ignore')) {
      const pos = content.indexOf(line, content.split(/\r?\n/).slice(0, index).join('\n').length);
      registerIssue(
        pos,
        'suppression',
        'high',
        'Fix underlying type issue instead of suppressing. Use proper types or create missing type definitions.'
      );
    }
    if (line.includes('@ts-expect-error')) {
      const pos = content.indexOf(line, content.split(/\r?\n/).slice(0, index).join('\n').length);
      registerIssue(
        pos,
        'suppression',
        'high',
        'Fix underlying type issue instead of suppressing. Use proper types or create missing type definitions.'
      );
    }
    if (line.includes('@ts-nocheck')) {
      const pos = content.indexOf(line, content.split(/\r?\n/).slice(0, index).join('\n').length);
      registerIssue(
        pos,
        'suppression',
        'high',
        'Remove @ts-nocheck and fix type issues. This disables all type checking for the file.'
      );
    }
  });

  const asAnyRegex = /as\s+any\b/g;
  let match;
  while ((match = asAnyRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split(/\r?\n/).length;
    const pos = match.index;
    registerIssue(
      pos,
      'unsafe-assertion',
      'high',
      'Replace with proper type assertion or fix the underlying type issue.'
    );
  }

  const windowPropRegex = /window\.(\w+)/g;
  while ((match = windowPropRegex.exec(content)) !== null) {
    const propName = match[1];
    if (!windowProperties.has(propName) && !propName.startsWith('__')) {
      windowPropertyAccesses.add(propName);
    }
  }

  windowPropertyAccesses.forEach(prop => {
    const firstMatch = content.indexOf(`window.${prop}`);
    if (firstMatch >= 0) {
      const lineNum = content.substring(0, firstMatch).split(/\r?\n/).length;
      registerIssue(
        firstMatch,
        'missing-window-type',
        'medium',
        `Add '${prop}?: <type>;' to Window interface in global.d.ts`
      );
    }
  });

  visitForAny(sourceFile);

  const anyCount = fileIssues.filter(i => i.type === 'any').length;
  const suppressionCount = fileIssues.filter(i => i.type === 'suppression').length;
  const assertionCount = fileIssues.filter(i => i.type === 'unsafe-assertion').length;
  const missingTypeCount = fileIssues.filter(i => i.type === 'missing-window-type').length;

  if (fileIssues.length > 0) {
    fileSummaries.set(relativePath, {
      file: relativePath,
      anyCount,
      suppressionCount,
      assertionCount,
      missingTypeCount,
      total: fileIssues.length,
      issues: fileIssues
    });
    allIssues.push(...fileIssues);
  }
}

console.log('🔍 Slice 3 Type Safety Diagnostic\n');
console.log('Analyzing priority files from audit report...\n');

priorityFiles.forEach(file => {
  const absolutePath = path.resolve(projectRoot, file);
  analyzeFile(absolutePath, file);
});

function findTypeScriptFiles(dir: string, baseDir: string = srcDir): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (entry.name === 'scripts' || entry.name === 'diagnostics' || entry.name === 'node_modules') {
        continue;
      }
      findTypeScriptFiles(fullPath, baseDir);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      const relPath = `presence/src/${relativePath}`;
      if (!priorityFiles.includes(relPath)) {
        analyzeFile(fullPath, relPath);
      }
    }
  }
}

console.log('Analyzing remaining TypeScript files...\n');
findTypeScriptFiles(srcDir);

console.log('='.repeat(80));
console.log('SLICE 3 TYPE SAFETY DIAGNOSTIC REPORT');
console.log('='.repeat(80));
console.log();

const totalFiles = fileSummaries.size;
const totalAny = allIssues.filter(i => i.type === 'any').length;
const totalSuppressions = allIssues.filter(i => i.type === 'suppression').length;
const totalAssertions = allIssues.filter(i => i.type === 'unsafe-assertion').length;
const totalMissingTypes = allIssues.filter(i => i.type === 'missing-window-type').length;

console.log('📊 SUMMARY');
console.log('─'.repeat(80));
console.log(`Total files analyzed: ${totalFiles}`);
console.log(`Total issues found: ${allIssues.length}`);
console.log(`  - \`any\` types: ${totalAny}`);
console.log(`  - Type suppressions: ${totalSuppressions}`);
console.log(`  - Unsafe assertions: ${totalAssertions}`);
console.log(`  - Missing window types: ${totalMissingTypes}`);
console.log();

console.log('🎯 PRIORITY FILES (from audit report)');
console.log('─'.repeat(80));
priorityFiles.forEach(file => {
  const summary = fileSummaries.get(file);
  if (summary) {
    console.log(`\n${file}:`);
    console.log(`  Total issues: ${summary.total}`);
    console.log(`    - any: ${summary.anyCount}`);
    console.log(`    - suppressions: ${summary.suppressionCount}`);
    console.log(`    - assertions: ${summary.assertionCount}`);
    console.log(`    - missing window types: ${summary.missingTypeCount}`);
  } else {
    console.log(`\n${file}: ✅ No issues found`);
  }
});
console.log();

if (allIssues.length > 0) {
  console.log('❌ Type safety issues found - review required');
  console.log('='.repeat(80));
  process.exit(1);
} else {
  console.log('✅ No type safety issues found');
  console.log('='.repeat(80));
  process.exit(0);
}

export { allIssues, fileSummaries, TypeSafetyIssue, FileSummary };
