const { PrismaClient } = require('../generated/prisma');
const UrlNormalizationService = require('../services/urlNormalizationService');

const prisma = new PrismaClient();
const urlNormalization = new UrlNormalizationService();

async function migratePageUrls() {
  try {
    console.log('🔄 Starting page URL migration...');
    
    // Get all pages
    const pages = await prisma.page.findMany();
    console.log(`📊 Found ${pages.length} pages to migrate`);
    
    for (const page of pages) {
      try {
        console.log(`\n🔍 Processing page: ${page.canonicalUrl}`);
        
        // Normalize the URL using the new system
        const normalized = await urlNormalization.normalizeUrl(page.canonicalUrl);
        const newPageId = normalized.pageId;
        const newCanonicalUrl = normalized.normalizedUrl;
        
        console.log(`   Old ID: ${page.id}`);
        console.log(`   New ID: ${newPageId}`);
        console.log(`   Old URL: ${page.canonicalUrl}`);
        console.log(`   New URL: ${newCanonicalUrl}`);
        
        // Skip if already normalized
        if (page.id === newPageId && page.canonicalUrl === newCanonicalUrl) {
          console.log(`   ✅ Already normalized, skipping`);
          continue;
        }
        
        // Check if a page with the new ID already exists
        const existingPage = await prisma.page.findUnique({
          where: { id: newPageId }
        });
        
        if (existingPage && existingPage.id !== page.id) {
          console.log(`   ⚠️  Page with new ID already exists, merging...`);
          
          // Update all conversations to point to the existing page
          const conversationUpdate = await prisma.conversation.updateMany({
            where: { pageId: page.id },
            data: { pageId: existingPage.id }
          });
          console.log(`   📝 Updated ${conversationUpdate.count} conversations`);
          
          // Update all presence events to point to the existing page
          const presenceUpdate = await prisma.presenceEvent.updateMany({
            where: { pageId: page.id },
            data: { pageId: existingPage.id }
          });
          console.log(`   👥 Updated ${presenceUpdate.count} presence events`);
          
          // Delete the old page
          await prisma.page.delete({
            where: { id: page.id }
          });
          console.log(`   🗑️  Deleted old page`);
          
        } else {
          // Update the page in place
          console.log(`   🔄 Updating page in place...`);
          
          await prisma.page.update({
            where: { id: page.id },
            data: {
              id: newPageId,
              canonicalUrl: newCanonicalUrl
            }
          });
          console.log(`   ✅ Updated page`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing page ${page.id}:`, error.message);
      }
    }
    
    console.log('\n🎉 Page URL migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migratePageUrls();
