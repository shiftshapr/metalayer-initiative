/**
 * Diagnostic Script: Icon and Favicon Setup Verification
 * 
 * PURPOSE: Verify current icon and favicon configuration, check file existence and sizes
 * 
 * USAGE: Run from command line: node presence/src/scripts/diagnose-icon-favicon-setup.js
 * 
 * OUTPUT: Console logs with diagnostic results, file checks, and recommendations
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(function() {
  'use strict';
  
  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');
  
  console.log('🔍 DIAGNOSTIC: Icon and Favicon Setup Verification');
  console.log('==================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  const projectRoot = path.resolve(__dirname, '../../../');
  
  // Check 1: Extension icons
  console.log('\n📋 Check 1: Extension Icons');
  const extensionIconPaths = {
    icon16: path.join(projectRoot, 'presence/extension/images/icon16.png'),
    icon48: path.join(projectRoot, 'presence/extension/images/icon48.png'),
    icon128: path.join(projectRoot, 'presence/extension/images/icon128.png')
  };
  
  results.checks.extensionIcons = {};
  for (const [name, filePath] of Object.entries(extensionIconPaths)) {
    const exists = fs.existsSync(filePath);
    results.checks.extensionIcons[name] = { exists, path: filePath };
    
    if (exists) {
      try {
        const identifyOutput = execSync(`identify "${filePath}"`, { encoding: 'utf-8' });
        const match = identifyOutput.match(/(\d+) x (\d+)/);
        if (match) {
          const width = parseInt(match[1]);
          const height = parseInt(match[2]);
          results.checks.extensionIcons[name].size = `${width}x${height}`;
          results.checks.extensionIcons[name].width = width;
          results.checks.extensionIcons[name].height = height;
          
          const expectedSize = parseInt(name.replace('icon', ''));
          if (width !== expectedSize || height !== expectedSize) {
            results.issues.push(`${name} is ${width}x${height}, expected ${expectedSize}x${expectedSize}`);
          }
        }
        console.log(`  ✓ ${name}: ${results.checks.extensionIcons[name].size || 'exists'}`);
      } catch (e) {
        results.issues.push(`Failed to identify ${name}: ${e.message}`);
        console.log(`  ✗ ${name}: Error reading file`);
      }
    } else {
      results.issues.push(`${name} not found at ${filePath}`);
      console.log(`  ✗ ${name}: Not found`);
    }
  }
  
  // Check 2: Favicon files
  console.log('\n📋 Check 2: Favicon Files');
  const faviconPaths = {
    faviconIco: path.join(projectRoot, 'public/favicon.ico'),
    faviconSvg: path.join(projectRoot, 'public/favicon.svg')
  };
  
  results.checks.favicons = {};
  for (const [name, filePath] of Object.entries(faviconPaths)) {
    const exists = fs.existsSync(filePath);
    results.checks.favicons[name] = { exists, path: filePath };
    
    if (exists) {
      try {
        const identifyOutput = execSync(`identify "${filePath}" 2>&1`, { encoding: 'utf-8' });
        if (identifyOutput.includes('SVG')) {
          results.checks.favicons[name].type = 'SVG';
        } else {
          const match = identifyOutput.match(/(\d+) x (\d+)/);
          if (match) {
            results.checks.favicons[name].size = `${match[1]}x${match[2]}`;
          }
        }
        console.log(`  ✓ ${name}: ${results.checks.favicons[name].type || results.checks.favicons[name].size || 'exists'}`);
      } catch (e) {
        // SVG might not be readable by identify, that's okay
        if (name === 'faviconSvg') {
          results.checks.favicons[name].type = 'SVG (assumed)';
          console.log(`  ✓ ${name}: SVG`);
        } else {
          results.issues.push(`Failed to identify ${name}: ${e.message}`);
          console.log(`  ✗ ${name}: Error reading file`);
        }
      }
    } else {
      results.issues.push(`${name} not found at ${filePath}`);
      console.log(`  ✗ ${name}: Not found`);
    }
  }
  
  // Check 3: Overmark logo availability
  console.log('\n📋 Check 3: Overmark Logo Files');
  const overmarkDir = path.join(projectRoot, 'presence/extension/overmark');
  const overmarkFiles = [
    'Overmark circular.png',
    'Overmark black.png',
    'Overmark white-circular.png',
    'Overmark white X.png',
    'Overmark black X.png'
  ];
  
  results.checks.overmarkLogos = {};
  if (fs.existsSync(overmarkDir)) {
    for (const fileName of overmarkFiles) {
      const filePath = path.join(overmarkDir, fileName);
      const exists = fs.existsSync(filePath);
      results.checks.overmarkLogos[fileName] = { exists, path: filePath };
      
      if (exists) {
        try {
          const identifyOutput = execSync(`identify "${filePath}"`, { encoding: 'utf-8' });
          const match = identifyOutput.match(/(\d+) x (\d+)/);
          if (match) {
            results.checks.overmarkLogos[fileName].size = `${match[1]}x${match[2]}`;
          }
          console.log(`  ✓ ${fileName}: ${results.checks.overmarkLogos[fileName].size || 'exists'}`);
        } catch (e) {
          console.log(`  ? ${fileName}: Exists but cannot read size`);
        }
      } else {
        console.log(`  ✗ ${fileName}: Not found`);
      }
    }
  } else {
    results.issues.push(`Overmark directory not found at ${overmarkDir}`);
    console.log(`  ✗ Overmark directory: Not found`);
  }
  
  // Check 4: Manifest.json references
  console.log('\n📋 Check 4: Manifest.json Configuration');
  const manifestPath = path.join(projectRoot, 'presence/extension/manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      if (manifest.icons) {
        results.checks.manifestIcons = manifest.icons;
        console.log('  ✓ Manifest icons configured:');
        for (const [size, iconPath] of Object.entries(manifest.icons)) {
          const fullPath = path.join(path.dirname(manifestPath), iconPath);
          const exists = fs.existsSync(fullPath);
          console.log(`    ${size}: ${iconPath} ${exists ? '✓' : '✗'}`);
          if (!exists) {
            results.issues.push(`Manifest references missing icon: ${iconPath}`);
          }
        }
      } else {
        results.issues.push('Manifest.json has no icons configuration');
        console.log('  ✗ No icons in manifest.json');
      }
    } catch (e) {
      results.issues.push(`Failed to parse manifest.json: ${e.message}`);
      console.log(`  ✗ Error reading manifest.json: ${e.message}`);
    }
  } else {
    results.issues.push(`Manifest.json not found at ${manifestPath}`);
    console.log(`  ✗ Manifest.json: Not found`);
  }
  
  // Check 5: HTML favicon references
  console.log('\n📋 Check 5: HTML Favicon References');
  const htmlPath = path.join(projectRoot, 'client/public/index.html');
  if (fs.existsSync(htmlPath)) {
    try {
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      const faviconIcoMatch = htmlContent.match(/href=["']([^"']*favicon\.ico[^"']*)["']/i);
      const faviconSvgMatch = htmlContent.match(/href=["']([^"']*favicon\.svg[^"']*)["']/i);
      
      results.checks.htmlFavicons = {
        ico: faviconIcoMatch ? faviconIcoMatch[1] : null,
        svg: faviconSvgMatch ? faviconSvgMatch[1] : null
      };
      
      if (faviconIcoMatch) {
        console.log(`  ✓ favicon.ico referenced: ${faviconIcoMatch[1]}`);
      } else {
        results.issues.push('No favicon.ico reference in index.html');
        console.log('  ✗ favicon.ico: Not referenced');
      }
      
      if (faviconSvgMatch) {
        console.log(`  ✓ favicon.svg referenced: ${faviconSvgMatch[1]}`);
      } else {
        results.issues.push('No favicon.svg reference in index.html');
        console.log('  ✗ favicon.svg: Not referenced');
      }
    } catch (e) {
      results.issues.push(`Failed to read index.html: ${e.message}`);
      console.log(`  ✗ Error reading index.html: ${e.message}`);
    }
  } else {
    results.issues.push(`index.html not found at ${htmlPath}`);
    console.log(`  ✗ index.html: Not found`);
  }
  
  // Summary
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log(`Issues found: ${results.issues.length}`);
  console.log(`Recommendations: ${results.recommendations.length}`);
  
  if (results.issues.length > 0) {
    console.log('\n⚠️  ISSUES:');
    results.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }
  
  if (results.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }
  
  // Recommendations based on findings
  if (Object.keys(results.checks.overmarkLogos || {}).length > 0) {
    const circularLogo = results.checks.overmarkLogos['Overmark circular.png'];
    if (circularLogo && circularLogo.exists) {
      results.recommendations.push('Use "Overmark circular.png" as source for extension icons (16x16, 48x48, 128x128)');
      results.recommendations.push('Use "Overmark circular.png" as source for favicon conversion');
    }
  }
  
  console.log('\n✅ Diagnostic complete');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
})();





