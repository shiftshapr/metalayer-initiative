const { PrismaClient } = require('../generated/prisma');
const UrlNormalizationService = require('../services/urlNormalizationService');

const prisma = new PrismaClient();
const urlNormalization = new UrlNormalizationService();

async function migrateWwwNormalization() {
  console.log('🔄 Starting www normalization migration...');
  
  try {
    // Get all pages that have www in their canonicalUrl
    const pagesWithWww = await prisma.page.findMany({
      where: {
        canonicalUrl: {
          contains: 'www.'
        }
      },
      include: {
        conversations: true,
        presenceEvents: true
      }
    });
    
    console.log(`Found ${pagesWithWww.length} pages with www that need migration`);
    
    for (const page of pagesWithWww) {
      console.log(`\n📄 Processing page: ${page.canonicalUrl}`);
      
      // Normalize the URL using the new system
      const normalized = await urlNormalization.normalizeUrl(page.canonicalUrl);
      const newPageId = normalized.pageId;
      const newCanonicalUrl = normalized.normalizedUrl;
      
      console.log(`   Old: ${page.id} -> ${page.canonicalUrl}`);
      console.log(`   New: ${newPageId} -> ${newCanonicalUrl}`);
      
      // Check if the new page already exists
      const existingNewPage = await prisma.page.findUnique({
        where: { id: newPageId }
      });
      
      if (existingNewPage) {
        console.log(`   ⚠️  New page ${newPageId} already exists, merging...`);
        
        // Move conversations to the new page
        if (page.conversations.length > 0) {
          await prisma.conversation.updateMany({
            where: { pageId: page.id },
            data: { pageId: newPageId }
          });
          console.log(`   ✅ Moved ${page.conversations.length} conversations`);
        }
        
        // Move presence events to the new page
        if (page.presenceEvents.length > 0) {
          await prisma.presenceEvent.updateMany({
            where: { pageId: page.id },
            data: { pageId: newPageId }
          });
          console.log(`   ✅ Moved ${page.presenceEvents.length} presence events`);
        }
        
        // Delete the old page
        await prisma.page.delete({
          where: { id: page.id }
        });
        console.log(`   🗑️  Deleted old page ${page.id}`);
        
      } else {
        console.log(`   🔄 Updating page ID and URL...`);
        
        // Update the page with new ID and canonicalUrl
        await prisma.page.update({
          where: { id: page.id },
          data: {
            id: newPageId,
            canonicalUrl: newCanonicalUrl
          }
        });
        
        // Update all conversations to reference the new page ID
        await prisma.conversation.updateMany({
          where: { pageId: page.id },
          data: { pageId: newPageId }
        });
        
        // Update all presence events to reference the new page ID
        await prisma.presenceEvent.updateMany({
          where: { pageId: page.id },
          data: { pageId: newPageId }
        });
        
        console.log(`   ✅ Updated page to ${newPageId}`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateWwwNormalization()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateWwwNormalization;
