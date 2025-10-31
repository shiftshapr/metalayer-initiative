const { PrismaClient } = require('./generated/prisma');

async function fixDatabaseConstraints() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 FIXING DATABASE CONSTRAINTS...');
    console.log('==================================');
    
    // Step 1: Check current state
    console.log('🔍 Checking current database state...');
    
    const totalUsers = await prisma.appUser.count();
    const totalPresence = await prisma.user_presence.count();
    const totalReactions = await prisma.reactions.count();
    
    console.log(`📊 Current counts:`);
    console.log(`   AppUser: ${totalUsers}`);
    console.log(`   user_presence: ${totalPresence}`);
    console.log(`   reactions: ${totalReactions}`);
    console.log('');
    
    // Step 2: Find problematic records
    console.log('🔍 Finding problematic records...');
    
    // Check for users with empty handles
    const usersWithEmptyHandles = await prisma.appUser.findMany({
      where: {
        handle: ''
      }
    });
    
    console.log(`Found ${usersWithEmptyHandles.length} users with empty handles`);
    
    // Check for duplicate handles
    const handleCounts = await prisma.appUser.groupBy({
      by: ['handle'],
      _count: {
        handle: true
      },
      having: {
        handle: {
          _count: {
            gt: 1
          }
        }
      }
    });
    
    console.log(`Found ${handleCounts.length} duplicate handles`);
    
    // Check for orphaned presence records
    const orphanedPresence = await prisma.user_presence.findMany({
      where: {
        AppUser: null
      }
    });
    
    console.log(`Found ${orphanedPresence.length} orphaned presence records`);
    
    // Step 3: Clean up problematic records
    console.log('');
    console.log('🧹 CLEANING UP PROBLEMATIC RECORDS...');
    
    // Delete orphaned presence records first
    if (orphanedPresence.length > 0) {
      console.log(`Deleting ${orphanedPresence.length} orphaned presence records...`);
      await prisma.user_presence.deleteMany({
        where: {
          AppUser: null
        }
      });
      console.log('✅ Orphaned presence records deleted');
    }
    
    // Delete users with empty handles
    if (usersWithEmptyHandles.length > 0) {
      console.log(`Deleting ${usersWithEmptyHandles.length} users with empty handles...`);
      for (const user of usersWithEmptyHandles) {
        await prisma.appUser.delete({
          where: { id: user.id }
        });
        console.log(`   ✅ Deleted user: ${user.email || user.id}`);
      }
    }
    
    // Fix duplicate handles
    if (handleCounts.length > 0) {
      console.log(`Fixing ${handleCounts.length} duplicate handles...`);
      for (const duplicate of handleCounts) {
        const usersWithHandle = await prisma.appUser.findMany({
          where: { handle: duplicate.handle },
          orderBy: { createdAt: 'asc' }
        });
        
        // Keep the first user, delete the rest
        for (let i = 1; i < usersWithHandle.length; i++) {
          const userToDelete = usersWithHandle[i];
          console.log(`   ✅ Deleting duplicate user: ${userToDelete.email || userToDelete.id}`);
          await prisma.appUser.delete({
            where: { id: userToDelete.id }
          });
        }
      }
    }
    
    // Step 4: Test user creation
    console.log('');
    console.log('🧪 TESTING USER CREATION...');
    
    const testUsers = [
      {
        email: 'user1@example.com',
        name: 'User One',
        handle: 'user1'
      },
      {
        email: 'user2@example.com', 
        name: 'User Two',
        handle: 'user2'
      },
      {
        email: 'user3@example.com',
        name: 'User Three', 
        handle: 'user3'
      }
    ];
    
    let successCount = 0;
    
    for (const testUser of testUsers) {
      try {
        console.log(`Creating test user: ${testUser.email}...`);
        
        const user = await prisma.appUser.create({
          data: {
            id: require('crypto').randomUUID(),
            handle: testUser.handle,
            email: testUser.email,
            name: testUser.name,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(testUser.name)}&background=random&color=fff&size=96`,
            auraColor: '#ffffff',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`   ✅ Created: ${user.email} (${user.handle})`);
        successCount++;
        
        // Clean up test user
        await prisma.appUser.delete({
          where: { id: user.id }
        });
        console.log(`   ✅ Cleaned up: ${user.email}`);
        
      } catch (error) {
        console.log(`   ❌ Failed to create ${testUser.email}: ${error.message}`);
      }
    }
    
    console.log('');
    console.log(`📊 USER CREATION TEST RESULTS:`);
    console.log(`   ✅ Successful: ${successCount}/${testUsers.length}`);
    console.log(`   📈 Success Rate: ${Math.round((successCount / testUsers.length) * 100)}%`);
    
    // Step 5: Final state check
    console.log('');
    console.log('🔍 FINAL DATABASE STATE...');
    
    const finalUsers = await prisma.appUser.count();
    const finalPresence = await prisma.user_presence.count();
    const finalReactions = await prisma.reactions.count();
    
    console.log(`📊 Final counts:`);
    console.log(`   AppUser: ${finalUsers}`);
    console.log(`   user_presence: ${finalPresence}`);
    console.log(`   reactions: ${finalReactions}`);
    
    console.log('');
    console.log('✅ DATABASE CONSTRAINTS FIXED!');
    console.log('🎉 User creation should now work properly');
    
  } catch (error) {
    console.error('❌ Error fixing database constraints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the database fix
fixDatabaseConstraints();

