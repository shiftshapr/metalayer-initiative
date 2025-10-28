#!/usr/bin/env node

/**
 * FIND DAVEROOM'S REAL AVATAR
 * 
 * This script will help us find where daveroom's real avatar is stored
 * and then we can update the AppUser table with the correct URL.
 */

const { PrismaClient } = require('./generated/prisma');

async function findDaveroomAvatar() {
  const prisma = new PrismaClient();
  
  console.log('🔍 SEARCHING FOR DAVEROOM\'S REAL AVATAR...\n');
  
  try {
    // 1. Check AppUser table
    console.log('📊 1. CHECKING APPUSER TABLE:');
    const appUser = await prisma.appUser.findUnique({
      where: { email: 'daveroom@gmail.com' }
    });
    
    if (appUser) {
      console.log('✅ Found in AppUser:');
      console.log(`   AvatarUrl: ${appUser.avatarUrl}`);
      console.log(`   AuraColor: ${appUser.auraColor}`);
    } else {
      console.log('❌ Not found in AppUser table');
    }
    
    // 2. Check all user_presence records for daveroom
    console.log('\n📊 2. CHECKING USER_PRESENCE TABLE:');
    const presenceRecords = await prisma.user_presence.findMany({
      where: { user_email: 'daveroom@gmail.com' },
      orderBy: { last_seen: 'desc' },
      take: 5
    });
    
    console.log(`Found ${presenceRecords.length} presence records:`);
    presenceRecords.forEach((record, i) => {
      console.log(`   Record ${i+1}:`);
      console.log(`     Page: ${record.page_id}`);
      console.log(`     Active: ${record.is_active}`);
      console.log(`     Last Seen: ${record.last_seen}`);
      console.log(`     User Name: ${record.user_name}`);
    });
    
    // 3. Check if there are any other tables that might have avatar data
    console.log('\n📊 3. CHECKING FOR OTHER AVATAR SOURCES:');
    
    // Check if there are any other user-related tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%user%'
      ORDER BY table_name;
    `;
    
    console.log('Available user-related tables:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // 4. Check if daveroom has any real avatar URLs in the system
    console.log('\n📊 4. SEARCHING FOR REAL AVATAR URLS:');
    
    // Look for any Google profile URLs that might be daveroom's
    const realAvatars = await prisma.$queryRaw`
      SELECT 
        'AppUser' as table_name,
        email,
        "avatarUrl" as avatar_url
      FROM "AppUser" 
      WHERE "avatarUrl" LIKE '%googleusercontent.com%'
      AND "avatarUrl" NOT LIKE '%default-user%'
      
      UNION ALL
      
      SELECT 
        'user_presence' as table_name,
        user_email as email,
        avatar_url
      FROM user_presence 
      WHERE avatar_url LIKE '%googleusercontent.com%'
      AND avatar_url NOT LIKE '%default-user%'
    `;
    
    console.log('Real Google avatars found:');
    realAvatars.forEach(avatar => {
      console.log(`   ${avatar.table_name}: ${avatar.email} -> ${avatar.avatar_url}`);
    });
    
    // 5. Check what the frontend might be seeing
    console.log('\n📊 5. FRONTEND AVATAR SOURCES:');
    console.log('The frontend gets avatars from these sources (in order):');
    console.log('   1. User object avatarUrl (from API responses)');
    console.log('   2. AppUser table via API call');
    console.log('   3. Current user metadata (window.currentUser)');
    console.log('   4. Visibility data (window.currentVisibilityDataUnfiltered)');
    console.log('   5. Window.currentUser (last resort)');
    
    console.log('\n🎯 CONCLUSION:');
    console.log('If daveroom is showing a real avatar in the UI, it\'s likely coming from:');
    console.log('   - Google OAuth response (window.currentUser.user_metadata.avatar_url)');
    console.log('   - Or a cached/previous API response');
    console.log('   - But NOT from the AppUser table (which has generic fallback)');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Check browser console for daveroom\'s real avatar URL');
    console.log('2. Update AppUser table with the correct avatarUrl');
    console.log('3. Test that the fix works');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findDaveroomAvatar();
