/**
 * Diagnostic Script: Slice 1 TypeScript Compilation Errors
 * 
 * This script checks for:
 * 1. Private property access violations (visibilitySettingsHandler)
 * 2. Function signature mismatches (updateProfileUI)
 * 
 * Run: node presence/src/scripts/diagnose-slice1-typescript-errors.js
 * Or: npx tsx presence/src/scripts/diagnose-slice1-typescript-errors.js
 */

const fs = require('fs');
const path = require('path');

const profileManagerPath = path.join(__dirname, '../features/ProfileManager.ts');
const fileContent = fs.readFileSync(profileManagerPath, 'utf-8');
const lines = fileContent.split('\n');

console.log('🔍 DIAGNOSTIC: Slice 1 TypeScript Compilation Errors\n');
console.log('='.repeat(60));

// Issue 1: Private property access violations
console.log('\n1. CHECKING: Private property access violations (visibilitySettingsHandler)');
console.log('-'.repeat(60));

const privatePropertyLine = 145;
const violationLines = [2969, 2970, 2974, 2976, 3052, 3053];
let violationsFound = 0;

// Check if property is declared as private
const privateDeclLine = lines[privatePropertyLine - 1];
if (privateDeclLine && privateDeclLine.includes('private visibilitySettingsHandler')) {
  console.log(`✅ Line ${privatePropertyLine}: Property declared as private`);
} else {
  console.log(`❌ Line ${privatePropertyLine}: Property declaration not found or not private`);
}

// Check violations
violationLines.forEach(lineNum => {
  const line = lines[lineNum - 1];
  if (line) {
    if (line.includes('visibilitySettingsHandler')) {
      violationsFound++;
      console.log(`❌ Line ${lineNum}: Accessing private property`);
      console.log(`   ${line.trim()}`);
    }
  }
});

console.log(`\n📊 Found ${violationsFound}/${violationLines.length} violation lines`);

// Issue 2: Function signature mismatches
console.log('\n2. CHECKING: Function signature mismatches (updateProfileUI)');
console.log('-'.repeat(60));

const signatureLine = 2088;
const callLines = [2816, 2826];
let mismatchesFound = 0;

// Check method signature
const signatureLineContent = lines[signatureLine - 1];
if (signatureLineContent && signatureLineContent.includes('updateProfileUI()')) {
  console.log(`✅ Line ${signatureLine}: Method defined with 0 parameters`);
} else {
  console.log(`❌ Line ${signatureLine}: Method signature not found`);
}

// Check calls with arguments
callLines.forEach(lineNum => {
  const line = lines[lineNum - 1];
  if (line) {
    if (line.includes('updateProfileUI(') && line.includes('window.currentUser')) {
      mismatchesFound++;
      console.log(`❌ Line ${lineNum}: Calling with 1 argument but method expects 0`);
      console.log(`   ${line.trim()}`);
    }
  }
});

console.log(`\n📊 Found ${mismatchesFound}/${callLines.length} mismatch lines`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 SUMMARY');
console.log('='.repeat(60));
console.log(`Private property violations: ${violationsFound}/${violationLines.length}`);
console.log(`Function signature mismatches: ${mismatchesFound}/${callLines.length}`);
console.log(`Total errors expected: ${violationsFound + mismatchesFound}`);

if (violationsFound === violationLines.length && mismatchesFound === callLines.length) {
  console.log('\n✅ All expected errors detected');
} else {
  console.log('\n⚠️  Some expected errors may not be detected');
}

// Check TypeScript compilation
console.log('\n3. CHECKING: TypeScript compilation');
console.log('-'.repeat(60));
console.log('Run: cd presence && npx tsc --noEmit');
console.log('Expected: 8 compilation errors');

