/**
 * Diagnostic script for Slice 4 - detects function parameters typed as `any`.
 *
 * Usage:
 *   npx tsx presence/src/scripts/diagnose-function-param-any.ts
 *   # or pass custom file paths/globs:
 *   npx tsx presence/src/scripts/diagnose-function-param-any.ts "presence/src/features/**\/*.ts"
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as ts from 'typescript';

interface DiagnosticIssue {
  file: string;
  line: number;
  parameter: string;
  functionContext: string;
  snippet: string;
}

interface DiagnosticSummary {
  timestamp: string;
  filesScanned: number;
  issueCount: number;
  issues: DiagnosticIssue[];
}

const defaultTargets = [
  'presence/src/features/AgentModule.ts',
  'presence/src/features/CursorVisualSettingsManager.ts',
  'presence/src/features/DisplayNameManager.ts',
  'presence/src/features/SettingsHeadlineManager.ts',
  'presence/src/features/visibility/integration/buildGraphAdapter.ts',
  'presence/src/features/visibility/services/VisibilityStorage.ts',
  'presence/src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts'
];

const cliTargets = process.argv.slice(2);
const targets = cliTargets.length > 0 ? cliTargets : defaultTargets;
const projectRoot = process.cwd();

const summary: DiagnosticSummary = {
  timestamp: new Date().toISOString(),
  filesScanned: targets.length,
  issueCount: 0,
  issues: []
};

function typeIncludesAny(node?: ts.TypeNode): boolean {
  if (!node) {
    return false;
  }

  if (node.kind === ts.SyntaxKind.AnyKeyword) {
    return true;
  }

  let includesAny = false;
  node.forEachChild(child => {
    if (!includesAny && typeIncludesAny(child as ts.TypeNode)) {
      includesAny = true;
    }
  });
  return includesAny;
}

function getFunctionContext(parameter: ts.ParameterDeclaration): string {
  const parent = parameter.parent;

  if (ts.isFunctionDeclaration(parent) && parent.name) {
    return parent.name.text;
  }
  if (ts.isMethodDeclaration(parent) && parent.name) {
    return parent.name.getText();
  }
  if (ts.isArrowFunction(parent)) {
    return 'arrow-function';
  }
  if (ts.isConstructorDeclaration(parent)) {
    return 'constructor';
  }
  if (ts.isFunctionExpression(parent) && parent.name) {
    return parent.name.text;
  }

  return 'anonymous-function';
}

function analyzeFile(relativePath: string): void {
  if (!relativePath || typeof relativePath !== 'string') {
    console.warn('⚠️  Warning: Invalid file path provided to analyzeFile');
    return;
  }
  
  if (!projectRoot) {
    console.error('❌ Error: Project root not set');
    return;
  }
  
  const fullPath = resolve(projectRoot, relativePath);

  if (!existsSync(fullPath)) {
    console.warn(`⚠️  File not found: ${relativePath}`);
    return;
  }

  let fileContent: string;
  try {
    fileContent = readFileSync(fullPath, 'utf-8');
  } catch (readError) {
    console.error(`❌ Error reading file ${relativePath}:`, readError);
    return;
  }
  
  if (!fileContent) {
    console.warn(`⚠️  Warning: Empty file: ${relativePath}`);
    return;
  }
  
  let sourceFile: ts.SourceFile;
  try {
    sourceFile = ts.createSourceFile(relativePath, fileContent, ts.ScriptTarget.Latest, true);
  } catch (parseError) {
    console.error(`❌ Error parsing TypeScript file ${relativePath}:`, parseError);
    return;
  }

  const visit = (node: ts.Node): void => {
    if (ts.isParameter(node) && typeIncludesAny(node.type)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const parameterName = node.name.getText(sourceFile);
      const snippet = sourceFile
        .getText()
        .slice(node.getStart(), node.getEnd())
        .split(/\r?\n/)[0]
        .trim();

      summary.issues.push({
        file: relativePath,
        line: line + 1,
        parameter: parameterName,
        functionContext: getFunctionContext(node),
        snippet
      });
      summary.issueCount += 1;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

targets.forEach(analyzeFile);

console.log(JSON.stringify(summary, null, 2));

if (summary.issueCount > 0) {
  console.log(
    '\n⚠️  Function parameters typed as `any` were detected. Review the JSON output above for details.'
  );
} else {
  console.log('\n✅ No `any`-typed function parameters detected in the scanned files.');
}

