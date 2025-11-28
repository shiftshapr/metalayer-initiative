#!/usr/bin/env node

/**
 * Icon Generation Script: Generate extension icons and favicons from Overmark logo
 * 
 * PURPOSE: Convert Overmark circular.png to required icon sizes and favicon formats
 * 
 * USAGE: Run from project root: node presence/src/scripts/generate-icons-from-overmark.js
 * 
 * OUTPUT: Generates icon16.png, icon48.png, icon128.png in presence/extension/images/
 *         Generates favicon.ico and favicon.svg in public/
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(function() {
  'use strict';
  
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  
  const projectRoot = path.resolve(__dirname, '../../../');
  const overmarkSource = path.join(projectRoot, 'presence/extension/overmark/Overmark circular.png');
  const extensionImagesDir = path.join(projectRoot, 'presence/extension/images');
  const publicDir = path.join(projectRoot, 'public');
  
  console.log('🎨 Icon Generation: Overmark Logo Conversion');
  console.log('=============================================');
  
  // Verify source file exists
  if (!fs.existsSync(overmarkSource)) {
    console.error(`❌ Error: Source logo not found at ${overmarkSource}`);
    process.exit(1);
  }
  
  console.log(`✓ Source logo found: ${overmarkSource}`);
  
  // Ensure directories exist
  if (!fs.existsSync(extensionImagesDir)) {
    fs.mkdirSync(extensionImagesDir, { recursive: true });
    console.log(`✓ Created directory: ${extensionImagesDir}`);
  }
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log(`✓ Created directory: ${publicDir}`);
  }
  
  // Generate extension icons
  console.log('\n📱 Generating Extension Icons...');
  const iconSizes = [16, 48, 128];
  
  for (const size of iconSizes) {
    const outputPath = path.join(extensionImagesDir, `icon${size}.png`);
    try {
      // Use ImageMagick to resize with high quality
      execSync(
        `convert "${overmarkSource}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${outputPath}"`,
        { stdio: 'pipe' }
      );
      console.log(`  ✓ Generated icon${size}.png (${size}x${size})`);
    } catch (error) {
      console.error(`  ✗ Failed to generate icon${size}.png: ${error.message}`);
      process.exit(1);
    }
  }
  
  // Generate favicon.ico (multi-size ICO file)
  console.log('\n🌐 Generating Favicon (ICO)...');
  const faviconIcoPath = path.join(publicDir, 'favicon.ico');
  try {
    // Create ICO with multiple sizes (16, 32, 48)
    execSync(
      `convert "${overmarkSource}" -define icon:auto-resize=16,32,48 "${faviconIcoPath}"`,
      { stdio: 'pipe' }
    );
    console.log(`  ✓ Generated favicon.ico`);
  } catch (error) {
    console.error(`  ✗ Failed to generate favicon.ico: ${error.message}`);
    process.exit(1);
  }
  
  // Generate favicon.svg
  console.log('\n🌐 Generating Favicon (SVG)...');
  const faviconSvgPath = path.join(publicDir, 'favicon.svg');
  try {
    // For SVG, we'll create a simple SVG that references the PNG or embed it
    // First, convert to a small PNG (32x32) and embed as data URI, or create a simple SVG wrapper
    // Actually, let's create a proper SVG by converting the PNG to base64 and embedding it
    const tempPng = path.join(publicDir, 'favicon-temp-32.png');
    execSync(
      `convert "${overmarkSource}" -resize 32x32 -background transparent -gravity center -extent 32x32 "${tempPng}"`,
      { stdio: 'pipe' }
    );
    
    // Convert PNG to base64
    const pngBuffer = fs.readFileSync(tempPng);
    const base64Png = pngBuffer.toString('base64');
    
    // Create SVG with embedded PNG
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${base64Png}" width="32" height="32"/>
</svg>`;
    
    fs.writeFileSync(faviconSvgPath, svgContent);
    fs.unlinkSync(tempPng); // Clean up temp file
    
    console.log(`  ✓ Generated favicon.svg`);
  } catch (error) {
    console.error(`  ✗ Failed to generate favicon.svg: ${error.message}`);
    process.exit(1);
  }
  
  // Verify all files were created
  console.log('\n✅ Verification...');
  const allFiles = [
    { path: path.join(extensionImagesDir, 'icon16.png'), name: 'icon16.png' },
    { path: path.join(extensionImagesDir, 'icon48.png'), name: 'icon48.png' },
    { path: path.join(extensionImagesDir, 'icon128.png'), name: 'icon128.png' },
    { path: faviconIcoPath, name: 'favicon.ico' },
    { path: faviconSvgPath, name: 'favicon.svg' }
  ];
  
  let allGood = true;
  for (const file of allFiles) {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      console.log(`  ✓ ${file.name} (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
      console.error(`  ✗ ${file.name} not found`);
      allGood = false;
    }
  }
  
  if (allGood) {
    console.log('\n🎉 Icon generation complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Verify icons in extension manifest.json');
    console.log('  2. Verify favicon references in client/public/index.html');
    console.log('  3. Test extension icons in browser');
    console.log('  4. Test favicons on canopi.live subdomains');
  } else {
    console.error('\n❌ Some files were not generated successfully');
    process.exit(1);
  }
})();





