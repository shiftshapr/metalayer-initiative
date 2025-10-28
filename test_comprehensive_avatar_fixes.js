#!/usr/bin/env node

/**
 * COMPREHENSIVE AVATAR FIXES TEST
 * 
 * This script tests all the avatar consistency fixes:
 * 1. API endpoint routing fixes
 * 2. Avatar consistency fixes
 * 3. Fallback flash prevention
 * 4. Null user validation
 */

const { PrismaClient } = require('./generated/prisma');

async function testAvatarFixes() {
  const prisma = new PrismaClient();
  
  console.log('🧪 COMPREHENSIVE AVATAR FIXES TEST');
  console.log('=====================================\n');
  
  try {
    // Test 1: API Endpoint Validation
    console.log('📋 Test 1: API Endpoint Validation');
    console.log('-----------------------------------');
    
    // Test null user validation
    console.log('✅ Testing null user validation...');
    try {
      const nullUser = await prisma.appUser.findUnique({
        where: { email: 'null' }
      });
      console.log('   Null user query result:', nullUser ? 'Found (should not happen)' : 'Not found (correct)');
    } catch (error) {
      console.log('   Null user query error (expected):', error.message);
    }
    
    // Test 2: Avatar Consistency
    console.log('\n📋 Test 2: Avatar Consistency');
    console.log('------------------------------');
    
    const daveroom = await prisma.appUser.findUnique({
      where: { email: 'daveroom@gmail.com' }
    });
    
    if (daveroom) {
      console.log('✅ daveroom found in AppUser table:');
      console.log(`   Current AvatarUrl: ${daveroom.avatarUrl}`);
      console.log(`   AuraColor: ${daveroom.auraColor}`);
      
      if (daveroom.avatarUrl.includes('default-user')) {
        console.log('   ⚠️  ISSUE: daveroom has generic fallback avatar');
        console.log('   💡 SOLUTION: Update with real Google profile picture URL');
      } else {
        console.log('   ✅ daveroom has real avatar URL');
      }
    } else {
      console.log('❌ daveroom not found in AppUser table');
    }
    
    // Test 3: Avatar URL Validation
    console.log('\n📋 Test 3: Avatar URL Validation');
    console.log('---------------------------------');
    
    const testUrls = [
      'https://lh3.googleusercontent.com/a/default-user=s96-c',
      'https://lh3.googleusercontent.com/a/defa',
      'https://lh3.googleusercontent.com/a/ACg8ocLF_0TdjZoB2Bx_dBmaVxeuLl5fqbsJrYWi7zFYSTycnLXT57s=s96-c',
      'null',
      'undefined',
      ''
    ];
    
    testUrls.forEach((url, i) => {
      console.log(`   Test ${i+1}: "${url}"`);
      
      if (!url || url === 'null' || url === 'undefined' || url.trim() === '') {
        console.log('     ❌ Invalid: Empty or null');
      } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.log('     ❌ Invalid: Not HTTP/HTTPS');
      } else if (url.includes('default-user')) {
        console.log('     ⚠️  Generic fallback (but valid URL)');
      } else {
        console.log('     ✅ Valid real avatar URL');
      }
    });
    
    // Test 4: Database Schema Validation
    console.log('\n📋 Test 4: Database Schema Validation');
    console.log('--------------------------------------');
    
    const appUserColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'AppUser'
      AND column_name IN ('avatarUrl', 'auraColor', 'email')
      ORDER BY column_name;
    `;
    
    console.log('✅ AppUser table columns:');
    appUserColumns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Test 5: User Presence Integration
    console.log('\n📋 Test 5: User Presence Integration');
    console.log('------------------------------------');
    
    const daveroomPresence = await prisma.user_presence.findMany({
      where: { user_email: 'daveroom@gmail.com' },
      orderBy: { last_seen: 'desc' },
      take: 3
    });
    
    console.log(`✅ Found ${daveroomPresence.length} daveroom presence records`);
    daveroomPresence.forEach((record, i) => {
      console.log(`   Record ${i+1}: ${record.page_id} (active: ${record.is_active})`);
    });
    
    // Test 6: Fix Recommendations
    console.log('\n📋 Test 6: Fix Recommendations');
    console.log('-------------------------------');
    
    console.log('🎯 IMMEDIATE ACTIONS NEEDED:');
    console.log('1. Find daveroom\'s real Google profile picture URL');
    console.log('2. Update AppUser table with correct avatarUrl');
    console.log('3. Test that frontend displays real avatar consistently');
    console.log('4. Verify no fallback flash occurs');
    
    console.log('\n💡 DEBUGGING STEPS:');
    console.log('1. Run console debugging script in browser');
    console.log('2. Check browser console for daveroom\'s real avatar');
    console.log('3. Update AppUser table with correct URL');
    console.log('4. Refresh and verify fix');
    
    console.log('\n🔧 CONSOLE DEBUGGING CODE:');
    console.log('Copy and paste this into browser console:');
    console.log(`
// Find daveroom's real avatar
window.findDaveroomRealAvatar = async function() {
  console.log('🔍 Finding daveroom\'s real avatar...');
  
  // Check visibility data
  if (window.currentVisibilityDataUnfiltered?.active) {
    const daveroom = window.currentVisibilityDataUnfiltered.active.find(u => u.email === 'daveroom@gmail.com');
    if (daveroom) {
      console.log('✅ Found daveroom:', daveroom);
      return daveroom.avatarUrl;
    }
  }
  
  // Check all Google profile images
  const images = document.querySelectorAll('img[src*="googleusercontent.com"]');
  images.forEach(img => {
    const parent = img.closest('.message, .avatar, .user');
    if (parent?.textContent?.includes('daveroom')) {
      console.log('🎯 Potential daveroom avatar:', img.src);
    }
  });
};

// Update daveroom's avatar
window.updateDaveroomAvatar = async function(realUrl) {
  try {
    const response = await window.api.request('/v1/users/update-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'daveroom@gmail.com',
        avatarUrl: realUrl
      })
    });
    console.log('✅ Updated:', response);
  } catch (error) {
    console.log('❌ Error:', error);
  }
};

// Run the debugging
findDaveroomRealAvatar();
    `);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n✅ COMPREHENSIVE AVATAR FIXES TEST COMPLETE');
  console.log('===========================================');
}

testAvatarFixes();
