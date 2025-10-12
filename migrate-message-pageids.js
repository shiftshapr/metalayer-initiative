// Migration script to update conversations and pages with old pageId formats
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

(async () => {
  console.log('🔧 === MIGRATING MESSAGE PAGE IDs TO NORMALIZED FORMAT ===');
  console.log('');
  console.log('⚠️  This script will update conversations and pages to use the correct pageId format');
  console.log('⚠️  Old format: chrome___extensions__errors_dbdjamnflfecdnioehkdmlhnmajffijl (triple underscores)');
  console.log('⚠️  New format: chrome_extensions_errors_dbdjamnflfecdnioehkdmlhnmajffijl (single underscores)');
  console.log('');

  try {
    // Get all conversations with their pages
    const allConversations = await prisma.conversation.findMany({
      include: {
        page: {
          select: {
            id: true,
            url: true,
            canonicalUrl: true
          }
        },
        posts: {
          select: {
            id: true
          }
        }
      }
    });

    console.log(`📊 Total conversations: ${allConversations.length}`);
    console.log('');

    // Find conversations that need migration
    const conversationsToMigrate = allConversations.filter(conv => {
      return conv.pageId.includes('___') || conv.pageId.includes('__');
    });

    if (conversationsToMigrate.length === 0) {
      console.log('✅ No conversations need migration - all pageIds are correct!');
      await prisma.$disconnect();
      return;
    }

    console.log(`🔍 Found ${conversationsToMigrate.length} conversations to migrate:`);
    console.log('');

    const migratedConversations = [];
    const errors = [];

    for (const conv of conversationsToMigrate) {
      console.log(`📝 Migrating conversation: ${conv.id}`);
      console.log(`   Old pageId: ${conv.pageId}`);
      console.log(`   URL: ${conv.page?.url || 'N/A'}`);
      console.log(`   Messages: ${conv.posts.length}`);
      
      // Calculate correct pageId
      const rawUrl = conv.page?.url || conv.pageId;
      const correctPageId = rawUrl
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')  // Collapse multiple underscores to single
        .substring(0, 100);
      
      console.log(`   New pageId: ${correctPageId}`);
      
      try {
        // Step 1: Create or update the page with correct pageId
        await prisma.page.upsert({
          where: { id: correctPageId },
          update: {
            url: conv.page?.url || rawUrl,
            canonicalUrl: conv.page?.canonicalUrl || rawUrl
          },
          create: {
            id: correctPageId,
            url: conv.page?.url || rawUrl,
            canonicalUrl: conv.page?.canonicalUrl || rawUrl,
            spaceId: null
          }
        });
        console.log(`   ✅ Page updated/created with correct pageId: ${correctPageId}`);
        
        // Step 2: Update the conversation to use the correct pageId
        await prisma.conversation.update({
          where: { id: conv.id },
          data: {
            pageId: correctPageId
          }
        });
        console.log(`   ✅ Conversation updated to use correct pageId`);
        
        // Step 3: Try to delete the old page (if no other conversations reference it)
        try {
          const otherConversationsWithOldPageId = await prisma.conversation.findMany({
            where: {
              pageId: conv.pageId,
              id: { not: conv.id }
            }
          });
          
          if (otherConversationsWithOldPageId.length === 0 && conv.pageId !== correctPageId) {
            await prisma.page.delete({
              where: { id: conv.pageId }
            });
            console.log(`   🗑️  Deleted old page: ${conv.pageId}`);
          } else {
            console.log(`   ⚠️  Skipped deleting old page (other conversations still reference it or same as new pageId)`);
          }
        } catch (deleteError) {
          console.log(`   ⚠️  Could not delete old page: ${deleteError.message}`);
        }
        
        migratedConversations.push({
          conversationId: conv.id,
          oldPageId: conv.pageId,
          newPageId: correctPageId,
          messageCount: conv.posts.length
        });
        
        console.log(`   ✅ Migration complete for ${conv.id}`);
        console.log('');
      } catch (error) {
        console.error(`   ❌ Error migrating ${conv.id}:`, error.message);
        errors.push({
          conversationId: conv.id,
          error: error.message
        });
        console.log('');
      }
    }

    console.log('');
    console.log('📋 === MIGRATION SUMMARY ===');
    console.log(`   Total conversations to migrate: ${conversationsToMigrate.length}`);
    console.log(`   Successfully migrated: ${migratedConversations.length}`);
    console.log(`   Errors: ${errors.length}`);
    console.log('');
    
    if (migratedConversations.length > 0) {
      console.log('✅ SUCCESSFULLY MIGRATED:');
      migratedConversations.forEach((conv, index) => {
        console.log(`   ${index + 1}. ${conv.conversationId}`);
        console.log(`      Old: ${conv.oldPageId}`);
        console.log(`      New: ${conv.newPageId}`);
        console.log(`      Messages: ${conv.messageCount}`);
      });
      console.log('');
    }
    
    if (errors.length > 0) {
      console.log('❌ ERRORS:');
      errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.conversationId}: ${err.error}`);
      });
      console.log('');
    }
    
    console.log('✅ Migration complete!');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('   1. User should reload the Chrome extension');
    console.log('   2. Open sidepanel on chrome://extensions/ page');
    console.log('   3. Messages should now display in the Conversations tab');
    console.log('   4. Verify no console errors about missing conversations');
    
  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
})();

