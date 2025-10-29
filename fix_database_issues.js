const { PrismaClient } = require('./generated/prisma');

async function fixDatabaseIssues() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 FIXING DATABASE ISSUES...');
    
    // Step 1: Check for orphaned user_presence records
    console.log('🔍 Checking for orphaned user_presence records...');
    const orphanedPresence = await prisma.user_presence.findMany({
      where: {
        AppUser: null
      }
    });
    
    console.log(`Found ${orphanedPresence.length} orphaned user_presence records`);
    
    // Step 2: Create AppUser records for orphaned presence records
    for (const presence of orphanedPresence) {
      console.log(`Creating AppUser for ${presence.user_email}...`);
      
      try {
        await prisma.appUser.create({
          data: {
            id: require('crypto').randomUUID(),
            handle: presence.user_email.split('@')[0],
            email: presence.user_email,
            name: presence.user_name || presence.user_email.split('@')[0],
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(presence.user_name || presence.user_email.split('@')[0])}&background=random&color=fff&size=96`,
            auraColor: '#ffffff',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`✅ Created AppUser for ${presence.user_email}`);
      } catch (error) {
        console.log(`❌ Failed to create AppUser for ${presence.user_email}: ${error.message}`);
      }
    }
    
    // Step 3: Check for AppUser records with empty avatarUrl
    console.log('🔍 Checking for AppUser records with empty avatarUrl...');
    const usersWithoutAvatar = await prisma.appUser.findMany({
      where: {
        avatarUrl: ''
      }
    });
    
    console.log(`Found ${usersWithoutAvatar.length} users without avatarUrl`);
    
    // Step 4: Fix users without avatarUrl
    for (const user of usersWithoutAvatar) {
      console.log(`Fixing avatarUrl for ${user.email}...`);
      
      try {
        await prisma.appUser.update({
          where: { id: user.id },
          data: {
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email?.split('@')[0] || 'User')}&background=random&color=fff&size=96`,
            updatedAt: new Date()
          }
        });
        console.log(`✅ Fixed avatarUrl for ${user.email}`);
      } catch (error) {
        console.log(`❌ Failed to fix avatarUrl for ${user.email}: ${error.message}`);
      }
    }
    
    // Step 5: Test creating a new user
    console.log('🔍 Testing user creation...');
    try {
      const testUser = await prisma.appUser.create({
        data: {
          id: require('crypto').randomUUID(),
          handle: 'testuser1',
          email: 'testuser1@example.com',
          name: 'Test User 1',
          avatarUrl: 'https://ui-avatars.com/api/?name=Test+User+1&background=random&color=fff&size=96',
          auraColor: '#ffffff',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`✅ Test user created: ${testUser.email}`);
      
      // Clean up test user
      await prisma.appUser.delete({
        where: { id: testUser.id }
      });
      console.log(`✅ Test user cleaned up`);
      
    } catch (error) {
      console.log(`❌ Test user creation failed: ${error.message}`);
    }
    
    console.log('✅ DATABASE FIXES COMPLETED');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseIssues();

